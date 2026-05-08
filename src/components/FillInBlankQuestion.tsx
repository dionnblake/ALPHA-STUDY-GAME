import { Question } from '../types/models';
import { CheckCircle, XCircle } from 'lucide-react';

interface FillInBlankQuestionProps {
    question: Question;
    options: Array<{ letter: string; text: string }>;
    selectedLetter: string | null;
    state: 'active' | 'feedback';
    onSelectOption: (letter: string) => void;
}

export function FillInBlankQuestion({
    question,
    options,
    selectedLetter,
    state,
    onSelectOption
}: FillInBlankQuestionProps) {
    // For fill_in_blank, question_text is the definition/prompt
    // We'll use scenario if available for additional context

    const correctArr = (question.correct_answer || '')
        .split(',')
        .map(a => a.trim().toUpperCase());

    const renderedOptions = options.slice(0, 4);

    return (
        <div className="fill-in-blank-container">
            {/* Definition Section */}
            <div className="fill-in-blank-definition glass-panel">
                <div className="definition-label">DEFINE THE TERM</div>
                <div className="definition-text">
                    {question.question_text}
                </div>
                {question.scenario && (
                    <div className="definition-context" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>ADDITIONAL CONTEXT</div>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {question.scenario}
                        </div>
                    </div>
                )}
                <div className="q-type-hint" style={{ marginTop: '1.25rem' }}>SELECT THE BEST MATCH BELOW</div>
            </div>

            {/* Options Grid */}
            <div className="fill-in-blank-options">
                {renderedOptions.map((opt) => {
                    const isSelected = selectedLetter === opt.letter;
                    const isActualCorrect = correctArr.includes(opt.letter.toUpperCase());
                    let stateClass = '';

                    if (state === 'feedback') {
                        if (isSelected && isActualCorrect) stateClass = 'correct';
                        else if (isSelected && !isActualCorrect) stateClass = 'incorrect shake';
                        else if (isActualCorrect) stateClass = 'correct';
                        else stateClass = 'disabled';
                    } else if (isSelected) {
                        stateClass = 'selected';
                    }

                    return (
                        <div
                            key={opt.letter}
                            className={`fill-in-blank-option interactive-surface ${stateClass}`}
                            onClick={() => state === 'active' && onSelectOption(opt.letter)}
                        >
                            <div className="option-letter">{opt.letter}</div>
                            <div className="option-value">{opt.text}</div>
                            {state === 'feedback' && isActualCorrect && (
                                <CheckCircle size={20} color="var(--color-success)" />
                            )}
                            {state === 'feedback' && isSelected && !isActualCorrect && (
                                <XCircle size={20} color="var(--color-error)" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
