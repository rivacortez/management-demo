'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{message}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
