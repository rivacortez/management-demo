'use client'

import { Plus, Loader2, Trash2, MinusCircle } from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'

import OrderItemRow from "@/app/purchases/orders/[id]/edit/components/order-item-row ";
import { formatPrice } from "@/lib/format-price"

interface OrderItem {
    id: string;
    productName: string;
    cost: number;
    quantity: number;
    total: number;
}

interface AvailableProduct {
    product_id: string;
    productName: string;
    cost_price: number;
}

interface OrderItemsTableProps {
    orderItems: OrderItem[];
    handleQuantityChange: (index: number, newQuantity: number) => void;
    removeItem: (index: number) => void;
    handleAddProductClick: () => void;
    loadingProducts: boolean;
    isAddProductDialogOpen: boolean;
    setIsAddProductDialogOpen: (open: boolean) => void;
    availableProducts: AvailableProduct[];
    selectedProductId: string;
    setSelectedProductId: (value: string) => void;
    newProductQuantity: number;
    setNewProductQuantity: (value: number) => void;
    productCost: number;
    setProductCost: (value: number) => void;
    handleAddProductToOrder: () => void;
}

export default function OrderItemsTable({
                                            orderItems,
                                            handleQuantityChange,
                                            removeItem,
                                            handleAddProductClick,
                                            loadingProducts,
                                            isAddProductDialogOpen,
                                            setIsAddProductDialogOpen,
                                            availableProducts,
                                            selectedProductId,
                                            setSelectedProductId,
                                            newProductQuantity,
                                            setNewProductQuantity,
                                            productCost,
                                            setProductCost,
                                            handleAddProductToOrder
                                        }: OrderItemsTableProps) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
                <div>
                    <CardTitle className="text-base font-medium">Productos</CardTitle>
                    <CardDescription className="text-xs">
                        Productos incluidos en esta orden de compra
                    </CardDescription>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 min-w-[90px] transition-all hover:bg-primary/5 border-border/50"
                    onClick={handleAddProductClick}
                    disabled={loadingProducts}
                >
                    {loadingProducts ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                        <Plus className="h-3.5 w-3.5 mr-1" />
                    )}
                    Agregar
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="rounded-md border border-border/50 overflow-hidden">
                    {/* Mobile card view for small screens */}
                    <div className="sm:hidden space-y-1">
                        {orderItems.length > 0 ? (
                            orderItems.map((item, index) => (
                                <div key={item.id} className="p-3 border-b last:border-b-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">ID: {item.id}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Costo: {formatPrice(item.cost)}</p>
                                            <p className="text-sm font-medium mt-0.5">Total: {formatPrice(item.total)}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex items-center relative bg-gray-50 rounded-md border border-border/50">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-l-md p-0 hover:bg-gray-100"
                                                    onClick={() => handleQuantityChange(index, Math.max(1, (item.quantity || 0) - 1))}
                                                >
                                                    <MinusCircle className="h-3.5 w-3.5" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                                    className="h-8 w-12 text-sm text-center border-0 bg-transparent"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-r-md p-0 hover:bg-gray-100"
                                                    onClick={() => handleQuantityChange(index, (item.quantity || 0) + 1)}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No hay productos en esta orden
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-9 text-xs font-medium">ID</TableHead>
                                    <TableHead className="h-9 text-xs font-medium">Producto</TableHead>
                                    <TableHead className="h-9 text-xs font-medium">Costo</TableHead>
                                    <TableHead className="h-9 text-xs font-medium">Cantidad</TableHead>
                                    <TableHead className="h-9 text-xs font-medium">Total</TableHead>
                                    <TableHead className="h-9 text-xs font-medium text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.length > 0 ? (
                                    orderItems.map((item, index) => (
                                        <OrderItemRow
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            handleQuantityChange={handleQuantityChange}
                                            removeItem={removeItem}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                                            No hay productos en esta orden
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>

            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
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
                                    setSelectedProductId(value)
                                    const product = availableProducts.find(p => p.product_id === value)
                                    if (product) {
                                        setProductCost(product.cost_price)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar producto" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="max-h-[300px]">
                                    {availableProducts.map(product => (
                                        product.product_id ? (
                                            <SelectItem key={product.product_id} value={product.product_id}>
                                                {product.productName} - {formatPrice(product.cost_price)}
                                            </SelectItem>
                                        ) : null
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
                                        onClick={() => setNewProductQuantity(Math.max(1, newProductQuantity - 1))}
                                    >
                                        <MinusCircle className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={newProductQuantity}
                                        onChange={(e) => setNewProductQuantity(parseInt(e.target.value) || 1)}
                                        className="h-9 flex-1 text-center border-0 bg-transparent"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-r-md p-0 hover:bg-gray-100"
                                        onClick={() => setNewProductQuantity(newProductQuantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {selectedProductId && (
                            <div className="pt-2">
                                <p className="text-sm font-medium">
                                    Total: {formatPrice(productCost * newProductQuantity)}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddProductDialogOpen(false)}
                            className="sm:order-1 order-2 w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            disabled={!selectedProductId}
                            onClick={handleAddProductToOrder}
                            className="sm:order-2 order-1 w-full sm:w-auto"
                        >
                            Agregar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}