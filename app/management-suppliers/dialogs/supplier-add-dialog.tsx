'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SupplierForm } from '../components/supplier-form '

interface SupplierAddDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    supplier_name: string
    contact_name: string
    contact_email: string
    contact_phone: string
    address: string
    payment_terms: string
    notes: string
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleAddSupplier: () => void
}

export function SupplierAddDialog({
  isOpen,
  onOpenChange,
  formData,
  handleInputChange,
  handleAddSupplier,
}: SupplierAddDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Proveedor</DialogTitle>
        </DialogHeader>
        <SupplierForm formData={formData} handleInputChange={handleInputChange} />
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddSupplier}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
