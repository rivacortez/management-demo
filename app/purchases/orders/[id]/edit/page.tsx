'use client'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import TitleBar from '@/app/purchases/orders/[id]/edit/components/title-bar'
import { Separator } from '@/components/ui/separator'
import OrderDetailsForm from '@/app/purchases/orders/[id]/edit/components/order-details-form'
import OrderItemsTable from '@/app/purchases/orders/[id]/edit/components/order-items-table'
import AddProductDialog from '@/app/purchases/orders/[id]/edit/dialogs/add-product-dialog'
import OrderSummaryFooter from '@/app/purchases/orders/[id]/edit/components/order-summary-footer'
import { usePurchaseEditOrder } from "@/app/purchases/orders/[id]/edit/use-cases/use-purchase-edit-order";

// Create adapter types to fix type mismatches
interface OrderItemAdapter {
    id: string;  // Convert number to string for component compatibility
    productId: string;
    productName: string;
    cost: number;
    quantity: number;
    total: number;
    isNew?: boolean;
}

// Modified to match ProductOption interface requirements
interface ProductOption {
    product_id: string;
    cost_price: number;
    productName: string; // Now required, not optional
}

export default function EditPurchaseOrderPage() {
    const params = useParams()
    const orderId = Number(params.id)

    const {
        loading,
        saving,
        suppliers,
        orderData,
        orderItems,
        isAddProductDialogOpen,
        availableProducts,
        selectedProductId,
        newProductQuantity,
        productCost,
        loadingProducts,
        handleAddProductClick,
        handleAddProductToOrder,
        handleInputChange,
        handleQuantityChange,
        removeItem,
        handleSave,
        setIsAddProductDialogOpen,
        setSelectedProductId,
        setNewProductQuantity,
        setProductCost
    } = usePurchaseEditOrder(orderId)

    // Adapt order items to match component expectations
    const adaptedOrderItems: OrderItemAdapter[] = orderItems.map(item => ({
        ...item,
        id: String(item.id), // Convert number to string
        productId: String(item.productId),
        productName: item.productName || `Producto #${item.productId}`
    }));

    // Adapt available products to match ProductOption interface
    const adaptedAvailableProducts: ProductOption[] = availableProducts.map(product => ({
        product_id: product.product_id || '',
        cost_price: product.cost_price || 0,
        productName: product.productName || `Producto #${product.product_id || ''}`
    }));

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Cargando datos de la orden...</span>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
            <TitleBar orderId={orderId} saving={saving} handleSave={handleSave} />
            <Separator className="my-6" />
            <OrderDetailsForm
                orderData={orderData}
                suppliers={suppliers}
                handleInputChange={handleInputChange}
            />
            <OrderItemsTable
                orderItems={adaptedOrderItems}
                handleQuantityChange={handleQuantityChange}
                removeItem={removeItem}
                handleAddProductClick={handleAddProductClick}
                loadingProducts={loadingProducts}
                isAddProductDialogOpen={isAddProductDialogOpen}
                setIsAddProductDialogOpen={setIsAddProductDialogOpen}
                availableProducts={adaptedAvailableProducts}
                selectedProductId={selectedProductId}
                setSelectedProductId={setSelectedProductId}
                newProductQuantity={newProductQuantity}
                setNewProductQuantity={setNewProductQuantity}
                productCost={productCost}
                setProductCost={setProductCost}
                handleAddProductToOrder={handleAddProductToOrder}
            />
            <AddProductDialog
                isOpen={isAddProductDialogOpen}
                onOpenChange={setIsAddProductDialogOpen}
                availableProducts={adaptedAvailableProducts}
                selectedProductId={selectedProductId}
                setSelectedProductId={setSelectedProductId}
                newProductQuantity={newProductQuantity}
                setNewProductQuantity={setNewProductQuantity}
                productCost={productCost}
                setProductCost={setProductCost}
                handleAddProductToOrder={handleAddProductToOrder}
            />
            <OrderSummaryFooter
                orderId={orderId}
                totalAmount={orderData.totalAmount}
                handleSave={handleSave}
                saving={saving}
            />
        </div>
    )
}