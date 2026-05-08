import fs from "node:fs";
import path from "node:path";

const OUTPUT_PATH =
  process.argv[2] ||
  "C:/Users/illpr/Desktop/VIBE CODING PROJECTS/AI STUDY GAME WINDOWS 11/public/questions/genai_on_google_cloud_questions.json";

const TRACK_TAG = "genai-on-google-cloud";
const TRACK_NAME = "GenAI on Google Cloud";

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rotate(items, offset) {
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function makeOptions(correct, wrong, offset) {
  const options = rotate([correct, ...wrong.slice(0, 3)], offset % 4);
  return options;
}

function chooseDistractors(sourceCards, currentCard, field, correctAnswer) {
  const correctLength = correctAnswer.length;
  const candidates = sourceCards
    .filter((card) => card !== currentCard)
    .map((card) => card[field])
    .filter((value) => value && value !== correctAnswer);

  const closest = candidates
    .sort((a, b) => Math.abs(a.length - correctLength) - Math.abs(b.length - correctLength))
    .slice(0, 10);

  const picked = [];
  const add = (value) => {
    if (value && value !== correctAnswer && !picked.includes(value)) picked.push(value);
  };

  add(closest.find((value) => value.length > correctLength));
  add(closest.find((value) => value.length <= correctLength));
  for (const value of closest) add(value);

  return picked.slice(0, 3);
}

function makeQuestion({ uid, questionText, correctAnswer, wrong, category, chapter, concept, explanation, remediation }, variantIndex) {
  const options = makeOptions(correctAnswer, wrong, variantIndex);
  return {
    id: uid,
    uid,
    questionText,
    questionType: "multiple_choice",
    correctAnswer,
    category,
    difficulty: "adaptive",
    options,
    explanation,
    remediationNotes: remediation,
    learningObjective: `${TRACK_NAME}: ${chapter} - ${concept}`,
    tags: [TRACK_TAG, chapter.toLowerCase().replace(/\s+/g, "-"), category],
    option_a: options[0],
    option_b: options[1],
    option_c: options[2],
    option_d: options[3],
  };
}

const cards = [
  {
    chapter: "Chapter 1",
    category: "genai-gcp-foundations",
    concept: "LLM application challenge",
    definition: "Building LLM apps requires managing non-determinism, context, evaluation, security, cost, and deployment together",
    when: "Use it as the framing model when moving from a demo prompt to a production LLM application",
    pitfall: "Treating a working prompt as a production system",
    production: "It reminds teams to plan for reliability, monitoring, drift, and maintenance before launch",
    wrong: ["Writing a single clever prompt is enough for production", "The only hard part is choosing a UI framework", "LLM applications do not need evaluation once they respond"],
  },
  {
    chapter: "Chapter 1",
    category: "genai-gcp-foundations",
    concept: "SLM vs LLM tradeoff",
    definition: "Small language models favor narrow tasks, lower latency, and lighter infrastructure; LLMs favor broad reasoning and versatility",
    when: "Choose an SLM when the job is narrow, latency-sensitive, or resource-constrained",
    pitfall: "Using a large model by default when a smaller one can meet the task requirement",
    production: "The tradeoff controls cost, latency, deployment options, and user experience",
    wrong: ["SLMs are always more accurate than LLMs", "LLMs are required for every classification task", "Model size has no effect on deployment cost"],
  },
  {
    chapter: "Chapter 1",
    category: "genai-gcp-foundations",
    concept: "Agent components",
    definition: "An agent combines a model, tools, orchestration, and runtime",
    when: "Use the component model when designing an agent that must reason, act, coordinate steps, and run reliably",
    pitfall: "Calling a chatbot an agent even when it has no tools, orchestration, or runtime strategy",
    production: "The four-part model makes ownership and failure points easier to identify",
    wrong: ["An agent only needs a prompt and a logo", "Tools replace the need for a model", "Runtime is unrelated to agent reliability"],
  },
  {
    chapter: "Chapter 1",
    category: "genai-gcp-foundations",
    concept: "Prompt engineering",
    definition: "Prompt engineering shapes model behavior by giving clear task, context, constraints, and output guidance",
    when: "Start with prompt engineering when the model has the knowledge but needs better instruction",
    pitfall: "Using vague prompts and blaming the model for predictable generic output",
    production: "Good prompts reduce ambiguity and make outputs easier to evaluate",
    wrong: ["Prompt engineering changes the model weights", "Prompt engineering is only for image generation", "Prompt engineering removes the need for verification"],
  },
  {
    chapter: "Chapter 1",
    category: "genai-gcp-foundations",
    concept: "System instructions",
    definition: "System instructions define persistent behavior, boundaries, and role expectations for the model",
    when: "Use them when the application needs consistent behavior across many user turns",
    pitfall: "Putting all durable behavior rules into ad hoc user prompts",
    production: "They make assistant behavior more consistent and easier to govern",
    wrong: ["System instructions are temporary user messages", "They only control font size", "They replace all safety testing"],
  },
  {
    chapter: "Chapter 1",
    category: "genai-gcp-foundations",
    concept: "Controlled generation",
    definition: "Controlled generation constrains output structure, such as requiring JSON or a schema",
    when: "Use it when downstream systems need predictable machine-readable output",
    pitfall: "Expecting free-form prose to behave like a stable API contract",
    production: "It reduces parsing failures and makes integration with apps and workflows safer",
    wrong: ["It means raising temperature for creativity", "It is the same as vector search", "It only matters for video generation"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-data-readiness",
    concept: "Data discoverability",
    definition: "Discoverability means teams can find relevant data, owners, lineage, freshness, and meaning",
    when: "Prioritize it when useful data exists but teams cannot locate or understand it",
    pitfall: "Assuming scattered data is usable just because it exists somewhere",
    production: "Discoverable data shortens project time and reduces duplicated data preparation work",
    wrong: ["Discoverability means all data is public", "It only refers to file names", "It is unrelated to governance"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-data-readiness",
    concept: "Data accessibility",
    definition: "Accessibility means the right systems and users can retrieve the right data at the right time",
    when: "Focus on it when access bottlenecks stop models, agents, or teams from using approved data",
    pitfall: "Confusing access with lack of security controls",
    production: "It keeps AI workflows from becoming blocked by manual data handoffs",
    wrong: ["Accessibility means every user gets every dataset", "It is only a dashboard feature", "It matters only after deployment"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-data-readiness",
    concept: "Data quality",
    definition: "Data quality covers consistency, completeness, cleanliness, and fitness for LLM use",
    when: "Prioritize it when models hallucinate or fail because source data is stale, conflicting, or incomplete",
    pitfall: "Treating embeddings as a fix for bad source data",
    production: "Better data quality improves answer reliability before any model optimization begins",
    wrong: ["Quality is only about file size", "Vector databases automatically fix wrong facts", "Bad source data improves RAG diversity"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-data-readiness",
    concept: "Document processing",
    definition: "Document processing extracts usable structure from unstructured documents such as PDFs, forms, and scans",
    when: "Use Document AI or multimodal extraction when layout and fields matter",
    pitfall: "Chunking messy documents before extracting their structure",
    production: "Clean extraction improves retrieval quality and reduces context noise",
    wrong: ["Document processing means storing raw PDFs only", "It is unrelated to RAG", "It replaces all metadata"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-rag-systems",
    concept: "Metadata filtering",
    definition: "Metadata filtering constrains retrieval by structured facts such as permissions, dates, product lines, or document type",
    when: "Use it when semantic similarity alone might retrieve plausible but irrelevant context",
    pitfall: "Searching only strings when the application needs things with attributes",
    production: "It prevents the model from grounding answers in content the user should not or does not need to see",
    wrong: ["Metadata filtering replaces embeddings", "It is only for image search", "It makes access control unnecessary"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-rag-systems",
    concept: "Hybrid search",
    definition: "Hybrid search combines semantic vector search with keyword or structured search",
    when: "Use it when both conceptual similarity and exact terms matter",
    pitfall: "Relying on vector search when exact product names, codes, or legal terms must match",
    production: "Hybrid retrieval improves recall and precision in enterprise knowledge systems",
    wrong: ["Hybrid search means using two chatbots", "Keyword search is always obsolete", "Hybrid search is only for model training"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-rag-systems",
    concept: "Cloud SQL pgvector with HNSW",
    definition: "Cloud SQL PostgreSQL with pgvector and HNSW supports low-latency vector search beside relational data",
    when: "Use it when enterprise RAG needs SQL joins and vector search in one operational store",
    pitfall: "Separating vectors from business data when the answer depends on both",
    production: "It supports hybrid queries with familiar operational database controls",
    wrong: ["HNSW is a prompt style", "pgvector is only for image generation", "SQL joins cannot be useful in RAG"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-rag-systems",
    concept: "GraphRAG",
    definition: "GraphRAG retrieves entities and relationships so answers can use how things are connected",
    when: "Use it when relationship context disambiguates similar terms or entities",
    pitfall: "Expecting vector similarity alone to understand business relationships",
    production: "It reduces semantic confusion in domains where relationships carry meaning",
    wrong: ["GraphRAG is just a prettier vector index", "GraphRAG removes the need for source data", "GraphRAG only works for charts"],
  },
  {
    chapter: "Chapter 2",
    category: "genai-gcp-rag-systems",
    concept: "Agentic RAG",
    definition: "Agentic RAG uses planning and specialized retrievers to gather and synthesize context from multiple sources",
    when: "Use it when one retrieval path cannot answer a complex multi-source question",
    pitfall: "Building one giant retriever for every data source and task",
    production: "It separates planning, retrieval specialization, and synthesis for more maintainable systems",
    wrong: ["Agentic RAG means no retrieval is needed", "It only works with static FAQs", "It is the same as prompt lengthening"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "ADK declarative agent definition",
    definition: "ADK lets developers define agents by name, model, instructions, tools, and subagents while the framework handles runtime mechanics",
    when: "Use ADK when you want to focus on agent behavior instead of building the event loop yourself",
    pitfall: "Hand-rolling conversation orchestration before using the framework's runtime",
    production: "It standardizes agent structure and reduces custom runtime code",
    wrong: ["ADK is only a UI theme", "ADK requires every tool to be remote", "ADK removes the need for instructions"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "Tools vs subagents",
    definition: "Tools are best for deterministic fixed-parameter operations; subagents are best for specialist reasoning and conversation",
    when: "Use a tool for lookups or actions, and a subagent for judgment-heavy domain work",
    pitfall: "Turning every deterministic API call into a conversational subagent",
    production: "The split keeps systems faster, clearer, and easier to maintain",
    wrong: ["Tools and subagents are always interchangeable", "Subagents are faster for every database lookup", "Tools cannot accept parameters"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "temp state scope",
    definition: "The temp scope stores session-only data that disappears after the conversation",
    when: "Use temp state for verification codes, transient filters, and session-only scratch data",
    pitfall: "Saving long-term preferences in temp state",
    production: "It prevents temporary data from leaking into future sessions",
    wrong: ["temp state is shared by every user forever", "temp state is a database backup", "temp state replaces user profiles"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "user state scope",
    definition: "The user scope stores data that persists for one user across sessions",
    when: "Use user state for preferences, history, and personalization tied to a specific user",
    pitfall: "Putting per-user preferences in app-wide state",
    production: "It supports personalization without mixing users together",
    wrong: ["user state resets after every message", "user state is shared globally", "user state is only for UI color"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "app state scope",
    definition: "The app scope stores system-wide data shared across users",
    when: "Use app state for business rules, policies, and global configuration",
    pitfall: "Putting private user data into shared app state",
    production: "It centralizes rules that should apply consistently to every user",
    wrong: ["app state belongs to only one user", "app state is always deleted after one session", "app state is for image files only"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "Vertex AI Memory Bank",
    definition: "Memory Bank stores and retrieves semantic memories extracted from prior conversations",
    when: "Use it when personalization depends on conversational insights rather than fixed keys alone",
    pitfall: "Expecting structured state keys to capture every useful conversational memory",
    production: "It enables cross-session personalization while keeping agent instructions clean",
    wrong: ["Memory Bank is a spreadsheet export", "Memory Bank replaces every database", "Memory Bank only stores exact keyword matches"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "Multimodal artifacts",
    definition: "ADK can process multimodal content and store generated artifacts such as images or repair guides",
    when: "Use artifacts when an agent needs to create or preserve files beyond a plain text response",
    pitfall: "Treating every output as disposable chat text",
    production: "Artifact handling lets agents create durable outputs with clear scope",
    wrong: ["Artifacts are only console logs", "Multimodal agents cannot store outputs", "Artifacts replace user state"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "Live API streaming",
    definition: "Live API streaming supports real-time voice or low-latency interactive agent experiences",
    when: "Use it for voice-enabled agents and interactions where response timing matters",
    pitfall: "Using batch-style request-response for a live conversational experience",
    production: "Streaming improves perceived latency and enables more natural interaction",
    wrong: ["Streaming is only for file uploads", "Live API means no model is used", "Streaming makes state irrelevant"],
  },
  {
    chapter: "Chapter 3",
    category: "genai-gcp-adk-agents",
    concept: "Callbacks vs plugins",
    definition: "Callbacks customize behavior for a specific agent; plugins apply broader organization-wide policies",
    when: "Use callbacks for agent-specific hooks and plugins for shared security, audit, or compliance behavior",
    pitfall: "Copying the same compliance callback into every agent instead of using a shared plugin",
    production: "The split keeps policy enforcement consistent without bloating individual agents",
    wrong: ["Callbacks and plugins are unrelated to compliance", "Plugins can only style the UI", "Callbacks only work in notebooks"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "Monolithic agent antipattern",
    definition: "A monolithic super-agent combines too many domains, instructions, and tools into one brittle agent",
    when: "Recognize it when one agent must handle many conflicting specialist responsibilities",
    pitfall: "Adding more instructions and tools to fix an agent that already has tool paralysis",
    production: "Avoiding the antipattern improves maintainability, routing, and team ownership",
    wrong: ["A single giant agent always scales best", "More tools always make selection easier", "Instruction conflicts disappear in production"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "SequentialAgent",
    definition: "SequentialAgent runs agents in a fixed order where later steps depend on earlier outputs",
    when: "Use it for assembly-line workflows with dependencies",
    pitfall: "Using sequential execution for independent tasks that could run in parallel",
    production: "It makes ordered dependencies explicit and easier to trace",
    wrong: ["SequentialAgent runs every task concurrently", "SequentialAgent is only for UI navigation", "SequentialAgent ignores prior outputs"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "ParallelAgent",
    definition: "ParallelAgent runs independent agents concurrently and then combines their results",
    when: "Use it when tasks do not depend on each other and latency matters",
    pitfall: "Running independent checks one after another for no reason",
    production: "It can reduce latency by letting specialists work at the same time",
    wrong: ["ParallelAgent requires every task to depend on the last one", "ParallelAgent is slower by design", "ParallelAgent prevents synthesis"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "LoopAgent",
    definition: "LoopAgent repeats a workflow for iterative refinement, retries, or trial-and-error",
    when: "Use it when the task needs repeated attempts until a condition is met or a limit is reached",
    pitfall: "Forgetting termination criteria and creating runaway loops",
    production: "A bounded loop supports refinement without uncontrolled execution",
    wrong: ["LoopAgent always runs exactly once", "LoopAgent removes the need for max iterations", "LoopAgent is only for billing systems"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "output_key state passing",
    definition: "output_key saves an agent output into shared state so another agent can read it with a placeholder",
    when: "Use it when one agent's result should become context for a later agent",
    pitfall: "Relying on hidden conversational memory when explicit state passing is needed",
    production: "Explicit state passing makes workflow dataflow inspectable and testable",
    wrong: ["output_key deletes all state", "output_key is only for CSS", "Placeholders cannot read saved state"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "MCP",
    definition: "Model Context Protocol provides structured stateless access to external tools and resources",
    when: "Use MCP for request-response operations such as database queries, APIs, or file access",
    pitfall: "Using A2A when the task is only a stateless tool call",
    production: "MCP gives agents standardized tool access across service boundaries",
    wrong: ["MCP is a human review rubric", "MCP is only for image prompts", "MCP requires multi-turn conversation history"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "A2A",
    definition: "Agent-to-Agent protocol supports stateful delegation to remote agents",
    when: "Use A2A when a specialist agent needs conversational context and judgment",
    pitfall: "Using a stateless tool protocol for complex delegated reasoning",
    production: "A2A lets independently owned agents collaborate across network and team boundaries",
    wrong: ["A2A is only a vector index", "A2A removes authentication needs", "A2A is for single SQL queries only"],
  },
  {
    chapter: "Chapter 4",
    category: "genai-gcp-multiagent",
    concept: "AgentCard",
    definition: "An AgentCard publishes a remote agent's capabilities, version, authentication, and extensions",
    when: "Use it so clients can discover what an A2A agent can do and how to call it",
    pitfall: "Hard-coding remote agent assumptions instead of reading its advertised contract",
    production: "It supports discovery, compatibility, and safer version evolution",
    wrong: ["AgentCard stores model weights", "AgentCard is a user flashcard", "AgentCard replaces authentication"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "Five evaluation dimensions",
    definition: "LLM systems should be evaluated for output quality, task success, performance, robustness, and safety",
    when: "Use the five dimensions when designing an evaluation plan for an LLM app or agent",
    pitfall: "Measuring only answer fluency and ignoring task completion or safety",
    production: "The dimensions prevent teams from optimizing one metric while missing major risks",
    wrong: ["Evaluation is only grammar checking", "Latency is never part of evaluation", "Safety can be skipped if output sounds confident"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "Human evaluation",
    definition: "Human evaluation uses people and rubrics to judge qualities automated metrics miss",
    when: "Use it for helpfulness, tone, subtle safety issues, and edge cases",
    pitfall: "Assuming automated scores capture every user-facing quality",
    production: "Human review catches nuance before it becomes user harm or product debt",
    wrong: ["Human evaluation is only for speed testing", "Humans cannot use rubrics", "Human review is useless for subjective quality"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "Reference-based metrics",
    definition: "Reference-based metrics compare model output against a known expected answer or text",
    when: "Use them when good reference outputs exist, such as summarization or extraction tasks",
    pitfall: "Using ROUGE or BLEU as the only judge for open-ended answers",
    production: "They provide repeatable checks but should be paired with human or model-based judgment for nuance",
    wrong: ["Reference metrics require no reference output", "ROUGE measures cloud spend", "BLEU is a deployment platform"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "Tool usage metrics",
    definition: "Tool usage metrics check whether an agent selected valid tools and supplied correct parameters",
    when: "Use them for agent workflows where choosing and calling tools matters",
    pitfall: "Only grading the final answer while ignoring wrong or unnecessary tool calls",
    production: "They expose whether the agent can act correctly, not just write convincingly",
    wrong: ["Tool metrics only check font style", "Tool calls never need validation", "Parameter correctness is unrelated to agents"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "Trajectory metrics",
    definition: "Trajectory metrics evaluate the sequence of agent actions against expected paths",
    when: "Use them when the order or set of steps matters for task completion",
    pitfall: "Accepting a good-looking final answer after a wasteful or unsafe action sequence",
    production: "They help detect inefficient, missing, or risky agent behavior",
    wrong: ["Trajectory metrics only evaluate spelling", "Action order can never matter", "Trajectory metrics are only for image models"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "LLM-as-judge",
    definition: "LLM-as-judge uses a model to score outputs against a rubric or criteria",
    when: "Use it to scale subjective evaluation while still calibrating with human review",
    pitfall: "Treating an LLM judge as infallible and never checking calibration",
    production: "It can make continuous quality checks feasible for large output volumes",
    wrong: ["LLM-as-judge requires no rubric", "It only works for SQL databases", "It replaces all test data management"],
  },
  {
    chapter: "Chapter 5",
    category: "genai-gcp-evaluation",
    concept: "Continuous evaluation",
    definition: "Continuous evaluation samples production behavior and routes it through automated metrics, alerts, and periodic human review",
    when: "Use it after launch to detect regressions, drift, and new edge cases",
    pitfall: "Running one pre-launch test set and never evaluating production behavior again",
    production: "It turns evaluation into an operating loop rather than a one-time gate",
    wrong: ["Continuous evaluation stops after deployment", "It only counts page views", "It has no role in alerting"],
  },
  {
    chapter: "Chapter 6",
    category: "genai-gcp-tuning-infra",
    concept: "Optimization spectrum",
    definition: "The spectrum runs from prompt engineering and RAG through soft prompts, LoRA or QLoRA, and full fine-tuning",
    when: "Use the leftmost approach that solves the problem before moving to heavier adaptation",
    pitfall: "Jumping to full fine-tuning before trying prompting or retrieval",
    production: "It keeps teams from paying training and maintenance costs they do not need",
    wrong: ["Full fine-tuning should always be first", "Prompt engineering changes every model weight", "RAG requires retraining the base model"],
  },
  {
    chapter: "Chapter 6",
    category: "genai-gcp-tuning-infra",
    concept: "Knowledge vs behavior",
    definition: "Knowledge is what the model knows; behavior is how it responds",
    when: "Use RAG for changing knowledge and fine-tuning for stable behavior patterns",
    pitfall: "Fine-tuning facts that change often instead of retrieving them",
    production: "The distinction prevents stale models and expensive retraining cycles",
    wrong: ["Knowledge and behavior require the same fix", "RAG is best for learning tone", "Fine-tuning is the cleanest way to update daily policies"],
  },
  {
    chapter: "Chapter 6",
    category: "genai-gcp-tuning-infra",
    concept: "QLoRA",
    definition: "QLoRA combines 4-bit quantization with low-rank adapter training",
    when: "Use it when you need parameter-efficient adaptation of a large open model",
    pitfall: "Assuming every fine-tune requires updating all model weights",
    production: "It reduces memory requirements and makes tuning large models more practical",
    wrong: ["QLoRA is a vector search algorithm", "QLoRA removes the need for training data quality", "QLoRA means full-precision full-model retraining"],
  },
  {
    chapter: "Chapter 6",
    category: "genai-gcp-tuning-infra",
    concept: "Catastrophic forgetting",
    definition: "Catastrophic forgetting happens when fine-tuning damages useful base-model capabilities",
    when: "Watch for it after model adaptation, especially with narrow or low-quality training data",
    pitfall: "Only testing the fine-tuned task and ignoring general capabilities",
    production: "Detecting it prevents a tuned model from becoming brittle outside the training examples",
    wrong: ["Forgetting improves broad reasoning", "It only affects UI state", "It cannot happen with training data"],
  },
  {
    chapter: "Chapter 6",
    category: "genai-gcp-tuning-infra",
    concept: "PagedAttention",
    definition: "PagedAttention improves KV-cache memory management for high-throughput LLM serving",
    when: "Use vLLM and PagedAttention when serving workloads need better batching and memory efficiency",
    pitfall: "Assuming inference bottlenecks are always solved by a larger model",
    production: "It improves throughput and lets serving infrastructure handle more concurrent requests",
    wrong: ["PagedAttention is a prompt template", "It stores business metadata", "It is only for human evaluation"],
  },
  {
    chapter: "Chapter 6",
    category: "genai-gcp-tuning-infra",
    concept: "Deployment platform selection",
    definition: "Platform choice balances traffic pattern, control, cost, GPU needs, and operational burden",
    when: "Choose among Agent Engine, Cloud Run, GKE, and Vertex AI Prediction based on workload needs",
    pitfall: "Deploying every model on the most complex platform by default",
    production: "The right platform keeps reliability and cost aligned with real usage",
    wrong: ["Cloud Run is always best for every GPU workload", "GKE has no operational burden", "Platform choice has no effect on cost"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "AgentOps evolution",
    definition: "AgentOps extends MLOps and GenAI Ops to autonomous systems that plan, call tools, and complete tasks",
    when: "Use the AgentOps lens for production agents rather than single prediction models",
    pitfall: "Monitoring only model accuracy while ignoring task completion and tool behavior",
    production: "It matches operations to what agents actually do in the world",
    wrong: ["AgentOps is just monthly billing review", "Agents need less monitoring than static models", "Tool calls are outside operational concern"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "Role clarity matrix",
    definition: "The role clarity matrix defines who owns model training, CI/CD, monitoring, incidents, data, and cost work",
    when: "Use it when production AI work has duplicated effort or unclear handoffs",
    pitfall: "Letting every incident become everyone's responsibility with no primary owner",
    production: "Clear ownership speeds incident response and reduces operational gaps",
    wrong: ["Role clarity slows incidents by design", "Only one person should own every MLOps task", "Data engineers never affect AI reliability"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "Retraining triggers",
    definition: "Retraining triggers use metrics such as accuracy drops, drift, new data patterns, and business impact to decide when to retrain",
    when: "Use them when model performance changes or the domain shifts",
    pitfall: "Retraining on a calendar even when no meaningful trigger exists",
    production: "Trigger-based retraining keeps models current without wasting compute",
    wrong: ["Retraining should ignore drift", "Every model must retrain daily", "Business impact is unrelated to retraining"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "Cost attribution",
    definition: "Cost attribution maps AI spend to requests, teams, products, departments, or agents",
    when: "Use it when shared AI infrastructure makes spending hard to explain",
    pitfall: "Letting all AI costs sit in one undifferentiated cloud bill",
    production: "It supports FinOps, budgeting, chargeback, and optimization decisions",
    wrong: ["AI costs cannot be tagged", "Cost attribution only matters before launch", "Agent-level costs are impossible to track"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "Circuit breakers",
    definition: "Circuit breakers stop or route risky operations when latency, cost, quality, or safety thresholds are crossed",
    when: "Use them for production systems that need protective limits and fallbacks",
    pitfall: "Allowing runaway cost or unsafe low-confidence output without intervention",
    production: "They prevent local failures from becoming expensive or harmful incidents",
    wrong: ["Circuit breakers are only electrical hardware", "They make monitoring unnecessary", "They should trigger only after users complain"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "Model approval workflow",
    definition: "Model approval includes technical, business, compliance, and ethical gates before production promotion",
    when: "Use it for models whose failures create product, legal, security, or fairness risk",
    pitfall: "Letting technical pass alone imply production readiness",
    production: "Multi-stakeholder approval catches risks one team cannot see alone",
    wrong: ["Approval is only a GPU benchmark", "Compliance review is never relevant", "Business value should not affect deployment"],
  },
  {
    chapter: "Chapter 7",
    category: "genai-gcp-agentops",
    concept: "Semantic drift",
    definition: "Semantic drift is a shift in output meaning, tone, or embedding distribution over time",
    when: "Monitor it when LLM outputs must stay aligned to expected behavior",
    pitfall: "Only tracking uptime while response meaning quietly changes",
    production: "Semantic drift detection surfaces regressions that simple infrastructure metrics miss",
    wrong: ["Semantic drift is just a spelling error", "It can only happen in tabular models", "Embeddings are useless for drift checks"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Maturity dimensions",
    definition: "The framework assesses Vision and Leadership, Talent and Culture, and Operational and Technical maturity",
    when: "Use the dimensions to diagnose why AI work is or is not scaling",
    pitfall: "Treating maturity as a tooling problem only",
    production: "The dimensions expose whether strategy, people, and systems are advancing together",
    wrong: ["The only dimension is GPU availability", "Culture has no effect on AI adoption", "Leadership does not affect AI outcomes"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Tactical phase",
    definition: "The tactical phase is ad hoc, siloed, and often stuck in pilot purgatory",
    when: "Use the tactical label when pilots exist but governance, funding, and production paths are weak",
    pitfall: "Mistaking many experiments for mature AI capability",
    production: "Naming the phase helps teams prioritize governance and repeatability",
    wrong: ["Tactical means fully automated AIOps", "Tactical organizations have no pilots", "Tactical phase is the same as transformational"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Strategic phase",
    definition: "The strategic phase has executive sponsorship, repeatable governance, and centralized MLOps capability",
    when: "Use the strategic target when moving beyond isolated pilots into scalable production practices",
    pitfall: "Building platforms without linking them to business priorities",
    production: "Strategic maturity creates repeatable delivery and governance",
    wrong: ["Strategic means no governance is needed", "Strategic maturity depends only on individual heroics", "Strategic teams avoid evaluation"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Transformational phase",
    definition: "The transformational phase embeds AI into business models, culture, and self-optimizing operations",
    when: "Use it as the long-term target after strategic capabilities are already working",
    pitfall: "Claiming transformation before repeatable governance and MLOps exist",
    production: "It describes AI as a sustained operating capability, not a side project",
    wrong: ["Transformational means no humans are involved", "Transformational maturity comes before strategy", "Transformational systems avoid monitoring"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Dimension interdependencies",
    definition: "Vision funds direction, talent builds capability, and operations demonstrate value back to leadership",
    when: "Use interdependency analysis when one maturity dimension is strong but progress still stalls",
    pitfall: "Optimizing one dimension while ignoring the weakest one",
    production: "Balanced maturity prevents strong tooling, weak vision, or weak talent from blocking scale",
    wrong: ["Each dimension matures independently", "Operations can permanently compensate for no strategy", "Talent does not need platform support"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Build vs buy",
    definition: "Build when AI is differentiated or depends on unique data; buy when the capability is mature and non-differentiated",
    when: "Use it to decide whether to create custom systems or adopt managed solutions",
    pitfall: "Building commodity capabilities slowly when a managed service meets the need",
    production: "The decision focuses engineering effort where it creates real advantage",
    wrong: ["Always build every AI tool yourself", "Always buy even for proprietary differentiators", "Team expertise does not matter"],
  },
  {
    chapter: "Chapter 8",
    category: "genai-gcp-maturity",
    concept: "Hybrid AI organization",
    definition: "A hybrid model combines a central platform team with embedded domain AI practitioners",
    when: "Use it when you need shared standards and fast domain-specific execution",
    pitfall: "Choosing pure centralization or pure federation when the organization needs both",
    production: "Hybrid structure balances governance with local business context",
    wrong: ["Hybrid means no central standards", "Embedded teams should never talk to the platform team", "Central platforms prevent domain expertise"],
  },
];

const questionBuilders = [
  (card, n, selectedCards) => ({
    uid: `genai_gcp_${String(n).padStart(3, "0")}_${slug(card.concept)}_definition`,
    questionText: `Which statement best describes ${card.concept} in ${card.chapter}?`,
    correctAnswer: card.definition,
    wrong: chooseDistractors(selectedCards, card, "definition", card.definition),
    explanation: `${card.concept} is defined in the material as: ${card.definition}.`,
    remediation: `Anchor the concept to its job: ${card.when}.`,
  }),
  (card, n, selectedCards) => ({
    uid: `genai_gcp_${String(n).padStart(3, "0")}_${slug(card.concept)}_when`,
    questionText: `When should you use or pay attention to ${card.concept}?`,
    correctAnswer: card.when,
    wrong: chooseDistractors(selectedCards, card, "when", card.when),
    explanation: `The useful trigger for ${card.concept} is: ${card.when}.`,
    remediation: `Ask what problem the concept solves before memorizing the term.`,
  }),
  (card, n, selectedCards) => ({
    uid: `genai_gcp_${String(n).padStart(3, "0")}_${slug(card.concept)}_pitfall`,
    questionText: `What mistake should you avoid with ${card.concept}?`,
    correctAnswer: card.pitfall,
    wrong: chooseDistractors(selectedCards, card, "pitfall", card.pitfall),
    explanation: `A common failure mode is ${card.pitfall}. The material repeatedly frames this as a practical design risk, not trivia.`,
    remediation: `Pair the term with its failure mode: ${card.pitfall}.`,
  }),
  (card, n, selectedCards) => ({
    uid: `genai_gcp_${String(n).padStart(3, "0")}_${slug(card.concept)}_production`,
    questionText: `Why does ${card.concept} matter for production GenAI systems?`,
    correctAnswer: card.production,
    wrong: chooseDistractors(selectedCards, card, "production", card.production),
    explanation: `${card.production}. That is why this concept belongs in a production-readiness study track.`,
    remediation: `Connect the concept to production impact, not just its definition.`,
  }),
];

const chapterQuotas = new Map([
  ["Chapter 1", 6],
  ["Chapter 2", 8],
  ["Chapter 3", 8],
  ["Chapter 4", 7],
  ["Chapter 5", 6],
  ["Chapter 6", 5],
  ["Chapter 7", 5],
  ["Chapter 8", 5],
]);

const chapterCounts = new Map();
const selectedCards = cards.filter((card) => {
  const used = chapterCounts.get(card.chapter) || 0;
  const quota = chapterQuotas.get(card.chapter) || 0;
  if (used >= quota) return false;
  chapterCounts.set(card.chapter, used + 1);
  return true;
});

const questions = [];
let index = 1;
for (const card of selectedCards) {
  for (let variant = 0; variant < questionBuilders.length; variant += 1) {
    const payload = questionBuilders[variant](card, index, selectedCards);
    questions.push(
      makeQuestion(
        {
          ...payload,
          category: card.category,
          chapter: card.chapter,
          concept: card.concept,
        },
        index + variant,
      ),
    );
    index += 1;
  }
}

const seenPrompts = new Set();
const seenIds = new Set();
const errors = [];
let correctIsLongest = 0;
for (const q of questions) {
  if (seenIds.has(q.uid)) errors.push(`Duplicate uid: ${q.uid}`);
  seenIds.add(q.uid);
  if (seenPrompts.has(q.questionText)) errors.push(`Duplicate prompt: ${q.questionText}`);
  seenPrompts.add(q.questionText);
  if (q.options.length !== 4) errors.push(`Wrong option count: ${q.uid}`);
  if (!q.options.includes(q.correctAnswer)) errors.push(`Correct answer missing from options: ${q.uid}`);
  if (new Set(q.options).size !== q.options.length) errors.push(`Duplicate option in ${q.uid}`);
  const maxLength = Math.max(...q.options.map((option) => option.length));
  if (q.correctAnswer.length === maxLength) correctIsLongest += 1;
}

if (questions.length !== 200) {
  errors.push(`Expected 200 questions, got ${questions.length}`);
}

if (correctIsLongest / questions.length > 0.4) {
  errors.push(`Length bias too high: correct answer is longest ${correctIsLongest}/${questions.length}`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(questions, null, 2)}\n`, "utf8");

console.log(`Track: ${TRACK_NAME}`);
console.log(`Output: ${OUTPUT_PATH}`);
console.log(`Questions written: ${questions.length}`);
console.log(`Correct answer longest: ${correctIsLongest}/${questions.length}`);
