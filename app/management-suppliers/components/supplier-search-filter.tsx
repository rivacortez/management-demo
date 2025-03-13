'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, CreditCard, Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SupplierSearchFilterProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  filterAddress: string
  setFilterAddress: (value: string) => void
  filterPaymentTerms: string
  setFilterPaymentTerms: (value: string) => void
  handleSearch: () => void
  handleFilter: () => void
  resetFilters: () => void
}

export function SupplierSearchFilter({
  searchQuery,
  setSearchQuery,
  filterAddress,
  setFilterAddress,
  filterPaymentTerms,
  setFilterPaymentTerms,
  handleSearch,
  handleFilter,
  resetFilters,
}: SupplierSearchFilterProps) {

  const activeFiltersCount = [
    searchQuery,
    filterAddress,
    filterPaymentTerms
  ].filter(Boolean).length

  return (
    <div className="bg-card rounded-lg p-4 border shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-1 md:col-span-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 w-full"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => {
                    setSearchQuery('')
                    handleSearch()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por ubicación"
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por condiciones de pago"
            value={filterPaymentTerms}
            onChange={(e) => setFilterPaymentTerms(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleFilter} 
          className="w-full sm:w-auto sm:mr-2 border-primary/20 hover:bg-primary/5"
        >
          <Filter className="h-4 w-4 mr-2 text-primary" />
          Aplicar Filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30" variant="secondary">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        <Button 
          variant="ghost" 
          onClick={resetFilters} 
          className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
          disabled={activeFiltersCount === 0}
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>
      </div>
    </div>
  )
}
