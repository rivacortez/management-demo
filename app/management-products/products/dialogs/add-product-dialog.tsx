"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ProductImage } from "@/components/product-image";

interface CreateProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  cover_image: string[];
}

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newProduct: CreateProduct;
  onNewProductChange: (field: keyof CreateProduct, value: string | number | boolean) => void;
  onAddProduct: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (imageUrl: string) => void;
}

export function AddProductDialog({
                                   isOpen,
                                   onClose,
                                   newProduct,
                                   onNewProductChange,
                                   onAddProduct,
                                   onFileChange,
                                   onImageDelete,
                                 }: AddProductDialogProps) {
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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>Completa los detalles del nuevo producto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form fields... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">Nombre</Label>
              <Input
                  id="new-name"
                  value={newProduct.name}
                  onChange={(e) => onNewProductChange("name", e.target.value)}
                  className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description" className="text-right">Ubicación</Label>
              <Input
                  id="new-description"
                  value={newProduct.description}
                  onChange={(e) => onNewProductChange("description", e.target.value)}
                  className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-price" className="text-right">Precio</Label>
              <Input
                  id="new-price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => onNewProductChange("price", Number.parseFloat(e.target.value))}
                  className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-stock" className="text-right">Stock</Label>
              <Input
                  id="new-stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => onNewProductChange("stock", Number.parseFloat(e.target.value))}
                  className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Imágenes</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {newProduct.cover_image.map((image, index) => (
                      <div key={index} className="relative">
                        <ProductImage src={image} alt={`Imagen ${index + 1}`} />
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
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={onAddProduct} disabled={isConverting}>
              {isConverting ? "Procesando..." : "Agregar Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}