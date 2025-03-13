'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

// Repositorio y casos de uso
import { SupabaseSupplierRepository } from '../repositories/supabase-supplier-repository'
import {
  GetSuppliersUseCase,
  CreateSupplierUseCase,
  UpdateSupplierUseCase,
  DeleteSupplierUseCase,

} from '../use-cases/use-management-supplier'

// Interfaces
import { Supplier } from '../domain/interfaces/supplier'

// Componentes
import { SupplierCard } from '../components/supplier-card'
import { SupplierSearchFilter } from '../components/supplier-search-filter'
import { SuppliersTable } from '../components/suppliers-table'
import { SupplierAddDialog } from '../dialogs/supplier-add-dialog'
import { SupplierEditDialog } from '../dialogs/supplier-edit-dialog'
import { SupplierDeleteDialog } from '../dialogs/supplier-delete-dialog'
import { Button } from '@/components/ui/button'

// Inicializar repositorio y casos de uso fuera del componente para evitar recreaciones
const supplierRepository = new SupabaseSupplierRepository()
const getSuppliersUseCase = new GetSuppliersUseCase(supplierRepository)
const createSupplierUseCase = new CreateSupplierUseCase(supplierRepository)
const updateSupplierUseCase = new UpdateSupplierUseCase(supplierRepository)
const deleteSupplierUseCase = new DeleteSupplierUseCase(supplierRepository)


export default function ReportProductSupplierPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAddress, setFilterAddress] = useState('')
  const [filterPaymentTerms, setFilterPaymentTerms] = useState('')

  // Estados para controlar diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Estado para proveedor seleccionado y datos del formulario
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    payment_terms: '',
    notes: ''
  })

  // Cargar todos los proveedores una sola vez al montar el componente
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const data = await getSuppliersUseCase.execute()
        setSuppliers(data)
        setFilteredSuppliers(data)
      } catch (error) {
        console.error('Error loading suppliers:', error)
        toast.error('Failed to load suppliers')
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  const handleSearch = useCallback(() => {
    if (searchQuery.trim() === '') {
      setFilteredSuppliers(suppliers)
      return
    }

    const searchTermLower = searchQuery.toLowerCase()
    const results = suppliers.filter(supplier => 
      supplier.supplier_name.toLowerCase().includes(searchTermLower) ||
      supplier.contact_name.toLowerCase().includes(searchTermLower) ||
      supplier.contact_email.toLowerCase().includes(searchTermLower)
    )
    
    setFilteredSuppliers(results)
  }, [searchQuery, suppliers])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, handleSearch])

  const handleFilter = useCallback(() => {
    let results = [...suppliers]
    
    if (filterAddress) {
      const addressLower = filterAddress.toLowerCase()
      results = results.filter(supplier => 
        supplier.address.toLowerCase().includes(addressLower)
      )
    }
    
    if (filterPaymentTerms) {
      const termsLower = filterPaymentTerms.toLowerCase()
      results = results.filter(supplier => 
        supplier.payment_terms.toLowerCase().includes(termsLower)
      )
    }
    
    setFilteredSuppliers(results)
  }, [filterAddress, filterPaymentTerms, suppliers])

  useEffect(() => {
    handleFilter()
  }, [filterAddress, filterPaymentTerms, handleFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setFilterAddress('')
    setFilterPaymentTerms('')
    setFilteredSuppliers(suppliers)
  }

  const reloadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await getSuppliersUseCase.execute()
      setSuppliers(data)
      setFilteredSuppliers(data)
    } catch (error) {
      console.error('Error reloading suppliers:', error)
      toast.error('Failed to reload suppliers')
    } finally {
      setLoading(false)
    }
  }

  // Manejo de formularios (agregar/editar)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddDialog = () => {
    setFormData({
      supplier_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      payment_terms: '',
      notes: ''
    })
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_name: supplier.contact_name,
      contact_email: supplier.contact_email,
      contact_phone: supplier.contact_phone,
      address: supplier.address,
      payment_terms: supplier.payment_terms,
      notes: supplier.notes
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (supplier: Supplier) => {
    setCurrentSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  // Acciones CRUD
  const handleAddSupplier = async () => {
    try {
      await createSupplierUseCase.execute(formData)
      setIsAddDialogOpen(false)
      toast.success('Supplier added successfully')
      reloadSuppliers()
    } catch (error) {
      console.error('Error adding supplier:', error)
      toast.error('Failed to add supplier')
    }
  }

  const handleEditSupplier = async () => {
    if (!currentSupplier) return
    try {
      await updateSupplierUseCase.execute(currentSupplier.id, formData)
      setIsEditDialogOpen(false)
      toast.success('Supplier updated successfully')
      reloadSuppliers()
    } catch (error) {
      console.error('Error updating supplier:', error)
      toast.error('Failed to update supplier')
    }
  }

  const handleDeleteSupplier = async () => {
    if (!currentSupplier) return
    try {
      await deleteSupplierUseCase.execute(currentSupplier.id)
      setIsDeleteDialogOpen(false)
      toast.success('Supplier deleted successfully')
      reloadSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Failed to delete supplier')
    }
  }

  // Navegar a detalles
  const viewSupplierDetails = (id: string) => {
    router.push(`/management-suppliers/supplier-list/${id}`)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <SupplierCard 
        title="Proveedores" 
        description="Gestión de proveedores y condiciones comerciales">

        <div className="flex justify-end mb-4">
          <Button 
            onClick={openAddDialog} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Proveedor
          </Button>
        </div>

        {/* Componente de búsqueda y filtros */}
        <SupplierSearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterAddress={filterAddress}
          setFilterAddress={setFilterAddress}
          filterPaymentTerms={filterPaymentTerms}
          setFilterPaymentTerms={setFilterPaymentTerms}
          handleSearch={() => {}}
          handleFilter={() => {}}
          resetFilters={resetFilters}
        />

        {/* Tabla de proveedores */}
        <SuppliersTable
          suppliers={filteredSuppliers}
          loading={loading}
          viewSupplierDetails={viewSupplierDetails}
          openEditDialog={openEditDialog}
          openDeleteDialog={openDeleteDialog}
        />
      </SupplierCard>

      {/* Diálogos para Agregar, Editar y Eliminar */}
      <SupplierAddDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleAddSupplier={handleAddSupplier}
      />
      <SupplierEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleEditSupplier={handleEditSupplier}
      />
      <SupplierDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentSupplier={currentSupplier}
        handleDeleteSupplier={handleDeleteSupplier}
      />
    </div>
  )
}