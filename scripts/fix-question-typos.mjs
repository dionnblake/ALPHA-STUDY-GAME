import fs from "node:fs";
import path from "node:path";

const QUESTIONS_DIR = "C:/Users/illpr/Desktop/VIBE CODING PROJECTS/AI STUDY GAME WINDOWS 11/public/questions";

const COMMON_S_PREFIX_WORDS = [
    "advantage", "visualizations", "interpretation", "multimodal", "regulated", "different", 
    "foundation", "is", "combine", "studio", "leverages", "improving", "formats", "diverse", 
    "relevant", "responsible", "retrieval", "question", "reducing", "aligned", "but", "for", 
    "privacy", "securing", "deployed", "should", "first", "generate", "handle", "recognize", 
    "analyze", "automatically", "evaluate", "include", "including", "important", "possibly", "trained", 
    "training", "typical", "understand", "usage", "various", "voice", "workspace", "wrong", 
    "yielding", "zero", "overthink", "tokens", "each", "not", "tricky", "options", "diffusion", 
    "also", "learns", "learning", "repeatedly", "failing", "designed", "distinctions", "summarize", 
    "consistency", "relevance", "consistent", "accurate", "accurately", "accuracy", 
    "reliability", "system", "systems", "synthetic", "members", "input", "input data", 
    "operating", "autonomous", "intervention", "explicit", "recommend", "technique", 
    "neural", "resources", "automation", "repetitive", "literacy", "social", "economic", 
    "digital", "divide", "fairness", "harm", "biases", "identifying", "identify", "identified", 
    "unauthorized", "access", "biometric", "facial", "recognition", "speech", "enhancement",
    "allowing", "allow", "follows", "following", "between", "across", "within", "during"
];

const s_prefix_regex = new RegExp(`\\bs(${COMMON_S_PREFIX_WORDS.join("|")})\\b`, "gi");

function recursiveFix(obj) {
    if (typeof obj === "string") {
        let fixed = obj;
        // Fix s-prefix issues
        fixed = fixed.replace(s_prefix_regex, (match, word) => word);

        // Fix ynthetic issues
        fixed = fixed.replace(/\b(?:yn\s+)?ynthetic\b/gi, "synthetic");
        
        // Fix based son -> based on
        fixed = fixed.replace(/\bbased\s+son\b/gi, "based on");
        fixed = fixed.replace(/\bdepend(?:s)?\s+son\b/gi, (m) => m.replace(/\bson\b/i, "on"));
        fixed = fixed.replace(/\brelying\s+son\b/gi, "relying on");

        // Fix double spaces
        fixed = fixed.replace(/\s+/g, " ");

        // Fix common transcript artifacts
        fixed = fixed.replace(/\bnnoise\b/gi, "noise");
        fixed = fixed.replace(/\bdn\s+noiseise\b/gi, "denoise");
        fixed = fixed.replace(/\bfshot\b/gi, "few-shot");
        fixed = fixed.replace(/\bfshotock\b/gi, "few-shot");
        fixed = fixed.replace(/\benterprisegrade\b/gi, "enterprise-grade");
        fixed = fixed.replace(/\bmultimod\b/gi, "multimodal");
        fixed = fixed.replace(/\bcontextaware\b/gi, "context-aware");
        fixed = fixed.replace(/\bPrototype\s+in\s+AI\b/gi, "Prototype in AI Studio");

        return fixed;
    } else if (Array.isArray(obj)) {
        return obj.map(recursiveFix);
    } else if (obj !== null && typeof obj === "object") {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = recursiveFix(value);
        }
        return newObj;
    }
    return obj;
}

const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith(".json") && !f.includes(".backup"));

for (const file of files) {
    const filePath = path.join(QUESTIONS_DIR, file);
    console.log(`Fixing ${file}...`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const fixedData = recursiveFix(data);
    fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2), "utf8");
}

console.log("Done fixing questions.");
