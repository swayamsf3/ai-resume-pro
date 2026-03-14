

# Plan: Contact Us Page

## What it does
A public "Contact Us" page with a form for users to submit help/support requests, plus contact info and FAQ-style guidance.

## Changes

### 1. New file: `src/pages/Contact.tsx`
- Uses existing Header/Footer layout pattern (same as Index page)
- Contact form with fields: Name, Email, Subject, Message
- Client-side validation with toast feedback on submit (stores locally or shows success since no backend email is set up yet)
- Contact info section with email address and support hours
- Styled consistently with the existing design system (cards, gradients, etc.)

### 2. `src/App.tsx`
- Add route: `<Route path="/contact" element={<Contact />} />`
- Import the new Contact page

### 3. `src/components/layout/Footer.tsx`
- Wire the existing empty "Contact" link to `/contact`

### Files Changed
- New: `src/pages/Contact.tsx`
- Edit: `src/App.tsx` — add route
- Edit: `src/components/layout/Footer.tsx` — link to /contact

