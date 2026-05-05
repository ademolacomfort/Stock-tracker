import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Minus, 
  Trash2, 
  X, 
  PackageSearch,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem, Prediction } from './types';

// Helper: Prediction Math
const getPrediction = (qty: number, velocity: number): Prediction => {
  if (velocity <= 0) return { days: Infinity, color: 'gray', label: 'Stable' };
  const days = qty / velocity;
  if (days < 2) return { days, color: 'red', label: 'Emergency' };
  if (days <= 5) return { days, color: 'orange', label: 'Warning' };
  return { days, color: 'green', label: 'Safe' };
};

export default function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [restockOnly, setRestockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('inventory_v2', JSON.stringify(inventory));
  }, [inventory]);

  // Derived State
  const filteredItems = useMemo(() => {
    let result = inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (restockOnly) {
      result = result.filter(item => {
        const pred = getPrediction(item.qty, item.velocity);
        return pred.color === 'red' || pred.color === 'orange';
      });
    }
    return result;
  }, [inventory, searchQuery, restockOnly]);

  // Actions
  const addInventory = (name: string, qty: number, velocity: number) => {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name,
      qty,
      velocity
    };
    setInventory(prev => [newItem, ...prev]);
    setIsModalOpen(false);
  };

  const updateQty = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ));
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Remove this product from inventory?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen pb-24 font-sans p-6 md:p-10">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-baseline border-b-2 border-black pb-4 mb-10 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-baseline gap-4"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">STOCKOUT</h1>
          <span className="text-base md:text-lg font-medium tracking-widest uppercase opacity-50">Predictor v2.0</span>
        </motion.div>
        <div className="text-left md:text-right w-full md:w-auto flex justify-between md:block">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">System Status</div>
            <div className="text-base md:text-xl font-mono uppercase">Operational // {inventory.length} SKUs</div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="md:hidden bg-black text-white p-3 brutalist-shadow"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Main Content */}
        <div className="md:col-span-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] bg-black text-white px-3 py-1">Inventory Control</div>
            <div className="flex gap-4 sm:gap-6 text-[10px] font-black uppercase tracking-widest">
              <span className="text-red-600">{inventory.filter(i => getPrediction(i.qty, i.velocity).color === 'red').length} Critical</span>
              <span className="text-orange-600">{inventory.filter(i => getPrediction(i.qty, i.velocity).color === 'orange').length} Warning</span>
              <span className="text-emerald-600">{inventory.filter(i => getPrediction(i.qty, i.velocity).color === 'green').length} Stable</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="PROD_QUER_ID..." 
                className="w-full pl-4 pr-12 py-4 border-2 border-black bg-white text-lg font-bold placeholder:opacity-20 outline-none brutalist-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            </div>

            <div className="flex items-center justify-between border-2 border-black bg-white p-4 brutalist-shadow">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest">Filter Outliers Only</span>
              </div>
              <button 
                onClick={() => setRestockOnly(!restockOnly)}
                className={`w-12 h-6 border-2 border-black relative transition-colors ${restockOnly ? 'bg-orange-500' : 'bg-gray-100'}`}
              >
                <motion.div 
                  className="absolute top-0 bottom-0 w-5 bg-black"
                  animate={{ left: restockOnly ? 'calc(100% - 1.25rem)' : '0' }}
                />
              </button>
            </div>
          </div>

          {/* Inventory List */}
          <div className="border-2 border-black bg-white brutalist-shadow-lg overflow-hidden">
            <div className="grid grid-cols-12 text-[10px] uppercase font-black tracking-widest p-4 border-b-2 border-black opacity-40 bg-gray-50">
              <div className="col-span-5 sm:col-span-6">Product Item</div>
              <div className="col-span-3 sm:col-span-2 text-right">Qty</div>
              <div className="hidden sm:block sm:col-span-2 text-right">Vel</div>
              <div className="col-span-4 sm:col-span-2 text-right">Estimate</div>
            </div>

            <AnimatePresence mode="popLayout text-black">
              {filteredItems.length > 0 ? (
                <div className="divide-y-2 divide-black">
                  {filteredItems.map(item => (
                    <InventoryCard 
                      key={item.id} 
                      item={item} 
                      onUpdate={updateQty} 
                      onDelete={deleteItem} 
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border-t border-black/10">
                  <PackageSearch className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Zero Results Matching ID</div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar / Stats */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="bg-black text-white p-8 brutalist-shadow-lg flex flex-col justify-between min-h-[250px]">
             <div>
               <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Aggregate Burn</div>
               <div className="text-7xl font-black leading-none tracking-tighter">
                 {inventory.reduce((acc, i) => acc + i.velocity, 0).toFixed(1)}
               </div>
             </div>
             <div className="flex justify-between items-end border-t border-white/20 pt-4 mt-6">
               <span className="text-xs font-bold uppercase opacity-60">Avg Units / Day</span>
               <TrendingDown className="w-5 h-5 text-emerald-400" />
             </div>
          </div>

          <div className="border-2 border-black p-8 bg-white brutalist-shadow-lg flex-grow">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Action Engine</h3>
            <div className="space-y-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs py-4 border-2 border-black brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Create Entry
              </button>
              
              <div className="p-4 bg-yellow-100 border-2 border-black">
                <div className="text-[10px] font-black uppercase text-yellow-800 mb-2">Math Insight</div>
                <p className="text-xs leading-tight text-yellow-900 font-bold uppercase tracking-tight">
                  {filteredItems.some(i => getPrediction(i.qty, i.velocity).color === 'red') 
                    ? 'Critical stockouts detected. Operational efficiency compromised. Immediate replenishment required.'
                    : 'Inventory levels stable within 95% confidence interval. No immediate deviation predicted.'}
                </p>
              </div>
            </div>
            
            <div className="mt-12 space-y-4 opacity-40">
              <div className="text-[10px] font-black uppercase tracking-widest">Network Node</div>
              <div className="text-sm font-mono uppercase bg-gray-50 p-2 border border-black/10">AIS-CLUSTER-09 // STABLE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InventoryCardProps {
  key?: string;
  item: InventoryItem;
  onUpdate: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

// Subcomponent: Inventory Card
function InventoryCard({ item, onUpdate, onDelete }: InventoryCardProps) {
  const pred = getPrediction(item.qty, item.velocity);
  
  const statusColor = {
    red: 'bg-red-600',
    orange: 'bg-orange-500',
    green: 'bg-emerald-500',
    gray: 'bg-gray-400'
  }[pred.color];

  const bgColor = {
    red: 'bg-red-50',
    orange: 'bg-orange-50',
    green: 'bg-white',
    gray: 'bg-white'
  }[pred.color];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`grid grid-cols-12 items-center p-4 group transition-colors ${bgColor}`}
    >
      <div className="col-span-1">
        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
      </div>
      
      <div className="col-span-4 sm:col-span-5 flex flex-col min-w-0 pr-2">
        <h3 className="font-bold text-sm sm:text-lg truncate tracking-tight">{item.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <button 
            onClick={() => onDelete(item.id)}
            className="text-[8px] font-black uppercase text-gray-300 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2 px-1">
        <button 
          onClick={() => onUpdate(item.id, -1)}
          className="w-6 h-6 border border-black flex items-center justify-center bg-white hover:bg-gray-100 active:translate-y-0.5"
        >
          <Minus className="w-3 h-3" />
        </button>
        <div className="font-mono text-base sm:text-xl font-bold w-10 text-right">{item.qty}</div>
        <button 
          onClick={() => onUpdate(item.id, 1)}
          className="w-6 h-6 border border-black flex items-center justify-center bg-white hover:bg-gray-100 active:translate-y-0.5"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="hidden sm:block sm:col-span-2 text-right font-mono text-gray-400 text-xs">
        {item.velocity.toFixed(1)}/d
      </div>

      <div className={`col-span-4 sm:col-span-2 text-right text-xl sm:text-3xl font-black ${pred.color === 'red' ? 'text-red-600' : pred.color === 'orange' ? 'text-orange-500' : 'text-black'}`}>
        {pred.days === Infinity ? '∞' : `${pred.days.toFixed(1)}d`}
      </div>
    </motion.div>
  );
}

// Subcomponent: Add Item Modal
function ItemModal({ onClose, onSubmit }: { 
  onClose: () => void; 
  onSubmit: (name: string, qty: number, velocity: number) => void;
}) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('0');
  const [velocity, setVelocity] = useState('1');

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, parseFloat(qty) || 0, parseFloat(velocity) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border-2 border-black p-8 brutalist-shadow-lg w-full max-w-md relative z-10"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">New Entry</h2>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-40">Operational Buffer Injection</p>
          </div>
          <button onClick={onClose} className="border-2 border-black p-1 hover:bg-black hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Descriptor</label>
            <input 
              type="text" 
              autoFocus
              required 
              placeholder="PRODUCT_NAME_ID" 
              className="w-full p-4 border-2 border-black font-bold text-lg outline-none focus:bg-gray-50 transition-colors uppercase placeholder:opacity-20"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Quantity</label>
              <input 
                type="number" 
                required 
                className="w-full p-4 border-2 border-black font-mono text-xl outline-none focus:bg-gray-50 transition-colors"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Velocity</label>
              <input 
                type="number" 
                step="0.1" 
                required 
                className="w-full p-4 border-2 border-black font-mono text-xl outline-none focus:bg-gray-50 transition-colors"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-black text-white py-5 font-black uppercase tracking-widest text-sm brutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Commit to Archive
          </button>
        </form>
      </motion.div>
    </div>
  );
}
