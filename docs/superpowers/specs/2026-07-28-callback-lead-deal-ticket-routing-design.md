# Call-Back Request Routing: Lead / Deal / Support Ticket

**Date:** 2026-07-28
**Repos involved:** `Bizpole-One-Customer` (customer-facing frontend), `Bizpole-One-Server` (backend API)
**Status:** Approved design, ready for implementation planning

## 1. Overview

Today, selecting "Call back request" as a category on the customer portal's "Raise a Support Ticket" form (`src/pages/SupportTickets.jsx`) always creates a generic `support_tickets` row with `Category = 'callback'`. There is no distinction between:

- A brand-new visitor who wants to talk to someone about a service they don't have yet.
- An existing client who wants to buy an additional/different service.
- An existing client who has an issue with a service they already purchased.

This design routes a call-back request to the correct backend record type — a **Lead**, a **Deal**, or a **Support Ticket** — based on the caller's real relationship with Bizpole, with a follow-up scheduled in each case.

## 2. Background — what already exists

Both the Lead and Deal subsystems are fully built on the backend and used today by the internal staff app (`Bizpole-One-Client`) and the associate/partner portal (`src/pages/associate/*` inside `Bizpole-One-Customer`). **Neither is currently called from the logged-in customer portal** — this feature is the first customer-facing usage of either.

| Concept | Table(s) | Key existing endpoint(s) | Existing follow-up mechanism |
|---|---|---|---|
| Lead | `leads`, `lead_services` | `POST /lead-generation/createLead` | `POST /lead-generation/followup/create` → `lead_followups` |
| Deal | `deals`, `deal_pricing_master`, `deal_services` | `POST /deals/insert` (lenient, no fee floor) or `POST /lead-generation/convert-to-deal` (hard-rejects ₹0 deals) | `POST /deal-followup/create` → `deal_followups` |
| Support Ticket | `support_tickets` | `POST /website/support-tickets` (already wired to `SupportTickets.jsx`) | **None** — no follow-up table exists for tickets today |

Also already available and reused by this design:
- `assignCustomer` (`POST /assignCustomer`) — BDE round-robin franchisee/agent assignment, already used by `Tellabout.jsx` during onboarding. Reused here to resolve `franchiseId`/`employeeId` for a new Lead.
- `ServicesApi.getServices()`, `ServicesApi.getServicePackages()`, `ServicesApi.getServicePrice()` / `getServicePriceCurrency()` — the services/packages catalog and pricing lookups already used by `Services.jsx` and `GlobalCart.jsx` to build cart line items (`ProfessionalFee`, `VendorFee`, `GovernmentFee`, `ContractFee`, `GstAmount`).
- `Order.js`'s `getPackageOrders()` / `getIndividualOrders()` — already-existing helpers (thin wrappers over `getAllOrdersByCompany` with `IsIndividual: true/false`) that filter a company's own purchased orders.
- `getCompanyIdFromStorage()` (mirrored in `Orders/Order.js`, `Refund/Refund.js`, `SupportTickets/SupportTicket.js`) — resolves the logged-in customer's active `CompanyID` from secure storage, returning `null` if none exists.

## 3. Goals / Non-Goals

**Goals:**
- Route a call-back request to a Lead, Deal, or Support Ticket automatically based on real account/purchase data, minimizing extra questions to the customer.
- For the "new service" branches (Lead/Deal), capture real service pricing rather than a placeholder value.
- For the "existing service" branch, let the customer pick from their own purchased Packages or Individual services (not a flat mixed list).
- Schedule a follow-up in every branch.

**Non-Goals (deferred):**
- Building a new follow-up subsystem for Support Tickets (see §7).
- A standalone "does this phone/email already exist as a Customer" check endpoint — not needed here since detection is quote-based, not identity-based.
- Any change to the staff-facing (`Bizpole-One-Client`) or associate-facing Lead/Deal UIs — this design only adds a new caller of existing endpoints.

## 4. Decision Flow

```
Customer selects "Call back request" category
        │
        ▼
Step 1 — auto-detect client status (no question asked):
  companyId = getCompanyIdFromStorage()
  hasQuote  = companyId ? (quote count for companyId > 0) : false
        │
        ├── hasQuote == false  →  "new user"
        └── hasQuote == true   →  "existing client"
        │
        ▼
Step 2 — ask the customer: "Is this about a new service, or a service you already have?"
        │
        ├── existing service ─────────────────────────────► Branch C: Support Ticket
        │
        └── new service
              │
              ├── new user        ────────────────────────► Branch A: Lead
              └── existing client ────────────────────────► Branch B: Deal
```

Step 2 must be asked explicitly — purpose cannot be inferred from account data alone (an existing client may want either a new service or help with an old one).

Alongside Step 2, the form also collects a **preferred call-back date/time and an optional note** — this is the one field shared by all three branches, and is the source of the `followUpDate`/`remark` passed to the Lead/Deal follow-up calls in §5–§6, and of the note appended to the ticket's `Description` in §7.

## 5. Branch A — Lead (new user, new service)

1. Collect: name, mobile, email, state, preferred language, and the service they're interested in (Package or Individual, selected from the catalog via `ServicesApi.getServicePackages()` / `getServices()`).
2. Call `assignCustomer({ language, state, district })` → resolves `{ franchiseeId, agent }`, same call `Tellabout.jsx` already makes.
3. `POST /lead-generation/createLead` with `{ name, state, mobile, email, proposed_service, preferred_language, lead_source: 'callback', franchiseeId, employeeId }`.
4. `POST /lead-generation/followup/create` with `{ leadId, followUpDate, remark }` to schedule the call back.

Server-side dedup (advisory lock on mobile/email in `insertLead`) already prevents duplicate leads from a resubmitted form.

## 6. Branch B — Deal (existing client, new service)

1. Customer picks Package or Individual, then the specific service/package from the catalog — same UI pattern as Branch C's picker, but sourced from the sellable catalog instead of the customer's own orders.
2. Fetch the real price for that service via `getServicePrice`/`getServicePriceCurrency` (state comes from the customer's company record), and compute the same fee breakdown `Services.jsx`/`GlobalCart.jsx` already compute (`ProfessionalFee`, `VendorFee`, `GovernmentFee`, `ContractFee`, `GstAmount`).
3. Map that into the shape `insertDeal` expects for one service line:
   ```
   { serviceId, serviceName, professionalFee, vendorFee, contractorFee, govtFee, gstPct, total, packageId, packageName, billingPeriod, dealType }
   ```
4. `POST /deals/insert` with `{ name, state, mobile, email, franchiseId, employeeId, sourceOfSale: 'callback', dealType, services: [thatLine], CompanyID, CustomerID }`, reusing the customer's existing `CompanyID`/`CustomerID` (no new Customer/Company created) and `franchiseId`/`employeeId` resolved from the company's existing franchise record.
   - **Explicitly not** using `POST /lead-generation/convert-to-deal` — it hard-rejects deals with a ₹0 total, which would force a fake placeholder fee. `/deals/insert` has no such floor and already accepts existing `CompanyID`/`CustomerID` directly, so real pricing flows in cleanly with no workaround.
5. `POST /deal-followup/create` with `{ dealId, followUpDate, remark }` to schedule the call back.

## 7. Branch C — Support Ticket (existing service)

This branch is mostly today's existing flow (`createCustomerSupportTicket`), with one frontend change to `SupportTickets.jsx`'s order-picker:

1. Ask **Package or Individual service** first.
2. Show a dropdown filtered accordingly using the already-existing `getPackageOrders()` (Package) or `getIndividualOrders()` (Individual) — both thin wrappers over `getAllOrdersByCompany({ IsIndividual })`. No backend change needed for this part.
3. Submit as today via `createSupportTicket({ category: 'callback', orderId, quoteId, subject, description, priority })`.

**Follow-up gap:** `support_tickets` has no follow-up table (unlike Lead/Deal). Rather than building a new follow-up subsystem to match, this design stores the requested call-back note/preferred time directly in the ticket's existing `Description` field and relies on the existing ticket assignment/status workflow (`AssignedTo`, `Status`) for staff to action it. This can be revisited later if a dedicated ticket follow-up mechanism becomes worth building — noted as a deferred item, not a blocker.

## 8. Backend Changes Required

1. **New: quote-existence check.** No existing endpoint answers "does Company X have ≥1 Quote row" (`getLatestQuotesController` only filters by `FranchiseeID`/`EmployeeID`/etc., never `CompanyID`; the only `CompanyID`-scoped Quote query is buried inside `upsertQuote` and also requires a `CustomerID`). Add a small endpoint, e.g. `GET /quote/company/:companyId/exists` → `{ success: true, hasQuote: boolean }`, backed by `SELECT COUNT(*) FROM Quote WHERE CompanyID = ?`.
2. No other backend changes needed — `createLead`, `insertDeal`, `createFollowUpController`/`createDealFollowUpController`, and `createCustomerSupportTicket` are all reused as-is.

## 9. Frontend Changes Required (Bizpole-One-Customer)

1. `SupportTickets.jsx`: when `category === 'callback'` is selected, reveal the Step 2 question ("new service" vs "existing service") and branch the rest of the form accordingly instead of always rendering the ticket-only fields.
2. New API helpers: quote-existence check, Lead creation + follow-up, Deal creation + follow-up (thin wrappers mirroring the existing `SupportTicket.js`/`Refund.js` API module pattern).
3. Package/Individual catalog picker component, reused by both Branch B (catalog-sourced) and Branch C (own-orders-sourced) with a `source` prop to switch data fetchers.
4. Pricing computation for Branch B, extracted/reused from the existing logic in `Services.jsx`/`GlobalCart.jsx` rather than duplicated.

## 10. Error Handling

- Quote-existence check failure (network/5xx): treat as "new user" (fail toward the Lead branch, since round-robin lead dedup already guards against creating a duplicate downstream if the customer actually is an existing client — worst case, staff merges it).
- `assignCustomer` failure (Branch A): surface a form error and block submission, same as `Tellabout.jsx`'s existing handling.
- `/deals/insert` or `/lead-generation/createLead` failure: surface the server's error message in the modal, same pattern as the existing `createSupportTicket`/`createCustomerRefund` error handling (`err?.response?.data?.message || err?.message`).
- Follow-up creation failure after a successful Lead/Deal/Ticket creation: non-fatal — log and still report success to the customer (the record exists; a missed follow-up reminder is recoverable by staff, a lost Lead/Deal/Ticket is not).

## 11. Testing Plan

No automated test framework exists in either repo currently (confirmed: no `test` script in `Bizpole-One-Customer/package.json`). Verification will be manual:
- Simulate all three branches end-to-end against a local server (new user → Lead appears in staff app; existing client → Deal appears with correct pricing in `deal_pricing_master`; existing service → Support Ticket appears as today).
- Confirm the new quote-existence endpoint returns correct booleans for a company with 0 and ≥1 quotes.
- Confirm `/deals/insert` payload round-trips real pricing (not a placeholder) into `deal_pricing_master`.

## 12. Open Items / Future Work

- Ticket follow-up subsystem (deferred, see §7).
- Whether the Lead/Deal catalog picker should also show pricing before submission (a quote-like preview) or only after — not yet decided, low-risk to defer to implementation.
