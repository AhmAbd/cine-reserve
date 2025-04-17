import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Paneli</h1>
      <nav className="space-y-4">
        <Link href="/admin/users" className="text-blue-600">Kullanıcılar</Link>
        <Link href="/admin/manage" className="text-blue-600">Film ve Sinema Ekle</Link>
        <Link href="/admin/movies" className="text-blue-600">Filmler</Link>
        <Link href="/admin/cinemas" className="text-blue-600">Sinema Salonları</Link>
      </nav>
    </div>
  );
}
