import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Tag, Layers } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/categories', { name: newName });
      setNewName('');
      fetchCategories();
    } catch (err) {
      alert('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will not delete transactions using it, but they might lose their category reference.')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Category Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Organize your transactions with custom categories</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Category Form */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm sticky top-8 transition-colors">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Plus size={20} className="text-primary-600 dark:text-primary-400" />
              New Category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subsistence"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-50 dark:border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <Layers size={20} className="text-primary-600 dark:text-primary-400" />
                All Categories
              </h2>
              <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold transition-colors">
                {categories.length} Total
              </span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {categories.map((category) => (
                <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-xl transition-colors">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">{category.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Created: {new Date(category.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {/* Prevent deleting if it's a default system category if we have that logic, but here categories are user-linked or global */}
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                  <Tag size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No categories found. Create one to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
