'use client'

import React from 'react'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Supplier } from '../domain/interfaces/supplier'
import { SupplierTableRow } from './supplier-table-row '
import { SupplierCardMobile } from './supplier-card-mobile'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Building2, User, Mail, Phone, MapPin, CreditCard, Settings } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SuppliersTableProps {
  suppliers: Supplier[]
  loading: boolean
  viewSupplierDetails: (id: string) => void
  openEditDialog: (supplier: Supplier) => void
  openDeleteDialog: (supplier: Supplier) => void
}

export function SuppliersTable({
  suppliers,
  loading,
  viewSupplierDetails,
  openEditDialog,
  openDeleteDialog,
}: SuppliersTableProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No se encontraron proveedores</p>
        </div>
      </div>
    )
  }

  if (!isDesktop) {
    return (
      <div className="space-y-4">
        {suppliers.map((supplier) => (
          <SupplierCardMobile
            key={supplier.id}
            supplier={supplier}
            viewSupplierDetails={viewSupplierDetails}
            openEditDialog={openEditDialog}
            openDeleteDialog={openDeleteDialog}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div className="overflow-x-auto rounded-md border shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Nombre</span>
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Contacto</span>
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email</span>
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>Teléfono</span>
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Ubicación</span>
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Condiciones de Pago</span>
              </div>
            </TableHead>
            <TableHead className="font-medium">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <span>Acciones</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <SupplierTableRow
              key={supplier.id}
              supplier={supplier}
              viewSupplierDetails={viewSupplierDetails}
              openEditDialog={openEditDialog}
              openDeleteDialog={openDeleteDialog}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
