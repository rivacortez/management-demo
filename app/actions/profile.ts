"use server";

import { createClient } from "@/utils/supabase/server";
import { routesConfig } from "@/lib/config/routes";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to create a redirect URL with query parameters
 */
function createRedirectURL(type: string, path: string, message: string) {
  const params = new URLSearchParams();
  params.set("type", type);
  params.set("message", message);
  return `${path}?${params.toString()}`;
}

/**
 * Sign in action for email/password authentication
 */
export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return createRedirectURL(
        "error",
        "/sign-in",
        "Credenciales incorrectas. Por favor intenta de nuevo."
    );
  }

  return redirect(routesConfig.public.home.path);
}

/**
 * Sign up action for email/password registration
 */
export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return createRedirectURL(
        "error",
        "/sign-up",
        "Error al registrarse. Por favor intenta de nuevo."
    );
  }

  return createRedirectURL(
      "success",
      "/sign-in",
      "¡Registro exitoso! Por favor verifica tu correo para activar tu cuenta."
  );
}

/**
 * Sign out action
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
}

/**
 * Password reset request action
 */
export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  });

  if (error) {
    return createRedirectURL(
        "error",
        "/forgot-password",
        "Error al enviar el correo de recuperación."
    );
  }

  return createRedirectURL(
      "success",
      "/sign-in",
      "Se ha enviado un correo con instrucciones para restablecer tu contraseña."
  );
}

/**
 * Reset password action
 */
export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return createRedirectURL(
        "error",
        "/reset-password",
        "Las contraseñas no coinciden."
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return createRedirectURL(
        "error",
        "/reset-password",
        "Error al actualizar la contraseña."
    );
  }

  return createRedirectURL(
      "success",
      "/sign-in",
      "Contraseña actualizada correctamente. Puedes iniciar sesión."
  );
}

/**
 * Update profile information
 */
export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return createRedirectURL(
        "error",
        "/profile",
        "No se pudo obtener información del usuario."
    );
  }

  const full_name = formData.get("full_name") as string;

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name,
    }
  });

  if (error) {
    return createRedirectURL(
        "error",
        "/profile",
        "Error al actualizar el perfil."
    );
  }

  return createRedirectURL(
      "success",
      "/profile",
      "Perfil actualizado correctamente."
  );
}

/**
 * Update profile image
 */
export async function updateProfileImageAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return createRedirectURL(
        "error",
        "/profile",
        "No se pudo obtener información del usuario."
    );
  }

  const profileImage = formData.get("profileImage") as File;

  if (!profileImage) {
    return createRedirectURL(
        "error",
        "/profile",
        "No se ha seleccionado ninguna imagen."
    );
  }

  try {
    // Check file size (max 5MB)
    if (profileImage.size > 5 * 1024 * 1024) {
      return createRedirectURL(
          "error",
          "/profile",
          "La imagen no puede ser mayor a 5MB."
      );
    }

    const fileExt = profileImage.name.split('.').pop();
    const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: true
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

    const avatarUrl = data.publicUrl;

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl
      }
    });

    if (updateError) {
      throw updateError;
    }

    return createRedirectURL(
        "success",
        "/profile",
        "Imagen de perfil actualizada correctamente."
    );
  } catch (error) {
    console.error("Error updating profile image:", error);
    return createRedirectURL(
        "error",
        "/profile",
        "Error al actualizar la imagen de perfil."
    );
  }
}