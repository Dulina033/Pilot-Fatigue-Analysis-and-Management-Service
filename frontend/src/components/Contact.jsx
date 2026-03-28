// src/components/Contact.jsx - Updated with API call
import React, { useState } from "react";
import config from "../config";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setError(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p className="subtitle">
            Get in touch with our team for any inquiries or support
          </p>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Visit Us</h3>
            <p>Flightara Aviation Systems</p>
            <p> Galle Main Road</p>
            <p>Colombo, Sri Lanka</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>Call Us</h3>
            <p>+94 77 123 4567</p>
            <p>+94 11 234 5678</p>
            <p className="info-note">24/7 Support Available</p>
          </div>

          <div className="info-card">
            <div className="info-icon">✉️</div>
            <h3>Email Us</h3>
            <p>support@flightara.com</p>
            
          </div>

          <div className="info-card">
            <div className="info-icon">🕒</div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9:00 - 18:00</p>
            <p>Saturday: 10:00 - 14:00</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        {/* Contact Form */}
        <div
          className="contact-form-container"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <h2>Send Us a Message</h2>

          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>
                Your message has been sent successfully. We'll get back to you
                soon.
              </p>
              <button
                className="send-another-btn"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  rows="5"
                  className="form-textarea"
                  disabled={loading}
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Message →"}
              </button>
            </form>
          )}
        </div>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How quickly can I get support?</h3>
              <p>
                Our support team typically responds within 2-4 hours during
                business hours. For urgent issues, we recommend calling our 24/7
                support line.
              </p>
            </div>
            <div className="faq-item">
              <h3>Do you offer training for new users?</h3>
              <p>
                Yes! We provide comprehensive training sessions for all new
                clients, including documentation, video tutorials, and live
                onboarding calls.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is there a demo available?</h3>
              <p>
                Absolutely! Contact our sales team to schedule a personalized
                demo of Flightara's full capabilities.
              </p>
            </div>
            <div className="faq-item">
              <h3>What are your pricing plans?</h3>
              <p>
                We offer flexible pricing based on airline size and
                requirements. Contact our sales team for a customized quote.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
