'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Truck } from 'lucide-react'

interface SupplierCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function SupplierCard({ title, description, children }: SupplierCardProps) {
  return (
    <Card className="border-t-4 border-t-primary shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
