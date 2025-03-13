import { ProductSupplier } from '../domain/interfaces/product-supplier'
import { Supplier, CreateSupplier, UpdateSupplier } from '../domain/interfaces/supplier'
import { SupplierRepository } from '../domain/repositories/supplier-repository'

export class BaseSupplierUseCase {
  constructor(protected supplierRepository: SupplierRepository) {}

  protected getSuppliers(): Promise<Supplier[]> {
    return this.supplierRepository.getSuppliers()
  }

  protected getSupplierById(id: string): Promise<Supplier | null> {
    return this.supplierRepository.getSupplierById(id)
  }

  protected createSupplier(supplier: CreateSupplier): Promise<Supplier> {
    return this.supplierRepository.createSupplier(supplier)
  }

  protected updateSupplier(id: string, supplier: UpdateSupplier): Promise<Supplier> {
    return this.supplierRepository.updateSupplier(id, supplier)
  }

  protected deleteSupplier(id: string): Promise<void> {
    return this.supplierRepository.deleteSupplier(id)
  }

  protected getSuppliedProductsBySupplier(supplierId: string): Promise<ProductSupplier[]> {
    return this.supplierRepository.getSuppliedProductsBySupplier(supplierId)
  }
}


export class GetSuppliersUseCase extends BaseSupplierUseCase {
  async execute(): Promise<Supplier[]> {
    return this.getSuppliers()
  }
}

export class GetSupplierByIdUseCase extends BaseSupplierUseCase {
  async execute(id: string): Promise<Supplier | null> {
    return this.getSupplierById(id)
  }
}

export class GetSuppliedProductsUseCase extends BaseSupplierUseCase {
  async execute(supplierId: string): Promise<ProductSupplier[]> {
    return this.getSuppliedProductsBySupplier(supplierId)
  }
}

export class CreateSupplierUseCase extends BaseSupplierUseCase {
  async execute(supplier: CreateSupplier): Promise<Supplier> {
    return this.createSupplier(supplier)
  }
}

export class UpdateSupplierUseCase extends BaseSupplierUseCase {
  async execute(id: string, supplier: UpdateSupplier): Promise<Supplier> {
    return this.updateSupplier(id, supplier)
  }
}

export class DeleteSupplierUseCase extends BaseSupplierUseCase {
  async execute(id: string): Promise<void> {
    return this.deleteSupplier(id)
  }
}
