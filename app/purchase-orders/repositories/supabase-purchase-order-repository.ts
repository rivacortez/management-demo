import { PurchaseOrderItem } from '../domain/interfaces/purchase-order-items'
import { ProductSupplierWithProductName, PurchaseOrder } from '../domain/interfaces/purchase-orders'
import { PurchaseOrderRepository } from '../domain/repositories/purchase-order-repository'
import { supabase } from '@/app/config/supabase/client'

// Define interfaces para mapear las filas de Supabase

interface PurchaseOrderRow {
    id: number
    supplier_id: number
    order_date: string
    expected_date: string
    status: string
    total_amount: number
    created_at: string
    updated_at: string
}

interface PurchaseOrderItemRow {
    id: number
    purchase_order_id: number
    product_id: number
    quantity: number
    cost: number
    total: number
}

interface ProductRow {
    id: number
    name: string
}

interface ProductSupplierRow {
    product_id: number
    supplier_id: number
    cost_price: number
    lead_time_days: number
}

export class SupabasePurchaseOrderRepository implements PurchaseOrderRepository {
    // Repositorio: SupabasePurchaseOrderRepository

    async getPurchaseOrders(): Promise<PurchaseOrder[]> {
        const { data, error } = await supabase
            .from('purchase_orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            throw new Error('Error al obtener órdenes de compra: ' + error.message)
        }

        const purchaseOrders: PurchaseOrder[] = ((data as PurchaseOrderRow[]) || []).map((item: PurchaseOrderRow) => ({
            id: item.id,
            supplierId: item.supplier_id,
            orderDate: item.order_date,
            expectedDate: item.expected_date,
            status: item.status,
            totalAmount: item.total_amount,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }))

        return purchaseOrders
    }

    async getPurchaseOrderById(id: number): Promise<PurchaseOrder | null> {
        const { data, error } = await supabase
            .from('purchase_orders')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            throw new Error('Error al obtener la orden de compra: ' + error.message)
        }

        if (!data) return null

        const item = data as PurchaseOrderRow
        return {
            id: item.id,
            supplierId: item.supplier_id,
            orderDate: item.order_date,
            expectedDate: item.expected_date,
            status: item.status,
            totalAmount: item.total_amount,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }
    }

    async createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
        const purchaseOrderDb = {
            supplier_id: purchaseOrder.supplierId,
            order_date: purchaseOrder.orderDate,
            expected_date: purchaseOrder.expectedDate,
            status: purchaseOrder.status,
            total_amount: purchaseOrder.totalAmount,
        }

        const { data, error } = await supabase
            .from('purchase_orders')
            .insert([purchaseOrderDb])
            .select()

        if (error) {
            throw new Error('Error al crear la orden de compra: ' + error.message)
        }

        const created = data![0] as PurchaseOrderRow
        return {
            id: created.id,
            supplierId: created.supplier_id,
            orderDate: created.order_date,
            expectedDate: created.expected_date,
            status: created.status,
            totalAmount: created.total_amount,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
        }
    }

    async updatePurchaseOrder(id: number, purchaseOrder: Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PurchaseOrder> {
        // Convert from camelCase to snake_case for the database
        const dbPurchaseOrder = {
          supplier_id: purchaseOrder.supplierId,
          order_date: purchaseOrder.orderDate,
          expected_date: purchaseOrder.expectedDate,  // This is the key that's causing the error
          status: purchaseOrder.status,
          total_amount: purchaseOrder.totalAmount
        }
      
        const { data, error } = await supabase
          .from('purchase_orders')
          .update(dbPurchaseOrder)  // Use the converted object
          .eq('id', id)
          .select()

        if (error) {
            throw new Error('Error al actualizar la orden de compra: ' + error.message)
        }

        const updated = data![0] as PurchaseOrderRow
        return {
            id: updated.id,
            supplierId: updated.supplier_id,
            orderDate: updated.order_date,
            expectedDate: updated.expected_date,
            status: updated.status,
            totalAmount: updated.total_amount,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
        }
    }

    async deletePurchaseOrder(id: number): Promise<void> {
        const { error } = await supabase
            .from('purchase_orders')
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error('Error al eliminar la orden de compra: ' + error.message)
        }
    }

    async cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
        const { data, error } = await supabase
            .from('purchase_orders')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .select()

        if (error) {
            throw new Error('Error al cancelar la orden de compra: ' + error.message)
        }

        const cancelled = data![0] as PurchaseOrderRow
        return {
            id: cancelled.id,
            supplierId: cancelled.supplier_id,
            orderDate: cancelled.order_date,
            expectedDate: cancelled.expected_date,
            status: cancelled.status,
            totalAmount: cancelled.total_amount,
            createdAt: cancelled.created_at,
            updatedAt: cancelled.updated_at,
        }
    }

    async searchPurchaseOrders(query: string): Promise<PurchaseOrder[]> {
        const { data, error } = await supabase
            .from('purchase_orders')
            .select('*')
            .or(`id.eq.${parseInt(query) || 0},supplierId.eq.${parseInt(query) || 0}`)
            .order('created_at', { ascending: false })

        if (error) {
            throw new Error('Error al buscar órdenes de compra: ' + error.message)
        }

        const results: PurchaseOrder[] = ((data as PurchaseOrderRow[]) || []).map((item: PurchaseOrderRow) => ({
            id: item.id,
            supplierId: item.supplier_id,
            orderDate: item.order_date,
            expectedDate: item.expected_date,
            status: item.status,
            totalAmount: item.total_amount,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }))

        return results
    }

    async filterPurchaseOrders(filters: Partial<PurchaseOrder>): Promise<PurchaseOrder[]> {
        let query = supabase.from('purchase_orders').select('*')

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query = query.eq(key, value)
            }
        })

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            throw new Error('Error al filtrar órdenes de compra: ' + error.message)
        }

        const results: PurchaseOrder[] = ((data as PurchaseOrderRow[]) || []).map((item: PurchaseOrderRow) => ({
            id: item.id,
            supplierId: item.supplier_id,
            orderDate: item.order_date,
            expectedDate: item.expected_date,
            status: item.status,
            totalAmount: item.total_amount,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }))

        return results
    }

    async getProductsBySupplier(supplierId: string): Promise<ProductSupplierWithProductName[]> {
        try {
            // Consulta la tabla product_suppliers
            const { data: productSuppliers, error: supplierError } = await supabase
                .from('product_suppliers')
                .select('product_id, supplier_id, cost_price, lead_time_days')
                .eq('supplier_id', supplierId)

            if (supplierError) {
                throw new Error(supplierError.message)
            }

            const productsData = productSuppliers as ProductSupplierRow[]
            if (!productsData || productsData.length === 0) {
                return []
            }

            // Obtiene todos los product_ids
            const productIds = productsData.map(item => item.product_id)

            // Consulta la tabla products para obtener nombres
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, name')
                .in('id', productIds)

            if (productsError) {
                throw new Error(productsError.message)
            }

            // Crea un mapa de product id a nombre
            const productMap = new Map<number, { name: string }>()
            ;((products as ProductRow[]) || []).forEach(product => {
                productMap.set(product.id, { name: product.name })
            })

            // Une los datos y convierte product_id a string
            const result: ProductSupplierWithProductName[] = productsData.map(item => ({
                product_id: String(item.product_id), // Convert to string
                supplier_id: String(item.supplier_id), // Convert to string
                cost_price: item.cost_price,
                lead_time_days: item.lead_time_days,
                products: productMap.get(item.product_id) || { name: 'Producto no encontrado' }
            }))

            return result
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            throw new Error('Error al obtener productos del proveedor: ' + errorMessage)
        }
    }

    async getOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
        try {
            const { data, error } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('purchase_order_id', purchaseOrderId)

            if (error) {
                throw new Error('Error al obtener los items de la orden: ' + error.message)
            }

            const items: PurchaseOrderItem[] = ((data as PurchaseOrderItemRow[]) || []).map((item: PurchaseOrderItemRow) => ({
                id: item.id,
                purchaseOrderId: item.purchase_order_id,
                productId: item.product_id,
                quantity: item.quantity,
                cost: item.cost,
                total: item.total,
            }))

            return items
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            throw new Error('Error al obtener los items de la orden: ' + errorMessage)
        }
    }

    async createOrderItem(item: {
        purchase_order_id: number
        product_id: number
        quantity: number
        cost: number
        total: number
    }): Promise<PurchaseOrderItem> {
        try {
            const { data, error } = await supabase
                .from('purchase_order_items')
                .insert([item])
                .select()
                .single()

            if (error) {
                throw new Error('Error al crear el ítem de la orden: ' + error.message)
            }

            const created = data as PurchaseOrderItemRow
            return {
                id: created.id,
                purchaseOrderId: created.purchase_order_id,
                productId: created.product_id,
                quantity: created.quantity,
                cost: created.cost,
                total: created.total
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            throw new Error('Error al crear el ítem de la orden: ' + errorMessage)
        }
    }

    async getOrderItemsWithProductNames(purchaseOrderId: number): Promise<(PurchaseOrderItem & { productName: string })[]> {
        try {
            const { data: items, error: itemsError } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('purchase_order_id', purchaseOrderId)

            if (itemsError) {
                throw new Error('Error al obtener los items de la orden: ' + itemsError.message)
            }

            const itemsData = items as PurchaseOrderItemRow[]
            if (!itemsData || itemsData.length === 0) {
                return []
            }

            // Extraer product_ids
            const productIds = itemsData.map(item => item.product_id)

            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, name')
                .in('id', productIds)

            if (productsError) {
                throw new Error('Error al obtener nombres de productos: ' + productsError.message)
            }

            const productsData = products as ProductRow[]
            const productMap = new Map<number, string>()
            productsData.forEach(product => {
                productMap.set(product.id, product.name)
            })

            return itemsData.map(item => ({
                id: item.id,
                purchaseOrderId: item.purchase_order_id,
                productId: item.product_id,
                quantity: item.quantity,
                cost: item.cost,
                total: item.total,
                productName: productMap.get(item.product_id) || `Producto #${item.product_id}`
            }))
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            throw new Error('Error al obtener detalles de productos: ' + errorMessage)
        }
    }
}
