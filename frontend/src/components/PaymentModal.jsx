/**
 * PaymentModal.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable payment modal supporting:
 *   • Cash
 *   • Zaad (Somali mobile money — phone number)
 *   • PayPal (email-based)
 *   • Mastercard / Visa (card number, expiry, CVV)
 *
 * Props:
 *   amount   — number  — total to pay in USD
 *   onClose  — fn      — called when modal is dismissed
 *   onSuccess— fn(method) — called after successful payment
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle, Loader2, CreditCard, Smartphone,
  DollarSign, Wallet, Lock, ChevronRight, Shield, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/* ── Payment method definitions ── */
const METHODS = [
  {
    id: 'cash',
    label: 'Cash',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    desc: 'Pay at the counter',
  },
  {
    id: 'zaad',
    label: 'Somaliland Zaad',
    icon: Smartphone,
    color: 'from-orange-500 to-amber-600',
    badge: 'bg-orange-500/15 text-orange-600 border-orange-500/25',
    desc: 'Somaliland mobile money',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: Wallet,
    color: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-500/15 text-blue-600 border-blue-500/25',
    desc: 'Pay with PayPal balance',
  },
  {
    id: 'card',
    label: 'Card',
    icon: CreditCard,
    color: 'from-violet-500 to-purple-700',
    badge: 'bg-violet-500/15 text-violet-600 border-violet-500/25',
    desc: 'Mastercard / Visa',
  },
];

/* ── Card number formatter: adds space every 4 digits ── */
const fmtCard   = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const fmtExpiry = v => v.replace(/\D/g,'').slice(0,4).replace(/(\d{2})(\d{0,2})/,'$1/$2');
const fmtCVV    = v => v.replace(/\D/g,'').slice(0,4);
const fmtPhone  = v => v.replace(/[^\d+\s-]/g,'').slice(0,15);

/* ── Step indicator ── */
const Step = ({ n, active, done }) => (
  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all duration-300
    ${done  ? 'bg-emerald-500 border-emerald-500 text-white' :
      active ? 'bg-primary border-primary text-white shadow-glow-sm' :
               'border-slate-300 dark:border-slate-600 text-slate-400'}`}>
    {done ? <CheckCircle className="w-4 h-4" /> : n}
  </div>
);

/* ── Field helper ── */
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

/* ══════════════════════════════════════════════ */
const PaymentModal = ({ amount = 0, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step,    setStep]    = useState(1); // 1=select method, 2=enter details, 3=success
  const [method,  setMethod]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ email:'', phone:'', card:'', expiry:'', cvv:'', name:'' });
  const [errors,  setErrors]  = useState({});

  /* ── Simple client-side validation ── */
  const validate = () => {
    const e = {};
    if (method === 'paypal') {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    }
    if (method === 'zaad') {
      if (!form.phone || form.phone.replace(/\D/g,'').length < 7) e.phone = 'Valid phone number required';
    }
    if (method === 'card') {
      if (form.card.replace(/\s/g,'').length < 16) e.card = '16-digit card number required';
      if (!form.expiry || form.expiry.length < 5) e.expiry = 'MM/YY required';
      if (!form.cvv || form.cvv.length < 3)       e.cvv    = '3–4 digit CVV required';
      if (!form.name.trim())                       e.name   = 'Cardholder name required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Simulate payment processing ── */
  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800)); // mock API delay
    setLoading(false);
    setStep(3);
    setTimeout(() => onSuccess(method), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        exit={{   opacity: 0, scale: 0.9, y: 20  }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative w-full max-w-md bg-light-card dark:bg-dark-card rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden"
      >
        {/* ── Decorative top bar ── */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-violet-500 to-accent" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Secure Payment</h2>
            <p className="text-sm text-slate-400 mt-0.5 mb-1">
              Total: <span className="text-primary font-black text-base">${amount.toFixed(2)}</span>
            </p>
            {user && (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" /> Cashier: {user.full_name}
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step indicators ── */}
        {step < 3 && (
          <div className="flex items-center space-x-2 px-6 pb-4">
            <Step n={1} active={step === 1} done={step > 1} />
            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
            <Step n={2} active={step === 2} done={step > 2} />
          </div>
        )}

        <div className="px-6 pb-6">

          {/* ════ STEP 1 — Choose Method ════ */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose your payment method:</p>
              {METHODS.map((m) => (
                <motion.button key={m.id} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setMethod(m.id); setStep(2); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <m.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{m.label}</p>
                      <p className="text-xs text-slate-400">{m.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ════ STEP 2 — Enter Details ════ */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Back button */}
              <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1 mb-2">
                ← Back to methods
              </button>

              {/* Selected method chip */}
              {(() => {
                const m = METHODS.find(m => m.id === method);
                return (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${m.badge}`}>
                    <m.icon className="w-3.5 h-3.5" /> {m.label} selected
                  </div>
                );
              })()}

              {/* ── Cash — no extra fields ── */}
              {method === 'cash' && (
                <div className="glass-card p-5 text-center">
                  <DollarSign className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-bold mb-1">Pay at the counter</p>
                  <p className="text-sm text-slate-400">Hand ${amount.toFixed(2)} to the cashier after confirming.</p>
                </div>
              )}

              {/* ── Zaad ── */}
              {method === 'zaad' && (
                <Field label="Zaad Phone Number" error={errors.phone}>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="form-input pl-10" placeholder="+252 63 123 4567"
                      value={form.phone} onChange={e => setForm({ ...form, phone: fmtPhone(e.target.value) })} />
                  </div>
                </Field>
              )}

              {/* ── PayPal ── */}
              {method === 'paypal' && (
                <Field label="PayPal Email" error={errors.email}>
                  <div className="relative">
                    <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email" className="form-input pl-10" placeholder="you@paypal.com"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </Field>
              )}

              {/* ── Card ── */}
              {method === 'card' && (
                <div className="space-y-3">
                  {/* Card number with brand detection */}
                  <Field label="Card Number" error={errors.card}>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="form-input pl-10 tracking-widest" placeholder="1234 5678 9012 3456"
                        value={form.card} onChange={e => setForm({ ...form, card: fmtCard(e.target.value) })} />
                      {/* Card type indicator */}
                      {form.card.startsWith('5') && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500">MC</span>}
                      {form.card.startsWith('4') && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-500">VISA</span>}
                    </div>
                  </Field>
                  <Field label="Cardholder Name" error={errors.name}>
                    <input className="form-input" placeholder="Name on card"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry (MM/YY)" error={errors.expiry}>
                      <input className="form-input text-center" placeholder="MM/YY"
                        value={form.expiry} onChange={e => setForm({ ...form, expiry: fmtExpiry(e.target.value) })} />
                    </Field>
                    <Field label="CVV" error={errors.cvv}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="password" className="form-input pl-9 text-center" placeholder="•••"
                          value={form.cvv} onChange={e => setForm({ ...form, cvv: fmtCVV(e.target.value) })} />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Security note ── */}
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Your payment is encrypted and secure. We never store card details.</span>
              </div>

              {/* ── Pay button ── */}
              <motion.button onClick={handlePay} disabled={loading}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:shadow-glow flex items-center justify-center space-x-2 disabled:opacity-60 transition-all">
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing…</span></>
                  : <><Lock className="w-4 h-4" /><span>Pay ${amount.toFixed(2)}</span><ChevronRight className="w-4 h-4" /></>
                }
              </motion.button>
            </motion.div>
          )}

          {/* ════ STEP 3 — Success ════ */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mb-5">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-2xl font-black mb-2 text-slate-800 dark:text-slate-100"
              >
                Payment Confirmed!
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-emerald-500 font-bold text-lg mb-2"
              >
                Successfully pay for pay! ✨
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-slate-400 text-sm mb-1"
              >
                ${amount.toFixed(2)} paid via <span className="font-bold text-primary capitalize">{method}</span>
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-slate-400 text-xs"
              >
                Closing automatically…
              </motion.p>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
