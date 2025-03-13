'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SupplierFormProps {
  formData: {
    supplier_name: string
    contact_name: string
    contact_email: string
    contact_phone: string
    address: string
    payment_terms: string
    notes: string
  }
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export function SupplierForm({
  formData,
  handleInputChange,
}: SupplierFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier_name">Nombre del Proveedor</Label>
          <Input
            id="supplier_name"
            name="supplier_name"
            value={formData.supplier_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name">Nombre de Contacto</Label>
          <Input
            id="contact_name"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email de Contacto</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment_terms">Condiciones de Pago</Label>
        <Input
          id="payment_terms"
          name="payment_terms"
          value={formData.payment_terms}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
        />
      </div>
    </div>
  )
}
