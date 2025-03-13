'use client'

import { Toaster } from 'sonner'
import { CategoriesTable } from './components/categories-table'
import { useCategories } from '@/app/management-products/store/use-categories'
import { useEffect } from 'react'
import { Layers, Package, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function CategoriesPage() {
  const { fetchCategories, isLoading, categories } = useCategories()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 pb-2 border-b">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Gestión de Categorías</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Administra las categorías de productos de tu inventario</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{categories.length} categorías</span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <CategoriesTable />
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  )
}