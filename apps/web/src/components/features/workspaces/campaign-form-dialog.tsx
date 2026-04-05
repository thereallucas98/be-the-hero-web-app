'use client'

import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { MoneyInput } from '~/components/ui/money-input'

const campaignFormSchema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  goalAmount: z.number().positive('Meta deve ser maior que zero'),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

export interface CampaignFormData {
  title: string
  description: string
  goalAmount: number
}

interface CampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CampaignFormData) => void
  isSubmitting: boolean
  defaultValues?: Partial<CampaignFormData>
  mode?: 'create' | 'edit'
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultValues,
  mode = 'create',
}: CampaignFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      goalAmount: defaultValues?.goalAmount ?? 0,
    },
  })

  function handleFormSubmit(values: CampaignFormValues) {
    onSubmit(values)
  }

  function handleOpenChange(value: boolean) {
    if (!value) reset()
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova campanha' : 'Editar campanha'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-title">Título</Label>
            <Input id="campaign-title" {...register('title')} />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-description">Descrição</Label>
            <Textarea
              id="campaign-description"
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-destructive text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="campaign-goal">Meta (R$)</Label>
            <Controller
              name="goalAmount"
              control={control}
              render={({ field }) => (
                <MoneyInput
                  id="campaign-goal"
                  loadedValue={field.value}
                  onChange={field.onChange}
                  onBlur={field.onChange}
                />
              )}
            />
            {errors.goalAmount && (
              <p className="text-destructive text-xs">
                {errors.goalAmount.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Salvando...'
                : mode === 'create'
                  ? 'Criar campanha'
                  : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
