import { supabase, isSupabaseConfigured } from './db';

/**
 * Uploads an image or file to Supabase Storage bucket or converts to base64 data URL.
 * Automatically handles public URL generation and bucket organization.
 */
export async function uploadImageToSupabase(
  file: File, 
  bucket: 'hero' | 'products' | 'gallery' | 'team' | 'services' | 'testimonials' | 'company' | 'documents' | 'reviews' | string = 'products',
  oldFileUrl?: string
): Promise<string> {
  // Attempt to clean up old file if specified
  if (oldFileUrl && isSupabaseConfigured && supabase) {
    try {
      await deleteImageFromSupabase(oldFileUrl, bucket);
    } catch (e) {
      console.warn('Old file cleanup note:', e);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload note, using inline fallback:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload error, falling back to data URL:', err);
    }
  }

  // Fallback to Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Deletes an old file from Supabase Storage by extracting its path from the public URL.
 */
export async function deleteImageFromSupabase(
  publicUrl: string, 
  bucket = 'products'
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !publicUrl) return false;

  try {
    const urlParts = publicUrl.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      return !error;
    }
  } catch (err) {
    console.warn('Error deleting file from Supabase storage:', err);
  }
  return false;
}

