import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

export async function deleteInvalidTickets() {
  const ticketRef = collection(db, 'tickets');
  const snapshot = await getDocs(ticketRef);
  const allTickets = snapshot.docs;

  let deletedCount = 0;

  for (const docSnap of allTickets) {
    const data = docSnap.data();
    const id = docSnap.id;

    const isMissing =
      !data.movieName ||
      data.movieName === 'Bilinmeyen Film' ||
      !data.cinemaName ||
      data.cinemaName === 'Bilinmeyen Sinema' ||
      !data.seats || data.seats.length === 0;

    if (isMissing) {
      await deleteDoc(doc(db, 'tickets', id));
      console.log(`🗑️ Deleted invalid ticket: ${id}`);
      deletedCount++;
    }
  }

  console.log(`✅ Cleanup complete. ${deletedCount} invalid ticket(s) deleted.`);
}
