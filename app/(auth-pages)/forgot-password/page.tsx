import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>

              <form className="flex flex-col w-full gap-2 text-foreground">
                <div className="text-center">
                  <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">Recuperar contraseña</h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    ¿Ya tienes una cuenta?{" "}
                    <Link className="font-medium text-primary hover:text-primary/80 transition-colors" href="/sign-in">
                      Inicia sesión
                    </Link>
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Correo electrónico
                    </Label>
                    <Input
                        name="email"
                        placeholder="tu@ejemplo.com"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <SubmitButton
                      formAction={forgotPasswordAction}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    Recuperar contraseña
                  </SubmitButton>

                  <div className="text-sm text-center">
                    <FormMessage message={searchParams} />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enviaremos un enlace a tu correo electrónico para restablecer tu contraseña
              </p>
            </div>
          </div>
        </div>
      </>
  );
}