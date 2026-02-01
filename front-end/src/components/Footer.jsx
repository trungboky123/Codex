import { Link } from "react-router-dom";
import "../css/Footer.css";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-column">
          <strong>{t("footer.contact")}</strong>
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
          <strong>{t("footer.aboutUs")}</strong>
          <Link className="social-item" to="#">
            {t("footer.onlineLearning")}
          </Link>
          <Link className="social-item" to="#">
            {t("footer.certifiedCourses")}
          </Link>
          <Link className="social-item" to="#">
            {t("footer.trustedByStudents")}
          </Link>
        </div>

        <div className="footer-column">
          <strong>{t("footer.followUs")}</strong>
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
        <p>{t("footer.copyright")} © 2026 <b>Code X</b>. {t("footer.rightsReserved")}</p>
      </div>
    </footer>
  );
}

export default Footer;
