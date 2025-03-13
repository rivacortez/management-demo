export interface ProductSupplier {
  product_id: string
  supplier_id: string
  cost_price: number
  lead_time_days: number
}

export type CreateProductSupplier = ProductSupplier
export type UpdateProductSupplier = Partial<ProductSupplier>

