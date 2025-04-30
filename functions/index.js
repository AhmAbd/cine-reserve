// functions/index.js
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

exports.cleanupPastShowtimes = onSchedule('every 24 hours', async (context) => {
  const db = getFirestore();
  const filmsRef = db.collection('films');
  const snapshot = await filmsRef.get();
  const currentTime = new Date();

  let totalRemoved = 0;

  for (const doc of snapshot.docs) {
    const film = doc.data();
    if (!film.cinemas || film.cinemas.length === 0) continue;

    const validCinemas = film.cinemas.filter((cinema) => {
      try {
        const showtime = cinema.showtime?.toDate ? cinema.showtime.toDate() : new Date(cinema.showtime);
        if (isNaN(showtime.getTime())) {
          console.warn(`Invalid showtime in film ${doc.id}:`, cinema.showtime);
          return false;
        }
        return showtime >= currentTime;
      } catch (err) {
        console.warn(`Error processing showtime in film ${doc.id}:`, err);
        return false;
      }
    });

    if (validCinemas.length !== film.cinemas.length) {
      await doc.ref.update({ cinemas: validCinemas });
      const removedCount = film.cinemas.length - validCinemas.length;
      totalRemoved += removedCount;
      console.log(`Film ${doc.id}: Removed ${removedCount} past showtimes`);
    }
  }

  console.log(`Cleanup completed. Total past showtimes removed: ${totalRemoved}`);
  return null;
});