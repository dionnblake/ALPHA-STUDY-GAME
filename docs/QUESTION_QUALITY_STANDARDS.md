# AI Study Game - Question Quality Standards

## Problem: Current Questions Are Too Easy

**Red Flags in Current Questions:**
- Answers with matching language patterns ("look for the defining clue")
- Answer options that telegraph the reasoning path
- Distractors that are obviously wrong
- Pattern-matching instead of comprehension testing
- Answers that serve as hints rather than validating understanding

---

## Quality Standards

### 1. Distractors Must Be Cognitively Challenging

**BAD:**
```
Q: What is a neural network?
A) A biological brain structure
B) A computing system inspired by biological brains
C) A type of database
D) A programming language
```
→ Only B is plausible. C and D are obviously wrong.

**GOOD:**
```
Q: In deep learning, why are residual connections (skip connections) essential in very deep networks?
A) They increase model capacity and parameter count
B) They mitigate vanishing gradients by enabling direct gradient flow to early layers
C) They reduce computational cost during inference
D) They automatically handle data normalization
```
→ All seem related to networks. B requires understanding gradient flow, not just pattern matching.

---

### 2. Require Multi-Step Reasoning

**BAD (Single Fact Recall):**
```
Q: What does LSTM stand for?
A) Long Short-Term Memory
B) Linear Sequential Time Model
C) Large Scale Training Module
D) Latent Semantic Topic Model
```

**GOOD (Apply Concept):**
```
Q: When training an LSTM on a time series with vanishing gradients in early layers, why does the forget gate specifically help more than the input gate?
A) The forget gate controls memory retention, allowing gradients to flow through timesteps unchanged
B) The input gate has larger gradient values naturally
C) The forget gate learns faster than other gates
D) LSTMs don't actually have separate forget gates
```

---

### 3. Avoid Language Patterns as Clues

**BAD:**
```
Q: Identify the first step in evaluating model fairness.
A) Eliminate obvious biases
B) Define fairness metrics appropriate to your use case and stakeholder needs
C) Remove all protected attributes
D) Ensure equal accuracy
```
→ Option B "looks like" a proper answer with detailed language.

**GOOD:**
```
Q: A model achieves 90% accuracy overall but 60% accuracy on minority groups. Why might demographic parity alone be insufficient?
A) Because it ignores true positive rates which may differ significantly
B) Because accuracy is always the best metric
C) Because minority groups don't deserve equal treatment
D) Because the model needs more training data
```

---

### 4. Use Context & Scenarios Instead of Isolated Facts

**BAD:**
```
Q: What is transfer learning?
A) Using pre-trained models for new tasks
B) Moving data between servers
C) Converting models to mobile
D) Translating models between languages
```

**GOOD:**
```
Q: You have 500 labeled medical images for rare disease detection but 100,000 unlabeled images. Standard supervised learning fails due to small dataset size. What technique directly addresses this, and why?
A) Transfer learning from ImageNet pre-trained models because the learned visual features generalize
B) Increasing batch size because larger batches need less data
C) Using logistic regression because it's simpler
D) Collecting more labeled data (the only solution)
```

---

### 5. Test Understanding, Not Memorization

**BAD:**
```
Q: The learning rate should be ___?
A) High
B) Low
C) Neither, it depends on context
D) Always 0.001
```

**GOOD:**
```
Q: When training a deep network, you observe stable loss initially but then sudden divergence. Learning rate was 0.01. Why might this occur, and what's the best diagnostic step?
A) Exploding gradients; check gradient norms and reduce learning rate
B) The model architecture is wrong
C) Add dropout layers
D) Use a different optimizer
```

---

### 6. Distinguish Between Similar Concepts

**BAD:**
```
Q: What's the difference between precision and recall?
A) Precision is accuracy, recall is completeness
B) They're the same thing
C) Precision measures false positives, recall measures false negatives
D) Recall is always more important
```

**GOOD:**
```
Q: In a medical diagnosis system, you want to minimize false negatives (missed diseases). Which metric should you prioritize, and why does it matter?
A) Precision - because you want few false alarms that waste resources
B) Recall - because missing a disease is worse than a false alarm in healthcare
C) Accuracy - because it's the most straightforward metric
D) F1-score - because it balances everything equally
```

---

### 7. Include "Why" Questions, Not Just "What"

**BAD:**
```
Q: Batch normalization normalizes inputs to...?
A) Mean 0, std 1
B) Range [0,1]
C) Range [-1,1]
D) Mean 1, std 0
```

**GOOD:**
```
Q: Why does batch normalization enable higher learning rates during training?
A) Because normalized inputs have smaller magnitudes, reducing the risk of exploding/vanishing gradients
B) Because it removes the need for optimizers
C) Because it automatically tunes hyperparameters
D) Because it increases model capacity
```

---

### 8. Test Decision-Making & Trade-offs

**BAD:**
```
Q: Is overfitting bad?
A) Yes, always
B) No, never
C) Sometimes
D) Only on small datasets
```

**GOOD:**
```
Q: You're training a model where high false positive rate costs $1000 per error (Type I), but false negatives cost $100 (Type II). Your model achieves 85% precision and 70% recall. What's the strategic decision?
A) Increase threshold to improve precision, accepting lower recall
B) Decrease threshold to improve recall at the cost of precision
C) Keep current threshold since recall is already 70%
D) This depends only on which metric is "better"
```

---

## Question Type Framework

### Type 1: Scenario Analysis
- Present realistic problem
- Require multiple decision points
- Distractors are plausible but suboptimal solutions

### Type 2: Conceptual Integration
- Requires understanding relationship between concepts
- Can't be solved with single fact
- Tests mental model accuracy

### Type 3: Trade-off Evaluation
- Multiple valid approaches with different costs
- Requires weighing constraints
- No obviously correct answer without context

### Type 4: Error Diagnosis
- Present symptom (odd behavior, poor results)
- Require root cause identification
- Distractors are surface-level observations

### Type 5: Application & Transfer
- Concept taught in one context
- Applied to different domain
- Tests generalization, not memorization

---

## Authoring Checklist

Before finalizing any question:

- [ ] Can this be answered by memorizing a single fact? (If yes, redesign)
- [ ] Do answer options share obvious language patterns? (If yes, rewrite)
- [ ] Are 3 distractors genuinely challenging? (If no, revise them)
- [ ] Does answering require multi-step reasoning? (If no, add complexity)
- [ ] Would this question fail someone who memorized definitions? (If no, increase difficulty)
- [ ] Is there a clear correct answer? (If no, question is broken)
- [ ] Does the wrong answer reveal a common misconception? (If yes, that's good)

---

## Example: Rewriting a Bad Question

### Original (Bad)
```
Q: What is the bias-variance tradeoff?
A) The tradeoff between model simplicity and accuracy
B) Balancing underfitting vs overfitting
C) The tradeoff between training and test error
D) A problem that only affects neural networks
```
→ B and C are nearly identical; A is vague; D is obviously wrong.

### Rewritten (Good)
```
Q: You train two models: Model A achieves 92% train accuracy, 85% test accuracy.
Model B achieves 87% train accuracy, 86% test accuracy.
Which demonstrates higher bias, and what does this indicate about its architecture?

A) Model A has higher bias; it has too few parameters to capture training data patterns
B) Model B has higher bias; the gap between train and test suggests the model is too simple
C) Model A has higher bias; the high training accuracy means it's overfitting
D) Bias cannot be determined from accuracy metrics alone
```
→ Requires understanding bias ≠ overfitting; includes gap analysis; answer B is subtle but correct.

---

## Implementation Priority

1. **Immediate:** Audit existing questions, flag easy patterns
2. **Short-term:** Rewrite worst 20% of questions using standards above
3. **Ongoing:** Apply standards to all new question creation
4. **Future:** Build question generator enforcing these rules
