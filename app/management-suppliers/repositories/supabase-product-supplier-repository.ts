import { ProductSupplier, CreateProductSupplier, UpdateProductSupplier } from '../domain/interfaces/product-supplier'
import { supabase } from '@/app/config/supabase/client'

export interface ProductSupplierRepository {
  getProductSuppliers(): Promise<ProductSupplier[]>
  getProductSupplierById(productId: string, supplierId: string): Promise<ProductSupplier | null>
  createProductSupplier(productSupplier: CreateProductSupplier): Promise<ProductSupplier>
  updateProductSupplier(productId: string, supplierId: string, productSupplier: UpdateProductSupplier): Promise<ProductSupplier>
  deleteProductSupplier(productId: string, supplierId: string): Promise<void>
  getProductsBySupplierId(supplierId: string): Promise<ProductSupplier[]>
  getSuppliersByProductId(productId: string): Promise<ProductSupplier[]>
}

export class SupabaseProductSupplierRepository implements ProductSupplierRepository {
  async getProductSuppliers(): Promise<ProductSupplier[]> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .select('*')
      .order('supplier_id', { ascending: true })
    
    if (error) {
      throw new Error('Error al obtener relaciones producto-proveedor: ' + error.message)
    }

    return data || []
  }

  async getProductSupplierById(productId: string, supplierId: string): Promise<ProductSupplier | null> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .select('*')
      .eq('product_id', productId)
      .eq('supplier_id', supplierId)
      .single()

    if (error) {
      throw new Error('Error al obtener la relación producto-proveedor: ' + error.message)
    }
    
    return data
  }

  async createProductSupplier(productSupplier: CreateProductSupplier): Promise<ProductSupplier> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .insert([productSupplier])
      .select()

    if (error) {
      throw new Error('Error al crear la relación producto-proveedor: ' + error.message)
    }
    
    return data![0]
  }

  async updateProductSupplier(productId: string, supplierId: string, productSupplier: UpdateProductSupplier): Promise<ProductSupplier> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .update(productSupplier)
      .eq('product_id', productId)
      .eq('supplier_id', supplierId)
      .select()

    if (error) {
      throw new Error('Error al actualizar la relación producto-proveedor: ' + error.message)
    }
    
    return data![0]
  }

  async deleteProductSupplier(productId: string, supplierId: string): Promise<void> {
    const { error } = await supabase
      .from('product_suppliers')
      .delete()
      .eq('product_id', productId)
      .eq('supplier_id', supplierId)

    if (error) {
      throw new Error('Error al eliminar la relación producto-proveedor: ' + error.message)
    }
  }

  async getProductsBySupplierId(supplierId: string): Promise<ProductSupplier[]> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .select('*')
      .eq('supplier_id', supplierId)
    
    if (error) {
      throw new Error('Error al obtener productos por proveedor: ' + error.message)
    }
    
    return data || []
  }

  async getSuppliersByProductId(productId: string): Promise<ProductSupplier[]> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .select('*')
      .eq('product_id', productId)
    
    if (error) {
      throw new Error('Error al obtener proveedores por producto: ' + error.message)
    }
    
    return data || []
  }
}