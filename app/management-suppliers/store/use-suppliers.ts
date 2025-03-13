import { create } from 'zustand'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase/client'
import { Supplier, CreateSupplier, UpdateSupplier } from '../domain/interfaces/supplier'

interface SupplierStore {
  suppliers: Supplier[]
  isLoading: boolean
  error: string | null
  fetchSuppliers: () => Promise<void>
  addSupplier: (supplier: CreateSupplier) => Promise<void>
  updateSupplier: (id: string, supplier: UpdateSupplier) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
}

export const useSuppliers = create<SupplierStore>((set) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al obtener proveedores:', error)
        throw error
      }

      set({ suppliers: data || [] })
    } catch (err) {
      console.error('Error en fetchSuppliers:', err)
      set({ error: 'Error al cargar los proveedores' })
      toast.error('Error al cargar los proveedores')
    } finally {
      set({ isLoading: false })
    }
  },

  addSupplier: async (supplier) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()

      if (error) {
        console.error('Error al crear proveedor:', error)
        throw error
      }

      set((state) => ({
        suppliers: data ? [data[0], ...state.suppliers] : [...state.suppliers],
        isLoading: false
      }))
      toast.success('Proveedor agregado exitosamente')
    } catch (err) {
      console.error('Error en addSupplier:', err)
      set({ error: 'Error al agregar el proveedor' })
      toast.error('Error al agregar el proveedor')
    } finally {
      set({ isLoading: false })
    }
  },

  updateSupplier: async (id, supplier) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Error al actualizar proveedor:', error)
        throw error
      }

      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === id ? { ...s, ...supplier } : s
        ),
      }))
      toast.success('Proveedor actualizado exitosamente')
    } catch (err) {
      console.error('Error en updateSupplier:', err)
      set({ error: 'Error al actualizar el proveedor' })
      toast.error('Error al actualizar el proveedor')
    } finally {
      set({ isLoading: false })
    }
  },

  deleteSupplier: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .select()

      if (error || !data?.length) {
        const errorMessage = error?.message || 'No se encontró el proveedor a eliminar'
        console.error('Supabase delete error:', errorMessage)
        throw new Error(errorMessage)
      }

      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
      }))

      await useSuppliers.getState().fetchSuppliers()

    } catch (err) {
      console.error('Delete error:', err)
      set({ error: err instanceof Error ? err.message : 'Error desconocido' })
      toast.error('Error permanente al eliminar - Verificar permisos')
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
}))
