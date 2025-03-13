import { Category, CreateCategory, UpdateCategory } from '../interfaces/categories'

export interface CategoryRepository {
  getAll(): Promise<Category[]>
  getById(id: string): Promise<Category | null>
  create(category: CreateCategory): Promise<Category>
  update(id: string, category: UpdateCategory): Promise<Category>
  delete(id: string): Promise<void>
}