'use client'

import React from 'react'
import { Supplier } from '../domain/interfaces/supplier'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'

interface SupplierDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentSupplier: Supplier | null
  handleDeleteSupplier: () => void
}

export function SupplierDeleteDialog({
  isOpen,
  onOpenChange,
  currentSupplier,
  handleDeleteSupplier,
}: SupplierDeleteDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Eliminar Proveedor"
      message={
        currentSupplier
          ? `¿Está seguro de que desea eliminar el proveedor "${currentSupplier.supplier_name}"? Esta acción no se puede deshacer.`
          : '¿Está seguro de que desea eliminar este proveedor? Esta acción no se puede deshacer.'
      }
      confirmText="Eliminar"
      onConfirm={handleDeleteSupplier}
    />
  )
}
