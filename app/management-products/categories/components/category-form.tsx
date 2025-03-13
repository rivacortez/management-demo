"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Category, CreateCategory } from '@/app/management-products/domain/interfaces/categories';
import Image from 'next/image';

const formSchema = z.object({
  category_name: z.string().min(1, 'El nombre de la categoría es requerido'),
  category_slug: z
    .string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  main_image: z.string().min(1, 'La imagen es requerida'),
  status: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: CreateCategory) => Promise<void>;
  isSubmitting?: boolean;
  onSuccess?: () => void;
}

export function CategoryForm({
  category,
  onSubmit,
  isSubmitting = false,
  onSuccess,
}: CategoryFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(isSubmitting);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: '',
      category_slug: '',
      main_image: '',
      status: true,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        category_name: category.category_name,
        category_slug: category.category_slug,
        main_image: category.main_image,
        status: category.status,
      });
      setImagePreview(category.main_image);
    }
  }, [category, form]);

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'category_name') {
        const nameValue = values.category_name || '';
        const slug = nameValue
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        form.setValue('category_slug', slug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);
  

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      form.setValue('main_image', imageUrl, { shouldValidate: true });
    }
  }, [form]);

  const onFormSubmit = useCallback(async (values: FormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      if (!category) {
        form.reset();
        setImagePreview(null);
      }
      onSuccess?.();
      toast.success(category ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente');
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      toast.error('Error al guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, category, form, onSuccess]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la categoría</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre de la categoría" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <FormField
          control={form.control}
          name="main_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-2"
                  />
                  <Input placeholder="URL de la imagen" {...field} />
                </div>
              </FormControl>
              <FormMessage />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <div className="h-32 w-32 overflow-hidden rounded-md">
                    <Image
                      src={imagePreview}
                      alt="Vista previa"
                      className="object-cover"
                      width={128}
                      height={128}
                    />
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Activo</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Guardando...' : category ? 'Actualizar categoría' : 'Crear categoría'}
        </Button>
      </form>
    </Form>
  );
}
