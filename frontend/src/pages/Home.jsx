import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ChefHat, BarChart3, Package, Users, ShoppingBag, Star,
  ArrowRight, CheckCircle, Zap, TrendingUp, DollarSign,
  Utensils, Coffee, Play, Volume2, VolumeX
} from 'lucide-react';

/* ── Animated Counter ── */
const Counter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 120;
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── 3D Tilt Card ── */
const TiltCard = ({ children, className = '', intensity = 15 }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shine: { x: 50, y: 50 } });

  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -intensity,
      y: (x - 0.5) * intensity,
      shine: { x: x * 100, y: y * 100 },
    });
  };
  const handleLeave = () => setTilt({ x: 0, y: 0, shine: { x: 50, y: 50 } });

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02,1.02,1.02)`,
        transition: 'transform 0.1s ease-out',
      }}
      className={`relative ${className}`}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle at ${tilt.shine.x}% ${tilt.shine.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
};

/* ── Feature Card ── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    <TiltCard className="glass-card p-8 h-full group cursor-default"
      style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)' }}
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${color} shadow-lg`}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </TiltCard>
  </motion.div>
);

/* ── Floating Orb ── */
const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none animate-float ${className}`} />
);

/* ── Main ── */
const Home = () => {
  const [muted, setMuted] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handle = (e) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const features = [
    { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time dashboard with beautiful charts, KPIs and revenue tracking.', color: 'bg-gradient-to-br from-blue-500 to-cyan-600', delay: 0 },
    { icon: Utensils, title: 'Menu Builder', desc: 'Manage food categories, item photos, prices and live availability.', color: 'bg-gradient-to-br from-emerald-500 to-teal-600', delay: 0.1 },
    { icon: ShoppingBag, title: 'Order Tracking', desc: 'Follow every order from placement to delivery in real-time.', color: 'bg-gradient-to-br from-violet-500 to-purple-700', delay: 0.2 },
    { icon: Package, title: 'Smart Inventory', desc: 'Stock alerts, cost tracking and supply chain management.', color: 'bg-gradient-to-br from-amber-500 to-orange-600', delay: 0.3 },
    { icon: Users, title: 'Team Manager', desc: 'Employee profiles, roles, permissions and shift management.', color: 'bg-gradient-to-br from-rose-500 to-pink-600', delay: 0.4 },
    { icon: DollarSign, title: 'Payroll System', desc: 'Automate salaries, bonuses, deductions and payment records.', color: 'bg-gradient-to-br from-cyan-500 to-sky-600', delay: 0.5 },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ════ HERO — Video BG + 3D Mouse ════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source
            src="https://videos.pexels.com/video-files/3769033/3769033-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
          <source
            src="https://videos.pexels.com/video-files/3212076/3212076-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Video overlay (neutral black so food colors show) */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-20 z-10" />

        {/* Mute button */}
        <button
          onClick={() => setMuted(m => !m)}
          className="absolute bottom-8 right-8 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:scale-110 transition-transform"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* 3D mouse-tracked hero content */}
        <motion.div
          className="relative z-20 max-w-6xl mx-auto px-6 text-center"
          style={{
            y: heroY,
            opacity: heroOpacity,
          }}
        >
          <motion.div
            style={{
              transform: `perspective(1200px) rotateX(${-mousePos.y * 0.3}deg) rotateY(${mousePos.x * 0.3}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md mb-10 text-white/90 border border-white/20 shadow-2xl"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-semibold">🚀 Now Powered by Django REST + React 19</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none text-white"
            >
              Cafe
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-accent animate-gradient bg-[length:200%_200%]">
                Manager
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            >
              The intelligent platform that transforms how your cafeteria operates — orders, inventory, team and payroll in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-2xl shadow-2xl shadow-primary/40 text-lg group"
                >
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-3 px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 text-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Learn More</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* 3D Floating Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: 500, suffix: '+', label: 'Daily Orders', icon: '📦' },
              { value: 98, suffix: '%', label: 'Uptime SLA', icon: '⚡' },
              { value: 50, suffix: '+', label: 'Staff Managed', icon: '👥' },
              { value: 12000, suffix: '', label: 'Items Tracked', icon: '📊' },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-white text-center border border-white/10 shadow-xl cursor-default"
                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-1 text-white/40"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* ════ STATS MARQUEE ════ */}
      <div className="py-8 bg-gradient-to-r from-primary/10 via-accent/10 to-violet-500/10 border-y border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex space-x-16 whitespace-nowrap"
        >
          {Array.from({ length: 3 }).flatMap(() => [
            '🍽️ Menu Management', '📊 Real-Time Analytics', '👥 Team Manager',
            '📦 Inventory Control', '💰 Payroll System', '🔒 Role-Based Access',
            '📱 Mobile Responsive', '🌙 Dark Mode Ready', '⚡ Django REST API',
          ]).map((item, i) => (
            <span key={i} className="text-gray-500 dark:text-slate-400 font-semibold text-sm">{item}</span>
          ))}
        </motion.div>
      </div>

      {/* ════ FEATURES ════ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="badge badge-blue mb-4 text-sm px-5 py-2"
            >
              ✨ Features
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-black mb-5">
              Everything your café<br />
              <span className="gradient-text">needs to thrive</span>
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              From real-time orders to payroll — Cafeteria Management puts every tool at your fingertips.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════ PHOTO SHOWCASE w/ Unsplash ════ */}
      <section className="py-28 px-6 bg-gray-50/70 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Built for <span className="gradient-text">Real Cafeterias</span></h2>
          </motion.div>

          {/* Grid of images with hover zoom */}
          <div className="grid grid-cols-12 gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', label: 'Modern Cafeteria', span: 'col-span-8 row-span-2', h: 'h-80' },
              { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', label: 'Coffee Bar', span: 'col-span-4', h: 'h-36' },
              { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', label: 'Fresh Food', span: 'col-span-4', h: 'h-36' },
              { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', label: 'Fine Dining', span: 'col-span-6', h: 'h-48' },
              { src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&h=400&fit=crop', label: 'Team at Work', span: 'col-span-6', h: 'h-48' },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${img.span} overflow-hidden rounded-2xl relative group cursor-pointer shadow-xl`}
                style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className={`w-full ${img.h} object-cover group-hover:scale-110 transition-transform duration-700`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-bold text-sm">{img.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Loved by <span className="gradient-text">Managers</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Ahmed Al-Rashidi', role: 'Head Cafeteria Manager', text: 'Cafeteria Management completely transformed how we run daily operations. Orders are faster, inventory is accurate.', stars: 5, avatar: 'A' },
              { name: 'Sarah Johnson', role: 'Operations Director', text: 'The real-time dashboard gives me exactly what I need. Sales, orders, stock — all at a glance.', stars: 5, avatar: 'S' },
              { name: 'Mohammed Hassan', role: 'HR & Payroll Manager', text: 'Managing 40+ employees used to be a nightmare. Now payroll and roles are all in one beautiful system.', stars: 5, avatar: 'M' },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <TiltCard className="glass-card p-7 h-full" intensity={8}>
                  <div className="flex mb-4">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 text-sm italic mb-6 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet-500/10 to-accent/20" />
        <Orb className="w-96 h-96 bg-primary -top-40 -left-40" />
        <Orb className="w-72 h-72 bg-accent -bottom-20 -right-20 animate-float-delayed" />
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Coffee className="w-20 h-20 text-primary mx-auto mb-8" />
            </motion.div>
            <h2 className="text-6xl font-black mb-6">Ready to <span className="gradient-text">Get Started?</span></h2>
            <p className="text-gray-500 dark:text-slate-400 mb-10 text-xl max-w-xl mx-auto">
              Join the future of cafeteria management today.
            </p>
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="inline-flex items-center space-x-3 px-14 py-6 bg-gradient-to-r from-primary via-violet-500 to-accent text-white font-black text-xl rounded-3xl shadow-2xl shadow-primary/30 animate-gradient bg-[length:200%_200%]">
                <Zap className="w-6 h-6" />
                <span>Launch Now</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-black gradient-text-blue">Cafeteria Management</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Cafeteria Management · Built with React + Django</p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact-us" className="hover:text-primary transition-colors">Contact</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
