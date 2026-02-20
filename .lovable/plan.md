

## Restrict Phone Input Length Without Country Code

### Change

**`src/components/builder/ResumeForm.tsx`**

Update `handlePhoneChange` to enforce a max length based on whether the input starts with `+`:
- If input starts with `+`: allow up to 13 characters (e.g. `+91 9876543210`)
- If input does NOT start with `+`: limit to 10 digits only

Update `validatePhone` to accept both formats:
- With country code: `/^\+\d{2}\s?\d{10}$/` (existing)
- Without country code: `/^\d{10}$/` (new)

### Technical Detail

```text
const handlePhoneChange = (value: string) => {
  const sanitized = value.replace(/[^\d+\s]/g, "");
  // If no country code, limit to 10 digits
  if (!sanitized.startsWith("+")) {
    const digitsOnly = sanitized.replace(/\D/g, "");
    if (digitsOnly.length > 10) return; // block further input
  }
  updatePersonalInfo("phone", sanitized);
  if (phoneError) setPhoneError("");
};

const validatePhone = (value: string) => {
  if (!value.trim()) { setPhoneError(""); return; }
  const withCode = /^\+\d{2}\s?\d{10}$/;
  const withoutCode = /^\d{10}$/;
  if (!withCode.test(value.trim()) && !withoutCode.test(value.trim())) {
    setPhoneError("Enter valid phone: +91 9876543210 or 9876543210");
  } else {
    setPhoneError("");
  }
};
```

### What stays the same
- All other form fields, resume data structure, and preview rendering
