import { Navbar } from "@/components/ui/navbar"

export default function SupplierInventoryComparisonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Navbar>

    <div className="h-full">
      {children}
    </div>
    </Navbar>
  )
}