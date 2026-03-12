import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Calendar, Hash, Building2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSecureItem } from '../../utils/secureStorage';
import { format, differenceInDays } from 'date-fns';
import { listOrders } from '../../api/Orders/Order';
import { useNavigate } from 'react-router-dom';

const AssociateServices = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'individual', 'package'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const pageSize = 10;

    const fetchServices = async () => {
        setLoading(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const AssociateID = user.id || localStorage.getItem("AssociateID");

            const params = {
                isAssociate: true,
                AssociateID: AssociateID,
                limit: pageSize,
                page: currentPage,
                search: searchTerm
            };

            if (filterType === 'individual') params.IsIndividual = 1;
            if (filterType === 'package') params.IsIndividual = 0;

            const response = await listOrders(params);

            if (response.success) {
                // Flatten orders into services
                const flattened = [];
                response.data.forEach(order => {
                    (order.ServiceDetails || []).forEach(service => {
                        flattened.push({
                            ...service,
                            orderInfo: {
                                OrderID: order.OrderID,
                                OrderCodeId: order.OrderCodeId,
                                OrderCreatedAt: order.OrderCreatedAt,
                                QuoteCRE_EmployeeName: order.QuoteCRE_EmployeeName,
                                IsIndividual: order.IsIndividual,
                                CompanyName: order.CompanyName,
                                CustomerName: order.CustomerName,
                                CreatedBy: order.CreatedBy,
                                OrderStatus: order.OrderStatus,
                                TotalAmount: order.TotalAmount,
                                State: order.State
                            }
                        });
                    });
                });
                setServices(flattened);
                setTotalOrders(response.total);
            }
        } catch (err) {
            console.error("fetchServices error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [currentPage, filterType]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchServices();
        }
    };

    const getAgeing = (date) => {
        if (!date) return 0;
        return differenceInDays(new Date(), new Date(date));
    };

    const getReceivedForService = (service) => {
        return (service.ReceivedPayments || []).reduce((sum, p) => sum + Number(p.Amount || 0), 0);
    };

    const totalPages = Math.ceil(totalOrders / pageSize);

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50/50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Service Listing</h1>
                </div>

                {/* Search Bar matching image */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <input
                            type="text"
                            placeholder="Search by Service Name or ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full pl-4 pr-12 py-2.5 bg-white border-2 border-amber-400 rounded-full focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all text-sm font-medium"
                        />
                        <button
                            onClick={fetchServices}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    <button
                        onClick={() => { setSearchTerm(''); fetchServices(); }}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        Clear
                    </button>
                </div>

                {/* Filter Pills matching image */}
                <div className="flex gap-2">
                    <button
                        onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${filterType === 'all' ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-200' : 'bg-white text-slate-400 border border-slate-200 hover:border-amber-200'}`}
                    >
                        All Services
                    </button>
                    <button
                        onClick={() => { setFilterType('individual'); setCurrentPage(1); }}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${filterType === 'individual' ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-200' : 'bg-white text-slate-400 border border-slate-200 hover:border-amber-200'}`}
                    >
                        Individual Services
                    </button>
                    <button
                        onClick={() => { setFilterType('package'); setCurrentPage(1); }}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${filterType === 'package' ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-200' : 'bg-white text-slate-400 border border-slate-200 hover:border-amber-200'}`}
                    >
                        Package Services
                    </button>
                </div>
            </div>

            {/* Table Container with horizontal scroll */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[10px] whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-tighter font-bold text-slate-500">
                                <th className="px-4 py-3 text-center">S.No</th>
                                <th className="px-4 py-3">Service Code</th>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Order Date</th>
                                <th className="px-4 py-3">Order CRE</th>
                                <th className="px-4 py-3">Service Name</th>
                                <th className="px-4 py-3">Service Category</th>
                                <th className="px-4 py-3">Service Type</th>
                                <th className="px-4 py-3">Target Date</th>
                                <th className="px-4 py-3 text-right">Service Value</th>
                                <th className="px-4 py-3 text-right">Order Value</th>
                                {/* <th className="px-4 py-3 text-right">Professional Fee</th>
                                <th className="px-4 py-3 text-right">Vendor Fee</th>
                                <th className="px-4 py-3 text-right">Govt. Fee</th>
                                <th className="px-4 py-3 text-right">Contractor Fee</th>
                                <th className="px-4 py-3 text-right">GST Amount</th>
                                <th className="px-4 py-3 text-right">CGST %</th>
                                <th className="px-4 py-3 text-right">SGST %</th>
                                <th className="px-4 py-3 text-right">IGST %</th> */}
                                <th className="px-4 py-3 text-right">Discount (Order)</th>
                                <th className="px-4 py-3">Company Name</th>
                                <th className="px-4 py-3">Company State</th>
                                <th className="px-4 py-3">Primary Customer</th>
                                <th className="px-4 py-3 text-center">Aging (Days)</th>
                                <th className="px-4 py-3 text-right">Amount Allocated</th>
                                <th className="px-4 py-3 text-right">Amount Received</th>
                                <th className="px-4 py-3">Created Date</th>
                                <th className="px-4 py-3">Created By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="28" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                            <span className="text-slate-400 font-medium">Crunching service data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan="28" className="px-6 py-20 text-center text-slate-400">
                                        No services found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                services.map((service, index) => {
                                    const info = service.orderInfo;
                                    const amountReceived = getReceivedForService(service);
                                    return (
                                        <tr key={`${info.OrderID}_${service.ServiceID}_${index}`} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 py-3 text-center text-slate-400 font-medium">{index + 1}</td>
                                            <td
                                                className="px-4 py-3 font-bold text-[#4b49ac] hover:underline cursor-pointer"
                                                onClick={() => navigate(`/associate/services/${service.ServiceDetailID}`)}
                                            >
                                                {service.service_code || `SV${String(service.ServiceID).padStart(4, '0')}`}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 font-semibold">{info.OrderCodeId || '--'}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {info.OrderCreatedAt ? format(new Date(info.OrderCreatedAt), "yyyy-MM-dd HH:mm:ss") : "--"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{info.QuoteCRE_EmployeeName || "admin"}</td>
                                            <td className="px-4 py-3 font-bold text-slate-700">{service.ServiceName}</td>
                                            <td className="px-4 py-3 text-slate-500 italic">{service.ServiceCategory || "--"}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-[4px] font-medium ${!info.IsIndividual ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-600'}`}>
                                                    {!info.IsIndividual ? "Package" : "Individual"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{service.TargetDate ? format(new Date(service.TargetDate), "yyyy-MM-dd") : "null"}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-700">₹{(service.Total || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-slate-500">₹{(info.TotalAmount || 0).toLocaleString()}</td>
                                            {/* <td className="px-4 py-3 text-right text-slate-600">₹{(service.ProfessionalFee || service.ProfFee || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">₹{(service.VendorFee || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">₹{(service.GovtFee || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">₹{(service.ContractorFee || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-emerald-600">₹{(service.GstAmount || service.GST || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-slate-400">{service.CGST || "undefined"}</td>
                                            <td className="px-4 py-3 text-right text-slate-400">{service.SGST || "undefined"}</td>
                                            <td className="px-4 py-3 text-right text-slate-400">{service.IGST || "undefined"}</td> */}
                                            <td className="px-4 py-3 text-right text-red-400">₹{(service.Discount || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-blue-600 font-medium hover:underline cursor-pointer">{info.CompanyName}</td>
                                            <td className="px-4 py-3 text-slate-500 uppercase">{info.State || "undefined"}</td>
                                            <td className="px-4 py-3 text-slate-700 font-medium">{info.CustomerName}</td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-600">{getAgeing(info.OrderCreatedAt)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-800">₹{(service.Total || 0).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-bold text-[#4b49ac]">₹{amountReceived.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-400 text-[9px]">
                                                {info.OrderCreatedAt ? format(new Date(info.OrderCreatedAt), "yyyy-MM-dd HH:mm:ss") : "--"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{info.CreatedBy || "admin"}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination matching image style */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
                    <p className="text-[11px] text-slate-400 font-medium">
                        Showing page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 disabled:opacity-30 hover:bg-slate-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 disabled:opacity-30 hover:bg-slate-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociateServices;
