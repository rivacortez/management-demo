import { Navbar } from "@/components/ui/navbar";

export default function ProfileUsertLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Navbar>
			<div className="min-h-screen flex flex-col">
				
				<main className="flex-1 container mx-auto py-8 px-4">{children}</main>
			</div>
		
		</Navbar>
	);
}