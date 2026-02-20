import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { PlusCircle, Trash2, Tag, Loader2 } from 'lucide-react';

const Categories = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/categories', { name: newCategory });
      setCategories([...categories, res.data]);
      setNewCategory('');
    } catch (err) {
      alert(t('fail_add_cat'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete_category'))) return;

    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(t('fail_delete_cat'));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">
          {t('category_management')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
          {t('organize_categories')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Category Form */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none transition-colors">
          <h2 className="text-lg font-black mb-6 text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="text-primary-600" size={20} />
            {t('new_category_box')}
          </h2>
          <form onSubmit={handleAddCategory} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('category_name_label')}</label>
              <input
                type="text"
                placeholder={t('category_name_placeholder')}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white font-bold transition-all"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newCategory.trim()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-xs uppercase tracking-[0.2em]">{t('adding_btn')}</span>
                </>
              ) : (
                <span className="text-xs uppercase tracking-[0.2em]">{t('add_category_btn')}</span>
              )}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-white dark:border-slate-700 shadow-xl shadow-gray-100 dark:shadow-none overflow-hidden transition-colors">
          <div className="p-8 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('all_categories_box')}</h2>
            <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              {categories.length} {t('total')}
            </span>
          </div>
          
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {loading ? (
              <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary-200" size={40} /></div>
            ) : categories.length > 0 ? (
              categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                      <Tag size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-wide">{t(c.name)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {t('created_at')} • {new Date(c.CreatedAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <Tag className="mx-auto text-gray-200 dark:text-slate-700 mb-4 opacity-20" size={48} />
                <p className="text-gray-400 font-medium italic">{t('no_categories_start')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
