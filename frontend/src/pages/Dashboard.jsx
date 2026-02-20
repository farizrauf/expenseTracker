import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/transactions/dashboard');
      setData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(val || 0);

  // Use data from backend for the chart
  const chartData = data?.time_series?.map(item => {
    // Robust date parsing for the chart labels
    const d = new Date(item.date);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      income: item.income,
      expense: item.expense
    };
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, track your expenses here.</p>
        </div>
        <button 
          onClick={() => navigate('/transactions')}
          className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
        >
          <Plus size={20} />
          <span className="hidden md:inline font-medium">New Transaction</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400">Total Balance</span>
          </div>
          <h2 className="text-2xl font-bold">{formatCurrency(data?.current_balance)}</h2>
          <p className="text-sm text-gray-400 mt-1">Available spending</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400">Total Income</span>
          </div>
          <h2 className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.total_income)}</h2>
          <p className="text-sm text-emerald-500 mt-1 font-medium">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-400">Total Expenses</span>
          </div>
          <h2 className="text-2xl font-bold text-rose-600">{formatCurrency(data?.total_expense)}</h2>
          <p className="text-sm text-rose-500 mt-1 font-medium">+5.4% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Income vs Expenses</h3>
          <div className="h-72 w-full">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <button className="text-primary-600 text-sm font-semibold hover:underline">See All</button>
          </div>
          <div className="space-y-4">
            {data?.last_transactions?.length > 0 ? data.last_transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.description || t.category?.name}</p>
                    <p className="text-xs text-gray-400 font-medium lowercase italic">
                      {new Date(t.date).toLocaleDateString()} • {t.category?.name}
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            )) : <p className="text-center text-gray-400 py-10">No transactions recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
