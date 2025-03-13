"use client";

import { useState, useCallback, useEffect } from "react";
import { useCategories } from "@/app/management-products/store/use-categories";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  
  X, 

  LayoutGrid, 
  LayoutList, 
  Tag,
  SlidersHorizontal,
  FileText,
  Trash,
  ArrowUpDown,
  RefreshCw,

} from "lucide-react";
import { EditCategoryDialog } from "../dialogs/edit-category-dialog";
import { AddCategoryDialog } from "../dialogs/add-category-dialog";

import { CategoryCard } from "./category-card";
import { CategoryTableRows } from "./category-table-rows";
import { Category } from "../../domain/interfaces/categories";
import { deleteImage, uploadImage } from "../../use-cases/categories/category-management";

interface CreateCategory {
  category_name: string;
  category_slug: string;
  main_image: string;
  status: boolean;
}

interface FilterOptions {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function CategoriesTable() {
  const { categories, updateCategory, deleteCategory, addCategory } = useCategories();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid'); // Default to grid view for better mobile experience
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [newCategory, setNewCategory] = useState<CreateCategory>({
    category_name: "",
    category_slug: "",
    main_image: "",
    status: true,
  });

  // Aplicar filtros a las categorías
  useEffect(() => {
    let result = [...categories];
    
    // Filtrar por búsqueda
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      result = result.filter(cat => 
        cat.category_name.toLowerCase().includes(searchLower) || 
        cat.category_slug.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por estado
    if (filterOptions.status !== 'all') {
      result = result.filter(cat => 
        filterOptions.status === 'active' ? cat.status : !cat.status
      );
    }
    
    // Ordenar los resultados
    result.sort((a, b) => {
      const factor = filterOptions.sortOrder === 'asc' ? 1 : -1;
      
      switch (filterOptions.sortBy) {
        case 'name':
          return a.category_name.localeCompare(b.category_name) * factor;
        case 'date':
          return ((new Date(a.created_at || 0)).getTime() - (new Date(b.created_at || 0)).getTime()) * factor;
        default:
          return 0;
      }
    });
    
    setFilteredCategories(result);
  }, [categories, filterOptions]);

  // --- Manejo de filtros ---
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: string | 'asc' | 'desc') => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterOptions({
      search: '',
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, []);

  // --- Manejo de edición ---
  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
  }, []);

  const handleInputChange = useCallback(
    (field: keyof Category, value: string | number | boolean) => {
      setEditingCategory((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory.id, editingCategory);
      toast.success("Categoría actualizada");
    } catch {
      toast.error("Error al actualizar categoría");
    }
  }, [editingCategory, updateCategory]);

  // --- Manejo de imagen en la edición ---
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editingCategory || !e.target.files?.length) return;
      try {
        const file = e.target.files[0];
        const newImageUrl = await uploadImage(file);
        setEditingCategory((prev) =>
          prev ? { ...prev, main_image: newImageUrl } : prev
        );
      } catch {
        toast.error("Error al subir la imagen");
      }
    },
    [editingCategory]
  );

  const handleImageDelete = useCallback(
    async (imageUrl: string) => {
      if (!editingCategory) return;
      try {
        const path = imageUrl.replace(
            "https://idpesfrwikdnugdufvfr.supabase.co/storage/v1/object/public/ferreteria-mama-bucket/",
          ""
        );
        await deleteImage(path);
        setEditingCategory((prev) =>
          prev
            ? {
                ...prev,
                main_image: prev.main_image === imageUrl ? "" : prev.main_image,
              }
            : prev
        );
      } catch {
        toast.error("Error al eliminar la imagen");
      }
    },
    [editingCategory]
  );

  // --- Manejo de eliminación ---
  const handleDelete = useCallback(async () => {
    if (!deleteCategoryId) return;
    try {
      await deleteCategory(deleteCategoryId);
      toast.success("Categoría eliminada");
    } catch {
      toast.error("Error al eliminar categoría");
    } finally {
      setDeleteCategoryId(null);
    }
  }, [deleteCategoryId, deleteCategory]);

  // --- Manejo de nueva categoría ---
  const handleNewCategoryChange = useCallback(
    (field: keyof CreateCategory, value: string | number | boolean) => {
      setNewCategory((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNewFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = await uploadImage(file);
        setNewCategory((prev) => ({ ...prev, main_image: imageUrl }));
      }
    } catch {
      toast.error("Error al subir imagen");
    }
  }, []);

  const handleNewImageDelete = useCallback(() => {
    setNewCategory((prev) => ({ ...prev, main_image: "" }));
  }, []);

  const handleAddCategory = useCallback(async () => {
    try {
      await addCategory(newCategory);
      toast.success("Categoría creada exitosamente");
      setIsAddDialogOpen(false);
      setNewCategory({
        category_name: "",
        category_slug: "",
        main_image: "",
        status: true,
      });
    } catch {
      toast.error("Error al crear categoría");
    }
  }, [newCategory, addCategory]);

  // --- Vista de tarjetas (grid view) ---
  const renderCategoryCards = useCallback(
    () => (
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={handleEdit}
            onDelete={setDeleteCategoryId}
          />
        ))}
      </div>
    ),
    [filteredCategories, handleEdit]
  );

  return (
    <>
      {/* Encabezado con título, búsqueda y botones */}
      <Card className="mb-4 sm:mb-6 border-none shadow-sm bg-background/50 backdrop-blur">
        <CardHeader className="pb-0 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span>Categorías</span>
            </CardTitle>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                title={viewMode === 'table' ? "Ver como cuadrícula" : "Ver como tabla"}
                className="border-border hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8 sm:h-9 sm:w-9"
              >
                {viewMode === 'table' ? <LayoutGrid className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-8 w-8 sm:h-9 sm:w-9 ${isFilterOpen ? "bg-primary/10 text-primary border-primary/20" : "border-border hover:bg-primary/10 hover:text-primary transition-colors"}`}
                title="Filtros"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                className="bg-primary hover:bg-primary/90 transition-colors h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
                <span className="hidden xs:inline">Agregar</span>
                <span className="hidden sm:inline"> Categoría</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                className="pl-9 bg-card text-card-foreground border-border focus-visible:ring-primary/20 h-8 sm:h-9 text-sm"
                value={filterOptions.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              {filterOptions.search && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleFilterChange('search', '')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Contador de resultados */}
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 w-full sm:w-auto justify-end">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {filteredCategories.length} resultado{filteredCategories.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Panel de filtros desplegable */}
          {isFilterOpen && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-card border border-border rounded-md space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Filtro por estado */}
                <div className="w-full sm:w-1/3">
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Estado</label>
                  <Select
                    value={filterOptions.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-sm bg-background">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activas</SelectItem>
                      <SelectItem value="inactive">Inactivas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Ordenar por */}
                <div className="w-full sm:w-1/3">
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Ordenar por</label>
                  <Select
                    value={filterOptions.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-sm bg-background">
                      <SelectValue placeholder="Fecha de creación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Fecha de creación</SelectItem>
                      <SelectItem value="name">Nombre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Orden ascendente/descendente */}
                <div className="w-full sm:w-1/3">
                  <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Dirección</label>
                  <Select
                    value={filterOptions.sortOrder}
                    onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="h-8 sm:h-9 text-sm bg-background">
                      <SelectValue placeholder="Descendente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descendente</SelectItem>
                      <SelectItem value="asc">Ascendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-8 text-xs sm:text-sm"
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Contenido principal: tabla o grid */}
      <div className="mt-2 sm:mt-0">
        {viewMode === 'table' ? (
          <Card className="border-none shadow-sm overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="w-[50px]">Imagen</TableHead>
                    <TableHead className="min-w-[180px]">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => {
                        handleFilterChange('sortBy', 'name');
                        handleFilterChange('sortOrder', filterOptions.sortOrder === 'asc' ? 'desc' : 'asc');
                      }}>
                        Nombre
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[180px]"></TableHead>
                    <TableHead className="w-[100px] text-center">Estado</TableHead>
                    <TableHead className="w-[100px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? (
                    <CategoryTableRows
                    categories={filteredCategories}
                    editingCategory={editingCategory}
                    onEdit={handleEdit}
                    onInputChange={handleInputChange}
                    onSave={handleSave}
                    onImageDelete={handleImageDelete}
                    onFileChange={handleFileChange}
                    setEditingCategory={setEditingCategory}
                    onDeleteClick={(categoryId: string) => setDeleteCategoryId(categoryId)}
                  />
                  
                  ) : (
                    <TableRow>
                      <TableHead colSpan={5} className="h-24 text-center text-muted-foreground">
                        No se encontraron categorías
                      </TableHead>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        ) : (
          renderCategoryCards()
        )}
      </div>
      
      {/* Diálogo de edición */}
      <EditCategoryDialog
        category={editingCategory}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onFileChange={handleFileChange}
        onImageDelete={handleImageDelete}
      />
      
      {/* Diálogo de agregar */}
      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        category={newCategory}
        onInputChange={handleNewCategoryChange}
        onSave={handleAddCategory}
        onFileChange={handleNewFileChange}
        onImageDelete={handleNewImageDelete}
      />
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className=" ">
              <Trash className="" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>)}