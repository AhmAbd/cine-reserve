'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../../hooks/useRequireAuth';

const UpdateInfoPage = () => {
  const { user: currentUser, loading: authLoading } = useRequireAuth();

  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Tarih formatlayıcı (timestamp ya da string destekler)
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') return timestamp;
    const dateObj = timestamp.toDate();
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (authLoading || !currentUser) return;

    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log('Firestore kullanıcı verisi:', data); // debug için

          const birthDate = data.birthdate ? formatDate(data.birthdate) : '';

          setUserInfo({
            firstName: data.name || '',
            lastName: data.surname || '',
            phone: data.phone || '',
            email: data.mail || '',
            birthDate: birthDate,
            gender: data.gender || '',
          });
        } else {
          setError('Kullanıcı verisi bulunamadı.');
        }
      } catch (err) {
        console.error('Kullanıcı bilgileri alınamadı:', err);
        setError('Kullanıcı bilgileri alınırken hata oluştu.');
      }
    };

    fetchData();
  }, [currentUser, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      setError('Kullanıcı bulunamadı.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: userInfo.firstName,
        surname: userInfo.lastName,
        phone: userInfo.phone,
        mail: userInfo.email,
        birthdate: userInfo.birthDate, // string olarak kaydedilir
        gender: userInfo.gender,
      });

      alert('Bilgileriniz başarıyla güncellendi!');
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      setError('Bilgiler güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto bg-white shadow-xl p-10 rounded-xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-800">Kişisel Bilgiler</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">İsim</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={userInfo.firstName}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Soyisim</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={userInfo.lastName}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={userInfo.phone}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={userInfo.birthDate}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-black"
            required
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Cinsiyet</label>
          <select
            id="gender"
            name="gender"
            value={userInfo.gender}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-lg bg-gray-50 text-black"
            required
          >
            <option value="">Seçiniz</option>
            <option value="Male">Erkek</option>
            <option value="Female">Kadın</option>
            <option value="Other">Diğer</option>
          </select>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateInfoPage;
