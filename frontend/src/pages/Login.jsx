import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Silakan periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 space-y-8 border border-white dark:border-slate-700 transition-colors">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Selamat Datang</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Kelola keuangan Anda dengan mudah</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none dark:text-white transition-all"
                  placeholder="nama@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none dark:text-white transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <span>Masuk</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors">
                Daftar gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
