const FRESHER_KEYWORDS = [
  "fresher", "fresh graduate", "recent graduate", "entry level", "entry-level",
  "final year", "final semester", "0 years", "no experience",
  "seeking first", "first job", "career start", "beginner",
  "just graduated", "newly graduated", "campus placement",
];

const SENIOR_KEYWORDS = [
  "senior", "sr.", "lead", "principal", "staff", "architect",
  "director", "vp", "head of", "manager", "team lead",
];

const SENIOR_EXPERIENCE_RE = /(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/gi;
const GRAD_YEAR_RE = /(?:graduated?|graduation|batch|class of|passing year)\s*:?\s*(\d{4})/gi;
const WORK_SECTION_RE = /(?:work\s+experience|professional\s+experience|employment\s+history|career\s+history)/i;
const INTERNSHIP_ONLY_RE = /(?:internship|intern)\b/gi;

export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior" | "unknown";

export function detectExperienceLevel(text: string): ExperienceLevel {
  if (!text || text.trim().length < 20) return "unknown";

  const lowerText = text.toLowerCase();

  // Check for explicit fresher keywords
  const hasFresherKeyword = FRESHER_KEYWORDS.some((kw) => lowerText.includes(kw));

  // Extract years of experience
  const yearsMatches: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = SENIOR_EXPERIENCE_RE.exec(lowerText)) !== null) {
    yearsMatches.push(parseInt(match[1], 10));
  }
  const maxYears = yearsMatches.length > 0 ? Math.max(...yearsMatches) : -1;

  // Check graduation year proximity
  const currentYear = new Date().getFullYear();
  const gradYears: number[] = [];
  while ((match = GRAD_YEAR_RE.exec(lowerText)) !== null) {
    gradYears.push(parseInt(match[1], 10));
  }
  const recentGrad = gradYears.some((y) => currentYear - y <= 2 && currentYear - y >= 0);

  // Check for work experience section
  const hasWorkSection = WORK_SECTION_RE.test(lowerText);

  // Check if only internships mentioned (no real work experience)
  const internshipMentions = (lowerText.match(INTERNSHIP_ONLY_RE) || []).length;

  // Check for senior-level title keywords in summary/objective
  const hasSeniorKeyword = SENIOR_KEYWORDS.some((kw) => lowerText.includes(kw));

  // Decision logic
  if (maxYears >= 6 || (hasSeniorKeyword && maxYears >= 4)) {
    return "senior";
  }

  if (maxYears >= 3 && maxYears < 6) {
    return "mid";
  }

  if (hasFresherKeyword || recentGrad) {
    return "fresher";
  }

  if (maxYears >= 0 && maxYears < 3) {
    return "junior";
  }

  // No years found — check structural signals
  if (!hasWorkSection || (internshipMentions > 0 && !hasWorkSection)) {
    return "fresher";
  }

  return "unknown";
}
