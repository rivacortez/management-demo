import { PurchaseOrderItem } from '../interfaces/purchase-order-items'
import {ProductSupplierWithProductName, PurchaseOrder } from '../interfaces/purchase-orders'


export interface PurchaseOrderRepository {
  getPurchaseOrders(): Promise<PurchaseOrder[]>
  getPurchaseOrderById(id: number): Promise<PurchaseOrder | null>
  createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder>
  updatePurchaseOrder(id: number, purchaseOrder: Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PurchaseOrder>
  deletePurchaseOrder(id: number): Promise<void>
  cancelPurchaseOrder(id: number): Promise<PurchaseOrder>
  searchPurchaseOrders(query: string): Promise<PurchaseOrder[]>
  filterPurchaseOrders(filters: Partial<PurchaseOrder>): Promise<PurchaseOrder[]>
  getProductsBySupplier(supplierId: string): Promise<ProductSupplierWithProductName[]>
  getOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>

}