
# Implementation Plan: Job Recommendation System Improvements

## Overview

This plan implements three targeted improvements to keep the job recommendation system simple, explainable, and interview-safe:

1. **Fix "Sync from Builder"** - Connect actual Resume Builder data instead of hardcoded skills
2. **Add Match Percentage Filter** - Allow users to filter jobs by minimum match threshold
3. **Expand Skill Aliases** - Improve matching accuracy with more skill variations

---

## Architecture Changes

```text
Current Flow (with bug):
+------------------+     +-------------------+
| Resume Builder   |     | Jobs Page         |
| (React State)    |     | handleSyncFromBuilder() |
+------------------+     +-------------------+
         X                       |
         |                       v
    Not connected         Hardcoded skills
                          ["react", "typescript", ...]
                               |
                               v
                         user_resumes table

Fixed Flow:
+------------------+     +-------------------+
| Resume Builder   |     | Jobs Page         |
| (React State)    |     |                   |
+--------+---------+     +-------------------+
         |                       |
         v                       v
   localStorage           Read from localStorage
   (persist skills)       (get actual skills)
         |                       |
         +-----------+-----------+
                     |
                     v
               user_resumes table
```

---

## Implementation Details

### 1. Fix "Sync from Builder" Logic

**Problem**: The `handleSyncFromBuilder` function in `Jobs.tsx` uses hardcoded placeholder skills instead of actual user data from the Resume Builder.

**Solution**: Since the Resume Builder stores data only in React state (which is lost on page navigation), we need to persist skills to `localStorage` when users add them in the builder.

**Files to modify**:

| File | Change |
|------|--------|
| `src/components/builder/ResumeForm.tsx` | Add `useEffect` to save skills to `localStorage` whenever they change |
| `src/pages/Jobs.tsx` | Update `handleSyncFromBuilder` to read from `localStorage` |

**Code changes**:

In `ResumeForm.tsx`, add a side effect to persist skills:
```typescript
// After skills change, save to localStorage for job matching sync
useEffect(() => {
  if (resumeData.skills.length > 0) {
    localStorage.setItem('builderSkills', JSON.stringify(resumeData.skills));
  }
}, [resumeData.skills]);
```

In `Jobs.tsx`, update the sync handler:
```typescript
const handleSyncFromBuilder = () => {
  const savedSkills = localStorage.getItem('builderSkills');
  if (savedSkills) {
    try {
      const builderSkills = JSON.parse(savedSkills);
      if (Array.isArray(builderSkills) && builderSkills.length > 0) {
        syncFromBuilder.mutate(builderSkills);
      } else {
        toast({
          title: "No skills found",
          description: "Add skills in the Resume Builder first.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Sync failed",
        description: "Could not read skills from Resume Builder.",
        variant: "destructive",
      });
    }
  } else {
    toast({
      title: "No skills found",
      description: "Build your resume first to sync skills.",
      variant: "destructive",
    });
  }
};
```

---

### 2. Add Minimum Match Percentage Filter

**Purpose**: Let users filter jobs to show only those above a certain match threshold (e.g., 50%, 60%, 70%+).

**File to modify**: `src/pages/Jobs.tsx`

**UI Design**: Add filter buttons/pills below the search bar:
- "All Jobs" (default)
- "50%+"
- "60%+"
- "70%+"

**Code changes**:

Add state for the filter:
```typescript
const [minMatchPercentage, setMinMatchPercentage] = useState(0);
```

Update the filtering logic:
```typescript
const filteredJobs = jobs.filter((job) => {
  // Match percentage filter (only apply if user has skills)
  if (hasResume && job.match_percentage < minMatchPercentage) {
    return false;
  }
  
  // Text search filter
  const query = searchQuery.toLowerCase();
  return (
    job.title.toLowerCase().includes(query) ||
    job.company.toLowerCase().includes(query) ||
    job.skills.some((skill) => skill.toLowerCase().includes(query))
  );
});
```

Add filter UI below the search input:
```tsx
{hasResume && (
  <div className="flex flex-wrap gap-2 mt-4 justify-center">
    {[
      { label: "All Jobs", value: 0 },
      { label: "50%+", value: 50 },
      { label: "60%+", value: 60 },
      { label: "70%+", value: 70 },
    ].map((filter) => (
      <Button
        key={filter.value}
        variant={minMatchPercentage === filter.value ? "default" : "outline"}
        size="sm"
        onClick={() => setMinMatchPercentage(filter.value)}
      >
        {filter.label}
      </Button>
    ))}
  </div>
)}
```

---

### 3. Expand Skill Alias Mapping

**Purpose**: Improve matching accuracy by recognizing more common skill variations.

**File to modify**: `supabase/functions/match-jobs/index.ts`

**Current aliases** (8 mappings):
- nodejs, javascript, typescript, postgresql, react native, vue, next, tailwind

**Expanded aliases** (20+ mappings):

```typescript
const variations: Record<string, string[]> = {
  // JavaScript ecosystem
  "nodejs": ["node", "node.js", "node js"],
  "javascript": ["js", "ecmascript", "es6", "es2015"],
  "typescript": ["ts"],
  "react": ["reactjs", "react.js"],
  "react native": ["reactnative", "rn"],
  "vue": ["vuejs", "vue.js", "vue 3"],
  "angular": ["angularjs", "angular.js"],
  "next": ["nextjs", "next.js"],
  "nuxt": ["nuxtjs", "nuxt.js"],
  "express": ["expressjs", "express.js"],
  
  // Styling
  "tailwind": ["tailwindcss", "tailwind css"],
  "css": ["css3", "cascading style sheets"],
  "sass": ["scss"],
  
  // Databases
  "postgresql": ["postgres", "psql", "pg"],
  "mongodb": ["mongo"],
  "mysql": ["mariadb"],
  "sql": ["structured query language"],
  
  // Cloud & DevOps
  "aws": ["amazon web services", "amazon aws"],
  "gcp": ["google cloud", "google cloud platform"],
  "azure": ["microsoft azure"],
  "kubernetes": ["k8s"],
  "docker": ["containerization"],
  
  // Languages
  "python": ["py", "python3"],
  "csharp": ["c#", "c sharp", "dotnet", ".net"],
  "golang": ["go"],
  "cpp": ["c++"],
  
  // Other
  "graphql": ["gql"],
  "rest": ["restful", "rest api"],
  "ci cd": ["cicd", "continuous integration", "continuous deployment"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
};
```

---

## Files Changed Summary

| File | Type | Description |
|------|------|-------------|
| `src/components/builder/ResumeForm.tsx` | Modify | Add localStorage persistence for skills |
| `src/pages/Jobs.tsx` | Modify | Fix sync handler + add match filter UI |
| `supabase/functions/match-jobs/index.ts` | Modify | Expand skill alias mappings |

---

## Testing Checklist

After implementation, verify:

1. **Sync from Builder**:
   - Add skills in Resume Builder
   - Navigate to Jobs page
   - Click "Sync from Builder" - should use actual skills
   - Toast should confirm sync with correct skill count

2. **Match Filter**:
   - Upload a resume or sync skills
   - Click "50%+" filter - only jobs with 50%+ match should show
   - Click "All Jobs" - all jobs should show again
   - Filter should only appear when user has skills

3. **Skill Matching**:
   - User with "JS" skill should match jobs requiring "JavaScript"
   - User with "Python" should match jobs requiring "py" or "python3"
   - User with "AWS" should match "Amazon Web Services"

---

## Edge Cases Handled

- **No builder skills**: Shows helpful toast message instead of syncing empty array
- **Invalid localStorage data**: Graceful error handling with toast notification
- **No user skills**: Match filter buttons are hidden (not applicable)
- **Empty filter results**: Shows "No jobs found" message
