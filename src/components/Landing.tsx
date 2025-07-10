import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaTools, FaClipboardCheck, FaUserShield, FaArrowRight, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import '../styles/Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Back button */}
      <button 
        className="back-button" 
        onClick={() => navigate('/')}
      >
        <FaArrowLeft /> Back to Role Selection
      </button>
      
      {/* Header/Navigation */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <FaHome className="logo-icon" />
            <h1>Southland Roofing</h1>
          </div>
        </div>
        <div className="header-center">
          <nav className="nav">
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div className="header-right">
          <div className="auth-buttons">
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Professional Roofing Management System</h1>
          <p>Streamline your roofing business operations with our comprehensive management solution</p>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/register')}
          >
            Get Started <FaArrowRight />
          </button>
        </div>
        <div className="hero-image"></div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <FaClipboardCheck />
            </div>
            <h3>Project Management</h3>
            <p>Track and manage all your roofing projects from start to finish with our intuitive dashboard.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FaTools />
            </div>
            <h3>Inventory Control</h3>
            <p>Keep track of materials, tools, and equipment with our comprehensive inventory management system.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FaUserShield />
            </div>
            <h3>Client Portal</h3>
            <p>Provide your clients with a secure portal to view project progress, invoices, and communicate with your team.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2 className="section-title">Key Features</h2>
        <div className="features-container">
          <div className="feature-image"></div>
          <div className="feature-list">
            <div className="feature-item">
              <h3>Real-time Project Tracking</h3>
              <p>Monitor project progress, timelines, and milestones in real-time.</p>
            </div>
            <div className="feature-item">
              <h3>Automated Scheduling</h3>
              <p>Optimize crew assignments and scheduling with our AI-powered system.</p>
            </div>
            <div className="feature-item">
              <h3>Digital Estimates & Invoicing</h3>
              <p>Create professional estimates and invoices with just a few clicks.</p>
            </div>
            <div className="feature-item">
              <h3>Mobile Accessibility</h3>
              <p>Access your roofing business data from anywhere, on any device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Southland Roofing has transformed how we manage our roofing projects. The efficiency gains have been remarkable."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-image"></div>
              <div className="author-info">
                <h4>John Smith</h4>
                <p>Smith Roofing Co.</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The client portal feature has significantly improved our customer satisfaction. Our clients love being able to track their project's progress."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-image"></div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>Johnson Roofing Solutions</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The inventory management system has saved us thousands by preventing overordering and material waste."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-image"></div>
              <div className="author-info">
                <h4>Michael Davis</h4>
                <p>Davis & Sons Roofing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <p>(555) 123-4567</p>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <p>info@southlandroofing.com</p>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <p>123 Roofing Way, Building City, RC 12345</p>
            </div>
          </div>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Your email" />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="How can we help you?" rows={5}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FaHome className="logo-icon" />
            <h2>Southland Roofing</h2>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#team">Our Team</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <ul>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#guides">Guides</a></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Southland Roofing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
