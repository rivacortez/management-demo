"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Tag,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
  Search,
  X,
  FileText,
  RefreshCw,

} from "lucide-react";

export interface FilterOptions {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface CategoriesHeaderProps {
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  filterOptions: FilterOptions;
  handleFilterChange: (key: keyof FilterOptions, value: string | "asc" | "desc") => void;
  clearFilters: () => void;
  filteredCount: number;
  onAdd: () => void;
}

export default function CategoriesHeader({
  viewMode,
  setViewMode,
  isFilterOpen,
  setIsFilterOpen,
  filterOptions,
  handleFilterChange,
  clearFilters,
  filteredCount,
  onAdd,
}: CategoriesHeaderProps) {
  return (
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
              onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
              title={viewMode === "table" ? "Ver como cuadrícula" : "Ver como tabla"}
              className="border-border hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8 sm:h-9 sm:w-9"
            >
              {viewMode === "table" ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                <LayoutList className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`h-8 w-8 sm:h-9 sm:w-9 ${
                isFilterOpen
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "border-border hover:bg-primary/10 hover:text-primary transition-colors"
              }`}
              title="Filtros"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <Button
              onClick={onAdd}
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
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            {filterOptions.search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => handleFilterChange("search", "")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 w-full sm:w-auto justify-end">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {filteredCount} resultado{filteredCount !== 1 ? "s" : ""}
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-card border border-border rounded-md space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Filtro por estado */}
              <div className="w-full sm:w-1/3">
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                  Estado
                </label>
                <Select
                  value={filterOptions.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
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
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                  Ordenar por
                </label>
                <Select
                  value={filterOptions.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
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

              {/* Dirección (asc/desc) */}
              <div className="w-full sm:w-1/3">
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                  Dirección
                </label>
                <Select
                  value={filterOptions.sortOrder}
                  onValueChange={(value) =>
                    handleFilterChange("sortOrder", value as "asc" | "desc")
                  }
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
  );
}
