export type ProductStatus = 'en_stock' | 'agotado' | 'proximo_ingreso';

export interface Product {
  id: string
  name: string
  description: string
  price: number
  //barcode: string
  stock: number
  //isPopular: boolean
  //slug: string
  cover_image: string[]
  //quantity: number
  //status: ProductStatus
  createdAt: Date
  updatedAt: Date
}

export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProduct = Partial<CreateProduct>