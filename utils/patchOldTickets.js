import { db } from '../lib/firebase';
import {
  getDocs,
  getDoc,
  updateDoc,
  doc,
  collection,
  query,
} from 'firebase/firestore';

export async function patchOldTickets() {
  const ticketRef = collection(db, 'tickets');
  const q = query(ticketRef);
  const snapshot = await getDocs(q);
  const allTickets = snapshot.docs;

  console.log(`🔍 Scanning ${allTickets.length} ticket(s)...`);

  for (const docSnap of allTickets) {
    const ticket = docSnap.data();
    const ticketId = docSnap.id;

    let shouldUpdate = false;
    let movieName = ticket.movieName || 'Bilinmeyen Film';
    let cinemaName = ticket.cinemaName || 'Bilinmeyen Sinema';
    let session = ticket.session || null;
    let seats = ticket.seats || [];

    try {
      // 🎬 Fetch movie info
      if ((!ticket.movieName || !ticket.session) && ticket.movieId) {
        const movieSnap = await getDoc(doc(db, 'films', ticket.movieId));
        if (movieSnap.exists()) {
          const movieData = movieSnap.data();
          if (!ticket.movieName && movieData.title) {
            movieName = movieData.title;
            shouldUpdate = true;
          }
          if (!ticket.session) {
            const match = (movieData.cinemas || []).find((c) => c.id === ticket.cinemaId);
            if (match?.showtime) {
              session = match.showtime;
              shouldUpdate = true;
            }
          }
        }
      }

      // 🎥 Fetch cinema info
      if (!ticket.cinemaName && ticket.cinemaId) {
        const cinemaSnap = await getDoc(doc(db, 'cinemas', ticket.cinemaId));
        if (cinemaSnap.exists()) {
          const data = cinemaSnap.data();
          if (data.name) {
            cinemaName = data.name;
            shouldUpdate = true;
          }
        }
      }

      // 🎫 Try to patch seats from another collection (optional, if you saved booking separately)
      // For example: `bookings/${bookingId}` or another collection
      // if (!ticket.seats?.length && ticket.bookingId) {
      //   const bookingSnap = await getDoc(doc(db, 'bookings', ticket.bookingId));
      //   if (bookingSnap.exists()) {
      //     const data = bookingSnap.data();
      //     if (data.seats?.length) {
      //       seats = data.seats;
      //       shouldUpdate = true;
      //     }
      //   }
      // }

      // ✏️ Update Firestore if needed
      if (shouldUpdate) {
        await updateDoc(doc(db, 'tickets', ticketId), {
          movieName,
          cinemaName,
          session,
          seats, // Will remain unchanged unless overwritten above
        });
        console.log(`✅ Patched: ${ticketId}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${ticketId}:`, err);
    }
  }

  console.log('🎉 Tüm biletler kontrol edildi ve güncellendi.');
}
