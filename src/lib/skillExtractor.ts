// Curated whitelist – no single-letter or ambiguous short words
const SKILLS_WHITELIST = [
  // Data & Analytics
  "python","sql","excel","power bi","pandas","numpy","matplotlib","mysql",
  "postgresql","tableau","data analysis","machine learning","statistics",
  "scikit-learn","data science","data engineering","spark","hadoop","airflow",
  "kafka","etl","deep learning","nlp","tensorflow","pytorch","keras",
  // Web Development
  "javascript","typescript","react","angular","vue.js","svelte","next.js",
  "node.js","express","django","flask","fastapi","html","css","sass",
  "tailwind","bootstrap","graphql","webpack","vite",
  // Backend & Infrastructure
  "java","spring boot","ruby on rails","asp.net","laravel","docker",
  "kubernetes","terraform","aws","azure","gcp","linux","nginx","redis",
  "mongodb","elasticsearch","dynamodb","firebase","supabase",
  // Programming Languages (safe multi-char)
  "kotlin","swift","scala","matlab","rust","perl","powershell","bash","shell",
  // Mobile
  "react native","flutter","ios development","android development","xamarin",
  // Tools & Practices
  "git","github","gitlab","jira","confluence","figma","ci/cd",
  "agile methodology","scrum","microservices",
  // Soft Skills
  "leadership","project management","communication","problem-solving",
  "mentoring","teamwork",
  // Additional skills
  "seaborn","opencv","jupyter notebook","vs code","manual testing",
  "sdlc","stlc","speech recognition","power automate","canva",
];

// Ambiguous skills that need list-context to match
const AMBIGUOUS_SKILLS = ["c++", "c#", "r", "go", "php", "ruby"];

// Common resume section headers
const SECTION_HEADER_RE =
  /^[\s]*(?:(?:technical\s+|key\s+|core\s+)?skills|core\s+competencies|technologies|tech\s+stack|tools\s*(?:&|and)\s*technologies|proficiencies|areas\s+of\s+expertise)\s*:?\s*$/im;

// Generic section header (used to find end of skills section)
const GENERIC_SECTION_RE =
  /^[\s]*(?:[A-Z][A-Z\s&]{2,})\s*:?\s*$/m;

function findSkillsSection(text: string): string | null {
  const match = SECTION_HEADER_RE.exec(text);
  if (!match) return null;

  const startIdx = match.index + match[0].length;
  const remaining = text.substring(startIdx);

  const nextSection = GENERIC_SECTION_RE.exec(remaining);
  const sectionText = nextSection
    ? remaining.substring(0, nextSection.index)
    : remaining.substring(0, 2000);

  return sectionText;
}

function matchWhitelistSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const found = new Set<string>();

  for (const skill of SKILLS_WHITELIST) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "i");
    if (pattern.test(normalizedText)) {
      found.add(skill.toLowerCase());
    }
  }

  return Array.from(found);
}

function extractAmbiguousSkills(sectionText: string): string[] {
  const found: string[] = [];
  for (const skill of AMBIGUOUS_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `(?:^|,|;|\\||•|\\u2022|\\n)\\s*${escaped}\\s*(?:,|;|\\||•|\\u2022|\\n|$)`,
      "im"
    );
    if (pattern.test(sectionText)) {
      found.push(skill.toLowerCase());
    }
  }
  return found;
}

export function extractSkillsFromText(text: string): string[] {
  const skillsSection = findSkillsSection(text);

  let skills: string[];

  if (skillsSection) {
    const whitelistMatches = matchWhitelistSkills(skillsSection);
    const ambiguousMatches = extractAmbiguousSkills(skillsSection);
    skills = [...whitelistMatches, ...ambiguousMatches];
  } else {
    // Fallback: only match safe (≥4 char) skills against full text
    const safeSkills = SKILLS_WHITELIST.filter((s) => s.length >= 4);
    const normalizedText = text.toLowerCase();
    const found = new Set<string>();
    for (const skill of safeSkills) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`\\b${escaped}\\b`, "i");
      if (pattern.test(normalizedText)) {
        found.add(skill.toLowerCase());
      }
    }
    skills = Array.from(found);
  }

  return [...new Set(skills.map((s) => s.toLowerCase()))];
}
