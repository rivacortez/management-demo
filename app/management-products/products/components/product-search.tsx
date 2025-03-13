"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Search, SlidersHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format-price";

interface Filters {
  searchTerm: string;
  priceRange: number[];
  status: string;
  location: string;
}

interface ProductsSearchProps {
  onSearch: (filters: Filters) => void;
  locations?: string[];
}

export function ProductsSearch({ onSearch, locations = [] }: ProductsSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const applyFilters = () => {
    const filters = {
      searchTerm,
      priceRange,
      status: selectedStatus,
      location: selectedLocation
    };
    
    let count = 0;
    if (searchTerm) count++;
    if (selectedStatus !== "all") count++;
    if (selectedLocation !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
    
    setActiveFilters(count);
    onSearch(filters);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 100000]);
    setSelectedStatus("all");
    setSelectedLocation("all");
    setActiveFilters(0);
    
    onSearch({
      searchTerm: "",
      priceRange: [0, 100000],
      status: "all",
      location: "all"
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="hidden md:flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos por nombre o categoría..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && applyFilters()}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => {
                setSearchTerm("");
                applyFilters();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Precio
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Rango de precios</h4>
                <Slider
                  defaultValue={[0, 100000]}
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex justify-between">
                  <span>{formatPrice(priceRange[0])} </span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={applyFilters}>
            Aplicar Filtros
            {activeFilters > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeFilters}
              </Badge>
            )}
          </Button>

          {activeFilters > 0 && (
            <Button variant="ghost" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="md:hidden space-y-2">
        <div className="relative flex w-full items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-9 pr-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && applyFilters()}
          />
          <div className="absolute right-1 top-1 flex">
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSearchTerm("");
                  applyFilters();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showMobileFilters && (
          <div className="rounded-md border p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filtros</h3>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Estado</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ubicación</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ubicaciones</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rango de precios</Label>
                <div className="mt-6 px-2">
                  <Slider
                    defaultValue={[0, 100000]}
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>PEN {priceRange[0].toLocaleString()}</span>
                  <span>PEN {priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <Button className="w-full" onClick={() => {
                applyFilters();
                setShowMobileFilters(false);
              }}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}