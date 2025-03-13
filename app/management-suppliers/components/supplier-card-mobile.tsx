'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Supplier } from '../domain/interfaces/supplier'
import { Building2, User, Mail, Phone, MapPin, CreditCard, Eye, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SupplierCardMobileProps {
  supplier: Supplier
  viewSupplierDetails: (id: string) => void
  openEditDialog: (supplier: Supplier) => void
  openDeleteDialog: (supplier: Supplier) => void
}

export function SupplierCardMobile({
  supplier,
  viewSupplierDetails,
  openEditDialog,
  openDeleteDialog,
}: SupplierCardMobileProps) {
  return (
    <Card className="mb-4 border-l-4 border-l-primary shadow-sm overflow-hidden">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{supplier.supplier_name}</h3>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Proveedor
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground font-medium">Contacto</p>
                <p>{supplier.contact_name}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground font-medium">Teléfono</p>
                <p>{supplier.contact_phone}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground font-medium">Email</p>
                <p className="truncate">{supplier.contact_email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground font-medium">Ubicación</p>
                <p className="truncate">{supplier.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground font-medium">Condiciones de Pago</p>
                <p>{supplier.payment_terms}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-3 border-t">
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
        </div>
      </CardContent>
    </Card>
  )
}