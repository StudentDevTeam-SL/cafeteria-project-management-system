import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Moon, Palette, Save, Check, User, Shield, Database, Zap, Camera, Type, Trash2, PlusCircle, Users as UsersIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useSoundContext } from '../context/SoundContext';
import { Volume2, VolumeX, Music } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

/* ── Accent color presets — live-update CSS variable ── */
const ACCENT_COLORS = [
  { name:'Ocean Blue',     primary:'#3b82f6', accent:'#06b6d4' },
  { name:'Forest Green',   primary:'#10b981', accent:'#14b8a6' },
  { name:'Royal Purple',   primary:'#8b5cf6', accent:'#a855f7' },
  { name:'Sunset Orange',  primary:'#f59e0b', accent:'#ef4444' },
  { name:'Rose Pink',      primary:'#ec4899', accent:'#f43f5e' },
  { name:'Indigo',         primary:'#6366f1', accent:'#8b5cf6' },
];

const FONT_SIZES = [
  { label:'Small',  cls:'text-xs',  px:'13px' },
  { label:'Medium', cls:'text-sm',  px:'15px' },
  { label:'Large',  cls:'text-base',px:'17px' },
];

const Toggle = ({ checked, onChange }) => (
  <button onClick={()=>onChange(!checked)} className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked?'bg-primary':'bg-gray-200 dark:bg-slate-600'}`}>
    <motion.div animate={{x:checked?24:2}} transition={{type:'spring',stiffness:300,damping:20}} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"/>
  </button>
);

const Section = ({ icon:Icon, title, children, delay=0 }) => (
  <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay}} className="glass-card p-6">
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-700/60">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Icon className="w-5 h-5 text-white"/></div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Row = ({ icon:Icon, label, desc, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary"/></div>
      <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p><p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{desc}</p></div>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, updateUser, switchRole } = useAuth();
  const { soundEnabled, setSoundEnabled, volume, setVolume, soundType, setSoundType, playSound } = useSoundContext();
  const isAdmin = user?.role === 'Admin';

  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab]       = useState('personal'); // 'personal' | 'system'
  // Avatar: persist locally in localStorage (no backend field required)
  const [avatar, setAvatar] = useState(() => localStorage.getItem('avatar') || '');
  const [accentIdx, setAccentIdx] = useState(0);
  const [fontSize, setFontSize]   = useState(1); // index into FONT_SIZES
  // Pre-populate from the authenticated user object
  const [profile, setProfile] = useState({
    full_name:    user?.full_name || user?.username || '',
    email:        user?.email        || '',
    phone:        user?.phone_number || '',
  });
  const [notifications, setNotifications] = useState({ emailAlerts:true, lowStockAlerts:true, orderUpdates:false, payrollReminders:true });
  const fileRef = useRef(null);
  const { showToast } = useToast();

  const [systemUsers, setSystemUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Employee', email: '', phone_number: '' });

  useEffect(() => {
    if (isAdmin && tab === 'system') {
      api.get('auth/users/').then(res => setSystemUsers(res.data.results || res.data)).catch(console.error);
    }
  }, [isAdmin, tab]);

  const handleCreateUser = async () => {
    if(!newUser.username || !newUser.password) {
      showToast('Username and password are required', {type:'error'}); return;
    }
    try {
      const res = await api.post('auth/users/', newUser);
      setSystemUsers([...systemUsers, res.data]);
      setNewUser({ username: '', password: '', role: 'Employee', email: '', phone_number: '' });
      showToast('User created successfully', {type:'success'});
    } catch(err) {
      console.error(err);
      showToast('Failed to create user', {type:'error'});
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`auth/users/${id}/`);
      setSystemUsers(systemUsers.filter(u => u.id !== id));
      showToast('User deleted successfully', {type:'warning'});
    } catch(err) {
      console.error(err);
    }
  };

  /* Apply accent color to CSS variables */
  const applyAccent = idx => {
    const c = ACCENT_COLORS[idx];
    document.documentElement.style.setProperty('--tw-color-primary', c.primary);
    document.documentElement.style.setProperty('--tw-color-accent',  c.accent);
    setAccentIdx(idx);
  };

  /* Apply font size to root */
  const applyFont = idx => {
    document.documentElement.style.setProperty('font-size', FONT_SIZES[idx].px);
    setFontSize(idx);
  };

  const handleAvatar = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => {
      const dataUrl = r.result;
      setAvatar(dataUrl);
      // Persist avatar in localStorage so it survives page reloads
      localStorage.setItem('avatar', dataUrl);
    };
    r.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Split full_name back into first / last for the Django backend
      const nameParts = (profile.full_name || '').trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name  = nameParts.slice(1).join(' ');

      await updateUser({
        first_name,
        last_name,
        email:        profile.email,
        phone_number: profile.phone,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      showToast('Profile saved successfully!', { type: 'success' });
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast(
        err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save profile.',
        { type: 'error', duration: 5000 }
      );
    } finally {
      setSaving(false);
    }
  };

  const tabs = [{ id:'personal', label:'Personal' }, ...(isAdmin ? [{ id:'system', label:'System & Admin' }] : [])];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <h1 className="text-4xl font-black gradient-text">Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Customize your Cafeteria Management experience.</p>
      </motion.div>

      {/* Role badge + switcher */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-3">
        <span className={`badge ${isAdmin?'badge-purple':'badge-blue'} text-sm`}>{user?.role}</span>
        <button onClick={switchRole} className="text-xs text-slate-400 hover:text-primary underline transition-colors">
          Switch to {isAdmin?'Employee':'Admin'} view
        </button>
      </motion.div>

      {/* Tab nav */}
      <div className="flex gap-2">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab===t.id?'bg-primary text-white shadow-lg shadow-primary/30':'glass-card text-slate-500 hover:text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='personal' && <>
        {/* Profile + Avatar */}
        <Section icon={User} title="Profile & Avatar">
          <div className="flex items-center gap-5 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black overflow-hidden shadow-lg shadow-primary/20">
                {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover"/> : profile.full_name.charAt(0)}
              </div>
              <button onClick={()=>fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4"/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar}/>
            </div>
            <div>
              <p className="font-bold text-lg">{profile.full_name}</p>
              <p className="text-sm text-slate-400">{profile.email}</p>
              <p className="text-xs text-slate-400 mt-1">Click the camera to upload a profile photo</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{label:'Full Name',key:'full_name'},{label:'Email',key:'email'},{label:'Phone',key:'phone'}].map(f=>(
              <div key={f.key}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-1.5">{f.label}</label>
                <input className="form-input" value={profile[f.key]} onChange={e=>setProfile({...profile,[f.key]:e.target.value})}/>
              </div>
            ))}
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance & Theme" delay={.05}>
          <Row icon={Moon} label="Dark Mode" desc="Switch between light and dark theme"><Toggle checked={theme==='dark'} onChange={toggleTheme}/></Row>

          {/* Accent Color */}
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-3">Accent Color</p>
            <div className="grid grid-cols-6 gap-3">
              {ACCENT_COLORS.map((c,i)=>(
                <button key={i} onClick={()=>applyAccent(i)} title={c.name}
                  className={`h-10 rounded-xl transition-all hover:scale-110 ${accentIdx===i?'ring-2 ring-white ring-offset-2 ring-offset-primary shadow-lg scale-105':''}`}
                  style={{background:`linear-gradient(135deg, ${c.primary}, ${c.accent})`}}/>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">{ACCENT_COLORS[accentIdx].name}</p>
          </div>

          {/* Font Size */}
          <div className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary"/>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">Font Size</p>
            </div>
            <div className="flex gap-3">
              {FONT_SIZES.map((f,i)=>(
                <button key={i} onClick={()=>applyFont(i)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${fontSize===i?'bg-primary text-white border-primary shadow-lg shadow-primary/30':'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Sound & Audio */}
        <Section icon={Music} title="Sound & Audio" delay={.08}>
          <Row icon={soundEnabled ? Volume2 : VolumeX} label="Interface Sounds" desc="Play a sound on clicks and actions">
            <Toggle checked={soundEnabled} onChange={v => { setSoundEnabled(v); if(v) playSound(); }}/>
          </Row>
          
          {soundEnabled && (
            <div className="pt-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">Volume</p>
                  <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} onMouseUp={playSound} onTouchEnd={playSound} className="w-full accent-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">Sound Type</p>
                  <div className="flex gap-2">
                    {['pop', 'click', 'bell'].map(t => (
                      <button key={t} onClick={() => { setSoundType(t); setTimeout(playSound, 10); }} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${soundType === t ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-slate-800 text-slate-500 hover:text-primary'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" delay={.1}>
          {[
            {key:'emailAlerts',     label:'Email Alerts',       desc:'Receive important alerts via email'},
            {key:'lowStockAlerts',  label:'Low Stock Alerts',   desc:'Get notified when items are running low'},
            {key:'orderUpdates',    label:'Order Updates',      desc:'Push notifications for new orders'},
            {key:'payrollReminders',label:'Payroll Reminders',  desc:'Monthly reminders before payroll deadline'},
          ].map(n=>(
            <Row key={n.key} icon={Bell} label={n.label} desc={n.desc}>
              <Toggle checked={notifications[n.key]} onChange={v=>setNotifications({...notifications,[n.key]:v})}/>
            </Row>
          ))}
        </Section>
      </>}

      {tab==='system' && isAdmin && <>
        {/* Security */}
        <Section icon={Shield} title="Security" delay={.05}>
          <Row icon={Lock} label="Two-Factor Authentication" desc="Add an extra layer of security"><Toggle checked={false} onChange={()=>{}}/></Row>
          <Row icon={Zap} label="Session Timeout" desc="Auto-logout after 30 minutes of inactivity"><Toggle checked={true} onChange={()=>{}}/></Row>
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-3">Change Password</p>
            <div className="space-y-3">
              {['Current Password','New Password','Confirm New Password'].map(p=>(
                <input key={p} className="form-input" type="password" placeholder={p}/>
              ))}
            </div>
          </div>
        </Section>

        {/* User Management */}
        <Section icon={UsersIcon} title="User Management" delay={.08}>
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase">Create New User</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input className="form-input text-sm" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})} />
              <input className="form-input text-sm" type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} />
              <select className="form-input text-sm" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}>
                <option value="Employee">Employee</option>
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button onClick={handleCreateUser} className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Create User Account
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-700/50">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">System Users</h3>
            <div className="space-y-2">
              {systemUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">
                      {(u.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{u.username}</p>
                      <p className="text-xs text-slate-400">{u.role}</p>
                    </div>
                  </div>
                  {u.id !== user?.id && (
                    <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* System info */}
        <Section icon={Database} title="Cafeteria System Data" delay={.1}>
          <div className="space-y-3">
            {[
              {label:'Core Framework',     value:'Cafeteria OS Enterprise'},
              {label:'Branch Network',     value:'Hargeisa, Somaliland HQ'},
              {label:'Database Engine',    value:'Secure PostgreSQL Cluster'},
              {label:'Security Protocol',  value:'JWT Auth & SSL Active'},
              {label:'Server Status',      value:'Online / Active'},
              {label:'System Version',     value:'v2.5.0-production'},
              {label:'Last Audit Sync',    value:'May 2026'}
            ].map(info=>(
              <div key={info.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                <span className="text-sm text-gray-500 dark:text-slate-400">{info.label}</span>
                <span className="text-sm font-semibold text-primary">{info.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </>}

      {/* Save + Logout */}
      <motion.div className="flex items-center gap-4 pb-6">
        <button onClick={handleSave} disabled={saving}
          className={`btn-primary flex items-center gap-2 transition-all disabled:opacity-70 ${saved ? 'bg-emerald-500 shadow-emerald-500/30' : ''}`}>
          {saving
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : saved ? <Check className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
          <span>{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
        <button onClick={logout} className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-semibold text-sm transition-all">Logout</button>
      </motion.div>
    </div>
  );
};

export default Settings;
