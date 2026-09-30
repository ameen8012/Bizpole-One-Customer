import { useState } from "react";
import { useLocation } from "react-router-dom";
import { getSecureItem, setSecureItem, removeSecureItem } from "../utils/secureStorage";
import { signedInContact, cachedCompany, existingCompanyAnswers } from "../utils/applicationPrefill";
import ExistingNeedsMenu from "../components/ExixistingCompany/ExistingNeedsMenu";
import FlowRunner from "../components/ExixistingCompany/FlowRunner";
import "../components/ExixistingCompany/existingco-theme.css";

const SELECTION_KEY = "existingCompanySelection";

const ExisitingCompanies = () => {
  const location = useLocation();
  // From the dashboard: companyId = the company selected in its switcher (to
  // prefill from); resumeFlow = reopen that in-progress application directly.
  const { companyId, resumeFlow } = location.state || {};

  const [selection, setSelection] = useState(() => {
    if (resumeFlow) {
      const next = { flow: resumeFlow, set: {} };
      setSecureItem(SELECTION_KEY, next);
      return next;
    }
    return getSecureItem(SELECTION_KEY);
  });

  const handleSelect = (item) => {
    // Signed-in customer: prefill the company details they already gave us
    // (and their own contact) — the flow's own preset answers still win.
    const prefill = existingCompanyAnswers(cachedCompany(companyId), signedInContact());
    const next = { flow: item.flow, set: { ...prefill, ...(item.set || {}) } };
    setSecureItem(SELECTION_KEY, next);
    setSelection(next);
  };

  const handleExit = () => {
    removeSecureItem(SELECTION_KEY);
    setSelection(null);
  };

  return (
    <div className="exco-theme min-h-screen bg-gray-50">
      {selection ? (
        <FlowRunner key={selection.flow} flowId={selection.flow} initialSet={selection.set} onExit={handleExit} />
      ) : (
        <ExistingNeedsMenu onSelect={handleSelect} />
      )}
    </div>
  );
};

export default ExisitingCompanies;
