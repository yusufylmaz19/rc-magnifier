/**
 * Google Analytics loader utility.
 * Loads the GA script dynamically upon user consent.
 */

export const loadGoogleAnalytics = (gaId: string) => {
  if (!gaId) {
    console.warn('Google Analytics ID is missing.');
    return;
  }

  // Prevent duplicate script injection
  if (document.getElementById('google-analytics')) return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script1.id = 'google-analytics';
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(script2);
};
