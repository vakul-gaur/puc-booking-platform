import "./Home.css";
import heroBg from "../assets/hero.png";
import footBg from "../assets/foot.png";

import { Home as HomeIcon, ShieldCheck, Zap, Clock, FileText, Leaf, ArrowRight, 
  Play, Star, CheckCircle2, Bike, Car, Truck, Check, X } from "lucide-react";

export default function Home() {
  return (
    <div className="home-layout">

      <section id="home" className="hero-section" style={{ backgroundImage: `url(${heroBg})` }} >
        <div className="hero-content">
          <div className="pill-badge">
            <span className="badge-car">🚗</span> Hassle-Free. Trusted. At Your Doorstep.
          </div>

          <h1 className="hero-heading">
            Book Your PUC <br />
            in Just a <span className="highlight-green">Few Clicks</span>
          </h1>

          <p className="hero-description">
            Get your vehicle's Pollution Under Control (PUC) certificate from the
            comfort of your home. Fast, reliable and convenient.
          </p>

          <div className="hero-buttons">
            <button className="btn-solid-green"> Book Now <ArrowRight size={16} /> </button>
            <button className="btn-outline-green">
              <Play size={14} className="fill-green" /> Watch How It Works
            </button>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-item">
              <span className="trust-icon-box"><HomeIcon size={14} /></span>
              <span>Doorstep Service</span>
            </div>

            <div className="trust-item">
              <span className="trust-icon-box"><ShieldCheck size={14} /></span>
              <span>Certified Checkers</span>
            </div>

            <div className="trust-item">
              <span className="trust-icon-box"><Zap size={14} /></span>
              <span>Instant Certificate</span>
            </div>

          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="why-layout-row">
          <div className="why-left-text">
            <span className="subheading-tag">
              <span>🚗</span> WHY PUCNow?
            </span>
            <h2 className="section-main-heading">
              Smarter Way to Stay Compliant
            </h2>
            <p className="section-side-text">
              We make vehicle's compliance simple, fast and stress-free. Because a
              cleaner tomorrow starts with you.
            </p>
          </div>

          <div className="features-container">
            <div className="feature-card">
              <div className="feature-circle-icon bg-green">
                <HomeIcon size={22} color="#fff" />
              </div>
              <h3>Home Service</h3>
              <p>We come to you at your convenience.</p>
            </div>

            <div className="feature-card">
              <div className="feature-circle-icon bg-blue">
                <Clock size={22} color="#fff" />
              </div>
              <h3>Quick & Easy Booking</h3>
              <p>Book in seconds, no long queues.</p>
            </div>

            <div className="feature-card">
              <div className="feature-circle-icon bg-orange">
                <ShieldCheck size={22} color="#fff" />
              </div>
              <h3>Verified Checkers</h3>
              <p>Trained & certified professionals.</p>
            </div>

            <div className="feature-card">
              <div className="feature-circle-icon bg-purple">
                <FileText size={22} color="#fff" />
              </div>
              <h3>Instant Certificate</h3>
              <p>Get your PUC certificate digitally, on the spot.</p>
            </div>

            <div className="feature-card">
              <div className="feature-circle-icon bg-cyan">
                <Leaf size={22} color="#fff" />
              </div>
              <h3>Cleaner Environment</h3>
              <p>Contribute to a healthier planet.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section">
        <div className="steps-grid">
          <div className="steps-left-col">
            <span className="subheading-tag">
              <span>🚗</span> HOW IT WORKS
            </span>
            <h2 className="section-main-heading">
              Get Your PUC in 4 Simple Steps
            </h2>
            <p className="section-side-text mb-6">
              From booking to certificate, we've made it effortless for you.
            </p>
            <button className="btn-solid-green">
              Book Now <ArrowRight size={16} />
            </button>
          </div>

          <div className="steps-timeline">
            <div className="step-box">
              <div className="step-circle">
                <span className="step-emoji">📱</span>
                <span className="step-counter">1</span>
              </div>
              <h4>Book Your Slot</h4>
              <p>Choose your preferred date and time.</p>
            </div>

            <ArrowRight className="step-flow-arrow" />

            <div className="step-box">
              <div className="step-circle">
                <span className="step-emoji">👨‍🔧</span>
                <span className="step-counter">2</span>
              </div>
              <h4>Checker Visits</h4>
              <p>Our certified checker arrives at your location.</p>
            </div>

            <ArrowRight className="step-flow-arrow" />

            <div className="step-box">
              <div className="step-circle">
                <span className="step-emoji">🚙</span>
                <span className="step-counter">3</span>
              </div>
              <h4>Vehicle Testing</h4>
              <p>Quick and precise emission check.</p>
            </div>

            <ArrowRight className="step-flow-arrow" />

            <div className="step-box">
              <div className="step-circle">
                <span className="step-emoji">📋</span>
                <span className="step-counter">4</span>
              </div>
              <h4>Get Your Certificate</h4>
              <p>Receive your PUC certificate digitally, instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="pricing-header">
          <span className="subheading-tag center-tag">
            <span>🚗</span> SIMPLE PRICING
          </span>
          <h2 className="section-main-heading">
            Choose the Right Plan for Your Vehicle
          </h2>
          <p className="section-side-text center-text">
            No hidden charges. Pay only for what you need.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-icon-box bg-blue">
              <Bike size={24} color="#fff" />
            </div>
            <h3>Two-Wheeler</h3>
            <div className="pricing-amount">₹99 <span>/ check</span></div>
            <ul className="pricing-features">
              <li><Check size={16} className="check-icon" /> Doorstep service</li>
              <li><Check size={16} className="check-icon" /> Certified checker</li>
              <li><Check size={16} className="check-icon" /> Instant digital certificate</li>
            </ul>
            <button className="btn-outline-green pricing-btn">Book Now</button>
          </div>

          <div className="pricing-card popular">
            <span className="popular-badge">Most Popular</span>
            <div className="pricing-icon-box bg-green">
              <Car size={24} color="#fff" />
            </div>
            <h3>Four-Wheeler</h3>
            <div className="pricing-amount">₹199 <span>/ check</span></div>
            <ul className="pricing-features">
              <li><Check size={16} className="check-icon" /> Doorstep service</li>
              <li><Check size={16} className="check-icon" /> Certified checker</li>
              <li><Check size={16} className="check-icon" /> Instant digital certificate</li>
              <li><Check size={16} className="check-icon" /> Priority slot booking</li>
            </ul>
            <button className="btn-solid-green pricing-btn">Book Now</button>
          </div>

          <div className="pricing-card">
            <div className="pricing-icon-box bg-orange">
              <Truck size={24} color="#fff" />
            </div>
            <h3>Commercial Vehicle</h3>
            <div className="pricing-amount">₹349 <span>/ check</span></div>
            <ul className="pricing-features">
              <li><Check size={16} className="check-icon" /> Doorstep service</li>
              <li><Check size={16} className="check-icon" /> Certified checker</li>
              <li><Check size={16} className="check-icon" /> Instant digital certificate</li>
              <li><Check size={16} className="check-icon" /> Fleet discounts available</li>
            </ul>
            <button className="btn-outline-green pricing-btn">Book Now</button>
          </div>
        </div>
      </section>

      <section className="comparison-section">
        <div className="pricing-header">
          <span className="subheading-tag center-tag">
            <span>🚗</span> WHY CHOOSE US
          </span>
          <h2 className="section-main-heading">
            PUCNow vs Traditional PUC Centers
          </h2>
        </div>

        <div className="comparison-table">
          <div className="comparison-row comparison-head">
            <div className="comparison-cell label-cell"></div>
            <div className="comparison-cell highlight-cell">PUCNow</div>
            <div className="comparison-cell">Traditional Centers</div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell label-cell">Doorstep Service</div>
            <div className="comparison-cell highlight-cell"><Check size={18} className="check-icon" /></div>
            <div className="comparison-cell"><X size={18} className="cross-icon" /></div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell label-cell">Waiting Time</div>
            <div className="comparison-cell highlight-cell">~15 mins</div>
            <div className="comparison-cell">1-2 hours</div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell label-cell">Certified Checkers</div>
            <div className="comparison-cell highlight-cell"><Check size={18} className="check-icon" /></div>
            <div className="comparison-cell">Varies</div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell label-cell">Digital Certificate</div>
            <div className="comparison-cell highlight-cell">Instant</div>
            <div className="comparison-cell">Manual / Delayed</div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell label-cell">Price Transparency</div>
            <div className="comparison-cell highlight-cell"><Check size={18} className="check-icon" /></div>
            <div className="comparison-cell"><X size={18} className="cross-icon" /></div>
          </div>
        </div>
      </section>

      <section
        className="impact-banner"
        style={{ backgroundImage: `linear-gradient(to right, #032b23 45%, rgba(3, 43, 35, 0.15) 85%), url(${footBg})` }}
      >
        <div className="impact-left-content">
          <span className="banner-subheading">
            <span>🚗</span> DRIVE CLEANER
          </span>

          <h2 className="banner-heading">
            Cleaner Air. A <span className="highlight-mint">Healthier Future.</span>
          </h2>

          <p className="banner-subtext">
            Every PUC check counts. Join thousands of responsible vehicle
            owners who are making our cities cleaner and greener.
          </p>

          <div className="banner-metrics">
            <div className="metric-box">
              <Leaf size={24} className="metric-icon" />
              <div>
                <span className="metric-num">50K+</span>
                <span className="metric-lbl">Happy Customers</span>
              </div>
            </div>

            <div className="metric-box">
              <Star size={24} className="metric-icon fill-current" />
              <div>
                <span className="metric-num">4.8/5</span>
                <span className="metric-lbl">Average Rating</span>
              </div>
            </div>

            <div className="metric-box">
              <CheckCircle2 size={24} className="metric-icon" />
              <div>
                <span className="metric-num">99%</span>
                <span className="metric-lbl">On-Time Service</span>
              </div>
            </div>
          </div>
        </div>

        <div className="impact-quote-box">
          <p className="cursive-quote">
            Cleaner <br />
            Tomorrow <span className="quote-leaf">🌱</span>
          </p>
        </div>
      </section>
    </div>
  );
}