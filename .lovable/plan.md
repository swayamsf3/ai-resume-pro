# Plan: Categorized Skills Sections in Resume Builder

## What Changes

Replace the flat `skills: string[]` with a categorized structure `skillCategories: Array<{ category: string; skills: string[] }>` so skills display in grouped sections like "Languages: Python, C++" and "Data Science: Pandas, NumPy, Matplotlib".

## Data Model Change

`**src/pages/Builder.tsx**` — Update `ResumeData` interface:

```
// Replace:  skills: string[]
// With:
skillCategories: Array<{
  id: string;
  category: string;   // e.g. "Languages", "Data Science", "Tools & Platforms"
  skills: string[];
}>;
```

Keep `skills: string[]` as well for backward compatibility with job matching features, computed as a flat list from all categories.

## Form UI Change

`**src/components/builder/ResumeForm.tsx**` — Replace the Skills tab content:

- Add a "Add Category" button that creates a new category with a name input and its own skill input
- Each category shows: editable category name, skill badges with remove, and an "add skill" input
- Categories can be reordered or deleted
- Predefined category suggestions (Languages, Data Science, Tools & Platforms, etc.) shown as quick-add buttons

## Template Changes (all 4 templates)

Update **ClassicTemplate**, **ModernTemplate**, **ProfessionalTemplate**, **NormalTemplate** to render skills as:

```
SKILLS
Languages: Python, C++
Data Science: Pandas, NumPy, Matplotlib, Seaborn
Tools & Platforms: GitHub, Jupyter Notebook, VS Code
```

Each category on its own line with bold category name followed by comma-separated skills.

## Compatibility

- `**src/hooks/useUserResume.ts**` and `**src/components/jobs/SkillsEditor.tsx**` — These use a flat `skills` array for job matching. The `ResumeData` will compute a flat `skills` getter from all categories, so job matching continues to work unchanged.
- `**src/lib/skillExtractor.ts**` — No changes needed; it extracts flat skills which can be auto-categorized later.
- **localStorage sync** in ResumeForm — Will flatten all category skills for the `builderSkills` key.

## Files Modified

1. `src/pages/Builder.tsx` — Add `skillCategories` to `ResumeData` and initial state
2. `src/components/builder/ResumeForm.tsx` — New categorized skills UI in the Skills tab
3. `src/components/builder/templates/ModernTemplate.tsx` — Render categorized skills
4. `src/components/builder/templates/ClassicTemplate.tsx` — Render categorized skills
5. `src/components/builder/templates/ProfessionalTemplate.tsx` — Render categorized skills
6. `src/components/builder/templates/NormalTemplate.tsx` — Render categorized skills  
  
  
person should be also able to add any specific catagory if he wants of its own