import './styles/globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Food2Recipe Lite',
  description: 'Lite web demo: ingredients → healthy recipe',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
