import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Handshake,
    FileText,
    ShoppingCart,
    Briefcase,
    User,
    LogOut,
    Search,
    Bell,
    ChevronRight,
    Key,
    Shield,
    Receipt,
    FileSpreadsheet
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getSecureItem } from '../utils/secureStorage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssociateLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const user = getSecureItem("partnerUser") || { username: "Associate" };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        // Remove partner-specific token and user data
        localStorage.removeItem("partnerToken");
        localStorage.removeItem("partnerUser");
        navigate("/");
    };

    const sidebarItems = [
        { id: 'dashboard', path: '/associate/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        // { id: 'leads', path: '/associate/leads', icon: <Users className="w-5 h-5" />, label: 'Leads' },
        { id: 'deals', path: '/associate/deals', icon: <Handshake className="w-5 h-5" />, label: 'Deals' },
        { id: 'quotes', path: '/associate/quotes', icon: <FileText className="w-5 h-5" />, label: 'Quotes' },
        { id: 'orders', path: '/associate/orders', icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders' },
        { id: 'services', path: '/associate/services', icon: <Briefcase className="w-5 h-5" />, label: 'Services' },
        { id: 'customers', path: '/associate/customers', icon: <Users className="w-5 h-5" />, label: 'Customers' },
        { id: 'companies', path: '/associate/companies', icon: <Briefcase className="w-5 h-5" />, label: 'Companies' },
        { id: 'receipts', path: '/associate/receipts', icon: <Receipt className="w-5 h-5" />, label: 'Receipts' },
        { id: 'explore-services', path: '/associate/explore-services', icon: <FileText className="w-5 h-5" />, label: 'Explore' },
        // { id: 'invoices', path: '/associate/invoices', icon: <FileSpreadsheet className="w-5 h-5" />, label: 'Invoices' },
    ];

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };





    const getPageTitle = () => {
        if (location.pathname.includes('dashboard')) return 'Dashboard';
        if (location.pathname.includes('profile')) return 'Profile';
        const item = sidebarItems.find(item => 
            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
        );
        return item ? item.label : 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black text-xl italic">B</div>
                    <span className="text-xl font-bold tracking-tight">Bizpole</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <button
                        onClick={() => navigate('/associate/profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/associate/profile')
                            ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                    </button>
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        {location.pathname !== '/associate/profile' && location.pathname !== '/associate/dashboard' && <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={`Search ${getPageTitle().toLowerCase()}...`}
                                className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
                            />
                        </div>}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all relative">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">{user.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user.type || 'Associate'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center font-bold text-black border-2 border-white shadow-sm">
                                {user.username?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                    <LogOut className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to leave?</h3>
                                <p className="text-slate-500 mb-8">Are you sure you want to logout? You'll need to sign back in to access your dashboard.</p>

                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={confirmLogout}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/25 active:scale-[0.98]"
                                    >
                                        Yes, logout
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssociateLayout;
