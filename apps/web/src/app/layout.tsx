import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

import { cn } from '~/lib/utils'
import { QueryProvider } from '~/providers/query-provider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BeTheHero',
  description: 'Plataforma de adoção responsável e apoio a causas animais',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(`${inter.variable} font-sans antialiased`, 'bg-white')}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
