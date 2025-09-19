/**
 * Converts a standard Vimeo URL to an embeddable URL for use in iframes.
 * @param url The original Vimeo URL (e.g., "https://vimeo.com/123456789").
 * @returns The embeddable Vimeo URL (e.g., "https://player.vimeo.com/video/123456789").
 */
export const getVimeoEmbedUrl = (url: string): string => {
  if (!url) return '';

  try {
    const videoUrl = new URL(url);
    const videoId = videoUrl.pathname.split('/').pop();

    if (videoId && /^\d+$/.test(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  } catch (error) {
    console.error('Invalid URL for Vimeo embed:', url, error);
  }
  
  // Return the original URL if parsing fails, though it might not work.
  return url;
};
