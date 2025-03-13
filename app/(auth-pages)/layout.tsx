import AppNavbarAuth from "../auth/components/header/navbar-auth";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<AppNavbarAuth />
			<main className="w-full">
				{children}
			</main>
		</>
	);
}