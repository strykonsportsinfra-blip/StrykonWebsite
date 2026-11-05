/* Strykon site settings.
   Change contact details, social links and booking options here; every page reads this file. */
window.STRYKON_CONFIG = {
  // Your website address, without a trailing slash (it also appears in index.html, projects.html,
  // sitemap.xml and robots.txt).
  siteUrl: 'https://www.strykonsportsinfra.com',

  phone: '+917013012705',
  phoneDisplay: '+91 70130 12705',
  phone2: '+919618942943',
  phone2Display: '+91 96189 42943',
  email: 'info@strykonsportsinfra.com',

  // WhatsApp number: country code + number, digits only
  whatsapp: '919618942943',
  whatsappMessage: 'Hello Strykon Sports & Infrastructure Pvt Ltd! We are planning a project. Can you book an appointment?',

  // Social profiles (footer icons)
  instagram: 'https://www.instagram.com/strykonsportsinfra/',
  facebook: 'https://www.facebook.com/strykonsportsinfra',

  // Google Business Profile "Ask for reviews" link (shown on the reviews section). Leave empty to hide.
  googleReviewUrl: '',

  // Your Google Apps Script web app link (ends in /exec), from docs/google-setup.md. It books site visits
  // into your Google Calendar with an email to you, and shows the projects and reviews from your Google
  // Sheet. While it is empty, bookings open WhatsApp and only the projects in data/projects.js show.
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbzMLnze3ziFGMqIhcs64SB6v-CbNyj6TNPMO00DOMKVobI4_Xutgs5w-TW6QvhRuBiBhg/exec',

  booking: {
    slots: ['10:00', '11:30', '14:00', '15:30', '17:00'], // 24-hour times; keep in sync with the Apps Script
    openDays: [1, 2, 3, 4, 5, 6], // 0 = Sunday … 6 = Saturday
    daysAhead: 21, // how many open days to offer
    durationMinutes: 60,
  },

  // 'auto' shows the sample projects and reviews only on your computer or in a preview, never on the
  // live site, and only until you add real ones. Set to false to never show them.
  showSampleEntries: 'auto',
};
