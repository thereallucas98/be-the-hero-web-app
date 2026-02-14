import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">BeTheHero 🧡🐾</h1>
          <p className="text-muted-foreground text-lg">
            Plataforma de adoção responsável e apoio a causas animais.
            Conectando guardiões e projetos parceiros na Paraíba.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status do MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">
              <strong>Região piloto:</strong> Paraíba (João Pessoa, Campina
              Grande, Bayeux, Santa Rita)
            </p>
            <p className="text-muted-foreground text-sm">
              <strong>Personas:</strong> Guardiões (quem adota/ajuda) · Projetos
              parceiros (ONGs, clínicas) · Curadoria (admin)
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentação Next.js
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
