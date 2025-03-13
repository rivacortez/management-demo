"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { Product } from "../../domain/interfaces/product";

interface EditProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onInputChange: (field: keyof Product, value: string | number | boolean) => void;
  onSave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (imageUrl: string) => void;
}

export function EditProductDialog({
  product,
  isOpen,
  onClose,
  onInputChange,
  onSave,
  onFileChange,
  onImageDelete,
}: EditProductDialogProps) {
  const [isConverting, setIsConverting] = useState(false);

  if (!product) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Realiza cambios en el producto. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Nombre */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={product.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Ubicación */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Ubicación
            </Label>
            <Input
              id="description"
              value={product.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              className="col-span-3"
            />
          </div>
          {/* Precio */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Precio
            </Label>
            <Input
              id="price"
              type="number"
              value={product.price}
              onChange={(e) => onInputChange("price", Number.parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>

                  {/*Cantidad del producto 
                  <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Cantidad
            </Label>
            <Input
              id="quantity"
              type="number"
              value={product.quantity}
              onChange={(e) => onInputChange("quantity", Number.parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>
          */}

          {/* Estado */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Stock</Label>
            <div className="col-span-3">
            <Input
              id="stock"
              type="number"
              value={product.stock}
              onChange={(e) => onInputChange("stock", Number.parseFloat(e.target.value))}
              className="col-span-3"
            />
             {/*
              <Checkbox
                checked={product.stock}
                onCheckedChange={(checked) => onInputChange("stock", checked as boolean)}
              />
              */}
              {/*<span className="ml-2">{product.stock ? "Stock" : "Sin stock"}</span>*/}
            </div>
          </div>
          {/* Imágenes */}
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">Imágenes</Label>
            <div className="col-span-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.isArray(product.cover_image) &&
                  product.cover_image.map((image, index) => (
                    <div key={index} className="relative">
                      <ProductImage src={image} alt={`Imagen ${index + 1} de ${product.name}`} />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onImageDelete(image)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  disabled={isConverting}
                />
                {isConverting && (
                  <p className="text-sm text-muted-foreground">
                    Optimizando imagen...
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Las imágenes se convertirán automáticamente a formato WebP para optimizar el rendimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isConverting}>
            {isConverting ? "Procesando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
