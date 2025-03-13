import { resetPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
	searchParams: Promise<Message>;
}) {
	const searchParams = await props.searchParams;

	return (
		<form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto">
			<div>
				<h1 className="text-2xl font-medium">Restablecer contraseña</h1>
				<p className="text-sm text-secondary-foreground">
					Ingresa tu nueva contraseña a continuación.
				</p>
			</div>
			<div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
				<Label htmlFor="password">Nueva contraseña</Label>
				<Input
					type="password"
					name="password"
					placeholder="Ingresa nueva contraseña"
					minLength={6}
					required
				/>
				<Label htmlFor="confirmPassword">Confirmar contraseña</Label>
				<Input
					type="password"
					name="confirmPassword"
					placeholder="Confirma tu contraseña"
					minLength={6}
					required
				/>
				<SubmitButton formAction={resetPasswordAction}>
					Actualizar contraseña
				</SubmitButton>
				<FormMessage message={searchParams} />
			</div>
		</form>
	);
}