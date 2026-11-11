const VIDEO_STORAGE_URL =
  'https://ccjanucsoycipueisyzd.supabase.co/storage/v1/object/public/videos';

export function getCaminoVideoUrl(level: number): string {
  const filename = `nivel-${String(level).padStart(2, '0')}.mp4`;
  return `${VIDEO_STORAGE_URL}/${filename}`;
}
