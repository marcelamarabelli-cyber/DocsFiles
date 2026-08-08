DOCSFILES — PACKAGE 10

Adds:
1. Tax Preparer Workpad inside each client portal.
   - Tax Preparer Notes
   - Client Follow-Up
   - Final Review Items
   - Priority selector
   - Save confirmation and last-saved timestamp
   - Per-client browser storage
2. DocsFiles/TaxesDeal browser title and metadata.
3. Hydration-warning suppression on the root HTML/body for browser-added theme attributes.

INSTALL ON MAC (from the docsfiles folder):
  unzip -o Package10-Ready.zip
  npm run build
  npm run dev -- --webpack

The package is a direct overlay on Package 9 and keeps existing client data in localStorage.
