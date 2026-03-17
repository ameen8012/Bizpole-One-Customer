import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, Download, } from 'lucide-react';
import { getSecureItem } from '../../utils/secureStorage';
import { format } from 'date-fns';
import { getQuoteStatus } from '../../api/QuoteStatusApi';
import axiosInstance from '../../api/axiosInstance';
import DealsApi from '../../api/DealsApi';
import AddDealModal from '../../components/Modals/AddDealModal';
import CryptoJS from "crypto-js";



const AssociateQuotes = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requested'); // 'requested' or 'approved'
    const [quotes, setQuotes] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [companyNames, setCompanyNames] = useState({});
    const [quoteStatuses, setQuoteStatuses] = useState({});


    const fetchDeals = async () => {
        if (activeTab !== 'requested') return;
        setLoading(true);
        setError(null);
        try {
            const user = getSecureItem("partnerUser") || {};
            const AssociateID = user.id || localStorage.getItem("AssociateID");

            // 1) Fetch deals
            const result = await DealsApi.listDeals({
                isAssociate: true,
                AssociateID: AssociateID,
            });

            // 2) Fetch quotes to filter out deals that already have quotes
            const quotesResponse = await axiosInstance.post('/getLatestQuotes', {
                AssociateID: AssociateID,
                isAssociate: true
            });
            const existingQuoteDealIds = (quotesResponse.data?.data || []).map(q => q.DealID).filter(Boolean);

            if (result.success) {
                // Filter requested deals AND those that don't have a quote yet
                const requestedDeals = result.data.filter(d =>
                    d.associate_request === 1 && !existingQuoteDealIds.includes(d.id)
                );
                setDeals(requestedDeals);

                // Fetch company names
                await Promise.all(
                    requestedDeals.map(async (deal) => {
                        if (deal.CompanyID && !companyNames[deal.CompanyID]) {
                            const compResult = await DealsApi.getCompanyDetails(deal.CompanyID);
                            if (compResult.success && compResult.data) {
                                setCompanyNames(prev => ({
                                    ...prev,
                                    [deal.CompanyID]: compResult.data.BusinessName
                                }));
                            }
                        }
                    })
                );
            }
        } catch (err) {
            console.error("fetchDeals error", err);
            setError("An error occurred while fetching deals");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuotes = async () => {
        if (activeTab !== 'approved') return;
        setLoading(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const AssociateID = user.id || localStorage.getItem("AssociateID");

            const response = await axiosInstance.post('/getLatestQuotes', {
                AssociateID: AssociateID,
                isAssociate: true
            });

            console.log("response.data?.data", response.data?.data);


            if (response.data?.data) {
                const fetchedQuotes = response.data.data;
                setQuotes(fetchedQuotes);

                // Fetch real-time statuses
                const quoteIds = fetchedQuotes.map(q => q.QuoteID).filter(Boolean);
                if (quoteIds.length > 0) {
                    try {
                        const statusRes = await getQuoteStatus(quoteIds);
                        if (statusRes && statusRes.results) {
                            const statusMap = {};
                            statusRes.results.forEach(s => {
                                let status = s.quotestatus;
                                if (status === "1") status = "Draft";
                                if (status === "3") status = "Payment Received & Converted";
                                statusMap[s.quoteId] = status;
                            });
                            setQuoteStatuses(statusMap);
                        }
                    } catch (statusErr) {
                        console.error("Error fetching quote statuses:", statusErr);
                    }
                }
            }
        } catch (err) {
            console.error("fetchQuotes error", err);
            setError("An error occurred while fetching quotes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'requested') {
            fetchDeals();
        } else {
            fetchQuotes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);




    const encrypt = (id) => {
        const secret =
            import.meta.env.VITE_QUOTE_LINK_SECRET ||
            "q3!9fKs7@pLzXr84$nmYtB!cVZdQ3";
        return CryptoJS.AES.encrypt(String(id), secret).toString();
    };



    const handleViewQuote = (quote) => {
        console.log("quote", quote.QuoteID);

        if (!quote?.QuoteID) return;

        // Safety check
        if (typeof CryptoJS === "undefined") {
            console.error("CryptoJS is not available");
            alert("Unable to open quote preview. CryptoJS library not loaded.");
            return;
        }

        const encryptedId = encodeURIComponent(encrypt(quote.QuoteID));

        // const url = `${window.location.origin}/quotes/saved-preview/${encryptedId}`;
        // or if you want hardcoded dev URL:
        const url = `https://dev.bizpoleindia.in/quotes/saved-preview/${encryptedId}`;

        window.open(url, "_blank");
    };

    const handleDownloadQuote = (quote) => {
        if (!quote?.QuoteID) {
            alert("Quote ID not found");
            return;
        }
        const baseUrl = "https://dev.bizpoleindia.in";
        const url = `${baseUrl}/quotes/download/${quote.QuoteID}`;
        window.open(url, "_blank");
    };





    const filteredQuotes = quotes.filter(quote =>
        quote.QuoteCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.QuoteName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDeals = deals.filter(deal =>
        deal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.DealCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Quotes</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {activeTab === 'requested' ? 'View status of requested quotes' : 'Manage your quotes'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* TABS */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('requested')}
                    className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'requested'
                        ? 'text-[#4b49ac]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Requested Quotes
                    {activeTab === 'requested' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4b49ac]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`pb-3 px-4 text-sm font-semibold transition-all relative ${activeTab === 'approved'
                        ? 'text-[#4b49ac]'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Created Quotes
                    {activeTab === 'approved' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4b49ac]" />
                    )}
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'requested' ? "Search deals..." : "Search quotes..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Content Table */}
            {activeTab === 'requested' ? (
                /* Requested Quotes UI (Same as AssociateDeals) */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                                    <th className="px-6 py-4">S.No</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Deal Name</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Closure Date</th>
                                    <th className="px-6 py-4">Services</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Service Category</th>
                                    <th className="px-6 py-4">Deal Type</th>
                                    <th className="px-6 py-4">Mobile</th>
                                    {/* <th className="px-6 py-4 text-right">Action</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-[#4b49ac]" />
                                                <span>Loading deals...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDeals.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                                            No requested quotes found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDeals.map((deal, index) => (



                                        <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors cursor-default">
                                            <td className="px-6 py-4 text-slate-400 text-xs font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 text-slate-400 text-xs font-medium uppercase">{deal.DealCode || `--`}</td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{deal.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {companyNames[deal.CompanyID] || deal.BusinessName || "---"}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {deal.ClosureDate
                                                    ? format(new Date(deal.ClosureDate), "dd-MM-yyyy")
                                                    : "--"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-[220px] truncate">
                                                {deal.packageName ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[#4b49ac] text-[12px]">
                                                            {deal.packageName}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 truncate">
                                                            {deal.services?.map(s => s.serviceName).join(", ") || "--"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    deal.serviceNames ||
                                                    (deal.services?.map(s => s.serviceName).join(", ")) ||
                                                    "--"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {deal.serviceCategory ||
                                                    (deal.services?.length > 0
                                                        ? [...new Set(deal.services.map(s => s.serviceCategory))].join(", ")
                                                        : "--")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${Number(deal.isIndividual) === 1
                                                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                                                        : "bg-purple-50 text-purple-600 border border-purple-100"
                                                        }`}
                                                >
                                                    {Number(deal.isIndividual) === 1 ? "Individual" : "Package"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {deal.mobile || "--"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 whitespace-nowrap">
                                                        Requested
                                                    </span>
                                                    {/* <button
                                                        onClick={() => handleEditDeal(deal)}
                                                        className="p-2 text-slate-400 hover:text-[#4b49ac] hover:bg-slate-100 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDeal(deal)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Approved Quotes UI */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-3">S.No</th>
                                    <th className="px-4 py-3">Quote ID</th>
                                    <th className="px-4 py-3">Quote Date</th>
                                    <th className="px-4 py-3">Company Name</th>
                                    <th className="px-4 py-3">Primary Customer</th>
                                    <th className="px-4 py-3">Origin</th>
                                    <th className="px-4 py-3">Services Type</th>
                                    <th className="px-4 py-3">Quote Cre</th>
                                    <th className="px-4 py-3">Quote Value</th>
                                    <th className="px-4 py-3">Quote Status</th>
                                    <th className="px-4 py-3">IsApproved</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-[#4b49ac]" />
                                                <span>Loading quotes...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-12 text-center text-slate-400">
                                            No quotes found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredQuotes.map((quote, index) => (
                                        <tr key={quote.QuoteID} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td
                                                className="px-4 py-3 font-semibold text-[#4b49ac] hover:underline cursor-pointer"
                                                onClick={() => navigate(`/associate/quotes/${quote.QuoteID}`)}
                                            >
                                                {quote.QuoteCodeId}
                                            </td>
                                            <td className="px-4 py-3">{format(new Date(quote.QuoteDate), "dd/MM/yyyy")}</td>
                                            <td className="px-4 py-3 text-blue-600 underline cursor-pointer">{quote.CompanyName}</td>
                                            <td className="px-4 py-3 text-blue-600 underline cursor-pointer">{quote.CustomerName}</td>
                                            <td className="px-4 py-3">{quote.SourceOfSale || "-"}</td>
                                            <td className="px-4 py-3">{quote.IsIndividual ? "Individual" : "Package"}</td>
                                            <td className="px-4 py-3">{quote.QuoteCRE_EmployeeName}</td>
                                            <td className="px-4 py-3 font-medium">₹{quote.ServiceDetails
                                                .reduce((sum, item) => sum + Number(item.Total || 0), 0)
                                                .toLocaleString("en-IN")}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-md ${(quoteStatuses[quote.QuoteID] || quote.QuoteStatus) === "Draft"
                                                    ? "bg-gray-100 text-gray-600"
                                                    : "bg-emerald-100 text-emerald-700"
                                                    }`}>
                                                    {quoteStatuses[quote.QuoteID] || quote.QuoteStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{quote.IsApproved ? "Yes" : "No"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleViewQuote(quote)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleDownloadQuote(quote)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md">
                                                        <Download className="w-4 h-4 text-slate-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AddDealModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingDeal(null);
                }}
                onSuccess={() => {
                    fetchDeals();
                    setIsEditModalOpen(false);
                    setEditingDeal(null);
                }}
                deal={editingDeal}
            />
        </div>
    );
};

export default AssociateQuotes;
