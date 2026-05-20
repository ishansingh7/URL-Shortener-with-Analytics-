import {
  Link2,
  ShieldCheck,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  QrCode
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Home.css";

function Home() {
  return (
    <div className="url-home">

      {/* HERO SECTION */}
      <section className="url-hero">

        <div className="url-hero-left">

          <span className="url-hero-badge">
            Smart URL & QR Management Platform
          </span>

          <h1>
            Shorten URLs & <br />
            Generate QR Codes
          </h1>

          <p>
            Transform long links into clean short URLs and instantly
            generate secure QR codes for websites, businesses,
            marketing campaigns, and social sharing.
          </p>

          <div className="url-hero-buttons">

            <Link to="/login" className="url-primary-btn">
              Login to Shorten URL
              <ArrowRight size={18} />
            </Link>

            <button className="url-secondary-btn">
              Explore Features
            </button>

          </div>

          {/* LOGIN ALERT */}
          <div className="url-login-alert">
            🔒 Login required to create short URLs and QR codes
          </div>

          {/* STATS */}
          <div className="url-stats">

            <div className="url-stat-card">
              <h2>10M+</h2>
              <span>URLs Shortened</span>
            </div>

            <div className="url-stat-card">
              <h2>5M+</h2>
              <span>QR Codes Generated</span>
            </div>

            <div className="url-stat-card">
              <h2>99.9%</h2>
              <span>Secure Redirects</span>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="url-hero-right">

          <div className="url-dashboard-card">

            <div className="url-dashboard-top">
              <div className="url-circle url-red"></div>
              <div className="url-circle url-yellow"></div>
              <div className="url-circle url-green"></div>
            </div>

            <div className="url-dashboard-content">

              {/* LONG URL */}
              <div className="url-box">
                <p>Original URL</p>

                <span>
                  https://yourwebsite.com/product/details/12345
                </span>
              </div>

              <div className="url-arrow">↓</div>

              {/* SHORT URL */}
              <div className="url-short-url">
                <p>Short URL</p>
                <h3>url.ly/x7d2q</h3>
              </div>

              {/* QR SECTION */}
              <div className="url-qr-section">

                <div className="url-qr-icon">
                  <QrCode size={80} />
                </div>

                <div>
                  <h4>Instant QR Code</h4>
                  <p>
                    Scan and open your shortened URL instantly.
                  </p>
                </div>

              </div>

              {/* ANALYTICS */}
              <div className="url-analytics">

                <div className="url-analytics-card">
                  <BarChart3 size={22} />
                  <div>
                    <h4>24.5K</h4>
                    <span>Total Clicks</span>
                  </div>
                </div>

                <div className="url-analytics-card">
                  <Globe size={22} />
                  <div>
                    <h4>85+</h4>
                    <span>Countries</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="url-features">

        <div className="url-section-title">
          <h2>Everything You Need</h2>

          <p>
            Powerful tools for managing links and QR experiences.
          </p>
        </div>

        <div className="url-feature-grid">

          <div className="url-feature-card">
            <Link2 size={35} />

            <h3>URL Shortening</h3>

            <p>
              Convert lengthy URLs into short, clean, and shareable links.
            </p>
          </div>

          <div className="url-feature-card">
            <QrCode size={35} />

            <h3>QR Code Generator</h3>

            <p>
              Generate high-quality QR codes instantly for every short link.
            </p>
          </div>

          <div className="url-feature-card">
            <ShieldCheck size={35} />

            <h3>Secure Platform</h3>

            <p>
              Advanced security and encrypted redirects to protect your data.
            </p>
          </div>

          <div className="url-feature-card">
            <Zap size={35} />

            <h3>Fast Performance</h3>

            <p>
              Lightning-fast redirects with real-time analytics tracking.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;