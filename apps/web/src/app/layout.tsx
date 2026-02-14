import './globals.css'

import type { Metadata } from 'next'
import { Outfit, Roboto } from 'next/font/google'
import { Toaster } from 'sonner'

import { cn } from '~/lib/utils'
import { QueryProvider } from '~/providers/query-provider'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
})

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
        className={cn(
          `${outfit.variable} ${roboto.variable} font-sans antialiased`,
          'bg-background text-foreground',
        )}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
