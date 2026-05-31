const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('public/questions/aws_certified_ai_practitioner_questions.json', 'utf8'));

// Map to track which explanation contains which real question
// Each question's explanation field embeds the NEXT question
const fixed = questions.map((q, idx) => {
  const explText = q.explanation || '';
  
  // Find all question patterns (sentences ending with ?)
  const allQuestions = explText.match(/[^.!?]*?[^.!?]*?[A-D]\.?\s+[^?]*\?/g) || [];
  
  // The last match is typically the NEXT question's stem
  if (allQuestions.length > 0) {
    const lastQuestion = allQuestions[allQuestions.length - 1].trim();
    
    // Skip if this already looks like a real question
    if (q.questionText && !['tricky', 'Ready', 'jump'].some(w => q.questionText.toLowerCase().includes(w))) {
      return q;
    }
    
    // Extract clean stem: remove the "Is it", "What", "So", option labels
    let stem = lastQuestion
      .replace(/^(?:Is it\s+|What\s+|So\s+|How\s+|Hmm,\s+)?/i, '')
      .replace(/\?$/, '')
      .replace(/\s+[AB]\.?\s+.+/s, '')  // Remove options
      .trim();
    
    if (stem && stem.length > 15 && stem.length < 250) {
      q.questionText = stem;
      q.question_text = stem;
    }
  }
  
  return q;
});

fs.writeFileSync('public/questions/aws_certified_ai_practitioner_questions.json', JSON.stringify(fixed, null, 2));
console.log(`Fixed ${fixed.length} questions`);
