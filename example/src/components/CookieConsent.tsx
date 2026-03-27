import React, { useState, useEffect } from 'react';
import './CookieConsent.css';
import { loadGoogleAnalytics } from '../utils/analytics';

interface CookieConsentProps {
  gaId?: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ gaId }) => {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('cookieConsentGranted') === null;
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsentGranted');
    if (consent === 'true' && gaId) {
      loadGoogleAnalytics(gaId);
    }
  }, [gaId]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsentGranted', 'true');
    setIsVisible(false);
    if (gaId) {
      loadGoogleAnalytics(gaId);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsentGranted', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-container">
        <div className="cookie-content">
          <h3>Cookie Preference</h3>
          <p>
            We use Google Analytics to improve your experience and understand how you interact with our magnifier components. 
            Do you agree to our use of cookies?
          </p>
        </div>
        <div className="cookie-actions">
          <button className="cookie-btn decline" onClick={handleDecline}>Decline</button>
          <button className="cookie-btn accept" onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
