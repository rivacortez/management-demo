import { Product, CreateProduct, UpdateProduct } from '../interfaces/product'

export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product | null>
  create(product: CreateProduct): Promise<Product>
  update(id: string, product: UpdateProduct): Promise<Product>
  delete(id: string): Promise<void>
} 