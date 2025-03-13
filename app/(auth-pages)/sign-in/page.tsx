import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/app/auth/components/google-sign-in-button";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
      <div className="flex min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 dark:bg-primary/10 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Accede a tu cuenta
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administra tus proyectos y colabora con tu equipo de forma segura.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-6 flex justify-center lg:justify-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                </div>
              </div>

              <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 lg:text-left">
                Bienvenido
              </h1>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 lg:text-left">
                ¿No tienes una cuenta?{" "}
                <Link
                    className="font-medium text-primary transition-colors hover:text-primary/80 dark:hover:text-primary/80"
                    href="/sign-up"
                >
                  Regístrate
                </Link>
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                <GoogleSignInButton />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 dark:bg-neutral-900 dark:text-gray-400">
                  O continúa con correo
                </span>
                </div>
              </div>

              <form className="space-y-5">
                <div className="space-y-1">
                  <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Correo electrónico
                  </Label>
                  <Input
                      name="email"
                      id="email"
                      placeholder="tu@ejemplo.com"
                      required
                      className="
                    h-11 w-full rounded-lg border border-gray-300 px-4
                    text-gray-900 placeholder-gray-400 focus:border-primary
                    focus:ring focus:ring-primary/20 transition-all
                    dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100
                    dark:placeholder-gray-600 dark:focus:ring-primary/20
                  "
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Contraseña
                    </Label>
                    <Link
                        className="text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        href="/forgot-password"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Tu contraseña"
                      required
                      className="
                    h-11 w-full rounded-lg border border-gray-300 px-4
                    text-gray-900 placeholder-gray-400 focus:border-primary
                    focus:ring focus:ring-primary/20 transition-all
                    dark:border-gray-700 dark:bg-neutral-800 dark:text-gray-100
                    dark:placeholder-gray-600 dark:focus:ring-primary/20
                  "
                  />
                </div>

                <div className="flex items-center">
                  <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-700"
                  />
                  <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
                  >
                    Mantener sesión iniciada
                  </label>
                </div>

                <SubmitButton
                    pendingText="Iniciando sesión..."
                    formAction={signInAction}
                    className="h-11 w-full rounded-lg bg-primary font-medium text-black transition-colors hover:bg-primary/90 "
                >
                  Iniciar sesión
                </SubmitButton>

                <div className="text-center">
                  <FormMessage message={searchParams} />
                </div>
              </form>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
              Al iniciar sesión, aceptas nuestros{" "}
              <Link
                  href="/terms"
                  className="text-primary hover:text-primary/80 dark:hover:text-primary/80"
              >
                Términos de servicio
              </Link>{" "}
              y{" "}
              <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80 dark:hover:text-primary/80"
              >
                Política de privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
