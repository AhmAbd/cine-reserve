<<<<<<< HEAD
import cinemas from "@/data/cinemas.json";
=======
import cinemas from "../../../data/cinemas.json";
import MovieCard from "../../../components/MovieCard";
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
import Link from "next/link";

export async function generateStaticParams() {
  return cinemas.map((cinema) => ({
    slug: cinema.slug,
  }));
}

export default function CinemaPage({ params }) {
  const cinema = cinemas.find((c) => c.slug === params.slug);
<<<<<<< HEAD

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
=======
  if (!cinema) return <div className="text-white p-10">Sinema bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      {/* Cinema Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">{cinema.name}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      {/* Cinema Image */}
      <div className="mb-10 max-w-4xl mx-auto">
        <img
          src={cinema.imgSrc}
          alt={cinema.name}
          className="w-full h-[400px] object-cover rounded-xl shadow-lg"
        />
      </div>

      {/* Location Button */}
      <div className="text-center mb-16">
        <a
          href={cinema.mapLink}
          target="_blank"
          className="inline-block bg-[#a020f0] text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-600 transition"
        >
          Haritada Görüntüle
        </a>
      </div>

      {/* Weekly Schedule Section */}
      <section className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-2 text-white">Haftalık Gösterim Takvimi</h2>
          <div className="w-24 h-1 bg-[#a020f0] mx-auto rounded-full" />
          <p className="text-sm text-gray-400 mt-3">
            Bu sinemada hafta boyunca gösterimde olan filmleri aşağıda bulabilirsiniz.
          </p>
        </div>

        {/* Day-by-Day Movie List */}
        {cinema.weeklySchedule.map((daySchedule) => (
          <div key={daySchedule.day} className="mb-14">
            {/* Day Title */}
            <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-6">
              <h3 className="text-2xl font-semibold text-white">{daySchedule.day}</h3>
              <span className="text-sm text-gray-400">
                {daySchedule.movies.length} film
              </span>
            </div>

            {/* Movie Cards */}
            {daySchedule.movies.length === 0 ? (
              <p className="text-gray-500">Bugün için herhangi bir film gösterimi bulunmamaktadır.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {daySchedule.movies.map((movie) => (
                  <Link key={movie.slug} href={`/movies/${movie.slug}`}>
                    <div className="movie-card hover:scale-105 transition-transform">
                      <MovieCard movie={movie} showtime={movie.showtime} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
>>>>>>> cec14f642888ae23c6a43b1d1651a722ffe9c631
    </div>
  );
}
