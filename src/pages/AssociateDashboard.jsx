import { motion } from 'framer-motion';
import {
    Users,
    Handshake,
    FileText,
    ShoppingCart,
    Plus,
    Clock,
    CheckCircle2,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { getSecureItem } from '../utils/secureStorage';
import { useNavigate } from 'react-router-dom';

const AssociateDashboard = () => {
    const navigate = useNavigate();

    const user = getSecureItem("partnerUser") || { username: "Associate" };


    const stats = [
        {
            title: "Total Leads",
            value: "156",
            change: "+12% vs last month",
            icon: <Users className="w-6 h-6" />,
            trend: "up",
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Active Deals",
            value: "34",
            change: "+8% vs last month",
            icon: <Handshake className="w-6 h-6" />,
            trend: "up",
            color: "bg-green-50 text-green-600"
        },
        {
            title: "Pending Quotes",
            value: "12",
            change: "-3% vs last month",
            icon: <FileText className="w-6 h-6" />,
            trend: "down",
            color: "bg-red-50 text-red-600"
        },
        {
            title: "Orders",
            value: "89",
            change: "+15% vs last month",
            icon: <ShoppingCart className="w-6 h-6" />,
            trend: "up",
            color: "bg-yellow-50 text-yellow-600"
        }
    ];

    const recentActivity = [
        { id: 1, type: 'lead', title: 'New lead added: ABC Technologies', time: '2 hours ago', icon: <Plus className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
        { id: 2, type: 'quote', title: 'Quote approved for XYZ Corp', time: '4 hours ago', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
        { id: 3, type: 'order', title: 'Payment received for Order #1234', time: '6 hours ago', icon: <ShoppingCart className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
        { id: 4, type: 'revision', title: 'Quote revision requested by Client', time: '8 hours ago', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-600' },
        { id: 5, type: 'deal', title: 'Deal converted from lead: Tech Solutions', time: '1 day ago', icon: <Target className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600' }
    ];

    const quickActions = [
        { title: "Add New Lead", desc: "Create a new lead entry", icon: <Users className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
        { title: "Request Quote", desc: "Get pricing for a service", icon: <FileText className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
        { title: "View Orders", desc: "Track order status", icon: <ShoppingCart className="w-5 h-5" />, color: "bg-yellow-50 text-yellow-600" }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.username}!</h1>
                <p className="text-slate-500 mt-1">Here's what's happening with your business today.</p>
            </div>

            {/* Explore Services CTA */}
            <div className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Discover Services to Grow Your Business 🚀
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Explore available services and find the best solutions for your clients.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/associate/explore-services")}
                    className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                    Explore Services
                </button>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {stat.change}
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all text-left flex flex-col gap-4 group"
                            >
                                <div className={`p-3 rounded-xl w-fit ${action.color} group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{action.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Dashboard Overview Chart Placeholder */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900">Performance Overview</h2>
                            <select className="bg-slate-50 border border-slate-200 text-sm font-medium px-4 py-2 rounded-xl focus:outline-none">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>This year</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[40, 65, 45, 90, 55, 75, 80].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className={`w-full max-w-[40px] rounded-t-lg transition-all ${i === 3 ? 'bg-yellow-400' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                                    />
                                    <span className="text-[10px] font-bold text-slate-400">Mon</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {recentActivity.map((activity, idx) => (
                            <div
                                key={activity.id}
                                className={`p-6 flex gap-4 hover:bg-slate-50 transition-all ${idx !== recentActivity.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-4 text-sm font-bold text-yellow-500 hover:bg-yellow-50 transition-all">
                            View All Activities
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociateDashboard;
