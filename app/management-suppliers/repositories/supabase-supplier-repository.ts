import { Supplier, CreateSupplier, UpdateSupplier } from '../domain/interfaces/supplier'
import { ProductSupplier } from '../domain/interfaces/product-supplier'
import { SupplierRepository } from '../domain/repositories/supplier-repository'
import { supabase } from '@/app/config/supabase/client'

export class SupabaseSupplierRepository implements SupplierRepository {
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error('Error al obtener proveedores: ' + error.message)
    }

    return data || []
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error('Error al obtener el proveedor: ' + error.message)
    }
    
    return data
  }

  async createSupplier(supplier: CreateSupplier): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()

    if (error) {
      throw new Error('Error al crear el proveedor: ' + error.message)
    }
    
    return data![0]
  }

  async updateSupplier(id: string, supplier: UpdateSupplier): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()

    if (error) {
      throw new Error('Error al actualizar el proveedor: ' + error.message)
    }
    
    return data![0]
  }

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error('Error al eliminar el proveedor: ' + error.message)
    }
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .or(`supplier_name.ilike.%${query}%,contact_name.ilike.%${query}%,address.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error('Error al buscar proveedores: ' + error.message)
    }
    
    return data || []
  }

  async filterSuppliers(filters: Partial<Supplier>): Promise<Supplier[]> {
    let query = supabase
      .from('suppliers')
      .select('*')
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          query = query.ilike(key, `%${value}%`)
        } else {
          query = query.eq(key, value)
        }
      }
    })
    
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      throw new Error('Error al filtrar proveedores: ' + error.message)
    }
    
    return data || []
  }

  async getSuppliedProductsBySupplier(supplierId: string): Promise<ProductSupplier[]> {
    const { data, error } = await supabase
      .from('product_suppliers')
      .select('*')
      .eq('supplier_id', supplierId)
    
    if (error) {
      throw new Error('Error al obtener productos del proveedor: ' + error.message)
    }
    
    return data || []
  }
}
