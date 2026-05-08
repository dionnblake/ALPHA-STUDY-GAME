# DO NOT FILE - Quiz Question & Answer Guidelines

**Purpose**: Prevent common AI-generated quiz flaws that make questions too easy. Reference this file before every Q&A update.

---

## LENGTH BIAS - THE CRITICAL ISSUE

### DO NOT:
- Make the correct answer noticeably longer than wrong answers
- Use extra qualifying language in the correct answer that isn't in distractors
- Assume length = accuracy (the opposite often creates poor quizzes)
- Leave answer options unsorted by length

### DO:
- Enforce strict length consistency across all options
- Keep all answers within the same word count range (±3-5 words max difference)
- Sort answer choices from shortest to longest before finalizing
- Give specific word limits to the AI model (e.g., "Each answer must be 8-12 words")

---

## DISTRACTOR QUALITY

### DO NOT:
- Make wrong answers obviously incorrect
- Use vague or incomplete distractors
- Mix specificity levels (some detailed, some vague)
- Create distractors unrelated to the question topic

### DO:
- Base distractors on common beginner mistakes or misconceptions
- Make wrong answers "subtly flawed" - they should look plausible at first glance
- Target the exact error patterns students actually make
- Ensure distractors test deeper understanding, not just simple recall

---

## GRAMMATICAL & STRUCTURAL PARALLELISM

### DO NOT:
- Start one answer with a verb while others start with nouns
- Mix singular and plural forms across options
- Use different tenses in different options
- Vary the sentence structure across answer choices

### DO:
- Keep all options grammatically consistent
- Use parallel structure (if one starts with a gerund, all should)
- Maintain consistent verb tense across all options
- Ensure all answers have the same complexity in phrasing

---

## ANSWER FORMATTING RULES

### DO NOT:
- Allow any answer to exceed the agreed word count
- Leave answers of wildly different lengths (e.g., one is 5 words, another is 30)
- Mix detailed answers with one-word answers in the same question
- Ignore answer length during the review process

### DO:
- Set a specific word count range before generating (e.g., 8-15 words per answer)
- Review and rewrite answers that exceed the limit
- Keep all options visually similar in length on the screen
- Use a word counter to enforce consistency

---

## COMPLEXITY & QUESTION TYPE

### DO NOT:
- Ask simple recall questions ("What is a list?")
- Create distractors that are obviously wrong
- Mix difficulty levels between questions
- Ignore the cognitive level being assessed

### DO:
- Ask scenario-based questions requiring analysis and application
- Use higher-order thinking: synthesis, evaluation, problem-solving
- Match difficulty levels consistently across the question set
- Test deep understanding, not memorization

---

## COMMON AI MISTAKES TO WATCH FOR

### DO NOT:
1. **Longest = Correct**: The correct answer being the longest option
2. **Vague Distractors**: Wrong answers that are obviously incomplete
3. **Grammatical Clues**: Answer choices that differ in structure/tense
4. **Soft Language**: Too much hedging in the correct answer ("may," "might," "can be")
5. **Specificity Gap**: Correct answer is very specific, distractors are vague (or vice versa)
6. **Context Repetition**: Correct answer repeats words from the question, making it obvious
7. **Incomplete Distractors**: Wrong answers feel cut short or unfinished

---

## PROMPT ENGINEERING CHECKLIST

Before generating Q&A, include in your system prompt:

- [ ] "All answer options must be 10-15 words"
- [ ] "Distractors must be based on common misconceptions"
- [ ] "All answers must have parallel grammatical structure"
- [ ] "The correct answer must NOT be obviously longer than wrong answers"
- [ ] "Order answers from shortest to longest"
- [ ] "Make wrong answers subtly flawed, not obviously incorrect"
- [ ] "This is for [difficulty level] students"
- [ ] "Test higher-order thinking, not simple recall"

---

## REVIEW PROCESS

**Every Q&A update must include:**

1. Length check: Are all answers within the same word range?
2. Distractor check: Would a student struggle to immediately identify the correct answer?
3. Grammar check: Are all options grammatically parallel?
4. Complexity check: Is this the right difficulty level?
5. Bias check: Is the longest answer the correct one? (If yes, rewrite)

---

## RED FLAGS - STOP AND FIX IF YOU SEE:

- ❌ Correct answer is 20+ words, wrong answers are 5-8 words
- ❌ All distractors start with "a" or "the" but one doesn't
- ❌ Distractors look incomplete or cut short
- ❌ The question uses words that appear only in one answer
- ❌ Answer options have wildly different capitalization or punctuation
- ❌ Correct answer uses technical jargon, distractors use plain language (or vice versa)

---

**Last Updated**: 2026-04-15
**Reference This Before Every Update**
