import { db } from '../../../lib/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Link from 'next/link';

export default async function CinemaDetailPage({ params }) {
  const cinemaId = params.slug;

  const cinemaRef = doc(db, 'cinemas', cinemaId);
  const cinemaSnap = await getDoc(cinemaRef);
  if (!cinemaSnap.exists()) return <div className="text-white p-10">Sinema bulunamadı.</div>;
  const cinema = cinemaSnap.data();

  const filmsSnap = await getDocs(collection(db, 'films'));
  const now = new Date();

  const showings = [];

  filmsSnap.forEach((docSnap) => {
    const data = docSnap.data();
    data.cinemas?.forEach((s) => {
      if (s.id === cinemaId && s.showtime) {
        const showtimeDate = new Date(s.showtime);
        if (showtimeDate >= now) {
          showings.push({
            movieId: docSnap.id,
            slug: data.slug,
            title: data.title,
            genre: data.genre,
            duration: data.duration,
            imgSrc: data.imgSrc,
            showtime: showtimeDate,
          });
        }
      }
    });
  });

  // ✅ Group showings by date
  const grouped = {};
  showings.forEach((item) => {
    const dateKey = item.showtime.toISOString().split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  // ✅ Sort dates chronologically
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">{cinema.name}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
        <p className="text-sm mt-2 text-gray-400">{cinema.location}</p>
        {cinema.mapLink && (
          <a
            href={cinema.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#a020f0] underline mt-1 inline-block"
          >
            Google Maps'te Aç
          </a>
        )}
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        {sortedDates.map((date) => (
          <div key={date}>
            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-[#a020f0] inline-block pb-1">
              {new Date(date).toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grouped[date].map((movie) => (
                <div key={movie.slug} className="bg-gray-800 rounded-lg p-4 shadow-md">
                  <img
                    src={movie.imgSrc}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  <h3 className="text-lg font-bold mb-1">{movie.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {movie.genre} • {movie.duration}
                  </p>
                  <p className="text-sm text-gray-300 mb-4">
                    Seans: {movie.showtime.toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <Link
                    href={`/tickets/select-seat?movie=${movie.slug}&cinema=${cinemaId}`}
                    className="bg-[#a020f0] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition"
                  >
                    Bilet Al
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
