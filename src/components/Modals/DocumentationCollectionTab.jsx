import React from 'react';
import {
    FileStack, Loader2, Download, Eye,
    CheckCircle2, AlertCircle, FileText,
    Calendar, Hash, Type, Link as LinkIcon,
    XCircle, Clock
} from 'lucide-react';

const DocumentCollectionTab = ({ responseFields, loading }) => {

    const displaySets = Array.isArray(responseFields) ? responseFields : (responseFields?.results || []);

    // Helper to handle download
    const handleDownload = (url, label) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('target', '_blank');
        link.setAttribute('download', `${label || 'document'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFieldTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'file': return <FileText className="w-4 h-4" />;
            case 'number': return <Hash className="w-4 h-4" />;
            case 'date': return <Calendar className="w-4 h-4" />;
            default: return <Type className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (field) => {
        if (field.verify === 1) {
            return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
            );
        }
        if (field.reject === 1) {
            return (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-wider">
                    <XCircle className="w-3 h-3" /> Rejected
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                <Clock className="w-3 h-3" /> Pending Review
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-[#4b49ac]/5 to-amber-50/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Submitted Documents</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Listing all document responses submitted for this company
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <FileStack className="w-4 h-4 text-[#4b49ac]" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            {displaySets.length} Response Sets
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-8">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[#4b49ac] mx-auto mb-4" />
                        <p className="text-slate-500 font-medium tracking-tight">Loading response fields...</p>
                    </div>
                ) : !displaySets || displaySets.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                        <FileStack className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="font-medium">No document responses found for this company.</p>
                    </div>
                ) : (
                    displaySets.map((set, idx) => (
                        <div key={set.response_set_id || idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20 shadow-sm">
                            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#4b49ac]/10 flex items-center justify-center">
                                        <Hash className="w-4 h-4 text-[#4b49ac]" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-slate-800">Response Set #{set.response_set_id}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {set.submitted_at ? `Submitted on ${new Date(set.submitted_at).toLocaleDateString()}` : 'Date Unknown'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {set.order_id && <span className="text-[10px] text-slate-400 font-bold px-2 py-1 bg-slate-100 rounded-md">Order ID: {set.order_id}</span>}
                                    {set.service_id && <span className="text-[10px] text-slate-400 font-bold px-2 py-1 bg-slate-100 rounded-md">Service ID: {set.service_id}</span>}
                                </div>
                            </div>

                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-6 py-4">Field Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Information / File</th>
                                            {/* <th className="px-6 py-4">Status</th> */}
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {set.fields.map((field, fIdx) => (
                                            <tr key={field.fieldRows_id || fIdx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-[12px] font-bold text-slate-700 capitalize">{field.field_key || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        {getFieldTypeIcon(field.field_type)}
                                                        <span className="text-[11px] font-medium capitalize">{field.field_type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {field.field_type?.toLowerCase() === 'file' ? (
                                                        field.field_text ? (
                                                            <div className="flex items-center gap-2 text-[#4b49ac] hover:underline cursor-pointer group" onClick={() => window.open(field.field_text, '_blank')}>
                                                                <LinkIcon className="w-3.5 h-3.5" />
                                                                <span className="text-[11px] font-bold truncate max-w-[200px]">{field.field_text.split('/').pop()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-300 italic">No file uploaded</span>
                                                        )
                                                    ) : (
                                                        <span className="text-[11px] font-medium text-slate-600">{field.field_text || field.value_json || '-'}</span>
                                                    )}
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    {getStatusBadge(field)}
                                                </td> */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {field.field_type?.toLowerCase() === 'file' && field.field_text && (
                                                            <>
                                                                <button
                                                                    onClick={() => window.open(field.field_text, '_blank')}
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                                                                    title="View Document"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownload(field.field_text, field.field_key)}
                                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
                                                                    title="Download Document"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified documents are marked in green</p>
                </div>
                <p className="text-[10px] text-slate-300 font-bold">Bizpole Document Management</p>
            </div>
        </div>
    );
};

export default DocumentCollectionTab;