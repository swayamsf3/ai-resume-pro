

# Fix Resume Preview: Multi-Page A4 Display in Web App

## Problem Analysis

Looking at your PDF, the content is getting cut off badly because:

1. **Current preview container** has `maxHeight: 900px` and `overflow-hidden` which clips content
2. **No visual page breaks** - users can't see when content flows to page 2
3. **PDF export issues** - the current slicing logic has bugs causing content to look worse

You want the preview to show **stacked A4 pages** (like real paper sheets) when content overflows one page.

---

## Solution: Multi-Page A4 Preview

### New Visual Design

```text
CURRENT (Broken):
┌─────────────────────────┐
│  Single container       │
│  maxHeight: 900px       │
│  overflow: hidden       │
│  ────────────────────   │
│  Content gets           │
│  cut off here...        │
│ ························│ ← Content invisible
└─────────────────────────┘


NEW (Fixed - Stacked A4 Pages):
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │   PAGE 1 (A4)     │  │
│  │   Full content    │  │
│  │   visible...      │  │
│  │                   │  │
│  └───────────────────┘  │
│        ↓ gap             │
│  ┌───────────────────┐  │
│  │   PAGE 2 (A4)     │  │
│  │   Overflow        │  │
│  │   content here    │  │
│  └───────────────────┘  │
│                         │
│  (Scrollable container) │
└─────────────────────────┘
```

### How It Works

1. **Measure content height** after rendering using `useEffect` and `ResizeObserver`
2. **Calculate pages needed** based on A4 ratio (210mm × 297mm)
3. **Display as stacked pages** with visual gaps between them
4. **Show page indicator** (e.g., "Page 1 of 2")
5. **PDF export captures each page** separately with proper slicing

---

## Technical Implementation

### File: `src/components/builder/ResumePreview.tsx`

**Key Changes:**

1. **Remove height constraints** - Let content flow naturally
2. **Add page calculation logic**:
   ```typescript
   const A4_ASPECT_RATIO = 297 / 210; // height / width
   const PAGE_WIDTH = 595; // A4 in pixels at 72 DPI for preview
   const PAGE_HEIGHT = PAGE_WIDTH * A4_ASPECT_RATIO; // ~842px
   ```
3. **Render multiple page containers** visually
4. **Use CSS `clip-path` or positioning** to show correct content per page
5. **Wrap in ScrollArea** for smooth scrolling through pages
6. **Fix PDF generation** to properly slice at page boundaries

### New Component Structure

```typescript
// Calculate total pages based on content height
const [totalPages, setTotalPages] = useState(1);
const contentRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (contentRef.current) {
    const contentHeight = contentRef.current.scrollHeight;
    const pagesNeeded = Math.ceil(contentHeight / PAGE_HEIGHT);
    setTotalPages(Math.max(1, pagesNeeded));
  }
}, [resumeData]);

// Render stacked pages
return (
  <ScrollArea className="h-[800px]">
    <div className="space-y-4 p-4">
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <div 
          key={pageIndex}
          className="bg-white shadow-lg mx-auto"
          style={{ 
            width: '210mm', 
            height: '297mm',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div style={{ 
            position: 'absolute',
            top: `-${pageIndex * PAGE_HEIGHT}px`,
            width: '100%'
          }}>
            {renderTemplate()}
          </div>
        </div>
      ))}
    </div>
    <div className="text-center text-sm text-muted-foreground">
      {totalPages > 1 ? `${totalPages} pages` : '1 page'}
    </div>
  </ScrollArea>
);
```

### PDF Export Fix

The current PDF export has issues with page slicing. Fix:

1. **Use the hidden full-content render** (already implemented)
2. **Fix the canvas slicing math** for accurate page breaks
3. **Ensure white backgrounds** on all pages
4. **Keep scale at 3** for crisp text

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/builder/ResumePreview.tsx` | Complete rewrite of preview logic for multi-page display |

---

## Expected Results

After implementation:

1. **Preview shows stacked A4 pages** - Users see exactly how their resume will print
2. **Content never clips** - Overflow goes to page 2, 3, etc.
3. **Page indicator** - Shows "Page 1 of 2" so users know content is multi-page
4. **Scroll to see all pages** - Vertical scroll through stacked pages
5. **PDF matches preview** - What you see is what you get
6. **Crisp PDF output** - 3x scale for sharp text

