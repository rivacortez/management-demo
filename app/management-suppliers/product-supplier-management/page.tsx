'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Package, Truck, DollarSign, Clock, FileText, Trash2, Link2, Search, RefreshCw } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

// Interfaces
import { Product } from '../../management-products/domain/interfaces/product'
import { Supplier } from '../domain/interfaces/supplier'

// Extended interface to include special agreements
interface ExtendedProductSupplier extends ProductSupplier {
  special_agreement?: string
}

// Repository
import { SupabaseProductSupplierRepository } from '../repositories/supabase-product-supplier-repository'
import { SupabaseSupplierRepository } from '../repositories/supabase-supplier-repository'
import { SupabaseProductRepository } from '../repositories/supabase-product-repository'
import {formatPrice} from "@/lib/format-price";
import { ProductSupplier } from '../domain/interfaces/product-supplier'

const productSupplierRepository = new SupabaseProductSupplierRepository()
const supplierRepository = new SupabaseSupplierRepository()
const productRepository = new SupabaseProductRepository()

export default function ProductSupplierManagementPage() {
  // State definitions
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [productSuppliers, setProductSuppliers] = useState<ExtendedProductSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [costPrice, setCostPrice] = useState<number>(0)
  const [leadTimeDays, setLeadTimeDays] = useState<number>(0)
  const [specialAgreement, setSpecialAgreement] = useState<string>('')
  
  // Search/filter
  const [searchTerm, setSearchTerm] = useState<string>('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, suppliersData, productSuppliersData] = await Promise.all([
        productRepository.getProducts(),
        supplierRepository.getSuppliers(),
        productSupplierRepository.getProductSuppliers()
      ])
      
      setProducts(productsData)
      setSuppliers(suppliersData)
      setProductSuppliers(productSuppliersData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('No se pudieron cargar los datos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddProductSupplier = async () => {
    if (!selectedProduct || !selectedSupplier || costPrice <= 0 || leadTimeDays <= 0) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    const existingRelationship = productSuppliers.find(
      ps => ps.product_id === selectedProduct && ps.supplier_id === selectedSupplier
    )

    if (existingRelationship) {
      toast.error('Esta relación producto-proveedor ya existe')
      return
    }

    try {
      const newProductSupplier: ExtendedProductSupplier = {
        product_id: selectedProduct,
        supplier_id: selectedSupplier,
        cost_price: costPrice,
        lead_time_days: leadTimeDays,
        special_agreement: specialAgreement || undefined
      }

      await productSupplierRepository.createProductSupplier(newProductSupplier)
      setProductSuppliers([...productSuppliers, newProductSupplier])
      toast.success('Relación producto-proveedor agregada correctamente')

      resetForm()
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error al agregar producto-proveedor:', error)
      toast.error('No se pudo agregar la relación producto-proveedor')
    }
  }

  const handleDeleteRelationship = async (productId: string, supplierId: string) => {
    if (window.confirm("¿Está seguro de eliminar esta relación?")) {
      try {
        await productSupplierRepository.deleteProductSupplier(productId, supplierId)
        setProductSuppliers(productSuppliers.filter(
          item => !(item.product_id === productId && item.supplier_id === supplierId)
        ))
        toast.success('Relación producto-proveedor eliminada correctamente')
      } catch (error) {
        console.error('Error al eliminar la relación:', error)
        toast.error('No se pudo eliminar la relación producto-proveedor')
      }
    }
  }

  const resetForm = () => {
    setSelectedProduct('')
    setSelectedSupplier('')
    setCostPrice(0)
    setLeadTimeDays(0)
    setSpecialAgreement('')
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const filteredProductSuppliers = productSuppliers.filter(ps => {
    const productName = products.find(p => p.id === ps.product_id)?.name || ''
    const supplierName = suppliers.find(s => s.id === ps.supplier_id)?.supplier_name || ''
    const searchLower = searchTerm.toLowerCase()
    
    return productName.toLowerCase().includes(searchLower) || 
           supplierName.toLowerCase().includes(searchLower)
  })

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Producto desconocido'
  }

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.supplier_name || 'Proveedor desconocido'
  }

  const renderFormSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )

  const MobileRelationCard = ({ relation }: { relation: ExtendedProductSupplier }) => (
    <Card className="mb-3">
      <CardContent className="pt-4 pb-2">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold flex items-center">
                <Package className="w-4 h-4 mr-1 text-primary" />
                {getProductName(relation.product_id)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center mt-1">
                <Truck className="w-4 h-4 mr-1" />
                {getSupplierName(relation.supplier_id)}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleDeleteRelationship(relation.product_id, relation.supplier_id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Precio:
              </div>
              <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">

                {formatPrice(relation.cost_price)}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Tiempo de entrega:
              </div>
              <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                {relation.lead_time_days} días
              </Badge>
            </div>
          </div>
          
          {relation.special_agreement && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                Acuerdos Especiales:
              </div>
              <p className="text-sm mt-1">{relation.special_agreement}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const MobileAddForm = () => (
    <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 right-4 rounded-full shadow-lg z-10 h-14 w-14 p-0">
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90%] rounded-t-xl px-4 py-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center">
            <Link2 className="w-5 h-5 mr-2" />
            Añadir Relación
          </SheetTitle>
          <SheetDescription>
            Conecta productos con proveedores
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 overflow-y-auto pb-24">
          <div className="space-y-2">
            <Label htmlFor="product-mobile" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Producto
            </Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-mobile" className="flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Proveedor
            </Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice-mobile" className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Precio de Compra
            </Label>
            <Input
              id="costPrice-mobile"
              type="number"
              min="0"
              step="0.01"
              value={costPrice || ''}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              placeholder="Ingrese precio de compra"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTime-mobile" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Tiempo de Entrega (Días)
            </Label>
            <Input
              id="leadTime-mobile"
              type="number"
              min="1"
              value={leadTimeDays || ''}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              placeholder="Ingrese tiempo en días"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialAgreement-mobile" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Acuerdos Especiales
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                Opcional
              </Badge>
            </Label>
            <Input
              id="specialAgreement-mobile"
              type="text"
              value={specialAgreement}
              onChange={(e) => setSpecialAgreement(e.target.value)}
              placeholder="Ej: 5% de descuento en pedidos grandes"
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Limpiar
            </Button>
            <Button
              onClick={handleAddProductSupplier}
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Gestión de Relación Producto-Proveedor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las relaciones entre productos y sus proveedores
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Form for Desktop */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Link2 className="w-5 h-5 mr-2" />
              Añadir Relación Producto-Proveedor
            </CardTitle>
            <CardDescription>
              Conecta productos con proveedores y define sus términos comerciales
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              renderFormSkeletons()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product" className="flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Producto
                  </Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier" className="flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Proveedor
                  </Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Precio de Compra
                  </Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    placeholder="Ingrese precio de compra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadTime" className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Tiempo de Entrega (Días)
                  </Label>
                  <Input
                    id="leadTime"
                    type="number"
                    min="1"
                    value={leadTimeDays || ''}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    placeholder="Ingrese tiempo en días"
                  />
                </div>

                <div className="space-y-2 lg:col-span-4">
                  <Label htmlFor="specialAgreement" className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Acuerdos Especiales
                    <Badge variant="outline" className="ml-2 text-xs font-normal">
                      Opcional
                    </Badge>
                  </Label>
                  <Input
                    id="specialAgreement"
                    type="text"
                    value={specialAgreement}
                    onChange={(e) => setSpecialAgreement(e.target.value)}
                    placeholder="Ej: 5% de descuento en pedidos grandes"
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Limpiar
              </Button>
              <Button
                onClick={handleAddProductSupplier}
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Relación
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Search Bar - Always visible */}
      <div className="sticky top-0 z-10 bg-background py-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar producto o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Link2 className="w-5 h-5 mr-2" />
              Relaciones Producto-Proveedor
            </CardTitle>
            <CardDescription>
              Ver y gestionar conexiones existentes entre productos y proveedores
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        Producto
                      </div>
                    </TableHead>
                    <TableHead className="font-medium">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-1" />
                        Proveedor
                      </div>
                    </TableHead>
                    <TableHead className="font-medium">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Precio
                      </div>
                    </TableHead>
                    <TableHead className="font-medium">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Tiempo de Entrega
                      </div>
                    </TableHead>
                    <TableHead className="font-medium">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Acuerdos Especiales
                      </div>
                    </TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProductSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {searchTerm 
                          ? 'No se encontraron relaciones que coincidan con la búsqueda' 
                          : 'No hay relaciones producto-proveedor registradas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProductSuppliers.map((ps) => (
                      <TableRow key={`${ps.product_id}-${ps.supplier_id}`} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {getProductName(ps.product_id)}
                        </TableCell>
                        <TableCell>
                          {getSupplierName(ps.supplier_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">

                            {formatPrice(ps.cost_price)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            {ps.lead_time_days} días
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ps.special_agreement ? (
                            <span className="text-sm">{ps.special_agreement}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleDeleteRelationship(ps.product_id, ps.supplier_id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Eliminar esta relación</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        {loading ? (
          <div className="pt-8 pb-16 flex justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProductSuppliers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {searchTerm 
              ? 'No se encontraron relaciones que coincidan con la búsqueda' 
              : 'No hay relaciones producto-proveedor registradas'}
          </div>
        ) : (
          <div className="pb-24">
            {filteredProductSuppliers.map((ps) => (
              <MobileRelationCard key={`${ps.product_id}-${ps.supplier_id}`} relation={ps} />
            ))}
          </div>
        )}
      </div>

      <div className="md:hidden">
        <MobileAddForm />
      </div>

      {refreshing && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 bg-card p-4 rounded-lg shadow-lg border">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Cargando datos...</span>
          </div>
        </div>
      )}
    </div>
  )
}