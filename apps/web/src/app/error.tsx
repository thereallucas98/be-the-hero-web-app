'use client'

import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '~/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="text-feedback-danger h-12 w-12" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-gray-100 md:text-4xl">
              Ops! Algo deu errado
            </h1>
            <p className="text-lg text-gray-400 md:text-xl">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está
              trabalhando para resolver o problema.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-4 rounded-lg bg-white p-4 text-left">
                <p className="font-mono text-sm text-gray-100">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-gray-400">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="default"
              onClick={reset}
              className="gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Tentar novamente
            </Button>
            <a href="/">
              <Button size="lg" variant="outline" className="gap-2">
                <Home className="h-5 w-5" />
                Voltar para o início
              </Button>
            </a>
          </div>

          {/* Help Text */}
          <div className="mt-12 rounded-lg bg-white p-6 text-left">
            <p className="text-sm text-gray-400">
              <strong className="text-gray-100">O que fazer:</strong>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-400">
              <li>Tente recarregar a página</li>
              <li>Verifique sua conexão com a internet</li>
              <li>Se o problema persistir, entre em contato com o suporte</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
