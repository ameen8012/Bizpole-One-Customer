// src/api/upsertQuote.js
import axiosInstance from "./axiosInstance";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

// src/api/upsertQuote.js - Modified version to handle both package and individual quotes
export const upsertQuote = async (plan) => {
  console.log("QUOTE DATA:", { plan });

  let user = null;
  let agentId = null;
  let agentName = "";
  let franchiseeId = null;
  let email = "";
  let SelectedCompany = null;

    // 1) Load user safely
    try {
      const rawUser = getSecureItem("user") || getSecureItem("partnerUser");
      user =
        rawUser && typeof rawUser === "string"
          ? JSON.parse(rawUser)
          : rawUser;
    } catch (e) {
      console.log("error parsing user:", e);
      user = null;
    }

    // 2) Agent / Franchisee / Email
    const firstCompany = user?.Companies?.[0] || null;
    const firstAgent = firstCompany?.Agents?.[0] || null;

    agentId = firstAgent?.EmployeeID || plan.EmployeeID || null;
    agentName = firstAgent?.EmployeeName || "";
    franchiseeId = user?.FranchiseeId || user?.FranchiseeID || plan.FranchiseeID || null;
    email = user?.Email || "";

    // 3) Determine SelectedCompany
    try {
      if (plan?.SelectedCompany?.CompanyID) {
        SelectedCompany = {
          CompanyID: plan.SelectedCompany.CompanyID,
          CompanyName: plan.SelectedCompany.CompanyName || "",
          State: plan.SelectedCompany.State || ""
        };
      } else {
        const rawSelected = getSecureItem("selectedCompany");
        const parsedSelected =
          rawSelected && typeof rawSelected === "string"
            ? JSON.parse(rawSelected)
            : rawSelected;

        if (parsedSelected?.CompanyID) {
          SelectedCompany = {
            CompanyID: parsedSelected.CompanyID,
            CompanyName: parsedSelected.CompanyName || "",
          };
        } else if (user?.Companies?.length > 0) {
          const first = user.Companies[0];
          SelectedCompany = {
            CompanyID: first.CompanyID,
            CompanyName: first.BusinessName || first.CompanyName || "",
          };
        } else {
          SelectedCompany = { CompanyID: null, CompanyName: "" };
        }
      }
    } catch (err) {
      console.log("Error determining SelectedCompany:", err);
      SelectedCompany = { CompanyID: null, CompanyName: "" };
    }

    console.log("FINAL CompanyID:", SelectedCompany?.CompanyID);

    // 4) Build payload - Check if it's individual or package quote
    const isIndividual = plan.IsIndividual === 1;
    
    const payload = {
      ParentQuoteID: null,
      QuoteID: null,
      SelectedCompany: SelectedCompany,
      SelectedCustomer: plan.SelectedCustomer || {
        CustomerID: user?.CustomerID || 2,
        CustomerName: user ? `${user.FirstName || ""} ${user.LastName || ""}`.trim() : "John Doe",
      },
      QuoteCRE: {
        EmployeeID: agentId || plan.EmployeeID || 9,
        EmployeeName: agentName || plan.QuoteCRE?.EmployeeName || "",
      },
      FranchiseeID: franchiseeId || 43,
      SourceOfSale: plan.SourceOfSale || (plan.isAssociate ? "Associate" : "Website"),
      Remarks: plan.Remarks || "Generated from services page",
      IsIndividual: isIndividual ? 1 : 0,
      IsMonthly: isIndividual ? 0 : (plan.IsMonthly || 0),
    is_manual : 0,
      QuoteStatus: plan.QuoteStatus || "Draft",
      IsDirect: plan.IsDirect !== undefined ? plan.IsDirect : 1,
      EmployeeID: plan.EmployeeID || agentId || 9,
      StateService: plan.StateService || SelectedCompany?.State || "",
    };

    // Add package details if it's a package quote
    if (!isIndividual) {
      payload.PackageID = plan.id || plan.packageId;
      payload.PackageName = plan.name || plan.PackageName || plan.packageName;
      // IsMonthly already set above
    }

    // Add service details
    if (isIndividual) {
      // Individual services - use ServiceDetails as provided
      payload.ServiceDetails = plan.ServiceDetails || [];
      
      // Add MailQuoteCustomers if provided
      if (plan.MailQuoteCustomers && plan.MailQuoteCustomers.length > 0) {
        payload.MailQuoteCustomers = plan.MailQuoteCustomers;
      }
    } else {
      // Package services - transform from package format
      payload.ServiceDetails = (plan.services || []).map((s) => ({
        ServiceID: s.ServiceID,
        ItemName: s.ServiceName,
        ProfessionalFee: s.ProfessionalFee != null ? parseFloat(s.ProfessionalFee) : 
                        s.ProfessionalFeeYearly != null ? parseFloat(s.ProfessionalFeeYearly) : 1000,
        VendorFee: s.VendorFee != null ? parseFloat(s.VendorFee) : 
                  s.VendorFeeYearly != null ? parseFloat(s.VendorFeeYearly) : 500,
        GovtFee: s.GovernmentFee != null ? parseFloat(s.GovernmentFee) : 
                s.GovernmentFeeYearly != null ? parseFloat(s.GovernmentFeeYearly) : 200,
        ContractorFee: 0,
        GSTPercent: 18,
        Discount: 0,
        Rounding: 0,
        Total: s.TotalFee != null ? parseFloat(s.TotalFee) : 
               s.TotalFeeYearly != null ? parseFloat(s.TotalFeeYearly) : 1700,
        AdvanceAmount: 500,
        PendingAmount: 1200,
      }));

      payload.MailQuoteCustomers = [
        user?.CustomerID
          ? {
              CustomerID: user.CustomerID,
              CustomerName: `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
              Email: user.Email || email || "john@example.com",
            }
          : {
              CustomerID: 2,
              CustomerName: "John Doe",
              Email: "john@example.com",
            },
      ];
    }

    // Add Associate details if present
    if (plan.isAssociate) {
      payload.isAssociate = plan.isAssociate;
      payload.AssociateID = plan.AssociateID;
    }

    console.log("upsertQuote payload:", payload);

    // 5) API call
    const res = await axiosInstance.post("/upsertQuote", payload);

    // 6) Update stored user quotes (same as before)
    if (res.data?.Quotes && Array.isArray(res.data.Quotes)) {
      try {
        const rawUser = getSecureItem("user") || getSecureItem("partnerUser");
        const storedUser =
          typeof rawUser === "string"
            ? JSON.parse(rawUser)
            : rawUser;

        const targetCompanyId =
          res.data.Quotes[0]?.CompanyID ||
          SelectedCompany?.CompanyID;

        if (storedUser?.Companies && targetCompanyId) {
          storedUser.Companies = storedUser.Companies.map((c) =>
            String(c.CompanyID) === String(targetCompanyId)
              ? { ...c, Quotes: res.data.Quotes }
              : c
          );

          setSecureItem("user", JSON.stringify(storedUser));
        }
      } catch (e) {
        console.log("Failed updating quotes in storage", e);
      }
    }

  return res.data;
};
