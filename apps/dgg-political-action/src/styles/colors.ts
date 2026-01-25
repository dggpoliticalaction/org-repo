// Brand colors - modify these to adjust colors across the entire site
export const colors = {
  brand: {
    blue: '#1e3a8a',   // Deep blue (approximating US flag blue)
    red: '#dc2626',    // Red (approximating US flag red)
    white: '#ffffff',  // White
  },
  // You can add more color variations here as needed
  accent: {
    lightBlue: '#3b82f6',
    darkRed: '#991b1b',
  }
} as const

// Export for use in Tailwind if needed
export const tailwindColors = {
  'brand-blue': colors.brand.blue,
  'brand-red': colors.brand.red,
  'brand-white': colors.brand.white,
}