import React, { useState } from 'react';
import {
    FileStack, Loader2, AlertCircle, CheckCircle2,
    Save, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { serviceFormSave } from '../../api/Services/ServiceDetails';

// ─── Field ────────────────────────────────────────────────────────────────────
const FormField = ({ field, value, onChange, error }) => {
    const inputBase =
        "w-full px-3.5 py-2.5 text-[12px] font-medium text-slate-700 bg-slate-50 border rounded-xl transition-all outline-none focus:ring-2 focus:ring-[#4b49ac]/20 focus:border-[#4b49ac] focus:bg-white placeholder:text-slate-300";
    const errorClass = error ? "border-red-300 bg-red-50/30" : "border-slate-200";
    const type = (field.FieldType || "Text").toLowerCase();

    if (type === "file") {
        return (
            <div>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer transition-all border-slate-200 bg-slate-50 hover:border-[#4b49ac]/40 hover:bg-[#4b49ac]/5">
                    <div className="flex flex-col items-center gap-1">
                        <Plus className="w-4 h-4 text-slate-300" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {value ? value.name : "Click to upload"}
                        </p>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => onChange(e.target.files[0])} />
                </label>
                {error && <p className="mt-1 text-[10px] text-red-500 font-bold">{error}</p>}
            </div>
        );
    }

    return (
        <div>
            <input
                type={type === "number" ? "number" : type === "date" ? "date" : "text"}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${field.FieldName}`}
                className={`${inputBase} ${errorClass}`}
            />
            {error && <p className="mt-1 text-[10px] text-red-500 font-bold">{error}</p>}
        </div>
    );
};

// ─── Section (single or multiple instances) ───────────────────────────────────
const SectionForm = ({ section, isMultiple, formEntry, onUpdate, onAddInstance, onRemoveInstance }) => {
    const instances = formEntry?.instances || [{}];

    return (
        <div className="space-y-4">
            {instances.map((instance, instIdx) => (
                <div key={instIdx} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                    {isMultiple && (
                        <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 border-b border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry #{instIdx + 1}</p>
                            {instIdx > 0 && (
                                <button
                                    onClick={() => onRemoveInstance(instIdx)}
                                    className="flex items-center gap-1 text-[10px] text-red-400 font-bold hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            )}
                        </div>
                    )}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {section.Fields.map((field) => (
                            <div key={field.FieldID} className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                    {field.FieldName}
                                    {field.IsMandatory === 1 && <span className="text-red-400">*</span>}
                                </label>
                                <FormField
                                    field={field}
                                    value={instance[field.FieldID] || ""}
                                    onChange={(val) => onUpdate(instIdx, field.FieldID, val)}
                                    error={instance[`err_${field.FieldID}`]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {isMultiple && (
                <button
                    onClick={onAddInstance}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#4b49ac]/30 text-[11px] font-black text-[#4b49ac]/70 hover:border-[#4b49ac]/60 hover:text-[#4b49ac] hover:bg-[#4b49ac]/5 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Another Entry
                </button>
            )}
        </div>
    );
};

// ─── Form Group (one item from formConfig[]) ─────────────────────────────────
const FormGroup = ({ item, formData, onFormDataChange, serviceDetails }) => {
    const [expanded, setExpanded] = useState(true);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const handleUpdate = (sectionID, instIdx, fieldID, val) => {
        const key = `${item.Id}_${sectionID}`;
        const existing = formData[key] || { instances: [{}] };
        const newInstances = [...existing.instances];
        newInstances[instIdx] = { ...newInstances[instIdx], [fieldID]: val, [`err_${fieldID}`]: undefined };
        onFormDataChange(key, { instances: newInstances });
        setSaved(false);
        setSaveError(null);
    };

    const handleAddInstance = (sectionID) => {
        const key = `${item.Id}_${sectionID}`;
        const existing = formData[key] || { instances: [{}] };
        onFormDataChange(key, { instances: [...existing.instances, {}] });
    };

    const handleRemoveInstance = (sectionID, instIdx) => {
        const key = `${item.Id}_${sectionID}`;
        const existing = formData[key] || { instances: [{}] };
        onFormDataChange(key, { instances: existing.instances.filter((_, i) => i !== instIdx) });
    };

    // Build the ResponseData.forms array from this item's sections & filled formData
    const buildPayload = () => {
        const forms = item.Sections.map((section) => {
            const key = `${item.Id}_${section.SectionID}`;
            const entry = formData[key] || { instances: [{}] };

            // Use first instance (for non-multiple) or all instances (for multiple)
            // API structure: one form object per section
            const instance = entry.instances[0] || {};

            return {
                FormID: item.FormId,
                SubFormID: item.SubFormId,
                FormBuilderId: item.Id?.toString() || "",
                Sections: [
                    {
                        SectionID: section.SectionID,
                        Fields: section.Fields.map((field) => ({
                            FieldID: field.FieldID,
                            FieldKey: field.FieldName,
                            FieldType: field.FieldType,
                            Value: instance[field.FieldID] ?? "",
                        })),
                    },
                ],
            };
        });

        return {
            CompanyID: serviceDetails?.CompanyID,
            ServiceID: serviceDetails?.ServiceID,
            QuoteID: serviceDetails?.QuoteID,
            OrderID: serviceDetails?.OrderID,
            submittedBy: serviceDetails?.submittedBy,
            ResponseData: { forms },
        };
    };

    const handleSave = async () => {
        // ── Validate mandatory fields ──
        let hasError = false;
        item.Sections.forEach((section) => {
            const key = `${item.Id}_${section.SectionID}`;
            const entry = formData[key] || { instances: [{}] };
            const newInstances = entry.instances.map((inst) => {
                const updated = { ...inst };
                section.Fields.forEach((field) => {
                    if (field.IsMandatory === 1 && !inst[field.FieldID]) {
                        updated[`err_${field.FieldID}`] = "This field is required";
                        hasError = true;
                    }
                });
                return updated;
            });
            onFormDataChange(key, { instances: newInstances });
        });

        if (hasError) return;

        // ── Call API ──
        setSaving(true);
        setSaveError(null);
        try {
            const payload = buildPayload();
            await serviceFormSave(payload);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("serviceFormSave error", err);
            setSaveError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        item.Sections.forEach((section) => {
            onFormDataChange(`${item.Id}_${section.SectionID}`, { instances: [{}] });
        });
        setSaved(false);
        setSaveError(null);
    };

    return (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setExpanded((p) => !p)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4b49ac]/5 to-amber-50/50 border-b border-slate-100 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4b49ac]/10 flex items-center justify-center">
                        <FileStack className="w-3.5 h-3.5 text-[#4b49ac]" />
                    </div>
                    <div>
                        <p className="text-[13px] font-black text-slate-800">{item.SubFormMaster?.SubFormName || 'Form'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.Section}</p>
                    </div>
                    {item.IsMultiple === 1 && (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-700 uppercase tracking-wider border border-amber-200">
                            Multiple Entries
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </button>

            {expanded && (
                <div className="p-6 space-y-6 bg-white">
                    {item.Sections.map((section) => (
                        <div key={section.SectionID}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-4 rounded-full bg-[#4b49ac]/40" />
                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{section.SectionName}</p>
                            </div>
                            <SectionForm
                                section={section}
                                isMultiple={item.IsMultiple === 1}
                                formEntry={formData[`${item.Id}_${section.SectionID}`]}
                                onUpdate={(instIdx, fieldID, val) => handleUpdate(section.SectionID, instIdx, fieldID, val)}
                                onAddInstance={() => handleAddInstance(section.SectionID)}
                                onRemoveInstance={(instIdx) => handleRemoveInstance(section.SectionID, instIdx)}
                            />
                        </div>
                    ))}

                    {/* Save error */}
                    {saveError && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <p className="text-[11px] font-bold text-red-500">{saveError}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-40"
                        >
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[11px] font-black text-white bg-[#4b49ac] hover:bg-[#3d3c8f] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] justify-center"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-3 h-3" /> Save Section
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── DocumentCollectionTab ────────────────────────────────────────────────────
// Props:
//   formConfig        → array   — serviceRes.data from serviceFormMapping API
//   formConfigLoading → boolean — loading state managed in ServiceDetailView
//   serviceDetails    → object  — { CompanyID, ServiceID, QuoteID, OrderID, submittedBy }
//                                 extracted from the service object in ServiceDetailView
// ─────────────────────────────────────────────────────────────────────────────
const DocumentCollectionTab = ({ formConfig, formConfigLoading, serviceDetails }) => {
    const [formData, setFormData] = useState({});

    const handleFormDataChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-[#4b49ac]/5 to-amber-50/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Document Collection</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Fill in the required forms for this service
                            {formConfig && formConfig.length > 0 && ` — ${formConfig.length} form${formConfig.length > 1 ? 's' : ''} to complete`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">In Progress</p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
                {formConfigLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[#4b49ac] mx-auto mb-4" />
                        <p className="text-slate-500 font-medium tracking-tight">Loading document forms...</p>
                    </div>
                ) : !formConfig || formConfig.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                        <FileStack className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="font-medium">No document forms configured for this service.</p>
                    </div>
                ) : (
                    formConfig.map((item) => (
                        <FormGroup
                            key={item.Id}
                            item={item}
                            formData={formData}
                            onFormDataChange={handleFormDataChange}
                            serviceDetails={serviceDetails}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                <p className="text-[10px] text-slate-400 font-bold">Fields marked with * are mandatory</p>
            </div>
        </div>
    );
};

export default DocumentCollectionTab;