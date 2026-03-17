import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ChevronRight,
    Loader2,
    Briefcase,
    MapPin,
    Settings,
    Phone,
    Info
} from 'lucide-react';
import * as CompanyApi from '../../api/CompanyApi';
import { format } from 'date-fns';

const CompanyDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Summary');

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setLoading(true);
            try {
                // The CompanyApi.getCompanyById expects an ID
                const response = await CompanyApi.getCompanyById(id);
                if (response.success) {
                    setCompany(response.data);
                } else {
                    setError(response.message || "Failed to fetch company details");
                }
            } catch (err) {
                console.error("fetchCompanyDetails error", err);
                setError("An error occurred while fetching company details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCompanyDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium tracking-wide">Loading company details...</p>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl mx-auto mt-10">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 inline-block mb-6">
                    <Info className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">{error || "Company not found"}</p>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/associate/companies')}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        Back to Companies
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        'Summary',
        // 'Associated Customers',
        // 'Service Orders',
        // 'Service Packages',
        // 'Product Subscriptions',
        // 'Associated Executives',
        // 'Chats',
        // 'Documents',
        // 'Notes',
        // 'Files',
        // 'Event Logs',
        // 'Support Tickets',
        // 'feedbacks'
    ];

    return (
        <div className="p-8 pb-20 space-y-8 bg-[#fdfdfd] min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/associate/companies')}
                    className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-all shadow-sm active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                    <Link to="/associate/companies" className="hover:text-slate-600 transition-colors">Companies</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600">Company Details</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900">{activeTab}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-inner">
                            <Briefcase className="w-7 h-7 text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {company.BusinessName} (ID: {company.CompanyID})
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${company.IsActive !== 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {company.IsActive !== 0 ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">N/A</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-100">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-yellow-400 text-black shadow-sm ring-1 ring-yellow-500/20'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-8"
                >
                    {activeTab === 'Summary' ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Information */}
                                <div className="bg-white rounded-[2rem] p-10 border border-yellow-200/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                                            <Info className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <h3 className="font-black text-lg text-slate-900 tracking-tight uppercase">Basic Information</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <InfoItem label="Business Name" value={company.BusinessName} />
                                        <InfoItem label="Business Nature" value={company.BusinessNature || 'N/A'} />
                                        <InfoItem label="Sector" value={company.Sector || 'N/A'} />
                                        <InfoItem label="Constitution Category" value={company.ConstitutionCategory || 'N/A'} />
                                        <InfoItem label="Status" value={company.IsActive !== 0 ? 'Active' : 'Inactive'} />
                                        <InfoItem label="Created At" value={company.CreatedAt ? format(new Date(company.CreatedAt), 'd MMMM yyyy') : 'N/A'} />
                                        <InfoItem label="Updated At" value={company.UpdatedAt ? format(new Date(company.UpdatedAt), 'd MMMM yyyy') : 'N/A'} />
                                    </div>
                                </div>

                                {/* Parent Order Information */}
                                <div className="bg-white rounded-[2rem] p-10 border border-yellow-200/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <h3 className="font-black text-lg text-slate-900 tracking-tight uppercase">Parent Order Information</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <InfoItem label="City" value={company.District || 'N/A'} />
                                        <InfoItem label="State" value={company.State || 'N/A'} />
                                        <InfoItem label="Country" value={company.Country || 'India'} />
                                        <InfoItem label="Pin Code" value={company.PinCode || 'N/A'} />
                                        <div className="col-span-2">
                                            <InfoItem label="Website" value={company.Website || 'N/A'} isLink={!!company.Website && company.Website !== 'N/A'} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-[2rem] p-10 border border-yellow-200/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <h3 className="font-black text-lg text-slate-900 tracking-tight uppercase">Contact Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <InfoItem label="Company Email" value={company.CompanyEmail} />
                                    <InfoItem label="Company Mobile" value={company.CompanyMobile} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-20 border border-slate-100 shadow-sm text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Settings className="w-10 h-10 text-slate-200 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{activeTab} Content</h3>
                            <p className="text-slate-400 max-w-sm mx-auto">This section is currently being updated. Please check back later for detailed {activeTab.toLowerCase()} information.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const InfoItem = ({ label, value, isLink }) => (
    <div className="space-y-1.5 overflow-hidden">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {isLink ? (
            <a
                href={value.startsWith('http') ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-yellow-600 hover:text-yellow-700 hover:underline transition-colors block truncate"
            >
                {value}
            </a>
        ) : (
            <p className="text-sm font-bold text-slate-800 leading-snug truncate">{value}</p>
        )}
    </div>
);

const AnimatePresence = motion.AnimatePresence;

export default CompanyDetailView;
