"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function AppNavbarAuth() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();



    return (
        <nav className="w-full sticky top-0 z-50 border-b border-b-foreground/10 bg-background backdrop-blur-md supports-backdrop-blur:bg-background/60">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 text-sm">
                <div className="flex items-center">
                    <Link href={"/"} className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors">
                        <span>Ferretería </span>
                    </Link>
                </div>



                <div className="flex items-center gap-3">

                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/profile">
                                        <Button variant="ghost" size="sm">Perfil</Button>
                                    </Link>
                                    <form action="/api/auth/signout" method="post">
                                        <Button variant="outline" size="sm" type="submit">
                                            Cerrar sesión
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link href="/sign-in">
                                        <Button variant="ghost" size="sm" className={"dark:text-color:#00000"}>Iniciar sesión</Button>
                                    </Link>
                                    <Link href="/sign-up">
                                        <Button size="sm">Registrarse</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <ModeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </Button>
                    </div>
                </div>
            </div>


        </nav>
    );
}