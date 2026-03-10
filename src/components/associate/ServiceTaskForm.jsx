import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Info, Loader2, CheckCircle2, AlertCircle, Layout, Eye } from 'lucide-react';
import { serviceFormSave, updateRejectedFields } from '../../api/Services/ServiceDetails';
import { uploadFile } from '../../api/StorageApi';


const ServiceTaskForm = ({ task, serviceDetails, onClose, onSuccess, responseFields }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | saving | success | error

    const item = task.originalData;
    const sections = item.Sections || [];

    // ── Helper to get previous field data ──
    const getFieldPrevData = (fieldID, fieldName) => {
        const dataArray = Array.isArray(responseFields) ? responseFields : (responseFields?.results || []);
        if (!dataArray || dataArray.length === 0) return null;

        // Loop backwards through response sets to find the most recent submission
        for (let i = dataArray.length - 1; i >= 0; i--) {
            const set = dataArray[i];
            const foundField = set.fields?.find(f =>
                (f.field_id && Number(f.field_id) === Number(fieldID)) ||
                (f.field_key === fieldName)
            );
            if (foundField) return foundField;
        }
        return null;
    };

    // ── Pre-fill data ──
    useEffect(() => {
        const initialData = {};
        sections.forEach(section => {
            section.Fields?.forEach(field => {
                const prevData = getFieldPrevData(field.FieldID, field.FieldName);
                if (prevData) {
                    // Use field_text for files/text, or value_json fallback
                    const val = prevData.field_text || (typeof prevData.value_json === 'string' ? prevData.value_json : "");
                    initialData[`${section.SectionID}_${field.FieldID}`] = val;
                } else if (field.Value) {
                    initialData[`${section.SectionID}_${field.FieldID}`] = field.Value;
                }
            });
        });
        setFormData(initialData);
    }, [sections, responseFields]);

    const isFieldEditable = (fieldID, fieldName) => {
        const prevData = getFieldPrevData(fieldID, fieldName);
        // If never submitted, it's editable. If submitted, only editable if rejected.
        if (!prevData) return true;
        return prevData.reject === 1;
    };

    const hasRejectedFields = sections.some(section =>
        section.Fields?.some(field => {
            const prevData = getFieldPrevData(field.FieldID, field.FieldName);
            return prevData && prevData.reject === 1;
        })
    );

    const hasPreviousSubmission = sections.some(section =>
        section.Fields?.some(field => getFieldPrevData(field.FieldID, field.FieldName))
    );

    const showSubmit = !hasPreviousSubmission || hasRejectedFields;

    const handleFieldChange = (sectionID, fieldID, fieldName, val) => {
        if (!isFieldEditable(fieldID, fieldName)) return;
        setFormData(prev => ({
            ...prev,
            [`${sectionID}_${fieldID}`]: val
        }));
        if (errors[`${sectionID}_${fieldID}`]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[`${sectionID}_${fieldID}`];
                return newErrs;
            });
        }
    };

    const validate = () => {
        let newErrors = {};
        sections.forEach(section => {
            section.Fields.forEach(field => {
                // Only validate editable fields? Usually yes, if it's already there it's fine.
                if (isFieldEditable(field.FieldID) && field.IsMandatory === 1 && !formData[`${section.SectionID}_${field.FieldID}`]) {
                    newErrors[`${section.SectionID}_${field.FieldID}`] = 'Required';
                }
            });
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setStatus('saving');
        console.log("Submitting form with data:", serviceDetails);
        try {
            const finalFormData = { ...formData };

            // Handle file uploads
            for (const key in finalFormData) {
                if (finalFormData[key] instanceof File) {
                    try {
                        const uploadRes = await uploadFile(finalFormData[key]);
                        if (uploadRes.success) {
                            finalFormData[key] = uploadRes.data.url;
                        } else {
                            throw new Error(uploadRes.message || "Upload failed");
                        }
                    } catch (uploadErr) {
                        console.error(`Error uploading file for ${key}:`, uploadErr);
                        throw new Error(`Failed to upload file for ${key}`);
                    }
                }
            }

            const payload = {
                CompanyID: serviceDetails?.CompanyID,
                ServiceID: serviceDetails?.ServiceID,
                QuoteID: serviceDetails?.QuoteID,
                OrderID: serviceDetails?.OrderID,
                submittedBy: serviceDetails?.submittedBy,
                ResponseData: {
                    forms: sections.map(section => ({
                        FormID: item.FormId,
                        SubFormID: item.SubFormId,
                        FormBuilderId: item.Id?.toString() || "",
                        Sections: [{
                            SectionID: section.SectionID,
                            Fields: section.Fields.map(field => {
                                const val = finalFormData[`${section.SectionID}_${field.FieldID}`] || "";
                                const isFile = (field.FieldType || '').toLowerCase() === 'file';
                                const fieldObj = {
                                    FieldID: field.FieldID,
                                    FieldKey: field.FieldName,
                                    FieldType: field.FieldType,
                                    Value: val
                                };
                                if (isFile) {
                                    fieldObj.field_text = val;
                                }
                                return fieldObj;
                            })
                        }]
                    }))
                }
            };


            if (hasPreviousSubmission) {
                // If it's an update to an existing submission (specifically for rejected fields)
                const updates = [];
                sections.forEach(section => {
                    section.Fields.forEach(field => {
                        const editable = isFieldEditable(field.FieldID, field.FieldName);
                        const prevData = getFieldPrevData(field.FieldID, field.FieldName);

                        // Only include fields that are editable (rejected) and actually have previous data to update
                        if (editable && prevData && prevData.fieldRows_id) {
                            const val = finalFormData[`${section.SectionID}_${field.FieldID}`];
                            const isFile = (field.FieldType || '').toLowerCase() === 'file';

                            updates.push({
                                fieldRowsId: prevData.fieldRows_id,
                                value: val,
                                fieldText: isFile ? val : null
                            });
                        }
                    });
                });

                if (updates.length > 0) {
                    await updateRejectedFields({ updates });
                } else {
                    // Fallback to normal save if no specific updates found but we somehow got here
                    await serviceFormSave(payload);
                }
            } else {
                // First-time submission
                await serviceFormSave(payload);
            }

            setStatus('success');
            if (onSuccess) onSuccess();
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Error saving form:", error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{task.title}</h2>
                            <div className="h-1 w-12 bg-amber-400 rounded-full mt-2" />
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="px-10 py-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {status === 'success' ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Form Submitted Successfully!</h3>
                            <p className="text-slate-500">Your information has been saved and is being reviewed.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {sections.map((section) => (
                                <div key={section.SectionID} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        {section.Fields.map((field) => {
                                            const fieldKey = `${section.SectionID}_${field.FieldID}`;
                                            const hasError = !!errors[fieldKey];
                                            const type = (field.FieldType || 'Text').toLowerCase();
                                            const editable = isFieldEditable(field.FieldID, field.FieldName);
                                            const prevData = getFieldPrevData(field.FieldID, field.FieldName);

                                            return (
                                                <div key={field.FieldID} className="space-y-2 group">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[13px] font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                                                            {field.FieldName}
                                                            {prevData && prevData.reject === 1 && (
                                                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-500 text-[10px] rounded-md font-bold uppercase tracking-tighter">
                                                                    <AlertCircle className="w-2.5 h-2.5" /> REJECTED
                                                                </span>
                                                            )}
                                                            {prevData && prevData.verify === 1 && (
                                                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-500 text-[10px] rounded-md font-bold uppercase tracking-tighter">
                                                                    <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                                                                </span>
                                                            )}
                                                        </label>
                                                        <Info className="w-3.5 h-3.5 text-rose-300 group-hover:text-rose-400 cursor-help" />
                                                    </div>

                                                    {type === 'file' ? (
                                                        <div className="relative">
                                                            <label
                                                                className={`flex items-center gap-3 px-5 py-3.5 bg-amber-400 text-slate-900 rounded-xl font-black text-[12px] cursor-pointer hover:bg-amber-500 transition-all shadow-sm hover:shadow active:scale-[0.98] ${hasError ? 'ring-2 ring-rose-300' : ''} ${!editable ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
                                                            >
                                                                <Upload className="w-4 h-4" />
                                                                <span className="truncate max-w-[180px]">
                                                                    {formData[fieldKey] ? (
                                                                        typeof formData[fieldKey] === 'string' ?
                                                                            (formData[fieldKey].split('/').pop() || 'View File') :
                                                                            (formData[fieldKey].name || 'File Selected')
                                                                    ) : 'Upload Files'}
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    disabled={!editable}
                                                                    onChange={(e) => handleFieldChange(section.SectionID, field.FieldID, field.FieldName, e.target.files[0])}
                                                                />
                                                            </label>
                                                            {!editable && formData[fieldKey] && (
                                                                <div className="flex items-center justify-between mt-2 pl-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => window.open(formData[fieldKey], '_blank')}
                                                                        className="text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" /> View Previous File
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                                                                value={formData[fieldKey] || ''}
                                                                disabled={!editable}
                                                                onChange={(e) => handleFieldChange(section.SectionID, field.FieldID, field.FieldName, e.target.value)}
                                                                className={`w-full px-5 py-3.5 bg-white border-2 rounded-2xl text-[13px] font-medium text-slate-700 transition-all outline-none focus:border-amber-400 ${hasError ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100 bg-slate-50/30 focus:bg-white'} ${!editable ? 'bg-slate-50/50 cursor-not-allowed text-slate-400' : ''}`}
                                                                placeholder="Select an option..."
                                                            />
                                                            {type === 'select' && (
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                    <Layout className="w-4 h-4 text-slate-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-[11px] font-bold uppercase tracking-wider ${hasError ? 'text-rose-500' : 'text-slate-300'}`}>
                                                            {hasError ? errors[fieldKey] : (field.IsMandatory === 1 ? 'Required' : 'Optional')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </form>

                {/* Footer */}
                {status !== 'success' && showSubmit && (
                    <div className="px-10 py-8 bg-slate-50/50 flex items-center justify-end gap-4">
                        {status === 'error' && (
                            <p className="flex items-center gap-1.5 text-xs font-bold text-rose-500 mr-auto">
                                <AlertCircle className="w-4 h-4" /> Failed to save
                            </p>
                        )}
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-10 py-3.5 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-400/20 active:scale-95 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ServiceTaskForm;
