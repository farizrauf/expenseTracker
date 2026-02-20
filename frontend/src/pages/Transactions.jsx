import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Filter, Trash2, Edit2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Transactions = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category_id: '',
    category_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
    if (location.state?.openModal) {
      setShowModal(true);
      // Clear state after reading to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isNewCategory = formData.category_id === 'new';
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: isNewCategory ? 0 : parseInt(formData.category_id),
        category_name: isNewCategory ? formData.category_name : '',
        date: new Date(formData.date).toISOString()
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      alert('Failed to save transaction');
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      type: t.type,
      amount: String(t.amount), // Convert to string for form input
      category_id: String(t.category_id), // Convert to string for select match
      description: t.description || '',
      date: new Date(t.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      type: 'expense',
      amount: '',
      category_id: '',
      category_name: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(val || 0);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Transactions</h1>
          <p className="text-gray-500 dark:text-gray-400">View and manage all your records</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
        >
          <Plus size={20} />
          <span className="font-semibold">Add Record</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-xl border-none focus:ring-2 focus:ring-primary-500 outline-none dark:text-white dark:placeholder:text-gray-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-gray-50 dark:bg-slate-700/50 px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium dark:text-white transition-all">
            <option>All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="bg-gray-50 dark:bg-slate-700/50 p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table/List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/30 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-50 dark:border-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{t.description || 'No description'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                      {t.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && !loading && (
            <div className="py-20 text-center text-gray-400">
              No records found.
            </div>
          )}
        </div>
      </div>

      {/* Modal - Basic Implementation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300 transition-colors">
            <h2 className="text-xl font-bold mb-6 dark:text-white uppercase tracking-wider">{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense'})}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-slate-600 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Income
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (IDR)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                  <div className="space-y-2">
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                      value={formData.category_id}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData, 
                          category_id: val,
                          category_name: val === 'new' ? formData.category_name : ''
                        });
                      }}
                    >
                      <option value="" className="dark:bg-slate-800">Select</option>
                      {categories.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-800">{c.name}</option>)}
                      <option value="new" className="dark:bg-slate-800 font-bold text-primary-600">+ Create New...</option>
                    </select>
                    
                    {formData.category_id === 'new' && (
                      <input
                        type="text"
                        required
                        placeholder="Enter new category name"
                        className="w-full px-4 py-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all animate-in slide-in-from-top-2"
                        value={formData.category_name}
                        onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                  placeholder="e.g. Lunch with client"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
