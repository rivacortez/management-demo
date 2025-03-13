'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import DatePicker from '@/components/ui/date-picker'
import { formatPrice } from "@/lib/format-price";

interface Supplier {
    id: string
    supplier_name: string
}

interface OrderDetailsFormProps {
    orderData: {
        supplierId: string
        orderDate: Date
        expectedDate: Date
        status: string
        totalAmount: number
    }
    suppliers: Supplier[]
    handleInputChange: (field: string, value: string | Date | number) => void
}

export default function OrderDetailsForm({
                                             orderData,
                                             suppliers,
                                             handleInputChange,
                                         }: OrderDetailsFormProps) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Detalles de la Orden</CardTitle>
                <CardDescription className="text-xs">
                    Información básica de la orden de compra
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Supplier selection */}
                    <div className="space-y-2">
                        <Label htmlFor="supplier" className="text-xs font-medium text-muted-foreground">
                            Proveedor
                        </Label>
                        <Select
                            value={orderData.supplierId}
                            onValueChange={(value) => handleInputChange('supplierId', value)}
                            disabled={true}
                        >
                            <SelectTrigger className="h-9 border-border/50 transition-all">
                                <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent className="border-border/60 shadow-md">
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                        {supplier.supplier_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Order date */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Fecha de Orden
                        </Label>
                        <DatePicker
                            date={orderData.orderDate}
                            setDate={(date) => handleInputChange('orderDate', date || new Date())}
                            disabled={true}
                        />
                    </div>

                    {/* Expected date */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Fecha Esperada de Entrega
                        </Label>
                        <DatePicker
                            date={orderData.expectedDate}
                            setDate={(date) => handleInputChange('expectedDate', date || new Date())}
                        />
                    </div>

                    {/* Total amount (read-only) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Total de Orden
                        </Label>
                        <Input
                            value={formatPrice(orderData.totalAmount)}
                            readOnly
                            disabled
                            className="h-9 font-medium bg-muted/30 border-border/50"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}