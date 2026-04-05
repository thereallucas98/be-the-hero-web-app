'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import type { WorkspaceInterestItem } from './workspace-interest-card'

interface ConvertInterestDialogProps {
  interest: WorkspaceInterestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (interestId: string, notes: string) => void
  isConverting: boolean
}

export function ConvertInterestDialog({
  interest,
  open,
  onOpenChange,
  onConfirm,
  isConverting,
}: ConvertInterestDialogProps) {
  const [notes, setNotes] = useState('')

  function handleConfirm() {
    if (!interest) return
    onConfirm(interest.id, notes)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar adoção</DialogTitle>
        </DialogHeader>

        {interest && (
          <p className="text-muted-foreground text-sm">
            Converter o interesse de{' '}
            <strong className="text-foreground">
              {interest.user.fullName}
            </strong>{' '}
            no pet{' '}
            <strong className="text-foreground">{interest.pet.name}</strong> em
            uma adoção?
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="convert-notes">Observações (opcional)</Label>
          <Textarea
            id="convert-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas sobre a adoção..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isConverting}>
            {isConverting ? 'Convertendo...' : 'Confirmar adoção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
