export interface Category {
    id: string
    category_name: string
    category_slug: string
    main_image: string
    status: boolean
    created_at: Date
    updated_at: Date
  }
  
  export type CreateCategory = Omit<Category, 'id' | 'created_at' | 'updated_at'>
  export type UpdateCategory = Partial<CreateCategory>