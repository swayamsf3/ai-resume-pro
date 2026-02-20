

## Validate Phone Number Input in Resume Builder

### Problem
The phone number field in the Resume Builder form currently accepts any text. It should only accept a format like `+XX XXXXXXXXXX` (a `+` symbol, 2-digit country code, and 10-digit number).

### Changes

**`src/components/builder/ResumeForm.tsx`**
- Replace the plain `Input` for the phone field with a validated input that:
  - Restricts typing to only digits and the `+` symbol
  - On change, strips any characters that are not digits or `+`
  - On blur (when the user leaves the field), validates the format: must match `+XX XXXXXXXXXX` or `+XXXXXXXXXXXX` (with or without space after country code)
  - Shows an error message below the field if the format is invalid (e.g., "Enter a valid phone: +91 9876543210")
  - Updates the placeholder to `+91 9876543210` to clarify the expected format
- Add a small validation state (`phoneError`) to show/hide the error message
- The regex pattern used: `/^\+\d{2}\s?\d{10}$/`

### What stays the same
- All other form fields and sections
- Resume data structure (phone remains a string)
- Preview rendering of the phone number

