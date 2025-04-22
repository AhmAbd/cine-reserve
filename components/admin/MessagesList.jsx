'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
} from 'firebase/firestore';

const MessagesList = () => {
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [readMessages, setReadMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Kullanıcıyı kontrol et ve admin olup olmadığını kontrol et
    const checkIfAdmin = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdTokenResult();
        if (!token.claims.admin) {
          // Admin değilse login sayfasına yönlendir
          router.push('/admin/login');
        }
      } else {
        // Giriş yapmamışsa login sayfasına yönlendir
        router.push('/admin/login');
      }
    };

    checkIfAdmin();

    // Veritabanı işlemleri
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
  }, [router]);

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
    <li
      key={msg.id}
      className="p-6 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl"
    >
      <p><strong>Ad Soyad:</strong> {msg.name}</p>
      <p><strong>Telefon:</strong> {msg.phone}</p>
      <p><strong>E-posta:</strong> {msg.email}</p>
      <p><strong>Mesaj:</strong> {msg.message}</p>
      <p className="text-sm text-gray-400 mt-2">
        {msg.timestamp?.toDate?.().toLocaleString?.() || 'Tarih yok'}
      </p>

      {!msg.isRead && (
        <button
          onClick={() => handleMarkAsRead(msg.id)}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all transform hover:scale-105"
        >
          Okundu olarak işaretle
        </button>
      )}

      <div className="mt-4">
        <textarea
          placeholder="Yanıtınızı yazın..."
          className="w-full p-3 border rounded-md mb-3 dark:bg-gray-900 dark:border-gray-700 transition-all transform focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={selectedEmail === msg.email ? replyText : ''}
          onChange={(e) => {
            setReplyText(e.target.value);
            setSelectedEmail(msg.email);
          }}
        />
        <button
          onClick={handleReply}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          Yanıtla
        </button>
      </div>
    </li>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 dark:bg-black-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Gelen Mesajlar</h2>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          placeholder="İsim, telefon veya e-posta ara..."
          className="p-3 border rounded-md w-full md:max-w-md dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-4">
          <div>
            <label className="text-sm block">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="text-sm block">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 border rounded-md dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-red-600">📩 Okunmamış Mesajlar</h3>
          {filterMessages(unreadMessages).length === 0 ? (
            <p>Henüz okunmamış mesaj yok.</p>
          ) : (
            <ul className="space-y-6">
              {filterMessages(unreadMessages).map(renderMessage)}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-green-600">📨 Okunan Mesajlar</h3>
          {filterMessages(readMessages).length === 0 ? (
            <p>Henüz okunan mesaj yok.</p>
          ) : (
            <ul className="space-y-6">
              {filterMessages(readMessages).map(renderMessage)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesList;
