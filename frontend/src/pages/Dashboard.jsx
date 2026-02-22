import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Wallet, 
  Calendar, Loader2, PieChart as PieChartIcon, Plus, PlusCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';
import api from '../services/api';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const months = [
    { v: 1, n: t('jan') }, { v: 2, n: t('feb') }, { v: 3, n: t('mar') },
    { v: 4, n: t('apr') }, { v: 5, n: t('may') }, { v: 6, n: t('jun') },
    { v: 7, n: t('jul') }, { v: 8, n: t('aug') }, { v: 9, n: t('sep') },
    { v: 10, n: t('oct') }, { v: 11, n: t('nov') }, { v: 12, n: t('dec') }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard', { params: filter });
        if (isMounted) {
          setData(res.data || {});
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (isMounted) setData({});
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, [filter]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  // Safe data access
  const summary = data?.summary || { income: 0, expense: 0, balance: 0 };
  const recentTransactions = Array.isArray(data?.recent_transactions) ? data.recent_transactions : [];
  const timeSeries = Array.isArray(data?.time_series) ? data.time_series : [];
  const categoryBreakdown = Array.isArray(data?.category_breakdown) ? data.category_breakdown : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">
            {t('dasbor')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
            {t('financial_overview')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <Calendar size={18} className="text-primary-600 ml-2" />
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white cursor-pointer"
            value={filter.month}
            onChange={(e) => setFilter({ ...filter, month: parseInt(e.target.value) })}
          >
            {months.map(m => <option key={m.v} value={m.v} className="dark:bg-slate-800">{m.n}</option>)}
          </select>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-slate-700" />
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white cursor-pointer pr-4"
            value={filter.year}
            onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
          >
            {years.map(y => <option key={y} value={y} className="dark:bg-slate-800">{y}</option>)}
          </select>
        </div>

        <button 
          onClick={() => navigate('/transactions', { state: { openModal: true } })}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-center space-x-2 shadow-xl shadow-primary-200 dark:shadow-none transition-all active:scale-95 group font-bold order-first md:order-last"
        >
          <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
          <span className="tracking-wide">{t('add_record')}</span>
        </button>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden bg-primary-600 dark:bg-primary-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-100">{t('cash_flow')}</span>
            <h2 className="text-4xl font-black mt-2 mb-2 tracking-tight">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.balance || 0)}
            </h2>
            <p className="text-sm font-medium text-primary-100/80">{t('monthly_net_change')}</p>
          </div>
        </div>

        <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('income_label')}</span>
          </div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('total_income')}</span>
          <h2 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.income || 0)}
          </h2>
        </div>

        <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none transition-all duration-500 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:-rotate-12 transition-transform">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t('expense_label')}</span>
          </div>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('total_expense')}</span>
          <h2 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.expense || 0)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none transition-colors">
          <h3 className="text-lg font-bold mb-6 dark:text-white uppercase tracking-wider">{t('monthly_trend')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                    borderRadius: '1.5rem', 
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '1rem'
                  }}
                  itemStyle={{ 
                    fontWeight: 700, 
                    fontSize: '12px'
                  }}
                  labelStyle={{
                    color: theme === 'dark' ? '#ffffff' : '#1e293b',
                    fontWeight: 800,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.05em'
                  }}
                />
                <Area type="monotone" dataKey="income" name={t('income_label')} stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" name={t('expense_label')} stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none transition-colors">
          <h3 className="text-lg font-bold mb-6 dark:text-white uppercase tracking-wider">{t('expense_distribution')}</h3>
          <div className="h-[250px]">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="total"
                    nameKey="category_name"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, x, y, textAnchor, category_name }) => (
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        fill={theme === 'dark' ? '#cbd5e1' : '#64748b'}
                        fontSize={10}
                        fontWeight={600}
                      >
                        {t(category_name)}
                      </text>
                    )}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value), t(name)]}
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                      borderRadius: '1rem', 
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{
                      color: theme === 'dark' ? '#ffffff' : '#1e293b',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                    labelStyle={{
                      color: theme === 'dark' ? '#94a3b8' : '#64748b',
                      fontSize: '10px',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <PieChartIcon size={40} className="opacity-20" />
                <p className="text-sm font-medium">{t('no_data_period')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold dark:text-white uppercase tracking-wider">{t('recent_records')}</h3>
          <Link to="/transactions" className="text-xs font-black text-primary-600 dark:text-primary-400 hover:opacity-70 transition-opacity uppercase tracking-widest">
            {t('see_all')} →
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id || Math.random()} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all group">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {transaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {transaction.description || t('no_description')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t(transaction.category_name)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(transaction.amount || 0)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }) : '---'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 font-medium">{t('no_records')}</p>
            </div>
          )}
        </div>
      </div>
      {/* Floating Shortcut Button for Mobile/Quick Access */}
      <button 
        onClick={() => navigate('/transactions', { state: { openModal: true } })}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-400 dark:shadow-none transition-all active:scale-90 z-40 group md:hidden"
        title={t('add_record')}
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

export default Dashboard;
