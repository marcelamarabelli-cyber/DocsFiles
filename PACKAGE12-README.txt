DocsFiles Package 12
====================

Adds the Client Delivery & Completion Center.

New workflow features:
- Final handoff stage tracker: Ready to File -> Filed -> Client Delivered -> Completed
- Delivery method (Client Portal, Email, Printed Copy, In Person)
- Recipient and delivery date fields
- Client notification confirmation
- Invoice/payment settled confirmation
- File archive completion confirmation
- Delivery/completion notes
- Per-client saved handoff record with timestamp
- Activity Timeline entry when the handoff record is saved

Placement:
The new Client Delivery & Completion Center appears after the Filing & Delivery Center and before the Activity Timeline in the Client Portal.

Testing:
1. npm run build
2. npm run dev -- --webpack
3. Open a client portal
4. Scroll below Filing & Delivery Center
5. Fill a test delivery record, save it, refresh, and confirm it persists
