import fs from 'fs';
import path from 'path';

const root = process.cwd();
const questionsDir = path.join(root, 'public', 'questions');

const optionKeys = [
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option_e',
  'option_f',
  'option_g',
  'option_h',
  'option_i'
];

const boilerplateSuffixes = [
  /,\s*which includes multiple layers of processing and validation steps$/i,
  /,\s*which is a common alternative approach but not the primary mechanism$/i,
  /,\s*through advanced machine learning methodologies and statistical analysis$/i,
  /,\s*involving sophisticated algorithms and complex computational mechanisms$/i,
  /,\s*featuring built-in safeguards and constraint-based validation frameworks$/i,
  /,\s*including specialized techniques for handling edge cases and exceptions$/i,
  /,\s*which incorporates feedback mechanisms and continuous optimization$/i,
  /,\s*with comprehensive integration across multiple systems and protocols$/i,
  /,\s*requiring extensive training data and iterative refinement processes$/i,
  /,\s*within the core architecture and operational framework$/i,
  /,\s*implementing specialized algorithms with multi-layer validation$/i,
  /,\s*through comprehensive training and iterative improvement cycles$/i,
  /,\s*across most enterprise systems and workflows$/i,
  /,\s*by implementing specialized protocols and validation mechanisms$/i,
  /\s+using advanced computational methods and algorithms$/i,
  /\s+with multiple redundancy layers and fallback procedures$/i
];

const compressionRules = [
  [/;\s*answer ['"][^'"]+['"] explicitly$/i, ''],
  [/\bthe statistically most likely\b/gi, 'the most likely'],
  [/\bbased on training patterns\b/gi, 'from learned patterns'],
  [/\bthat enhances human capability\b/gi, 'that extends human capability'],
  [/\bto finish work\b/gi, 'to finish tasks'],
  [/\bto check for consistent bias patterns\b/gi, 'to check for bias'],
  [/\bacross any domain\b/gi, 'across domains'],
  [/\bwhere each builds on the previous output\b/gi, 'with each step using the previous output'],
  [/\bcan go undetected and cause harm\b/gi, 'can slip through and cause harm'],
  [/\bthat vary key demographic factors\b/gi, 'across demographic variations'],
  [/\bwhat is the primary\b/gi, 'the main'],
  [/\bwhat is a limitation of relying solely on\b/gi, 'a limitation of using'],
  [/\bwithout fact-checking because the AI is ['"][^'"]+['"]/gi, 'without fact-checking'],
  [/\bwould perform any intellectual task a human can\b/gi, 'would handle any intellectual task a human can'],
  [/\bto verify, validate\b/gi, 'to review and validate']
];

const syntheticPaddingPatterns = [
  /,\s*which is often treated as good enough in routine work/gi,
  /,\s*especially when speed matters more than precision/gi,
  /\s+in most practical situations/gi,
  /\s+in most routine use cases/gi,
  /,\s*because a simpler workflow is usually preferred/gi,
  /,\s*even if that leaves some nuance unresolved/gi,
  /,\s*usually because a different issue is considered the root cause/gi,
  /\s+as the main step before doing anything else/gi,
  /\s+and treat that as sufficient for the situation/gi,
  /\s+for routine work/gi,
  /\s+for routine use/gi,
  /\s+in standard workflows/gi,
  /\s+for most teams/gi,
  /\s+in every workflow/gi,
  /\s+in normal use/gi
];

function normalizeText(text) {
  if (text == null) return text;
  let next = String(text)
    .replace(/â€”/g, '-')
    .replace(/â€œ|â€�/g, '"')
    .replace(/â€™/g, "'")
    .replace(/\s{2,}/g, ' ');

  for (const pattern of syntheticPaddingPatterns) {
    next = next.replace(pattern, '');
  }

  next = next.replace(
    /\s+(?:in practice|for typical teams|as a default rule|by default|for many teams)(?:\s+(?:in practice|for typical teams|as a default rule|by default|for many teams))+/gi,
    ' in most cases'
  );

  return dedupeRepeatedTail(next).trim();
}

function dedupeRepeatedTail(text) {
  let next = text.replace(/\s{2,}/g, ' ').trim();
  const separators = [',', ';'];

  for (const separator of separators) {
    const pattern = new RegExp(`(${separator}\\s*[^${separator}]+)\\1+$`, 'i');
    next = next.replace(pattern, '$1');
  }

  let changed = true;
  while (changed) {
    changed = false;
    const words = next.split(/\s+/);
    for (let size = Math.min(10, Math.floor(words.length / 2)); size >= 2; size -= 1) {
      const tail = words.slice(-size).join(' ').toLowerCase();
      const previous = words.slice(-size * 2, -size).join(' ').toLowerCase();
      if (tail && tail === previous) {
        next = words.slice(0, -size).join(' ');
        changed = true;
        break;
      }
    }
  }

  return next.replace(/\s{2,}/g, ' ').trim();
}

function trimBoilerplate(text) {
  if (!text) return text;
  let next = normalizeText(text);
  for (const pattern of boilerplateSuffixes) {
    next = next.replace(pattern, '');
  }
  return next.replace(/,\s*$/, '').trim();
}

function setOptionFields(question) {
  const options = Array.isArray(question.options) ? question.options : [];
  question.options = options;

  optionKeys.forEach((key, index) => {
    if (options[index]) {
      question[key] = options[index];
    } else {
      delete question[key];
    }
  });
}

function getQuestions(payload) {
  return Array.isArray(payload) ? payload : Array.isArray(payload.questions) ? payload.questions : [];
}

function getCorrectAnswers(question) {
  if (Array.isArray(question.correctAnswers) && question.correctAnswers.length) {
    return question.correctAnswers.map((answer) => normalizeText(answer));
  }
  if (typeof question.correctAnswer === 'string' && question.correctAnswer.includes('|')) {
    return question.correctAnswer.split('|').map((answer) => normalizeText(answer));
  }
  if (question.correctAnswer) {
    return [normalizeText(question.correctAnswer)];
  }
  return [];
}

function isSingleAnswerQuestion(question) {
  return getCorrectAnswers(question).length === 1;
}

function getLengths(question) {
  const options = question.options.map((text, index) => ({
    index,
    text,
    len: text.length
  }));
  const correctText = getCorrectAnswers(question)[0];
  const correct = options.find((option) => option.text === correctText);
  if (!correct) return null;

  const sorted = [...options].sort((a, b) => b.len - a.len);
  const longest = options.filter((option) => option.len === sorted[0].len);
  const wrongOptions = options.filter((option) => option.text !== correctText);
  const second = sorted[1]?.len ?? 0;
  const avgWrong = wrongOptions.reduce((sum, option) => sum + option.len, 0) / Math.max(1, wrongOptions.length);

  return {
    correct,
    second,
    avgWrong,
    longestCount: longest.length
  };
}

function isSuspicious(question) {
  if (!Array.isArray(question.options) || question.options.length < 3 || !isSingleAnswerQuestion(question)) {
    return false;
  }

  const stats = getLengths(question);
  if (!stats) return false;

  return (
    stats.correct.len === Math.max(...question.options.map((option) => option.length)) &&
    stats.longestCount === 1 &&
    (stats.correct.len - stats.second >= 16 || stats.correct.len >= stats.avgWrong * 1.55)
  );
}

function compressCorrectAnswer(text) {
  let next = normalizeText(text);
  for (const [pattern, replacement] of compressionRules) {
    next = next.replace(pattern, replacement);
  }

  next = next
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/[;:,]\s*$/g, '')
    .trim();

  return next;
}

function makeNounPhraseLonger(text, questionText, variant) {
  const lowerQuestion = questionText.toLowerCase();

  if (/\bgenre\b/i.test(text)) {
    return `${text} tied to creative tooling rather than software development`;
  }

  if (/\bartifact\b/i.test(text)) {
    return `${text} caused by rendering or generation noise in a different setting`;
  }

  if (/\berror\b/i.test(text)) {
    return `${text} that points to a separate failure somewhere else in the workflow`;
  }

  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what does')) {
    return `${text} used for a related concept instead`;
  }

  if (variant % 2 === 0) {
    return `${text} used in a different part of the workflow`;
  }

  return `${text} used in a neighboring workflow instead`;
}

function makeClauseLonger(text, questionText, variant) {
  if (/\bis enough\b/i.test(text)) {
    return text.replace(/\bis enough\b/i, 'is enough in most cases');
  }

  if (/\bare enough\b/i.test(text)) {
    return text.replace(/\bare enough\b/i, 'are enough in most cases');
  }

  if (/\bseparate from\b/i.test(text)) {
    return `${text} in a separate workflow`;
  }

  if (/\bspeak for themselves\b/i.test(text)) {
    return `${text} once stakeholders see the findings`;
  }

  if (/^Only\b/i.test(text)) {
    return `${text} when extra structure feels unnecessary`;
  }

  if (/^Never\b/i.test(text)) {
    return `${text} because one pass keeps the context together`;
  }

  if (/\balways\b/i.test(text)) {
    return `${text} in every workflow`;
  }

  if (/\bnever\b/i.test(text)) {
    return `${text} in normal use`;
  }

  if (/\bdoesn't\b/i.test(text) || /\bdon't\b/i.test(text) || /\bunnecessary\b/i.test(text)) {
    return `${text} in most cases`;
  }

  if (/^(When|If)\b/i.test(text)) {
    return `${text} because another issue is to blame`;
  }

  if (/^(Use|Trust|Check|Run|Keep|Build|Define|Review|Test|Treat|Ask|Have|Publish|Create|Deploy|Focus|Accept|Skip)\b/i.test(text)) {
    if (variant % 2 === 0) {
      return `${text} as the main step`;
    }
    return `${text} and stop there`;
  }

  if (/^(A|An)\b/.test(text) && !/\b(is|are|was|were|means|refers|uses|describes|provides|requires|causes)\b/i.test(text)) {
    return makeNounPhraseLonger(text, questionText, variant);
  }

  if (/\b is \b/i.test(text) || /\b are \b/i.test(text)) {
    if (variant % 2 === 0) {
      return `${text} in most cases`;
    }
    return `${text} for many teams`;
  }

  if (variant % 3 === 0) {
    return `${text} in most cases`;
  }

  if (variant % 3 === 1) {
    return `${text} for many teams`;
  }

  return `${text} by default`;
}

function expandDistractor(text, questionText, minLength, variant) {
  let next = normalizeText(text).replace(/[.]+$/g, '').trim();

  if (next.length < minLength) {
    const expanded = makeClauseLonger(next, questionText, variant);
    if (expanded !== next) {
      next = expanded;
    }
  }

  return next;
}

function rebalanceQuestion(question) {
  if (!isSingleAnswerQuestion(question) || !Array.isArray(question.options) || question.options.length < 3) {
    return false;
  }

  let changed = false;

  for (let pass = 0; pass < 3 && isSuspicious(question); pass += 1) {
    const stats = getLengths(question);
    if (!stats) break;

    const correctText = getCorrectAnswers(question)[0];
    const targetWrongLength = Math.max(
      44,
      Math.min(stats.correct.len - 6, Math.max(stats.second + 6, Math.round(stats.correct.len * 0.68)))
    );

    const updatedOptions = question.options.map((option, index) => {
      if (option === correctText) return option;
      if (option.length >= targetWrongLength) return option;
      return expandDistractor(option, question.questionText || question.question_text || '', targetWrongLength, index + pass);
    });

    if (updatedOptions.some((option, index) => option !== question.options[index])) {
      question.options = updatedOptions;
      changed = true;
    }

    if (isSuspicious(question)) {
      const compressed = compressCorrectAnswer(correctText);
      if (compressed && compressed !== correctText && question.options.includes(correctText)) {
        const correctIndex = question.options.indexOf(correctText);
        question.options[correctIndex] = compressed;
        question.correctAnswer = compressed;
        if (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 1) {
          question.correctAnswers = [compressed];
        }
        changed = true;
      }
    }
  }

  if (changed) {
    setOptionFields(question);
  }

  return changed;
}

function updateQuestion(arr, uid, updater) {
  const question = arr.find((entry) => (entry.uid || entry.id) === uid);
  if (!question) {
    throw new Error(`Missing question ${uid}`);
  }
  updater(question);
}

function applyManualProfessionalFixes(questions) {
  updateQuestion(questions, 'google_ai_cert_fund_008', (question) => {
    question.options = [
      'Patterns favor certain demographics, perspectives, or groups consistently',
      'The output is longer than expected',
      'The AI uses formal language',
      'The output is negative or critical',
      'Results differ across similar inputs with demographic variations'
    ];
    question.correctAnswers = [
      'Patterns favor certain demographics, perspectives, or groups consistently',
      'Results differ across similar inputs with demographic variations'
    ];
    question.correctAnswer = question.correctAnswers.join('|');
    setOptionFields(question);
  });

  updateQuestion(questions, 'google_ai_cert_fund_018', (question) => {
    question.options = [
      'Design a multi-step prompt chain',
      'Verify the output and identify gaps',
      'Define the problem and desired outcome clearly',
      'Test with sample data and iterate',
      'Execute the prompts and collect results'
    ];
    question.correctAnswers = [
      'Define the problem and desired outcome clearly',
      'Design a multi-step prompt chain',
      'Execute the prompts and collect results',
      'Test with sample data and iterate',
      'Verify the output and identify gaps'
    ];
    question.correctAnswer = question.correctAnswers.join('|');
    setOptionFields(question);
  });

  updateQuestion(questions, 'google_ai_cert_fund_037', (question) => {
    question.options = [
      'Trust the answer because it sounds confident',
      'Cross-reference multiple AI responses',
      'Use fact-checking tools or ask domain experts',
      'Check claims against reliable sources',
      'Accept answers that match your expectations'
    ];
    question.correctAnswers = [
      'Cross-reference multiple AI responses',
      'Use fact-checking tools or ask domain experts',
      'Check claims against reliable sources'
    ];
    question.correctAnswer = question.correctAnswers.join('|');
    setOptionFields(question);
  });

  updateQuestion(questions, 'google_ai_cert_app_004', (question) => {
    question.options = [
      'Review the generated code and suggest improvements',
      'Define what you want the app to do in plain language',
      'Deploy to production',
      'Test and refine with real usage',
      'Have AI generate the initial version'
    ];
    question.correctAnswers = [
      'Define what you want the app to do in plain language',
      'Have AI generate the initial version',
      'Review the generated code and suggest improvements',
      'Test and refine with real usage',
      'Deploy to production'
    ];
    question.correctAnswer = question.correctAnswers.join('|');
    setOptionFields(question);
  });

  const directPatches = [
    ['google_ai_cert_rsrch_017', 'Context, findings, analysis, limitations, and recommendations'],
    ['google_ai_cert_cont_013', 'Review it against brand guidelines for voice, visuals, and fit'],
    ['google_ai_cert_rsrch_008', 'Using a custom Gem to critique the idea from a specific perspective'],
    ['google_ai_cert_rsrch_010', 'Gems provide consistent specialized context that direct prompts do not retain'],
    ['google_ai_cert_app_001', 'Building software from natural-language instructions with AI handling much of the implementation'],
    ['google_ai_cert_app_010', 'When existing tools do not fit your workflow and custom development is the better tradeoff'],
    ['google_ai_cert_rsrch_016', 'When different research tasks need distinct evaluation perspectives'],
    ['google_ai_cert_data_022', 'Use dynamic formulas so charts refresh automatically when data changes'],
    ['google_ai_cert_data_023', 'Source, date, methodology, and caveats for responsible interpretation']
  ];

  directPatches.forEach(([uid, answer]) => {
    updateQuestion(questions, uid, (question) => {
      question.correctAnswer = answer;
      setOptionFields(question);
    });
  });

  const rebalancedSingles = [
    {
      uid: 'google_ai_cert_fund_001',
      options: [
        'Collaborator-style AI is mainly useful inside large enterprise teams',
        'Task-completer AI is more advanced because it needs less back-and-forth',
        'A collaborator model should require less human judgment than a task-completer tool',
        'A collaborator mindset treats AI as a partner that extends human capability rather than just completing tasks'
      ],
      correctAnswer: 'A collaborator mindset treats AI as a partner that extends human capability rather than just completing tasks'
    },
    {
      uid: 'google_ai_cert_fund_035',
      options: [
        'All audiences need the same output because clarity and completeness are universal',
        'Audience matters less than giving the model as much information as possible',
        "Your audience determines the right detail level, terminology, and format for the prompt",
        'Audience only matters when a human, not AI, will see the final message'
      ],
      correctAnswer: "Your audience determines the right detail level, terminology, and format for the prompt"
    },
    {
      uid: 'google_ai_cert_fund_017',
      options: [
        'Narrow AI is mostly theoretical, while AGI powers today’s mainstream products',
        'Narrow AI is more capable overall because it is optimized for software tools',
        'Narrow AI handles specific tasks, while AGI would generalize across domains like a human',
        'AGI already exists anywhere a model can solve more than one kind of problem'
      ],
      correctAnswer: 'Narrow AI handles specific tasks, while AGI would generalize across domains like a human'
    },
    {
      uid: 'google_ai_cert_fund_038',
      options: [
        'A token limit is the cap on how much text a model can process and return in one exchange',
        'Token limits mostly matter for very short prompts, not long conversations or outputs',
        'Token limits affect billing but do not change what the model can read or generate',
        'Tokens only matter during training, so prompt length is not a practical concern for users'
      ],
      correctAnswer: 'A token limit is the cap on how much text a model can process and return in one exchange'
    },
    {
      uid: 'google_ai_cert_rsrch_007',
      options: [
        'Gems are only for casual chats, not structured research workflows',
        'Research quality depends on human experts, so Gems add little value',
        "Create a 'research analyst' Gem with clear criteria so findings are evaluated consistently across projects",
        'Gems help with formatting, but they are not useful for evaluating evidence'
      ],
      correctAnswer: "Create a 'research analyst' Gem with clear criteria so findings are evaluated consistently across projects"
    },
    {
      uid: 'google_ai_cert_rsrch_004',
      options: [
        'They work the same way because both tools simply summarize whatever sources they receive',
        'NotebookLM cannot synthesize multiple sources, so it is limited to single-document summaries',
        'NotebookLM works from your uploaded sources, while Deep Research searches the web and synthesizes from there',
        'Deep Research is mainly for web pages, while NotebookLM is only for audio overviews and notes'
      ],
      correctAnswer: 'NotebookLM works from your uploaded sources, while Deep Research searches the web and synthesizes from there'
    },
    {
      uid: 'google_ai_cert_rsrch_014',
      options: [
        'Interesting research is enough, even if nobody turns it into a concrete next step',
        'Keep research and action planning separate so each team can handle its own part',
        "Include recommendations tied to your goal and answer 'What should we do with this insight?'",
        'Present the insight clearly and trust stakeholders to decide the action on their own'
      ],
      correctAnswer: "Include recommendations tied to your goal and answer 'What should we do with this insight?'"
    },
    {
      uid: 'google_ai_cert_writ_004',
      options: [
        'Use the same message for everyone so the core facts never change',
        'Audience adaptation adds unnecessary work without improving understanding',
        'Adjust detail, jargon, and emphasis so each audience gets the level and context it needs',
        'Different versions usually create confusion and make alignment harder'
      ],
      correctAnswer: 'Adjust detail, jargon, and emphasis so each audience gets the level and context it needs'
    },
    {
      uid: 'google_ai_cert_writ_008',
      options: [
        'AI can only improve grammar; style changes still require full manual rewriting',
        'All professional writing should use the same tone to avoid inconsistency',
        'AI can rewrite content to match different styles when you specify the audience and tone',
        'Communication style matters less than adding more information to the draft'
      ],
      correctAnswer: 'AI can rewrite content to match different styles when you specify the audience and tone'
    },
    {
      uid: 'google_ai_cert_cont_009',
      options: [
        'A creative director persona lets the AI make the key strategic choices on your behalf',
        'There is no real distinction between the human role and the AI role in content work',
        'The human stays in the creative-director role, while AI helps execute and refine the chosen direction',
        'Creative direction matters less with AI because the model can invent the strategy itself'
      ],
      correctAnswer: 'The human stays in the creative-director role, while AI helps execute and refine the chosen direction'
    },
    {
      uid: 'google_ai_cert_cont_012',
      options: [
        'They are basically the same because both approaches rely on a generated visual output',
        'Design work should stay fully manual because AI tools weaken creative judgment',
        'Designing with AI means you direct and refine the work; designing for AI means you brief the model to generate it',
        'AI can help polish designs, but it cannot generate useful visual directions from prompts'
      ],
      correctAnswer: 'Designing with AI means you direct and refine the work; designing for AI means you brief the model to generate it'
    },
    {
      uid: 'google_ai_cert_cont_014',
      options: [
        'Use AI for every design task because speed matters more than long-term brand impact',
        'Design quality matters less than shipping quickly, even for highly visible assets',
        'Use professional design for durable, high-stakes assets; use AI for faster tactical content',
        'Professional design only makes sense when AI tools fail to generate anything at all'
      ],
      correctAnswer: 'Use professional design for durable, high-stakes assets; use AI for faster tactical content'
    },
    {
      uid: 'google_ai_cert_cont_015',
      options: [
        'An effective slide usually packs in as much text and detail as possible',
        'Strong slides depend mostly on visual complexity and decorative effects',
        'An effective slide has one clear message, strong supporting visuals, minimal text, and a style that fits the talk',
        'Slide quality matters less than giving the audience every detail directly on screen'
      ],
      correctAnswer: 'An effective slide has one clear message, strong supporting visuals, minimal text, and a style that fits the talk'
    },
    {
      uid: 'google_ai_cert_cont_004',
      options: [
        'Generate one version and keep it unless there is a technical problem',
        'Variation generation mostly wastes time and weakens creative direction',
        'Generate several variations with small prompt changes, then compare them against the campaign goal',
        'Too many variations make review impossible, so a single output is usually better'
      ],
      correctAnswer: 'Generate several variations with small prompt changes, then compare them against the campaign goal'
    },
    {
      uid: 'google_ai_cert_cont_005',
      options: [
        'Brand guidelines matter less with AI because the model already knows common styles',
        'Guidelines only help human designers, not AI content workflows',
        'Guidelines keep AI-generated content aligned with your brand voice, look, and channel standards',
        'Brand consistency is optional as long as the content is technically accurate'
      ],
      correctAnswer: 'Guidelines keep AI-generated content aligned with your brand voice, look, and channel standards'
    },
    {
      uid: 'google_ai_cert_data_002',
      options: [
        'SOAR is mainly a storytelling device, not an analysis framework',
        'SOAR is designed for sports recaps rather than business performance',
        'SOAR gives you a structure for linking the situation, obstacle, action, and result in one analysis',
        'Strong analysis should stay open-ended instead of following a set framework'
      ],
      correctAnswer: 'SOAR gives you a structure for linking the situation, obstacle, action, and result in one analysis'
    },
    {
      uid: 'google_ai_cert_data_003',
      options: [
        'Start analyzing the raw files directly and organize the data later',
        'Convert only the final charts, not the underlying source material',
        'Define the fields you need first, then extract the information into a consistent table',
        'Keep the files unstructured so you do not lose context during analysis'
      ],
      correctAnswer: 'Define the fields you need first, then extract the information into a consistent table'
    },
    {
      uid: 'google_ai_cert_brain_015',
      options: [
        'Shared hubs create duplication because teams still need their own notes',
        'Knowledge works better when each team stores information in separate places',
        'A shared hub gives everyone the same current information, even across locations and time zones',
        'Knowledge hubs matter mainly for teams sitting in the same office'
      ],
      correctAnswer: 'A shared hub gives everyone the same current information, even across locations and time zones'
    },
    {
      uid: 'google_ai_cert_brain_017',
      options: [
        'Skip validation early so you do not slow down promising ideas',
        'Idea quality is obvious without structured critique or testing',
        'Use Gemini to stress-test the idea by probing risks, objections, value, and cost before you commit',
        'Business-case questions can wait until after you have already built the solution'
      ],
      correctAnswer: 'Use Gemini to stress-test the idea by probing risks, objections, value, and cost before you commit'
    },
    {
      uid: 'google_ai_cert_writ_011',
      options: [
        "Use a broad note like 'fix it' and let the model decide what matters",
        'Detailed feedback limits creativity, so vague feedback works better',
        'Give targeted feedback on what to change, such as concision, evidence, jargon, or repetition',
        'Feedback matters less than rerunning the same prompt several times'
      ],
      correctAnswer: 'Give targeted feedback on what to change, such as concision, evidence, jargon, or repetition'
    },
    {
      uid: 'google_ai_cert_writ_012',
      options: [
        'Rely on your first draft so the delivery still feels natural',
        'Practice is less useful than polishing the slides one more time',
        'Rehearse with Gemini Live, refine your points, time the talk, and prepare for hard questions',
        'Objections are best handled improvisationally instead of in advance'
      ],
      correctAnswer: 'Rehearse with Gemini Live, refine your points, time the talk, and prepare for hard questions'
    },
    {
      uid: 'google_ai_cert_cont_011',
      options: [
        'Start with the request alone and add context only if the first draft fails',
        'Marketing prompts work best when they stay broad and unstructured',
        'Give the product, audience, tone, benefits, brand voice, and any compliance constraints up front',
        'Detailed briefs box the model in and usually make copy less persuasive'
      ],
      correctAnswer: 'Give the product, audience, tone, benefits, brand voice, and any compliance constraints up front'
    },
    {
      uid: 'google_ai_cert_app_014',
      options: [
        'They are basically the same because both are early versions of an idea',
        'A prototype is something customers use daily, while an MVP is mostly for internal testing',
        'A prototype tests the concept; an MVP is a usable product with enough value for real users',
        'An MVP comes before a prototype because shipping matters more than learning'
      ],
      correctAnswer: 'A prototype tests the concept; an MVP is a usable product with enough value for real users'
    }
  ];

  rebalancedSingles.forEach(({ uid, options, correctAnswer }) => {
    updateQuestion(questions, uid, (question) => {
      question.options = options;
      question.correctAnswer = correctAnswer;
      delete question.correctAnswers;
      setOptionFields(question);
    });
  });
}

function normalizeQuestion(question) {
  if (question.questionText) question.questionText = trimBoilerplate(question.questionText);
  if (question.question_text) question.question_text = trimBoilerplate(question.question_text);
  if (question.explanation) question.explanation = normalizeText(question.explanation);
  if (question.remediationNotes) question.remediationNotes = normalizeText(question.remediationNotes);
  if (question.correctAnswer) question.correctAnswer = trimBoilerplate(question.correctAnswer);
  if (question.correct_answer) question.correct_answer = trimBoilerplate(question.correct_answer);

  for (const key of optionKeys) {
    if (question[key]) {
      question[key] = trimBoilerplate(question[key]);
    }
  }

  if (!Array.isArray(question.options) || !question.options.length) {
    question.options = optionKeys.map((key) => question[key]).filter(Boolean);
  } else {
    question.options = question.options.map(trimBoilerplate);
  }

  question.options = question.options
    .filter((option) => option && !option.includes('|'))
    .map((option) => normalizeText(option));

  const joinedCorrect = Array.isArray(question.correctAnswers) ? question.correctAnswers.join('|') : null;
  if (joinedCorrect) {
    question.options = question.options.filter((option) => option !== joinedCorrect);
  }

  setOptionFields(question);
}

function auditQuestions(questions) {
  let multipleChoice = 0;
  let suspicious = 0;

  for (const question of questions) {
    if (!Array.isArray(question.options) || !question.options.length) continue;
    multipleChoice += 1;
    if (isSuspicious(question)) suspicious += 1;
  }

  return { multipleChoice, suspicious };
}

const files = fs
  .readdirSync(questionsDir)
  .filter((file) => file.endsWith('.json') && !file.endsWith('.backup.json') && file !== 'fill_in_blank_questions.json');

for (const file of files) {
  const filePath = path.join(questionsDir, file);
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const questions = getQuestions(payload);

  questions.forEach(normalizeQuestion);

  if (file === 'google_ai_professional_cert.json') {
    applyManualProfessionalFixes(questions);
  }

  let changedCount = 0;
  for (const question of questions) {
    if (rebalanceQuestion(question)) {
      changedCount += 1;
    }
  }

  if (Array.isArray(payload)) {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2) + '\n');
  } else {
    payload.questions = questions;
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n');
  }

  const audit = auditQuestions(questions);
  console.log(`${file}: changed=${changedCount}, multipleChoice=${audit.multipleChoice}, suspicious=${audit.suspicious}`);
}
