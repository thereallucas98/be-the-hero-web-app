'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reviewNote: string) => void
  isSubmitting: boolean
  title?: string
}

export function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  title = 'Rejeitar',
}: RejectDialogProps) {
  const [reviewNote, setReviewNote] = useState('')

  function handleConfirm() {
    if (!reviewNote.trim()) return
    onConfirm(reviewNote)
    setReviewNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reject-note">Motivo da rejeição</Label>
          <Textarea
            id="reject-note"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Descreva o motivo..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !reviewNote.trim()}
          >
            {isSubmitting ? 'Rejeitando...' : 'Rejeitar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
