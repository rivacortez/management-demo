"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";

interface CreateCategory {
  category_name: string
  category_slug: string
  main_image: string
  status: boolean
}

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CreateCategory;
  onInputChange: (field: keyof CreateCategory, value: string | number | boolean) => void;
  onSave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (imageUrl: string) => void;
}

export function AddCategoryDialog({
                                    isOpen,
                                    onClose,
                                    category,
                                    onInputChange,
                                    onSave,
                                    onFileChange,
                                    onImageDelete,
                                  }: AddCategoryDialogProps) {
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setIsConverting(false);
            return;
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(async (blob) => {
            if (blob) {
              const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
                type: 'image/webp',
                lastModified: new Date().getTime()
              });

              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(webpFile);

              const webpEvent = {
                ...e,
                target: {
                  ...e.target,
                  files: dataTransfer.files
                }
              } as React.ChangeEvent<HTMLInputElement>;

              onFileChange(webpEvent);
            }
            setIsConverting(false);
          }, "image/webp", 0.8);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error converting image:", error);
      setIsConverting(false);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Categoría</DialogTitle>
            <DialogDescription>Completa los detalles de la nueva categoría.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Nombre
              </Label>
              <Input
                  id="new-name"
                  value={category.category_name}
                  onChange={(e) => onInputChange("category_name", e.target.value)}
                  className="col-span-3"
              />
            </div>
            {/* Slug */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-slug" className="text-right">
                Slug
              </Label>
              <Input
                  id="new-slug"
                  value={category.category_slug}
                  onChange={(e) => onInputChange("category_slug", e.target.value)}
                  className="col-span-3"
              />
            </div>
            {/* Estado */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Estado</Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      id="new-status"
                      checked={category.status}
                      onChange={(e) => onInputChange("status", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="new-status">{category.status ? "Activo" : "Inactivo"}</Label>
                </div>
              </div>
            </div>
            {/* Imagen */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Imagen</Label>
              <div className="col-span-3">
                <div className="flex flex-col gap-2">
                  {category.main_image && (
                      <div className="relative inline-block">
                        <ProductImage src={category.main_image} alt="Imagen de categoría" />
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => onImageDelete(category.main_image)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                  )}
                  <div className="relative">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isConverting}
                    />
                    {isConverting && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Convirtiendo...</span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Las imágenes se convertirán automáticamente a formato WebP para optimizar el rendimiento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={isConverting}>
              {isConverting ? "Procesando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}