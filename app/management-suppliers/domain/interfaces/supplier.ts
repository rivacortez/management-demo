export interface Supplier {
  id: string
  supplier_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  address: string
  payment_terms: string
  notes: string
  created_at: Date
  updated_at: Date
}

export type CreateSupplier = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
export type UpdateSupplier = Partial<CreateSupplier>