# Better Question Templates - AI Study Game

## Template 1: Error Diagnosis
*Tests root cause analysis, not memorization*

**Pattern:**
```
[System/Model] exhibits [observable symptom].
What's the most likely underlying cause?

A) [Surface symptom - obvious but wrong]
B) [Correct root cause - requires understanding]
C) [Plausible but incomplete cause]
D) [Requires deeper knowledge to eliminate]
```

**Example 1:**
```
Your neural network training loss decreases for 10 epochs, then suddenly increases sharply while validation loss remains flat. Gradient checking passes. What's happening?

A) The model needs more data
B) Learning rate is too high, causing weight divergence in later layers
C) The validation set is corrupted
D) Batch size is too small
```

**Example 2:**
```
A transformer model has lower perplexity on training data than validation data, but both improve monotonically. When deployed, it generates repetitive token sequences. Why?

A) The model is underfitting
B) Temperature during generation is too low, reducing diversity despite training well
C) The tokenizer is misconfigured
D) The model needs more attention heads
```

---

## Template 2: Design Decision Under Constraints
*Tests engineering judgment, not facts*

**Pattern:**
```
You need to [goal] with constraints [C1, C2, C3].
Which approach best balances [tradeoff]?

A) [Optimal if no constraints, but ignores key constraint]
B) [Correct - acknowledges tradeoff, justifies choice]
C) [Works but suboptimal given constraints]
D) [Technically sound but impractical]
```

**Example 1:**
```
You're deploying a fraud detection model on mobile devices with <50MB memory and <100ms latency requirements. Your current model is 200MB and achieves 94% AUC. Which is the best first optimization?

A) Collect more training data to improve AUC
B) Model quantization + knowledge distillation to reduce size and latency while maintaining AUC
C) Increase model capacity for better accuracy
D) Switch to a different algorithm entirely
```

**Example 2:**
```
Your recommendation system must handle 10 million users with personalized rankings updated daily. Latency must be <500ms. What's the practical approach?

A) Collaborative filtering with full matrix factorization updated daily
B) Two-tier system: pre-computed candidate generation + real-time ranking
C) Content-based filtering only, since it's faster
D) Serve pre-computed rankings cached for 1 week
```

---

## Template 3: Concept Discrimination
*Tests fine distinctions, not definitions*

**Pattern:**
```
When would you prefer [Concept A] over [Concept B]?
The key difference is [distinction].

A) [Misses key difference]
B) [Correct - identifies real tradeoff]
C) [Both concepts do this equally]
D) [Requires specific knowledge of limitation]
```

**Example 1:**
```
When is dropout preferable to L2 regularization as your primary regularization method?

A) When you want to reduce model size
B) When training very deep networks where L2 alone doesn't prevent co-adaptation
C) When you have small datasets
D) They're equivalent; it doesn't matter which you choose
```

**Example 2:**
```
Why would you use focal loss instead of cross-entropy loss in object detection with class imbalance?

A) Because focal loss is always faster
B) Because focal loss down-weights easy negatives, focusing learning on hard examples where the model struggles
C) Because cross-entropy doesn't work with imbalanced data
D) Because focal loss improves baseline accuracy
```

---

## Template 4: Mechanism Understanding
*Tests how components interact, not what they do*

**Pattern:**
```
In [system], [component X] affects [component Y] by...
Why is this important?

A) [Surface explanation]
B) [Mechanistic explanation requiring multi-step understanding]
C) [Correct for different reason than intended]
D) [Directionally right but misses key mechanism]
```

**Example 1:**
```
In transformer models, the query-key attention mechanism determines how each token attends to others. What's the precise role of the softmax function in this mechanism?

A) It converts attention logits to probabilities, ensuring weights sum to 1 and preventing gradient explosion
B) It amplifies high scores and suppresses low scores
C) It makes attention faster
D) It's not critical; other functions work equally well
```

**Example 2:**
```
During backpropagation through an LSTM, why does the cell state path preserve gradients better than hidden state paths?

A) Because LSTM cells use special algorithms
B) Because additive connections in cell state avoid the vanishing gradient problem that multiplicative connections suffer
C) Because LSTMs have more parameters
D) Because the forget gate learns to not forget
```

---

## Template 5: Multi-Domain Application
*Tests transfer and generalization*

**Pattern:**
```
A concept from [Domain A: specific context] can be applied to [Domain B: different context].
What changes?

A) [Misses domain-specific constraints]
B) [Correct application acknowledging necessary adaptations]
C) [Works but inefficient in new domain]
D) [Fundamentally incompatible]
```

**Example 1:**
```
Batch normalization from computer vision can be applied to NLP. Why is layer normalization often preferred instead in transformers?

A) Because NLP data is fundamentally different
B) Because batch norm depends on batch statistics, which vary with sequence length and are unreliable with small batches in NLP
C) Because transformers don't need normalization
D) Because layer norm is always better than batch norm
```

**Example 2:**
```
Curriculum learning (starting with easy examples, progressing to hard) from supervised learning is applied to reinforcement learning. What's the critical adaptation?

A) Start agents in simple environments, gradually increase difficulty
B) Curriculum in RL must account for exploration-exploitation, with complexity increasing only as policy converges in current curriculum level
C) RL doesn't benefit from curriculum learning
D) Just randomize the difficulty order
```

---

## Template 6: Counterfactual Analysis
*Tests what-if thinking, not recall*

**Pattern:**
```
If [condition changes], how would [outcome] change?
Why?

A) [Incorrect direction of change]
B) [Correct direction and magnitude, with mechanistic explanation]
C) [Correct direction but wrong magnitude]
D) [Assumes nothing changes]
```

**Example 1:**
```
In batch gradient descent with constant learning rate, if you halve the batch size, what happens to the stability and speed of convergence?

A) More stable (less noisy gradients), but slower convergence
B) Less stable (noisier gradients), but potentially faster convergence due to more updates
C) No change; batch size only affects runtime
D) Faster in both stability and speed
```

**Example 2:**
```
If you remove dropout from a regularized deep network and retrain with the same hyperparameters, what's most likely to happen?

A) Training loss decreases, test loss increases due to overfitting
B) Both decrease because the model has more capacity
C) No change because dropout only affects inference
D) Training loss increases because the model is weaker
```

---

## Template 7: Trade-off Prioritization
*Tests values and context, not facts*

**Pattern:**
```
In [scenario], you must choose between [trade A] and [trade B].
Given [constraints/values], which is justified?

A) [Optimal without constraints]
B) [Correct given specific constraints]
C) [Ignores key constraint]
D) [Technically valid but misses context]
```

**Example 1:**
```
You're building a system to diagnose cancer from medical images. Model A: 92% sensitivity, 88% specificity. Model B: 88% sensitivity, 95% specificity. Which should you deploy?

A) Model A because it has higher overall accuracy
B) Model B because the cost of false negatives (missed cancer) is far higher than false positives (unnecessary follow-up)
C) Model A because specificity is more important in medicine
D) Neither; you need 99%+ on both metrics
```

**Example 2:**
```
Your recommendation system can use collaborative filtering (fast, requires user history) or content-based (slower, works for new users). You serve a platform with 50% new daily users. What's the right approach?

A) Pure collaborative filtering for speed
B) Hybrid: content-based for new users, collaborative for established users
C) Pure content-based to handle new users
D) Neither; recommendation systems don't work with new users
```

---

## Authoring Workflow

### Step 1: Choose Template
Pick the template that best fits the learning objective.

### Step 2: Write the Scenario
Make it realistic and specific, not generic.

**Bad:** "In machine learning, what's better?"
**Good:** "You're deploying a model on edge devices with 50MB memory and <100ms latency needs..."

### Step 3: Write Correct Answer
Explain the mechanism or reasoning, not just the fact.

**Bad:** A) "Because it's faster"
**Good:** B) "Because quantization reduces model size while knowledge distillation preserves accuracy through supervised learning on predictions..."

### Step 4: Write Distractors
Each should be:
- **Superficially plausible** (someone who half-knows might pick it)
- **Requires understanding to eliminate** (not obviously wrong)
- **Reveals a common misconception** (learning opportunity if wrong)

**Bad Distractor:** "Use a random number generator"
**Good Distractor:** "Increase model capacity for better accuracy" (plausible but misses constraint)

### Step 5: Quality Check
```
[ ] Would memorizing facts answer this?
[ ] Do all wrong answers have surface appeal?
[ ] Is there exactly one clearly correct answer?
[ ] Does reasoning, not language pattern, determine correctness?
[ ] Would someone who understands the mechanism get it right?
```

---

## Anti-Patterns to Avoid

❌ "Look for the clue that..."
❌ "The best answer is..."
❌ Answers with matching/unique language patterns
❌ Obviously wrong distractors
❌ Questions answerable by elimination
❌ True/false presented as multiple choice
❌ "Which is most..." when criteria aren't specified
❌ Isolated fact recall
❌ Options that telegraph the answer through symmetry

✅ Scenario-based
✅ Mechanism-focused
✅ Requires multi-step reasoning
✅ Distractors are genuinely challenging
✅ Answer evident only from understanding
✅ Context determines correct choice
✅ Tests judgment, not trivia
✅ False answers reveal misconceptions
