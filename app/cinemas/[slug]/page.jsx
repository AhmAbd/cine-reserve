import cinemas from "@/data/cinemas.json";
import Link from "next/link";

export async function generateStaticParams() {
  return cinemas.map((cinema) => ({
    slug: cinema.slug,
  }));
}

export default function CinemaPage({ params }) {
  const cinema = cinemas.find((c) => c.slug === params.slug);

  if (!cinema) return <div className="text-white p-10">Sinema bulunamadı.</div>;

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

      {/* Cinema Info */}
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">{cinema.name}</h1>
        <img src={cinema.imgSrc} alt={cinema.name} className="w-full h-auto rounded mb-6" />
        <a
          href={cinema.mapLink}
          target="_blank"
          className="inline-block bg-accent text-white px-4 py-2 rounded mb-8 hover:bg-accent-light transition"
        >
          📍 Haritada Görüntüle
        </a>

        {/* Weekly Schedule */}
        <div>
          {cinema.weeklySchedule.map((daySchedule) => (
            <div key={daySchedule.day} className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">{daySchedule.day}</h2>
              {daySchedule.movies.map((movie) => (
                <div key={movie.slug} className="bg-gray-800 p-4 rounded mb-3">
                  <h3 className="text-xl font-bold">{movie.title}</h3>
                  <p className="text-gray-300">Süre: {movie.duration} • Tür: {movie.genre}</p>
                  <p className="text-gray-400">Vizyon Tarihi: {movie.showtime}</p>
                  <Link
                    href={`/movies/${movie.slug}`}
                    className="mt-2 inline-block bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
                  >
                    Film Sayfası →
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
