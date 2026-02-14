'use client'

import { Home, Search } from 'lucide-react'
import Link from 'next/link'

import { Button } from '~/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
          {/* Error Code */}
          <div className="mb-8">
            <h1 className="text-blue-base text-9xl font-bold md:text-[12rem]">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-4">
            <h2 className="text-3xl font-bold text-gray-100 md:text-4xl">
              Página não encontrada
            </h2>
            <p className="text-lg text-gray-400 md:text-xl">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/">
              <Button size="lg" variant="default" className="gap-2">
                <Home className="h-5 w-5" />
                Voltar para o início
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <Search className="h-5 w-5" />
              Voltar
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-12 rounded-lg bg-white p-6 text-left">
            <p className="text-sm text-gray-400">
              <strong className="text-gray-100">Dica:</strong> Verifique se o
              endereço está correto ou tente acessar a página inicial.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
