import { Product } from '../../management-products/domain/interfaces/product'
import { supabase } from '@/app/config/supabase/client'

export class SupabaseProductRepository {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, cover_image, created_at, updated_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error('Error al obtener productos: ' + error.message)
    }

    const transformedData = data?.map(product => ({
      ...product,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    })) || []

    return transformedData
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock, cover_image, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error('Error al obtener el producto: ' + error.message)
    }
    
    if (data) {
      return {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    }
    
    return null
  }
}