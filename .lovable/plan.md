
## Fix: PDF Content Cut Off - Proper Multi-Page Pagination

### Problem
The PDF generation captures the full content as a single canvas via html2canvas, but the clone's `scrollHeight` isn't being reliably measured because the temp container uses `position: absolute` which can collapse dimensions. Content beyond page 1 gets cut off.

### Root Cause
Two issues in the `handleDownload` function:
1. The temp container uses `position: absolute` which can cause unreliable height calculation
2. The clone doesn't get explicit width/height forced before html2canvas runs, so the canvas may not capture everything

### Fix (single file: `src/components/builder/ResumePreview.tsx`)

**Changes to the `handleDownload` function (lines 83-114):**

1. **Use `position: fixed`** for the temp container instead of `absolute` - more reliable off-screen rendering
2. **Copy the same padding/box-sizing** from the measurement div onto the clone so layout matches exactly
3. **Wait 300ms** instead of 100ms for fonts/layout to settle
4. **Read `scrollHeight` after append** and set explicit `height` on the clone so html2canvas captures the full content
5. **Pass explicit `width`, `height`, `windowWidth`, `windowHeight`** to html2canvas so it knows the exact dimensions to render

The page-slicing logic (lines 131-170) already works correctly - it creates per-page canvas slices from the full canvas. The only problem is the full canvas not capturing all content.

### Technical Details

Replace lines 83-111 with:

```typescript
// Create a temporary container for full-height rendering
const tempContainer = document.createElement('div');
tempContainer.style.position = 'fixed';
tempContainer.style.left = '-9999px';
tempContainer.style.top = '0';
tempContainer.style.width = `${PAGE_WIDTH_PX}px`;
tempContainer.style.background = 'white';
tempContainer.style.zIndex = '-1';

// Clone the resume content
const clone = element.cloneNode(true) as HTMLElement;
clone.style.position = 'relative';
clone.style.left = '0';
clone.style.maxHeight = 'none';
clone.style.overflow = 'visible';
clone.style.height = 'auto';
clone.style.width = `${PAGE_WIDTH_PX}px`;
clone.style.padding = `${CONTENT_PADDING}px`;
clone.style.boxSizing = 'border-box';
clone.style.color = '#111';
clone.style.background = '#ffffff';

tempContainer.appendChild(clone);
document.body.appendChild(tempContainer);

// Wait for fonts and layout to fully render
await new Promise(resolve => setTimeout(resolve, 300));

// Force explicit height so html2canvas captures everything
const fullHeight = clone.scrollHeight;
clone.style.height = `${fullHeight}px`;

// Render to canvas with explicit dimensions
const canvas = await html2canvas(clone, {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: "#ffffff",
  width: PAGE_WIDTH_PX,
  height: fullHeight,
  windowWidth: PAGE_WIDTH_PX,
  windowHeight: fullHeight,
});
```

### What stays the same
- The page-slicing logic (lines 116-170) is already correct and doesn't need changes
- The Supabase upload logic stays the same
- The preview rendering stays the same

### Expected Result
- Full canvas captures all resume content regardless of length
- Existing slicing logic correctly splits it into A4 pages
- No content cut off on page 2+
