/**
 * PublicLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Layout wrapper for all public-facing pages (Home, About, Contact).
 * Features:
 *  • Sticky glass navbar with active-link highlighting
 *  • Mobile drawer menu with smooth animation
 *  • Dark/light mode toggle
 *  • Full footer with social media links, contact info, quick links
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { usePerformance } from '../../hooks/usePerformance';
import { useTheme } from '../../hooks/useTheme';
import {
  Moon, Sun, ChefHat, Menu, X, MapPin, Phone, Mail,
  ExternalLink, Zap, ZapOff, BriefcaseBusiness, CalendarDays,
  ShieldCheck, Send, CheckCircle2, LoaderCircle
} from 'lucide-react';

/* ── Social media icon components (inline SVG for no extra deps) ── */
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/* ── Social links config ── */
const SOCIAL_LINKS = [
  { icon: XIcon,         label: 'X (Twitter)',  href: 'https://twitter.com',   color: 'hover:text-slate-100 hover:bg-slate-700' },
  { icon: FacebookIcon,  label: 'Facebook',     href: 'https://facebook.com',  color: 'hover:text-blue-400 hover:bg-blue-500/20' },
  { icon: InstagramIcon, label: 'Instagram',    href: 'https://instagram.com', color: 'hover:text-pink-400 hover:bg-pink-500/20' },
  { icon: LinkedInIcon,  label: 'LinkedIn',     href: 'https://linkedin.com',  color: 'hover:text-blue-500 hover:bg-blue-500/20' },
  { icon: YouTubeIcon,   label: 'YouTube',      href: 'https://youtube.com',   color: 'hover:text-red-500 hover:bg-red-500/20' },
  { icon: WhatsAppIcon,  label: 'WhatsApp',     href: 'https://wa.me/',        color: 'hover:text-emerald-400 hover:bg-emerald-500/20' },
];

export const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { lowPerformance, togglePerformance, animationConfig } = usePerformance();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const navLinks = [
    { to: '/home',       label: 'Home' },
    { to: '/about',      label: 'About' },
    { to: '/contact-us', label: 'Contact' },
  ];

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      await api.post('menu/newsletter-subscriptions/', { email: newsletterEmail });
      setNewsletterStatus('success');
      setNewsletterMessage('Subscribed. We will send cafeteria updates to your email.');
      setNewsletterEmail('');
    } catch (error) {
      console.error('Failed to subscribe newsletter email:', error);
      setNewsletterStatus('error');
      setNewsletterMessage('We could not subscribe this email. Please try again.');
    }
  };

  // Performance-optimized variants
  const menuVariants = useMemo(() => ({
    initial: { opacity: 0, y: -10, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0,   
      scale: 1,
      transition: animationConfig.transition 
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      transition: { duration: 0.15, ease: 'easeIn' } 
    }
  }), [animationConfig]);

  return (
    <div className="min-h-screen bg-transparent dark:bg-dark text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">

      {/* ════ Floating Navbar ════ */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0,    opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-20"
        style={{ willChange: 'transform, opacity' }}
      >
        <div className={`mx-4 mt-3 px-6 h-14 rounded-2xl shadow-xl flex items-center justify-between border border-white/70 dark:border-slate-700/50 ${
          lowPerformance 
            ? 'bg-white/80 dark:bg-dark/95 backdrop-blur-xl dark:backdrop-blur-none' 
            : 'glass dark:glass-dark'
        }`}>
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              The Grand Cafeteria
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 group ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.div
                    layoutId="nav-underline"
                    initial={false}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePerformance}
              title={`Performance: ${lowPerformance ? 'Power Save' : 'Ultra'}`}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors hidden sm:block"
            >
              {lowPerformance ? <ZapOff className="w-4 h-4 text-amber-500" /> : <Zap className="w-4 h-4 text-primary" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>
            <Link to="/login" className="hidden md:inline-flex btn-primary px-5 py-2 text-sm">
              Sign In
            </Link>
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              onClick={() => setMobileMenuOpen(v => !v)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`mx-4 mt-1 rounded-2xl shadow-xl p-4 space-y-1 border border-white/70 dark:border-slate-700/50 ${
                lowPerformance ? 'bg-white/85 dark:bg-dark/98 backdrop-blur-xl dark:backdrop-blur-none' : 'glass dark:glass-dark'
              }`}
              style={{ willChange: 'transform, opacity' }}
            >
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname === link.to
                      ? 'text-primary bg-primary/10'
                      : 'hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                className="block btn-primary text-center py-2.5 text-sm mt-2">
                Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ════ Page Content ════ */}
      <main data-route-scroll-container className="pt-20 flex-1">
        <Outlet />
      </main>

      {/* ════ Full Footer ════ */}
      <footer className="bg-dark-lighter border-t border-slate-800 text-slate-400">
        {/* ── Newsletter subscribe ── */}
        <div className="relative isolate overflow-hidden border-b border-slate-800 bg-slate-950 px-6 py-14 sm:py-16">
          <div aria-hidden="true" className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl">
            <div
              className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-fuchsia-400 to-cyan-400 opacity-20"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-200">
                <Mail className="h-4 w-4" />
                Cafeteria messages
              </span>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Subscribe for fresh cafeteria updates
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Get weekly menu news, catering notes, and special cafeteria announcements by email.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={newsletterEmail}
                  onChange={event => setNewsletterEmail(event.target.value)}
                  className="min-w-0 flex-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="inline-flex flex-none items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {newsletterStatus === 'loading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Subscribe
                </button>
              </form>

              {newsletterMessage && (
                <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${newsletterStatus === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {newsletterStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {newsletterMessage}
                </p>
              )}
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  icon: CalendarDays,
                  title: 'Weekly updates',
                  desc: 'Receive menu highlights, event reminders, and seasonal cafeteria news.',
                },
                {
                  icon: ShieldCheck,
                  title: 'No spam',
                  desc: 'Only useful cafeteria messages. Your email is kept for system updates.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <dt className="font-black text-white">{title}</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-400">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ── Top section ── */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/home" className="flex items-center space-x-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">The Grand Cafeteria</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              A premier dining destination offering a rich variety of freshly cooked meals, healthy alternatives, and the finest artisan coffee.
            </p>
            <Link
              to="/jobs"
              className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
            >
              <BriefcaseBusiness className="h-4 w-4" />
              <span>For Job</span>
            </Link>
            {/* Social media icons */}
            <div className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title={s.label}
                  className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 transition-all duration-200 ${s.color}`}
                  aria-label={s.label}
                >
                  <s.icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/home',       label: '🏠 Home' },
                { to: '/about',      label: 'ℹ️ About Us' },
                { to: '/contact-us', label: '📧 Contact' },
                { to: '/login',      label: '🔐 Staff Login' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-5">Features</h4>
            <ul className="space-y-3 text-sm">
              {[
                '🍽️ Artisan Coffee',
                '🥗 Fresh Ingredients',
                '🍔 Daily Specials',
                '🍰 Fresh Pastries',
                '🥑 Vegan Options',
                '🥡 Takeout Available',
                '🎉 Catering Services',
              ].map(f => (
                <li key={f} className="hover:text-primary transition-colors duration-200 cursor-default">{f}</li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 group">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="hover:text-white transition-colors">
                  Hargeisa,<br />Somaliland
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone className="w-4 h-4 text-accent flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+252631234567" className="hover:text-white transition-colors">
                  +252 63 123 4567
                </a>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail className="w-4 h-4 text-violet-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@grandcafe.com" className="hover:text-white transition-colors">
                  info@grandcafe.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <ExternalLink className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="https://grandcafe.com" target="_blank" rel="noopener noreferrer"
                  className="hover:text-white transition-colors">
                  www.grandcafe.com
                </a>
              </li>
            </ul>

            {/* Business hours */}
            <div className="mt-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <p className="text-xs font-bold text-white mb-2">🕐 Business Hours</p>
              <p className="text-xs">Mon – Fri: 7:00 AM – 9:00 PM</p>
              <p className="text-xs">Sat – Sun: 8:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 <span className="text-primary font-bold">The Grand Cafeteria</span>. All rights reserved.</p>
            <div className="flex items-center space-x-1 text-slate-500">
              <span>Made with</span>
              <span className="text-red-500 font-semibold">❤️</span>
              <span>for great food</span>
            </div>
            <div className="flex space-x-4 text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
