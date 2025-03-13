import { ProductSupplier } from '../interfaces/product-supplier'
import { Supplier, CreateSupplier, UpdateSupplier } from '../interfaces/supplier'

export interface SupplierRepository {
  getSuppliers(): Promise<Supplier[]>
  getSupplierById(id: string): Promise<Supplier | null>
  createSupplier(supplier: CreateSupplier): Promise<Supplier>
  updateSupplier(id: string, supplier: UpdateSupplier): Promise<Supplier>
  deleteSupplier(id: string): Promise<void>
  searchSuppliers(query: string): Promise<Supplier[]>
  filterSuppliers(filters: Partial<Supplier>): Promise<Supplier[]>
  getSuppliedProductsBySupplier(supplierId: string): Promise<ProductSupplier[]>
}
