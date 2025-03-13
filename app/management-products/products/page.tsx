'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useProducts } from '@/app/management-products/store/use-products'
import { ProductsTable } from './components/products-table'

export default function ProductsPage() {
  const { fetchProducts } = useProducts()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="container mx-auto py-10">
      <ProductsTable />
      <Toaster />
    </div>
  )
}