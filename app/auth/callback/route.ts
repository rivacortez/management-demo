import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { routesConfig } from "@/lib/config/routes";
import { Profile } from "../interfaces/Profile";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (data?.user && !error) {
      // Check if this is a Google sign-in
      const isGoogleProvider = data.user.app_metadata.provider === 'google';
      const userEmail = data.user.email;
      
      if (isGoogleProvider && userEmail) {
        try {
          // Check if a profile exists for this user in the profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error checking for existing profile:', profileError);
          }
          
          // If a profile exists but is linked to a different auth user, we need to merge them
          if (profileData && profileData.id !== data.user.id) {
            // Get the existing profile data
            const existingProfile: Profile = {
              username: profileData.username || data.user.user_metadata.full_name || '',
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone_number: profileData.phone_number,
              address: profileData.address,
              district: profileData.district,
              avatar_url: profileData.avatar_url || data.user.user_metadata.avatar_url
            };
            
            // Update the user metadata to preserve profile data
            await supabase.auth.updateUser({
              data: {
                full_name: existingProfile.first_name && existingProfile.last_name ? 
                  `${existingProfile.first_name} ${existingProfile.last_name}` : 
                  data.user.user_metadata.full_name,
                avatar_url: existingProfile.avatar_url || data.user.user_metadata.avatar_url,
                // Add other profile fields to preserve
                phone_number: existingProfile.phone_number,
                address: existingProfile.address,
                district: existingProfile.district
              }
            });
            
            // Update the profiles table to link to the new auth user ID
            await supabase
              .from('profiles')
              .update({ id: data.user.id })
              .eq('email', userEmail);
          }
        } catch (err) {
          console.error('Error handling Google sign-in profile preservation:', err);
        }
      }
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}${routesConfig.public.home.path}`);
}