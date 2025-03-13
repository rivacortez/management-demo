'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CreatePurchaseOrderUseCase } from '@/app/purchase-orders/use-cases/use-purchase-orders'
import { SupabasePurchaseOrderRepository } from '@/app/purchase-orders/repositories/supabase-purchase-order-repository'
import { GetSuppliersUseCase } from '@/app/management-suppliers/use-cases/use-management-supplier'
import { SupabaseSupplierRepository } from '@/app/management-suppliers/repositories/supabase-supplier-repository'
import { ProductSupplierWithProductName } from '@/app/purchase-orders/domain/interfaces/purchase-orders'
import { Supplier } from '@/app/management-suppliers/domain/interfaces/supplier'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

const purchaseOrderRepository = new SupabasePurchaseOrderRepository()
const createPurchaseOrderUseCase = new CreatePurchaseOrderUseCase(purchaseOrderRepository)
const supplierRepository = new SupabaseSupplierRepository()
const getSuppliersUseCase = new GetSuppliersUseCase(supplierRepository)

async function getProductsBySupplier(supplierId: string): Promise<ProductSupplierWithProductName[]> {
  try {
    return await purchaseOrderRepository.getProductsBySupplier(supplierId)
  } catch (error) {
    console.error('Error fetching supplier products:', error)
    console.log("asdasd")
    throw error
  }
}

interface OrderItem {
  productId: string;
  quantity: string;
  cost: string;
  total: number;
}

interface OrderFormData {
  supplierId: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: string;
  notes: string;
}

export default function PurchaseOrderDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierProducts, setSupplierProducts] = useState<ProductSupplierWithProductName[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<OrderFormData>({
    supplierId: '',
    orderDate: '',
    expectedDate: '',
    totalAmount: '',
    notes: '',
  })

  const [items, setItems] = useState<OrderItem[]>([])

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliersData = await getSuppliersUseCase.execute()
        setSuppliers(suppliersData)
      } catch (err) {
        console.error('Error al cargar proveedores:', err)
        setError('Error al cargar proveedores.')
      }
    }

    if (open) {
      fetchSuppliers()
    }
  }, [open])

  useEffect(() => {
    if (!formData.supplierId) {
      setSupplierProducts([])
      return
    }

    const fetchSupplierProducts = async () => {
      try {
        const data = await getProductsBySupplier(formData.supplierId)
        setSupplierProducts(data)
      } catch (err) {
        console.error('Error al obtener productos del proveedor:', err)
        toast.error('No se pudieron cargar los productos del proveedor')
      }
    }

    fetchSupplierProducts()
  }, [formData.supplierId])

  useEffect(() => {
    if (items.length > 0) {
      const total = calculateTotalAmount();
      setFormData(prev => ({...prev, totalAmount: total.toFixed(2)}));
    }
  }, [items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value })
    setItems([])
  }

  const productCostMap = useMemo(() => {
    const map = new Map<string, number>()
    supplierProducts.forEach((p) => {
      map.set(p.product_id, p.cost_price)
    })
    return map
  }, [supplierProducts])

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: '1', cost: '0', total: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleItemChange = (
      index: number,
      field: 'productId' | 'quantity' | 'cost',
      value: string
  ) => {
    const newItems = [...items]
    newItems[index][field] = value

    if (field === 'productId') {
      const costPrice = productCostMap.get(value)
      if (costPrice !== undefined) {
        newItems[index].cost = costPrice.toString()
      }
    }

    const quantityNum = parseFloat(newItems[index].quantity) || 0
    const costNum = parseFloat(newItems[index].cost) || 0
    newItems[index].total = quantityNum * costNum

    setItems(newItems)
  }

  const resetForm = () => {
    setFormData({
      supplierId: '',
      orderDate: '',
      expectedDate: '',
      totalAmount: '',
      notes: '',
    })
    setItems([])
    setSupplierProducts([])
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (items.length === 0) {
        setError("Debe agregar al menos un producto a la orden")
        return
      }

      const newOrder = {
        supplierId: parseInt(formData.supplierId),
        orderDate: formData.orderDate,
        expectedDate: formData.expectedDate,
        status: 'pending',
        totalAmount: parseFloat(formData.totalAmount),
      }

      const createdOrder = await createPurchaseOrderUseCase.execute(newOrder)

      const orderItemPromises = items.map(item => {
        const itemDb = {
          purchase_order_id: createdOrder.id,
          product_id: parseInt(item.productId),
          quantity: parseFloat(item.quantity),
          cost: parseFloat(item.cost),
          total: item.total,
        }
        return purchaseOrderRepository.createOrderItem(itemDb)
      })

      await Promise.all(orderItemPromises)

      toast.success('Orden creada correctamente con ' + items.length + ' productos.')
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      console.error('Error al crear la orden:', err)
      setError('Error al crear la orden. Por favor, inténtalo de nuevo.')
      toast.error('Error al crear la orden.')
    } finally {
      setLoading(false)
    }
  }

  return (
      <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value)
            if (!value) resetForm()
          }}
      >
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Orden de Compra
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
            <DialogDescription>
              Complete los datos para crear una nueva orden de compra.
            </DialogDescription>
          </DialogHeader>

          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos principales de la orden */}
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="supplierId">Proveedor</Label>
                <Select
                    value={formData.supplierId}
                    onValueChange={(value) => handleSelectChange(value, 'supplierId')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.supplier_name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="orderDate">Fecha de Orden</Label>
                <Input
                    id="orderDate"
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleInputChange}
                    required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expectedDate">Fecha Esperada</Label>
                <Input
                    id="expectedDate"
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleInputChange}
                    required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Monto Total</Label>
                <Input
                    id="totalAmount"
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notas / Comentarios</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Anotaciones o comentarios adicionales..."
                />
              </div>
            </div>

            {/* Ítems de la orden */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Productos / Ítems</Label>
                <Button type="button" variant="outline" onClick={handleAddItem}>
                  Agregar Ítem
                </Button>
              </div>

              {items.map((item, index) => (
                  <div
                      key={index}
                      className="flex flex-col md:flex-row gap-2 border p-3 rounded-md"
                  >
                    {/* productId: Seleccionar de supplierProducts */}
                    <div className="flex-1">
                      <Label>Producto</Label>
                      <Select
                          value={item.productId}
                          onValueChange={(value) => handleItemChange(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierProducts.map((p) => (
                              <SelectItem key={p.product_id} value={p.product_id}>
                                {p.products?.name ?? `ID: ${p.product_id}`}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* quantity */}
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          step="1"
                      />
                    </div>

                    <div>
                      <Label>Costo</Label>
                      <Input
                          type="number"
                          value={item.cost}
                          onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                          step="0.01"
                      />
                    </div>

                    {/* total (read-only) */}
                    <div>
                      <Label>Total</Label>
                      <Input type="number" value={item.total} readOnly />
                    </div>

                    {/* Botón eliminar */}
                    <button
                        type="button"
                        className="mt-4 md:mt-0 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 />
                    </button>
                  </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Orden'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  )
}