"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    mail: "",
    phone: "",
    day: "",
    month: "",
    year: "",
    gender: "",
    password: "",
    confirmPassword: "",
    sms: false,
    emailConsent: false,
    kvkkConsent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Şifreler uyuşmuyor.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.mail, form.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        mail: form.mail,
        birthdate: `${form.day}/${form.month}/${form.year}`,
        gender: form.gender,
        sms: form.sms,
        emailConsent: form.emailConsent,
        kvkkConsent: form.kvkkConsent,
        createdAt: new Date(),
      });

      alert("Kayıt başarılı!");
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  return (
    <div  style={outerPageStyle}>
      <div style={formContainerStyle}>
        <h1 style={headerStyle}>Üye Ol</h1>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={rowStyle}>
            <input name="name" placeholder="Adınız" value={form.name} onChange={handleChange} required style={inputStyle} />
            <input name="surname" placeholder="Soyadınız" value={form.surname} onChange={handleChange} required style={inputStyle} />
          </div>

          <input name="mail" type="email" placeholder="E-Posta" value={form.mail} onChange={handleChange} required style={inputStyle} />
          <input name="phone" placeholder="Cep Telefonu" value={form.phone} onChange={handleChange} required style={inputStyle} />

          <div style={rowStyle}>
            <select name="day" value={form.day} onChange={handleChange} required style={inputStyle}>
              <option value="">Gün</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select name="month" value={form.month} onChange={handleChange} required style={inputStyle}>
              <option value="">Ay</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select name="year" value={form.year} onChange={handleChange} required style={inputStyle}>
              <option value="">Yıl</option>
              {[...Array(100)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          <div style={genderStyle}>
            <label><input type="radio" name="gender" value="Kadın" onChange={handleChange} /> Kadın</label>
            <label><input type="radio" name="gender" value="Erkek" onChange={handleChange} /> Erkek</label>
          </div>

          <input name="password" type="password" placeholder="Şifre" value={form.password} onChange={handleChange} required style={inputStyle} />
          <input name="confirmPassword" type="password" placeholder="Şifre Tekrar" value={form.confirmPassword} onChange={handleChange} required style={inputStyle} />

          <label style={checkboxStyle}>
            <input type="checkbox" name="sms" checked={form.sms} onChange={handleChange} /> SMS almak istiyorum
          </label>
          <label style={checkboxStyle}>
            <input type="checkbox" name="emailConsent" checked={form.emailConsent} onChange={handleChange} /> E-posta almak istiyorum
          </label>
          <label style={checkboxStyle}>
            <input type="checkbox" name="kvkkConsent" checked={form.kvkkConsent} onChange={handleChange} required /> KVKK'yı okudum ve onaylıyorum.
          </label>

          <button type="submit" style={buttonStyle}>Üye Ol</button>
        </form>
      </div>
    </div>
  );
}

// Tam ekran siyah arka plan ve ortalama
const outerPageStyle = {
  color: "#fff",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "2rem",
};

// Form kutusu
const formContainerStyle = {
  backgroundColor: "#1a1a1a",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 0 20px rgba(255,255,255,0.05)",
  maxWidth: "500px",
  width: "100%",
};

// Başlık
const headerStyle = {
  color: "#a020f0",
  fontSize: "2rem",
  textAlign: "center",
  marginBottom: "1.5rem",
};

// Form içi stiller
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const inputStyle = {
  padding: "0.75rem",
  backgroundColor: "#2c2c2c",
  color: "#fff",
  border: "1px solid #444",
  borderRadius: "5px",
  fontSize: "1rem",
  flex: 1,
};

const rowStyle = {
  display: "flex",
  gap: "1rem",
};

const genderStyle = {
  display: "flex",
  gap: "1rem",
  fontSize: "0.9rem",
};

const checkboxStyle = {
  fontSize: "0.85rem",
};

const buttonStyle = {
  padding: "0.75rem",
  backgroundColor: "#a020f0",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
};
