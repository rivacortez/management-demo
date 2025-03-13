"use client";

import { Button } from "./ui/button";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, User } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { routesConfig } from "@/lib/config/routes";
import { createClient } from "@/utils/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
import { useAuth } from "@/app/context/AuthContext";

interface UserRole {
	role: {
		role: string;
	};
}

export default function HeaderOptions() {
	const { user } = useAuth();
	const [roles, setRoles] = useState<string[]>([]);
	const supabase = createClient();
	console.log("user", user);

	const fetchUserRoles = useCallback(async () => {
		if (!user) {
			setRoles([]);
			return;
		}

		const { data } = (await supabase
			.from("users_roles")
			.select(`
                role:roles (
                    role
                )
            `)
			.eq("user_id", user.id)) as {
			data: UserRole[] | null;
			error: PostgrestError | null;
		};

		setRoles(data?.map((ur) => ur.role.role) || []);
	}, [user, supabase]);

	useEffect(() => {
		fetchUserRoles();
	}, [fetchUserRoles]);

	const generalNavigationItems = [
		{ href: routesConfig.public.home.path, label: "Inicio" },
		
	];

	const adminNavigationItems = [
		{ href: routesConfig.private.dashboard.path, label: "Dashboard" },
		{ href: routesConfig.private.admin.path, label: "Admin Panel" },
	];

	if (!user) {
		return (
			<div className="flex items-center gap-4">
				{/* Menú móvil para no autenticados */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="md:hidden">
							<Menu className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{generalNavigationItems.slice(0, 2).map((item) => (
							<DropdownMenuItem key={item.href} asChild>
								<Link href={item.href} className="w-full cursor-pointer">
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
						<DropdownMenuItem asChild>
							<Link
								href={routesConfig.public.signIn.path}
								className="w-full cursor-pointer font-medium"
							>
								Iniciar sesión
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Menú para dispositivos grandes para no autenticados */}
				<div className="hidden sm:block">
					{generalNavigationItems.slice(0, 2).map((item) => (
						<Button key={item.href} variant={"ghost"}>
							<Link href={item.href} className="w-full cursor-pointer">
								{item.label}
							</Link>
						</Button>
					))}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center gap-4">
				{generalNavigationItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className="w-full cursor-pointer"
					>
						<Button variant={"ghost"} className="w-full">
							{item.label}
						</Button>
					</Link>
				))}
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="gap-2">
						{user?.user_metadata.avatar_url ? (
							<Avatar className="w-7 h-7">
								<AvatarImage src={user?.user_metadata.avatar_url} />
							</Avatar>
						) : (
							<Avatar className="w-7 h-7">
								<AvatarFallback className="w-7 h-7">
									<User className="h-5 w-5" />
								</AvatarFallback>
							</Avatar>
						)}
						<span className="hidden sm:inline">
							{user?.user_metadata.user_name ||
								user?.user_metadata.name ||
								user?.email?.split("@")[0]}
						</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					{generalNavigationItems.map((item) => (
						<DropdownMenuItem key={item.href} asChild>
							<Link href={item.href} className="w-full cursor-pointer">
								{item.label}
							</Link>
						</DropdownMenuItem>
					))}
					{/* Admin navigation items */}
					{roles.includes("admin") && (
						<>
							<DropdownMenuSeparator />
							{adminNavigationItems.map((item) => (
								<DropdownMenuItem key={item.href} asChild>
									<Link
										href={item.href}
										className="w-full cursor-pointer font-medium"
									>
										{item.label}
									</Link>
								</DropdownMenuItem>
							))}
						</>
					)}
					{/* Separator for visual separation */}
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link
							href={routesConfig.private.profile.path}
							className="w-full cursor-pointer font-medium"
						>
							Perfil
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<form action={signOutAction} className="w-full">
							<Button
								type="submit"
								variant="ghost"
								className="w-full cursor-pointer"
							>
								Sign out
							</Button>
						</form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}