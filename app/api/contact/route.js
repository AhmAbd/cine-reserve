import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  const data = await request.json();

  const dir = path.join(process.cwd(), "messages");
  const filename = `${Date.now()}.json`;

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Dosya yazma hatası:", error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
