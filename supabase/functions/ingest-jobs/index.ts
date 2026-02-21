import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-key",
};

// ---------------------------------------------------------------------------
// Feed configuration – add new employers by appending to this array
// ---------------------------------------------------------------------------

interface FeedJob {
  job_id: string;
  job_title: string;
  job_location: string;
  job_type: string;
  salary?: string;
  description: string;
  required_skills: string[];
  application_url: string;
}

interface FeedConfig {
  name: string;
  url: string;
  mockData: FeedJob[];
}

const FEEDS: FeedConfig[] = [
  {
    name: "TechCorp",
    url: "https://techcorp.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "tc-001",
        job_title: "Senior React Developer",
        job_location: "San Francisco, CA",
        job_type: "Full-time",
        salary: "$140,000 - $180,000",
        description:
          "Build and maintain modern web applications using React and TypeScript. Lead frontend architecture decisions and mentor junior developers.",
        required_skills: ["React", "TypeScript", "Node.js", "GraphQL", "CSS"],
        application_url: "https://techcorp.example.com/careers/tc-001",
      },
      {
        job_id: "tc-002",
        job_title: "Full Stack Engineer",
        job_location: "Austin, TX",
        job_type: "Full-time",
        salary: "$120,000 - $160,000",
        description:
          "Develop end-to-end features across our Python/Django backend and React frontend. Work closely with product and design teams.",
        required_skills: ["Python", "Django", "PostgreSQL", "React", "REST"],
        application_url: "https://techcorp.example.com/careers/tc-002",
      },
      {
        job_id: "tc-003",
        job_title: "DevOps Engineer",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$130,000 - $170,000",
        description:
          "Design and maintain CI/CD pipelines, manage cloud infrastructure on AWS, and champion containerisation best practices.",
        required_skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        application_url: "https://techcorp.example.com/careers/tc-003",
      },
    ],
  },
  {
    name: "DataWorks",
    url: "https://dataworks.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "dw-001",
        job_title: "Data Scientist",
        job_location: "New York, NY",
        job_type: "Full-time",
        salary: "$130,000 - $170,000",
        description:
          "Apply statistical modeling and machine learning techniques to solve business problems. Collaborate with engineering to productionize models.",
        required_skills: ["Python", "SQL", "Machine Learning", "Pandas", "Scikit-learn"],
        application_url: "https://dataworks.example.com/careers/dw-001",
      },
      {
        job_id: "dw-002",
        job_title: "Backend Engineer",
        job_location: "Chicago, IL",
        job_type: "Full-time",
        salary: "$125,000 - $160,000",
        description:
          "Build high-performance backend services in Go. Design RESTful APIs and manage PostgreSQL databases at scale.",
        required_skills: ["Go", "PostgreSQL", "REST", "Docker", "Redis"],
        application_url: "https://dataworks.example.com/careers/dw-002",
      },
      {
        job_id: "dw-003",
        job_title: "Cloud Architect",
        job_location: "Remote",
        job_type: "Contract",
        salary: "$150,000 - $200,000",
        description:
          "Design multi-cloud architectures across AWS and Azure. Define infrastructure-as-code standards and lead cloud migration initiatives.",
        required_skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Networking"],
        application_url: "https://dataworks.example.com/careers/dw-003",
      },
    ],
  },
  {
    name: "DesignHub",
    url: "https://designhub.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "dh-001",
        job_title: "UI/UX Designer",
        job_location: "Los Angeles, CA",
        job_type: "Full-time",
        salary: "$110,000 - $145,000",
        description:
          "Lead end-to-end design for our SaaS platform. Conduct user research, build wireframes & prototypes, and collaborate with engineers to ship polished interfaces.",
        required_skills: ["Figma", "User Research", "Design Systems", "Prototyping", "Accessibility"],
        application_url: "https://designhub.example.com/careers/dh-001",
      },
      {
        job_id: "dh-002",
        job_title: "Product Designer",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$120,000 - $155,000",
        description:
          "Own the design process from discovery to delivery. Create high-fidelity mockups in Figma and Sketch, run usability tests, and define our design language.",
        required_skills: ["Figma", "Sketch", "Adobe XD", "User Research", "Design Systems"],
        application_url: "https://designhub.example.com/careers/dh-002",
      },
      {
        job_id: "dh-003",
        job_title: "Frontend Developer (Design Engineering)",
        job_location: "Seattle, WA",
        job_type: "Full-time",
        salary: "$130,000 - $165,000",
        description:
          "Bridge design and engineering by building pixel-perfect, accessible component libraries in React. Translate Figma designs into production-ready code.",
        required_skills: ["React", "TypeScript", "CSS", "Accessibility", "Storybook"],
        application_url: "https://designhub.example.com/careers/dh-003",
      },
    ],
  },
  {
    name: "FinanceFirst",
    url: "https://financefirst.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "ff-001",
        job_title: "Quantitative Analyst",
        job_location: "New York, NY",
        job_type: "Full-time",
        salary: "$160,000 - $220,000",
        description:
          "Develop quantitative models for risk analysis and trading strategies. Work with large financial datasets using Python, R, and proprietary modeling frameworks.",
        required_skills: ["Python", "R", "Quantitative Modeling", "SQL", "Statistics"],
        application_url: "https://financefirst.example.com/careers/ff-001",
      },
      {
        job_id: "ff-002",
        job_title: "Security Engineer",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$145,000 - $190,000",
        description:
          "Protect our fintech platform by conducting penetration tests, managing SOC2 compliance, and building automated security scanning pipelines.",
        required_skills: ["Cybersecurity", "SOC2", "Penetration Testing", "AWS", "Python"],
        application_url: "https://financefirst.example.com/careers/ff-002",
      },
      {
        job_id: "ff-003",
        job_title: "Full Stack Engineer (Fintech)",
        job_location: "Chicago, IL",
        job_type: "Full-time",
        salary: "$135,000 - $175,000",
        description:
          "Build and scale our payments platform using React and Node.js. Implement real-time transaction processing and ensure PCI-DSS compliance.",
        required_skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Redis"],
        application_url: "https://financefirst.example.com/careers/ff-003",
      },
    ],
  },
  {
    name: "HealthTech Solutions",
    url: "https://healthtech.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "ht-001",
        job_title: "ML Engineer (Healthcare)",
        job_location: "Boston, MA",
        job_type: "Full-time",
        salary: "$150,000 - $195,000",
        description:
          "Build machine learning models for medical imaging and patient outcome prediction. Ensure HIPAA compliance and work with clinical teams to validate results.",
        required_skills: ["Python", "TensorFlow", "PyTorch", "HIPAA", "Machine Learning"],
        application_url: "https://healthtech.example.com/careers/ht-001",
      },
      {
        job_id: "ht-002",
        job_title: "Backend Engineer (Health Data)",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$130,000 - $170,000",
        description:
          "Design FHIR-compliant APIs for health data exchange. Build scalable microservices in Go and ensure data integrity across distributed systems.",
        required_skills: ["Go", "FHIR", "PostgreSQL", "Docker", "HIPAA"],
        application_url: "https://healthtech.example.com/careers/ht-002",
      },
      {
        job_id: "ht-003",
        job_title: "Mobile Developer (Health Apps)",
        job_location: "San Diego, CA (Hybrid)",
        job_type: "Full-time",
        salary: "$125,000 - $160,000",
        description:
          "Develop cross-platform mobile applications for patient engagement using React Native. Integrate with wearable devices and health monitoring APIs.",
        required_skills: ["React Native", "TypeScript", "Swift", "Kotlin", "REST"],
        application_url: "https://healthtech.example.com/careers/ht-003",
      },
    ],
  },
  {
    name: "GreenEnergy Co",
    url: "https://greenenergy.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "ge-001",
        job_title: "Embedded Systems Engineer",
        job_location: "Denver, CO",
        job_type: "Full-time",
        salary: "$120,000 - $155,000",
        description:
          "Develop firmware for solar inverters and battery management systems. Program in C/C++ on RTOS platforms and work closely with hardware teams.",
        required_skills: ["C", "C++", "RTOS", "Embedded Linux", "Hardware Integration"],
        application_url: "https://greenenergy.example.com/careers/ge-001",
      },
      {
        job_id: "ge-002",
        job_title: "Data Analyst (Energy)",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$95,000 - $125,000",
        description:
          "Analyze energy production and consumption data to optimize grid efficiency. Build dashboards in Tableau and Power BI, and design ETL pipelines.",
        required_skills: ["SQL", "Tableau", "Power BI", "Python", "ETL"],
        application_url: "https://greenenergy.example.com/careers/ge-002",
      },
      {
        job_id: "ge-003",
        job_title: "Platform Engineer",
        job_location: "Austin, TX (Hybrid)",
        job_type: "Full-time",
        salary: "$135,000 - $170,000",
        description:
          "Build and maintain the cloud infrastructure powering our IoT sensor network. Manage Kubernetes clusters, CI/CD pipelines, and observability tooling.",
        required_skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Prometheus"],
        application_url: "https://greenenergy.example.com/careers/ge-003",
      },
    ],
  },
  {
    name: "MediaStack",
    url: "https://mediastack.example.com/api/jobs.json",
    mockData: [
      {
        job_id: "ms-001",
        job_title: "Video Streaming Engineer",
        job_location: "Los Angeles, CA",
        job_type: "Full-time",
        salary: "$140,000 - $185,000",
        description:
          "Build low-latency video streaming infrastructure using FFmpeg, WebRTC, and HLS. Optimize encoding pipelines for adaptive bitrate delivery at scale.",
        required_skills: ["FFmpeg", "WebRTC", "HLS", "Python", "AWS"],
        application_url: "https://mediastack.example.com/careers/ms-001",
      },
      {
        job_id: "ms-002",
        job_title: "Content Platform Developer",
        job_location: "Remote",
        job_type: "Full-time",
        salary: "$120,000 - $155,000",
        description:
          "Develop the content management and search platform powering our media library. Implement full-text search with Elasticsearch and build React-based editorial tools.",
        required_skills: ["React", "TypeScript", "Elasticsearch", "Node.js", "PostgreSQL"],
        application_url: "https://mediastack.example.com/careers/ms-002",
      },
      {
        job_id: "ms-003",
        job_title: "QA Automation Engineer",
        job_location: "New York, NY (Hybrid)",
        job_type: "Full-time",
        salary: "$110,000 - $140,000",
        description:
          "Design and maintain automated test suites for our streaming platform. Use Cypress for E2E testing, Selenium for cross-browser coverage, and k6 for performance testing.",
        required_skills: ["Cypress", "Selenium", "k6", "JavaScript", "CI/CD"],
        application_url: "https://mediastack.example.com/careers/ms-003",
      },
    ],
  },
  // ---- Indian Companies ----
  {
    name: "Infosys",
    url: "https://careers.infosys.com/api/jobs.json",
    mockData: [
      {
        job_id: "infy-001",
        job_title: "Software Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "8,00,000 - 12,00,000 INR per year",
        description:
          "Design and develop enterprise Java applications using Spring Boot and Hibernate. Collaborate with cross-functional teams to deliver scalable microservices for global clients.",
        required_skills: ["Java", "Spring Boot", "Hibernate", "Microservices", "SQL"],
        application_url: "https://careers.infosys.com/infy-001",
      },
      {
        job_id: "infy-002",
        job_title: "Data Analyst",
        job_location: "Pune, India",
        job_type: "Full-time",
        salary: "6,00,000 - 10,00,000 INR per year",
        description:
          "Analyze large datasets using Python and SQL to generate actionable business insights. Build dashboards in Power BI and Tableau for stakeholder reporting.",
        required_skills: ["Python", "SQL", "Power BI", "Tableau", "Excel"],
        application_url: "https://careers.infosys.com/infy-002",
      },
      {
        job_id: "infy-003",
        job_title: "Cloud Solutions Architect",
        job_location: "Hyderabad, India",
        job_type: "Full-time",
        salary: "18,00,000 - 28,00,000 INR per year",
        description:
          "Design cloud-native architectures on AWS and Azure for enterprise clients. Lead cloud migration projects and implement infrastructure as code using Terraform.",
        required_skills: ["AWS", "Azure", "Terraform", "Docker", "Kubernetes"],
        application_url: "https://careers.infosys.com/infy-003",
      },
    ],
  },
  {
    name: "TCS",
    url: "https://careers.tcs.com/api/jobs.json",
    mockData: [
      {
        job_id: "tcs-001",
        job_title: "Full Stack Developer",
        job_location: "Mumbai, India",
        job_type: "Full-time",
        salary: "10,00,000 - 16,00,000 INR per year",
        description:
          "Build end-to-end web applications using React and Node.js. Develop RESTful APIs and integrate with enterprise databases. Participate in agile development sprints.",
        required_skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST"],
        application_url: "https://careers.tcs.com/tcs-001",
      },
      {
        job_id: "tcs-002",
        job_title: "Cloud Engineer",
        job_location: "Chennai, India",
        job_type: "Full-time",
        salary: "12,00,000 - 20,00,000 INR per year",
        description:
          "Manage and optimize cloud infrastructure on AWS. Implement CI/CD pipelines using Jenkins and automate deployments with Ansible and Terraform.",
        required_skills: ["AWS", "Jenkins", "Terraform", "Docker", "CI/CD"],
        application_url: "https://careers.tcs.com/tcs-002",
      },
    ],
  },
  {
    name: "Wipro",
    url: "https://careers.wipro.com/api/jobs.json",
    mockData: [
      {
        job_id: "wipro-001",
        job_title: "DevOps Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "10,00,000 - 18,00,000 INR per year",
        description:
          "Design and maintain CI/CD pipelines using Jenkins and GitLab CI. Manage containerized workloads with Docker and Kubernetes on AWS infrastructure.",
        required_skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "CI/CD"],
        application_url: "https://careers.wipro.com/wipro-001",
      },
      {
        job_id: "wipro-002",
        job_title: "QA Engineer",
        job_location: "Noida, India",
        job_type: "Full-time",
        salary: "6,00,000 - 10,00,000 INR per year",
        description:
          "Design and execute automated test suites using Selenium and Cypress. Perform functional, regression, and performance testing. Integrate tests into CI/CD pipelines.",
        required_skills: ["Selenium", "Cypress", "Java", "CI/CD", "Jira"],
        application_url: "https://careers.wipro.com/wipro-002",
      },
    ],
  },
  {
    name: "Razorpay",
    url: "https://razorpay.com/api/jobs.json",
    mockData: [
      {
        job_id: "rzp-001",
        job_title: "Backend Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "18,00,000 - 30,00,000 INR per year",
        description:
          "Build highly available payment processing services using Go and Ruby. Design event-driven architectures and work with distributed systems at scale.",
        required_skills: ["Go", "Ruby", "PostgreSQL", "Redis", "Microservices"],
        application_url: "https://razorpay.com/jobs/rzp-001",
      },
      {
        job_id: "rzp-002",
        job_title: "Frontend Developer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "15,00,000 - 25,00,000 INR per year",
        description:
          "Develop intuitive payment dashboards and checkout experiences using React and TypeScript. Optimize for performance and accessibility across devices.",
        required_skills: ["React", "TypeScript", "JavaScript", "CSS", "REST"],
        application_url: "https://razorpay.com/jobs/rzp-002",
      },
    ],
  },
  {
    name: "Zerodha",
    url: "https://zerodha.com/api/jobs.json",
    mockData: [
      {
        job_id: "zrd-001",
        job_title: "Platform Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "20,00,000 - 35,00,000 INR per year",
        description:
          "Build and maintain low-latency trading infrastructure using Go and Python. Optimize systems for high-throughput order processing and real-time data streaming.",
        required_skills: ["Go", "Python", "Linux", "PostgreSQL", "Redis"],
        application_url: "https://zerodha.com/jobs/zrd-001",
      },
      {
        job_id: "zrd-002",
        job_title: "Data Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "18,00,000 - 28,00,000 INR per year",
        description:
          "Design and build data pipelines for financial analytics using Python and Spark. Manage large-scale data warehousing on PostgreSQL and ClickHouse.",
        required_skills: ["Python", "Spark", "SQL", "ETL", "Data Engineering"],
        application_url: "https://zerodha.com/jobs/zrd-002",
      },
    ],
  },
  {
    name: "Flipkart",
    url: "https://careers.flipkart.com/api/jobs.json",
    mockData: [
      {
        job_id: "fk-001",
        job_title: "ML Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "22,00,000 - 38,00,000 INR per year",
        description:
          "Build and deploy machine learning models for product recommendations and search ranking. Work with TensorFlow and PyTorch on large-scale datasets.",
        required_skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "SQL"],
        application_url: "https://careers.flipkart.com/fk-001",
      },
      {
        job_id: "fk-002",
        job_title: "Mobile Developer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "16,00,000 - 26,00,000 INR per year",
        description:
          "Develop and optimize the Flipkart Android app for millions of users. Work with Kotlin, Jetpack Compose, and performance profiling tools.",
        required_skills: ["Kotlin", "Android", "Jetpack Compose", "REST", "Git"],
        application_url: "https://careers.flipkart.com/fk-002",
      },
    ],
  },
  {
    name: "Freshworks",
    url: "https://careers.freshworks.com/api/jobs.json",
    mockData: [
      {
        job_id: "fw-001",
        job_title: "Site Reliability Engineer",
        job_location: "Chennai, India",
        job_type: "Full-time",
        salary: "14,00,000 - 24,00,000 INR per year",
        description:
          "Ensure uptime and performance of SaaS products serving millions of users. Manage Kubernetes clusters, implement observability with Prometheus and Grafana.",
        required_skills: ["Kubernetes", "AWS", "Prometheus", "Terraform", "CI/CD"],
        application_url: "https://careers.freshworks.com/fw-001",
      },
      {
        job_id: "fw-002",
        job_title: "Product Designer",
        job_location: "Chennai, India",
        job_type: "Full-time",
        salary: "12,00,000 - 20,00,000 INR per year",
        description:
          "Own the design process for enterprise SaaS products. Conduct user research, create wireframes and prototypes in Figma, and collaborate with engineers.",
        required_skills: ["Figma", "User Research", "Design Systems", "Prototyping", "UI/UX"],
        application_url: "https://careers.freshworks.com/fw-002",
      },
    ],
  },
  {
    name: "CRED",
    url: "https://careers.cred.club/api/jobs.json",
    mockData: [
      {
        job_id: "cred-001",
        job_title: "iOS Developer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "20,00,000 - 35,00,000 INR per year",
        description:
          "Build premium mobile experiences for CRED's iOS app using Swift and SwiftUI. Focus on smooth animations, performance optimization, and clean architecture.",
        required_skills: ["Swift", "iOS", "SwiftUI", "REST", "Git"],
        application_url: "https://careers.cred.club/cred-001",
      },
      {
        job_id: "cred-002",
        job_title: "Backend Engineer",
        job_location: "Bangalore, India",
        job_type: "Full-time",
        salary: "22,00,000 - 38,00,000 INR per year",
        description:
          "Design and build scalable backend services using Java and Spring Boot. Work with microservices architecture, Kafka, and distributed caching systems.",
        required_skills: ["Java", "Spring Boot", "Kafka", "Microservices", "Redis"],
        application_url: "https://careers.cred.club/cred-002",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Skills keyword list for extracting from descriptions
// ---------------------------------------------------------------------------
const SKILLS_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby",
  "Swift", "Kotlin", "PHP", "Scala", "R", "SQL", "NoSQL", "GraphQL", "REST",
  "React", "Angular", "Vue", "Node.js", "Django", "Flask", "Spring", "Express",
  "Next.js", "Svelte", "Redux", "TailwindCSS", "Bootstrap",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD",
  "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "MySQL", "DynamoDB",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch",
  "Git", "Linux", "Agile", "Scrum", "DevOps", "Microservices",
  "HTML", "CSS", "Sass", "Figma", "UI/UX", "Accessibility",
  "Data Science", "Data Engineering", "ETL", "Spark", "Hadoop",
  "Cybersecurity", "Networking", "Blockchain", "IoT",
  // India-market popular technologies
  "Spring Boot", "Hibernate", ".NET", "Jenkins", "SonarQube", "Jira",
  "SAP", "Salesforce", "ServiceNow", "Power Automate", "Power BI",
  "Ansible", "Grafana", "Prometheus", "Kafka", "RabbitMQ",
  "Android", "iOS", "SwiftUI", "Jetpack Compose", "React Native",
  "ClickHouse", "Cassandra", "GitLab CI", "Excel",
];

function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SKILLS_KEYWORDS.filter((skill) => lower.includes(skill.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Adzuna API fetcher
// ---------------------------------------------------------------------------
interface NormalizedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
  description: string | null;
  skills: string[];
  apply_url: string;
  external_id: string;
  source: string;
  is_active: boolean;
  posted_at: string;
}

const ADZUNA_CATEGORIES = ["it-jobs", "engineering-jobs", "finance-jobs"];
const ADZUNA_COUNTRIES = ["us", "in"];

async function fetchAdzunaJobs(): Promise<NormalizedJob[]> {
  const appId = Deno.env.get("ADZUNA_APP_ID");
  const appKey = Deno.env.get("ADZUNA_APP_KEY");
  if (!appId || !appKey) {
    console.log("Adzuna credentials not configured – skipping");
    return [];
  }

  const allJobs: NormalizedJob[] = [];

  for (const country of ADZUNA_COUNTRIES) {
    const currencySymbol = country === "in" ? "₹" : "$";

    for (const category of ADZUNA_CATEGORIES) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&category=${category}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
          console.error(`Adzuna ${country}/${category} error: HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const results = data.results ?? [];

        for (const job of results) {
          const salaryParts: string[] = [];
          if (job.salary_min) salaryParts.push(`${currencySymbol}${Math.round(job.salary_min).toLocaleString()}`);
          if (job.salary_max) salaryParts.push(`${currencySymbol}${Math.round(job.salary_max).toLocaleString()}`);
          const salary = salaryParts.length === 2 ? salaryParts.join(" - ") : salaryParts[0] || null;

          allJobs.push({
            title: job.title ?? "Untitled",
            company: job.company?.display_name ?? "Unknown",
            location: job.location?.display_name ?? "Unknown",
            type: job.contract_time === "part_time" ? "Part-time" : "Full-time",
            salary,
            description: job.description ?? null,
            skills: extractSkillsFromText(job.description ?? ""),
            apply_url: job.redirect_url ?? `https://www.adzuna.com/details/${job.id}`,
            external_id: `adzuna_${job.id}`,
            source: "adzuna",
            is_active: true,
            posted_at: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
          });
        }

        console.log(`Adzuna ${country}/${category}: fetched ${results.length} jobs`);
      } catch (err) {
        console.error(`Adzuna ${country}/${category} fetch error:`, err);
      }
    }
  }

  return allJobs;
}

// ---------------------------------------------------------------------------
// The Muse API fetcher
// ---------------------------------------------------------------------------

async function fetchMuseJobs(): Promise<NormalizedJob[]> {
  const allJobs: NormalizedJob[] = [];

  for (let page = 0; page < 2; page++) {
    try {
      const url = `https://www.themuse.com/api/public/jobs?page=${page}&descending=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.error(`The Muse page ${page} error: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const results = data.results ?? [];

      for (const job of results) {
        const categories = (job.categories ?? []).map((c: { name: string }) => c.name);
        const levels = (job.levels ?? []).map((l: { name: string }) => l.name);
        const skills = [...new Set([...categories, ...levels])].slice(0, 5);

        allJobs.push({
          title: job.name ?? "Untitled",
          company: job.company?.name ?? "Unknown",
          location: job.locations?.[0]?.name ?? "Remote",
          type: "Full-time",
          salary: null,
          description: job.contents ? job.contents.replace(/<[^>]*>/g, "").slice(0, 2000) : null,
          skills,
          apply_url: job.refs?.landing_page ?? `https://www.themuse.com/jobs/${job.id}`,
          external_id: `themuse_${job.id}`,
          source: "themuse",
          is_active: true,
          posted_at: job.publication_date ? new Date(job.publication_date).toISOString() : new Date().toISOString(),
        });
      }

      console.log(`The Muse page ${page}: fetched ${results.length} jobs`);
      // Small delay between pages to be respectful
      if (page < 1) await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`The Muse page ${page} fetch error:`, err);
    }
  }

  return allJobs;
}

// ---------------------------------------------------------------------------
// Helpers (mock feeds)
// ---------------------------------------------------------------------------

async function fetchFeedJobs(feed: FeedConfig): Promise<FeedJob[]> {
  try {
    const res = await fetch(feed.url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.jobs ?? [];
  } catch {
    console.log(
      `Feed "${feed.name}" unreachable – using embedded mock data (${feed.mockData.length} jobs)`
    );
    return feed.mockData;
  }
}

function normalizeJob(feedName: string, raw: FeedJob): NormalizedJob {
  return {
    title: raw.job_title,
    company: feedName,
    location: raw.job_location,
    type: raw.job_type || "Full-time",
    salary: raw.salary || null,
    description: raw.description || null,
    skills: raw.required_skills ?? [],
    apply_url: raw.application_url,
    external_id: `${feedName.toLowerCase().replace(/\s+/g, "_")}_${raw.job_id}`,
    source: "employer_feed",
    is_active: true,
    posted_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Upsert + deactivate helper
// ---------------------------------------------------------------------------

async function upsertAndDeactivate(
  supabase: ReturnType<typeof createClient>,
  source: string,
  jobs: NormalizedJob[],
  label: string
): Promise<{ upserted: number; deactivated: number }> {
  if (jobs.length === 0) return { upserted: 0, deactivated: 0 };

  const { error: upsertError } = await supabase
    .from("jobs")
    .upsert(jobs, { onConflict: "external_id" });

  if (upsertError) {
    console.error(`Upsert error for ${label}:`, upsertError);
    throw upsertError;
  }

  const currentExternalIds = jobs.map((j) => j.external_id);

  const { data: staleJobs, error: staleError } = await supabase
    .from("jobs")
    .select("id, external_id")
    .eq("source", source)
    .eq("is_active", true)
    .not("external_id", "in", `(${currentExternalIds.join(",")})`);

  if (staleError) {
    console.error(`Stale query error for ${label}:`, staleError);
  }

  let deactivated = 0;
  if (staleJobs && staleJobs.length > 0) {
    const staleIds = staleJobs.map((j) => j.id);
    const { error: deactivateError } = await supabase
      .from("jobs")
      .update({ is_active: false })
      .in("id", staleIds);

    if (deactivateError) {
      console.error(`Deactivate error for ${label}:`, deactivateError);
    } else {
      deactivated = staleIds.length;
    }
  }

  return { upserted: jobs.length, deactivated };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const INGEST_SECRET = Deno.env.get("INGEST_SECRET");
  if (!INGEST_SECRET || req.headers.get("x-ingest-key") !== INGEST_SECRET) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: Record<string, { upserted: number; deactivated: number }> = {};

    // 1. Fetch from real APIs (Adzuna + The Muse) in parallel
    const [adzunaJobs, museJobs] = await Promise.all([
      fetchAdzunaJobs(),
      fetchMuseJobs(),
    ]);

    // 2. Upsert real API jobs
    if (adzunaJobs.length > 0) {
      results["Adzuna"] = await upsertAndDeactivate(supabase, "adzuna", adzunaJobs, "Adzuna");
    } else {
      results["Adzuna"] = { upserted: 0, deactivated: 0 };
    }

    if (museJobs.length > 0) {
      results["The Muse"] = await upsertAndDeactivate(supabase, "themuse", museJobs, "The Muse");
    } else {
      results["The Muse"] = { upserted: 0, deactivated: 0 };
    }

    // 3. Process mock feeds (fallback data)
    for (const feed of FEEDS) {
      const rawJobs = await fetchFeedJobs(feed);
      const normalized = rawJobs.map((j) => normalizeJob(feed.name, j));

      if (normalized.length === 0) {
        results[feed.name] = { upserted: 0, deactivated: 0 };
        continue;
      }

      // For mock feeds, deactivate by company name within employer_feed source
      const { error: upsertError } = await supabase
        .from("jobs")
        .upsert(normalized, { onConflict: "external_id" });

      if (upsertError) {
        console.error(`Upsert error for ${feed.name}:`, upsertError);
        throw upsertError;
      }

      const currentExternalIds = normalized.map((j) => j.external_id);
      const { data: staleJobs, error: staleError } = await supabase
        .from("jobs")
        .select("id, external_id")
        .eq("source", "employer_feed")
        .eq("company", feed.name)
        .eq("is_active", true)
        .not("external_id", "in", `(${currentExternalIds.join(",")})`);

      if (staleError) console.error(`Stale query error for ${feed.name}:`, staleError);

      let deactivated = 0;
      if (staleJobs && staleJobs.length > 0) {
        const staleIds = staleJobs.map((j) => j.id);
        const { error: deactivateError } = await supabase
          .from("jobs")
          .update({ is_active: false })
          .in("id", staleIds);
        if (deactivateError) console.error(`Deactivate error for ${feed.name}:`, deactivateError);
        else deactivated = staleIds.length;
      }

      results[feed.name] = { upserted: normalized.length, deactivated };
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingestion error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
