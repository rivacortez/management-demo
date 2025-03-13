'use client'

import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TitleBarProps {
    orderId: number
    saving: boolean
    handleSave: () => void
}

export default function TitleBar({ orderId, saving, handleSave }: TitleBarProps) {
    return (
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-medium tracking-tight">Orden #{orderId}</h1>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pendiente
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Editar detalles y productos de esta orden de compra
                </p>
            </div>
            <div className="flex gap-3">
                <Link href={`/purchases/orders/${orderId}`}>
                    <Button variant="outline" size="sm" className="h-9 transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                </Link>
                <Button onClick={handleSave} disabled={saving} size="sm" className="h-9 transition-all">
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar
                </Button>
            </div>
        </div>
    )
}
