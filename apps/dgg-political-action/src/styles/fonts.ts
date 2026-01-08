import localFont from 'next/font/local'

// You'll need to download and add these font files to /public/fonts/
export const departureMono = localFont({
  src: [
    {
      path: '../../public/fonts/DepartureMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-departure-mono',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export const appleNewYork = {
  variable: '--font-apple-ny',
  style: {
    fontFamily: 'Georgia, "New York", "Times New Roman", serif',
  },
}