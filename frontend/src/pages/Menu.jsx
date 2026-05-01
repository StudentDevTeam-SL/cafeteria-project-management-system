import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight, UtensilsCrossed, Star, Image as ImageIcon, Check, Clock, ShoppingCart, CreditCard, Minus, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { FOOD_PHOTOS, CATEGORIES, CAT_EMOJI, INIT_MENU_ITEMS } from '../data/menuCatalog';
import { useSoundContext } from '../context/SoundContext';

/* ── Item Card — role-aware ── */
const ItemCard = ({ item, onToggle, onEdit, onDelete, onApprove, onReject, onAddCart, onDecCart, cartQty = 0, isAdmin }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x:0, y:0, gx:50, gy:50 });
  const onMove = e => { const r=ref.current?.getBoundingClientRect(); if(!r)return; const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height; setTilt({x:(y-.5)*-12,y:(x-.5)*12,gx:x*100,gy:y*100}); };
  const onLeave = () => setTilt({x:0,y:0,gx:50,gy:50});

  const isPending = item.status === 'pending';

  return (
    <motion.div layout ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.85}}
      style={{ transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition:'transform 0.12s ease-out' }}
      className={`glass-card overflow-hidden group cursor-default relative ${isPending ? 'ring-2 ring-amber-400/50' : ''}`}>
      {/* Shine */}
      <div className="absolute inset-0 z-10 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{background:`radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.12) 0%, transparent 60%)`}} />

      {/* Pending badge */}
      {isPending && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
          <Clock className="w-3 h-3" /> Pending Approval
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={item.customPhoto || item.photoUrl || FOOD_PHOTOS[item.id] || FOOD_PHOTOS[1]} alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={e=>{e.target.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=280&fit=crop';}} />
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-white text-xs font-bold">{item.rating}</span>
        </div>
        {/* Toggle */}
        <button onClick={()=>onToggle(item.id)} className="absolute top-3 right-3 z-20">
          {item.is_active ? <ToggleRight className="w-8 h-8 text-accent drop-shadow-lg" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
        </button>
        {!item.is_active && !isPending && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <span className="badge badge-red text-sm">Unavailable</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="badge badge-blue text-xs bg-black/60 backdrop-blur-sm border-white/20 text-white">
            {CAT_EMOJI[item.category]} {item.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-bold text-sm leading-tight pr-2 group-hover:text-primary transition-colors">{item.name}</h3>
          <span className="text-primary font-black text-lg whitespace-nowrap">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 line-clamp-2 mb-3">{item.desc}</p>

        {/* Admin controls & POS Add */}
        {!isPending && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/50 min-h-[52px]">
            {cartQty > 0 ? (
              <div className="flex items-center gap-3 bg-primary/10 rounded-xl px-2 py-1.5">
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:.9}} onClick={()=>onDecCart(item.id)}
                  className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-primary flex items-center justify-center shadow-sm">
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <AnimatePresence mode="popLayout">
                  <motion.span key={cartQty} initial={{y:-10,opacity:0}} animate={{y:0,opacity:1}} exit={{y:10,opacity:0}} className="text-primary font-black w-3 text-center text-sm">
                    {cartQty}
                  </motion.span>
                </AnimatePresence>
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:.9}} onClick={()=>onAddCart(item)}
                  className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : (
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} onClick={()=>onAddCart(item)} disabled={!item.is_active}
                className="py-1.5 px-4 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-colors disabled:opacity-50">
                <Plus className="w-3.5 h-3.5" /> Add
              </motion.button>
            )}
            {isAdmin && (
              <div className="flex gap-1 ml-auto">
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:.9}} onClick={()=>onEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></motion.button>
                <motion.button whileHover={{scale:1.1}} whileTap={{scale:.9}} onClick={()=>onDelete(item)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></motion.button>
              </div>
            )}
          </div>
        )}

        {/* Admin approve/reject pending items */}
        {isPending && (
          <div className="flex gap-2 pt-3 border-t border-amber-400/30">
            <button onClick={()=>onApprove(item.id)} className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-500/20 transition-colors">
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button onClick={()=>onReject(item.id)} className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors">
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        )}


      </div>
    </motion.div>
  );
};

/* ── Item Modal ── */
const ItemModal = ({ item, onClose, onSave, isAdmin }) => {
  const fileRef = useRef(null);
  const [form, setForm] = useState(item || { name:'', price:'', category:'Main Course', desc:'', is_active:true, rating:4.5, photoUrl:'', customPhoto:'' });
  const preview = form.customPhoto || form.photoUrl || '';
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleFile = e => { const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onloadend=()=>set('customPhoto',r.result); r.readAsDataURL(f); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}}
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200/60 dark:border-slate-700/50 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-black gradient-text mb-4">
          {item ? 'Edit Item' : 'Add Menu Item'}
        </h2>

        {/* Photo */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Item Photo</label>
          {preview ? (
            <div className="relative h-36 rounded-xl overflow-hidden mb-2 group">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={()=>fileRef.current?.click()} className="px-3 py-1.5 bg-white/90 text-slate-800 text-xs font-bold rounded-lg">Change</button>
                <button onClick={()=>{set('customPhoto','');set('photoUrl','');}} className="px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-lg">Remove</button>
              </div>
            </div>
          ) : (
            <motion.div whileHover={{scale:1.01}} onClick={()=>fileRef.current?.click()}
              className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer mb-2">
              <ImageIcon className="w-7 h-7 text-slate-400 mb-1" />
              <p className="text-sm font-medium text-slate-400">Click to upload photo</p>
            </motion.div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <input className="form-input mt-2 text-xs" placeholder="or paste image URL https://..." value={form.photoUrl}
            onChange={e=>{set('photoUrl',e.target.value);set('customPhoto','');}} />
        </div>

        <div className="space-y-3">
          <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Item Name</label>
            <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Grilled Chicken" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price ($)</label>
              <input className="form-input" type="number" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)} /></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
              <select className="form-input" value={form.category} onChange={e=>set('category',e.target.value)}>{CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
            <textarea className="form-input resize-none" rows={2} value={form.desc} onChange={e=>set('desc',e.target.value)} /></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-sm font-medium">Available for ordering</span>
              <button onClick={()=>set('is_active',!form.is_active)}>
                {form.is_active ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={()=>onSave({...form, price:Number(form.price)})} className="flex-1 btn-primary py-3 text-sm">
            {item ? 'Update Item' : 'Add to Menu'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import PaymentModal from '../components/PaymentModal';

/* ── Cart / Checkout Modal ── */
const CheckoutModal = ({ cart, setCart, onClose }) => {
  const { playSound } = useSoundContext();
  const [step, setStep] = useState(1);
  const [comment, setComment] = useState('');
  const total = cart.reduce((s,c)=>s+c.price*c.qty, 0);

  if (step === 2) return (
    <PaymentModal amount={total} onClose={()=>setStep(1)} onSuccess={()=>{
      setCart([]);
      onClose();
      alert(`Order Placed Successfully! ${comment ? `\nNotes: ${comment}` : ''}`);
    }} />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}}
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200/60 dark:border-slate-700/50 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-black gradient-text mb-4">Current Order</h2>
        
        <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-2">
          {cart.map(c => (
            <div key={c.id} className="flex items-center justify-between glass-card p-3">
              <div>
                <p className="text-sm font-bold">{c.name}</p>
                <p className="text-xs text-primary">${c.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{playSound(); setCart(p=>{const ex=p.find(i=>i.id===c.id); if(ex.qty<=1)return p.filter(i=>i.id!==c.id); return p.map(i=>i.id===c.id?{...i,qty:i.qty-1}:i)})}} className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20"><Minus className="w-3.5 h-3.5" /></button>
                <span className="w-4 text-center font-bold text-sm">{c.qty}</span>
                <button onClick={()=>{playSound(); setCart(p=>p.map(i=>i.id===c.id?{...i,qty:i.qty+1}:i))}} className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Comments */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Order Comments / Notes</label>
          <textarea className="form-input resize-none text-sm" rows={2} placeholder="e.g. No onions, extra spicy..." value={comment} onChange={e=>setComment(e.target.value)} />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 mb-6">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-sm">Total</span>
          <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
        </div>

        <button onClick={()=>setStep(2)} className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg">
          <CreditCard className="w-5 h-5" /> Proceed to Payment
        </button>
      </motion.div>
    </div>
  );
};

/* ── Main Menu Page ── */
const Menu = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const { playSound } = useSoundContext();
  const { showToast } = useToast();

  const [items, setItems]         = useState(INIT_MENU_ITEMS);
  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // POS Cart State
  const [cart, setCart]                 = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const addToCart = item => {
    playSound();
    setCart(p => {
      const ex = p.find(c => c.id === item.id);
      return ex ? p.map(c => c.id === item.id ? {...c, qty: c.qty+1} : c) : [...p, {...item, qty:1}];
    });
  };

  const decCart = id => {
    playSound();
    setCart(p => {
      const ex = p.find(c => c.id === id);
      if (!ex || ex.qty <= 1) return p.filter(c => c.id !== id);
      return p.map(c => c.id === id ? {...c, qty: c.qty-1} : c);
    });
  };

  const allItems  = items.filter(i => { const mc=activeCat==='All'||i.category===activeCat; const ms=i.name.toLowerCase().includes(search.toLowerCase()); return mc&&ms; });
  const pending   = allItems.filter(i => i.status==='pending');
  const active    = allItems.filter(i => i.status!=='pending');

  const toggle  = id => setItems(p=>p.map(i=>i.id===id?{...i,is_active:!i.is_active}:i));
  const remove  = item => {
    setItems(p=>p.filter(i=>i.id!==item.id));
    showToast(`Deleted ${item.name} from menu`, {
      type: 'warning',
      onUndo: () => setItems(p => [...p, item]),
      duration: 7000
    });
  };
  const approve = id => setItems(p=>p.map(i=>i.id===id?{...i,status:'active',is_active:true}:i));
  const reject  = id => setItems(p=>p.filter(i=>i.id!==id));

  const save = form => {
    if (editItem) {
      setItems(p=>p.map(i=>i.id===editItem.id?{...i,...form}:i));
    } else {
      setItems(p=>[...p,{...form,id:Date.now(),rating:4.5, status: 'active'}]);
    }
    setModalOpen(false); setEditItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Menu Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {items.filter(i=>i.status!=='pending').length} items · {items.filter(i=>i.is_active&&i.status!=='pending').length} available
          </p>
        </div>
        <motion.button whileHover={{scale:1.05,y:-2}} whileTap={{scale:.97}}
          onClick={()=>{setEditItem(null);setModalOpen(true);}}
          className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-5 h-5" /><span>Add Item</span>
        </motion.button>
      </motion.div>

      {/* Video Banner */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="relative rounded-3xl overflow-hidden h-44 shadow-2xl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-105">
          <source src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-dark/50 to-transparent" />
        <div className="relative z-10 flex items-center h-full px-8">
          <div>
            <p className="text-white/60 text-sm mb-1">Cafeteria Menu</p>
            <h2 className="text-white text-3xl font-black">Fresh & Delicious 🍽️</h2>
          </div>
        </div>
      </motion.div>

      {/* Pending Approval Queue */}
      {pending.length > 0 && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-card p-4 border-l-4 border-amber-400">
          <h3 className="text-sm font-bold text-amber-500 mb-3">⏳ Pending Approval ({pending.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pending.map(item=>(
              <ItemCard key={item.id} item={item} isAdmin={isAdmin} onToggle={toggle} onEdit={i=>{setEditItem(i);setModalOpen(true);}} onDelete={i=>setItemToDelete(i)} onApprove={approve} onReject={reject} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat=>(
          <motion.button key={cat} whileHover={{scale:1.05}} whileTap={{scale:.97}} onClick={()=>setActiveCat(cat)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${activeCat===cat?'bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/30':'glass-card text-gray-500 dark:text-slate-400 hover:text-primary'}`}>
            {cat==='All'?'🍴 All':`${CAT_EMOJI[cat]} ${cat}`}
          </motion.button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="form-input pl-9 text-sm" placeholder="Search menu items…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {active.map(item=>(
            <ItemCard key={item.id} item={item} onToggle={toggle} isAdmin={isAdmin}
              onEdit={i=>{setEditItem(i);setModalOpen(true);}} onDelete={i=>setItemToDelete(i)} onApprove={approve} onReject={reject} 
              onAddCart={addToCart} onDecCart={decCart} cartQty={cart.find(c=>c.id===item.id)?.qty || 0} />
          ))}
        </AnimatePresence>
      </motion.div>

      {active.length===0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-20 text-gray-400">
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No items found</p>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && <ItemModal item={editItem} onClose={()=>{setModalOpen(false);setEditItem(null);}} onSave={save} />}
        {checkoutOpen && <CheckoutModal cart={cart} setCart={setCart} onClose={()=>setCheckoutOpen(false)} />}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action can be undone for 7 seconds.`}
        onConfirm={() => { remove(itemToDelete); setItemToDelete(null); }}
        onCancel={() => setItemToDelete(null)}
      />

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{y:100, opacity:0}} animate={{y:0, opacity:1}} exit={{y:100, opacity:0}}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 shadow-2xl rounded-full p-2 pr-6 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-slate-900 text-white text-xs font-black flex items-center justify-center">
                {cart.reduce((s,c)=>s+c.qty,0)}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</p>
              <p className="text-xl font-black text-white">${cart.reduce((s,c)=>s+c.price*c.qty,0).toFixed(2)}</p>
            </div>
            <button onClick={()=>setCheckoutOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-2.5 px-6 rounded-full transition-colors">
              Pay Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
