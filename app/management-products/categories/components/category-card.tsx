"use client";

import { memo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag, Calendar, CheckCircle2, XCircle, Link2 } from "lucide-react";
import { Category } from "../../domain/interfaces/categories";
import { ProductImage } from "@/components/product-image";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

function CategoryCardComponent({ category, onEdit, onDelete }: CategoryCardProps) {
  const handleEdit = useCallback(() => onEdit(category), [category, onEdit]);
  const handleDelete = useCallback(() => onDelete(category.id), [category, onDelete]);

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border border-border/50">
      <CardHeader className="pb-2 relative">
        <div className="absolute top-3 right-3 flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary transition-colors" 
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-2">
          <Badge 
            variant={category.status ? "default" : "destructive"} 
            className={`w-fit ${category.status ? "bg-green-500/90 hover:bg-green-600 text-white" : "bg-red-500/90 hover:bg-red-600 text-white"} flex items-center gap-1`}
          >
            {category.status ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-0.5" />
                Activo
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 mr-0.5" />
                Inactivo
              </>
            )}
          </Badge>
          
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{category.category_name}</span>
          </CardTitle>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link2 className="h-3.5 w-3.5 text-primary/70" />
            <span className="line-clamp-1">{category.category_slug}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {category.main_image && (
          <div className="relative h-48 w-full overflow-hidden">
            <ProductImage
              src={category.main_image}
              alt={category.category_name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 bg-muted/20 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="flex items-center gap-1 text-sm">
           
      
          </div>
          
          <div className="flex items-center gap-1 text-sm justify-end">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-muted-foreground font-medium">Fecha:</span>
            <span className="text-foreground/80">
              {new Date(category.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
