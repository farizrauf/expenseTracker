import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../hooks/useTheme';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, 
  ArrowUpRight, ArrowDownLeft, Clock 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // State for filtering
  const now = new Date();
  const [filter, setFilter] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [filter]); // Re-fetch when filter changes

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions/dashboard?month=${filter.month}&year=${filter.year}`);
      setData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(val || 0);

  const chartData = data?.time_series?.map(item => {
    const d = new Date(item.date);
    return {
      name: d.getDate(), // Show day of month
      fullDate: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      income: item.income,
      expense: item.expense
    };
  }) || [];

  const pieData = data?.category_breakdown || [];
  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const months = [
    { v: 1, n: 'Januari' }, { v: 2, n: 'Februari' }, { v: 3, n: 'Maret' },
    { v: 4, n: 'April' }, { v: 5, n: 'Mei' }, { v: 6, n: 'Juni' },
    { v: 7, n: 'Juli' }, { v: 8, n: 'Agustus' }, { v: 9, n: 'September' },
    { v: 10, n: 'Oktober' }, { v: 11, n: 'November' }, { v: 12, n: 'Desember' }
  ];

  const years = [now.getFullYear(), now.getFullYear() - 1];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white transition-colors">Dasbor</h1>
          <p className="text-gray-500 dark:text-gray-400">Ringkasan keuangan untuk periode pilihan Anda</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
            <select 
              value={filter.month}
              onChange={(e) => setFilter({...filter, month: parseInt(e.target.value)})}
              className="bg-transparent border-none text-sm font-bold dark:text-white focus:ring-0 cursor-pointer px-3"
            >
              {months.map(m => <option key={m.v} value={m.v} className="dark:bg-slate-800">{m.n}</option>)}
            </select>
            <select 
              value={filter.year}
              onChange={(e) => setFilter({...filter, year: parseInt(e.target.value)})}
              className="bg-transparent border-none text-sm font-bold dark:text-white focus:ring-0 cursor-pointer px-3"
            >
              {years.map(y => <option key={y} value={y} className="dark:bg-slate-800">{y}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => navigate('/transactions', { state: { openModal: true } })}
            className="bg-primary-600 text-white p-2.5 md:px-4 md:py-2 rounded-xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-none"
          >
            <Plus size={20} />
            <span className="hidden md:inline font-medium">Catat Baru</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 card-hover transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Wallet size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Arus Kas</span>
              </div>
              <h2 className="text-2xl font-bold dark:text-white transition-colors">{formatCurrency(data?.current_balance)}</h2>
              <p className="text-sm text-gray-400 mt-1">Perubahan bersih bulan ini</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 card-hover transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <TrendingUp size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Pemasukan</span>
              </div>
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">{formatCurrency(data?.total_income)}</h2>
              <p className="text-sm text-emerald-500 mt-1 font-medium">Pemasukan {months[filter.month-1].n}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 card-hover transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <TrendingDown size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Pengeluaran</span>
              </div>
              <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 transition-colors">{formatCurrency(data?.total_expense)}</h2>
              <p className="text-sm text-rose-500 mt-1 font-medium">Pengeluaran {months[filter.month-1].n}</p>
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold mb-6 dark:text-white">Tren Arus Kas Bulanan</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f3f4f6'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff'}}
                    itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Distribusi Pengeluaran</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-64 w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val) => formatCurrency(val)}
                        contentStyle={{borderRadius: '12px', border: 'none'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  {pieData.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-sm font-medium dark:text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold dark:text-white">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  {pieData.length === 0 && <p className="text-gray-400 text-sm italic">Tidak ada data untuk periode ini</p>}
                </div>
              </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold dark:text-white">Catatan Terakhir</h3>
                <button 
                  onClick={() => navigate('/transactions')}
                  className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-4">
                {data?.last_transactions?.length > 0 ? data.last_transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.description || t.category?.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium lowercase">
                          {new Date(t.date).toLocaleDateString('id-ID')} • {t.category?.name}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                )) : <p className="text-center text-gray-400 py-10">Belum ada catatan.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
