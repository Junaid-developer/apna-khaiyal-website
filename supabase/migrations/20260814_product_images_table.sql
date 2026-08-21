-- =========================================================================
-- MIGRATION: PRODUCT IMAGES TABLE WITH FOREIGN KEY & RLS PERMISSIONS
-- File: supabase/migrations/20260814_product_images_table.sql
-- =========================================================================

-- 1. Create the product_images table linked to public.products
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Establish Foreign Key constraint referencing public.products(id) with CASCADE delete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_product_images_product'
    ) THEN
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
            ALTER TABLE public.product_images 
            ADD CONSTRAINT fk_product_images_product 
            FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 3. Create performance and sorting indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON public.product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images(product_id, is_primary);

-- 4. Backfill existing product images for full backward compatibility
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        -- A. Backfill primary image if 'image' column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'image') THEN
            INSERT INTO public.product_images (product_id, image_url, display_order, is_primary, created_at, updated_at)
            SELECT 
                p.id, 
                p.image, 
                0, 
                true, 
                now(), 
                now()
            FROM public.products p
            WHERE p.image IS NOT NULL 
              AND trim(p.image) != ''
              AND NOT EXISTS (
                  SELECT 1 FROM public.product_images pi 
                  WHERE pi.product_id = p.id AND pi.image_url = p.image
              );
        END IF;

        -- B. Backfill primary image if 'image_url' column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'image_url') THEN
            INSERT INTO public.product_images (product_id, image_url, display_order, is_primary, created_at, updated_at)
            SELECT 
                p.id, 
                p.image_url, 
                0, 
                true, 
                now(), 
                now()
            FROM public.products p
            WHERE p.image_url IS NOT NULL 
              AND trim(p.image_url) != ''
              AND NOT EXISTS (
                  SELECT 1 FROM public.product_images pi 
                  WHERE pi.product_id = p.id AND pi.image_url = p.image_url
              );
        END IF;

        -- C. Backfill gallery array items
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'gallery') THEN
            BEGIN
                INSERT INTO public.product_images (product_id, image_url, display_order, is_primary, created_at, updated_at)
                SELECT 
                    p.id, 
                    g.img_url::text, 
                    (g.ordinality)::integer, 
                    false, 
                    now(), 
                    now()
                FROM public.products p,
                LATERAL jsonb_array_elements_text(
                    CASE 
                        WHEN jsonb_typeof(to_jsonb(p.gallery)) = 'array' THEN to_jsonb(p.gallery) 
                        ELSE '[]'::jsonb 
                    END
                ) WITH ORDINALITY AS g(img_url, ordinality)
                WHERE g.img_url IS NOT NULL 
                  AND trim(g.img_url) != ''
                  AND NOT EXISTS (
                      SELECT 1 FROM public.product_images pi 
                      WHERE pi.product_id = p.id AND pi.image_url = g.img_url
                  );
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END IF;
    END IF;
END $$;

-- 5. Grant table permissions
GRANT SELECT ON TABLE public.product_images TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_images TO authenticated, service_role;

-- 6. Configure safe RLS Policies for product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read product_images" ON public.product_images;
DROP POLICY IF EXISTS "Allow public select product_images" ON public.product_images;
CREATE POLICY "Allow public select product_images" ON public.product_images 
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert product_images" ON public.product_images;
CREATE POLICY "Allow authenticated insert product_images" ON public.product_images 
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update product_images" ON public.product_images;
CREATE POLICY "Allow authenticated update product_images" ON public.product_images 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete product_images" ON public.product_images;
CREATE POLICY "Allow authenticated delete product_images" ON public.product_images 
    FOR DELETE TO authenticated USING (true);

-- 7. Notify PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
