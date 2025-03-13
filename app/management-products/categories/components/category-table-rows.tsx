"use client";

import { memo, useCallback } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Save, X, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { Category } from "../../domain/interfaces/categories";

interface CategoryTableRowsProps {
  categories: Category[];
  editingCategory: Category | null;
  onEdit: (category: Category) => void;
  onInputChange: (field: keyof Category, value: string | number | boolean) => void;
  onSave: () => void;
  onDeleteClick: (categoryId: string) => void;
  onImageDelete: (imageUrl: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setEditingCategory: React.Dispatch<React.SetStateAction<Category | null>>;
}

interface RowProps extends Omit<CategoryTableRowsProps, "categories"> {
  category: Category;
}

const CategoryTableRow = memo(function CategoryTableRow({
  category,
  editingCategory,
  onEdit,
  onInputChange,
  onSave,
  onDeleteClick,
 
  setEditingCategory,
}: RowProps) {
  const isEditing = editingCategory?.id === category.id;

  const handleEdit = useCallback(() => onEdit(category), [category, onEdit]);
  const handleDelete = useCallback(() => onDeleteClick(category.id), [category.id, onDeleteClick]);
  const handleCancel = useCallback(() => setEditingCategory(null), [setEditingCategory]);
  const handleSave = useCallback(() => onSave(), [onSave]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onInputChange("category_name", e.target.value),
    [onInputChange]
  );

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onInputChange("category_slug", e.target.value),
    [onInputChange]
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onInputChange("status", e.target.checked),
    [onInputChange]
  );

  return (
    <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">

      {/* Imagen */}
      <TableCell>
        {category.main_image ? (
          <ProductImage
            src={category.main_image}
            alt={category.category_name}
            className="w-16 h-16 object-cover rounded-md shadow-sm border border-border/50"
          />
        ) : (
          <span className="text-muted-foreground text-sm italic">Sin imagen</span>
        )}
      </TableCell>

      {/* Nombre */}
      <TableCell>
        {isEditing ? (
          <Input 
            value={editingCategory!.category_name} 
            onChange={handleNameChange} 
            className="border-primary/20 focus-visible:ring-primary/20"
          />
        ) : (
          <span className="font-medium">{category.category_name}</span>
        )}
      </TableCell>

      {/* Slug */}
      <TableCell>
        {isEditing ? (
          <Input 
            value={editingCategory!.category_slug} 
            onChange={handleSlugChange} 
            className="border-primary/20 focus-visible:ring-primary/20"
          />
        ) : (
          <span className="text-muted-foreground text-sm">{category.category_slug}</span>
        )}
      </TableCell>

      {/* Estado */}
      <TableCell>
        {isEditing ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editingCategory!.status}
              onChange={handleStatusChange}
              className="mr-2 h-4 w-4 rounded border-primary/20 text-primary"
            />
            <span className="flex items-center gap-1">
              {editingCategory!.status ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Activo</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Inactivo</span>
                </>
              )}
            </span>
          </div>
        ) : (
          <Badge
            variant={category.status ? "default" : "destructive"}
            className={`whitespace-nowrap flex items-center gap-1 ${category.status ? "bg-green-500/90 hover:bg-green-600 text-white" : "bg-red-500/90 hover:bg-red-600 text-white"}`}
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
        )}
      </TableCell>

      {/* Fecha de agregado */}
      <TableCell className="text-sm text-muted-foreground">
        {new Date(category.created_at).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </TableCell>

      {/* Acciones */}
      <TableCell>
        {isEditing ? (
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              className="h-8 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="h-8 bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEdit}
              className="h-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="h-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
});

export const CategoryTableRows = memo(function CategoryTableRows({
  categories,
  editingCategory,
  onEdit,
  onInputChange,
  onSave,
  onDeleteClick,
  onImageDelete,
  onFileChange,
  setEditingCategory,
}: CategoryTableRowsProps) {
  return (
    <>
      {categories.map((category) => (
        <CategoryTableRow
          key={category.id}
          category={category}
          editingCategory={editingCategory}
          onEdit={onEdit}
          onInputChange={onInputChange}
          onSave={onSave}
          onDeleteClick={onDeleteClick}
          onImageDelete={onImageDelete}
          onFileChange={onFileChange}
          setEditingCategory={setEditingCategory}
        />
      ))}
    </>
  );
});
