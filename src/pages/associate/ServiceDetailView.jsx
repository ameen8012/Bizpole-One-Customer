import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Loader2, FileText, AlertCircle, CheckCircle2,
    ListChecks, FileStack, LayoutDashboard, History, Target,
    Package, PieChart, Download, Eye, Activity
} from 'lucide-react';
import { getServiceDetailById, getServiceDeliverablesByServiceDetailId, getServiceTasks, serviceFormMapping, serviceFormSave } from '../../api/Services/ServiceDetails';
import { format } from 'date-fns';
import { getSecureItem } from '../../utils/secureStorage';
import jsPDF from 'jspdf';
import DocumentCollectionTab from '../../components/Modals/DocumentationCollectionTab';

// ── Separate component import ──

const ServiceDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Summary');

    const [deliverables, setDeliverables] = useState([]);
    const [deliverablesLoading, setDeliverablesLoading] = useState(false);

    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    // formConfig & its loading state live here, passed as props to DocumentCollectionTab
    const [formConfig, setFormConfig] = useState(null);
    const [formConfigLoading, setFormConfigLoading] = useState(false);

    // ── PDF download helper ──────────────────────────────────────────────────
    const handleDownloadAsPDF = (url, label) => {
        if (!url) return;
        if (url.toLowerCase().endsWith('.pdf')) {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('target', '_blank');
            link.setAttribute('download', `${label || 'document'}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const doc = new jsPDF();
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                canvas.getContext('2d').drawImage(this, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg');
                const imgWidth = doc.internal.pageSize.getWidth();
                const imgHeight = (this.height * imgWidth) / this.width;
                doc.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);
                doc.save(`${label || 'document'}.pdf`);
            };
            img.src = url;
        }
    };

    const mainTabs = [
        { name: 'Summary', icon: LayoutDashboard },
        { name: 'Task Progress', icon: ListChecks },
        { name: 'Document Collection', icon: FileStack },
        { name: 'Deliverables', icon: Package },
    ];

    // ── Fetch service + form mapping (once on mount) ─────────────────────────
    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await getServiceDetailById(id);
                if (response) {
                    setService(response);

                    if (response.ServiceID) {
                        setFormConfigLoading(true);
                        try {
                            const serviceRes = await serviceFormMapping(response.ServiceID);
                            // Handle both { data: [...] } and plain array responses
                            if (serviceRes?.data) {
                                setFormConfig(serviceRes.data);
                            } else if (Array.isArray(serviceRes)) {
                                setFormConfig(serviceRes);
                            }
                        } catch (formErr) {
                            console.error("serviceFormMapping error", formErr);
                        } finally {
                            setFormConfigLoading(false);
                        }
                    }
                }
            } catch (err) {
                console.error("fetchDetails error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    // ── Fetch deliverables (on tab switch) ───────────────────────────────────
    useEffect(() => {
        const fetchDeliverables = async () => {
            if (activeTab !== 'Deliverables' || !id) return;
            setDeliverablesLoading(true);
            try {
                const response = await getServiceDeliverablesByServiceDetailId(id);
                if (response.success) setDeliverables(response.data || []);
            } catch (error) {
                console.error("Error fetching deliverables:", error);
            } finally {
                setDeliverablesLoading(false);
            }
        };
        fetchDeliverables();
    }, [activeTab, id]);

    console.log("SASASA",{id});
    

    // ── Fetch tasks (on tab switch) ──────────────────────────────────────────
    useEffect(() => {
        const fetchTasks = async () => {
            if (activeTab !== 'Task Progress' || !id) return;
            setTasksLoading(true);
            try {
                const user = getSecureItem("partnerUser") || {};
                const response = await getServiceTasks({
                    franchiseId: 1,
                    page: 1,
                    limit: 10,
                    serviceDetailsId: id ,
                });
                if (response.success) setTasks(response.data || []);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setTasksLoading(false);
            }
        };
        fetchTasks();
    }, [activeTab, id]);

    // ── Guards ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                <p className="text-slate-500 font-medium tracking-tight">Accessing service records...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="p-12 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Service Not Found</h2>
                    <p className="text-slate-500 mb-6 font-medium">The service detail you are looking for could not be found or you don't have access.</p>
                    <button
                        onClick={() => navigate('/associate/services')}
                        className="px-6 py-2 bg-amber-400 text-slate-900 rounded-xl font-bold hover:bg-amber-500 transition-colors"
                    >
                        Return to Services
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50/50 min-h-screen">

            {/* ── Sticky Header + Tabs ── */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-[1600px] mx-auto p-4 lg:px-8">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/associate/services')}
                            className="bg-amber-100/50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors border border-amber-200/50"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back to Services
                        </button>
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {mainTabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-[11px] font-bold transition-all whitespace-nowrap border-b-2 ${
                                    activeTab === tab.name
                                        ? 'bg-[#fffbeb] text-[#4b49ac] border-[#4b49ac]'
                                        : 'text-slate-400 border-transparent hover:text-slate-600 bg-slate-50/50 mr-1'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-[1600px] mx-auto p-6 lg:px-8">

                {/* Summary */}
                {activeTab === 'Summary' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <InfoCard icon={<FileText className="w-4 h-4" />} title="Basic Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <DataItem label="Service Detail ID" value={service.ServiceDetailID} />
                                <DataItem label="Service ID" value={service.ServiceDetailID_Link} />
                                <DataItem label="Service Name" value={service.ServiceName} />
                                <DataItem label="Service Type" value={service.ServiceType} />
                                <DataItem label="Item Name" value={service.ItemName} />
                                <DataItem label="Service Status" value={service.ServiceStatus || 'pending'} />
                                <DataItem label="Service Progress %" value={`${service.Progress || '80'}%`} />
                                <DataItem label="Service End Date" value={service.EndDate ? format(new Date(service.EndDate), 'd MMM yyyy') : '-'} />
                                <DataItem label="Connected Order (Order ID)" value={service.OrderID} isLink onClick={() => navigate(`/associate/orders/${service.OrderID}`)} />
                            </div>
                        </InfoCard>

                        <InfoCard icon={<Target className="w-4 h-4" />} title="Parent Order Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <DataItem label="Order Date" value={service.OrderDate ? format(new Date(service.OrderDate), 'dd MMM yyyy HH:mm:ss') : '--'} />
                                <DataItem label="Order Status" value={service.Order_Status || 'pending'} />
                                <DataItem label="Company Name" value={service.CompanyName} isBold />
                                <DataItem label="Customer Name" value={service.PrimaryCustomer} isBold />
                                <DataItem label="Order CRE" value={service.CreatedByName || '-'} />
                                <DataItem label="Order Value" value={service.OrderValue ? `₹${Number(service.OrderValue).toLocaleString()}` : '₹0'} />
                                <DataItem label="Order Payments" value={`₹${(service.OrderPayments || 0).toLocaleString()}`} />
                                <DataItem label="Due Payments" value={`₹${(service.DuePayments || 0).toLocaleString()}`} />
                            </div>
                        </InfoCard>

                        <InfoCard icon={<PieChart className="w-4 h-4" />} title="Activity Collectables and Deliverables">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <PriceItem label="Contractor Fee" value={service.ContractorFee || 0} />
                                <PriceItem label="Professional Fee" value={service.ProfessionalFee || service.ProfFee || 0} />
                                <PriceItem label="Vendor Fee" value={service.VendorFee || 0} />
                                <PriceItem label="Govt. Fee" value={service.GovtFee || 0} />
                                <PriceItem label="GST" value={service.GstAmount || service.GST || 0} />
                                <PriceItem label="CGST %" value={`${service.CGST || '9'}%`} isPercent />
                                <PriceItem label="SGST %" value={`${service.SGST || '9'}%`} isPercent />
                                <PriceItem label="IGST %" value={`${service.IGST || '0.00'}%`} isPercent />
                                <PriceItem label="Discount Received" value={service.Discount || 0} />
                                <PriceItem label="Rounding" value={service.Rounding || 0} />
                                <PriceItem label="Total Service Value" value={service.Total || 0} isTotal />
                            </div>
                        </InfoCard>

                        <InfoCard icon={<LayoutDashboard className="w-4 h-4" />} title="Payment Allocation Summary">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <PriceItem label="Total Allocated" value={service.AdvanceAmount || 0} />
                                <PriceItem label="Pending Allocation" value={service.PendingAmount || 0} />
                            </div>
                        </InfoCard>
                    </div>
                )}

                {/* Task Progress */}
                {activeTab === 'Task Progress' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Task Listing</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Project Milestones</p>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    {tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length} of {tasks.length} tasks completed
                                    ({tasks.length > 0 ? Math.round((tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length / tasks.length) * 100) : 0}%)
                                </p>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${tasks.length > 0 ? (tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length / tasks.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {tasksLoading ? (
                                <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                                    <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">Crunching task data...</p>
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center shadow-sm">
                                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Tasks Found</h3>
                                    <p className="text-slate-400 text-sm font-medium">There are no tasks assigned to this service yet.</p>
                                </div>
                            ) : (
                                tasks.map((task, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-amber-400">
                                        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[15px] font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors mb-3">
                                                    {task.TaskName}
                                                </h4>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${task.IsInternal ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {task.ApprovalType || (task.IsInternal ? 'Internal' : 'External')}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner</p>
                                                        <p className="text-[11px] font-bold text-slate-600 truncate">({task.CompanyName || 'N/A'})</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                                                        <p className="text-[11px] font-bold text-slate-600 italic">
                                                            {task.TimeoutAt && task.TimeoutAt !== '0000-00-00 00:00:00' ? format(new Date(task.TimeoutAt), 'd MMM yyyy') : '—'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                                            (task.status || '').toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-700'
                                                            : (task.status || '').toLowerCase() === 'active' ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {(task.status || '').toLowerCase() === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                            {task.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Document Collection — props passed down, no data logic here */}
                {activeTab === 'Document Collection' && (
                    <DocumentCollectionTab
                        formConfig={formConfig}
                        formConfigLoading={formConfigLoading}
                        serviceDetails={{
                            CompanyID: service?.CompanyID,
                            ServiceID: service?.ServiceID,
                            QuoteID: service?.QuoteID,
                            OrderID: service?.OrderID,
                            submittedBy: service?.submittedBy ?? getSecureItem("partnerUser")?.EmployeeID,
                        }}
                    />
                )}

                {/* Deliverables */}
                {activeTab === 'Deliverables' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Deliverables</h2>
                            <p className="text-xs text-slate-500 font-medium">View and download files delivered for this service</p>
                        </div>
                        <div className="p-0">
                            {deliverablesLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#4b49ac] mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium tracking-tight">Loading deliverables...</p>
                                </div>
                            ) : deliverables.length === 0 ? (
                                <div className="py-20 text-center text-slate-400">
                                    <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                    <p>No deliverables found for this service.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-8 py-4">#</th>
                                                <th className="px-8 py-4">Label</th>
                                                <th className="px-8 py-4">Type</th>
                                                <th className="px-8 py-4">Value</th>
                                                <th className="px-8 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-[12px]">
                                            {deliverables.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-8 py-4 text-slate-400">{idx + 1}</td>
                                                    <td className="px-8 py-4 font-semibold text-slate-700 capitalize">{item.label || 'N/A'}</td>
                                                    <td className="px-8 py-4 text-slate-500 italic">{item.type || 'N/A'}</td>
                                                    <td className="px-8 py-4 text-slate-600">
                                                        {item.type === 'number' ? <span className="font-bold">{item.value}</span> : '-'}
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        {item.type !== 'number' && (
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button
                                                                    onClick={() => window.open(item.value, '_blank')}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-bold text-[10px]"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" /> VIEW
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownloadAsPDF(item.value, item.label)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-bold text-[10px]"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" /> PDF
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-12 opacity-30 flex items-center justify-end">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bizpole Dashboard System</p>
                </div>
            </div>
        </div>
    );
};

// ─── Shared sub-components ────────────────────────────────────────────────────
const InfoCard = ({ icon, title, children }) => (
    <div className="bg-white rounded-2xl border border-amber-200 border-opacity-50 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        <div className="px-6 py-4 bg-amber-50/20 border-b border-amber-100 flex items-center gap-2.5">
            <span className="text-amber-600">{icon}</span>
            <h3 className="text-[13px] font-black text-slate-800 tracking-tight uppercase">{title}</h3>
        </div>
        <div className="p-7 flex-1">{children}</div>
    </div>
);

const DataItem = ({ label, value, isLink, isBold, onClick }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p onClick={onClick} className={`text-[12px] ${isBold ? 'font-bold' : 'font-medium'} ${isLink ? 'text-blue-500 cursor-pointer hover:underline' : 'text-slate-600'}`}>
            {value}
        </p>
    </div>
);

const PriceItem = ({ label, value, isTotal, isPercent }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-[12px] font-bold ${isTotal ? 'text-emerald-600 text-[14px]' : 'text-slate-700'}`}>
            {isPercent ? value : `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        </p>
    </div>
);

export default ServiceDetailView;