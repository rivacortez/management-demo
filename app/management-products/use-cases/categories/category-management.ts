import { supabase } from '@/app/config/supabase'


export async function deleteImage(path: string) {
  const { error } = await supabase.storage
      .from(process.env.BUCKET!)
    .remove([path])

  if (error) throw error
}

export async function uploadImage(file: File) {
  const fileName = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage

      .from(process.env.BUCKET!)
    .upload(`photos/${fileName}`, file)

  if (error) throw error

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.BUCKET}/photos/${fileName}`;

}

