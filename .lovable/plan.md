

## Fix: Prevent Future Dates and Enforce Chronological Order in Resume Builder

### Problem
All date fields in the Resume Builder accept future dates and don't enforce that End Date comes after Start Date.

### Solution
Use native HTML `max` and `min` attributes on all `<Input type="month">` fields. No libraries, no backend changes.

### Changes (single file: `src/components/builder/ResumeForm.tsx`)

**Step 1 -- Compute current month (timezone-safe)**

Add this at the top of the `ResumeForm` component:

```js
const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
```

**Step 2 -- Add `max` and `min` to all 5 date inputs**

| Section | Field | `max` | `min` |
|---|---|---|---|
| Experience | Start Date (line 462) | `currentMonth` | -- |
| Experience | End Date (line 470) | `currentMonth` | `exp.startDate` |
| Education | Start Date (line 550) | `currentMonth` | -- |
| Education | End Date (line 558) | `currentMonth` | `edu.startDate` |
| Certifications | Date Obtained (line 718) | `currentMonth` | -- |

**What this achieves:**
- No month input allows selecting a date beyond the current month
- Experience End Date cannot be earlier than its Start Date
- Education End Date cannot be earlier than its Start Date
- All enforced natively by the browser with zero extra code or libraries

