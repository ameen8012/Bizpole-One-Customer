import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { getSecureItem } from '../../utils/secureStorage';
import { format } from 'date-fns';
import { listAssociateReceipts, getAssociateReceiptDetails } from '../../api/AssociateApi';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AssociateReceipts = () => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReceipts, setTotalReceipts] = useState(0);
    const pageSize = 10;

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const navigate = useNavigate();

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const user = getSecureItem("partnerUser") || {};
            const AssociateID = user.id || localStorage.getItem("AssociateID");

            const response = await listAssociateReceipts({
                isAssociate: true,
                AssociateID: AssociateID,
                limit: pageSize,
                page: currentPage,
                search: searchTerm,
            });

            console.log("responseLL", response);


            if (response.success) {
                setReceipts(response.data);
                setTotalReceipts(response.total);
            }
        } catch (err) {
            console.error("fetchReceipts error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, [currentPage]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchReceipts();
        }
    };

    const handleViewReceipt = async (paymentId) => {
        setDetailLoading(true);
        setModalOpen(true);
        try {
            const response = await getAssociateReceiptDetails(paymentId);
            if (response.success) {
                setSelectedReceipt(response.data);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const downloadPDF = async (receiptData = null) => {
        const data = receiptData || selectedReceipt;
        if (!data) return;

        // If data is just from the list (missing services), we might want to fetch details first if downloading from list
        // But for "Receipt" button click, we view details first. 
        // For "Download" button in list, we should fetch details first.

        let fullData = data;
        if (!data.services) {
            try {
                const res = await getAssociateReceiptDetails(data.PaymentID);
                if (res.success) fullData = res.data;
            } catch (e) {
                console.error("Error fetching full details for PDF", e);
                return;
            }
        }

        const doc = new jsPDF();

        // Header Background
        doc.setFillColor(255, 193, 7); // Amber/Yellow
        doc.rect(0, 0, 210, 40, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("PAYMENT RECEIPT", 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Official Transaction Record", 14, 28);

        // Receipt ID
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Receipt ID: ${fullData.PaymentID}`, 14, 50);

        // Main Details
        const startY = 60;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        // Row 1
        doc.text("TRANSACTION ID", 14, startY);
        doc.text("TRANSACTION DATE", 110, startY);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(fullData.TransactionID || "N/A", 14, startY + 6);
        doc.text(
            fullData.TransactionDate
                ? format(new Date(fullData.TransactionDate), "dd/MM/yyyy")
                : (fullData.PaymentDate ? format(new Date(fullData.PaymentDate), "dd/MM/yyyy") : "N/A")
            , 110, startY + 6);

        // Row 2
        const row2Y = startY + 20;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("PAYMENT STATUS", 14, row2Y);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text((fullData.PaymentStatus || "").toUpperCase(), 14, row2Y + 6);
        doc.setFont('helvetica', 'normal');

        // Remarks
        const row3Y = row2Y + 20;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("REMARKS", 14, row3Y);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(fullData.Remarks || "No remarks provided", 14, row3Y + 6);

        // Service Breakdown Table
        const tableY = row3Y + 20;
        doc.setFontSize(14);
        doc.setTextColor(245, 158, 11); // Orange
        doc.text("Service Breakdown", 14, tableY);
        doc.line(14, tableY + 2, 14, tableY + 6); // Small vertical bar visual

        const tableColumn = ["Service", "Vendor Fee", "Professional Fee", "Contractor Fee"];
        const tableRows = [];

        if (fullData.services && fullData.services.length > 0) {
            fullData.services.forEach(service => {
                const serviceData = [
                    service.ServiceName || `Service ID: ${service.ServiceID}`,
                    `Rs. ${parseFloat(service.VendorFee || 0).toFixed(2)}`,
                    `Rs. ${parseFloat(service.ProfessionalFee || 0).toFixed(2)}`,
                    `Rs. ${parseFloat(service.ContractorFee || 0).toFixed(2)}`,
                ];
                tableRows.push(serviceData);
            });
        } else {
            // If no specific services found (e.g. lump sum or legacy data), show generic row if needed or leave empty
            // Based on design, it shows "Service Details"
            tableRows.push([
                "Service Details",
                `Rs. ${parseFloat(fullData.VendorFee || 0).toFixed(2)}`,
                `Rs. ${parseFloat(fullData.ProfessionalFee || fullData.ProfFee || 0).toFixed(2)}`,
                `Rs. ${parseFloat(fullData.ContractorFee || 0).toFixed(2)}`,
            ]);
        }

        autoTable(doc, {
            startY: tableY + 10,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [249, 250, 251], textColor: [100, 100, 100], fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 6 },
        });

        // Total Amount at bottom
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: Rs. ${parseFloat(fullData.TotalAmount || 0).toFixed(2)}`, 140, finalY, { align: 'right' });


        doc.save(`Receipt_${fullData.PaymentID}.pdf`);
    };

    const totalPages = Math.ceil(totalReceipts / pageSize);

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Receipts</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track verified payments</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search receipts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={fetchReceipts} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#4b49ac] text-white rounded-xl text-sm font-medium hover:bg-[#3f3e91] transition-colors">
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
                                <th className="px-4 py-4">Payment ID</th>
                                <th className="px-4 py-4">Quote ID</th>
                                <th className="px-4 py-4">Company Name</th>
                                <th className="px-4 py-4 text-right">Total Amount</th>
                                {/* <th className="px-4 py-4 text-right">Gov Fee</th>
                                <th className="px-4 py-4 text-right">Vendor Fee</th>
                                <th className="px-4 py-4 text-right">Contractor Fee</th>
                                <th className="px-4 py-4 text-right">Professional Fee</th> */}
                                <th className="px-4 py-4">Transaction ID</th>
                                <th className="px-4 py-4 text-center">Payment Status</th>
                                <th className="px-4 py-4">Created By</th>
                                <th className="px-4 py-4 whitespace-nowrap">Created At</th>
                                <th className="px-4 py-4 whitespace-nowrap">Transaction Date</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>


                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="15" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#4b49ac]" />
                                            <span>Loading receipts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : receipts.length === 0 ? (
                                <tr>
                                    <td colSpan="15" className="px-6 py-12 text-center text-slate-400">
                                        No receipts found
                                    </td>
                                </tr>
                            ) : (
                                receipts.map((receipt, index) => (
                                    <tr
                                        key={receipt.PaymentID}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-4 py-4 text-center text-slate-400">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>

                                        <td className="px-4 py-4 font-bold text-slate-700">
                                            {receipt.PaymentID}
                                        </td>

                                        <td className="px-4 py-4 text-slate-500">
                                            {receipt.QuoteID}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded-md text-xs">
                                                {receipt.CompanyName || "N/A"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-right font-bold text-slate-800">
                                            ₹{parseFloat(receipt.TotalAmount || 0).toFixed(2)}
                                        </td>

                                        {/* <td className="px-4 py-4 text-right text-slate-600">
                                            ₹{parseFloat(receipt.GovFee || 0).toFixed(2)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-slate-600">
                                            ₹{parseFloat(receipt.VendorFee || 0).toFixed(2)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-slate-600">
                                            ₹{parseFloat(receipt.ContractorFee || 0).toFixed(2)}
                                        </td>

                                        <td className="px-4 py-4 text-right text-slate-600">
                                            ₹{parseFloat(
                                                receipt.ProfessionalFee || receipt.ProfFee || 0
                                            ).toFixed(2)}
                                        </td> */}

                                        <td className="px-4 py-4 text-slate-600">
                                            {receipt.TransactionID}
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-[10px] font-bold ${(receipt.PaymentStatus || "").toLowerCase() === "success"
                                                    ? "text-green-600"
                                                    : "text-orange-600"
                                                    }`}
                                            >
                                                {receipt.PaymentStatus || "pending"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-slate-600">
                                            {receipt.CreatedByName || "N/A"}
                                        </td>

                                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                                            {receipt.PaymentDate
                                                ? format(new Date(receipt.PaymentDate), "dd/MM/yyyy")
                                                : "--"}
                                        </td>

                                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                                            {receipt.TransactionDate
                                                ? format(new Date(receipt.TransactionDate), "dd/MM/yyyy")
                                                : receipt.PaymentDate
                                                    ? format(new Date(receipt.PaymentDate), "dd/MM/yyyy")
                                                    : "--"}
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewReceipt(receipt.PaymentID)}
                                                    className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                                >
                                                    Receipt
                                                </button>

                                                <button
                                                    onClick={() => downloadPDF(receipt)}
                                                    className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                ))
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
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
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
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === i + 1
                                        ? "bg-[#f59e0b] text-white"
                                        : "hover:bg-slate-50 text-slate-600 border border-slate-200"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(totalPages, prev + 1)
                                )
                            }
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>


            {/* Receipt Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-[#fbbf24] p-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wide">Payment Receipts</h2>
                                <p className="text-white/90 text-sm mt-1">Official Transaction Record</p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {detailLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" />
                                    <p className="mt-2 text-slate-500">Loading details...</p>
                                </div>
                            ) : selectedReceipt ? (
                                <div className="space-y-6">
                                    <div className="text-sm text-slate-500">
                                        Receipt ID: {selectedReceipt.PaymentID}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Transaction ID</p>
                                            <div className="bg-white border border-slate-200 rounded px-3 py-2 text-sm font-medium text-slate-700">
                                                {selectedReceipt.TransactionID || "N/A"}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Transaction Date</p>
                                            <div className="font-bold text-lg text-slate-800">
                                                {selectedReceipt.TransactionDate
                                                    ? format(new Date(selectedReceipt.TransactionDate), "M/d/yyyy")
                                                    : (selectedReceipt.PaymentDate ? format(new Date(selectedReceipt.PaymentDate), "M/d/yyyy") : "N/A")}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Payment Status</p>
                                            <div className="font-bold text-lg text-slate-900 capitalize">
                                                {selectedReceipt.PaymentStatus}
                                            </div>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Remarks</p>
                                            <div className="bg-white border border-slate-200 rounded px-3 py-2 text-sm text-slate-600">
                                                {selectedReceipt.Remarks || "No remarks"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Breakdown */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1 h-4 bg-[#d97706] rounded-full"></div>
                                            <h3 className="text-sm font-bold text-slate-700">Service Breakdown</h3>
                                        </div>

                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-slate-500 uppercase">Service</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-right">Vendor Fee</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-right">Professional Fee</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-right">Contractor Fee</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedReceipt.services && selectedReceipt.services.length > 0 ? (
                                                        selectedReceipt.services.map((svc, idx) => (
                                                            <tr key={idx}>
                                                                <td className="px-4 py-3 text-slate-700 font-medium">
                                                                    {svc.ServiceName || `Service ID: ${svc.ServiceID}`}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600">₹{parseFloat(svc.VendorFee || 0).toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-right text-slate-600">₹{parseFloat(svc.ProfessionalFee || 0).toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-right text-slate-600">₹{parseFloat(svc.ContractorFee || 0).toFixed(2)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="px-4 py-3 text-slate-700 font-medium">Service Details</td>
                                                            <td className="px-4 py-3 text-right text-slate-600">₹{parseFloat(selectedReceipt.VendorFee || 0).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right text-slate-600">₹{parseFloat(selectedReceipt.ProfessionalFee || selectedReceipt.ProfFee || 0).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right text-slate-600">₹{parseFloat(selectedReceipt.ContractorFee || 0).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-slate-500">No details available</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => downloadPDF()}
                                className="px-4 py-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssociateReceipts;
