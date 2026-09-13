import React from "react";
import { ExternalLink } from "lucide-react";
import logoImg from "../assets/maharastraGov.jpeg";
interface FooterProps {
  onNavigate?: (page: 'landing' | 'faq' | 'terms' | 'privacy' | 'manual' | any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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


          </div>

          {/* SECTION 2: Quick Links */}
          <div className="gov-footer-col">
            <h4 className="gov-footer-heading">Quick Links</h4>
            <ul className="gov-footer-list">
              <li>
                <a href="#home" className="gov-footer-link">Home</a>
              </li>
              <li>
                <a href="#lifecycle" className="gov-footer-link">How It Works</a>
              </li>
              <li>
                <span className="gov-footer-link">About Us</span>
              </li>
              <li>
                <span className="gov-footer-link">Contact Us</span>
              </li>
            </ul>
          </div>

          {/* SECTION 3: Resources */}
          <div className="gov-footer-col">
            <h4 className="gov-footer-heading">Resources</h4>
            <ul className="gov-footer-list">
              <li>
                <button type="button" className="gov-footer-link" onClick={() => onNavigate?.('manual')} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}>User Manual</button>
              </li>
              <li>
                <button type="button" className="gov-footer-link" onClick={() => onNavigate?.('faq')} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}>FAQs</button>
              </li>
              <li>
                <button type="button" className="gov-footer-link" onClick={() => onNavigate?.('terms')} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}>Terms & Conditions</button>
              </li>
              <li>
                <button type="button" className="gov-footer-link" onClick={() => onNavigate?.('privacy')} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}>Privacy Policy</button>
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
