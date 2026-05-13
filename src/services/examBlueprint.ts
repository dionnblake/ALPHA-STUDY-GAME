// src/services/examBlueprint.ts

export interface Domain {
    id: number;
    name: string;
    weight: number; // Percentage like 0.20
    categories: string[];
    color: string;
}

export const DOMAINS: Domain[] = [
    {
        id: 1,
        name: "Domain 1: Foundations of AI",
        weight: 0.25,
        categories: [
            "fundamentals",
            "ai-types",
            "ai-applications",
            "ai-terminology"
        ],
        color: "#28D7FF" // Cyan
    },
    {
        id: 2,
        name: "Domain 2: AI Ethics & Responsibility",
        weight: 0.20,
        categories: [
            "bias-fairness",
            "privacy-security",
            "transparency",
            "google-principles"
        ],
        color: "#FFA63D" // Orange
    },
    {
        id: 3,
        name: "Domain 3: Google AI Tools & Services",
        weight: 0.20,
        categories: [
            "google-tools",
            "google-workspace",
            "automl",
            "cloud-ai"
        ],
        color: "#57F287" // Green
    },
    {
        id: 4,
        name: "Domain 4: AI for Productivity",
        weight: 0.15,
        categories: [
            "workspace-ai",
            "daily-workflows",
            "time-management",
            "automation"
        ],
        color: "#FF5CB8" // Pink
    },
    {
        id: 5,
        name: "Domain 5: Future of AI & Skills",
        weight: 0.20,
        categories: [
            "generative-models",
            "upskilling",
            "career-ethics",
            "creativity"
        ],
        color: "#9B5CFF" // Purple
    },
    {
        id: 6,
        name: "Domain 6: AI Fundamentals (Google Cert)",
        weight: 0.25,
        categories: [
            "ai-collab-mindset",
            "genai-llm-basics",
            "prompt-basics",
            "prompt-advanced",
            "ai-image-gen",
            "responsible-ai"
        ],
        color: "#FF00FF" // Magenta
    },
    {
        id: 7,
        name: "Domain 7: Brainstorming & Planning",
        weight: 0.10,
        categories: [
            "ai-brainstorm",
            "ai-project-plan",
            "notebooklm-hubs"
        ],
        color: "#00FFFF" // Cyan
    },
    {
        id: 8,
        name: "Domain 8: Research & Insights",
        weight: 0.10,
        categories: [
            "deep-research",
            "notebooklm-summary",
            "gemini-gems"
        ],
        color: "#FFFF00" // Yellow
    },
    {
        id: 9,
        name: "Domain 9: Writing & Communicating",
        weight: 0.10,
        categories: [
            "gemini-meet",
            "pressure-testing",
            "gemini-canvas-write",
            "gemini-live"
        ],
        color: "#FF0000" // Red
    },
    {
        id: 10,
        name: "Domain 10: Content Creation",
        weight: 0.15,
        categories: [
            "ai-media-gen",
            "canvas-presentations",
            "design-guidelines"
        ],
        color: "#00FF00" // Green
    },
    {
        id: 11,
        name: "Domain 11: Data Analysis",
        weight: 0.15,
        categories: [
            "kpi-metrics",
            "data-cleaning",
            "gemini-sheets",
            "data-viz-sim"
        ],
        color: "#0000FF" // Blue
    },
    {
        id: 12,
        name: "Domain 12: App Building (Vibe Coding)",
        weight: 0.15,
        categories: [
            "vibe-coding-basics",
            "ai-studio",
            "workflow-audit"
        ],
        color: "#FFA500" // Orange
    },
    {
        id: 13,
        name: "Domain 13: GenAI on Google Cloud",
        weight: 0.20,
        categories: [
            "genai-gcp-foundations",
            "genai-gcp-data-readiness",
            "genai-gcp-rag-systems",
            "genai-gcp-adk-agents",
            "genai-gcp-multiagent",
            "genai-gcp-evaluation",
            "genai-gcp-tuning-infra",
            "genai-gcp-agentops",
            "genai-gcp-maturity"
        ],
        color: "#7DD3FC" // Sky
    },
    {
        id: 14,
        name: "Domain 14: AWS Certified AI Practitioner",
        weight: 0.20,
        categories: [
            "aws-ai-ml-fundamentals",
            "aws-learning-types",
            "aws-model-lifecycle",
            "aws-model-performance",
            "aws-sagemaker",
            "aws-ai-services",
            "aws-generative-ai",
            "aws-data-services",
            "aws-llm-concepts",
            "aws-prompt-engineering",
            "aws-nlp-techniques",
            "aws-model-customization",
            "aws-responsible-ai",
            "aws-data-privacy",
            "aws-ai-security",
            "aws-security-model",
            "aws-ai-use-cases",
            "aws-data-preparation",
            "aws-model-deployment",
            "aws-mlops-lifecycle"
        ],
        color: "#F59E0B" // AWS orange
    }
];

function normalizeCategory(value: string): string {
    return value
        .trim()
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

export function getDomainForCategory(category: string): Domain | undefined {
    if (!category) return undefined;
    const normalized = normalizeCategory(String(category));
    return DOMAINS.find((d) =>
        d.categories.some((c) => normalizeCategory(c) === normalized)
    );
}

export function getAllCategories(): string[] {
    return DOMAINS.flatMap((d) => d.categories);
}
