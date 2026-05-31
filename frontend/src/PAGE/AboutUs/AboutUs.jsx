import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchAboutInfo();
    fetchStats();
  }, []);

  const fetchAboutInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/public/about-us`);
      if (response.data.success) {
        setAboutInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching about info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/public/about-us/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/public/about-us/contact`,
        contactForm
      );

      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: response.data.message
        });
        setContactForm({ name: '', email: '', phone: '', message: '' });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to submit contact form'
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!aboutInfo) {
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load school information</p>
      </div>
    );
  }

  return (
    <div className={styles.aboutUsContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <img 
            src={aboutInfo.logo} 
            alt={aboutInfo.schoolName} 
            className={styles.schoolLogo}
            onError={(e) => {
              e.target.src = '/icon.svg'; // Fallback logo
            }}
          />
          <h1 className={styles.schoolName}>{aboutInfo.schoolName}</h1>
          <p className={styles.schoolDescription}>{aboutInfo.description}</p>
        </div>
      </section>

      {/* Statistics Section */}
      {stats && (
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>{stats.totalStudents}</h3>
              <p>Students</p>
            </div>
            <div className={styles.statCard}>
              <h3>{stats.totalStaff}</h3>
              <p>Staff Members</p>
            </div>
            <div className={styles.statCard}>
              <h3>{stats.yearsOfExperience}</h3>
              <p>Years of Experience</p>
            </div>
            <div className={styles.statCard}>
              <h3>{stats.successRate}</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </section>
      )}

      {/* Mission and Vision Section */}
      <section className={styles.missionVisionSection}>
        <div className={styles.contentGrid}>
          <div className={styles.missionCard}>
            <h2>Our Mission</h2>
            <p>{aboutInfo.mission}</p>
          </div>
          <div className={styles.visionCard}>
            <h2>Our Vision</h2>
            <p>{aboutInfo.vision}</p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className={styles.programsSection}>
        <h2>Our Programs</h2>
        <div className={styles.programsGrid}>
          {aboutInfo.programs.map((program, index) => (
            <div key={index} className={styles.programCard}>
              <div className={styles.programIcon}>📚</div>
              <h3>{program}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities Section */}
      <section className={styles.facilitiesSection}>
        <h2>Our Facilities</h2>
        <div className={styles.facilitiesGrid}>
          {aboutInfo.facilities.map((facility, index) => (
            <div key={index} className={styles.facilityCard}>
              <div className={styles.facilityIcon}>✓</div>
              <p>{facility}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <h2>Contact Us</h2>
        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <h3>Get in Touch</h3>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <div>
                  <strong>Address</strong>
                  <p>{aboutInfo.contactDetails.address}</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>{aboutInfo.contactDetails.phone}</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>{aboutInfo.contactDetails.email}</p>
                </div>
              </div>
              {aboutInfo.contactDetails.website && (
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>🌐</span>
                  <div>
                    <strong>Website</strong>
                    <p>
                      <a 
                        href={aboutInfo.contactDetails.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {aboutInfo.contactDetails.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {(aboutInfo.socialMedia.facebook || aboutInfo.socialMedia.twitter || 
              aboutInfo.socialMedia.instagram || aboutInfo.socialMedia.linkedin) && (
              <div className={styles.socialMedia}>
                <h4>Follow Us</h4>
                <div className={styles.socialLinks}>
                  {aboutInfo.socialMedia.facebook && (
                    <a href={aboutInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </a>
                  )}
                  {aboutInfo.socialMedia.twitter && (
                    <a href={aboutInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </a>
                  )}
                  {aboutInfo.socialMedia.instagram && (
                    <a href={aboutInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  )}
                  {aboutInfo.socialMedia.linkedin && (
                    <a href={aboutInfo.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.contactForm}>
            <h3>Send Us a Message</h3>
            <form onSubmit={handleSubmitContact}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              {submitStatus.message && (
                <div className={`${styles.submitStatus} ${styles[submitStatus.type]}`}>
                  {submitStatus.message}
                </div>
              )}
              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Established {aboutInfo.establishedYear} | Accredited by {aboutInfo.accreditation}
        </p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} {aboutInfo.schoolName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
