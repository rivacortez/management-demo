'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Package, Truck, DollarSign, Clock, FileText, Award, RefreshCw, ArrowUpDown } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

// Interfaces
import { Product } from '../../management-products/domain/interfaces/product'
import { Supplier } from '../domain/interfaces/supplier'
import { ProductSupplier } from '../domain/interfaces/product-supplier'

// Repository
import { SupabaseProductSupplierRepository } from '../repositories/supabase-product-supplier-repository'
import { SupabaseSupplierRepository } from '../repositories/supabase-supplier-repository'
import { SupabaseProductRepository } from '../repositories/supabase-product-repository'
import { formatPrice } from '@/lib/format-price'

// Extended interface to include supplier details and recommendation score
interface SupplierWithDetails extends ProductSupplier {
  supplier_name: string
  contact_name: string
  contact_phone: string
  special_agreement?: string
  recommendation_score: number
  is_recommended: boolean
}

const productSupplierRepository = new SupabaseProductSupplierRepository()
const supplierRepository = new SupabaseSupplierRepository()
const productRepository = new SupabaseProductRepository()

export default function SupplierInventoryComparisonPage() {
  // State definitions
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [, setProductSuppliers] = useState<ProductSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Selected product and suppliers offering it
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [suppliersForProduct, setSuppliersForProduct] = useState<SupplierWithDetails[]>([])
  const [recommendedSupplier, setRecommendedSupplier] = useState<SupplierWithDetails | null>(null)
  
  // Sorting
  const [sortField, setSortField] = useState<'cost_price' | 'lead_time_days' | 'recommendation_score'>('recommendation_score')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // UI state
  const [ ,setActiveTab] = useState<'all' | 'recommended'>('all')
  
  // Data loading function
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

  // Calculate recommendation score based on price and lead time
  const calculateRecommendationScore = (suppliers: SupplierWithDetails[]) => {
    if (!suppliers.length) return suppliers

    // Find min and max values for normalization
    const minPrice = Math.min(...suppliers.map(s => s.cost_price))
    const maxPrice = Math.max(...suppliers.map(s => s.cost_price))
    const minLeadTime = Math.min(...suppliers.map(s => s.lead_time_days))
    const maxLeadTime = Math.max(...suppliers.map(s => s.lead_time_days))
    
    const withScores = suppliers.map(supplier => {
      const priceScore = maxPrice === minPrice
        ? 1 
        : 1 - ((supplier.cost_price - minPrice) / (maxPrice - minPrice))
      
      const leadTimeScore = maxLeadTime === minLeadTime 
        ? 1 
        : 1 - ((supplier.lead_time_days - minLeadTime) / (maxLeadTime - minLeadTime))
      
      const score = (priceScore * 0.7) + (leadTimeScore * 0.3)
      
      return {
        ...supplier,
        recommendation_score: parseFloat((score * 100).toFixed(2))
      }
    })
    
    const sortedSuppliers = [...withScores].sort((a, b) => b.recommendation_score - a.recommendation_score)
    
    return sortedSuppliers.map((supplier, index) => ({
      ...supplier,
      is_recommended: index === 0
    }))
  }

  // Initial data load
  useEffect(() => {
    loadData()
  }, [])

  // Handle product selection
  const handleProductSelect = async (productId: string) => {
    setSelectedProduct(productId)
    setActiveTab('all')
    
    if (!productId) {
      setSuppliersForProduct([])
      setRecommendedSupplier(null)
      return
    }
    
    try {
      // Get all suppliers for this product
      const productSupplierData = await productSupplierRepository.getSuppliersByProductId(productId)
      
      if (productSupplierData.length === 0) {
        toast.info('No hay proveedores disponibles para este producto')
        setSuppliersForProduct([])
        setRecommendedSupplier(null)
        return
      }
      
      // Combine product-supplier data with supplier details
      const suppliersWithDetails: SupplierWithDetails[] = await Promise.all(
        productSupplierData.map(async (ps) => {
          const supplierData = suppliers.find(s => s.id === ps.supplier_id)
          return {
            ...ps,
            supplier_name: supplierData?.supplier_name || 'Desconocido',
            contact_name: supplierData?.contact_name || 'Desconocido',
            contact_phone: supplierData?.contact_phone || 'Desconocido',
            recommendation_score: 0,
            is_recommended: false
          }
        })
      )
      
      const suppliersWithScores = calculateRecommendationScore(suppliersWithDetails)
      
      const recommended = suppliersWithScores.find(s => s.is_recommended) || null
      setRecommendedSupplier(recommended)
      
      const sortedSuppliers = sortSuppliers(suppliersWithScores, sortField, sortDirection)
      setSuppliersForProduct(sortedSuppliers)
    } catch (error) {
      console.error('Error fetching suppliers for product:', error)
      toast.error('Error al obtener proveedores para este producto')
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
    if (selectedProduct) {
      handleProductSelect(selectedProduct)
    }
  }

  // Handle sorting
  const handleSort = (field: 'cost_price' | 'lead_time_days' | 'recommendation_score') => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to ascending unless it's recommendation score
      setSortField(field)
      setSortDirection(field === 'recommendation_score' ? 'desc' : 'asc')
    }
    
    // Re-sort the current data
    setSuppliersForProduct(sortSuppliers(suppliersForProduct, field, sortDirection === 'asc' ? 'desc' : 'asc'))
  }

  // Sort function
  const sortSuppliers = (suppliers: SupplierWithDetails[], field: 'cost_price' | 'lead_time_days' | 'recommendation_score', direction: 'asc' | 'desc') => {
    return [...suppliers].sort((a, b) => {
      const valueA = a[field]
      const valueB = b[field]
      
      if (direction === 'asc') {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })
  }

  // Handle tab change
  {/**
    const handleTabChange = (tab: 'all' | 'recommended') => {
        setActiveTab(tab)
    }
    */}

  // Get product name by ID
  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Producto desconocido'
  }

  // Get supplier recommendation label
  const getRecommendationLabel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bueno'
    if (score >= 40) return 'Regular'
    if (score >= 20) return 'Aceptable'
    return 'Básico'
  }

  // Get recommendation color
  const getRecommendationColor = (score: number) => {
    if (score >= 80) return 'indigo'
    if (score >= 60) return 'blue'
    if (score >= 40) return 'slate'
    if (score >= 20) return 'zinc'
    return 'gray'
  }

  // Rendering loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comparación Inteligente de Proveedores</h1>
          <p className="text-muted-foreground">
            Compare y encuentre el proveedor óptimo para cada producto en su inventario.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Seleccionar Producto
          </CardTitle>
          <CardDescription>
            Elija un producto para ver todos los proveedores disponibles y nuestra recomendación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedProduct} onValueChange={handleProductSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          {recommendedSupplier && (
            <Card className="shadow-sm  ">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Proveedor Recomendado para {getProductName(selectedProduct)}
                </CardTitle>
                <CardDescription className="">
                  Basado en la mejor combinación de precio, tiempo de entrega y condiciones especiales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=" rounded-lg p-4 shadow-sm border  ">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="font-bold text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary " />
                        {recommendedSupplier.supplier_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Contacto: {recommendedSupplier.contact_name} • {recommendedSupplier.contact_phone}
                      </div>
                      {recommendedSupplier.special_agreement && (
  <div className="text-sm border-l-2 border-amber-400 pl-3 italic">
    &quot;{recommendedSupplier.special_agreement}&quot;
  </div>
)}
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-4 justify-between">
                      <div className="text-center">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Precio</div>
                        <Badge
                          variant="outline"
                          className="text-lg  bg-emerald-100 text-emerald-700 "
                        >
                          {formatPrice(recommendedSupplier.cost_price)}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Entrega</div>
                        <Badge variant="outline" className="text-lg bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800">
                          {recommendedSupplier.lead_time_days} días
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full flex justify-between items-center">
                  <div className="text-sm ">
                    <span className="font-semibold">{getRecommendationLabel(recommendedSupplier.recommendation_score)}</span> - Puntuación: {recommendedSupplier.recommendation_score}/100
                  </div>
                  <Button 
                    size="sm" 
                   
                    className=""
                    onClick={() => setActiveTab('all')}
                  >
                    Ver todos los proveedores
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Proveedores para {getProductName(selectedProduct)}
              </CardTitle>
              <CardDescription>
                Comparación detallada de todos los proveedores disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                renderSkeletons()
              ) : suppliersForProduct.length > 0 ? (
                <div>
                  {/* Desktop view - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 -ml-3 font-semibold"
                              onClick={() => handleSort('cost_price')}
                            >
                              Precio
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 -ml-3 font-semibold"
                              onClick={() => handleSort('lead_time_days')}
                            >
                              Tiempo de Entrega
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 -ml-3 font-semibold"
                              onClick={() => handleSort('recommendation_score')}
                            >
                              Puntuación
                              <ArrowUpDown className="h-4 w-4 bg" />
                            </Button>
                          </TableHead>
                          <TableHead>Acuerdos Especiales</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliersForProduct.map((supplier) => (
                          <TableRow key={supplier.supplier_id} className={supplier.is_recommended ? ' ' : ''}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {supplier.is_recommended && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Award className="h-5 w-5 text-primary" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Proveedor Recomendado</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {supplier.supplier_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{supplier.contact_name}</div>
                              <div className="text-sm text-muted-foreground">{supplier.contact_phone}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-slate-200  ">

                                {formatPrice(recommendedSupplier.cost_price)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200  ">
                                {supplier.lead_time_days} días
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`
                                  ${getRecommendationColor(supplier.recommendation_score) === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'slate' ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'zinc' ? 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'gray' ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800' : ''}
                                `}>
                                  {supplier.recommendation_score}/100
                                </Badge>
                                <span className="text-xs">{getRecommendationLabel(supplier.recommendation_score)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {supplier.special_agreement || 'Ninguno'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Mobile view - Cards */}
                  <div className="md:hidden space-y-4">
                    {suppliersForProduct.map((supplier) => (
                      <Card key={supplier.supplier_id} className={supplier.is_recommended ? '' : ''}>
                        <CardContent className="pt-4 pb-2">
                          <div className="space-y-3">
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {supplier.is_recommended && (
                                  <Award className="h-4 w-4 " />
                                )}
                                <Truck className="w-4 h-4 text-primary" />
                                {supplier.supplier_name}
                                {supplier.is_recommended && (
                                  <Badge variant="outline" className="ml-auto text-xs     ">
                                    Recomendado
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {supplier.contact_name} • {supplier.contact_phone}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Precio:
                                </div>
                                <Badge variant="outline" className="mt-1 bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800">

                                  {formatPrice(recommendedSupplier.cost_price)}
                                </Badge>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Tiempo de entrega:
                                </div>
                                <Badge variant="outline" className="mt-1 bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800">
                                  {supplier.lead_time_days} días
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Award className="w-3 h-3 mr-1" />
                                Puntuación:
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`
                                  ${getRecommendationColor(supplier.recommendation_score) === 'indigo' ? 'bg-indigo-50  text-emerald-400 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'blue' ? 'bg-blue-50 text-emerald-400 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'slate' ? 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'zinc' ? 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800' : ''}
                                  ${getRecommendationColor(supplier.recommendation_score) === 'gray' ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800' : ''}
                                `}>
                                  {supplier.recommendation_score}/100
                                </Badge>
                                <span className="text-xs">{getRecommendationLabel(supplier.recommendation_score)}</span>
                              </div>
                            </div>
                            
                            {supplier.special_agreement && (
                              <div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Acuerdos Especiales:
                                </div>
                                <p className="text-sm mt-1">{supplier.special_agreement}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No hay proveedores disponibles para este producto.</p>
                  <p className="text-sm mt-2">Puede agregar relaciones producto-proveedor en la sección de Gestión de Producto-Proveedor.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedProduct && !loading && (
        <div className="text-center py-10 border rounded-lg bg-slate-50 dark:bg-slate-950">
          <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <p className="text-muted-foreground mt-4">Seleccione un producto para ver los proveedores disponibles</p>
          <p className="text-xs text-muted-foreground mt-2">El sistema analizará y recomendará el mejor proveedor para su producto</p>
        </div>
      )}
    </div>
  )
}