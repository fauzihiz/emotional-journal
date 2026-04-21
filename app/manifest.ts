import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Emotional Journal',
    short_name: 'EJ',
    description: 'Track and manage your daily emotions with ease',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFBF7',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
