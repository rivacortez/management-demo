'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {formatPrice} from "@/lib/format-price";

interface OrderSummaryFooterProps {
    orderId: number
    totalAmount: number
    handleSave: () => void
    saving: boolean
}

export default function OrderSummaryFooter({
                                               orderId,
                                               totalAmount,

                                               handleSave,
                                               saving
                                           }: OrderSummaryFooterProps) {
    return (
        <div className="sm:hidden mt-6 pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-xl font-semibold">{formatPrice(totalAmount)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Link href={`/purchases/orders/${orderId}`} className="w-full">
                    <Button variant="outline" className="w-full">
                        Cancelar
                    </Button>
                </Link>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Guardar
                </Button>
            </div>
        </div>
    )
}
