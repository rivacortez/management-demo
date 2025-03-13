"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/app/management-products/store/use-products";
import { toast } from "sonner";

import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Plus, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { EditProductDialog } from "../dialogs/edit-product-dialog";
import { AddProductDialog } from "../dialogs/add-product-dialog";
import Image from "next/image";
import { ProductCard } from "./product-card";
import { ProductTableRows } from "./product-table-rows";
import { Product } from "../../domain/interfaces/product";
import { deleteImage, uploadImage } from "../../use-cases/products/product-management";
import { ProductsSearch } from "./product-search";

const Lightbox = ({
  images,
  alt,
  onClose,
}: {
  images: string[];
  alt: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 m-2 p-2 text-white bg-gray-800 rounded"
        >
          X
        </button>
        <Image 
          src={images[0]} 
          alt={alt} 
          width={800} 
          height={600} 
          className="max-w-full max-h-screen" 
          priority
        />
        {alt && <div className="text-white text-center mt-2">{alt}</div>}
      </div>
    </div>
  );
};


interface CreateProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  cover_image: string[];
}

interface FilterOptions {
  searchTerm: string;
  priceRange: number[];
  status: string;
  location: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage === 2) endPage = Math.min(4, totalPages - 1);
      if (endPage === totalPages - 1) startPage = Math.max(2, totalPages - 3);

      if (startPage > 2) pages.push(-1);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages - 1) pages.push(-2);
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) =>
        page < 0 ? (
          <span key={`ellipsis-${index}`} className="px-2">
            ...
          </span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-8 h-8"
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function ProductsTable() {
  const { products, updateProduct, deleteProduct, addProduct } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [newProduct, setNewProduct] = useState<CreateProduct>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    cover_image: [],
  });

  useEffect(() => {
    const locations = products
      .map((product) => product.description)
      .filter((location): location is string => typeof location === "string" && location.trim() !== "");
    setUniqueLocations(Array.from(new Set(locations)));
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (sortField === "price" || sortField === "stock") {
        return sortDirection === "asc"
          ? Number(a[sortField]) - Number(b[sortField])
          : Number(b[sortField]) - Number(a[sortField]);
      }

      const aValue = String(a[sortField] || "").toLowerCase();
      const bValue = String(b[sortField] || "").toLowerCase();

      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
    setTotalPages(Math.max(1, Math.ceil(sortedProducts.length / productsPerPage)));

    if (currentPage > Math.max(1, Math.ceil(sortedProducts.length / productsPerPage))) {
      setCurrentPage(Math.max(1, Math.ceil(sortedProducts.length / productsPerPage)));
    }

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    setPaginatedProducts(sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct));
  }, [filteredProducts, currentPage, productsPerPage, sortField, sortDirection]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const applyFilters = (filters: FilterOptions) => {
    let result = [...products];

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    if (filters.location !== "all") {
      result = result.filter((product) => product.description === filters.location);
    }

    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    setFilteredProducts(result);
    setCurrentPage(1);
  };

  const handleEdit = (product: Product) => setEditingProduct(product);
  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };
  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, editingProduct);
        toast.success("Producto actualizado");
      }
    } catch {
      toast.error("Error al actualizar producto");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingProduct || !e.target.files?.length) return;
    try {
      const file = e.target.files[0];
      const newImageUrl = await uploadImage(file);
      setEditingProduct({
        ...editingProduct,
        cover_image: [...(editingProduct.cover_image || []), newImageUrl],
      });
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error("Error al subir la imagen");
    }
  };

  const handleOpenLightbox = (images: string[], alt: string) => {
    console.log("Lightbox images:", images);
    if (!images || !images.length) return;
    setLightboxImages(images);
    setLightboxAlt(alt);
    setLightboxOpen(true);
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: keyof Product) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!editingProduct) return;
    try {
      const path = imageUrl.replace(
          "https://idpesfrwikdnugdufvfr.supabase.co/storage/v1/object/public/management-demo/",
          ""
      );
      await deleteImage(path);
      setEditingProduct({
        ...editingProduct,
        cover_image: editingProduct.cover_image?.filter((img) => img !== imageUrl) || [],
      });
    } catch {
      toast.error("Error al eliminar la imagen");
    }
  };


  const handleDelete = async () => {
    try {
      if (deleteProductId) {
        await deleteProduct(deleteProductId);
        toast.success("Producto eliminado");
      }
    } catch {
      toast.error("Error al eliminar producto");
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleNewProductChange = (field: keyof CreateProduct, value: string | number | boolean) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleNewFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = await uploadImage(file);
        setNewProduct((prev) => ({
          ...prev,
          cover_image: [...prev.cover_image, imageUrl],
        }));
      }
    } catch {
      toast.error("Error al subir imagen");
    }
  };
  const handleNewImageDelete = (imageUrl: string) => {
    setNewProduct((prev) => ({
      ...prev,
      cover_image: prev.cover_image.filter((img) => img !== imageUrl),
    }));
  };
  const handleAddProduct = async () => {
    try {
      await addProduct(newProduct);
      toast.success("Producto creado exitosamente");
      setIsAddDialogOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        cover_image: [],
      });
    } catch {
      toast.error("Error al crear producto");
    }
  };
  const handleProductsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const renderProductCards = () => {
    return paginatedProducts.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onEdit={handleEdit}
        onDelete={setDeleteProductId}
      />
    ));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Producto
        </Button>
      </div>

      <ProductsSearch onSearch={applyFilters} locations={uniqueLocations} />

      <div className="flex justify-between items-center mb-2 text-sm">
        <div className="text-muted-foreground">
          Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Mostrar</span>
          <select
            className="border border-input bg-background dark:bg-secondary rounded p-1 text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            value={productsPerPage}
            onChange={handleProductsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="text-muted-foreground">por página</span>
        </div>
      </div>

      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  Nombre
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("description")}>
                <div className="flex items-center gap-1">
                  Ubicación
                  {getSortIcon("description")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                <div className="flex items-center gap-1">
                  Precio
                  {getSortIcon("price")}
                </div>
              </TableHead>
              <TableHead>Imágenes</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("stock")}>
                <div className="flex items-center gap-1">
                  Stock
                  {getSortIcon("stock")}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ProductTableRows
              products={paginatedProducts}
              editingProduct={editingProduct}
              onEdit={handleEdit}
              onInputChange={handleInputChange}
              onSave={handleSave}
              onDeleteClick={setDeleteProductId}
              onImageDelete={handleImageDelete}
              onFileChange={handleFileChange}
              setEditingProduct={setEditingProduct}
              onOpenLightbox={handleOpenLightbox}
            />
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden">
        <div>{renderProductCards()}</div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      <EditProductDialog
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onFileChange={handleFileChange}
        onImageDelete={handleImageDelete}
      />

      <AddProductDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        newProduct={newProduct}
        onNewProductChange={handleNewProductChange}
        onAddProduct={handleAddProduct}
        onFileChange={handleNewFileChange}
        onImageDelete={handleNewImageDelete}
      />

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el producto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {lightboxOpen && (
        <Lightbox images={lightboxImages} alt={lightboxAlt} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
