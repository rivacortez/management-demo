'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/config/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  GetPurchaseOrderByIdUseCase,
  UpdatePurchaseOrderUseCase
} from '@/app/purchase-orders/use-cases/use-purchase-orders'
import { SupabasePurchaseOrderRepository } from '@/app/purchase-orders/repositories/supabase-purchase-order-repository'
import { GetSuppliersUseCase } from '@/app/management-suppliers/use-cases/use-management-supplier'
import { SupabaseSupplierRepository } from '@/app/management-suppliers/repositories/supabase-supplier-repository'
import { SupabaseProductSupplierRepository } from '@/app/management-suppliers/repositories/supabase-product-supplier-repository'
import { SupabaseProductRepository } from '@/app/management-suppliers/repositories/supabase-product-repository'

import { calculateOrderTotal } from '@/lib/calculate-order-total'

import { Supplier } from '@/app/management-suppliers/domain/interfaces/supplier'
import { ProductSupplier } from '@/app/management-suppliers/domain/interfaces/product-supplier'
import { PurchaseOrderItem } from '@/app/purchase-orders/domain/interfaces/purchase-order-items'

// -----------------------------------------------------------------------------
// Interfaces locales para el hook

/** Estructura que usaremos en el formulario local */
interface LocalOrderData {
  supplierId: string
  orderDate: Date
  expectedDate: Date
  status: string
  totalAmount: number
}

/** Extiende el PurchaseOrderItem del dominio para incluir campos extra de UI */
interface OrderItem extends PurchaseOrderItem {
  productName?: string
  isNew?: boolean
}

/** Extiende ProductSupplier para incluir el nombre del producto */
interface ProductSupplierInfo extends ProductSupplier {
  productName?: string
  // Nota: product_id es string en la BD; convertiremos a number cuando agregamos a la orden
}

// -----------------------------------------------------------------------------
// Hook principal

export function usePurchaseEditOrder(orderId: number) {
  const router = useRouter()

  // Estados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([])

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<ProductSupplierInfo[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('') // string (viene de un <Select />)
  const [newProductQuantity, setNewProductQuantity] = useState(1)
  const [productCost, setProductCost] = useState(0)
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Form data local (fechas como Date, supplierId como string)
  const [orderData, setOrderData] = useState<LocalOrderData>({
    supplierId: '',
    orderDate: new Date(),
    expectedDate: new Date(),
    status: 'pending',
    totalAmount: 0
  })

  // Items de la orden
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // -----------------------------------------------------------------------------
  // Carga inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Obtener la orden y proveedores
        const [order, suppliersData] = await Promise.all([
          new GetPurchaseOrderByIdUseCase(new SupabasePurchaseOrderRepository()).execute(orderId),
          new GetSuppliersUseCase(new SupabaseSupplierRepository()).execute()
        ])

        if (!order) {
          toast.error('Orden no encontrada')
          router.push('/purchases/orders')
          return
        }

        if (order.status !== 'pending') {
          toast.error('Solo se pueden editar órdenes pendientes')
          router.push(`/purchases/orders/${orderId}`)
          return
        }

        setSuppliers(suppliersData)

        setOrderData({
          supplierId: String(order.supplierId),
          orderDate: new Date(order.orderDate),
          expectedDate: new Date(order.expectedDate),
          status: order.status,
          totalAmount: order.totalAmount
        })

        const items = await new SupabasePurchaseOrderRepository().getOrderItemsWithProductNames(orderId)
        setOrderItems(items.map(i => ({ ...i, isNew: false })))
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error al cargar los datos de la orden')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [orderId, router])

  // -----------------------------------------------------------------------------
  // Cargar productos asociados al proveedor
  const handleAddProductClick = async () => {
    try {
      setLoadingProducts(true)
  

      const supplierIdStr = orderData.supplierId
  
      const supplierProducts = await new SupabaseProductSupplierRepository().getProductsBySupplierId(supplierIdStr)
  
      if (supplierProducts.length === 0) {
        toast.warning('Este proveedor no tiene productos asociados')
        return
      }

      const productsWithDetails = await Promise.all(
        supplierProducts.map(async (sp) => {
          const product = await new SupabaseProductRepository().getProductById(sp.product_id)
          return {
            ...sp,
            productName: product?.name || 'Producto desconocido'
          }
        })
      )

      setAvailableProducts(productsWithDetails)
      setIsAddProductDialogOpen(true)
    } catch (error) {
      console.error('Error loading supplier products:', error)
      toast.error('Error al cargar productos del proveedor')
    } finally {
      setLoadingProducts(false)
    }
  }

  // -----------------------------------------------------------------------------
  // Agregar producto a la orden
  const handleAddProductToOrder = () => {
    if (!selectedProductId || newProductQuantity <= 0) {
      toast.error('Seleccione un producto y cantidad válida')
      return
    }

    // Buscamos el producto seleccionado
    const selectedProduct = availableProducts.find(p => p.product_id === selectedProductId)
    if (!selectedProduct) {
      toast.error('Producto no encontrado')
      return
    }

    // Convertimos product_id (string) => number si la columna product_id en supa es numerico
    const productIdNum = Number(selectedProduct.product_id)


    let updatedItems: OrderItem[]
    const existingItemIndex = orderItems.findIndex(item => item.productId === productIdNum)

    if (existingItemIndex >= 0) {
      updatedItems = [...orderItems]
      const item = updatedItems[existingItemIndex]
      const newQuantity = item.quantity + newProductQuantity
      const newTotal = newQuantity * item.cost
      updatedItems[existingItemIndex] = { ...item, quantity: newQuantity, total: newTotal }
    } else {
      // Nuevo item
      const newItem: OrderItem = {
        id: Date.now(), // ID temporal
        purchaseOrderId: orderId,
        productId: productIdNum,
        productName: selectedProduct.productName || 'Producto sin nombre',
        cost: selectedProduct.cost_price,
        quantity: newProductQuantity,
        total: selectedProduct.cost_price * newProductQuantity,
        isNew: true
      }
      updatedItems = [...orderItems, newItem]
    }

    setOrderItems(updatedItems)
    setOrderData(prev => ({ ...prev, totalAmount: calculateOrderTotal(updatedItems) }))

    // Reset
    setSelectedProductId('')
    setNewProductQuantity(1)
    setIsAddProductDialogOpen(false)
    toast.success('Producto agregado a la orden')
  }

  const handleInputChange = (field: string, value: unknown) => {
    setOrderData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = [...orderItems]
    const item = updatedItems[index]
    const quantity = Math.max(1, newQuantity)
    updatedItems[index] = { ...item, quantity, total: quantity * item.cost }

    setOrderItems(updatedItems)
    setOrderData(prev => ({ ...prev, totalAmount: calculateOrderTotal(updatedItems) }))
  }

  const removeItem = (index: number) => {
    const item = orderItems[index]
    if (item.id && !item.isNew) {
      setDeletedItemIds(prev => [...prev, item.id])
    }
    const updatedItems = orderItems.filter((_, i) => i !== index)
    setOrderItems(updatedItems)
    setOrderData(prev => ({ ...prev, totalAmount: calculateOrderTotal(updatedItems) }))
  }

  // Guarda la orden
  const handleSave = async () => {
    try {
      setSaving(true)
  
      await new UpdatePurchaseOrderUseCase(new SupabasePurchaseOrderRepository()).execute(orderId, {
        supplierId: Number(orderData.supplierId),
        orderDate: orderData.orderDate.toISOString(),
        expectedDate: orderData.expectedDate.toISOString(),
        status: orderData.status,
        totalAmount: orderData.totalAmount
      })

      // se boorra los productos marcadis
      if (deletedItemIds.length > 0) {
        await Promise.all(
          deletedItemIds.map(async (itemId) => {
            const { error } = await supabase
              .from('purchase_order_items')
              .delete()
              .eq('id', itemId)

            if (error) {
              throw new Error(`Error deleting order item: ${error.message}`)
            }
          })
        )
      }

      await Promise.all(
        orderItems.map(async (item) => {
          if (item.isNew) {
            // Insert
            const { error } = await supabase.from('purchase_order_items').insert({
              purchase_order_id: orderId,
              product_id: item.productId,
              quantity: item.quantity,
              cost: item.cost,
              total: item.total
            })
            if (error) {
              throw new Error(`Error adding order item: ${error.message}`)
            }
          } else {
            // Update
            const { error } = await supabase
              .from('purchase_order_items')
              .update({ quantity: item.quantity, total: item.total })
              .eq('id', item.id)

            if (error) {
              throw new Error(`Error updating order item: ${error.message}`)
            }
          }
        })
      )

      toast.success('Orden actualizada correctamente')
      router.push(`/purchases/orders/${orderId}`)
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  // -----------------------------------------------------------------------------
  // Retornamos todo lo que el componente de edición necesita
  return {
    loading,
    saving,
    suppliers,
    orderData,
    orderItems,
    isAddProductDialogOpen,
    availableProducts,
    selectedProductId,
    newProductQuantity,
    productCost,
    loadingProducts,
    handleAddProductClick,
    handleAddProductToOrder,
    handleInputChange,
    handleQuantityChange,
    removeItem,
    handleSave,
    setIsAddProductDialogOpen,
    setSelectedProductId,
    setNewProductQuantity,
    setProductCost
  }
}
