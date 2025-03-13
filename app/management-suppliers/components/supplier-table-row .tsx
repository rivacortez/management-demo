'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { TableRow, TableCell } from '@/components/ui/table'
import { Supplier } from '../domain/interfaces/supplier'
import { Building2, User, Mail, Phone, MapPin, CreditCard, Eye, Pencil, Trash2 } from 'lucide-react'

interface SupplierTableRowProps {
  supplier: Supplier
  viewSupplierDetails: (id: string) => void
  openEditDialog: (supplier: Supplier) => void
  openDeleteDialog: (supplier: Supplier) => void
}

export function SupplierTableRow({
  supplier,
  viewSupplierDetails,
  openEditDialog,
  openDeleteDialog,
}: SupplierTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span>{supplier.supplier_name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{supplier.contact_name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[150px]">{supplier.contact_email}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{supplier.contact_phone}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[150px]">{supplier.address}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{supplier.payment_terms}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => viewSupplierDetails(supplier.id)} className="hover:bg-primary/10 hover:text-primary">
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button variant="outline" size="sm" onClick={() => openEditDialog(supplier)} className="hover:bg-blue-500/10 hover:text-blue-500">
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(supplier)} className="hover:bg-destructive/90">
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
