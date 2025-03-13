'use client'

import { Plus, MinusCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { formatPrice } from "@/lib/format-price"
import { useState } from 'react'

interface ProductOption {
    product_id: string
    productName: string
    cost_price: number
}

interface AddProductDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    availableProducts: ProductOption[]
    selectedProductId: string
    setSelectedProductId: (value: string) => void
    newProductQuantity: number
    setNewProductQuantity: (value: number) => void
    productCost: number
    setProductCost: (value: number) => void
    handleAddProductToOrder: () => void
}

export default function AddProductDialog({
                                             isOpen,
                                             onOpenChange,
                                             availableProducts,
                                             selectedProductId,
                                             setSelectedProductId,
                                             newProductQuantity,
                                             setNewProductQuantity,
                                             productCost,
                                             setProductCost,
                                             handleAddProductToOrder
                                         }: AddProductDialogProps) {
    const [quantityError, setQuantityError] = useState<string>('')

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setQuantityError('');
        }
        onOpenChange(open);
    }

    const incrementQuantity = () => {
        setQuantityError('');
        setNewProductQuantity(newProductQuantity + 1);
    }

    const decrementQuantity = () => {
        setQuantityError('');
        if (newProductQuantity > 1) {
            setNewProductQuantity(newProductQuantity - 1);
        }
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setQuantityError(value < 1 ? 'La cantidad debe ser mayor a 0' : '');
        setNewProductQuantity(Math.max(1, value));
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md max-w-[92vw]">
                <DialogHeader>
                    <DialogTitle>Agregar Producto</DialogTitle>
                    <DialogDescription>
                        Seleccione un producto del proveedor para agregarlo a la orden
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="product">Producto</Label>
                        <Select
                            value={selectedProductId}
                            onValueChange={(value) => {
                                setSelectedProductId(value);
                                const product = availableProducts.find(p => p.product_id === value);
                                if (product) {
                                    setProductCost(product.cost_price);
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-[300px]">
                                {availableProducts.map(product => (
                                    <SelectItem key={product.product_id} value={product.product_id}>
                                        {product.productName} - {formatPrice(product.cost_price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <div className="flex items-center">
                            <div className="flex items-center relative bg-gray-50 rounded-md border border-border/50 w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-l-md p-0 hover:bg-gray-100"
                                    onClick={decrementQuantity}
                                >
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    value={newProductQuantity}
                                    onChange={handleQuantityChange}
                                    className="h-9 flex-1 text-center border-0 bg-transparent"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-r-md p-0 hover:bg-gray-100"
                                    onClick={incrementQuantity}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {quantityError && (
                            <p className="text-xs text-red-500 mt-1">{quantityError}</p>
                        )}
                    </div>
                    {selectedProductId && (
                        <div className="pt-2">
                            <p className="text-sm font-medium">
                                Total: {formatPrice(productCost * newProductQuantity)}
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={!selectedProductId || newProductQuantity < 1}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddProductToOrder();
                        }}
                        className="w-full sm:w-auto"
                    >
                        Agregar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}