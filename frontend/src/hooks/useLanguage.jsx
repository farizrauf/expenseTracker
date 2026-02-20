import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    categories: 'Categories',
    logout: 'Logout',
    theme: 'Theme',
    language: 'Language',
    developed_by: 'Developed by',
    
    // Dashboard
    dasbor: 'Dashboard',
    financial_overview: 'Financial overview for your selected period',
    new_record: 'New Record',
    cash_flow: 'Cash Flow',
    monthly_net_change: 'Monthly net change',
    total_income: 'Total Income',
    total_expense: 'Total Expenses',
    monthly_trend: 'Monthly Cash Flow Trend',
    expense_distribution: 'Expense Distribution',
    recent_records: 'Recent Records',
    see_all: 'See All',
    no_records: 'No records yet.',
    no_data_period: 'No data for this period',
    income_label: 'Income',
    expense_label: 'Expense',
    
    // Transactions
    transactions_header: 'Transactions',
    manage_records: 'View and manage all your records',
    add_record: 'Add Record',
    search_transactions: 'Search transactions...',
    all_categories: 'All Categories',
    transaction_col: 'Transaction',
    category_col: 'Category',
    date_col: 'Date',
    amount_col: 'Amount',
    actions_col: 'Actions',
    no_description: 'No description',
    no_records_found: 'No records found.',
    
    // Transaction Modal
    edit_transaction: 'Edit Transaction',
    new_transaction: 'New Transaction',
    expense: 'Expense',
    income: 'Income',
    amount_label: 'Amount (IDR)',
    category_label: 'Category',
    select_category: 'Select',
    create_new_category: '+ Create New...',
    new_category_placeholder: 'Enter new category name',
    date_label: 'Date',
    description_label: 'Description',
    description_placeholder: 'e.g. Lunch with client',
    cancel: 'Cancel',
    save_transaction: 'Save Transaction',
    confirm_delete_transaction: 'Are you sure you want to delete this transaction?',
    fail_save: 'Failed to save transaction',
    fail_delete: 'Failed to delete',
    
    // Categories
    category_management: 'Category Management',
    organize_categories: 'Organize your transactions with custom categories',
    new_category_box: 'New Category',
    category_name_label: 'Category Name',
    category_name_placeholder: 'e.g. Subsistence',
    add_category_btn: 'Add Category',
    adding_btn: 'Adding...',
    all_categories_box: 'All Categories',
    total: 'Total',
    created_at: 'Created',
    no_categories_start: 'No categories found. Create one to get started.',
    confirm_delete_category: 'Are you sure you want to delete this category? This will not delete transactions using it, but they might lose their category reference.',
    fail_add_cat: 'Failed to add category',
    fail_delete_cat: 'Failed to delete category',

    // Auth
    welcome_back: 'Welcome Back',
    manage_finance_ease: 'Manage your finance with ease',
    email_label: 'Email Address',
    password_label: 'Password',
    sign_in_btn: 'Sign In',
    no_account: "Don't have an account?",
    register_free: 'Register free',
    create_account: 'Create Account',
    start_journey: 'Start your journey to financial freedom',
    full_name_label: 'Full Name',
    full_name_placeholder: 'John Doe',
    min_pass: 'Min. 6 characters',
    signup_btn: 'Create Account',
    already_account: 'Already have an account?',
    login_btn: 'Sign In',
    login_fail: 'Login failed. Please check your credentials.',
    register_fail: 'Registration failed.',
    
    // Months
    jan: 'January', feb: 'February', mar: 'March', apr: 'April',
    may: 'May', jun: 'June', jul: 'July', aug: 'August',
    sep: 'September', oct: 'October', nov: 'November', dec: 'December'
  },
  id: {
    // Navigation
    dashboard: 'Dasbor',
    transactions: 'Transaksi',
    categories: 'Kategori',
    logout: 'Keluar',
    theme: 'Tema',
    language: 'Bahasa',
    developed_by: 'Dikembangkan oleh',

    // Dashboard
    dasbor: 'Dasbor',
    financial_overview: 'Ringkasan keuangan untuk periode pilihan Anda',
    new_record: 'Catat Baru',
    cash_flow: 'Arus Kas',
    monthly_net_change: 'Perubahan bersih bulan ini',
    total_income: 'Total Pemasukan',
    total_expense: 'Total Pengeluaran',
    monthly_trend: 'Tren Arus Kas Bulanan',
    expense_distribution: 'Distribusi Pengeluaran',
    recent_records: 'Catatan Terakhir',
    see_all: 'Liat Semua',
    no_records: 'Belum ada catatan.',
    no_data_period: 'Tidak ada data untuk periode ini',
    income_label: 'Pemasukan',
    expense_label: 'Pengeluaran',

    // Transactions
    transactions_header: 'Transaksi',
    manage_records: 'Lihat dan kelola semua catatan Anda',
    add_record: 'Tambah Catatan',
    search_transactions: 'Cari transaksi...',
    all_categories: 'Semua Kategori',
    transaction_col: 'Transaksi',
    category_col: 'Kategori',
    date_col: 'Tanggal',
    amount_col: 'Jumlah',
    actions_col: 'Aksi',
    no_description: 'Tanpa keterangan',
    no_records_found: 'Tidak ada catatan yang ditemukan.',

    // Transaction Modal
    edit_transaction: 'Edit Transaksi',
    new_transaction: 'Transaksi Baru',
    expense: 'Pengeluaran',
    income: 'Pemasukan',
    amount_label: 'Jumlah (IDR)',
    category_label: 'Kategori',
    select_category: 'Pilih',
    create_new_category: '+ Buat Baru...',
    new_category_placeholder: 'Masukkan nama kategori baru',
    date_label: 'Tanggal',
    description_label: 'Keterangan',
    description_placeholder: 'misal: Makan siang dengan klien',
    cancel: 'Batal',
    save_transaction: 'Simpan Transaksi',
    confirm_delete_transaction: 'Apakah Anda yakin ingin menghapus transaksi ini?',
    fail_save: 'Gagal menyimpan transaksi',
    fail_delete: 'Gagal menghapus',

    // Categories
    category_management: 'Manajemen Kategori',
    organize_categories: 'Atur transaksi Anda dengan kategori kustom',
    new_category_box: 'Kategori Baru',
    category_name_label: 'Nama Kategori',
    category_name_placeholder: 'misal: Kebutuhan Pokok',
    add_category_btn: 'Tambah Kategori',
    adding_btn: 'Menambahkan...',
    all_categories_box: 'Semua Kategori',
    total: 'Total',
    created_at: 'Dibuat',
    no_categories_start: 'Belum ada kategori. Buat satu untuk memulai.',
    confirm_delete_category: 'Apakah Anda yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini tidak akan terhapus, namun referensi kategorinya mungkin akan hilang.',
    fail_add_cat: 'Gagal menambahkan kategori',
    fail_delete_cat: 'Gagal menghapus kategori',

    // Auth
    welcome_back: 'Selamat Datang',
    manage_finance_ease: 'Kelola keuangan Anda dengan mudah',
    email_label: 'Alamat Email',
    password_label: 'Kata Sandi',
    sign_in_btn: 'Masuk',
    no_account: 'Belum punya akun?',
    register_free: 'Daftar gratis',
    create_account: 'Buat Akun',
    start_journey: 'Mulai perjalanan menuju kebebasan finansial',
    full_name_label: 'Nama Lengkap',
    full_name_placeholder: 'Misal: Fariz Rauf',
    min_pass: 'Min. 6 karakter',
    signup_btn: 'Daftar Sekarang',
    already_account: 'Sudah punya akun?',
    login_btn: 'Masuk',
    login_fail: 'Login gagal. Silakan periksa kredensial Anda.',
    register_fail: 'Pendaftaran gagal.',

    // Months
    jan: 'Januari', feb: 'Februari', mar: 'Maret', apr: 'April',
    may: 'Mei', jun: 'Juni', jul: 'Juli', aug: 'Agustus',
    sep: 'September', oct: 'Oktober', nov: 'November', dec: 'Desember'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'id');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const t = (key) => {
    const lang = translations[language] || translations['en'] || {};
    return lang[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
