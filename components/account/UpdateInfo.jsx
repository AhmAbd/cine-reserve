'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../../hooks/useRequireAuth';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

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
  const [notification, setNotification] = useState({ message: '', type: '' });

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
      setNotification({ message: 'Kullanıcı bulunamadı.', type: 'error' });
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

      setNotification({ message: 'Bilgileriniz başarıyla güncellendi!', type: 'success' });
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      setNotification({ message: 'Bilgiler güncellenirken bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    setNotification({ message: '', type: '' });
    if (notification.type === 'success') {
      router.push('/account');
    }
  };

  useEffect(() => {
    if (notification.message && notification.type === 'success') {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
        router.push('/account');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, router]);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white px-4 sm:px-6 py-12 overflow-hidden relative">
      {/* Parallax Background */}
      <div className="fixed inset-0 z-[-2]">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] opacity-80"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-indigo-900/30 opacity-50"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header with Tilt */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.3} glareColor="#9333ea">
          <motion.div
            className="text-center mb-12 bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/40 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h2
              className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Kişisel Bilgiler
            </motion.h2>
            <motion.div
              className="w-32 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full mx-auto mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.p
              className="text-lg text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Bilgilerinizi güncelleyin
            </motion.p>
          </motion.div>
        </Tilt>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 shadow-xl p-8 rounded-xl space-y-6 border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-200">İsim</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userInfo.firstName}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-purple-500/50 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-200">Soyisim</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userInfo.lastName}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-purple-500/50 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-200">Telefon</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={userInfo.phone}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-purple-500/50 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-purple-500/50 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200">Doğum Tarihi</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={userInfo.birthDate}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-purple-500/50 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-200">Cinsiyet</label>
            <select
              id="gender"
              name="gender"
              value={userInfo.gender}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-purple-500/50 rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="" className="bg-gray-800">Seçiniz</option>
              <option value="Male" className="bg-gray-800">Erkek</option>
              <option value="Female" className="bg-gray-800">Kadın</option>
              <option value="Other" className="bg-gray-800">Diğer</option>
            </select>
          </div>

          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  Güncelleniyor...
                </div>
              ) : (
                'Güncelle'
              )}
            </button>
          </motion.div>
        </motion.form>

        <AnimatePresence>
          {notification.message && (
            <motion.div
              className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border border-purple-500/30 max-w-sm w-full z-[2000] ${
                notification.type === 'success'
                  ? 'bg-gradient-to-r from-green-600/80 to-emerald-600/80'
                  : 'bg-gradient-to-r from-red-600/80 to-red-800/80'
              }`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="flex items-center gap-4">
                {notification.type === 'success' ? (
                  <motion.svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                )}
                <span className="text-lg font-medium text-white">{notification.message}</span>
              </div>
              <motion.button
                onClick={handleNotificationClose}
                className="absolute top-2 right-2 text-white hover:text-gray-200"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UpdateInfoPage;