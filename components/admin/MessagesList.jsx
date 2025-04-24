'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { motion } from 'framer-motion';

const MessagesList = () => {
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [readMessages, setReadMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const redirectToLogin = useCallback(() => {
    router.push('/admin/login');
  }, [router]);

  // Admin kontrolü
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdTokenResult();
          if (!token.claims.admin) {
            redirectToLogin();
          }
        } catch (err) {
          console.error('Token alma hatası:', err);
          redirectToLogin();
        }
      } else {
        redirectToLogin();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [redirectToLogin]);

  // Mesajları yükleme
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUnreadMessages(allMessages.filter((msg) => msg.isRead === false));
      setReadMessages(allMessages.filter((msg) => msg.isRead === true));
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const messageRef = doc(db, 'messages', id);
      await updateDoc(messageRef, {
        isRead: true,
      });
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
  };

  const handleReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;

    try {
      const res = await fetch('/api/sendReply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmail,
          subject: 'Mesajınıza Yanıt',
          text: replyText,
        }),
      });

      if (res.ok) {
        alert('Yanıt başarıyla gönderildi.');
        setReplyText('');
        setSelectedEmail(null);
      } else {
        alert('Yanıt gönderilemedi.');
      }
    } catch (err) {
      console.error('Yanıt gönderme hatası:', err);
    }
  };

  const filterMessages = (messages) =>
    messages.filter((msg) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        msg.name?.toLowerCase().includes(q) ||
        msg.phone?.toLowerCase().includes(q) ||
        msg.email?.toLowerCase().includes(q);

      const msgDate = msg.timestamp?.toDate?.();
      const matchesDate =
        (!startDate || new Date(startDate) <= msgDate) &&
        (!endDate || new Date(endDate) >= msgDate);

      return matchesSearch && matchesDate;
    });

  const renderMessage = (msg) => (
    <motion.li
      key={msg.id}
      className="p-6 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/20 shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-white"><strong className="text-purple-400">Ad Soyad:</strong> {msg.name}</p>
      <p className="text-white"><strong className="text-purple-400">Telefon:</strong> {msg.phone}</p>
      <p className="text-white"><strong className="text-purple-400">E-posta:</strong> {msg.email}</p>
      <p className="text-white"><strong className="text-purple-400">Mesaj:</strong> {msg.message}</p>
      <p className="text-sm text-gray-400 mt-2">
        {msg.timestamp?.toDate?.().toLocaleString?.() || 'Tarih yok'}
      </p>

      {!msg.isRead && (
        <motion.button
          onClick={() => handleMarkAsRead(msg.id)}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Okundu olarak işaretle
        </motion.button>
      )}

      <div className="mt-4">
        <textarea
          placeholder="Yanıtınızı yazın..."
          className="w-full p-3 border rounded-md bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
          value={selectedEmail === msg.email ? replyText : ''}
          onChange={(e) => {
            setReplyText(e.target.value);
            setSelectedEmail(msg.email);
          }}
        />
        <motion.button
          onClick={handleReply}
          className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Yanıtla
        </motion.button>
      </div>
    </motion.li>
  );

  if (loading) {
    return <div className="min-h-screen w-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col">
      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black via-purple-950 to-black pointer-events-none z-0"
        initial={{
          background: 'linear-gradient(180deg, #000000 0%, #000000 50%, #000000 100%)',
        }}
        animate={{
          background: 'linear-gradient(180deg, #000000 0%, #2d1a4b 50%, #000000 100%)',
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      {/* Static Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.6 + 0.2,
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            ease: 'easeInOut',
            delay: Math.random() * 1,
          }}
        />
      ))}

      {/* Nebula Glow */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          className="relative z-10 max-w-7xl mx-auto py-10 px-4 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            📬 Gelen Mesajlar
          </motion.h2>

          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.input
              type="text"
              placeholder="İsim, telefon veya e-posta ara..."
              className="p-3 border rounded-md w-full md:max-w-md bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="text-sm block text-gray-400">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-3 border rounded-md bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="text-sm block text-gray-400">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-3 border rounded-md bg-gray-900 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                />
              </motion.div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-red-600">📩 Okunmamış Mesajlar</h3>
              {filterMessages(unreadMessages).length === 0 ? (
                <p className="text-gray-400">Henüz okunmamış mesaj yok.</p>
              ) : (
                <ul className="space-y-6">
                  {filterMessages(unreadMessages).map(renderMessage)}
                </ul>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-green-600">📨 Okunan Mesajlar</h3>
              {filterMessages(readMessages).length === 0 ? (
                <p className="text-gray-400">Henüz okunan mesaj yok.</p>
              ) : (
                <ul className="space-y-6">
                  {filterMessages(readMessages).map(renderMessage)}
                </ul>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MessagesList;