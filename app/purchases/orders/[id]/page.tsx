'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Package,
    User,
    AlertTriangle,
    Loader2,
    XCircle,
    Clock,
    DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { PurchaseOrder } from '@/app/purchase-orders/domain/interfaces/purchase-orders'
import { PurchaseOrderItem } from '@/app/purchase-orders/domain/interfaces/purchase-order-items'
import { SupabasePurchaseOrderRepository } from '@/app/purchase-orders/repositories/supabase-purchase-order-repository'
import { SupabaseSupplierRepository } from '@/app/management-suppliers/repositories/supabase-supplier-repository'
import { GetPurchaseOrderByIdUseCase, UpdatePurchaseOrderUseCase } from '@/app/purchase-orders/use-cases/use-purchase-orders'
import { GetSupplierByIdUseCase } from '@/app/management-suppliers/use-cases/use-management-supplier'
import { toast } from 'sonner'
import {formatPrice} from "@/lib/format-price";

// Inicializa repositorios y use cases
const purchaseOrderRepository = new SupabasePurchaseOrderRepository()
const supplierRepository = new SupabaseSupplierRepository()
const getPurchaseOrderByIdUseCase = new GetPurchaseOrderByIdUseCase(purchaseOrderRepository)
const updatePurchaseOrderUseCase = new UpdatePurchaseOrderUseCase(purchaseOrderRepository)
const getSupplierByIdUseCase = new GetSupplierByIdUseCase(supplierRepository)

// Helper functions
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
    const statusConfig: Record<
        string,
        { color: string; label: string; icon: React.ReactNode }
    > = {
        pending: {
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
            label: 'Pendiente',
            icon: <Clock className="h-4 w-4 mr-1" />
        },
        approved: {
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
            label: 'Aprobada',
            icon: <CheckCircle className="h-4 w-4 mr-1" />
        },
        delivered: {
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
            label: 'Entregada',
            icon: <Package className="h-4 w-4 mr-1" />
        },
        cancelled: {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
            label: 'Cancelada',
            icon: <XCircle className="h-4 w-4 mr-1" />
        }
    }

    const config = statusConfig[status] || {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        label: status,
        icon: <AlertTriangle className="h-4 w-4 mr-1" />
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.icon}
            {config.label}
    </span>
    )
}

export default function PurchaseOrderDetailPage() {
    const router = useRouter()
    const params = useParams()
    // Si params.id es un arreglo, toma el primer elemento; de lo contrario, úsalo directamente
    const idParam = Array.isArray(params.id) ? params.id[0] : params.id

    // Actualiza el tipo para incluir opcionalmente productName
    const [orderItems, setOrderItems] = useState<(PurchaseOrderItem & { productName?: string })[]>([])
    const [order, setOrder] = useState<PurchaseOrder | null>(null)
    const [supplierName, setSupplierName] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [processingAction, setProcessingAction] = useState<string | null>(null)

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true)
                setError(null)

                // Convierte el id a número
                const orderId = parseInt(idParam || '0', 10)
                const orderData = await getPurchaseOrderByIdUseCase.execute(orderId)

                if (!orderData) {
                    setError('No se encontró la orden de compra solicitada')
                    return
                }

                setOrder(orderData)

                // Get supplier details
                try {
                    const supplierData = await getSupplierByIdUseCase.execute(orderData.supplierId.toString())
                    setSupplierName(supplierData?.supplier_name || 'Proveedor desconocido')
                } catch (supplierErr) {
                    console.error('Error fetching supplier:', supplierErr)
                    setSupplierName('Proveedor desconocido')
                }

                // Get order items
                try {
                    const itemsWithNames = await purchaseOrderRepository.getOrderItemsWithProductNames(orderId)
                    setOrderItems(itemsWithNames)
                } catch (itemsErr) {
                    console.error('Error fetching order items:', itemsErr)
                    setOrderItems([])
                }
            } catch (err) {
                console.error('Error fetching order details:', err)
                setError('Error al cargar los detalles de la orden')
                toast.error("No se pudo cargar la orden de compra")
            } finally {
                setLoading(false)
            }
        }

        if (idParam) {
            fetchOrderDetails()
        }
    }, [idParam])

    // Update order status
    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return

        try {
            setProcessingAction(newStatus)
            await updatePurchaseOrderUseCase.execute(order.id, { status: newStatus })
            // Update local state
            setOrder(prev => (prev ? { ...prev, status: newStatus } : null))
            toast.success(
                `La orden ha sido marcada como ${
                    newStatus === 'approved'
                        ? 'aprobada'
                        : newStatus === 'delivered'
                            ? 'recibida'
                            : newStatus
                }`
            )
        } catch (err) {
            console.error('Error updating order status:', err)
            toast.error("No se pudo actualizar el estado de la orden")
        } finally {
            setProcessingAction(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Cargando detalles de la orden...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold mt-4">Error</h2>
                <p className="text-muted-foreground">{error || "No se encontró la orden solicitada"}</p>
                <Button onClick={() => router.back()} variant="outline" className="mt-4">
                    Volver
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div className="flex items-center gap-2">
                    <Link href="/purchases/orders">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Orden de Compra #{order.id}
                    </h1>
                    <StatusBadge status={order.status} />
                </div>

                <div className="flex gap-2">
                    {order.status === 'pending' && (
                        <>
                            <Button
                                onClick={() => updateOrderStatus('approved')}
                                disabled={processingAction !== null}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processingAction === 'approved' ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Aprobar
                            </Button>
                            <Button
                                onClick={() => updateOrderStatus('cancelled')}
                                disabled={processingAction !== null}
                                variant="destructive"
                            >
                                {processingAction === 'cancelled' ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Cancelar
                            </Button>
                        </>
                    )}

                    {order.status === 'approved' && (
                        <>
                            <Button
                                onClick={() => updateOrderStatus('delivered')}
                                disabled={processingAction !== null}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {processingAction === 'delivered' ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Package className="h-4 w-4 mr-2" />
                                )}
                                Marcar como Recibida
                            </Button>
                            <Button
                                onClick={() => updateOrderStatus('cancelled')}
                                disabled={processingAction !== null}
                                variant="destructive"
                            >
                                {processingAction === 'cancelled' ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                Cancelar
                            </Button>
                        </>
                    )}

                    {order.status === 'pending' && (
                        <Link href={`/purchases/orders/${order.id}/edit`}>
                            <Button variant="outline">Editar</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Order Information Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Detalles de la Orden</CardTitle>
                    <CardDescription>Información general de la orden de compra</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Proveedor</p>
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-primary" />
                            <p className="text-lg font-semibold">{supplierName}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Orden</p>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            <p className="text-base">{formatDate(order.orderDate)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Fecha Esperada</p>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            <p className="text-base">{formatDate(order.expectedDate)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Monto Total</p>
                        <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-primary" />
                            <p className="text-lg font-bold">{formatPrice(order.totalAmount)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Productos</CardTitle>
                    <CardDescription>Listado de productos incluidos en esta orden</CardDescription>
                </CardHeader>
                <CardContent>
                    {orderItems.length > 0 ? (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Cantidad</TableHead>
                                        <TableHead className="text-right">Costo</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.productId}</TableCell>
                                            <TableCell>{item.productName || `Producto #${item.productId}`}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatPrice(item.cost)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatPrice(item.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center p-8 border rounded-md">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No hay items asociados a esta orden</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-end border-t p-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{formatPrice(order.totalAmount)}</p>
                    </div>
                </CardFooter>
            </Card>

            {/* Order History Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Historial de la Orden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">Orden Creada</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {order.status !== 'pending' && (
                            <div className="flex items-start gap-2">
                                <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center mt-0.5 ${
                                        order.status === 'cancelled'
                                            ? 'bg-red-100'
                                            : order.status === 'approved'
                                                ? 'bg-blue-100'
                                                : 'bg-green-100'
                                    }`}
                                >
                                    {order.status === 'cancelled' && (
                                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                                    )}
                                    {order.status === 'approved' && (
                                        <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                                    )}
                                    {order.status === 'delivered' && (
                                        <Package className="h-3.5 w-3.5 text-green-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        Orden{' '}
                                        {order.status === 'cancelled'
                                            ? 'Cancelada'
                                            : order.status === 'approved'
                                                ? 'Aprobada'
                                                : 'Recibida'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{formatDate(order.updatedAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
