import { supabase } from '@/data/supabase/client';

const BUCKET = 'experience-images';

/**
 * Uploads local images directly to Supabase Storage.
 * Already-uploaded URLs (http/https) are passed through unchanged.
 * Returns an array of permanent public URLs.
 */
export async function uploadImages(uris: string[]): Promise<string[]> {
  const results: string[] = [];

  for (const uri of uris) {
    if (uri.startsWith('http')) {
      results.push(uri);
      continue;
    }

    const ext = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;

    // Read local file as a blob using RN's fetch
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for Supabase upload
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    results.push(publicUrlData.publicUrl);
  }

  return results;
}
