import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic"; // Dosya sistemindeki değişiklikleri anında göstersin

export default function MessagesPage() {
  const messagesDir = path.join(process.cwd(), "messages");
  let files = [];
  let messages = [];

  try {
    files = fs.readdirSync(messagesDir);

    messages = files.map((file) => {
      const filePath = path.join(messagesDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    });
  } catch (err) {
    console.error("Mesaj klasörü okunamadı:", err);
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Gelen Mesajlar</h1>
      {messages.length === 0 ? (
        <p>Henüz mesaj yok.</p>
      ) : (
        <ul className="space-y-6">
          {messages.map((msg, index) => (
            <li key={index} className="p-4 border rounded shadow-sm">
              <p>
                <strong>Ad:</strong> {msg.name}
              </p>
              <p>
                <strong>Soyad:</strong> {msg.surname}
              </p>
              <p>
                <strong>Telefon:</strong> {msg.phone}
              </p>
              <p>
                <strong>E-posta:</strong> {msg.email}
              </p>
              <p>
                <strong>Mesaj:</strong> {msg.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
