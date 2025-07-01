import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>ARTSPHERE</h3>
          <p>Inspiring creativity through art education and community engagement since 2010.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/workshop">Workshops</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>123 Art Street, Creative City</p>
          <p>Phone: 071-111-1111</p>
          <p>Email: info@artsphere.com</p>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-pinterest"></i></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ARTSPHERE. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer;
