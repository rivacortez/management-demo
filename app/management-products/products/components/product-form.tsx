'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { useProducts } from '@/app/management-products/store/use-products'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().default(''),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor a 0'),
  cover_image: z.array(z.string().url('URL inválida')).default([]),
  //quantity:z.number().min(0, 'El precio debe ser mayor a 0'),
  //barcode: z.string().min(1, 'El código de barras es requerido'),
  //isPopular: z.boolean().default(false),
  //slug: z.string().min(1, 'El slug es requerido')
})

type FormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  onSuccess?: () => void
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { addProduct } = useProducts()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      cover_image: [],
      //quantity:0
      //barcode: '',
      //isPopular: false,
     // slug: ''
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      await addProduct(values)
      form.reset()
      onSuccess?.()
      toast.success('Producto agregado exitosamente')
    } catch (err) {
      console.error('Error al agregar producto:', err)
      toast.error('Error al agregar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URLs de las Imágenes</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg" 
                  value={field.value.join(', ')}
                  onChange={(e) => field.onChange(e.target.value.split(',').map(url => url.trim()).filter(Boolean))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
 {/**
<FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
              */}

      {/*
       * 
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de Barras</FormLabel>
              <FormControl>
                <Input placeholder="Código de barras del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
                */}
 {/*
  * 
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="slug-del-producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
   {/* 
        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Popular</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
          */}
        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Stock</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar Producto'}
        </Button>
      </form>
    </Form>
  )
}