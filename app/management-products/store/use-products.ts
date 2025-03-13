import { create } from 'zustand'
import { toast } from 'sonner'
import { supabase } from '../../config/supabase/client'
import { CreateProduct, Product, UpdateProduct } from '../domain/interfaces/product'

interface ProductStore {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (product: CreateProduct) => Promise<void>
  updateProduct: (id: string, product: UpdateProduct) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}




export const useProducts = create<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al obtener productos:', error)
        throw error
      }

      set({ products: data || [] })
    } catch (err) {
      console.error('Error en fetchProducts:', err)
      set({ error: 'Error al cargar los productos' })
      toast.error('Error al cargar los productos')
    } finally {
      set({ isLoading: false })
    }
  },

  addProduct: async (product) => {
    set({ isLoading: true, error: null }) 
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (error) {
        console.error('Error al crear producto:', error)
        throw error
      }

      set((state) => ({
        products: data ? [data[0], ...state.products] : [...state.products],
        isLoading: false 
      }))
      toast.success('Producto agregado exitosamente')
    } catch (err) {
      console.error('Error en addProduct:', err)
      set({ error: 'Error al agregar el producto' })
      toast.error('Error al agregar el producto')
    } finally {
      set({ isLoading: false })
    }
  },

  updateProduct: async (id, product) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        
      if (error) {
        console.error('Error al actualizar producto:', error)
        throw error
      }

      set((state) => ({
        products: state.products.map((productss) =>
            productss.id === id ? { ...productss, ...productss } : productss
        ),
      }))
      toast.success('Producto actualizado exitosamente')
    } catch (err) {
      console.error('Error en updateProduct:', err)
      set({ error: 'Error al actualizar el producto' })
      toast.error('Error al actualizar el producto')
    } finally {
      set({ isLoading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error || !data?.length) {
        const errorMessage = error?.message || 'No se encontró el producto a eliminar';
        console.error('Supabase delete error:', errorMessage);
        throw new Error(errorMessage);
      }

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
      
      await useProducts.getState().fetchProducts();
      
    } catch (err) {
      console.error('Delete error:', err);
      set({ error: err instanceof Error ? err.message : 'Error desconocido' });
      toast.error('Error permanente al eliminar - Verificar permisos');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
})) 