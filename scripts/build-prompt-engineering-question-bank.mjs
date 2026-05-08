import fs from "node:fs";
import path from "node:path";

const OUTLINE_PATH =
  process.argv[2] ||
  "C:/Users/illpr/Downloads/course outline.txt";
const TRANSCRIPT_PATH =
  process.argv[3] ||
  "C:/Users/illpr/Downloads/Prompt Engineering Full Course 2026  Generative AI  Prompt Engineering Tutorial Simplilearn.txt";
const OUTPUT_PATH =
  process.argv[4] ||
  "C:/Users/illpr/Desktop/VIBE CODING PROJECTS/AI STUDY GAME WINDOWS 11/public/questions/prompt_engineering_full_course_questions.json";

const TRACK_TAG = "prompt-engineering-full-course";
const TRACK_NAME = "Prompt Engineering Full Course";

function ensureReadable(filePath) {
  fs.accessSync(filePath, fs.constants.R_OK);
  return fs.readFileSync(filePath, "utf8");
}

function makeQuestion({
  uid,
  questionText,
  options,
  correctIndex,
  category,
  explanation,
  remediationNotes,
  learningObjective,
  tags = [],
  difficulty = "adaptive",
}) {
  const normalizedOptions = options.map((option) => String(option).trim());
  return {
    id: uid,
    questionText: String(questionText).trim(),
    questionType: "multiple_choice",
    correctAnswer: normalizedOptions[correctIndex],
    category,
    difficulty,
    options: normalizedOptions,
    explanation: String(explanation).trim(),
    remediationNotes: String(remediationNotes).trim(),
    learningObjective: String(learningObjective).trim(),
    tags: [TRACK_TAG, "transcript-derived", ...tags],
    option_a: normalizedOptions[0],
    option_b: normalizedOptions[1],
    option_c: normalizedOptions[2],
    option_d: normalizedOptions[3],
  };
}

function q(index, payload) {
  return makeQuestion({
    uid: `prompt_engineering_course_${String(index).padStart(3, "0")}`,
    ...payload,
  });
}

const questions = [
  q(1, {
    questionText: "What is the main goal of prompt engineering?",
    options: [
      "To guide an AI model toward a useful output with clear instructions",
      "To replace model training with manual scripting",
      "To make every AI response longer by default",
      "To avoid giving the model any context at all",
    ],
    correctIndex: 0,
    category: "fundamentals",
    explanation: "The course frames prompt engineering as the practice of giving AI clear instructions so the response is accurate, relevant, and usable.",
    remediationNotes: "Focus on intent. Prompt engineering is about shaping the model's output, not retraining the model itself.",
    learningObjective: "Explain the purpose of prompt engineering",
    tags: ["prompt-basics", "fundamentals"],
  }),
  q(2, {
    questionText: "Why did David's first ad-copy prompt produce generic output in the transcript example?",
    options: [
      "It lacked a target audience and product-specific details",
      "It used too many formatting constraints",
      "It asked for too many versions at once",
      "It required the AI to browse the web first",
    ],
    correctIndex: 0,
    category: "ai-applications",
    explanation: "The initial prompt was broad, so the model filled in the blanks with generic language instead of tailored marketing copy.",
    remediationNotes: "When a prompt feels vague, check whether it names the audience, task, and context clearly enough.",
    learningObjective: "Recognize how missing context weakens prompt quality",
    tags: ["marketing", "specificity"],
  }),
  q(3, {
    questionText: "Which revision best turns a weak prompt into a stronger one?",
    options: [
      "Tell me about climate change",
      "Explain the key causes of climate change in under 100 words for high school students",
      "Write everything you know about climate change",
      "Give me a random climate change summary",
    ],
    correctIndex: 1,
    category: "fundamentals",
    explanation: "The stronger version adds topic scope, length, and audience, which gives the model useful boundaries.",
    remediationNotes: "A stronger prompt usually narrows the task instead of broadening it.",
    learningObjective: "Distinguish between weak and strong prompts",
    tags: ["prompt-basics", "specificity"],
  }),
  q(4, {
    questionText: "According to the course, how do large language models primarily generate responses?",
    options: [
      "By predicting the most likely next token from patterns in training data",
      "By reasoning exactly like a human expert",
      "By searching the internet for every answer",
      "By selecting from a fixed list of approved sentences",
    ],
    correctIndex: 0,
    category: "ai-terminology",
    explanation: "The transcript explains that LLMs do not truly understand language like humans. They predict likely next pieces of text from learned patterns.",
    remediationNotes: "Remember the core mental model from the lesson: predictive text at scale, not human-style understanding.",
    learningObjective: "Describe how LLMs generate text",
    tags: ["llm", "tokenization"],
  }),
  q(5, {
    questionText: "What is tokenization in the context of prompt engineering?",
    options: [
      "Breaking text into smaller units the model can process",
      "Encrypting prompts before sending them to a model",
      "Scoring each prompt on a 100-point scale",
      "Converting prompts into images for multimodal use",
    ],
    correctIndex: 0,
    category: "ai-terminology",
    explanation: "The course describes tokenization as splitting text into words, word parts, or punctuation units that the model works with internally.",
    remediationNotes: "If you forget the term, think about the model reading prompts as chunks rather than as one big sentence.",
    learningObjective: "Define tokenization and why it matters",
    tags: ["llm", "prompt-basics"],
  }),
  q(6, {
    questionText: "What does a model's context window control?",
    options: [
      "How much conversation or source material it can keep in working memory",
      "How colorful the interface looks while prompting",
      "How quickly an image can render",
      "How many user accounts can share one prompt library",
    ],
    correctIndex: 0,
    category: "ai-terminology",
    explanation: "The transcript compares the context window to a memory box. Once it fills up, earlier details can drop out.",
    remediationNotes: "If a model starts forgetting earlier instructions, context-window limits are usually the first thing to check.",
    learningObjective: "Explain the role of the context window",
    tags: ["llm", "context"],
  }),
  q(7, {
    questionText: "Which set best matches the course's anatomy of a good prompt?",
    options: [
      "Task, audience, context or role, and format constraints",
      "Vague request, longer wording, and extra filler",
      "Only a persona and nothing else",
      "A question mark and four answer choices",
    ],
    correctIndex: 0,
    category: "fundamentals",
    explanation: "The course breaks strong prompts into clear ingredients: what to do, who it is for, what context matters, and how the answer should be shaped.",
    remediationNotes: "Use the anatomy checklist whenever a prompt keeps producing unfocused results.",
    learningObjective: "List the core ingredients of an effective prompt",
    tags: ["prompt-structure", "prompt-basics"],
  }),
  q(8, {
    questionText: "Why does naming the audience improve a prompt?",
    options: [
      "It helps the model adjust tone, detail level, and vocabulary",
      "It forces the model to generate a longer answer",
      "It guarantees the answer will be factually correct",
      "It removes the need for any other prompt detail",
    ],
    correctIndex: 0,
    category: "fundamentals",
    explanation: "Specifying an audience such as high school students or startup founders changes the kind of explanation the model should give.",
    remediationNotes: "Audience is one of the easiest ways to make an output more usable without making the prompt complicated.",
    learningObjective: "Use audience framing to improve prompt quality",
    tags: ["prompt-structure", "audience"],
  }),
  q(9, {
    questionText: "What is the biggest problem with the prompt 'Write a post about productivity'?",
    options: [
      "It leaves out audience, role, and style guidance",
      "It uses too much technical vocabulary",
      "It is too narrow to generate ideas",
      "It can only work in image models",
    ],
    correctIndex: 0,
    category: "fundamentals",
    explanation: "The model can respond, but it has to guess too many things. That usually leads to bland output.",
    remediationNotes: "When a prompt feels generic, look for the hidden decisions the model is making for you.",
    learningObjective: "Identify missing context in everyday prompts",
    tags: ["prompt-basics", "writing"],
  }),
  q(10, {
    questionText: "In the course, what is the value of assigning a role such as 'You're a productivity coach'?",
    options: [
      "It gives the model a clearer point of view for the response",
      "It bypasses the model's token limit",
      "It prevents hallucinations entirely",
      "It automatically turns the answer into JSON",
    ],
    correctIndex: 0,
    category: "ai-applications",
    explanation: "Role prompting helps shape voice and perspective. It does not solve every problem, but it improves direction.",
    remediationNotes: "A role should support the task. Use it when a perspective change would make the answer more useful.",
    learningObjective: "Apply role prompting effectively",
    tags: ["prompt-patterns", "writing"],
  }),
  q(11, {
    questionText: "What does the course suggest you do when a prompt is too lengthy and starts drifting?",
    options: [
      "Tighten the request and remove unnecessary wording",
      "Add even more examples until the prompt is massive",
      "Never revise it once written",
      "Switch to a random unrelated model",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "One of the troubleshooting sections focuses on cutting excess wording so the real instruction stays clear.",
    remediationNotes: "If the prompt contains repeated constraints or side notes, trim those first.",
    learningObjective: "Troubleshoot prompts that become bloated",
    tags: ["troubleshooting", "prompt-tuning"],
  }),
  q(12, {
    questionText: "If an AI response goes off-topic, what is the best first fix?",
    options: [
      "Restate the task with tighter scope and explicit boundaries",
      "Accept the answer and move on",
      "Ask for a longer answer without changing anything",
      "Delete the original task from the prompt",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "Off-topic responses usually mean the prompt left too much room for interpretation. Narrowing the task is the cleanest fix.",
    remediationNotes: "Try specifying the exact outcome, length, and angle instead of asking a broad follow-up.",
    learningObjective: "Correct prompts that drift away from the task",
    tags: ["troubleshooting", "prompt-tuning"],
  }),
  q(13, {
    questionText: "What should you add first when a model's answer is missing important detail?",
    options: [
      "Relevant context and concrete constraints",
      "A warning that the answer must be perfect",
      "More praise for the model",
      "A request to answer in all caps",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "Missing detail usually points back to missing instruction. The model can only optimize for what the prompt actually asks for.",
    remediationNotes: "Think in terms of absent ingredients: audience, scope, examples, format, or constraints.",
    learningObjective: "Improve incomplete model outputs through prompt revision",
    tags: ["troubleshooting", "specificity"],
  }),
  q(14, {
    questionText: "What does the course mean by fine-tuning prompts?",
    options: [
      "Iteratively revising prompts based on the quality of the output",
      "Retraining the full model on new weights",
      "Buying a larger subscription plan",
      "Saving prompts in a folder without changing them",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "The lesson treats prompt work as an iterative loop: test, inspect results, adjust, and test again.",
    remediationNotes: "Prompt fine-tuning here is not model fine-tuning. It is revision, not retraining.",
    learningObjective: "Explain prompt iteration as a working practice",
    tags: ["prompt-tuning", "iteration"],
  }),
  q(15, {
    questionText: "What is multimodal prompting?",
    options: [
      "Prompting with more than one input type such as text and images",
      "Sending the same text prompt to four models at once",
      "Using only spoken prompts instead of written ones",
      "Mixing beginner and advanced questions in one quiz",
    ],
    correctIndex: 0,
    category: "generative-models",
    explanation: "The course uses multimodal prompting to cover workflows where models generate from or analyze both text and visual inputs.",
    remediationNotes: "If the task involves understanding or generating media, multimodal prompting is usually the relevant concept.",
    learningObjective: "Define multimodal prompting",
    tags: ["multimodal", "media"],
  }),
  q(16, {
    questionText: "In practical terms, what is context engineering?",
    options: [
      "Structuring the background information so the model has the right material to work from",
      "Building hardware for faster AI training",
      "Turning prompts into a user interface theme",
      "Compressing images before uploading them",
    ],
    correctIndex: 0,
    category: "ai-terminology",
    explanation: "The course presents context engineering as the discipline of giving the model the right supporting information, not just a one-line request.",
    remediationNotes: "Ask yourself what the model would need to know to answer well if it had never seen your project before.",
    learningObjective: "Explain context engineering in prompt workflows",
    tags: ["context", "advanced-techniques"],
  }),
  q(17, {
    questionText: "How does the course describe agentic AI at a high level?",
    options: [
      "AI systems that can plan and act across multi-step tasks",
      "AI that only answers one short question at a time",
      "AI that works only for robotics hardware",
      "A chatbot with no memory or tools",
    ],
    correctIndex: 0,
    category: "automation",
    explanation: "Agentic AI extends beyond one-shot output by chaining actions, using tools, and handling multi-step flows.",
    remediationNotes: "Think in terms of delegated work: plan, use tools, check results, and continue.",
    learningObjective: "Recognize what makes an AI workflow agentic",
    tags: ["agentic-ai", "automation"],
  }),
  q(18, {
    questionText: "Why were GitHub Copilot and no-code app builders included in the course?",
    options: [
      "They show prompt-driven AI being applied to real software workflows",
      "They replace the need to understand prompting",
      "They only matter for hardware engineers",
      "They are examples of non-AI software tools",
    ],
    correctIndex: 0,
    category: "automation",
    explanation: "The course links prompt engineering to practical tools people already use for coding and building applications.",
    remediationNotes: "The point is transfer: prompting is not isolated theory. It shows up inside products and workflows.",
    learningObjective: "Connect prompting to software and no-code use cases",
    tags: ["copilot", "no-code"],
  }),
  q(19, {
    questionText: "What is the clearest reason to customize a GPT or assistant with your own context?",
    options: [
      "To make outputs better aligned to a specific project, domain, or source set",
      "To remove the need for good prompts forever",
      "To convert every answer into an image",
      "To bypass review and verification",
    ],
    correctIndex: 0,
    category: "automation",
    explanation: "The course's website-project-plan demo shows that custom context improves relevance because the model is working from your material.",
    remediationNotes: "Customization helps relevance, but you still need clear prompts and quality checks.",
    learningObjective: "Explain the value of custom context in AI assistants",
    tags: ["context", "custom-gpt"],
  }),
  q(20, {
    questionText: "In the data-analysis demo, why is a structured prompt useful for building an Excel dashboard?",
    options: [
      "It helps the AI organize metrics, formulas, and presentation expectations clearly",
      "It makes spreadsheet data unnecessary",
      "It guarantees the dashboard will be visually perfect",
      "It prevents any need to check the formulas",
    ],
    correctIndex: 0,
    category: "ai-applications",
    explanation: "For data work, the prompt has to specify the metrics, layout goals, and analysis task so the AI can produce something actionable.",
    remediationNotes: "Dashboard prompts work best when they name the KPIs, intended audience, and desired output format.",
    learningObjective: "Apply prompting to AI-assisted data analysis",
    tags: ["data-analysis", "excel"],
  }),
  q(21, {
    questionText: "What makes the Python-roadmap education demo a prompt-engineering use case?",
    options: [
      "The prompt tailors a learning path to a learner's goal and current level",
      "The model is writing low-level compiler code",
      "The prompt avoids any structure so the roadmap stays creative",
      "The output depends only on the model temperature",
    ],
    correctIndex: 0,
    category: "ai-applications",
    explanation: "Educational prompting works when the request is scoped to the learner, objective, and format of the roadmap.",
    remediationNotes: "Study-plan prompts should define the learner's starting point, destination, and pacing constraints.",
    learningObjective: "Use prompting to generate tailored learning plans",
    tags: ["education", "roadmaps"],
  }),
  q(22, {
    questionText: "When asking an AI to generate images from text, what usually improves the result most?",
    options: [
      "Specific details about subject, style, mood, and composition",
      "Using the shortest possible prompt every time",
      "Avoiding descriptive adjectives altogether",
      "Leaving the output open to any interpretation",
    ],
    correctIndex: 0,
    category: "creativity",
    explanation: "The course emphasizes that text-to-image prompting works better when the visual direction is explicit.",
    remediationNotes: "If the image looks generic, the prompt was probably generic too.",
    learningObjective: "Write better prompts for image generation",
    tags: ["image-generation", "multimodal"],
  }),
  q(23, {
    questionText: "What is one strong use of multimodal prompting when analyzing images with ChatGPT?",
    options: [
      "Combining the image with a task-specific question about what to inspect",
      "Uploading the image without any instruction",
      "Assuming the model already knows what matters",
      "Replacing the image with a plain text summary only",
    ],
    correctIndex: 0,
    category: "creativity",
    explanation: "Images alone do not define the task. The model still needs a clear instruction such as compare, describe, diagnose, or extract.",
    remediationNotes: "Treat the image as context, not as a full prompt by itself.",
    learningObjective: "Combine visual input with clear textual guidance",
    tags: ["image-analysis", "multimodal"],
  }),
  q(24, {
    questionText: "Why does the course call out tools like OpenAI Codex and LangChain?",
    options: [
      "They show how prompting connects to coding and workflow orchestration",
      "They are only relevant to video editing",
      "They remove the need to understand model behavior",
      "They are examples of hardware accelerators",
    ],
    correctIndex: 0,
    category: "google-tools",
    explanation: "These tools matter because prompt engineering is often embedded inside real development stacks and agent workflows.",
    remediationNotes: "Remember the practical thread of the course: prompting is part of products, toolchains, and systems.",
    learningObjective: "Relate prompting concepts to development tooling",
    tags: ["tools", "coding"],
  }),
  q(25, {
    questionText: "What is the practical role of MCP in the context of this course's tooling section?",
    options: [
      "It is a way for AI systems to connect to tools and external context in a structured way",
      "It is a video compression format",
      "It is a type of image prompt style",
      "It is a benchmark used only for spreadsheet models",
    ],
    correctIndex: 0,
    category: "google-tools",
    explanation: "MCP is covered as part of the newer tool ecosystem around model context and tool access, not as a prompt style.",
    remediationNotes: "Anchor MCP to integration and context exchange, not to content generation alone.",
    learningObjective: "Identify MCP as part of the AI tools stack",
    tags: ["mcp", "tools"],
  }),
  q(26, {
    questionText: "What makes a cinematic video prompt stronger in Google Flow or similar tools?",
    options: [
      "Concrete camera, scene, lighting, and motion direction",
      "Only naming a genre and hoping for the best",
      "Avoiding all visual detail to keep it flexible",
      "Using unrelated technical jargon",
    ],
    correctIndex: 0,
    category: "creativity",
    explanation: "The cinematic prompting section focuses on describing what the viewer should see and how the scene should feel or move.",
    remediationNotes: "If the model does not know the shot, atmosphere, or motion, it has to guess.",
    learningObjective: "Write stronger cinematic prompts for video generation",
    tags: ["video-generation", "google-flow"],
  }),
  q(27, {
    questionText: "In the Google Flow section, what does 'frames to video' refer to?",
    options: [
      "Turning still images or frames into moving video sequences",
      "Reducing a long prompt into four sentences",
      "Exporting text into a storyboard PDF",
      "Converting captions into voice-only output",
    ],
    correctIndex: 0,
    category: "creativity",
    explanation: "The course uses the phrase to describe animating static frames or stills into motion content.",
    remediationNotes: "Associate this feature with motion generation from existing visual material.",
    learningObjective: "Understand frame-based video generation workflows",
    tags: ["video-generation", "multimodal"],
  }),
  q(28, {
    questionText: "What does the 'ingredients to video' idea emphasize?",
    options: [
      "Building a scene from specified characters, objects, and environments",
      "Writing code before generating any media",
      "Avoiding all references in a prompt",
      "Generating audio only",
    ],
    correctIndex: 0,
    category: "creativity",
    explanation: "The prompt becomes stronger when it names the pieces that need to appear and how they fit together.",
    remediationNotes: "Ingredients are scene components. Think assets and environment, not just mood words.",
    learningObjective: "Use scene ingredients to guide media generation",
    tags: ["video-generation", "scene-design"],
  }),
  q(29, {
    questionText: "What is the point of scene builder in an AI video workflow?",
    options: [
      "To arrange and extend clips into a coherent sequence",
      "To tokenize a text prompt for debugging",
      "To remove the need for a storyboard",
      "To translate prompts into a spreadsheet",
    ],
    correctIndex: 0,
    category: "creativity",
    explanation: "Scene builder is about sequencing clips and refining transitions rather than generating a single isolated shot.",
    remediationNotes: "Think editing and narrative flow, not just one-shot generation.",
    learningObjective: "Explain scene sequencing in AI video tools",
    tags: ["video-generation", "workflow"],
  }),
  q(30, {
    questionText: "Why does the course revisit prompt structure later with action verbs, theme, persona, format, exemplar, and tone?",
    options: [
      "Because stronger outputs usually come from combining several prompt controls instead of relying on one",
      "Because prompt structure only matters for social media videos",
      "Because all prompts should use the exact same template",
      "Because tone is the only field that really matters",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "The later module expands prompt structure into a practical framework for shaping outputs across different use cases.",
    remediationNotes: "Prompt quality usually improves when the request gives the model multiple useful anchors.",
    learningObjective: "Use a multi-part structure to design stronger prompts",
    tags: ["prompt-structure", "advanced-techniques"],
  }),
  q(31, {
    questionText: "What is the value of adding an exemplar to a prompt?",
    options: [
      "It gives the model a concrete pattern to imitate",
      "It removes the need for a task description",
      "It always shortens the answer automatically",
      "It locks the model into factual accuracy",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "Examples reduce ambiguity. They show the model what kind of answer shape or style you actually want.",
    remediationNotes: "If the model keeps missing the style, a short example is often more useful than another abstract instruction.",
    learningObjective: "Use exemplars to shape AI output",
    tags: ["few-shot", "prompt-structure"],
  }),
  q(32, {
    questionText: "What is the practical purpose of a prompt library?",
    options: [
      "To save and reuse tested prompts for recurring tasks",
      "To store model weights locally",
      "To avoid ever revising prompts again",
      "To replace documentation for AI tools",
    ],
    correctIndex: 0,
    category: "time-management",
    explanation: "A prompt library turns repeated prompting work into reusable assets, which improves consistency and saves time.",
    remediationNotes: "Keep reusable prompts only after they have been tested and cleaned up for repeat use.",
    learningObjective: "Explain why teams maintain prompt libraries",
    tags: ["prompt-library", "workflow"],
  }),
  q(33, {
    questionText: "How does AI-enhanced research benefit from strong prompting?",
    options: [
      "It lets you steer search, summarization, and organization toward a specific research goal",
      "It removes the need to verify sources",
      "It works best when the research question is left undefined",
      "It only matters for entertainment content",
    ],
    correctIndex: 0,
    category: "ai-applications",
    explanation: "Research prompts work better when they specify what to find, how to summarize it, and what format the output should take.",
    remediationNotes: "Research prompting is stronger when it defines scope, criteria, and desired deliverable.",
    learningObjective: "Apply prompting to research workflows",
    tags: ["research", "summarization"],
  }),
  q(34, {
    questionText: "What does the Canva AI presentation segment show about prompt engineering?",
    options: [
      "Prompting can shape both the content and the structure of presentation outputs",
      "Slides should be generated with no human review",
      "Presentation prompts are unrelated to audience needs",
      "Visual tools do not depend on good instructions",
    ],
    correctIndex: 0,
    category: "ai-applications",
    explanation: "Even when the output is visual, the model still depends on clear goals, audience, and message direction.",
    remediationNotes: "A slide deck prompt should state purpose, audience, tone, and the key points each section must cover.",
    learningObjective: "Use prompting to support AI-generated presentations",
    tags: ["presentations", "content-creation"],
  }),
  q(35, {
    questionText: "What is one sensible way to use ChatGPT for programming according to the course?",
    options: [
      "For code generation, completion, review, and explanation with human verification",
      "As a complete replacement for testing and debugging",
      "Only for writing comments, never code",
      "Without checking whether the output actually runs",
    ],
    correctIndex: 0,
    category: "automation",
    explanation: "The programming section shows AI as a capable assistant, but not as a substitute for developer judgment.",
    remediationNotes: "Treat generated code as a draft that still needs validation, testing, and review.",
    learningObjective: "Use AI coding tools responsibly",
    tags: ["coding", "chatgpt"],
  }),
  q(36, {
    questionText: "What does prompt tuning try to improve over time?",
    options: [
      "The reliability and usefulness of outputs for a recurring task",
      "The physical speed of your computer",
      "The number of monitors in your setup",
      "The model's underlying training corpus directly",
    ],
    correctIndex: 0,
    category: "upskilling",
    explanation: "Prompt tuning is about learning what wording, structure, and context consistently produce better outputs in practice.",
    remediationNotes: "Look for repeatable gains: clearer outputs, fewer corrections, and better fit for the task.",
    learningObjective: "Describe the goal of prompt tuning",
    tags: ["prompt-tuning", "iteration"],
  }),
];

const outlineText = ensureReadable(OUTLINE_PATH);
const transcriptText = ensureReadable(TRANSCRIPT_PATH);

const outlineTopics = outlineText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && /\d/.test(line))
  .slice(0, 12);

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(questions, null, 2)}\n`, "utf8");

console.log(`Track: ${TRACK_NAME}`);
console.log(`Outline: ${OUTLINE_PATH}`);
console.log(`Transcript: ${TRANSCRIPT_PATH}`);
console.log(`Output: ${OUTPUT_PATH}`);
console.log(`Questions written: ${questions.length}`);
console.log(`Outline topics detected: ${outlineTopics.length}`);
console.log(`Transcript size: ${transcriptText.length} characters`);
