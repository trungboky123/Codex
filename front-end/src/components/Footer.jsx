import { Link } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-column">
          <strong>Contact</strong>
          <div className="contact-item">
            <span>📧</span>
            <span>trunghiennguyen71@gmail.com</span>
          </div>
          <div className="contact-item">
            <span>📞</span>
            <span>+84 833210030</span>
          </div>
          <div className="contact-item">
            <span>📍</span>
            <span>18 Hoang Quoc Viet, Ha Noi</span>
          </div>
        </div>

        <div class="footer-column">
          <strong>About Us</strong>
          <Link className="social-item" to="#">
            Online Learning
          </Link>
          <Link className="social-item" to="#">
            Certified Courses
          </Link>
          <Link className="social-item" to="#">
            Trusted by Students
          </Link>
        </div>

        <div className="footer-column">
          <strong>Follow Us</strong>
          <Link to="https://www.facebook.com/buihien.tiensi.58/" className="social-item" target="blank">
            Facebook
          </Link>
          <Link to="https://www.instagram.com/its.trhin/" className="social-item" target="blank">
            Instagram
          </Link>
          <Link to="https://www.tiktok.com/@ngtrh_hgbaov?lang=en" className="social-item">
            Tiktok
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright © 2026 <b>Code X</b>. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
