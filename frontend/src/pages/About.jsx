import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ChefHat, Target, Shield, Heart, ArrowRight,
  Star, CheckCircle, Users, Coffee, Award, Clock3,
  Flame, Utensils
} from 'lucide-react';
import staffTeamImage from '../assets/staff_team.png';
import featureTeamImage from '../assets/feature_team.png';

const smoothEase = [0.22, 1, 0.36, 1];

const revealUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: smoothEase },
  },
};

const staggerGroup = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

const chefCardReveal = {
  hidden: { opacity: 0, y: 42, rotateX: -8 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: index * 0.08, duration: 0.62, ease: smoothEase },
  }),
};

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

  const chefHighlights = [
    { icon: ChefHat, label: 'Chef-led menus', value: '28 rotating specials', tone: 'from-indigo-500 to-cyan-500' },
    { icon: Clock3, label: 'Service rhythm', value: 'Fresh batches hourly', tone: 'from-emerald-500 to-teal-500' },
    { icon: Award, label: 'Quality checks', value: 'Every station, every shift', tone: 'from-amber-500 to-orange-500' },
  ];

  const chefs = [
    {
      name: 'Amina Noor',
      role: 'Executive Chef',
      specialty: 'Modern African bowls',
      focus: 'Leads seasonal menus, sauces, and high-volume lunch service.',
      icon: Flame,
      stat: '12 yrs',
      objectPosition: '18% 72%',
      tone: 'from-indigo-500 to-cyan-500',
    },
    {
      name: 'David Mensah',
      role: 'Grill & Protein Lead',
      specialty: 'Charred mains',
      focus: 'Runs the grill station and keeps proteins fast, tender, and consistent.',
      icon: Utensils,
      stat: '18 yrs',
      objectPosition: '36% 70%',
      tone: 'from-rose-500 to-orange-500',
    },
    {
      name: 'Priya Patel',
      role: 'Bakery & Pastry Lead',
      specialty: 'Breakfast pastries',
      focus: 'Prepares fresh breads, desserts, and the pastry counter every morning.',
      icon: Star,
      stat: '9 yrs',
      objectPosition: '58% 72%',
      tone: 'from-violet-500 to-fuchsia-500',
    },
    {
      name: 'Kenji Tan',
      role: 'Cafe Operations Lead',
      specialty: 'Coffee bar service',
      focus: 'Coordinates baristas, service pacing, and front counter presentation.',
      icon: Coffee,
      stat: '7 yrs',
      objectPosition: '78% 72%',
      tone: 'from-teal-500 to-emerald-500',
    },
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
      <section className="relative overflow-hidden py-28 px-6 bg-gradient-to-br from-cyan-50 via-fuchsia-50 to-emerald-50 dark:from-slate-950 dark:via-fuchsia-900/45 dark:to-emerald-900/40 border-b border-white/70 dark:border-slate-800/80">
        <div className="relative max-w-6xl mx-auto">
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

      {/* TEAM - animated chef section */}
      <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-tr from-indigo-50 via-white to-amber-50 dark:from-slate-950 dark:via-indigo-900/50 dark:to-amber-900/35 border-y border-indigo-200/40 dark:border-indigo-400/10">
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ opacity: [0.25, 0.9, 0.25], scaleX: [0.65, 1, 0.65] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            variants={revealUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <span className="badge badge-green mb-4 px-5 py-2 text-sm">Our Team</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Meet the <span className="gradient-text">Chefs</span></h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The kitchen is run by real station leads, not placeholder profile cards. Every role here maps to how the cafeteria actually serves breakfast, lunch, coffee, and catering.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -48, rotateY: 6 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: smoothEase }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative group"
            >
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-primary/20 via-accent/15 to-emerald-400/20 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-2xl border border-white/30 dark:border-white/10">
                <motion.img
                  src={featureTeamImage}
                  alt="Grand Cafeteria chef team working together in the kitchen"
                  className="h-[360px] md:h-[460px] w-full object-cover"
                  initial={{ scale: 1.08 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: smoothEase }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <motion.div
                  className="absolute left-5 right-5 bottom-5 grid grid-cols-3 gap-3"
                  variants={staggerGroup}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {chefHighlights.map((item) => (
                    <motion.div
                      key={item.label}
                      variants={revealUp}
                      whileHover={{ y: -4, scale: 1.03 }}
                      className="rounded-2xl bg-white/85 dark:bg-slate-950/70 backdrop-blur-md p-3 border border-white/60 dark:border-white/10"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.tone} flex items-center justify-center mb-2 shadow-lg`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerGroup}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="space-y-6"
            >
              <motion.p variants={revealUp} className="text-gray-500 dark:text-slate-400 leading-relaxed text-lg">
                Our chefs, bakers, and baristas work as one production line: prep starts early, hot meals move in controlled batches, and every counter is checked before service opens.
              </motion.p>

              <motion.ul variants={staggerGroup} className="space-y-3">
                {[
                  'Station leads for hot food, bakery, grill, and cafe service',
                  'Daily prep lists tied to inventory and menu demand',
                  'Freshness checks before each breakfast and lunch rush',
                  'Catering-ready team with clean plating standards',
                ].map((item) => (
                  <motion.li key={item} variants={revealUp} className="flex items-start space-x-3 text-sm">
                    <motion.span
                      className="mt-0.5 rounded-full bg-accent/10 p-1"
                      whileHover={{ rotate: 12, scale: 1.12 }}
                    >
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    </motion.span>
                    <span className="text-gray-600 dark:text-slate-300 leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={revealUp} className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'Kitchen crew', value: '20+' },
                  { label: 'Daily meals', value: '500+' },
                  { label: 'Fresh menu', value: '24h' },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -4, scale: 1.04 }}
                    className="glass-card p-4 text-center"
                  >
                    <p className="text-2xl font-black gradient-text-blue">{item.value}</p>
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mt-1">{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            variants={staggerGroup}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {chefs.map((chef, i) => (
              <motion.article
                key={chef.name}
                custom={i}
                variants={chefCardReveal}
                whileHover={{ y: -10, scale: 1.025 }}
                className="glass-card overflow-hidden group cursor-default"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative overflow-hidden h-56 bg-slate-900">
                  <img
                    src={staffTeamImage}
                    alt={`${chef.name}, ${chef.role}`}
                    className="w-full h-full object-cover scale-125 group-hover:scale-[1.34] transition-transform duration-700"
                    style={{ objectPosition: chef.objectPosition }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                  <motion.div
                    className={`absolute right-4 top-4 w-11 h-11 rounded-2xl bg-gradient-to-br ${chef.tone} flex items-center justify-center shadow-xl`}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.8, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <chef.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="absolute left-4 bottom-4">
                    <p className="text-white text-lg font-black">{chef.name}</p>
                    <p className="text-white/75 text-xs font-semibold">{chef.role}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="badge badge-blue">{chef.specialty}</span>
                    <span className="text-xs font-black text-primary">{chef.stat}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{chef.focus}</p>
                  <motion.div
                    className={`mt-5 h-1 rounded-full bg-gradient-to-r ${chef.tone}`}
                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.65, ease: smoothEase }}
                  />
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════ TIMELINE ════ */}
      <section className="relative overflow-hidden py-28 px-6 bg-gradient-to-br from-rose-50 via-white to-sky-50 dark:from-slate-950 dark:via-rose-900/40 dark:to-sky-900/40">
        <div className="relative max-w-3xl mx-auto">
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
      <section className="relative overflow-hidden py-28 px-6 bg-gradient-to-tr from-emerald-50 via-white to-violet-50 dark:from-slate-950 dark:via-emerald-900/40 dark:to-violet-900/45 border-y border-emerald-200/40 dark:border-emerald-400/10">
        <div className="relative max-w-6xl mx-auto">
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
                <Link to="/contact-us" className="inline-flex items-center space-x-2 px-12 py-5 btn-glass text-lg rounded-2xl">
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
