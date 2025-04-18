"use client";

import { useState, useEffect } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    formattedPhone: "",
    countryCode: "+90",
    email: "",
    message: "",
  });

  const [phonePlaceholder, setPhonePlaceholder] = useState("555 555 55 55");

  const countryCodes = [
    {
      value: "+90",
      label: "🇹🇷 Türkiye (+90)",
      color: "bg-red-900/20 text-red-400",
      pattern: "555 555 55 55",
    },
    {
      value: "+1",
      label: "🇺🇸 ABD (+1)",
      color: "bg-blue-900/20 text-blue-400",
      pattern: "(555) 555-5555",
    },
    {
      value: "+44",
      label: "🇬🇧 İngiltere (+44)",
      color: "bg-purple-900/20 text-purple-400",
      pattern: "07700 555555",
    },
    {
      value: "+49",
      label: "🇩🇪 Almanya (+49)",
      color: "bg-yellow-900/20 text-yellow-400",
      pattern: "0171 5555555",
    },
    {
      value: "+33",
      label: "🇫🇷 Fransa (+33)",
      color: "bg-blue-900/20 text-blue-400",
      pattern: "06 12 34 56 78",
    },
    {
      value: "+39",
      label: "🇮🇹 İtalya (+39)",
      color: "bg-green-900/20 text-green-400",
      pattern: "312 345 6789",
    },
    {
      value: "+34",
      label: "🇪🇸 İspanya (+34)",
      color: "bg-red-900/20 text-red-400",
      pattern: "612 34 56 78",
    },
    {
      value: "+7",
      label: "🇷🇺 Rusya (+7)",
      color: "bg-blue-900/20 text-blue-400",
      pattern: "912 345-67-89",
    },
    {
      value: "+81",
      label: "🇯🇵 Japonya (+81)",
      color: "bg-red-900/20 text-red-400",
      pattern: "090-1234-5678",
    },
    {
      value: "+86",
      label: "🇨🇳 Çin (+86)",
      color: "bg-red-900/20 text-red-400",
      pattern: "131 2345 6789",
    },
  ];

  useEffect(() => {
    const selectedCountry = countryCodes.find(
      (c) => c.value === formData.countryCode
    );
    setPhonePlaceholder(selectedCountry?.pattern || "555 555 55 55");
    setFormData((prev) => ({ ...prev, phone: "", formattedPhone: "" }));
  }, [formData.countryCode]);

  const formatPhoneNumber = (phone, countryCode) => {
    const cleaned = phone.replace(/\D/g, "");

    switch (countryCode) {
      case "+1":
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      case "+44":
        return cleaned.length > 5
          ? `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
          : cleaned;
      case "+33":
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
      case "+49":
        return cleaned.replace(/(\d{4})(\d+)/, "$1 $2");
      case "+39":
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
      case "+34":
        return cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
      case "+7":
        return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2-$3-$4");
      case "+81":
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
      case "+86":
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
      default:
        return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;

    if (input.length < formData.formattedPhone.length) {
      const cleaned = formData.phone.slice(0, -1);
      setFormData({
        ...formData,
        phone: cleaned,
        formattedPhone: formatPhoneNumber(cleaned, formData.countryCode),
      });
      return;
    }

    const cleaned = input.replace(/\D/g, "");
    const formatted = formatPhoneNumber(cleaned, formData.countryCode);

    setFormData({
      ...formData,
      phone: cleaned,
      formattedPhone: formatted,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      const submissionData = { ...formData, phone: fullPhone };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        alert("Mesajınız başarıyla gönderildi!");
        setFormData({
          name: "",
          surname: "",
          phone: "",
          formattedPhone: "",
          countryCode: "+90",
          email: "",
          message: "",
        });
      } else {
        alert("Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Gönderim hatası:", error);
      alert("Sunucuya ulaşılamadı.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">İletişim</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Adınız"
            value={formData.name}
            onChange={handleChange}
            className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="text"
            name="surname"
            placeholder="Soyadınız"
            value={formData.surname}
            onChange={handleChange}
            className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            name="countryCode"
            value={formData.countryCode}
            onChange={handleChange}
            className={`p-3 border border-gray-300 dark:border-gray-700 rounded-lg w-40 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              countryCodes.find((c) => c.value === formData.countryCode)?.color
            }`}
          >
            {countryCodes.map((code) => (
              <option
                key={code.value}
                value={code.value}
                className={`${code.color} dark:bg-gray-800`}
              >
                {code.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-300 font-medium">
              {formData.countryCode}
            </span>
            <input
              type="tel"
              name="phone"
              placeholder={phonePlaceholder}
              value={formData.formattedPhone}
              onChange={handlePhoneChange}
              className="p-3 pl-16 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
        </div>

        <input
          type="email"
          name="email"
          placeholder="E-posta Adresiniz"
          value={formData.email}
          onChange={handleChange}
          className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          required
        />

        <textarea
          name="message"
          placeholder="Mesajınız"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          required
        ></textarea>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Gönder
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
