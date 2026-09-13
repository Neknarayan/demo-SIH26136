import React from "react";
import { Globe, Mail, Phone, ExternalLink } from "lucide-react";
import logoImg from "../assets/maharastraGov.jpeg";
export const Footer: React.FC = () => {
  return (
    <footer className="gov-footer">
      <div className="gov-footer-top">
        <div className="gov-footer-grid">
          {/* SECTION 1: Government Identity */}
          <div className="gov-footer-col gov-footer-identity-col">
            <div className="gov-footer-brand">
              <div
                className="gov-emblem-wrapper"
                title="महाराष्ट्र शासन | Government of Maharashtra"
              >
                <img
                  src={logoImg}
                  alt="Government of Maharashtra Seal"
                  className="gov-emblem-img"
                />
              </div>
              <div className="gov-state-text">
                <span className="gov-state-mr">महाराष्ट्र शासन</span>
                <span className="gov-state-en">Government of Maharashtra</span>
              </div>
            </div>

            <p className="gov-footer-mission">
              GovTech Innovation & Pilot Lifecycle Platform
            </p>

            <div className="gov-footer-motto-row">
              <span>Digital Governance</span>
              <span className="gov-footer-dot">|</span>
              <span>Inclusive Growth</span>
              <span className="gov-footer-dot">|</span>
              <span>Viksit Maharashtra</span>
            </div>

            {/* SECTION 5: Connectivity / Contact */}
            <div className="gov-footer-connect">
              <span className="gov-footer-connect-label">Stay Connected:</span>
              <div className="gov-footer-social-icons">
                <span
                  className="gov-social-icon-btn"
                  title="Official Web Portal"
                  aria-label="Official Web Portal"
                >
                  <Globe size={14} />
                </span>
                <span
                  className="gov-social-icon-btn"
                  title="Contact Email"
                  aria-label="Contact Email"
                >
                  <Mail size={14} />
                </span>
                <span
                  className="gov-social-icon-btn"
                  title="Toll-Free Helpline"
                  aria-label="Toll-Free Helpline"
                >
                  <Phone size={14} />
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Quick Links */}
          <div className="gov-footer-col">
            <h4 className="gov-footer-heading">Quick Links</h4>
            <ul className="gov-footer-list">
              <li>
                <span className="gov-footer-link">Home</span>
              </li>
              <li>
                <span className="gov-footer-link">About Us</span>
              </li>
              <li>
                <span className="gov-footer-link">Contact Us</span>
              </li>
              <li>
                <span className="gov-footer-link">Help & Support</span>
              </li>
            </ul>
          </div>

          {/* SECTION 3: Resources */}
          <div className="gov-footer-col">
            <h4 className="gov-footer-heading">Resources</h4>
            <ul className="gov-footer-list">
              <li>
                <span className="gov-footer-link">User Manual</span>
              </li>
              <li>
                <span className="gov-footer-link">FAQs</span>
              </li>
              <li>
                <span className="gov-footer-link">Terms & Conditions</span>
              </li>
              <li>
                <span className="gov-footer-link">Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* SECTION 4: Related Portals */}
          <div className="gov-footer-col">
            <h4 className="gov-footer-heading">Related Portals</h4>
            <ul className="gov-footer-list">
              <li>
                <a href="https://maharashtra.gov.in/" target="_blank" rel="noopener noreferrer" className="gov-footer-link gov-footer-external-link">
                  Maharashtra State Portal <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="https://gem.gov.in/" target="_blank" rel="noopener noreferrer" className="gov-footer-link gov-footer-external-link">
                  GeM (Government e-Marketplace) <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="https://www.startupindia.gov.in/content/sih/en/state-startup-policies/Maharashtra-state-policy.html" target="_blank" rel="noopener noreferrer" className="gov-footer-link gov-footer-external-link">
                  Startup Maharashtra <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="https://www.dpiit.gov.in/" target="_blank" rel="noopener noreferrer" className="gov-footer-link gov-footer-external-link">
                  DPIIT <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Compliance Bar */}
      <div className="gov-footer-bottom">
        <div className="gov-footer-bottom-inner">
          <p className="gov-copyright-text">
            © 2026 Government of Maharashtra. All rights reserved.
          </p>
          <p className="gov-footer-disclaimer">
            GovTech Innovation & Pilot Lifecycle Platform &bull; Department of
            Information Technology & Municipal Administration
          </p>
        </div>
      </div>
    </footer>
  );
};
