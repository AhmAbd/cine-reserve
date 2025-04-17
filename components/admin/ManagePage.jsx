'use client';

import AddFilm from './AddFilm';
import AddCinema from './AddCinema';

export default function ManagePage() {
  return (
    <div className="bg-black-100 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Film ve Sinema Ekle</h2>

      <AddFilm />
      <AddCinema />
    </div>
  );
}
