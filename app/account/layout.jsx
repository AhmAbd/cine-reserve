import Link from 'next/link';
import '../../styles/globals.css'; // varsa global stiller

export const metadata = {
  title: 'Hesabım',
};

export default function AccountLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-black-100 text-white">
      <aside className="w-1/4 bg-gradient-to-b from-purple-800 to-blue-950 p-6 rounded-r-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-8">Hesap Yönetimi</h2>
        <nav className="space-y-4">
          <Link href="/account/update-info" className="block p-3 rounded-lg hover:bg-blue-500 transition">
            Bilgilerimi Güncelle
          </Link>
          <Link href="/account/tickets" className="block p-3 rounded-lg hover:bg-blue-500 transition">
            Geçmiş Biletlerim
          </Link>
          <Link href="/account/favorites" className="block p-3 rounded-lg hover:bg-blue-500 transition">
            Favorilerim
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
