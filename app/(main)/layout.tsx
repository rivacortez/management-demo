import { Navbar } from "@/components/ui/navbar";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Navbar>
			{children}
		</Navbar>
	);
}