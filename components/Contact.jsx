'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import countryCodes from '../utils/countryCodes';

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: countryCodes[0].value,
    message: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Save to Firestore
      await addDoc(collection(db, 'messages'), {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: `${formData.countryCode} ${formData.phone}`,
        message: formData.message,
        isRead: false,
        timestamp: serverTimestamp(),
      });

      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        countryCode: countryCodes[0].value,
        message: ''
      });
      setSuccess(true);
    } catch (err) {
      setError('Mesajınız gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      setShowErrorModal(true);
      console.error('Firestore error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-close modals after 3 seconds
  useEffect(() => {
    const timers = [];
    
    if (success) {
      timers.push(setTimeout(() => setSuccess(false), 3000));
    }
    
    if (showErrorModal) {
      timers.push(setTimeout(() => setShowErrorModal(false), 3000));
    }
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [success, showErrorModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 sm:p-6 relative">
      {/* Main Form Container */}
      <div className={`w-full max-w-2xl bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-10 transition-all duration-300 z-10 ${
        success || showErrorModal ? 'opacity-50 blur-sm' : 'opacity-100 blur-0'
      }`}>
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-purple-500 mb-6 sm:mb-8 hover:scale-105 transition-transform duration-300">
          İletişim Formu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Fields */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 group">
              <label className="block text-sm text-gray-300 mb-1">Adınız*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
            <div className="w-full sm:w-1/2 group">
              <label className="block text-sm text-gray-300 mb-1">Soyadınız*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm text-gray-300 mb-1">E-posta*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3 group">
              <label className="block text-sm text-gray-300 mb-1">Ülke Kodu*</label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {countryCodes.map((code) => (
                  <option key={code.value} value={code.value}>
                    {code.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-2/3 group">
              <label className="block text-sm text-gray-300 mb-1">Telefon*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Message */}
          <div className="group">
            <label className="block text-sm text-gray-300 mb-1">Mesajınız*</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              className="w-full p-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 w-full sm:w-auto sm:px-8 rounded-xl font-bold transition-all duration-300 ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 shadow-lg'
              } text-white`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gönderiliyor...
                </span>
              ) : 'Gönder'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-20 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative z-10 bg-gradient-to-br from-green-500 to-green-600 text-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 w-8 sm:w-10 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Mesajınız Gönderildi!</h3>
              <p className="text-sm sm:text-base mb-4 sm:mb-6">En kısa sürede sizinle iletişime geçeceğiz.</p>
              <div className="w-full bg-green-100/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-100 h-full rounded-full animate-countdown" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-20 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative z-10 bg-gradient-to-br from-red-500 to-red-600 text-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 w-8 sm:w-10 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Gönderim Başarısız!</h3>
              <p className="text-sm sm:text-base mb-4 sm:mb-6">{error}</p>
              <div className="w-full bg-red-100/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-100 h-full rounded-full animate-countdown" style={{ animationDuration: '3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;