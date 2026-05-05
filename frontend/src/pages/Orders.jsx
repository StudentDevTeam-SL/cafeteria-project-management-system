import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CheckCircle, XCircle, Loader, ShoppingBag, Eye, X, Plus, Minus, CreditCard, Trash2, BarChart2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import PaymentModal from '../components/PaymentModal';
import { FOOD_PHOTOS } from '../data/menuCatalog';
import api from '../api/axios';

// MOCK_ORDERS removed. Data will be fetched from API.

const STATUS_CFG = {
  completed:  { label:'Completed',  icon:CheckCircle, cls:'badge-green',  dot:'bg-emerald-500'            },
  processing: { label:'Processing', icon:Loader,      cls:'badge-blue',   dot:'bg-blue-500 animate-pulse' },
  pending:    { label:'Pending',    icon:Clock,       cls:'badge-yellow', dot:'bg-amber-500'              },
  cancelled:  { label:'Cancelled',  icon:XCircle,     cls:'badge-red',    dot:'bg-red-500'                },
};
const PAY_CFG = { Cash:'badge-green', Mastercard:'badge-purple', PayPal:'badge-blue', Zaad:'badge-yellow' };

/* ── Catalog Item Picker ── */
const CatalogPicker = ({ cart, setCart, menuItems }) => {
  const [cat, setCat] = useState('All');
  const cats = ['All','Main Course','Beverages','Salads','Snacks','Desserts'];
  const items = menuItems.filter(i => i.is_active && (cat==='All'||i.category===cat||i.category_name===cat));
  const qty = id => cart.find(c=>c.id===id)?.qty || 0;
  const add = item => setCart(p => { const ex=p.find(c=>c.id===item.id); return ex?p.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c):[...p,{...item,qty:1}]; });
  const dec = id  => setCart(p => { const ex=p.find(c=>c.id===id); if(!ex||ex.qty<=1)return p.filter(c=>c.id!==id); return p.map(c=>c.id===id?{...c,qty:c.qty-1}:c); });
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        {cats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${cat===c?'bg-primary text-white':'glass-card text-slate-400 hover:text-primary'}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {items.map(item=>(
          <div key={item.id} className="glass-card p-2 flex items-center gap-2">
            <img src={item.customPhoto||item.image||item.photoUrl||FOOD_PHOTOS[item.id]} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" onError={e=>{e.target.src=FOOD_PHOTOS[1];}} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{item.name}</p>
              <p className="text-xs text-primary font-bold">${Number(item.price).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1">
              {qty(item.id)>0 && <>
                <button onClick={()=>dec(item.id)} className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20"><Minus className="w-3 h-3"/></button>
                <span className="text-xs font-bold w-4 text-center">{qty(item.id)}</span>
              </>}
              <button onClick={()=>add(item)} className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"><Plus className="w-3 h-3"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── New Order Modal ── */
const NewOrderModal = ({ onClose, onPlaced, menuItems }) => {
  const [employee, setEmployee] = useState('');
  const [cart, setCart]         = useState([]);
  const [step, setStep]         = useState(1);
  const [error, setError]       = useState('');
  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);

  const handleSuccess = async method => {
    try {
      const payload = {
        employee_name: employee.trim(),
        payment_method: method.toLowerCase(),
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.qty,
          unit_price: c.price
        })),
        notes: ''
      };
      const res = await api.post('orders/', payload);
      onPlaced(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order');
      setStep(1);
    }
  };

  if (step===2) return <PaymentModal amount={total} onClose={()=>setStep(1)} onSuccess={handleSuccess} />;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}}
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200/60 dark:border-slate-700/50 max-h-[90vh] overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-accent"/>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black gradient-text">New Order</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5"/></button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Customer / Employee Name</label>
            <input className="form-input" placeholder="e.g. Ahmed Hassan" value={employee} onChange={e=>setEmployee(e.target.value)} />
          </div>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Items from Menu</label>
          <CatalogPicker cart={cart} setCart={setCart} menuItems={menuItems} />

          {cart.length>0 && (
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-slate-400 mb-2">ORDER SUMMARY</p>
              {cart.map(c=>(
                <div key={c.id} className="flex justify-between items-center text-sm py-0.5">
                  <span className="text-slate-600 dark:text-slate-300">{c.qty}× {c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">${(c.qty*c.price).toFixed(2)}</span>
                    <button onClick={()=>setCart(p=>p.filter(i=>i.id!==c.id))} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              ))}
              <div className="border-t border-primary/20 mt-2 pt-2 flex justify-between font-black">
                <span>Total</span><span className="text-primary text-xl">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:.98}}
              onClick={()=>{ if(!employee.trim()){setError('Please enter customer name');return;} if(cart.length===0){setError('Please select at least one item');return;} setError('');setStep(2); }}
              className="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4"/> Proceed to Payment
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Order Detail Modal ── */
const OrderModal = ({ order, onClose, onStatusChange, isAdmin }) => {
  const cfg = STATUS_CFG[order.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.9}}
        className="bg-light-card dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
        <div className={`h-1 ${order.status==='completed'?'bg-emerald-500':order.status==='processing'?'bg-blue-500':order.status==='cancelled'?'bg-red-500':'bg-amber-500'}`}/>
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between">
          <div><h2 className="text-xl font-black">{order.order_number || order.id}</h2><p className="text-sm text-slate-400">{new Date(order.created_at).toLocaleString()}</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-400"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">{(order.employee_name || 'G').charAt(0)}</div>
              <div>
                <p className="font-semibold text-sm">{order.employee_name || 'Guest'}</p>
                <span className={`badge ${PAY_CFG[order.payment_method]||'badge-blue'} text-xs`}><CreditCard className="w-3 h-3"/> {order.payment_method}</span>
              </div>
            </div>
            <span className={`badge ${cfg.cls} gap-1.5`}><cfg.icon className="w-3.5 h-3.5"/> {cfg.label}</span>
          </div>
          <div className="glass-card p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</h3>
            {order.items.map((item,i)=>(
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{item.quantity || item.qty}</span><span>{item.menu_item_name || item.item_name || item.name}</span></div>
                <span className="font-semibold">${((item.quantity || item.qty) * (item.unit_price || item.price)).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black">
              <span>Total</span><span className="text-primary text-lg">${Number(order.total_amount || order.total || 0).toFixed(2)}</span>
            </div>
          </div>
          {(order.status==='pending'||order.status==='processing') && (
            <div className="flex gap-3">
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}} onClick={()=>{onStatusChange(order,'completed');onClose();}} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">✓ Mark Completed</motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}} onClick={()=>{onStatusChange(order,'cancelled');onClose();}} className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors">✕ Cancel Order</motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ── Sales Report Panel ── */
const SalesReport = ({ orders }) => {
  const completed = orders.filter(o=>o.status!=='cancelled');
  const revenue   = completed.reduce((s,o)=>s+Number(o.total_amount || o.total || 0),0);
  const byMethod  = ['cash','paypal','mastercard','zaad'].map(m=>({ method:m, total:completed.filter(o=>o.payment_method?.toLowerCase()===m).reduce((s,o)=>s+Number(o.total_amount || o.total || 0),0), count:completed.filter(o=>o.payment_method?.toLowerCase()===m).length }));
  const maxRev    = Math.max(...byMethod.map(b=>b.total),1);

  // Top items
  const itemMap = {};
  completed.forEach(o=>(o.items||[]).forEach(i=>{ 
    const n = i.menu_item_name || i.item_name || i.name || 'Unknown Item';
    itemMap[n]=(itemMap[n]||0)+(i.quantity || i.qty); 
  }));
  const topItems = Object.entries(itemMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const methodColors = { cash:'bg-emerald-500', paypal:'bg-blue-500', mastercard:'bg-violet-500', zaad:'bg-amber-500' };

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><BarChart2 className="w-5 h-5 text-white"/></div>
        <div><h2 className="text-xl font-black">Sales Report</h2><p className="text-xs text-slate-400">Today's revenue breakdown</p></div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-black text-primary">${revenue.toFixed(2)}</p>
          <p className="text-xs text-slate-400">Total Revenue</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by payment method */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">By Payment Method</h3>
          <div className="space-y-3">
            {byMethod.map(b=>(
              <div key={b.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{b.method}</span>
                  <span className="text-slate-400">{b.count} orders · <span className="text-primary font-bold">${b.total.toFixed(2)}</span></span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${(b.total/maxRev)*100}%`}} transition={{duration:.8,ease:'easeOut'}}
                    className={`h-full rounded-full ${methodColors[b.method]}`}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top items */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Top Selling Items</h3>
          <div className="space-y-2">
            {topItems.map(([name,qty],i)=>(
              <div key={name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${i===0?'bg-amber-500':i===1?'bg-slate-400':i===2?'bg-amber-700':'bg-slate-500'}`}>{i+1}</span>
                <span className="flex-1 text-sm font-medium truncate">{name}</span>
                <span className="badge badge-blue text-xs">{qty} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Orders Page ── */
const Orders = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin  = user?.role === 'Admin';

  const [orders, setOrders]       = useState([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('all');
  const [selected, setSelected]   = useState(null);
  const [newOpen, setNewOpen]     = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('orders/');
      setOrders(res.data.results || res.data);
    } catch (err) { console.error('Failed to fetch orders:', err); }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get('menu/');
      setMenuItems(res.data.results || res.data);
    } catch (err) { console.error('Failed to fetch menu items:', err); }
  };

  const filtered = orders.filter(o=>{
    const ms = statusFilter==='all'||o.status===statusFilter;
    const q = search.toLowerCase();
    const mq = (o.order_number||'').toLowerCase().includes(q) || (o.employee_name||'').toLowerCase().includes(q);
    return ms&&mq;
  });

  const handleStatusChange = async (order, s) => {
    try {
      await api.patch(`orders/${order.id}/status/`, { status: s });
      setOrders(p=>p.map(o=>o.id===order.id?{...o,status:s}:o));
      if (s === 'cancelled') {
        showToast(`Cancelled order ${order.order_number || order.id}`, { type: 'warning', duration: 3000 });
      }
    } catch (err) { console.error('Failed to change status:', err); }
  };
  const handleDelete       = async order => {
    try {
      await api.delete(`orders/${order.id}/`);
      setOrders(p=>p.filter(o=>o.id!==order.id));
      showToast(`Deleted order ${order.order_number || order.id}`, { type: 'warning', duration: 3000 });
    } catch (err) { console.error('Failed to delete order:', err); }
  };
  const handlePlaced       = order => setOrders(p=>[order,...p]);

  const stats = {
    total:    orders.length,
    completed:orders.filter(o=>o.status==='completed').length,
    processing:orders.filter(o=>o.status==='processing').length,
    revenue:  orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total_amount||o.total||0),0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black gradient-text">Order Management</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Track and manage all cafeteria orders in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div animate={{opacity:[.6,1,.6]}} transition={{duration:2,repeat:Infinity}} className="flex items-center gap-2 px-4 py-2 glass dark:glass-dark rounded-xl">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"/><span className="text-sm font-medium text-accent">Live</span>
          </motion.div>
          <motion.button whileHover={{scale:1.05,y:-2}} whileTap={{scale:.97}} onClick={()=>setNewOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4"/> New Order
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Total Orders',    value:stats.total,                    color:'text-primary',     bg:'bg-primary/10',     icon:ShoppingBag},
          {label:'Completed',       value:stats.completed,                color:'text-emerald-500', bg:'bg-emerald-500/10', icon:CheckCircle},
          {label:'Processing',      value:stats.processing,               color:'text-blue-500',    bg:'bg-blue-500/10',    icon:Loader     },
          {label:"Today's Revenue", value:`$${stats.revenue.toFixed(0)}`, color:'text-violet-500',  bg:'bg-violet-500/10',  icon:BarChart2  },
        ].map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}} whileHover={{y:-4,scale:1.02}} className="glass-card p-4 cursor-default">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4 h-4 ${s.color}`}/></div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input className="form-input pl-9 text-sm" placeholder="Search by ID or employee…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {['all','pending','processing','completed','cancelled'].map(f=>(
            <motion.button key={f} whileHover={{scale:1.05}} whileTap={{scale:.97}} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${statusFilter===f?'bg-primary text-white shadow-lg shadow-primary/30':'glass-card text-slate-500 hover:text-primary'}`}>
              {f==='all'?'All Orders':f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Employee</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((order,idx)=>{
                  const cfg=STATUS_CFG[order.status];
                  return (
                    <motion.tr key={order.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:10}} transition={{delay:idx*.04}}>
                      <td className="font-mono text-xs font-bold text-primary">{order.order_number || order.id}</td>
                      <td><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-primary">{(order.employee_name || 'G').charAt(0)}</div><span className="text-sm font-medium">{order.employee_name || 'Guest'}</span></div></td>
                      <td className="text-xs text-slate-400">{order.items?.length || 0} item{order.items?.length>1?'s':''}</td>
                      <td className="font-bold text-emerald-500">${Number(order.total_amount || order.total || 0).toFixed(2)}</td>
                      <td><span className={`badge ${PAY_CFG[order.payment_method]||'badge-blue'} text-xs capitalize`}>{order.payment_method}</span></td>
                      <td><span className={`badge ${cfg.cls} gap-1.5`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{cfg.label}</span></td>
                      <td className="text-xs text-slate-400">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <motion.button whileHover={{scale:1.15}} whileTap={{scale:.9}} onClick={()=>setSelected(order)} className="p-2 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors" title="View details"><Eye className="w-4 h-4"/></motion.button>
                          <motion.button whileHover={{scale:1.15}} whileTap={{scale:.9}} onClick={()=>setOrderToDelete(order)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Delete order"><Trash2 className="w-4 h-4"/></motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length===0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30"/><p className="text-lg font-medium">No orders found</p>
          </motion.div>
        )}
      </motion.div>

      {/* Sales Report */}
      <SalesReport orders={orders} />

      <AnimatePresence>
        {selected  && <OrderModal order={selected} onClose={()=>setSelected(null)} onStatusChange={handleStatusChange} isAdmin={isAdmin}/>}
        {newOpen   && <NewOrderModal onClose={()=>setNewOpen(false)} onPlaced={handlePlaced} menuItems={menuItems} />}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!orderToDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order ${orderToDelete?.id}? This action can be undone for 7 seconds.`}
        onConfirm={() => { handleDelete(orderToDelete); setOrderToDelete(null); }}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
};

export default Orders;
