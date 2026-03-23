'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '~/lib/utils'

const PETS = [
  { name: 'Hamilton', image: '/images/pets/hamilton.png' },
  { name: 'Cleiton', image: '/images/pets/cleiton.png' },
  { name: 'Aldo', image: '/images/pets/aldo.png' },
]

interface PetCardProps {
  name: string
  image: string
  size?: 'sm' | 'lg'
}

function PetCard({ name, image, size = 'lg' }: PetCardProps) {
  const isLg = size === 'lg'
  return (
    <div
      data-slot="pet-card"
      className={cn(
        'shrink-0 overflow-hidden rounded-[28px] border border-[#f1f1f1] bg-white',
        isLg ? 'w-96' : 'w-64',
      )}
    >
      <div
        className={cn('relative border-4 border-white', isLg ? 'h-48' : 'h-32')}
      >
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <p
        className={cn(
          'text-accent-navy py-3 text-center font-bold',
          isLg ? 'text-2xl' : 'text-base',
        )}
      >
        {name}
      </p>
    </div>
  )
}

export function PetCarousel() {
  const [[current, direction], setCurrent] = useState([0, 0])

  function navigate(dir: 1 | -1) {
    setCurrent(([prev]) => [(prev + dir + PETS.length) % PETS.length, dir])
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  }

  return (
    <>
      {/* ── Desktop carousel (md+) ── */}
      <div className="hidden items-center gap-4 md:flex">
        <button
          type="button"
          aria-label="Animal anterior"
          onClick={() => navigate(-1)}
          className="flex size-18 shrink-0 items-center justify-center rounded-[15px] border border-white text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className="flex flex-col items-center gap-3">
          {/* Animated card */}
          <div className="relative w-96 overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ ease: 'easeInOut', duration: 0.35 }}
              >
                <PetCard {...PETS[current]} size="lg" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {PETS.map((pet, i) => (
              <button
                key={pet.name}
                type="button"
                aria-label={`Ver ${pet.name}`}
                onClick={() => setCurrent(([prev]) => [i, i > prev ? 1 : -1])}
                className={cn(
                  'h-1.5 rounded-full transition-all focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none',
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40',
                )}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Próximo animal"
          onClick={() => navigate(1)}
          className="text-brand-primary flex size-18 shrink-0 items-center justify-center rounded-[15px] bg-white transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* ── Mobile horizontal scroll (< md) ── */}
      <div className="overflow-x-auto pb-1 md:hidden">
        <div className="flex gap-3">
          {PETS.map((pet) => (
            <PetCard key={pet.name} {...pet} size="sm" />
          ))}
        </div>
      </div>
    </>
  )
}
