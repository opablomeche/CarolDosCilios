import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Carol dos Cílios — Performance',
  description: 'Dashboard de performance Meta Ads — AK Media',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
