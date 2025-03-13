'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, CreditCard, ClipboardList, Clock, DollarSign, ShoppingCart, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { SupabaseSupplierRepository } from '../../repositories/supabase-supplier-repository'
import { GetSuppliedProductsUseCase, GetSupplierByIdUseCase } from '../../use-cases/use-management-supplier'

import { Supplier } from '../../domain/interfaces/supplier'
import { ProductSupplier } from '../../domain/interfaces/product-supplier'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos la Promise usando React.use() para acceder a sus propiedades
  const { id } = use(params)
  const router = useRouter()

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [suppliedProducts, setSuppliedProducts] = useState<ProductSupplier[]>([])
  const [loading, setLoading] = useState(true)

  // Inicializar repositorio y casos de uso
  const supplierRepository = new SupabaseSupplierRepository()
  const getSupplierByIdUseCase = new GetSupplierByIdUseCase(supplierRepository)
  const getSuppliedProductsUseCase = new GetSuppliedProductsUseCase(supplierRepository)

  // Cargar datos al montar el componente
  useEffect(() => {
    if (id) {
      loadData(id)
    }
  }, [id])

  // Función que carga todo (proveedor y productos)
  const loadData = async (supplierId: string) => {
    try {
      setLoading(true)
      // 1. Cargar datos del proveedor
      const supplierData = await getSupplierByIdUseCase.execute(supplierId)
      setSupplier(supplierData)

      // 2. Cargar productos de ese proveedor
      const productsData = await getSuppliedProductsUseCase.execute(supplierId)
      setSuppliedProducts(productsData)
    } catch (error) {
      console.error('Error loading supplier details:', error)
      toast.error('Failed to load supplier details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">No se encontró el proveedor</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de regreso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{supplier.supplier_name}</h1>
          <p className="text-muted-foreground">Información detallada del proveedor</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>

        {/* Pestaña de Detalles */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Información del Proveedor
              </CardTitle>
              <CardDescription>
                Datos completos de contacto y condiciones comerciales
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre de la Empresa</p>
                    <p className="font-medium">{supplier.supplier_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Persona de Contacto</p>
                    <p className="font-medium">{supplier.contact_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                    <p className="font-medium">{supplier.contact_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{supplier.contact_phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="font-medium">{supplier.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Condiciones de Pago</p>
                    <p className="font-medium">{supplier.payment_terms}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                    <p className="font-medium">{supplier.notes || 'Sin notas adicionales'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
                    <p className="font-medium">{formatDate(supplier.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Productos */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Productos Suministrados
              </CardTitle>
              <CardDescription>
                Listado de productos que abastece este proveedor con costos y tiempos de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliedProducts.length === 0 ? (
                <div className="text-center py-6 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground font-medium">Este proveedor no tiene productos asociados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-medium">ID Producto</TableHead>
                        <TableHead className="font-medium">Costo de Adquisición</TableHead>
                        <TableHead className="font-medium">Tiempo de Entrega</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliedProducts.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell className="font-medium">{product.product_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <span>{formatCurrency(product.cost_price)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>{product.lead_time_days} días</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
