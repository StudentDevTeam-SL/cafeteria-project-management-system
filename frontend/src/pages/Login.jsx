import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, ChefHat, Eye, EyeOff, ArrowRight, Zap, Volume2, VolumeX } from 'lucide-react';

const Login = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [muted, setMuted]       = useState(true);
  const [tilt, setTilt]         = useState({ x:0, y:0 });
  const cardRef = useRef(null);

  const onMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientY - r.top)  / r.height - 0.5) * -14,
      y: ((e.clientX - r.left) / r.width  - 0.5) *  14,
    });
  };
  const onLeave = () => setTilt({ x:0, y:0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try { await login(username, password); }
    catch (err) { setError(err.message || 'Invalid credentials. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-dark">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark">

      {/* ── LEFT: Video Loop ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <video autoPlay loop muted={muted} playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
          <source src="https://videos.pexels.com/video-files/3769033/3769033-hd_1920_1080_25fps.mp4" type="video/mp4"/>
          <source src="https://videos.pexels.com/video-files/3212076/3212076-uhd_2560_1440_25fps.mp4" type="video/mp4"/>
        </video>
        <div className="absolute inset-0 bg-black/60"/>

        {/* Mute */}
        <button onClick={()=>setMuted(m=>!m)}
          className="absolute bottom-6 right-6 z-30 p-3 glass rounded-full text-white hover:scale-110 transition-transform">
          {muted?<VolumeX className="w-4 h-4"/>:<Volume2 className="w-4 h-4"/>}
        </button>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40">
              <ChefHat className="w-7 h-7 text-white"/>
            </div>
            <span className="text-2xl font-black text-white">Cafeteria Management</span>
          </motion.div>

          <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:.2,duration:.9}}>
            <h1 className="text-5xl font-black text-white mb-5 leading-tight">
              Smart Cafeteria<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Management
              </span>
            </h1>
            <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-sm">
              Orders · Inventory · Payroll · Team — all from one beautiful dashboard.
            </p>
            <div className="flex flex-wrap gap-2">
              {['📊 Analytics','🍽️ Menu','👥 Team','💰 Payroll','📦 Inventory'].map(f=>(
                <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10 backdrop-blur-sm">{f}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.4}} className="flex space-x-8">
            {[{v:'500+',l:'Daily Orders'},{v:'99.9%',l:'Uptime'},{v:'50+',l:'Staff'}].map(s=>(
              <div key={s.l} className="text-center">
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light dark:bg-dark relative overflow-hidden">
        {/* bg orbs */}
        <div className="absolute inset-0 particles-bg pointer-events-none"/>
        <div className="absolute w-80 h-80 rounded-full bg-primary/5 blur-3xl top-0 right-0 pointer-events-none"/>
        <div className="absolute w-60 h-60 rounded-full bg-accent/5 blur-3xl bottom-0 left-0 pointer-events-none"/>

        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:.7}} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white"/>
              </div>
              <span className="text-xl font-black gradient-text">Cafeteria Management</span>
            </div>
          </div>

          {/* 3D Card */}
          <div
            ref={cardRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
              transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition:'transform 0.12s ease-out',
              boxShadow: tilt.x!==0
                ? '0 40px 80px -20px rgba(59,130,246,0.3), 0 20px 40px -10px rgba(0,0,0,0.2)'
                : '0 20px 60px -15px rgba(0,0,0,0.15)',
            }}
            className="glass-card p-8 md:p-10 relative"
          >
            {/* Shine */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl"/>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black gradient-text mb-2">Welcome Back</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
                  className="flex items-start space-x-2 bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                  <span className="text-xs">{error}</span>
                </motion.div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Username</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors"/>
                  <input type="text" autoComplete="username" required placeholder="Enter your username"
                    className="form-input pl-10 group-focus-within:shadow-lg group-focus-within:shadow-primary/10 transition-shadow"
                    value={username} onChange={e=>setUsername(e.target.value)}/>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors"/>
                  <input type={showPw?'text':'password'} autoComplete="current-password" required placeholder="••••••••"
                    className="form-input pl-10 pr-10 group-focus-within:shadow-lg group-focus-within:shadow-primary/10 transition-shadow"
                    value={password} onChange={e=>setPassword(e.target.value)}/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                    {showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={submitting}
                whileHover={{scale:1.02,y:-1}} whileTap={{scale:.98}}
                className="w-full py-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-shadow disabled:opacity-50 mt-2">
                {submitting
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : (<><Zap className="w-5 h-5"/><span>Sign In</span><ArrowRight className="w-4 h-4"/></>)
                }
              </motion.button>
            </form>

            {/* Quick login */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
              <p className="text-center text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Quick Demo Login</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:'👑 Admin',    u:'admin',    p:'admin',    cls:'border-primary/40 text-primary hover:bg-primary/10'},
                  {label:'👤 Employee', u:'employee', p:'employee', cls:'border-accent/40 text-accent hover:bg-accent/10'},
                ].map(b=>(
                  <motion.button key={b.u} type="button" whileHover={{scale:1.04,y:-1}} whileTap={{scale:.97}}
                    onClick={()=>{setUsername(b.u);setPassword(b.p);}}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${b.cls}`}>
                    {b.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">© 2026 Cafeteria Management · React + Django</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
