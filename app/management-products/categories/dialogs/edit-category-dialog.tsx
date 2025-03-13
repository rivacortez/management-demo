"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { Category } from "@/app/management-products/domain/interfaces/categories";
import { clientConvertToWebP } from "@/app/management-products/utils/client-image-utils";

interface EditCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onInputChange: (field: keyof Category, value: string | number | boolean) => void;
  onSave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (imageUrl: string) => void;
}

export function EditCategoryDialog({
                                     category,
                                     isOpen,
                                     onClose,
                                     onInputChange,
                                     onSave,
                                     onFileChange,
                                     onImageDelete,
                                   }: EditCategoryDialogProps) {
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChangeWithConversion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setIsConverting(true);
      const file = e.target.files[0];

      const webpFile = await clientConvertToWebP(file);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(webpFile);

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          files: dataTransfer.files
        }
      } as React.ChangeEvent<HTMLInputElement>;

      await onFileChange(syntheticEvent);
    } catch (error) {
      console.error('Error converting image to WebP:', error);
    } finally {
      setIsConverting(false);
    }
  };

  if (!category) return null;

  return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Realiza cambios en la categoría. Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_name" className="text-right">
                Nombre
              </Label>
              <Input
                  id="category_name"
                  value={category.category_name}
                  onChange={(e) => onInputChange("category_name", e.target.value)}
                  className="col-span-3"
              />
            </div>
            {/* Slug */}

            {/* Estado */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Estado</Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      id="status"
                      checked={category.status}
                      onChange={(e) => onInputChange("status", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="status">{category.status ? "Activo" : "Inactivo"}</Label>
                </div>
              </div>
            </div>
            {/* Imagen */}
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Imágenes</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {category.main_image && (
                      <div className="relative">
                        <ProductImage
                            src={category.main_image}
                            alt={`Imagen de ${category.category_name}`}
                        />
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
                </div>
                <div className="relative">
                  <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChangeWithConversion}
                      disabled={isConverting}
                  />
                  {isConverting && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Convirtiendo...</span>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onSave}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}