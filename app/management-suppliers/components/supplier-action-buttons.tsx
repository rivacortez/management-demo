'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Supplier } from '../domain/interfaces/supplier'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SupplierActionButtonsProps {
  supplier: Supplier
  openEditDialog: (supplier: Supplier) => void
  openDeleteDialog: (supplier: Supplier) => void
}

export function SupplierActionButtons({
  supplier,
  openEditDialog,
  openDeleteDialog,
}: SupplierActionButtonsProps) {
  const router = useRouter()
  
  const viewSupplierDetails = (supplierId: string) => {
    router.push(`/management-suppliers/${supplierId}`)
  }

  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => viewSupplierDetails(supplier.id)} 
        className="hover:bg-primary/10 hover:text-primary"
      >
        <Eye className="h-4 w-4 mr-1" />
        Ver
      </Button>
      <Button variant="outline" size="sm" onClick={() => openEditDialog(supplier)}>
        Editar
      </Button>
      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(supplier)}>
        Eliminar
      </Button>
    </div>
  )
}