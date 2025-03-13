"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { updateProfileImageAction, updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo electrónico válido.",
  }).optional(),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(user);
        
        const googlePicture = user.identities?.find(identity => identity.provider === 'google')?.identity_data?.picture;
        
        form.reset({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        });

        if (user.user_metadata?.avatar_url) {
          setAvatarPreview(user.user_metadata.avatar_url);
        } else if (googlePicture) {
          setAvatarPreview(googlePicture);
          
          form.setValue('avatar_url', googlePicture);
          
          if (!user.user_metadata?.avatar_url) {
            await supabase.auth.updateUser({
              data: {
                avatar_url: googlePicture,
              },
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase, router, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("profileImage", file);
      
      const result = await updateProfileImageAction(formData);
      
      if (result?.includes('?')) {
        const url = new URL(result, window.location.origin);
        const type = url.searchParams.get('type');
        const message = url.searchParams.get('message');
        
        if (type === 'success') {
          toast.success(message || 'Imagen actualizada correctamente');
          
          const { data: { user: updatedUser } } = await supabase.auth.getUser();
          if (updatedUser?.user_metadata?.avatar_url) {
            form.setValue('avatar_url', updatedUser.user_metadata.avatar_url);
          }
        } else {
          toast.error(message || 'Error al actualizar la imagen');
        }
      }
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      
      const result = await updateProfileAction(formData);
      
      if (result?.includes('?')) {
        const url = new URL(result, window.location.origin);
        const type = url.searchParams.get('type');
        const message = url.searchParams.get('message');
        
        if (type === 'success') {
          toast.success(message || 'Perfil actualizado correctamente');
        } else {
          toast.error(message || 'Error al actualizar el perfil');
        }
      } else {
        toast.success("Perfil actualizado correctamente");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-full max-w-md p-8 space-y-4 bg-card rounded-lg animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage
                    src={avatarPreview || undefined}
                    alt="Profile picture"
                />
                <AvatarFallback className="bg-primary-500 text-white text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Perfil de Usuario</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este es el nombre que se mostrará en tu perfil.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="tu@ejemplo.com" 
                          {...field} 
                          disabled 
                        />
                      </FormControl>
                      <FormDescription>
                        Tu correo electrónico no se puede cambiar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({  }) => (
                    <FormItem>
                      <FormLabel>Imagen de perfil</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2"
                            >
                              <Upload size={16} />
                              {isUploading ? "Subiendo..." : "Subir imagen"}
                            </Button>
                            
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Sube una imagen para tu perfil (máximo 5MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
            <CardDescription>
              Actualiza tu contraseña para mantener tu cuenta segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push("/forgot-password")}
            >
              Cambiar contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}