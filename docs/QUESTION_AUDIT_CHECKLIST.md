# Question Audit & Improvement Checklist

## Quick Audit: Is This Question Hard Enough?

For each question, score it 0-3:

### Section A: Difficulty Assessment

**1. Memorization Risk**
- 0 = Can be answered by pure fact recall from definitions
- 1 = Facts needed, but slight reasoning required
- 2 = Facts help, but reasoning determines answer
- 3 = Reasoning required; facts alone insufficient

**2. Distractor Quality**
- 0 = Distractors are obviously wrong
- 1 = One distractor is challenging; others weak
- 2 = Two distractors are plausible
- 3 = All three distractors require deep knowledge to eliminate

**3. Language Pattern Dependence**
- 0 = Answer has unique/recognizable language pattern
- 1 = Answer language slightly distinctive
- 2 = Language doesn't signal correctness
- 3 = Wrong answers use equally authoritative language

**4. Reasoning Complexity**
- 0 = Single fact or definition
- 1 = One logical step
- 2 = Two logical steps required
- 3 = Multi-step chain or weighing multiple factors

**Total Score:** Sum all sections
- **0-4:** EASY - Rewrite required
- **5-8:** MODERATE - Improve distractors
- **9-12:** HARD - Keep as-is

---

## Red Flag Patterns (Automatic Rewrite Triggers)

### 🚩 Flag 1: Matching Language in Answer
**Pattern:**
```
Q: Identify the first step...
A) Eliminate the obvious...
B) Look for the defining clue...
C) Check the most...
D) Determine the...
```
→ Option B "stands out" as complete/authoritative

**Fix:** Rewrite all options in same grammatical tone

---

### 🚩 Flag 2: Two Nearly Identical Options
**Pattern:**
```
A) Balancing underfitting vs overfitting
B) The tradeoff between underfitting and overfitting
C) Eliminating bias from models
D) Reducing model complexity
```
→ A and B are the same concept; readers pick the one with better language

**Fix:** Make distractors substantively different

---

### 🚩 Flag 3: Obviously Wrong Distractors
**Pattern:**
```
Q: What's batch normalization?
A) Normalizing inputs to mean 0, std 1
B) A type of pizza topping
C) A database technique
D) A programming language
```
→ No one who knows the domain picks B, C, or D

**Fix:** Make distractors from related-but-wrong concepts

---

### 🚩 Flag 4: Single Fact = Single Answer
**Pattern:**
```
Q: What does LSTM stand for?
A) Long Short-Term Memory [CORRECT - pure recall]
B) Large Scale Training Model
C) Linear Sequential Time Module
D) Latent System Time Memory
```
→ Answered by definition lookup

**Fix:** Require application or understanding of WHY LSTMs exist

---

### 🚩 Flag 5: Elimination Strategy Works
**Pattern:**
```
Q: Which is NOT true about neural networks?
A) They have multiple layers
B) They use activation functions
C) They always converge to global optima [CORRECT]
D) They learn through backpropagation
```
→ Wrong answers are obviously true; right answer obvious by elimination

**Fix:** Use positive statements; make all plausible individually

---

### 🚩 Flag 6: Context Missing or Generic
**Pattern:**
```
Q: Is dropout good?
A) Yes, always
B) No, never
C) It depends
D) Only for CNNs
```
→ No specific scenario; discussion, not assessment

**Fix:** Add constraints that force a real choice

---

## Rewrite Procedure

### For Easy Questions (Score 0-4)

**Step 1: Determine Learning Objective**
```
Question aims to test:
[ ] Definition recall
[ ] Conceptual understanding
[ ] Application to scenario
[ ] Design judgment
[ ] Error diagnosis
[ ] Trade-off analysis
```

**Step 2: Choose Better Template**
- If objective is conceptual: Use **Concept Discrimination** template
- If objective is application: Use **Multi-Domain Application** template
- If objective is judgment: Use **Design Decision Under Constraints** template

**Step 3: Add Scenario/Context**
```
BEFORE: What's transfer learning?

AFTER: You have 500 labeled medical images for rare disease detection.
Standard supervised learning fails. What technique addresses this?
```

**Step 4: Strengthen Distractors**
```
OLD:
A) Using pre-trained models for new tasks
B) Moving data between servers
C) Converting models to mobile
D) Translating models between languages

NEW:
A) Transfer learning from ImageNet pre-trained models (correct reason - visual features generalize)
B) Increase training epochs (plausible but misses root issue)
C) Use logistic regression (valid baseline, but inefficient)
D) Collect more labeled data (valid but impractical given constraints)
```

**Step 5: Validate New Question**
Run through audit checklist above. Must score ≥9.

---

## Common Improvements

### Improvement 1: Add Mechanism to Correct Answer
```
BEFORE: A) Transfer learning from ImageNet
AFTER: A) Transfer learning from ImageNet pre-trained models because visual features (edges, textures, patterns) learned on large datasets generalize to new domains
```

### Improvement 2: Make Distractors Mechanistically Plausible
```
BEFORE: B) Use a larger batch size
AFTER: B) Increase model capacity by adding more layers to capture complexity better (sounds reasonable but misses that the bottleneck is data, not model)
```

### Improvement 3: Create Scenario Forcing Real Choice
```
BEFORE: Should you use X or Y?
AFTER: In scenario [specific constraints], should you choose X (trade-off: faster but less accurate) or Y (accurate but slow)?
```

### Improvement 4: Test Understanding Not Recognition
```
BEFORE: What is gradient descent?
AFTER: You observe training loss plateauing but validation loss continuing to decrease. What's happening, and why?
```

---

## Audit Priority: Which Questions to Fix First

### Critical (Immediate):
- Questions scoring 0-3
- Questions with 2+ red flags
- Questions in high-stakes assessments

### Important (This Week):
- Questions scoring 4-6
- Questions with 1 red flag
- Frequently taken tests

### Nice-to-Have (Ongoing):
- Questions scoring 7-8
- No red flags but could be enhanced

---

## Implementation Checklist

For your question bank:

### Phase 1: Audit (1-2 days)
- [ ] Run all questions through Red Flag checklist
- [ ] Score each question (0-12 scale)
- [ ] Flag bottom 20% for immediate rewrite
- [ ] Document patterns found

### Phase 2: Rewrite Critical Questions (ongoing)
- [ ] Rewrite bottom 20% using templates
- [ ] Have 2+ people validate new questions
- [ ] Test on sample users
- [ ] Measure if pass rates drop (indicates harder questions)

### Phase 3: Establish Standards
- [ ] All new questions must score ≥9
- [ ] New question submission requires checklist sign-off
- [ ] Monthly audit of sample questions

### Phase 4: Continuous Improvement
- [ ] Track which questions students struggle with (may indicate good difficulty)
- [ ] Track which questions are answered correctly 90%+ (may indicate too easy)
- [ ] Adjust questions based on performance data

---

## Sample Audit Results

**Example Question Bank Analysis:**

| Difficulty | Questions | % of Bank | Action |
|------------|-----------|-----------|--------|
| Too Easy (0-3) | 127 | 32% | Rewrite immediately |
| Moderate (4-6) | 183 | 46% | Improve distractors |
| Good (7-9) | 68 | 17% | Keep, learn from |
| Excellent (10-12) | 22 | 5% | Use as templates |

→ **Plan:** Rewrite 32%, improve 46%, totaling 78% of bank needing work

---

## Success Metrics

After improvements, you should see:
- **Question pass rates:** Drop from 70%+ to 50-65% (indicates harder)
- **Time per question:** Increase (more reasoning required)
- **Distractor appeal:** More wrong answers selected (better distractors)
- **Student feedback:** "These questions are actually challenging"
- **Learning impact:** Better correlation between test scores and actual competency
