import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ChefHat, Target, Zap, Shield, Heart, ArrowRight,
  Code2, Database, Layers, Globe, Star, CheckCircle, Users, Coffee
} from 'lucide-react';

/* ── Timeline Item ── */
const TimelineItem = ({ year, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className="flex gap-6 relative"
  >
    <div className="flex flex-col items-center">
      <div className="w-4 h-4 rounded-full bg-primary border-4 border-primary/30 flex-shrink-0 mt-1 shadow-lg shadow-primary/50" />
      <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-2" />
    </div>
    <div className="pb-10">
      <span className="badge badge-blue mb-2">{year}</span>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

/* ── Value Card ── */
const ValueCard = ({ icon: Icon, title, desc, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="glass-card p-8 group cursor-default"
    style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.1)' }}
  >
    <motion.div
      whileHover={{ rotate: 10, scale: 1.15 }}
      className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mb-5 shadow-lg`}
    >
      <Icon className="w-7 h-7 text-white" />
    </motion.div>
    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

/* ── Main ── */
const About = () => {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  const values = [
    { icon: Target, title: 'Our Mission', desc: 'To serve the best, locally-sourced meals and artisan coffee to our community every single day.', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600', delay: 0 },
    { icon: Heart, title: 'Passion for Food', desc: 'Our chefs pour their hearts into every recipe, ensuring each bite is memorable and nutritious.', gradient: 'bg-gradient-to-br from-violet-500 to-purple-700', delay: 0.1 },
    { icon: Users, title: 'Community First', desc: 'We are more than just a place to eat; we are a gathering place for friends, colleagues, and family.', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', delay: 0.2 },
    { icon: Star, title: 'Premium Quality', desc: 'We never compromise on the quality of our ingredients or the standard of our service.', gradient: 'bg-gradient-to-br from-rose-500 to-pink-600', delay: 0.3 },
  ];

  const tech = [
    { icon: Heart, label: 'Freshness', desc: 'Daily delivery', color: 'text-blue-500' },
    { icon: Star, label: 'Quality', desc: 'Premium ingredients', color: 'text-violet-500' },
    { icon: Users, label: 'Service', desc: 'Customer first', color: 'text-cyan-500' },
    { icon: ChefHat, label: 'Expertise', desc: 'Trained chefs', color: 'text-pink-500' },
    { icon: Coffee, label: 'Artisan', desc: 'Roasted beans', color: 'text-emerald-500' },
    { icon: Shield, label: 'Hygiene', desc: 'Top ratings', color: 'text-amber-500' },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ════ HERO ════ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Animated background from Unsplash */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&h=900&fit=crop"
            alt="Restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/50" />
        </div>

        {/* Animated orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-float pointer-events-none z-10" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-accent/20 blur-3xl animate-float-delayed pointer-events-none z-10" />

        <div className="relative z-20 max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/10">
              <ChefHat className="w-4 h-4 text-accent" />
              <span className="text-white/80 text-sm">About The Grand Cafeteria</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              A Taste of<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Excellence
              </span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              The Grand Cafeteria is a premier dining destination offering a rich variety of freshly cooked meals, healthy alternatives, and the finest artisan coffee.
            </p>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/menu" className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-primary/30">
                  <span>View Menu</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/contact-us" className="inline-flex items-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20">
                  <span>Contact Us</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Stats grid */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: '500+', label: 'Daily Meals Served', icon: '🍽️' },
              { value: '100%', label: 'Fresh Ingredients', icon: '🌿' },
              { value: '20+', label: 'Expert Staff', icon: '👥' },
              { value: '2015', label: 'Year Established', icon: '🏆' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1 + 0.4 }}
                whileHover={{ y: -4, scale: 1.04 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/10"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════ VALUES ════ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="badge badge-blue mb-4 px-5 py-2 text-sm">Our Values</span>
            <h2 className="text-5xl font-black mb-4">What We <span className="gradient-text">Stand For</span></h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-lg mx-auto">Our core values drive every dish we prepare and every customer we serve.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => <ValueCard key={i} {...v} />)}
          </div>
        </div>
      </section>

      {/* ════ TEAM — Unsplash Photos ════ */}
      <section className="py-28 px-6 bg-gray-50/70 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="badge badge-green mb-4 px-5 py-2 text-sm">Our Team</span>
            <h2 className="text-5xl font-black mb-4">Meet the <span className="gradient-text">Chefs</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-lg mb-6">
                We're a passionate team of culinary experts, baristas, and hospitality professionals dedicated to giving you an amazing dining experience.
              </p>
              <ul className="space-y-3">
                {[
                  'Internationally trained executive chefs',
                  'Award-winning pastry team',
                  'Certified master baristas',
                  'Dedicated to sustainable sourcing',
                ].map(item => (
                  <li key={item} className="flex items-center space-x-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-600 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=700&h=480&fit=crop"
                alt="Team at work"
                className="relative rounded-2xl shadow-2xl w-full h-72 object-cover"
              />
            </motion.div>
          </div>

          {/* Team role cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop&face', name: 'Marco Rossi', role: 'Executive Chef', emoji: '👨‍🍳' },
              { img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&face', name: 'Sophia Lee', role: 'Head Pastry Chef', emoji: '🍰' },
              { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&face', name: 'James Carter', role: 'Master Barista', emoji: '☕' },
              { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&face', name: 'Elena Diaz', role: 'General Manager', emoji: '📋' },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.04 }}
                className="glass-card overflow-hidden group cursor-default"
                style={{ boxShadow: '0 15px 40px -10px rgba(0,0,0,0.12)' }}
              >
                <div className="relative overflow-hidden h-36">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 right-2 text-2xl">{m.emoji}</span>
                </div>
                <div className="p-4 text-center">
                  <p className="font-bold text-sm">{m.name}</p>
                  <p className="text-xs text-primary mt-1">{m.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TIMELINE ════ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Our <span className="gradient-text">Journey</span></h2>
          </motion.div>
          <TimelineItem year="2015" title="The Beginning" desc="The Grand Cafeteria opened its doors with a simple mission: great food for everyone." delay={0} />
          <TimelineItem year="2018" title="Expanding the Menu" desc="Introduced our artisan coffee bar and vegan-friendly options to serve a wider audience." delay={0.1} />
          <TimelineItem year="2021" title="Award Winning" desc="Voted 'Best Local Cafeteria' by the city food guide for our outstanding lunch specials." delay={0.2} />
          <TimelineItem year="2024" title="Catering Services Launch" desc="We expanded into full-service catering for corporate events and private parties." delay={0.3} />
        </div>
      </section>

      {/* ════ TECH STACK ════ */}
      <section className="py-28 px-6 bg-gray-50/70 dark:bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">The Secret <span className="gradient-text">Ingredients</span></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {tech.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.08 }}
                className="glass-card p-5 text-center group cursor-default"
              >
                <t.icon className={`w-8 h-8 ${t.color} mx-auto mb-3 group-hover:scale-125 transition-transform duration-300`} />
                <p className="font-bold text-sm">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}>
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </div>
            <h2 className="text-6xl font-black mb-6">Hungry <span className="gradient-text">Yet?</span></h2>
            <p className="text-gray-500 dark:text-slate-400 text-xl mb-10 max-w-lg mx-auto">Explore our menu or get in touch to plan your next catered event.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/menu" className="inline-flex items-center space-x-2 px-12 py-5 bg-gradient-to-r from-primary to-accent text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/30">
                  <span>View Our Menu</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/contact-us" className="inline-flex items-center space-x-2 px-12 py-5 btn-ghost text-lg rounded-2xl">
                  <span>Talk to Us</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2 text-gray-400">
          <ChefHat className="w-4 h-4 text-primary" />
          <p className="text-sm">© 2026 The Grand Cafeteria · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
