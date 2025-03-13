import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '../../config/supabase/client';
import { Category, CreateCategory, UpdateCategory } from '../domain/interfaces/categories';

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  isFetched: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: CreateCategory) => Promise<void>;
  updateCategory: (id: string, category: UpdateCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategories = create<CategoryStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  isFetched: false,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ categories: data || [], isFetched: true });
    } catch (err: unknown) {
      console.error('Error in fetchCategories:', err);
      set({ error: 'Error al cargar las categorías' });
      toast.error('Error al cargar las categorías');
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select();
      if (error) throw error;
      set((state) => ({
        categories: data ? [data[0], ...state.categories] : state.categories,
      }));
      toast.success('Categoría agregada exitosamente');
    } catch (err: unknown) {
      console.error('Error in addCategory:', err);
      set({ error: 'Error al agregar la categoría' });
      toast.error('Error al agregar la categoría');
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id, category) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select();
      if (error) throw error;
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...category } : c
        ),
      }));
      toast.success('Categoría actualizada exitosamente');
    } catch (err: unknown) {
      console.error('Error in updateCategory:', err);
      set({ error: 'Error al actualizar la categoría' });
      toast.error('Error al actualizar la categoría');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Optimistic update: eliminamos la categoría localmente de inmediato
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .select();
      if (error || !data?.length) {
        const errorMessage = error?.message || 'No se encontró la categoría a eliminar';
        console.error('Error in deleteCategory:', errorMessage);
        throw new Error(errorMessage);
      }
      toast.success('Categoría eliminada');
    } catch (err: unknown) {
      console.error('Error in deleteCategory:', err);
      set({ error: err instanceof Error ? err.message : 'Error desconocido' });
      toast.error('Error al eliminar la categoría');
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
