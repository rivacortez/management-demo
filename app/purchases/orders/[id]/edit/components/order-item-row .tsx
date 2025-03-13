'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableRow, TableCell } from '@/components/ui/table'
import { formatPrice } from "@/lib/format-price";

interface OrderItem {
    id: string;
    productName: string;
    cost: number;
    quantity: number;
    total: number;
}

interface OrderItemRowProps {
    item: OrderItem;
    index: number;
    handleQuantityChange: (index: number, newQuantity: number) => void;
    removeItem: (index: number) => void;
}

export default function OrderItemRow({
                                         item,
                                         index,
                                         handleQuantityChange,
                                         removeItem
                                     }: OrderItemRowProps) {
    return (
        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
            <TableCell className="text-xs text-muted-foreground py-2">{item.id}</TableCell>
            <TableCell className="font-medium text-sm py-2">{item.productName}</TableCell>
            <TableCell className="text-sm py-2">{formatPrice(item.cost)}</TableCell>
            <TableCell className="w-24 py-2">
                <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                        handleQuantityChange(index, parseInt(e.target.value) || 0)
                    }
                    className="h-8 w-16 text-sm border-border/50"
                />
            </TableCell>
            <TableCell className="font-medium text-sm py-2">
                {formatPrice(item.total)}
            </TableCell>
            <TableCell className="text-right py-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </TableCell>
        </TableRow>
    )
}