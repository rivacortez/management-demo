import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file was uploaded" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const fileName = `${Date.now()}.webp`;

        const { data, error } = await supabase.storage
            .from(process.env.BUCKET!)
            .upload(`imagenes/${fileName}`, buffer, {
                contentType: "image/webp",
                upsert: false,
            });


        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const imageUrl = supabase.storage
            .from(process.env.BUCKET!)
            .getPublicUrl(`imagenes/${fileName}`).data.publicUrl;

        return NextResponse.json({
            success: true,
            path: data?.path,
            url: imageUrl
        }, { status: 200 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Error uploading file", details: (error as Error).message },
            { status: 500 }
        );
    }
}