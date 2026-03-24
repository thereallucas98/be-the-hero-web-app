'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Plus, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '~/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

// ─── Schema ────────────────────────────────────────────────────────────────────

const addPetSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  sobre: z.string().max(300, 'Máximo de 300 caracteres'),
  idade: z.enum(['filhote', 'jovem', 'adulto', 'idoso'], {
    message: 'Selecione a idade',
  }),
  porte: z.enum(['pequenino', 'medio', 'grande'], {
    message: 'Selecione o porte',
  }),
  nivelEnergia: z.enum(['baixa', 'media', 'alta', 'muito_alta'], {
    message: 'Selecione o nível de energia',
  }),
  nivelIndependencia: z.enum(['baixo', 'medio', 'alto'], {
    message: 'Selecione o nível de independência',
  }),
  ambiente: z.enum(['amplo', 'apartamento', 'qualquer'], {
    message: 'Selecione o ambiente',
  }),
  requisitos: z.array(
    z.object({ texto: z.string().min(1, 'Requisito não pode estar vazio') }),
  ),
})

type AddPetFormValues = z.infer<typeof addPetSchema>

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

// ─── Photo upload zone ─────────────────────────────────────────────────────────

function PhotoUploadZone({
  files,
  onFilesChange,
}: {
  files: File[]
  onFilesChange: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    )
    onFilesChange([...files, ...dropped])
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    onFilesChange([...files, ...Array.from(e.target.files)])
    e.target.value = ''
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Área para envio de fotos — clique ou arraste arquivos"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex h-[152px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] transition-colors',
          dragging && 'bg-accent-navy/5 border-accent-navy',
          'focus-visible:ring-accent-navy focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        <UploadCloud className="text-accent-navy size-6" aria-hidden />
        <p className="font-nunito text-accent-navy text-[18px] font-semibold">
          Arraste e solte o arquivo
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-hidden
        tabIndex={-1}
      />

      {/* File list */}
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex h-[50px] items-center gap-3 rounded-[10px] border border-[#d3e2e5] px-4"
        >
          <FileText className="text-accent-navy size-5 shrink-0" aria-hidden />
          <span className="font-nunito text-accent-navy flex-1 truncate text-[14px]">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => removeFile(index)}
            aria-label={`Remover ${file.name}`}
            className="text-brand-primary focus-visible:ring-brand-primary shrink-0 focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      ))}

      <AddItemButton
        onClick={() => inputRef.current?.click()}
        label="Adicionar foto"
      />
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AddPetForm() {
  const [photos, setPhotos] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddPetFormValues>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      nome: '',
      sobre: '',
      requisitos: [{ texto: '' }],
    },
  })

  const { fields: reqFields, append: appendReq } = useFieldArray({
    control,
    name: 'requisitos',
  })

  async function onSubmit(values: AddPetFormValues) {
    // TODO: wire to API — POST /api/workspaces/:id/pets
    console.log(values, photos)
  }

  return (
    <div className="rounded-[20px] border border-[#d3e2e5] bg-white p-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        {/* ── Dados do pet ───────────────────────────────────────────── */}
        <SectionHeader title="Adicione um pet" />

        <PetFormField label="Nome" error={errors.nome?.message}>
          <input
            {...register('nome')}
            type="text"
            className={cn(
              petInputCls,
              'h-[64px]',
              errors.nome && 'border-brand-primary',
            )}
          />
        </PetFormField>

        <PetFormField
          label="Sobre"
          hint="Máximo de 300 caracteres"
          error={errors.sobre?.message}
        >
          <textarea
            {...register('sobre')}
            rows={4}
            className={cn(
              petInputCls,
              'resize-none py-4',
              errors.sobre && 'border-brand-primary',
            )}
          />
        </PetFormField>

        <PetFormField label="Idade" error={errors.idade?.message}>
          <Controller
            control={control}
            name="idade"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filhote">Filhote</SelectItem>
                  <SelectItem value="jovem">Jovem</SelectItem>
                  <SelectItem value="adulto">Adulto</SelectItem>
                  <SelectItem value="idoso">Idoso</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField label="Porte" error={errors.porte?.message}>
          <Controller
            control={control}
            name="porte"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequenino">Pequenino</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField
          label="Nível de energia"
          error={errors.nivelEnergia?.message}
        >
          <Controller
            control={control}
            name="nivelEnergia"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="muito_alta">Muito alta</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField
          label="Nível de independência"
          error={errors.nivelIndependencia?.message}
        >
          <Controller
            control={control}
            name="nivelIndependencia"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">
                    Baixo (precisa de companhia sempre)
                  </SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto (independente)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField label="Ambiente" error={errors.ambiente?.message}>
          <Controller
            control={control}
            name="ambiente"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={petSelectTriggerCls}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amplo">Ambiente amplo</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="qualquer">Qualquer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </PetFormField>

        <PetFormField label="Fotos">
          <PhotoUploadZone files={photos} onFilesChange={setPhotos} />
        </PetFormField>

        {/* ── Requesitos para adoção ─────────────────────────────────── */}
        <div className="mt-4">
          <SectionHeader title="Requesitos para adoção" size="md" />
        </div>

        <div className="flex flex-col gap-3">
          {reqFields.map((field, index) => (
            <PetFormField
              key={field.id}
              label={index === 0 ? 'Requisito' : ''}
              error={errors.requisitos?.[index]?.texto?.message}
            >
              <input
                {...register(`requisitos.${index}.texto`)}
                type="text"
                placeholder="Defina um requisito"
                className={cn(
                  petInputCls,
                  'h-[64px]',
                  errors.requisitos?.[index]?.texto && 'border-brand-primary',
                )}
              />
            </PetFormField>
          ))}
          <AddItemButton
            onClick={() => appendReq({ texto: '' })}
            label="Adicionar requisito"
          />
        </div>

        {/* ── Confirmar ─────────────────────────────────────────────── */}
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
