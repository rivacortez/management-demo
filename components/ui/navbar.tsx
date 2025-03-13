'use client'

import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/ui/mode-toggle"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Package, Grid3X3, Settings, Users, FileText, Bell, ChevronRight } from "lucide-react"
import { UserProfileMenu } from "@/components/ui/user-profile-menu"

export function Navbar({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Detectar scroll para cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const menuItems = [
    //{ name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", section: "Principal" },
    { name: "Productos", icon: Package, href: "/management-products/products", section: "Gestión" },
    { name: "Categorías", icon: Grid3X3, href: "/management-products/categories", section: "Gestión" },
    { name: "Proveedores", icon: Users, href: "/management-suppliers/supplier-list", section: "Gestión" },
    { name: "Productos-Proveedores", icon: Package, href: "/management-suppliers/product-supplier-management", section: "Gestión" },
    { name: "Comparación de Proveedores", icon: FileText, href: "/management-suppliers/supplier-inventory-comparison", section: "Gestión" },
    { name: "Órdenes de Compra", icon: FileText, href: "/purchases/orders", section: "Compras" },
    { name: "Configuración", icon: Settings, href: "/settings", section: "Sistema" },
  ]

  return (
    <>
      {/* Navbar principal con efecto de glassmorphism */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg py-2" 
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo y botón de menú */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="relative p-2 before:absolute before:inset-0 before:rounded-full before:bg-primary-500/10 before:scale-0 hover:before:scale-100 before:transition-all before:duration-300 text-gray-700 dark:text-gray-300"
                aria-label="Toggle sidebar"
              >
                <Menu size={22} className="relative z-10 transition-transform" />
              </button>
              <Link
                href="/"
                className="relative font-bold text-xl group overflow-hidden px-3 py-2"
              >

                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Controles derecha */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <ModeToggle />
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar lateral con efecto de deslizamiento suave y diseño moderno */}
      <div className="pt-16 flex min-h-screen">
        {/* Sidebar backdrop con efecto de desenfoque */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar con transición suave y diseño moderno */}
        <aside 
          className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl transition-all duration-500 ease-in-out z-30 overflow-hidden ${
            sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-16"
          }`}
        >
          <div className="h-full py-4 flex flex-col">
            <div className="space-y-1 px-3 mb-8">
              <div className={`flex items-center justify-between mb-6 ${!sidebarOpen && 'opacity-0'}`}>
                <h3 className="font-medium text-sm text-gray-500">Navegación</h3>
              </div>
            </div>

            {/* Contenedor con secciones de menú */}
            <div className="flex-1 overflow-y-auto px-3 space-y-6">
              {/* Agrupar elementos por sección */}
              {["Principal", "Gestión", "Compras", "Sistema"].map((section) => (
                <div key={section} className="space-y-1">
                  <h2 className={`text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider mb-2 transition-opacity duration-300 ${!sidebarOpen && 'opacity-0 h-0'}`}>
                    {section}
                  </h2>
                  
                  {menuItems.filter(item => item.section === section).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center rounded-xl transition-all duration-300 ${
                        pathname === item.href
                          ? "bg-gradient-to-r from-primary-500/20 to-primary-400/10 text-primary-600 dark:text-primary-400 font-medium" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                      } ${sidebarOpen ? "px-3 py-2" : "justify-center p-3"}`}
                    >
                      <item.icon 
                        size={20} 
                        className={`${
                          pathname === item.href
                            ? "text-primary-500"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                        } transition-colors duration-200`}
                      />
                      
                      {sidebarOpen && (
                        <>
                          <span className="ml-3 truncate">{item.name}</span>
                          <ChevronRight 
                            size={16} 
                            className={`ml-auto transition-transform duration-300 ${
                              pathname === item.href ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                            }`}
                          />
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>
        
        {/* Contenido principal con margen dinámico */}
        <main className={`flex-1 transition-all duration-500 ${
          sidebarOpen ? "ml-64" : "ml-0 lg:ml-16"
        }`}>
          {/* Contenido con padding superior para compensar la navbar */}
          <div className="container mx-auto p-6 pt-8">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}