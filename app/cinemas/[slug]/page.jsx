import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function CinemaDetailPage({ params }) {
  const cinemaId = params.slug; // ✅ fix

  const docRef = doc(db, 'cinemas', cinemaId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return <div className="text-white p-10">Sinema bulunamadı.</div>;
  }

  const cinema = docSnap.data();

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">{cinema.name}</h1>
        <div className="w-16 h-1 bg-[#a020f0] mx-auto rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 shadow-md">
        <p className="mb-4"><span className="font-semibold">Slug:</span> {cinema.slug}</p>
        <p className="mb-4"><span className="font-semibold">Location:</span> {cinema.location}</p>
        <p className="mb-4"><span className="font-semibold">Seats:</span> {cinema.seats}</p>
        {cinema.mapLink && (
          <a
            href={cinema.mapLink}
            target="_blank"
            className="text-[#a020f0] underline"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        )}
      </div>
    </div>
  );
}
