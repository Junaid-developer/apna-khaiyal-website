-- Migration: Add CEO WhatsApp Number column to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF EXISTS ceo_whatsapp_number TEXT DEFAULT '';

-- Update existing settings key with ceo_whatsapp_number if present in JSON value
UPDATE public.website_settings 
SET ceo_whatsapp_number = COALESCE(value->>'ceoWhatsAppNumber', ceo_whatsapp_number, '')
WHERE key = 'settings';
