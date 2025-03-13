import { PurchaseOrder } from '../domain/interfaces/purchase-orders'
import { PurchaseOrderRepository } from '../domain/repositories/purchase-order-repository'

export class BasePurchaseOrderUseCase {
  constructor(protected purchaseOrderRepository: PurchaseOrderRepository) {}

  protected getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.getPurchaseOrders()
  }

  protected getPurchaseOrderById(id: number): Promise<PurchaseOrder | null> {
    return this.purchaseOrderRepository.getPurchaseOrderById(id)
  }

  protected createPurchaseOrder(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.createPurchaseOrder(purchaseOrder)
  }

  protected updatePurchaseOrder(id: number, purchaseOrder: Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.updatePurchaseOrder(id, purchaseOrder)
  }


  protected cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return this.purchaseOrderRepository.cancelPurchaseOrder(id)
  }

}


export class GetPurchaseOrdersUseCase extends BasePurchaseOrderUseCase {
  async execute(): Promise<PurchaseOrder[]> {
    return this.getPurchaseOrders()
  }
}

export class GetPurchaseOrderByIdUseCase extends BasePurchaseOrderUseCase {
  async execute(id: number): Promise<PurchaseOrder | null> {
    return this.getPurchaseOrderById(id)
  }
}

export class CreatePurchaseOrderUseCase extends BasePurchaseOrderUseCase {
  async execute(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    return this.createPurchaseOrder(purchaseOrder)
  }
}

export class UpdatePurchaseOrderUseCase extends BasePurchaseOrderUseCase {
  async execute(id: number, purchaseOrder: Partial<Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PurchaseOrder> {
    return this.updatePurchaseOrder(id, purchaseOrder)
  }
}



export class CancelPurchaseOrderUseCase extends BasePurchaseOrderUseCase {
  async execute(id: number): Promise<PurchaseOrder> {
    return this.cancelPurchaseOrder(id)
  }
}

