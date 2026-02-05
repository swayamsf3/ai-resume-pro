
# Fix PDF Generation, Blur Issues & Integrate Real AI

## Problems to Solve

### 1. Content Getting Cut Off in PDF (Certifications Missing)
The preview container has `overflow-hidden` and `maxHeight: 900px` which clips content before `html2canvas` can capture it.

### 2. Blurry PDF Output
Current `scale: 2` is insufficient for crisp text at small font sizes. Need to increase to `scale: 3` or higher.

### 3. Multi-Page Support Needed
When content exceeds one A4 page, it should flow naturally to page 2 instead of being cut off.

### 4. AI Generate Buttons Not Working
Currently using mock `setTimeout` instead of real AI. Need to integrate with Gemini via edge function.

---

## Technical Solution

### Part 1: Fix PDF Generation

**File: `src/components/builder/ResumePreview.tsx`**

**Changes:**

1. **Increase canvas scale** from `2` to `3` for sharper text
2. **Create temporary full-height container** for PDF capture:
   - Clone the resume element
   - Remove all height constraints (`maxHeight`, `overflow-hidden`)
   - Append to body off-screen
   - Capture full content with `html2canvas`
   - Clean up temporary element

3. **Fix multi-page slicing logic**:
   - Calculate proper A4 page height in pixels
   - For each page, create a new canvas slice
   - Add each slice as a separate PDF page

```text
CURRENT FLOW (Broken):
┌─────────────────────────────┐
│  Preview Container          │
│  maxHeight: 900px           │
│  overflow: hidden           │
│  ─────────────────────────  │
│  Name                       │
│  Skills                     │
│  Projects                   │
│  Education                  │
│  .........................  │ ← Content cut off here
│  Certifications (CLIPPED)   │
└─────────────────────────────┘
         ↓ html2canvas
   Only captures visible area
         ↓
   PDF missing certifications


NEW FLOW (Fixed):
1. Clone resume element
2. Remove height constraints on clone
3. Append off-screen (left: -9999px)
4. html2canvas captures FULL height
5. Slice canvas into A4 pages
6. Each slice = new PDF page
7. Clean up clone
```

### Part 2: Create AI Edge Function

**New File: `supabase/functions/generate-resume-content/index.ts`**

**Configuration:**
- Uses Gemini API via Lovable's built-in `GEMINI_API_KEY`
- Two modes: `summary` and `project`
- Strict word limits enforced in system prompts

**Request Format:**
```typescript
{
  type: "summary" | "project",
  data: {
    // For summary:
    fullName: string,
    skills: string[],
    experience: Array<{ position: string, company: string }>
    
    // For project:
    name: string,
    technologies: string
  }
}
```

**Response Format:**
```typescript
{
  content: string  // The generated text
}
```

**System Prompts:**

For Summary (35 word limit):
```
You are a professional resume writer. Generate a compelling professional 
summary in EXACTLY 30-35 words. Be concise, impactful, and focus on 
value proposition. Do NOT use first person pronouns. Do NOT exceed 35 words.
```

For Project Description (~50 words):
```
Generate 3-4 concise bullet points for a resume project description.
Each bullet: 10-15 words max, starts with action verb.
Focus on: what was built, technologies used, impact/results.
Total output: 40-50 words maximum.
Format: Use • character to separate bullets.
```

### Part 3: Update Frontend to Call Edge Function

**File: `src/components/builder/ResumeForm.tsx`**

Replace mock implementations:

```typescript
// Before (mock)
setTimeout(() => {
  const mockSummary = `Results-driven ${name}...`;
  updatePersonalInfo("summary", mockSummary);
}, 1500);

// After (real API)
const response = await fetch(
  `${supabaseUrl}/functions/v1/generate-resume-content`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "summary",
      data: {
        fullName: resumeData.personalInfo.fullName,
        skills: resumeData.skills,
        experience: resumeData.experience.map(e => ({
          position: e.position,
          company: e.company
        }))
      }
    })
  }
);
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/builder/ResumePreview.tsx` | Modify | Fix PDF generation with multi-page support, increase scale to 3 |
| `supabase/functions/generate-resume-content/index.ts` | Create | New edge function for AI content generation |
| `supabase/config.toml` | Modify | Add function configuration |
| `src/components/builder/ResumeForm.tsx` | Modify | Replace mock AI with real API calls |

---

## PDF Fix Details

The key fix in `handleDownload`:

```typescript
const handleDownload = async () => {
  // 1. Create a temporary container for full-height rendering
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '210mm';  // A4 width
  tempContainer.style.background = 'white';
  
  // 2. Clone the resume content
  const clone = resumeRef.current.cloneNode(true) as HTMLElement;
  clone.style.maxHeight = 'none';        // Remove height limit
  clone.style.overflow = 'visible';       // Show all content
  clone.style.height = 'auto';
  
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);
  
  // 3. Capture full height with higher scale for quality
  const canvas = await html2canvas(clone, {
    scale: 3,  // Increased from 2 for sharper text
    useCORS: true,
    backgroundColor: '#ffffff',
    width: clone.scrollWidth,
    height: clone.scrollHeight,  // Full height, not clipped
  });
  
  // 4. Calculate A4 dimensions
  const pdfWidth = 210;  // mm
  const pdfHeight = 297; // mm
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
  // 5. Create PDF with proper page slicing
  const pdf = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 0;
  let page = 0;
  
  while (heightLeft > 0) {
    if (page > 0) pdf.addPage();
    
    // Calculate which portion of canvas to use for this page
    const sourceY = page * (canvas.height * pdfHeight / imgHeight);
    const sourceHeight = Math.min(
      canvas.height - sourceY,
      canvas.height * pdfHeight / imgHeight
    );
    
    // Create a temporary canvas for this page slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourceHeight;
    const ctx = pageCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 
                  0, 0, canvas.width, sourceHeight);
    
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 
                 0, 0, pdfWidth, pdfHeight * (sourceHeight / (canvas.height * pdfHeight / imgHeight)));
    
    heightLeft -= pdfHeight;
    page++;
  }
  
  // 6. Cleanup
  document.body.removeChild(tempContainer);
  
  pdf.save(fileName);
};
```

---

## Expected Outcomes

After implementation:

1. **Certifications Visible**: Full resume content including certifications will be captured in PDF
2. **Crisp Text**: Increased scale (3x) produces sharper, non-blurry text
3. **Multi-Page**: Long resumes automatically flow to page 2, 3, etc.
4. **Real AI**: 
   - Summary button generates 30-35 word professional summaries
   - Project button generates concise bullet-point descriptions
5. **Word Limits**: AI strictly enforced to produce concise, professional content
