'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'

// ─── Schema (values match the API enums directly) ──────────────────────────────

const addPetSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  description: z.string().min(10, 'Descrição obrigatória (mín. 10 caracteres)'),
  species: z.enum(
    [
      'DOG',
      'CAT',
      'RABBIT',
      'BIRD',
      'HORSE',
      'COW',
      'GOAT',
      'PIG',
      'TURTLE',
      'OTHER',
    ],
    { message: 'Selecione a espécie' },
  ),
  sex: z.enum(['MALE', 'FEMALE'], { message: 'Selecione o sexo' }),
  ageCategory: z.enum(['PUPPY', 'YOUNG', 'ADULT', 'SENIOR'], {
    message: 'Selecione a idade',
  }),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE'], { message: 'Selecione o porte' }),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  independenceLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  environment: z.enum(['HOUSE', 'APARTMENT', 'BOTH']).optional(),
  requisitos: z.array(
    z.object({ title: z.string().min(3, 'Mínimo 3 caracteres') }),
  ),
})

type AddPetFormValues = z.infer<typeof addPetSchema>

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AddPetFormProps {
  workspaceId: string
}

// ─── Shared input class ────────────────────────────────────────────────────────

const petInputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 text-[18px] font-semibold',
  'placeholder:text-[#8fa7b2] placeholder:font-normal placeholder:text-[14px]',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

const petSelectTriggerCls = cn(
  'font-nunito text-accent-navy h-[64px] w-full rounded-[10px] border-[#d3e2e5] bg-[#f5f8fa] px-4 text-[18px] font-semibold shadow-none',
  'focus:ring-accent-navy focus:ring-2 focus:outline-none',
  'data-[placeholder]:text-[#8fa7b2]',
)

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function PetFormField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {(label || hint) && (
        <div className="flex items-baseline gap-2">
          {label && (
            <span className="font-nunito text-accent-navy text-[16px] font-semibold">
              {label}
            </span>
          )}
          {hint && (
            <span className="font-nunito text-[12px] text-[#8fa7b2]">
              {hint}
            </span>
          )}
        </div>
      )}
      {children}
      {error && (
        <p className="font-nunito text-brand-primary text-[13px] font-semibold">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  size = 'lg',
}: {
  title: string
  size?: 'lg' | 'md'
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2
        className={cn(
          'font-nunito text-accent-navy leading-none font-extrabold',
          size === 'lg' ? 'text-[40px]' : 'text-[32px]',
        )}
      >
        {title}
      </h2>
      <hr className="border-[#d3e2e5]" />
    </div>
  )
}

// ─── Add item button ───────────────────────────────────────────────────────────

function AddItemButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex h-[64px] w-full items-center justify-center rounded-[10px] border border-dashed border-[#d3e2e5]',
        'hover:border-accent-navy hover:text-accent-navy text-[#8fa7b2] transition-colors',
        'focus-visible:ring-accent-navy focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      <Plus className="size-5" aria-hidden />
    </button>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AddPetForm({ workspaceId }: AddPetFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddPetFormValues>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      name: '',
      description: '',
      requisitos: [{ title: '' }],
    },
  })

  const {
    fields: reqFields,
    append: appendReq,
    remove: removeReq,
  } = useFieldArray({
    control,
    name: 'requisitos',
  })

  async function onSubmit(values: AddPetFormValues) {
    // ── Step 1: create pet ──
    const petRes = await fetch(`/api/workspaces/${workspaceId}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        description: values.description,
        species: values.species,
        sex: values.sex,
        ageCategory: values.ageCategory,
        size: values.size,
        energyLevel: values.energyLevel,
        independenceLevel: values.independenceLevel,
        environment: values.environment,
      }),
    })

    if (!petRes.ok) {
      const body = (await petRes.json().catch(() => null)) as {
        message?: string
      } | null
      setError('root', {
        message: body?.message ?? 'Erro ao criar pet. Tente novamente.',
      })
      return
    }

    const pet = (await petRes.json()) as { id: string }

    // ── Step 2: add non-empty requirements ──
    const requirements = values.requisitos.filter(
      (r) => r.title.trim().length >= 3,
    )
    await Promise.all(
      requirements.map((req, index) =>
        fetch(`/api/pets/${pet.id}/requirements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'OTHER',
            title: req.title.trim(),
            isMandatory: true,
            order: index + 1,
          }),
        }),
      ),
    )

    router.push(`/workspaces/${workspaceId}/pets/${pet.id}`)
    router.refresh()
  }

  return (
    <div className="rounded-[20px] border border-[#d3e2e5] bg-white p-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        {/* ── Dados do pet ─────────────────────────────────────────────── */}
        <SectionHeader title="Adicione um pet" />

        <PetFormField label="Nome" error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            placeholder="Ex: Rex"
            className={cn(
              petInputCls,
              'h-[64px]',
              errors.name && 'border-brand-primary',
            )}
          />
        </PetFormField>

        <PetFormField
          label="Sobre"
          hint="Mínimo 10 caracteres"
          error={errors.description?.message}
        >
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Conte um pouco sobre o pet…"
            className={cn(
              petInputCls,
              'resize-none py-4',
              errors.description && 'border-brand-primary',
            )}
          />
        </PetFormField>

        <div className="grid grid-cols-2 gap-4">
          <PetFormField label="Espécie" error={errors.species?.message}>
            <Controller
              control={control}
              name="species"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={petSelectTriggerCls}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOG">Cachorro</SelectItem>
                    <SelectItem value="CAT">Gato</SelectItem>
                    <SelectItem value="RABBIT">Coelho</SelectItem>
                    <SelectItem value="BIRD">Pássaro</SelectItem>
                    <SelectItem value="HORSE">Cavalo</SelectItem>
                    <SelectItem value="COW">Vaca</SelectItem>
                    <SelectItem value="GOAT">Cabra</SelectItem>
                    <SelectItem value="PIG">Porco</SelectItem>
                    <SelectItem value="TURTLE">Tartaruga</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </PetFormField>

          <PetFormField label="Sexo" error={errors.sex?.message}>
            <Controller
              control={control}
              name="sex"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={petSelectTriggerCls}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Macho</SelectItem>
                    <SelectItem value="FEMALE">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </PetFormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PetFormField label="Idade" error={errors.ageCategory?.message}>
            <Controller
              control={control}
              name="ageCategory"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={petSelectTriggerCls}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUPPY">Filhote</SelectItem>
                    <SelectItem value="YOUNG">Jovem</SelectItem>
                    <SelectItem value="ADULT">Adulto</SelectItem>
                    <SelectItem value="SENIOR">Idoso</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </PetFormField>

          <PetFormField label="Porte" error={errors.size?.message}>
            <Controller
              control={control}
              name="size"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={petSelectTriggerCls}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL">Pequeno</SelectItem>
                    <SelectItem value="MEDIUM">Médio</SelectItem>
                    <SelectItem value="LARGE">Grande</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </PetFormField>
        </div>

        <PetFormField
          label="Nível de energia"
          error={errors.energyLevel?.message}
        >
          <Controller
            control={control}
            name="energyLevel"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField
          label="Nível de independência"
          error={errors.independenceLevel?.message}
        >
          <Controller
            control={control}
            name="independenceLevel"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    Baixo (precisa de companhia sempre)
                  </SelectItem>
                  <SelectItem value="MEDIUM">Médio</SelectItem>
                  <SelectItem value="HIGH">Alto (independente)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField label="Ambiente" error={errors.environment?.message}>
          <Controller
            control={control}
            name="environment"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSE">Ambiente amplo</SelectItem>
                  <SelectItem value="APARTMENT">Apartamento</SelectItem>
                  <SelectItem value="BOTH">Qualquer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        {/* ── Requisitos para adoção ────────────────────────────────────── */}
        <div className="mt-4">
          <SectionHeader title="Requisitos para adoção" size="md" />
        </div>

        <div className="flex flex-col gap-3">
          {reqFields.map((field, index) => (
            <PetFormField
              key={field.id}
              label={index === 0 ? 'Requisito' : ''}
              error={errors.requisitos?.[index]?.title?.message}
            >
              <div className="flex items-center gap-2">
                <input
                  {...register(`requisitos.${index}.title`)}
                  type="text"
                  placeholder="Ex: Ter espaço para o pet correr"
                  className={cn(
                    petInputCls,
                    'h-[64px] flex-1',
                    errors.requisitos?.[index]?.title && 'border-brand-primary',
                  )}
                />
                {reqFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReq(index)}
                    aria-label="Remover requisito"
                    className="text-brand-primary focus-visible:ring-brand-primary shrink-0 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                )}
              </div>
            </PetFormField>
          ))}
          <AddItemButton
            onClick={() => appendReq({ title: '' })}
            label="Adicionar requisito"
          />
        </div>

        {errors.root && (
          <p className="font-nunito text-brand-primary text-center text-[14px] font-semibold">
            {errors.root.message}
          </p>
        )}

        {/* ── Confirmar ─────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-nunito bg-accent-yellow text-accent-navy mt-6 flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[20px] text-[18px] font-extrabold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando…' : 'Confirmar'}
        </button>
      </form>
    </div>
  )
}
