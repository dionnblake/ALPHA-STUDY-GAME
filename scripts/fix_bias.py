import json
import os
import random

def improve_json_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    for q in questions:
        # 1. Shuffle options
        options = q.get('options', [])
        if not options:
            continue
            
        correct_answer_text = q.get('correctAnswer')
        
        # Shuffle
        random.shuffle(options)
        
        # 2. Update correctAnswer if it was a letter (not common in these JSONs but good to be safe)
        # Actually in these JSONs, correctAnswer is the TEXT of the answer.
        # So shuffling options doesn't change what the correct answer text is.
        # But we should ensure the correct answer is IN the options.
        if correct_answer_text not in options:
            # Maybe it matched an old letter?
            pass

        # 3. Simple length normalization heuristic (for now, I'll manually fix the content in the next step)
        # This script mainly shuffles to break the 'B' bias immediately at the data source level.
        
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=4)

if __name__ == "__main__":
    paths = [
        "public/questions/beginner_questions.json",
        "public/questions/intermediate_questions.json",
        "public/questions/advanced_questions.json",
        "public/questions/adaptive_questions.json"
    ]
    for p in paths:
        full_p = os.path.join(os.getcwd(), p)
        if os.path.exists(full_p):
            improve_json_file(full_p)
            print(f"Processed {p}")
