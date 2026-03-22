import './globals.css'

import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Toaster } from 'sonner'

import { QueryProvider } from '~/providers/query-provider'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
        className={`${nunito.variable} bg-background text-foreground font-sans antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
