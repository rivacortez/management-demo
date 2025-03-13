export interface ProductCategory {
    product_id: string
    category_id: string
  }
  
  export type CreateProductCategory = ProductCategory
  export type UpdateProductCategory = Partial<ProductCategory>