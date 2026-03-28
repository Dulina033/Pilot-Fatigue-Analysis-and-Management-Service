import React, { useState } from "react";
import config from "../config";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    middleName: "",
    lastName: "",
    photo: null,
    dob: "",
    nationality: "",
    passport: "",
    address: "",
    email: "",
    phone: "",
    pilotId: "",
    rank: "",
    location: "",
    license: "",
  });

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        alert("Image too large. Max size is 5MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formDataToSend = { ...formData };

    try {
      if (formData.photo) {
        formDataToSend.photo = await readFileAsDataURL(formData.photo);
      }

      const response = await fetch(`${config.API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataToSend),
      });

      if (!response.ok) {
        alert("Server error");
        return;
      }

      const data = await response.json();
      alert(data.success ? "Registration Successful!" : "Failed to register.");
    } catch {
      alert("Submission error");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>

        {/* ✅ LOGO SECTION (KEPT) */}
        <div className="form-header">
          <img src="/images/logo.png" alt="Logo" className="logo" />
          <h2 className="form-title">Pilot Registration</h2>
          <p className="form-subtitle">
            Enter pilot personal and professional details
          </p>
        </div>

        <h3>Personal Information</h3>
        <div className="form-group triple">
          <input type="text" placeholder="First Name" name="fullName" onChange={handleChange} />
          <input type="text" placeholder="Middle Name" name="middleName" onChange={handleChange} />
          <input type="text" placeholder="Last Name" name="lastName" onChange={handleChange} />
        </div>

        <div className="form-group">
          <input type="file" name="photo" accept="image/*" onChange={handleChange} />
        </div>

        <div className="form-group">
          <input type="date" name="dob" onChange={handleChange} />
        </div>

        <div className="form-group">
          <input type="text" placeholder="Nationality" name="nationality" onChange={handleChange} />
        </div>

        <div className="form-group">
          <input type="text" placeholder="Passport / ID Number" name="passport" onChange={handleChange} />
        </div>

        <div className="form-group">
          <textarea placeholder="Address" name="address" onChange={handleChange}></textarea>
        </div>

        <h3>Contact Details</h3>
        <div className="form-group double">
          <input type="email" placeholder="Email Address" name="email" onChange={handleChange} />
          <input type="tel" placeholder="Phone Number" name="phone" onChange={handleChange} />
        </div>

        <h3>Professional Details</h3>
        <div className="form-group">
          <input type="text" placeholder="Pilot ID" name="pilotId" onChange={handleChange} />
          <input type="text" placeholder="Rank / Role" name="rank" onChange={handleChange} />
          <input type="text" placeholder="Base Location" name="location" onChange={handleChange} />
          <select name="license" onChange={handleChange}>
            <option value="">License Type</option>
            <option value="PPL">PPL</option>
            <option value="CPL">CPL</option>
            <option value="ATPL">ATPL</option>
          </select>
        </div>

        {/* ✅ REGISTER BUTTON (KEPT COLOR & STYLE) */}
        <button type="submit" className="submit-btn">
          REGISTER
        </button>

      </form>
    </div>
  );
}
