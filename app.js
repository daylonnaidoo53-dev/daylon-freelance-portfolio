// Daylon Naidoo — Full-Stack Developer & IT Specialist
// Firebase App & Cloud Firestore Integration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration for project: daylon-portfolio-freelance
const firebaseConfig = {
  projectId: "daylon-portfolio-freelance",
  appId: "1:751727569482:web:3b2a1edcef539e0ad8d4b3",
  storageBucket: "daylon-portfolio-freelance.firebasestorage.app",
  apiKey: "AIzaSyCYZmWQMRL9wnEZXLtBsmJrxGTjYLfKItU",
  authDomain: "daylon-portfolio-freelance.firebaseapp.com",
  messagingSenderId: "751727569482",
  projectNumber: "751727569482"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile Menu Toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuBtn && mobileMenu) {
    const toggleMenu = () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden');
        iconClose.classList.toggle('hidden');
      }
    };

    menuBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (!mobileMenu.classList.contains('hidden')) {
          toggleMenu();
        }
      });
    });
  }

  // 3. Navbar scroll elevation
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('shadow-xl', 'shadow-slate-950/60');
    } else {
      header?.classList.remove('shadow-xl', 'shadow-slate-950/60');
    }
  });

  // 4. Contact Form Firestore Submission
  const contactForm = document.getElementById('project-enquiry-form');
  const successBanner = document.getElementById('form-success-banner');
  const errorBanner = document.getElementById('form-error-banner');
  const errorText = document.getElementById('form-error-text');
  const submitBtn = document.getElementById('form-submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset banners
      successBanner?.classList.add('hidden');
      errorBanner?.classList.add('hidden');

      const formData = new FormData(contactForm);
      const data = {
        name: (formData.get('name') || '').toString().trim(),
        email: (formData.get('email') || '').toString().trim(),
        businessName: (formData.get('businessName') || '').toString().trim(),
        serviceRequired: (formData.get('serviceRequired') || '').toString().trim(),
        subject: (formData.get('subject') || '').toString().trim(),
        estimatedBudget: (formData.get('estimatedBudget') || 'Not Specified').toString().trim(),
        projectDetails: (formData.get('projectDetails') || '').toString().trim()
      };

      // Client-side validation matching firestore.rules constraints
      if (!data.name || data.name.length < 2) {
        showError('Please enter your full name (at least 2 characters).');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        showError('Please enter a valid email address.');
        return;
      }

      if (!data.serviceRequired) {
        showError('Please select a service required.');
        return;
      }

      if (!data.subject || data.subject.length < 2) {
        showError('Please enter a subject (at least 2 characters).');
        return;
      }

      if (!data.projectDetails || data.projectDetails.length < 10) {
        showError('Please provide project details (at least 10 characters).');
        return;
      }

      setLoading(true);

      try {
        // Save to Cloud Firestore 'inquiries' collection
        await addDoc(collection(db, "inquiries"), {
          name: data.name,
          email: data.email,
          businessName: data.businessName,
          serviceRequired: data.serviceRequired,
          subject: data.subject,
          estimatedBudget: data.estimatedBudget,
          projectDetails: data.projectDetails,
          submittedAt: new Date().toISOString(),
          status: "unread",
          createdAt: serverTimestamp()
        });

        // Show Success
        contactForm.reset();
        successBanner?.classList.remove('hidden');
        successBanner?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        console.error('Firestore submission error:', err);
        showError('Unable to send enquiry at this moment. Please reach out directly via WhatsApp (+27 83 254 2999) or email (daylonnaidoo53@gmail.com).');
      } finally {
        setLoading(false);
      }
    });
  }

  function showError(msg) {
    if (errorText) errorText.textContent = msg;
    errorBanner?.classList.remove('hidden');
    errorBanner?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      btnText && (btnText.textContent = 'Sending Enquiry...');
      btnSpinner?.classList.remove('hidden');
      submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
      btnText && (btnText.textContent = 'Send Project Enquiry');
      btnSpinner?.classList.add('hidden');
      submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
  }
});
