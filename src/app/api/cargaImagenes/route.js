import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim().replace(/^"|"$/g, ""),
  api_key: process.env.CLOUDINARY_API_KEY?.trim().replace(/^"|"$/g, ""),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim().replace(/^"|"$/g, ""),
});

console.log("Cloudinary Config Loaded. Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      console.log("Error: No se encontró el archivo en formData");
      return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 });
    }

    console.log("Iniciando subida a Cloudinary:", file.name);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'inspecciones' }, (err, result) => {
        if (err) {
          console.error("Cloudinary error callback:", err);
          reject(err);
        }
        resolve(result);
      }).end(buffer);
    });

    console.log("Subida exitosa:", response.secure_url);
    return NextResponse.json({ url: response.secure_url });
  } catch (error) {
    console.error("Error en API Route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}