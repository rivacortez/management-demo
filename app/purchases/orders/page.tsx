'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Eye, Edit, XCircle, Trash2, Loader2, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PurchaseOrder } from '@/app/purchase-orders/domain/interfaces/purchase-orders'
import { SupabasePurchaseOrderRepository } from '@/app/purchase-orders/repositories/supabase-purchase-order-repository'
import { SupabaseSupplierRepository } from '@/app/management-suppliers/repositories/supabase-supplier-repository'
import {
  GetPurchaseOrdersUseCase,
  CancelPurchaseOrderUseCase,
  DeletePurchaseOrderUseCase
} from '@/app/purchase-orders/use-cases/use-purchase-orders'
import { GetSuppliersUseCase } from '@/app/management-suppliers/use-cases/use-management-supplier'
import { toast } from 'sonner'
import PurchaseOrderDialog from '@/app/purchase-orders/dialogs/orders-add-dialog'
import { formatPrice } from "@/lib/format-price";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Initialize repositories and use cases
const purchaseOrderRepository = new SupabasePurchaseOrderRepository()
const supplierRepository = new SupabaseSupplierRepository()
const getPurchaseOrdersUseCase = new GetPurchaseOrdersUseCase(purchaseOrderRepository)
const cancelPurchaseOrderUseCase = new CancelPurchaseOrderUseCase(purchaseOrderRepository)
const deletePurchaseOrderUseCase = new DeletePurchaseOrderUseCase(purchaseOrderRepository)
const getSuppliersUseCase = new GetSuppliersUseCase(supplierRepository)

// Helper functions for formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500', label: 'Pendiente' },
    approved: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500', label: 'Aprobada' },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500', label: 'Entregada' },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500', label: 'Cancelada' }
  }

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: status }

  return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export default function PurchaseOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<(PurchaseOrder & { supplier_name: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)

  // Check window size on mount and resize
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    // Initial check
    checkWindowSize()
    // Add event listener
    window.addEventListener('resize', checkWindowSize)
    // Cleanup
    return () => window.removeEventListener('resize', checkWindowSize)
  }, [])

  // Fetch purchase orders and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch purchase orders and suppliers in parallel
        const [ordersData, suppliersData] = await Promise.all([
          getPurchaseOrdersUseCase.execute(),
          getSuppliersUseCase.execute()
        ])

        // Create a map for faster supplier lookup
        const supplierMap = new Map()
        suppliersData.forEach(supplier => {
          supplierMap.set(supplier.id, supplier.supplier_name)
          supplierMap.set(Number(supplier.id), supplier.supplier_name)
        })

        // Map supplier names to purchase orders
        const ordersWithSupplierNames = ordersData.map(order => {
          const supplierName = supplierMap.get(order.supplierId) ||
              supplierMap.get(String(order.supplierId)) ||
              'Proveedor desconocido'

          return {
            ...order,
            supplier_name: supplierName
          }
        })

        setPurchaseOrders(ordersWithSupplierNames)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error al cargar los datos. Por favor, intente de nuevo.')
        toast.error("No se pudieron cargar las órdenes de compra.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch =
        order.id.toString().includes(searchTerm) ||
        order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Handle cancel order
  const handleCancelOrder = async (orderId: number) => {
    try {
      setCancellingOrderId(orderId)
      await cancelPurchaseOrderUseCase.execute(orderId)

      setPurchaseOrders(prevOrders =>
          prevOrders.map(order =>
              order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
      )

      toast.success(`La orden #${orderId} ha sido cancelada exitosamente.`)
    } catch (err) {
      console.error('Error cancelling order:', err)
      toast.error("No se pudo cancelar la orden. Por favor, intente de nuevo.")
    } finally {
      setCancellingOrderId(null)
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (orderId: number) => {
    setOrderToDelete(orderId)
    setShowDeleteDialog(true)
  }

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      setDeletingOrderId(orderToDelete)
      await deletePurchaseOrderUseCase.execute(orderToDelete)

      // Remove the order from state
      setPurchaseOrders(prevOrders =>
          prevOrders.filter(order => order.id !== orderToDelete)
      )

      toast.success(`La orden #${orderToDelete} ha sido eliminada exitosamente.`)
    } catch (err) {
      console.error('Error deleting order:', err)
      toast.error("No se pudo eliminar la orden. Por favor, intente de nuevo.")
    } finally {
      setDeletingOrderId(null)
      setShowDeleteDialog(false)
      setOrderToDelete(null)
    }
  }

  // Actions component for reuse
  const OrderActions = ({ order }: { order: PurchaseOrder & { supplier_name: string } }) => (
      <div className={`flex ${isMobileView ? "justify-start" : "justify-end"} gap-2`}>
        <Link href={`/purchases/orders/${order.id}`}>
          <Button variant="ghost" size="icon" title="Ver detalle" className="h-8 w-8">
            <Eye size={16} />
          </Button>
        </Link>

        {order.status === 'pending' && (
            <Link href={`/purchases/orders/${order.id}/edit`}>
              <Button variant="ghost" size="icon" title="Editar orden" className="h-8 w-8">
                <Edit size={16} />
              </Button>
            </Link>
        )}

        {(order.status === 'pending' || order.status === 'approved') && (
            <Button
                variant="ghost"
                size="icon"
                title="Cancelar orden"
                onClick={() => handleCancelOrder(order.id)}
                disabled={cancellingOrderId === order.id}
                className="h-8 w-8"
            >
              {cancellingOrderId === order.id ? (
                  <Loader2 size={16} className="animate-spin text-red-500" />
              ) : (
                  <XCircle size={16} className="text-red-500" />
              )}
            </Button>
        )}

        <Button
            variant="ghost"
            size="icon"
            title="Eliminar orden"
            onClick={() => openDeleteDialog(order.id)}
            disabled={deletingOrderId === order.id}
            className="h-8 w-8"
        >
          {deletingOrderId === order.id ? (
              <Loader2 size={16} className="animate-spin text-red-500" />
          ) : (
              <Trash2 size={16} className="text-red-500" />
          )}
        </Button>
      </div>
  )

  return (
      <div className="space-y-6">
        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar orden de compra?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la orden de compra
                y todos sus detalles asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteOrder}
                  className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold tracking-tight">Órdenes de Compra</h1>
          <PurchaseOrderDialog />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Listado de Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <p>{error}</p>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Cargando órdenes de compra...</span>
                </div>
            ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                          type="search"
                          placeholder="Buscar por ID o proveedor..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <select
                          className="bg-background border border-input rounded-md h-9 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
                          value={statusFilter || ''}
                          onChange={(e) => setStatusFilter(e.target.value || null)}
                      >
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="approved">Aprobada</option>
                        <option value="delivered">Entregada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  {/* Desktop/Tablet View */}
                  <div className="hidden md:block rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">ID</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="hidden lg:table-cell">Fecha de Orden</TableHead>
                            <TableHead className="hidden lg:table-cell">Fecha Esperada</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Monto Total</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.length > 0 ? (
                              filteredOrders.map((order) => (
                                  <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.supplier_name}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{formatDate(order.orderDate)}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{formatDate(order.expectedDate)}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                                    <TableCell className="text-right">
                                      <OrderActions order={order} />
                                    </TableCell>
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                  No se encontraron órdenes de compra.
                                </TableCell>
                              </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Orden #{order.id}</p>
                                    <h3 className="text-base font-semibold">{order.supplier_name}</h3>
                                  </div>
                                  <StatusBadge status={order.status} />
                                </div>

                                <div className="space-y-2 my-3">
                                  <div className="flex items-center text-sm">
                                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Creada: {formatDate(order.orderDate)}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Esperada: {formatDate(order.expectedDate)}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                                  </div>
                                </div>

                                <div className="border-t pt-3 mt-2">
                                  <OrderActions order={order} />
                                </div>
                              </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                          No se encontraron órdenes de compra.
                        </div>
                    )}
                  </div>
                </>
            )}
          </CardContent>
        </Card>
      </div>
  )
}