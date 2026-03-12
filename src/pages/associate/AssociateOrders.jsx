import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Eye, FileText, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { getSecureItem } from '../../utils/secureStorage';
import { format, differenceInDays } from 'date-fns';
import { initPayment, listOrders } from '../../api/Orders/Order';
import { useNavigate } from 'react-router-dom';

const AssociateOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [payingOrderId, setPayingOrderId] = useState(null);

    const pageSize = 10;

    const navigate = useNavigate();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const AssociateID = user.id || localStorage.getItem("AssociateID");

            const response = await listOrders({
                isAssociate: true,
                AssociateID: AssociateID,
                limit: pageSize,
                page: currentPage,
                search: searchTerm
            });

            console.log("response", response);


            if (response.success) {
                setOrders(response.data);
                setTotalOrders(response.total);
            }
        } catch (err) {
            console.error("fetchOrders error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchOrders();
        }
    };

    const getAgeing = (date) => {
        if (!date) return 0;
        return differenceInDays(new Date(), new Date(date));
    };



    const handlePayBalance = async (order) => {
        console.log("Paying balance for:", order.OrderID);

        try {
            setPayingOrderId(order.OrderID); // ✅ Start loading

            const servicePayment = (order.ServiceDetails || []).map((service) => ({
                serviceId: service.ServiceID || service.serviceId,
                vendorFee: Number(service.VendorFee || 0),
                professionalFee: Number(service.ProfessionalFee || service.ProfFee || 0),
                contractorFee: Number(service.ContractorFee || 0),
                govFee: Number(service.GovtFee || 0),
                gst: Number(service.GstAmount || service.GST || 0),
                pendingAmount: Number(order.PendingAmount || 0)
            }));

            const totalPendingAmount = servicePayment.reduce(
                (sum, service) => sum + Number(service.pendingAmount || 0),
                0
            );

            const payload = {
                QuoteID: order.QuoteID,
                totalAmount: Number(totalPendingAmount.toFixed(2)),
                govFee: Number(order.GovtFee || 0),
                vendorFee: Number(order.VendorFee || 0),
                contractorFee: Number(order.ContractorFee || 0),
                profFee: Number(order.ProfessionalFee || 0),
                customer: {
                    name: order.CustomerName || "Customer",
                    email: order.CustomerEmail || order.Email || "test@example.com",
                    phone: order.CustomerPhone || order.Phone || "9999999999"
                },
                servicePayment,
                StateID: order.StateID || 0,
                IsInternal: order.IsInternal || 0
            };

            const response = await initPayment(payload);

            if (response.success && response.paymentUrl) {
                window.open(response.paymentUrl, "_blank", "noopener,noreferrer");
            }

        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setPayingOrderId(null); // ✅ Stop loading
        }
    };


    const calculateFees = (services) => {
        if (!services || !Array.isArray(services)) return { prof: 0, cont: 0, vend: 0, govt: 0, cgst: 0, sgst: 0, igst: 0, gst: 0 };
        return services.reduce((acc, s) => {
            acc.prof += Number(s.ProfessionalFee || s.ProfFee || 0);
            acc.cont += Number(s.ContractorFee || 0);
            acc.vend += Number(s.VendorFee || 0);
            acc.govt += Number(s.GovtFee || 0);
            acc.gst += Number(s.GstAmount || s.GST || 0);
            acc.cgst += Number(s.CGST || 0);
            acc.sgst += Number(s.SGST || 0);
            acc.igst += Number(s.IGST || 0);
            return acc;
        }, { prof: 0, cont: 0, vend: 0, govt: 0, cgst: 0, sgst: 0, igst: 0, gst: 0 });
    };

    const totalPages = Math.ceil(totalOrders / pageSize);

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Orders</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track all associate orders</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={fetchOrders} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#4b49ac] text-white rounded-xl text-sm font-medium hover:bg-[#3f3e91] transition-colors">
                        Search
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider font-semibold text-slate-500">
                                <th className="px-4 py-4 text-center">S.No</th>
                                <th className="px-4 py-4">Order ID</th>
                                <th className="px-4 py-4">Order Date</th>
                                <th className="px-4 py-4">Order CRE</th>
                                <th className="px-4 py-4">Company Name</th>
                                <th className="px-4 py-4">Primary Customer</th>
                                <th className="px-4 py-4">Order Status</th>
                                <th className="px-4 py-4 text-center">Ageing (Days)</th>
                                {/* <th className="px-4 py-4 text-right">Professional Fee</th>
                                <th className="px-4 py-4 text-right">Contractor Fee</th>
                                <th className="px-4 py-4 text-right">Vendor Fee</th>
                                <th className="px-4 py-4 text-right">Govt Fee</th>
                                <th className="px-4 py-4 text-right">CGST %</th>
                                <th className="px-4 py-4 text-right">SGST %</th>
                                <th className="px-4 py-4 text-right">IGST %</th>
                                <th className="px-4 py-4 text-right">Discount</th> */}
                                <th className="px-4 py-4 text-right font-bold">Amount Paid</th>
                                <th className="px-4 py-4 text-center">Activation</th>
                                <th className="px-4 py-4">Order Type</th>
                                <th className="px-4 py-4">Created On</th>
                                <th className="px-4 py-4">Updated On</th>
                                <th className="px-4 py-4">Created By</th>
                                {/* <th className="px-4 py-4 text-right">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="23" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#4b49ac]" />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="23" className="px-6 py-12 text-center text-slate-400">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => {
                                    console.log("sss", order.PendingAmount);

                                    const fees = calculateFees(order.ServiceDetails);
                                    const pendingAmount = Number(order.PendingAmount || 0);

                                    return (
                                        <tr key={order.OrderID} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 text-center text-slate-400">
                                                {(currentPage - 1) * pageSize + index + 1}
                                            </td>

                                            <td
                                                className="px-4 py-4 font-bold text-[#4b49ac] hover:underline cursor-pointer whitespace-nowrap"
                                                onClick={() => navigate(`/associate/orders/${order.OrderID}`)}
                                            >
                                                {order.OrderCodeId || `--`}
                                            </td>

                                            <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                                                {order.OrderCreatedAt
                                                    ? format(new Date(order.OrderCreatedAt), "dd/MM/yyyy")
                                                    : "--"}
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {order.QuoteCRE_EmployeeName || "admin"}
                                            </td>

                                            <td className="px-4 py-4 text-blue-600 font-medium hover:underline cursor-pointer">
                                                {order.CompanyName}
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {order.CustomerName}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-[10px] font-bold ${order.OrderStatus === "Completed"
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-blue-50 text-blue-600 border border-blue-100"
                                                        }`}
                                                >
                                                    {order.OrderStatus || "In Progress"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-center font-medium text-slate-600">
                                                {getAgeing(order.OrderCreatedAt)}
                                            </td>

                                            {/* <td className="px-4 py-4 text-right text-slate-600">
                                                ₹{fees.prof.toLocaleString()}
                                            </td>

                                            <td className="px-4 py-4 text-right text-slate-600">
                                                ₹{fees.cont.toLocaleString()}
                                            </td>

                                            <td className="px-4 py-4 text-right text-slate-600">
                                                ₹{fees.vend.toLocaleString()}
                                            </td>

                                            <td className="px-4 py-4 text-right text-slate-600">
                                                ₹{fees.govt.toLocaleString()}
                                            </td>

                                            <td className="px-4 py-4 text-right text-slate-500">
                                                {(fees.cgst || 0).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-4 text-right text-slate-500">
                                                {(fees.sgst || 0).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-4 text-right text-slate-500">
                                                {(fees.igst || 0).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-4 text-right text-red-500">
                                                ₹{(order.Discount || 0).toLocaleString()}
                                            </td> */}

                                            <td className="px-4 py-4 text-right font-bold text-slate-800">
                                                ₹{(order.ReceivedAmount || 0).toLocaleString()}
                                            </td>

                                            {/* ✅ Pending Amount + Pay Balance Button */}
                                            <td className="px-4 py-4 text-center">
                                                {pendingAmount > 0 && (
                                                    <button
                                                        onClick={() => handlePayBalance(order)}
                                                        disabled={payingOrderId === order.OrderID}
                                                        className="px-3 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition disabled:opacity-70 flex items-center gap-1"
                                                    >
                                                        {payingOrderId === order.OrderID ? (
                                                            <>
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            "Pay Balance"
                                                        )}
                                                    </button>
                                                )}
                                            </td>


                                            <td className="px-4 py-4 text-center">
                                                <span className="text-slate-400">1/1</span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[9px] font-medium ${!order.IsIndividual
                                                        ? "bg-purple-50 text-purple-600"
                                                        : "bg-slate-50 text-slate-600"
                                                        }`}
                                                >
                                                    {order.IsIndividual ? "Individual" : "Package"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-slate-400">
                                                {order.OrderCreatedAt
                                                    ? format(new Date(order.OrderCreatedAt), "dd/MM/yyyy")
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-4 text-slate-400">
                                                {order.OrderUpdatedAt
                                                    ? format(new Date(order.OrderUpdatedAt), "dd/MM/yyyy")
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-4 text-slate-500">
                                                {order.CreatedBy || "-"}
                                            </td>
                                        </tr>
                                    );
                                })

                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Showing page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === i + 1 ? 'bg-[#4b49ac] text-white' : 'hover:bg-slate-50 text-slate-600 border border-slate-200'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssociateOrders;
