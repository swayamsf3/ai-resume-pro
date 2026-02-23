# AI Resume Builder

An intelligent resume builder and job matching platform that helps job seekers create professional resumes and find the best job opportunities based on their skills and experience level.

## Features

- **Smart Resume Builder** — Create professional resumes with multiple templates (Classic, Modern, Professional, Normal)
- **Resume Parsing** — Upload your existing resume (PDF) and automatically extract skills and experience
- **AI-Powered Job Matching** — Get job recommendations ranked by skill match percentage
- **Experience-Level Filtering** — Fresher-friendly job prioritization with automatic experience detection
- **Job Saving** — Save interesting jobs for later review
- **User Authentication** — Secure login with email, Google, and GitHub OAuth
- **PDF Export** — Download your resume as a professionally formatted PDF

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **UI Components**: Radix UI, Framer Motion
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Deployment**: Vercel

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd ai-resume-pro

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
