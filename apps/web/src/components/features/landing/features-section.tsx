const FEATURES = [
  {
    emoji: '🐕',
    description:
      'O FindAFriend é um produto desenvolvido para você encontrar o animal de estimação ideal ao seu estilo de vida!',
  },
  {
    emoji: '🐈',
    description:
      'ONGs cadastram os bichinhos disponíveis para adoção informando características como: porte, nível de energia, nível de independência, sociabilidade e gênero.',
  },
  {
    emoji: '🦮',
    description:
      'Filtre os bichinhos de acordo com suas preferências e lifestyle. Depois é só entrar em contato com a ONG para agendar uma visita e conhecer pessoalmente seu match perfeito!',
  },
]

export function FeaturesSection() {
  return (
    <section
      data-slot="features-section"
      className="bg-white px-5 py-16 md:px-10 md:py-24 lg:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-section-title text-accent-navy mb-12">
          Um app não, uma caixinha de amigos...
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map(({ emoji, description }) => (
            <div
              key={emoji}
              data-slot="feature-card"
              className="rounded-card bg-brand-primary-pale/50 flex flex-col gap-4 p-6"
            >
              <span className="text-[30px] leading-none" aria-hidden="true">
                {emoji}
              </span>
              <p className="text-sm leading-relaxed font-normal text-black">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
