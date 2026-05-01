import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, ChefHat } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="pt-16 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 particles-bg grid-pattern opacity-50" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 glass dark:glass-dark rounded-full mb-8 text-sm">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-gray-600 dark:text-slate-300">Contact Us</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-5">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
              Have a question about Cafeteria Management? Need help setting up? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
            <div>
              <h2 className="text-2xl font-black mb-6">Let's start a conversation</h2>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
                Whether you're looking for a demo, have technical questions, or want to report a bug — our team is here to help. We typically respond within 24 hours.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'support@cafeteriamanagement.app', color: 'text-blue-500 bg-blue-500/10' },
                { icon: Phone, label: 'Phone', value: '+252 63 123 4567', color: 'text-emerald-500 bg-emerald-500/10' },
                { icon: MapPin, label: 'Location', value: 'Hargeisa, Somaliland', color: 'text-violet-500 bg-violet-500/10' },
                { icon: Clock, label: 'Working Hours', value: 'Sun – Thu, 8:00 AM – 5:00 PM', color: 'text-amber-500 bg-amber-500/10' },
              ].map(({ icon: Icon, label, value, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-4 glass-card p-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="font-semibold text-sm mt-0.5">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-bold mb-4">Common Questions</h3>
              <div className="space-y-3">
                {[
                  { q: 'Is Cafeteria Management free to use?', a: 'The frontend is open-source. Backend deployment may have hosting costs.' },
                  { q: 'Does it work with any cafeteria size?', a: 'Yes! From small coffee shops to large corporate cafeterias.' },
                  { q: 'Can I customize it for my brand?', a: 'Absolutely. The color theme and branding are fully customizable.' },
                ].map((faq, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 + 0.5 }} className="glass-card p-4">
                    <p className="font-semibold text-sm text-primary mb-1">{faq.q}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card p-8 relative">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Message Sent!</h3>
                  <p className="text-gray-500 dark:text-slate-400">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="mt-6 btn-ghost text-sm">Send Another</button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-black mb-6 gradient-text">Send a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Full Name</label>
                        <input className="form-input" placeholder="John Doe" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email</label>
                        <input className="form-input" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subject</label>
                      <input className="form-input" placeholder="How can we help?" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Message</label>
                      <textarea className="form-input resize-none" rows={6} placeholder="Describe your question or issue in detail..." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5">
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2 text-gray-400">
          <ChefHat className="w-4 h-4 text-primary" />
          <p className="text-sm">© 2026 Cafeteria Management · All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
