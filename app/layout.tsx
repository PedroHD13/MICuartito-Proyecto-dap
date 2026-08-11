import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Micuartito - Login',
  description: 'Encuentra o publica cuartos en alquiler',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}