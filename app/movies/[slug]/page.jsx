import movies from "@/data/movies.json";
import Link from "next/link";

export async function generateStaticParams() {
  return movies.map((movie) => ({
    slug: movie.slug,
  }));
}

export default function MoviePage({ params }) {
  const movie = movies.find((m) => m.slug === params.slug);

  if (!movie) return <div className="text-white p-10">Film bulunamadı.</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <header className="bg-gray-800 py-4 px-6 shadow-lg sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-white">🎥 CineReserve</Link>
            <Link href="/" className="hover:text-accent">Anasayfa</Link>
            <Link href="/movies" className="hover:text-accent">Filmler</Link>
            <Link href="/cinemas" className="hover:text-accent">Sinemalar</Link>
          </div>
        </div>
      </header>

      {/* Movie Info */}
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">{movie.title}</h1>

        {/* Trailer */}
        <div className="mb-8">
          <iframe
            className="w-full rounded"
            height="400"
            src={movie.trailerUrl}
            title={movie.title}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        {/* Movie Details */}
        <div className="space-y-3 mb-8">
          <p><strong>Vizyon Tarihi:</strong> {movie.releaseDate}</p>
          <p><strong>Tür:</strong> {movie.genre}</p>
          <p><strong>Süre:</strong> {movie.duration}</p>
          <p><strong>Film Özeti:</strong> {movie.description}</p>
        </div>

        {/* Buy Ticket Button */}
        <Link
          href="/tickets"
          className="bg-accent text-white px-6 py-3 rounded shadow hover:bg-accent-light transition"
        >
          🎟️ Bilet Al
        </Link>
      </main>
    </div>
  );
}
