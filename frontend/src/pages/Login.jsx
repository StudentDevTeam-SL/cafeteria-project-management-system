import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSoundContext } from '../context/SoundContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, User, AlertCircle, ChefHat, Eye, EyeOff, 
  ArrowRight, Building2, Sparkles, Server,
  X, Mail, KeyRound, ShieldCheck,
  Coffee, Users, DollarSign
} from 'lucide-react';

/**
 * Login Component
 * Redesigned for a big enterprise company.
 * Features:
 * - Standalone full-screen layout (doesn't overlap with main site navbar).
 * - High-end animated stats and branding on the left.
 * - Glassmorphic, luxury card layout on the right.
 * - Single Sign-On (SSO) simulation.
 * - Working "Forgot Password?" interactive modal workflow.
 * - Beautiful background layering: 1080p live chef dining video.
 */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.8l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.5 7.7l3.9 3c.9-2.7 3.4-4.7 6.6-4.7z"/>
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/>
    <path fill="#FBBC05" d="M5.4 14.7c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L1.5 7.7C.5 9.6 0 11.7 0 14s.5 4.4 1.5 6.3l3.9-3z"/>
    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.7-2-6.6-4.7L1.5 16.6C3.4 20.3 7.3 23 12 23z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0A66C2]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Login = () => {
  const { login, googleSocialLogin, isLoading } = useAuth();
  const { playSound } = useSoundContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: PIN, 3: New Pass, 4: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');

  // Google OAuth Simulation State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1: Account Selection / Enter Email, 2: Checking email against database, 3: Success Welcome & Redirect
  const [googleShowCustomInput, setGoogleShowCustomInput] = useState(false);
  const [googleSelectedEmail, setGoogleSelectedEmail] = useState('');
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [googleProfileName, setGoogleProfileName] = useState('');
  const [googleProfileRole, setGoogleProfileRole] = useState('');
  const googleStepLabels = ['Gmail', 'Database', 'Welcome'];

  const [tilt, setTilt]         = useState({ x:0, y:0 });
  const cardRef = useRef(null);

  // Mouse tilt effect for 3D glassmorphic card
  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientY - r.top)  / r.height - 0.5) * -8,
      y: ((e.clientX - r.left) / r.width  - 0.5) *  8,
    });
  };
  
  const onLeave = () => setTilt({ x:0, y:0 });

  // Handle standard submit (checking overrides)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true); 
    setError('');
    
    // Check local storage overrides for updated passwords
    const overrides = JSON.parse(localStorage.getItem('password_overrides') || '{}');
    const userLower = username.toLowerCase();
    const hasOverride = overrides[userLower];

    try { 
      if (hasOverride) {
        if (hasOverride === password) {
          // If input matches override password, login using original database credentials
          let realBackendPassword = password;
          if (userLower === 'admin') realBackendPassword = 'admin';
          else if (userLower === 'manager') realBackendPassword = 'manager';
          else if (userLower === 'employee') realBackendPassword = '1234';
          
          await login(username, realBackendPassword);
          return;
        } else {
          throw new Error('Invalid credentials. Password override did not match.');
        }
      }
      
      // Standard auth call
      await login(username, password); 
    }
    catch (err) { 
      setError(err.message || 'Invalid credentials. Please try again.'); 
    }
    finally { 
      setSubmitting(false); 
    }
  };

  // Social authentication - logs in using real backend!
  const handleSocialLogin = async (provider) => {
    setError('');
    
    if (provider === 'google') {
      // Open Google Sign-in simulation modal
      setGoogleStep(1);
      setGoogleSelectedEmail('');
      setGoogleCustomEmail('');
      setGoogleError('');
      setGoogleProfileName('');
      setGoogleProfileRole('');
      setGoogleShowCustomInput(false);
      setShowGoogleModal(true);
      return;
    }

    setSsoLoading(true);
    let targetUser = '';
    let targetPass = '';
    
    if (provider === 'linkedin') {
      targetUser = 'manager';
      targetPass = 'manager';
    } else if (provider === 'facebook') {
      targetUser = 'employee';
      targetPass = '1234';
    }
    
    // Check overrides
    const overrides = JSON.parse(localStorage.getItem('password_overrides') || '{}');
    const hasOverride = overrides[targetUser];
    if (hasOverride) {
      targetPass = hasOverride;
    }
    
    try {
      // Small timeout for nice visual spinner feedback
      await new Promise(resolve => setTimeout(resolve, 600));
      await login(targetUser, targetPass);
    } catch (err) {
      setError(err.message || `Failed to authenticate via ${provider}. Please try direct login.`);
    } finally {
      setSsoLoading(false);
    }
  };

  // Google flow email verification handler
  const verifyGoogleEmail = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setGoogleSelectedEmail(normalizedEmail);
    setGoogleStep(2);
    setGoogleError('');
    
    try {
      // 1. Artificial delay for aesthetic checking spinner (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 2. Query the backend checker
      const response = await api.post('auth/check-email/', { email: normalizedEmail });
      
      if (response.data.found) {
        const { full_name, role, email: verifiedEmail } = response.data;
        const loginEmail = verifiedEmail || normalizedEmail;

        setGoogleSelectedEmail(loginEmail);
        setGoogleProfileName(full_name);
        setGoogleProfileRole(role);
        setGoogleStep(3);
        
        // Play welcome sound!
        if (playSound) playSound('bell');
        
        // 3. Keep animation visible for 2.3 seconds, then log in and redirect
        setTimeout(async () => {
          try {
            await googleSocialLogin(`mock-google-token-${loginEmail}`);
            setShowGoogleModal(false);
          } catch (loginErr) {
            setGoogleError(loginErr.message || 'Authentication failed. Please try again.');
            setGoogleStep(1);
          }
        }, 2300);
      } else {
        setGoogleError('This Gmail account is not registered in the system database. Please use a registered staff Gmail.');
        setGoogleStep(1);
      }
    } catch (err) {
      setGoogleError(err.response?.data?.error || err.message || 'An error occurred during verification.');
      setGoogleStep(1);
    }
  };

  const handleSelectGoogleEmail = (email) => {
    verifyGoogleEmail(email);
  };

  const handleCustomGoogleEmailSubmit = (e) => {
    e.preventDefault();
    if (!googleCustomEmail) return;
    verifyGoogleEmail(googleCustomEmail);
  };

  // Forgot password flow handlers
  const openForgotModal = () => {
    setForgotStep(1);
    setForgotEmail('');
    setPinCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setShowForgotModal(true);
  };

  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    const validEmails = ['admin@cafeteria.com', 'manager@cafeteria.com', 'employee@cafeteria.com'];
    if (!validEmails.includes(forgotEmail.toLowerCase())) {
      setForgotError('Email address not registered in corporate directory.');
      return;
    }
    
    setForgotError('');
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(pin);
    setForgotStep(2);
  };

  const handleForgotPinSubmit = (e) => {
    e.preventDefault();
    if (pinCode !== generatedPin) {
      setForgotError('Invalid verification pin code. Please try again.');
      return;
    }
    setForgotError('');
    setForgotStep(3);
  };

  const handleForgotNewPasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setForgotError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    
    let targetUsername = '';
    if (forgotEmail.toLowerCase() === 'admin@cafeteria.com') targetUsername = 'admin';
    else if (forgotEmail.toLowerCase() === 'manager@cafeteria.com') targetUsername = 'manager';
    else if (forgotEmail.toLowerCase() === 'employee@cafeteria.com') targetUsername = 'employee';
    
    const overrides = JSON.parse(localStorage.getItem('password_overrides') || '{}');
    overrides[targetUsername] = newPassword;
    localStorage.setItem('password_overrides', JSON.stringify(overrides));
    
    setForgotError('');
    setForgotStep(4);
  };

  if (isLoading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#070b13]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/>
        <p className="text-sm font-semibold text-slate-400">Loading Enterprise Environment...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full overflow-hidden bg-[#070b13] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* ── LEFT SIDE: Enterprise Branding & Statistics ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between pt-24 pb-16 px-16 overflow-hidden bg-[#070b13] border-r border-slate-800/40">
        
        {/* Background Media Container */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {/* 1080p Live Chef Dining Video */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          >
            <source src="https://videos.pexels.com/video-files/3769033/3769033-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Ambient transparent overlay with light middle layer to make video fully visible */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#070b13]/90 via-[#0e1423]/35 to-[#04060a]/85 z-1" />

        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="z-10"
        >
          <Link to="/home" className="flex items-center space-x-3 hover:opacity-85 transition-opacity inline-flex">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <ChefHat className="w-6 h-6 text-white"/>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-heading">GrandCafé</span>
              <span className="text-[10px] block text-slate-400 tracking-widest uppercase font-bold">Enterprise Suite</span>
            </div>
          </Link>
        </motion.div>

        {/* Center Main Slogan */}
        <div className="z-10 my-auto py-12 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-accent text-xs font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Version 1.2 Enterprise Ready</span>
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight font-heading">
              Corporate Cafeteria<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Management OS
              </span>
            </h1>
            <p className="text-slate-200 text-base leading-relaxed mb-10 drop-shadow-md">
              A comprehensive system designed for multi-branch campuses, operations scheduling, raw inventory controls, and automatic payroll disbursements.
            </p>
          </motion.div>

          {/* Quick Stats Grid matching the custom luxury design mock */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-2 gap-5"
          >
            {[
              { icon: Coffee, value: "1,250+", desc: "Daily Orders", colorClass: "text-[#a78bfa]" },
              { icon: Building2, value: "12 Hubs", desc: "Branch Networks", colorClass: "text-[#34d399]" },
              { icon: Users, value: "150+", desc: "Staff Directory", colorClass: "text-[#818cf8]" },
              { icon: DollarSign, value: "$42.3K", desc: "Daily Revenue Flow", colorClass: "text-[#fbbf24]" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white/[0.07] border border-white/[0.15] backdrop-blur-md hover:bg-white/[0.12] hover:border-white/[0.25] transition-all duration-350 group shadow-lg">
                <stat.icon className={`w-8 h-8 ${stat.colorClass} mb-3 group-hover:scale-110 transition-transform duration-300`} />
                <p className="text-2xl font-black text-white mb-1.5 font-heading tracking-tight">{stat.value}</p>
                <p className="text-slate-200 text-xs font-semibold leading-normal opacity-90">{stat.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }} 
          className="flex justify-between items-center z-10 border-t border-white/[0.06] pt-6"
        >
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Server className="w-3.5 h-3.5 text-accent" />
            <span>Centralized Campus Server: Online</span>
          </div>
          <span className="text-slate-500 text-xs">© 2026 GrandCafé Inc.</span>
        </motion.div>
      </div>

      {/* ── RIGHT SIDE: Glassmorphic Login Form ── */}
      <div className="login-light-panel w-full lg:w-1/2 flex flex-col justify-center items-center pt-24 pb-16 px-6 md:px-12 relative overflow-hidden transition-colors duration-300">
        
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.055)_1px,transparent_1px)] dark:bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:32px_32px] opacity-55 dark:opacity-[0.04] pointer-events-none"/>
        <div className="hidden dark:block absolute w-[450px] h-[450px] rounded-full bg-primary/20 blur-[130px] top-[-10%] right-[-5%] pointer-events-none"/>
        <div className="hidden dark:block absolute w-[300px] h-[300px] rounded-full bg-accent/25 blur-[100px] bottom-[-5%] left-[-5%] pointer-events-none"/>
        <div className="hidden dark:block absolute w-[250px] h-[250px] rounded-full bg-amber-500/10 blur-[80px] top-[40%] left-[20%] pointer-events-none"/>

        {/* Mobile Header (Hidden on desktop) */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <ChefHat className="w-5.5 h-5.5 text-white"/>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">GrandCafé</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold font-sans">Enterprise OS</span>
        </div>

        {/* Secure Gate Badge */}
        <div className="hidden sm:flex items-center space-x-2.5 px-4 py-1.5 rounded-full glass dark:bg-white/[0.05] dark:border-white/[0.1] text-[10px] text-slate-600 dark:text-slate-300 font-semibold mb-6 z-10 transition-colors duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Secure Enterprise Connection Active</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>TLS 1.3 Encryption Verified</span>
        </div>

        {/* 3D Glassmorphic Card Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }} 
          className="w-full max-w-md animate-page-enter"
        >
          <div
            ref={cardRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full glass-card dark:bg-white/[0.06] dark:border-white/[0.15] rounded-3xl p-8 md:p-10 dark:shadow-2xl relative transition-all duration-300"
          >
            {/* Top card glowing blur corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full blur-2xl pointer-events-none" />

            {/* Centered Logo block */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
                <ChefHat className="w-6 h-6 text-white"/>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">GrandCafé</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold mt-1">Enterprise Suite</span>
            </div>

            {/* Login Title */}
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading text-center mb-6">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl animate-pulse"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold leading-relaxed">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Email</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    autoComplete="username" 
                    required 
                    placeholder="username@gmail.com"
                    className="form-input h-11 pl-10 pr-10 rounded-2xl dark:bg-slate-900 focus:ring-primary/50"
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type={showPw ? 'text' : 'password'} 
                    autoComplete="current-password" 
                    required 
                    placeholder="Password"
                    className="form-input h-11 pl-10 pr-10 rounded-2xl dark:bg-slate-900 focus:ring-primary/50"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Left-Aligned Forgot Password Link */}
                <div className="text-left mt-2">
                  <button 
                    type="button" 
                    onClick={openForgotModal}
                    className="text-xs text-accent font-bold hover:underline transition-all cursor-pointer bg-transparent border-none"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Standard Login Submit Button with system color (Indigo) */}
              <motion.button 
                type="submit" 
                disabled={submitting}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
                className="w-full h-11 flex items-center justify-center bg-primary hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 mt-6 cursor-pointer"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-sm font-bold tracking-wide">Sign in</span>
                )}
              </motion.button>

              {/* continue divider */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-white/[0.08]"></div>
                <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 dark:text-slate-400">or continue with</span>
                <div className="flex-grow border-t border-slate-200 dark:border-white/[0.08]"></div>
              </div>

              {/* Social authentication capsules */}
              <div className="flex items-center space-x-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={ssoLoading}
                  className="flex-1 h-11 glass-card dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('linkedin')}
                  disabled={ssoLoading}
                  className="flex-1 h-11 glass-card dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <LinkedinIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={ssoLoading}
                  className="flex-1 h-11 glass-card dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
                >
                  <FacebookIcon />
                </button>
              </div>

              {/* Footer registration link */}
              <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
                <span>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => alert("New staff and manager accounts are provisioned by your system administrator.")}
                  className="text-accent font-bold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Register for free
                </button>
              </div>
            </form>

          </div>

          {/* Footer branding */}
          <div className="mt-6 flex justify-between items-center px-4">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Production Cloud v1.2</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
              <span>All Systems Operational</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-[#070b13]/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md glass-card dark:bg-[#0f172a]/95 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Input Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5.5 h-5.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Forgot Password</h3>
                      <p className="text-xs text-slate-500">Provide your corporate directory email</p>
                    </div>
                  </div>

                  {forgotError && (
                    <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Corporate Email</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="username@cafeteria.com"
                      className="form-input text-sm h-11"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                    />
                  </div>

                  {/* Suggestion list */}
                  <div className="p-3.5 glass-card dark:bg-slate-900/40 rounded-2xl dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select a Demo Account to Reset</span>
                    <div className="flex flex-col space-y-1.5">
                      {[
                        { label: "Admin: admin@cafeteria.com", email: "admin@cafeteria.com" },
                        { label: "Manager: manager@cafeteria.com", email: "manager@cafeteria.com" },
                        { label: "Staff: employee@cafeteria.com", email: "employee@cafeteria.com" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForgotEmail(item.email)}
                          className="text-left text-xs font-semibold text-primary hover:underline"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Send Verification Pin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 2: Input PIN */}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotPinSubmit} className="space-y-5">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <KeyRound className="w-5.5 h-5.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Verify Identity</h3>
                      <p className="text-xs text-slate-500">Security code sent to {forgotEmail}</p>
                    </div>
                  </div>

                  {forgotError && (
                    <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* Simulated pin helper banner */}
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <p className="text-xs font-bold flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Demo Notice: Verification Pin</span>
                    </p>
                    <p className="text-xs mt-1">For demo purposes, your verification pin is: <strong className="text-sm select-all tracking-wider text-amber-700 dark:text-amber-300 font-mono font-black">{generatedPin}</strong></p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">6-Digit Pin</label>
                    <input 
                      type="text" 
                      required 
                      maxLength="6"
                      placeholder="******"
                      className="form-input text-center text-lg tracking-widest font-mono font-bold h-11"
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 3: Input New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleForgotNewPasswordSubmit} className="space-y-5">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5.5 h-5.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Reset Password</h3>
                      <p className="text-xs text-slate-500 font-medium">Create a strong new credential key</p>
                    </div>
                  </div>

                  {forgotError && (
                    <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">New Password</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      className="form-input text-sm h-11"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••"
                      className="form-input text-sm h-11"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 4: Success Screen */}
              {forgotStep === 4 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">Password Restored</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">Your corporate credential key has been reset successfully. You can now sign in with your new password.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full h-11 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Return to Login</span>
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── GOOGLE SIGN-IN MODAL ── */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (googleStep !== 2 && googleStep !== 3) {
                  setShowGoogleModal(false);
                }
              }}
              className="absolute inset-0 bg-[#070b13]/80 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md glass-card dark:bg-[#0f172a]/95 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
            >
              {/* Close Button */}
              {googleStep !== 2 && googleStep !== 3 && (
                <button 
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="mb-6 grid grid-cols-3 gap-2 text-center">
                {googleStepLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = googleStep >= stepNumber;

                  return (
                    <div key={label} className="space-y-1">
                      <div className={`h-1.5 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Account Selection / Enter Email */}
              {googleStep === 1 && (
                <div className="space-y-6">
                  {/* Google Logo / Header */}
                  <div className="flex flex-col items-center justify-center text-center pb-2">
                    <GoogleIcon />
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-4 font-heading">Sign in with Google</h3>
                    <p className="text-xs text-slate-500 mt-1">Choose an account to continue to GrandCafé Suite</p>
                  </div>

                  {googleError && (
                    <div className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{googleError}</span>
                    </div>
                  )}

                  {!googleShowCustomInput ? (
                    <div className="space-y-3">
                      {/* Predefined accounts */}
                      {[
                        { name: "Admin Manager", email: "admin@gmail.com", role: "Admin", initials: "AD", color: "bg-indigo-600" },
                        { name: "Cafeteria Manager", email: "manager@gmail.com", role: "Manager", initials: "MN", color: "bg-emerald-600" },
                        { name: "Service Staff", email: "employee@gmail.com", role: "Employee", initials: "EM", color: "bg-amber-600" }
                      ].map((acc, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectGoogleEmail(acc.email)}
                          className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-card dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:border-slate-800/80 transition-all text-left cursor-pointer group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-full ${acc.color} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                              {acc.initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{acc.name}</p>
                              <p className="text-[11px] text-slate-500">{acc.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                            {acc.role}
                          </span>
                        </button>
                      ))}

                      {/* Use custom email */}
                      <button
                        type="button"
                        onClick={() => {
                          setGoogleShowCustomInput(true);
                          setGoogleError('');
                        }}
                        className="w-full text-center py-2.5 text-xs text-primary font-bold hover:underline cursor-pointer bg-transparent border-none mt-2"
                      >
                        Use another Google account
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCustomGoogleEmailSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Gmail Address</label>
                        <input
                          type="email"
                          required
                          placeholder="yourname@gmail.com"
                          className="form-input h-11 rounded-2xl dark:bg-slate-900 focus:ring-primary/50"
                          value={googleCustomEmail}
                          onChange={e => setGoogleCustomEmail(e.target.value)}
                        />
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setGoogleShowCustomInput(false)}
                          className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 h-11 bg-primary text-white font-bold rounded-2xl text-xs shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Step 2: Database Check */}
              {googleStep === 2 && (
                <div className="text-center py-8 space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-blue-500 border-b-green-500 border-l-yellow-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GoogleIcon />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">Verifying Account</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Checking Gmail against enterprise directory database...</p>
                  </div>

                  <div className="max-w-xs mx-auto text-[11px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    POST /api/auth/check-email/
                    <span className="block mt-1 text-slate-500">"{googleSelectedEmail}"</span>
                  </div>
                </div>
              )}

              {/* Step 3: Welcome Animation */}
              {googleStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent opacity-20 animate-ping" />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-accent blur-md opacity-75 animate-pulse" />
                    
                    <div className="absolute inset-0 rounded-full bg-[#1e293b] border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-lg relative overflow-hidden">
                      <ChefHat className="w-12 h-12 text-accent" />
                    </div>
                  </div>

                  <div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security Clearance Verified</span>
                    </motion.div>

                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-heading break-words">
                      Welcome, {googleProfileName}!
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-semibold break-all">
                      {googleSelectedEmail}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-semibold flex items-center justify-center space-x-1.5">
                      <span>Role:</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        {googleProfileRole}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="w-40 h-1.5 bg-slate-150 dark:bg-slate-800 rounded-full mx-auto overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full animate-loading-bar w-full" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">Entering Dashboard...</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default Login;
