import {ProductSupplier} from "@/app/management-suppliers/domain/interfaces/product-supplier";

export interface PurchaseOrder {
  id: number
  supplierId: number
  orderDate: string
  expectedDate: string
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface ProductSupplierWithProductName extends ProductSupplier {
    products: { name: string }
}