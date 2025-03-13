"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, X } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format-price";
import { Product } from "../../domain/interfaces/product";

interface ProductTableRowsProps {
  products: Product[];
  editingProduct: Product | null;
  onEdit: (product: Product) => void;
  onInputChange: (field: keyof Product, value: string | number | boolean) => void;
  onSave: () => void;
  onDeleteClick: (productId: string) => void;
  onImageDelete: (imageUrl: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setEditingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  onOpenLightbox: (images: string[], alt: string) => void;
}

export function ProductTableRows({
  products,
  editingProduct,
  onEdit,
  onInputChange,
  onImageDelete,
  onSave,
  onDeleteClick,
  onFileChange,
  setEditingProduct,
}: ProductTableRowsProps) {
  return (
    <>
      {products.map((product) => (
        <TableRow key={product.id}>
         

          <TableCell>
            {editingProduct?.id === product.id ? (
              <Input
                value={editingProduct.name}
                onChange={(e) => onInputChange("name", e.target.value)}
              />
            ) : (
              product.name
            )}
          </TableCell>

          <TableCell>
            {editingProduct?.id === product.id ? (
              <Input
                value={editingProduct.description}
                onChange={(e) => onInputChange("description", e.target.value)}
              />
            ) : (
              product.description
            )}
          </TableCell>

          <TableCell>
            {editingProduct?.id === product.id ? (
              <Input
                type="number"
                value={editingProduct.price}
                onChange={(e) =>
                  onInputChange("price", Number.parseFloat(e.target.value))
                }
              />
            ) : (
              formatPrice(product.price)
            )}
          </TableCell>

          <TableCell>
            {editingProduct?.id === product.id ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Array.isArray(editingProduct.cover_image) &&
                    editingProduct.cover_image.map((image, index) => (
                      <div key={index} className="relative">
                        <ProductImage
                          src={image}
                          alt={`Imagen ${index + 1} de ${editingProduct.name}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() => onImageDelete(image)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
                <Input type="file" accept="image/*" onChange={onFileChange} />
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto">
                {Array.isArray(product.cover_image) && product.cover_image.length > 0 ? (
                  product.cover_image.map((image, index) => (
                    <ProductImage
                      key={index}
                      src={image}
                      alt={`Imagen ${index + 1} de ${product.name}`}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                    />
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Sin imagen</span>
                )}
              </div>
            )}
          </TableCell>

          <TableCell>
            {editingProduct?.id === product.id ? (
              <Input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  onInputChange("stock", Number.parseFloat(e.target.value))
                }
              />
            ) : (
              product.stock
            )}
          </TableCell>

          <TableCell>
            {editingProduct?.id === product.id ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={onSave}>
                  Guardar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteClick(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}