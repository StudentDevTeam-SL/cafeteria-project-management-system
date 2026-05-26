import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText,
  LoaderCircle, Mail, Phone, Send, Upload, UserRound
} from 'lucide-react';
import api from '../api/axios';
import staffTeam from '../assets/staff_team.png';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  experienceLevel: '',
  availability: '',
  startDate: '',
  expectedSalary: '',
  portfolioUrl: '',
  coverLetter: '',
  agreedToPolicy: false,
};

const fieldMap = {
  firstName: 'first_name',
  lastName: 'last_name',
  experienceLevel: 'experience_level',
  startDate: 'start_date',
  expectedSalary: 'expected_salary',
  portfolioUrl: 'portfolio_url',
  coverLetter: 'cover_letter',
  agreedToPolicy: 'agreed_to_policy',
};

const positions = [
  'Barista',
  'Chef',
  'Waiter / Waitress',
  'Cashier',
  'Cleaner',
  'Kitchen Assistant',
  'Supervisor',
  'Other',
];

const experienceLevels = [
  'No experience yet',
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  '5+ years',
];

const availabilityOptions = [
  'Full time',
  'Part time',
  'Morning shift',
  'Evening shift',
  'Weekend shift',
  'Flexible',
];

const JobApplication = () => {
  const [form, setForm] = useState(initialForm);
  const [cv, setCv] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setCv(null);
    setError('');
    setSubmitted(false);
  };

  const buildPayload = () => {
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      const apiKey = fieldMap[key] || key;
      if (typeof value === 'boolean') {
        payload.append(apiKey, value ? 'true' : 'false');
      } else if (value) {
        payload.append(apiKey, value);
      }
    });

    if (cv) {
      payload.append('cv', cv);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!cv) {
      setError('Please upload your CV before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('menu/job-applications/', buildPayload());
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit job application:', err);
      setError('We could not submit your application. Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="relative min-h-[calc(100dvh-5rem)] overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <img
          src={staffTeam}
          alt="Grand Cafeteria team"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 grid-pattern opacity-25" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl items-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl text-white"
          >
            <Link
              to="/home"
              className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Link>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-md">
              <BriefcaseBusiness className="h-4 w-4 text-cyan-300" />
              Careers at The Grand Cafeteria
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-tight md:text-7xl">
              Apply to work with us
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Send your information and CV. Our team will review your application and contact you by Gmail within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-16 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {[
              {
                icon: UserRound,
                title: 'Your details',
                text: 'Share your name, contact information, and the role you want.',
              },
              {
                icon: FileText,
                title: 'Add your CV',
                text: 'Upload your CV as PDF, DOC, or DOCX so the manager can review your experience.',
              },
              {
                icon: Mail,
                title: 'Gmail reply',
                text: 'After you submit, please check your Gmail within 24 hours for our response.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass-card p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 shadow-2xl shadow-cyan-500/5 sm:p-8"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex min-h-[560px] flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0.7, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                    className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10"
                  >
                    <span className="absolute h-full w-full rounded-full bg-emerald-400/20 animate-ping" />
                    <CheckCircle2 className="relative h-12 w-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-3xl font-black">Thank you</h2>
                  <p className="mt-3 max-w-md text-slate-500 dark:text-slate-300">
                    Your application was sent. Please check your Gmail after 24 hours for our response.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link to="/home" className="btn-primary inline-flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back Home
                    </Link>
                    <button type="button" onClick={resetForm} className="btn-ghost">
                      Submit Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-primary">Job application</p>
                    <h2 className="mt-2 text-3xl font-black">Tell us about yourself</h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="field-label">First Name</span>
                      <input
                        className="form-input"
                        required
                        value={form.firstName}
                        onChange={event => updateField('firstName', event.target.value)}
                        autoComplete="given-name"
                        placeholder="First name"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Last Name</span>
                      <input
                        className="form-input"
                        required
                        value={form.lastName}
                        onChange={event => updateField('lastName', event.target.value)}
                        autoComplete="family-name"
                        placeholder="Last name"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Email / Gmail</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className="form-input pl-10"
                          required
                          type="email"
                          value={form.email}
                          onChange={event => updateField('email', event.target.value)}
                          autoComplete="email"
                          placeholder="you@gmail.com"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="field-label">Phone Number</span>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className="form-input pl-10"
                          required
                          value={form.phone}
                          onChange={event => updateField('phone', event.target.value)}
                          autoComplete="tel"
                          placeholder="+252 63 123 4567"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="field-label">Job Position</span>
                      <select
                        className="form-input"
                        required
                        value={form.position}
                        onChange={event => updateField('position', event.target.value)}
                      >
                        <option value="">Choose position</option>
                        {positions.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="field-label">Experience</span>
                      <select
                        className="form-input"
                        required
                        value={form.experienceLevel}
                        onChange={event => updateField('experienceLevel', event.target.value)}
                      >
                        <option value="">Choose experience</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="field-label">Availability</span>
                      <select
                        className="form-input"
                        value={form.availability}
                        onChange={event => updateField('availability', event.target.value)}
                      >
                        <option value="">Choose availability</option>
                        {availabilityOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="field-label">Start Date</span>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className="form-input pl-10"
                          type="date"
                          value={form.startDate}
                          onChange={event => updateField('startDate', event.target.value)}
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="field-label">Expected Salary</span>
                      <input
                        className="form-input"
                        value={form.expectedSalary}
                        onChange={event => updateField('expectedSalary', event.target.value)}
                        placeholder="Optional"
                      />
                    </label>
                    <label className="block">
                      <span className="field-label">Portfolio or Reference Link</span>
                      <input
                        className="form-input"
                        type="url"
                        value={form.portfolioUrl}
                        onChange={event => updateField('portfolioUrl', event.target.value)}
                        placeholder="https://..."
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="field-label">Why should we hire you?</span>
                    <textarea
                      className="form-input min-h-36 resize-none"
                      required
                      rows={5}
                      value={form.coverLetter}
                      onChange={event => updateField('coverLetter', event.target.value)}
                      placeholder="Tell us about your skills, schedule, and why you want to work here."
                    />
                  </label>

                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-center transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900/40">
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={event => setCv(event.target.files?.[0] || null)}
                      required
                    />
                    <Upload className="mb-3 h-7 w-7 text-primary transition-transform group-hover:-translate-y-1" />
                    <span className="font-bold text-slate-800 dark:text-white">
                      {cv ? cv.name : 'Add CV'}
                    </span>
                    <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      PDF, DOC, or DOCX
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={form.agreedToPolicy}
                      onChange={event => updateField('agreedToPolicy', event.target.checked)}
                      required
                    />
                    <span>I confirm this information is correct and I agree to be contacted about this job application.</span>
                  </label>

                  {error && (
                    <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Sending Application
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Application
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default JobApplication;
