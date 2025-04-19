'use client';

import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import countryCodes from '../utils/countryCodes';

const Contact = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(countryCodes[0].value); // Varsayılan ülke kodu
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Firebase'e mesaj ekliyoruz
      await addDoc(collection(db, 'messages'), {
        name: `${firstName} ${lastName}`,
        email,
        phone: `${countryCode} ${phone}`,
        message,
        isRead: false,
        timestamp: serverTimestamp(),
      });

      // Formu sıfırlıyoruz
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setCountryCode(countryCodes[0].value);
      alert('Mesajınız gönderildi!');
    } catch (err) {
      setError('Mesaj gönderilirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-center mb-6">İletişim Formu</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4 flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="firstName" className="block text-sm font-medium text-white-700">
              Adınız
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border border-white-300 rounded-md"
              required
            />
          </div>

          <div className="w-1/2">
            <label htmlFor="lastName" className="block text-sm font-medium text-white-700">
              Soyadınız
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border border-white-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-white-700">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-white-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4 flex">
          <div className="w-1/4">
            <label htmlFor="countryCode" className="block text-sm font-medium text-white-700">
              Ülke Kodu
            </label>
            <select
              id="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full p-2 border border-white-300 rounded-md"
            >
              {countryCodes.map((code) => (
                <option key={code.value} value={code.value} className={code.color}>
                  {code.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-3/4 pl-4">
            <label htmlFor="phone" className="block text-sm font-medium text-white-700">
              Telefon Numarası
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-white-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-white-700">
            Mesajınız
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-white-300 rounded-md"
            rows="4"
            required
          />
        </div>

        <div className="mb-4 text-center">
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
