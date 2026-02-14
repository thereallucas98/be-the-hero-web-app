import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="font-display text-hero font-extrabold tracking-[-0.01em]">
            Be The Hero 🧡🐾
          </h1>
          <p className="text-body text-deep-navy">
            <span className="text-deep-navy">Plataforma de </span>
            <span className="text-responsible-green font-medium">
              adoção responsável
            </span>
            <span className="text-deep-navy"> e </span>
            <span className="text-hero-orange font-medium">
              apoio a causas animais
            </span>
            <span className="text-deep-navy">. Conectando </span>
            <span className="text-hero-orange font-medium">guardiões</span>
            <span className="text-deep-navy"> e </span>
            <span className="text-responsible-green font-medium">
              projetos parceiros
            </span>
            <span className="text-deep-navy"> na Paraíba.</span>
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
