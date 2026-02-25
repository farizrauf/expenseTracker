import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, Search, Filter, Trash2, Edit2, ArrowUpRight, ArrowDownLeft, X, Loader2, Download, Printer } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const Transactions = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Utility for local date string (YYYY-MM-DD)
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    type: 'expense',
    date: getLocalDateString(),
    description: ''
  });
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setFormData({
      amount: transaction.amount,
      category_id: transaction.category_id,
      type: transaction.type,
      date: (transaction.date || '').split('T')[0],
      description: transaction.description || ''
    });
    setIsNewCategory(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete_transaction'))) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(tr => tr.id !== id));
    } catch (err) {
      alert(t('fail_delete'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let categoryId = formData.category_id;
      if (isNewCategory && newCategoryName) {
        const catRes = await api.post('/categories', { name: newCategoryName });
        categoryId = catRes.data.id;
        setCategories([...categories, catRes.data]);
      }

      // Ensure numeric and safe values
      const safeAmount = parseFloat(formData.amount) || 0;
      const safeCategoryId = parseInt(categoryId) || 0;
      // Send date as a proper ISO string for Gin/GORM compatibility
      const safeDate = new Date(formData.date).toISOString();

      const payload = { 
        ...formData, 
        amount: safeAmount, 
        category_id: safeCategoryId,
        date: safeDate
      };
      
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(t('fail_save'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      category_id: '',
      type: 'expense',
      date: getLocalDateString(),
      description: ''
    });
    setIsNewCategory(false);
    setNewCategoryName('');
  };

  const filteredTransactions = (transactions || []).filter(tr => {
    const matchesSearch = (tr.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (tr.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || tr.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    // CSV Headers
    const headers = [
      t('transaction_col'),
      t('category_col'),
      t('date_col'),
      t('amount_col'),
      'Type'
    ];

    // CSV Data rows
    const rows = filteredTransactions.map(tr => [
      `"${(tr.description || t('no_description')).replace(/"/g, '""')}"`,
      `"${t(tr.category_name)}"`,
      new Date(tr.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US'),
      tr.amount,
      tr.type
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>
        {`
          @media print {
            nav, .no-print, button, select, input, .mobile-nav {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .space-y-6, .space-y-8 {
              margin: 0 !important;
              padding: 0 !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            th, td {
              border: 1px solid #e2e8f0 !important;
              padding: 12px !important;
            }
            .fixed, .absolute {
              position: static !important;
            }
          }
        `}
      </style>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">
            {t('transactions_header')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
            {t('manage_records')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm no-print">
            <button 
              onClick={handleExportCSV}
              className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              title="Export Excel (CSV)"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <div className="w-[1px] h-4 bg-gray-100 dark:bg-slate-700 mx-1" />
            <button 
              onClick={handleExportPDF}
              className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              title="Export PDF"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>

          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-center space-x-2 shadow-xl shadow-primary-200 dark:shadow-none transition-all active:scale-95 group font-bold no-print"
          >
            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
            <span className="tracking-wide">{t('add_record')}</span>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder={t('search_transactions')}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 shadow-sm dark:text-white outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
          <select 
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 shadow-sm dark:text-white outline-none appearance-none cursor-pointer font-medium"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t('all_categories')}</option>
            {(categories || []).map(c => <option key={c.id} value={c.id} className="dark:bg-slate-800">{t(c.name)}</option>)}
          </select>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-100 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-700/50">
                <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('transaction_col')}</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('category_col')}</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('date_col')}</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('amount_col')}</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">{t('actions_col')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {filteredTransactions.map((tr) => (
                <tr key={tr.id} className="group hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        tr.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tr.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white capitalize group-hover:text-primary-600 transition-colors">
                        {tr.description || t('no_description')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:bg-primary-100/50 dark:group-hover:bg-primary-900/30 transition-colors">
                      {t(tr.category_name)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-400 dark:text-gray-500">
                    {tr.date ? new Date(tr.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`font-black tracking-tight ${tr.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tr.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(tr.amount || 0)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <button onClick={() => handleEdit(tr)} className="p-2.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(tr.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && !loading && (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto text-gray-200 dark:text-slate-700 mb-4" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('no_records_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-slate-700">
            <div className="p-8 lg:p-10">
              <header className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-[0.2em]">{editingId ? t('edit_transaction') : t('new_transaction')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X size={24} /></button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex bg-gray-50 dark:bg-slate-700/50 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-inner">
                  <button
                    type="button"
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-md' : 'text-gray-400 dark:text-gray-500'}`}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                  >
                    {t('expense')}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-gray-400 dark:text-gray-500'}`}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                  >
                    {t('income')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('amount_label')}</label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-black text-lg"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('category_label')}</label>
                    <select
                      required={!isNewCategory}
                      className={`w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white appearance-none cursor-pointer font-bold ${isNewCategory ? 'hidden' : 'block'}`}
                      value={formData.category_id}
                      onChange={(e) => {
                        if (e.target.value === 'new') setIsNewCategory(true);
                        else setFormData({ ...formData, category_id: e.target.value });
                      }}
                    >
                      <option value="" className="dark:bg-slate-800">{t('select_category')}</option>
                      {(categories || []).map(c => <option key={c.id} value={c.id} className="dark:bg-slate-800">{t(c.name)}</option>)}
                      <option value="new" className="dark:bg-slate-800 font-bold text-primary-600">{t('create_new_category')}</option>
                    </select>
                    {isNewCategory && (
                      <div className="relative">
                        <input
                          autoFocus
                          type="text"
                          required
                          placeholder={t('new_category_placeholder')}
                          className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 border border-primary-500 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <button type="button" onClick={() => { setIsNewCategory(false); setNewCategoryName(''); }} className="absolute right-4 top-4 text-gray-400"><X size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('date_label')}</label>
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('description_label')}</label>
                  <textarea
                    rows="3"
                    placeholder={t('description_placeholder')}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-medium resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all active:scale-95"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>{t('save_transaction')}</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
