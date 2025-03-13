"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
	user: User | null;
	loading: boolean;
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const supabase = createClient();

	const refreshUser = useCallback(async () => {
		try {
			const { data: sessionData, error: sessionError } =
				await supabase.auth.getSession();
			if (sessionError) {
				console.error("Error getting session:", sessionError);
				throw sessionError;
			}

			if (sessionData?.session) {
				const { data: userData, error: userError } =
					await supabase.auth.getUser();

				if (userError) {
					console.error("Error getting user data:", userError);
					throw userError;
				}

				setUser(userData.user);
			} else {
				console.log("No hay sesión activa");
				setUser(null);
			}
		} catch (error) {
			console.error("Error refreshing user:", error);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	useEffect(() => {
		refreshUser();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log("Auth state changed:", event, session?.user?.email);

				if (session) {
					setUser(session.user);
				} else {
					setUser(null);
				}

				setLoading(false);
			},
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [supabase, refreshUser]);

	return (
		<AuthContext.Provider value={{ user, loading, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);