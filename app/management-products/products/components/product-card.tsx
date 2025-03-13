"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, Tag } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { Product } from "../../domain/interfaces/product";
import { ProductImage } from "@/components/product-image";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative bg-gray-100 aspect-video overflow-hidden">
        <div className="flex gap-2 p-2 overflow-x-auto snap-x snap-mandatory h-full">
          {Array.isArray(product.cover_image) && product.cover_image.length > 0 ? (
            product.cover_image.map((image, index) => (
              <div key={index} className="snap-center flex-shrink-0 h-full min-w-full">
                <ProductImage 
                  src={image} 
                  alt={`Imagen ${index + 1} de ${product.name}`}
                  className="object-contain w-full h-full"
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imágenes
            </div>
          )}
        </div>
        

      </div>
      
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl font-bold leading-tight">{product.name}</CardTitle>
          <div className="flex-shrink-0 flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={() => onEdit(product)}
              aria-label="Editar producto"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={() => onDelete(product.id)}
              aria-label="Eliminar producto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <div className="space-y-3">
          <div className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </div>
          
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="line-clamp-2">{product.description}</span>
            </div>
            
            {product.stock && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span>Cantidad: {product.stock}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}