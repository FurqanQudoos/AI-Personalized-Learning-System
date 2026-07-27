"""
AI Exam Evaluator & Tutor - API version
----------------------------------------
This merges:
  - The UPDATED vision/evaluation/tutor logic (better OCR params, Groq batch
    weakness-topic detection, friendly-mentor tutor persona, self-consistency
    confidence check)
  - The API-style wrapper functions (process_exam_image, start_teaching,
    student_chat, start_quiz, evaluate_quiz)

Run with:
    uvicorn main:app --reload

Requires (in addition to your existing deps):
    pip install fastapi uvicorn python-multipart
"""

import os
import re
import json
import time
import pickle
import uuid
import warnings
from collections import Counter
from typing import List, Optional

import cv2
from ultralytics import YOLO
import easyocr
import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from dotenv import load_dotenv
from groq import Groq

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel

warnings.filterwarnings("ignore", category=UserWarning)

# ==========================================
# CONFIG
# ==========================================
GROQ_MODEL = "openai/gpt-oss-120b"   # llama-3.3-70b-versatile deprecated by Groq (17 June 2026)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploaded_exams")
os.makedirs(UPLOAD_DIR, mode=0o775, exist_ok=True)
try:
    os.chmod(UPLOAD_DIR, 0o775)
except OSError:
    pass

# ==========================================
# PHASE 1: GLOBAL INITIALIZATIONS (runs once at server startup)
# ==========================================
print("Loading AI Models (YOLO + EasyOCR)... This might take a moment.")
try:
    yolo_model = YOLO('best.pt')
    reader = easyocr.Reader(['en'], gpu=True)
except Exception as e:
    raise RuntimeError(f"Failed to load YOLO or OCR: {e}")

print("Loading DistilBERT model (kept loaded for compatibility, not used in the main flow)...")
model_path = "./fyp_trained_model"
try:
    tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
    distilbert_model = DistilBertForSequenceClassification.from_pretrained(model_path)
    with open(f'{model_path}/label_encoder.pkl', 'rb') as f:
        encoder = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load DistilBERT! Check your folder path: {e}")

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY not found! Check your .env file.")

client = Groq(api_key=api_key)
print(f"✅ All AI Models Successfully Loaded! (Using Groq model: {GROQ_MODEL})\n")

app = FastAPI(title="AI Exam Evaluator & Tutor API")


# ==========================================
# SHARED HELPER: ROBUST JSON EXTRACTION
# ==========================================
def extract_json(raw_output, expect="object"):
    """
    Pulls a JSON object {} or array [] out of an LLM response,
    even if there's extra text/markdown fences around it.
    expect: "object" or "array"
    """
    pattern = r'\{.*\}' if expect == "object" else r'\[.*\]'
    match = re.search(pattern, raw_output, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON {expect} found in LLM response.")
    return json.loads(match.group(0))


# ==========================================
# PHASE 2: VISION & EVALUATION FUNCTIONS
# ==========================================

def run_vision_pipeline(image_path):
    print(f"\n--- 🔍 SCANNING IMAGE WITH YOLO: {image_path} ---")

    if not image_path or not os.path.exists(image_path):
        print(f"❌ ERROR: Image file does not exist at '{image_path}'.")
        return []

    if os.path.getsize(image_path) == 0:
        print(f"❌ ERROR: Image file is empty at '{image_path}'.")
        return []

    img = cv2.imread(image_path)
    if img is None:
        print(f"❌ ERROR: Could not read image at '{image_path}'.")
        return []

    results = yolo_model.predict(source=image_path, conf=0.30, iou=0.7, verbose=False)

    all_mcqs_text = []
    boxes = results[0].boxes.xyxy.cpu().numpy()
    if len(boxes) == 0:
        print("⚠️ WARNING: YOLO detected 0 boxes on this image.")
        return []

    print("--- 📝 READING TEXT WITH OCR ---")
    boxes = sorted(boxes, key=lambda b: b[1])

    for count, box in enumerate(boxes):
        x1, y1, x2, y2 = map(int, box)
        cropped_piece = img[y1:y2, x1:x2]

        ocr_results = reader.readtext(cropped_piece, detail=1, paragraph=False, mag_ratio=3, text_threshold=0.3, min_size=7)
        ocr_results.sort(key=lambda x: x[0][0][1])

        final_text_list = []
        current_line = []
        line_tolerance = 15

        if len(ocr_results) > 0:
            previous_y = ocr_results[0][0][0][1]
            for (ocr_box, text, confidence) in ocr_results:
                current_y = ocr_box[0][1]
                current_x = ocr_box[0][0]

                if abs(current_y - previous_y) <= line_tolerance:
                    current_line.append((current_x, text))
                else:
                    current_line.sort(key=lambda item: item[0])
                    for item in current_line:
                        final_text_list.append(item[1])
                    current_line = [(current_x, text)]
                    previous_y = current_y

            if current_line:
                current_line.sort(key=lambda item: item[0])
                for item in current_line:
                    final_text_list.append(item[1])

        final_text = " ".join(final_text_list)
        all_mcqs_text.append(final_text)
        print(f"✅ Box {count + 1} Extracted successfully!")

    return all_mcqs_text


def get_groq_evaluation(all_mcqs_text):
    print("\n🤖 AI EXAMINER IS GRADING THE PAPER...")

    prompt = f"""
    You are an Expert AI Examiner. Evaluate the following raw OCR text containing an MCQ exam.

    RAW OCR DATA LIST:
    {all_mcqs_text}

    UNIVERSAL RULES:
    1. SCATTERED OCR DATA (CRITICAL): The OCR list is not always in perfect order. It may contain full questions and isolated text snippets. The isolated snippets represent the student's selected answers.
    2. DETECTIVE MAPPING (UNIVERSAL LOGIC): Logically match every isolated snippet to its corresponding question using text similarity and option letters (A, B, C, D). Even if there are OCR typos, link it to the closest matching option.
    3. STRICT FAITHFUL EXTRACTION: Extract exactly what the student selected, even if it has typos. Just autocorrect the typos (not answer) and write it in student_selected.
    4. INCOMPLETE DATA REJECTION: If the OCR text contains ONLY options (no question) or ONLY a question (no options), IGNORE IT completely. Do NOT guess or hallucinate missing text. Do NOT include it in the JSON output.if the ocr list has AJJ or A),B),C) and D) in the same line these all are options and the question is in the previous line then consider that line as question and these all as options.
    5. CORRECT ANSWER: Provide the universally accepted correct answer based on Computer Science domain knowledge.
    6. SMART GRADING: If the student's selection logically matches the correct answer (ignoring minor OCR typos), the status is "Correct" (Marks: 1). Otherwise, "Incorrect" (Marks: 0).

    CRITICAL: Respond ONLY with a valid JSON ARRAY of objects. Do not use markdown blocks like ```json.
    Format exactly like this:
    [
      {{
        "question_no": "Q1",
        "question_text": "Full text of the question here?",
        "student_selected": "The option student picked (or 'Not Detected by OCR')",
        "correct_answer": "The actual correct option",
        "status": "Correct" or "Incorrect",
        "marks": 1 or 0
      }}
    ]
    """

    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"⏳ Attempt {attempt + 1}/{max_retries} — Sending request to Groq...")
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            raw_output = response.choices[0].message.content
            evaluated_json = extract_json(raw_output, expect="array")
            return evaluated_json
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} Failed! Error: {e}")
            if attempt == max_retries - 1:
                return []
            time.sleep((attempt + 1) * 2)

    return []


def normalize_answer(raw_answer):
    """
    Cleans up LLM output so 'B', 'Option B', 'b)', 'The answer is B.' etc.
    all collapse to the same comparable value ('B').
    """
    text = raw_answer.strip()
    match = re.search(r'\b([ABCD])\b', text.upper())
    if match:
        return match.group(1)
    cleaned = re.sub(r'[^\w\s]', '', text).strip().lower()
    return cleaned


def check_llm_confidence(question_text, n_attempts=3):
    """
    Self-consistency check: ask the LLM the same question n_attempts times
    at low temperature and take a majority vote.
    """
    answers_raw = []
    answers_normalized = []

    verify_prompt = f"""You are a CS domain expert examiner. This is a multiple-choice question.
Respond with ONLY the single correct option letter: A, B, C, or D.
Do NOT explain. Do NOT repeat the option text. Output exactly one capital letter and nothing else.

Question: {question_text}
"""

    for i in range(n_attempts):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": verify_prompt}],
                temperature=0.2
            )
            raw_ans = response.choices[0].message.content.strip()
            answers_raw.append(raw_ans)
            answers_normalized.append(normalize_answer(raw_ans))
        except Exception as e:
            answers_raw.append(f"ERROR: {e}")
            answers_normalized.append(f"ERROR_{i}")

    counts = Counter(answers_normalized)
    most_common_answer, most_common_count = counts.most_common(1)[0]

    if most_common_count == n_attempts:
        confidence = "High"
    elif most_common_count >= 2:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
        "confidence": confidence,
        "final_answer": most_common_answer,
        "attempts_raw": answers_raw,
        "attempts_normalized": answers_normalized
    }


def add_confidence_checks(evaluated_json):
    print("\n🔬 VERIFYING LLM ANSWER CONFIDENCE...")
    for item in evaluated_json:
        q_text = item.get("question_text", "")
        if not q_text:
            item["llm_confidence"] = "Skipped - no question text"
            continue

        result = check_llm_confidence(q_text)
        item["llm_confidence"] = result["confidence"]
        item["llm_confidence_final_answer"] = result["final_answer"]
        item["llm_confidence_attempts_raw"] = result["attempts_raw"]

        flag = "✅" if result["confidence"] == "High" else "⚠️"
        print(f"{flag} {item.get('question_no', '?')} -> Confidence: {result['confidence']}")

    return evaluated_json


def batch_detect_weakness_topics(incorrect_questions):
    """
    Classifies all incorrect questions into topics in ONE Groq call.
    """
    valid_topics = [
        "Operating Systems", "Database Systems", "Computer Networks",
        "Web Development", "Artificial Intelligence", "Data Science", "Information Security",
        "Software Engineering", "Data Structures", "Object-Oriented Programming",
        "Compiler Design", "Cloud Computing", "Functional Programming"
    ]

    prompt = f"""
    Classify the following Computer Science questions into EXACTLY ONE topic from the list below.
    Valid Topics: {', '.join(valid_topics)}

    Questions List:
    {json.dumps(incorrect_questions, indent=2)}

    CRITICAL: Respond ONLY with a valid JSON dictionary where the key is the exact question text, and the value is the exact topic name. Do NOT add markdown blocks.
    """

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        raw_output = response.choices[0].message.content
        return extract_json(raw_output, expect="object")
    except Exception as e:
        print(f"❌ Batch Classification Error: {e}")
        return {q: "General Computer Science" for q in incorrect_questions}


# ==========================================
# PHASE 3: TUTOR & QUIZ FUNCTIONS
# ==========================================

def get_intent(student_input):
    prompt = f"""
    Student's message: "{student_input}"

    Task: Analyze the intent of the student. Choose strictly ONE category:
    1. SPECIFIC_DOUBT: If the student asks a specific question or explicitly asks for an example (e.g., "give me an example", "what is ReLU?").
    2. EXPLAIN_MORE: If the student simply says they don't understand and need more detail without specifying what.
    3. GENERATE_QUIZ: If the student says they understand, asks for a test, or says move on.

    CRITICAL: Respond ONLY with a valid JSON object. Do NOT add any extra text or markdown formatting.
    Format:
    {{
        "intent": "SPECIFIC_DOUBT" or "EXPLAIN_MORE" or "GENERATE_QUIZ",
        "extracted_doubt": "If they asked a specific question or asked for an example, write it here. Otherwise, leave empty."
    }}
    """
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        raw_output = response.choices[0].message.content
        return extract_json(raw_output, expect="object")
    except Exception as e:
        print(f"\n[DEBUG: Intent Detection Failed. Defaulting to EXPLAIN_MORE. Error: {e}]")
        return {"intent": "EXPLAIN_MORE", "extracted_doubt": ""}


def teach_topic(topic, attempt, student_message="", failed_concepts_context=""):
    """Teaching function adapted for Micro-Topics with Easy-to-Understand Depth"""

    context_instruction = ""
    if failed_concepts_context:
        context_instruction = f"""
        CRITICAL CONTEXT: The student failed the following specific questions in the domain of '{topic}':
        {failed_concepts_context}

        YOUR TASK: DO NOT teach the broad subject of '{topic}'. Analyze the failed questions, extract the EXACT specific micro-concepts/sub-topics they cover, and teach ONLY those specific weak areas.
        """

    interaction_context = ""
    if student_message:
        interaction_context = f"""
        The student just said this to you: "{student_message}"

        YOUR IMMEDIATE REACTION RULES:
        1. IF ABUSIVE: Tell them gently but firmly to keep it professional.
        2. IF OFF-TOPIC: Remind them to focus on the current topic first.
        3. IF VALID DOUBT: Address their specific confusion using a simple real-world analogy.
        """

    if attempt == 1:
        instructions = "Provide a clean, easy-to-read Concept Map for the specific sub-topics extracted from the failed questions. Use simple headings and bullet points. Explain the core mechanics using everyday analogies (like a restaurant, traffic, filing cabinet, etc.). Do NOT use dense academic jargon. End by asking: 'Does this make sense, or do you have any specific doubts before we start the quiz?'"
    elif attempt == 2:
        instructions = "Address the student's message directly. Explain the 'Why' and 'How' deeply but in VERY SIMPLE English. Break down any complex engineering terms into plain words. End by asking: 'Do you have any MORE doubts, or should we jump into the quiz?'"
    else:
        instructions = "The student failed the mock quiz. Provide a FINAL, definitive explanation using a VERY SIMPLE REAL-WORLD SYSTEM ARCHITECTURE as an example (e.g., how this is used in an everyday app like WhatsApp, an ATM, or an online store). Focus exclusively on fixing their mistakes. IMPORTANT: Do NOT ask any questions at the end. Conclude with an encouraging remark."

    prompt = f"""
    You are a highly skilled but very friendly Senior Software Engineer mentoring a final-semester Computer Science student.
    Broad Domain: {topic}
    {context_instruction}
    {interaction_context}

    YOUR TEACHING STYLE & LANGUAGE RULES (CRITICAL):
    1. EXTREME SIMPLICITY: You MUST write in basic, conversational, everyday English. Speak as if you are explaining a concept to a college or university student over a cup of coffee.
    2. DEEP BUT ACCESSIBLE: Explain the core technical mechanics deeply, but WITHOUT using overly complex academic jargon. 
    3. BAN POST-GRAD JARGON: Do NOT use extreme terminology unless absolutely necessary. If you must use a technical term, you MUST instantly explain it in plain words.
    4. USE ANALOGIES: sometimes use relatable, real-world analogies. when explaining a complex concept.
    5. VISUAL STRUCTURE: Keep paragraphs medium not too short. Use simple bullet points. Do not create massive, intimidating tables.

    Instructions: {instructions}

    CRITICAL RULE: Respond COMPLETELY in simple English. Maintain your friendly, mentor-like persona. Never sound like a strict academic textbook.
    """

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"\n[DEBUG: teach_topic Groq call failed: {e}]")
        return "⚠️ Tutor is temporarily unavailable (API error). Please try again."


def generate_mock_quiz(topic, failed_concepts_context=""):
    """Generates 10 Advanced Questions based strictly on what was just taught"""

    prompt = f"""
    You are an expert university examiner. Generate EXACTLY 10 ADVANCED multiple-choice questions (MCQs).

    Context of what the student just learned/failed:
    {failed_concepts_context}

    RULES:
    1. Base the questions STRICTLY on the specific micro-topics mentioned in the context above, falling under the broad domain of '{topic}'.
    2. The questions MUST be at an advanced university level (scenario-based, code-logic based, or deep conceptual), matching the depth of your recent teaching.
    3. CRITICAL RANDOMIZATION: You MUST heavily randomize the 'correct_option' across 'A', 'B', 'C', and 'D'. Do NOT favor 'A' or 'B'.

    CRITICAL: Respond ONLY with a valid JSON ARRAY of objects. Do NOT add any extra text.
    Format exactly like this:
    [
        {{
            "question": "Advanced Question text here?",
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D",
            "correct_option": "C",
            "explanation": "Deep technical reason why this is correct"
        }}
    ]
    """
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )

        raw_output = response.choices[0].message.content

        print("\n========== GROQ QUIZ RESPONSE ==========")
        print(raw_output)
        print("========================================\n")

        return extract_json(raw_output, expect="array")

    except Exception as e:
        import traceback

        print("\n========== QUIZ ERROR ==========")
        traceback.print_exc()
        print("================================\n")

        return [{
            "question": "System Error: Cannot load custom questions.",
            "A": "Ok",
            "B": "Error",
            "C": "Skip",
            "D": "None",
            "correct_option": "B",
            "explanation": str(e)
        }]
    # try:
    #     response = client.chat.completions.create(
    #         model=GROQ_MODEL,
    #         messages=[{"role": "user", "content": prompt}],
    #         temperature=0.4
    #     )
    #     raw_output = response.choices[0].message.content
    #     return extract_json(raw_output, expect="array")
    # except Exception as e:
    #     print(f"\n[DEBUG: Quiz Generation Failed. Executing Fallback. Error: {e}]")
    #     return [{"question": "System Error: Cannot load custom questions.", "A": "Ok", "B": "Error", "C": "Skip", "D": "None", "correct_option": "B", "explanation": "API failed to generate JSON array."}]
    

# ==========================================
# PHASE 4: API-STYLE WRAPPER FUNCTIONS
# (these are what the FastAPI endpoints call)
# ==========================================

def process_exam_image(image_path):
    """Runs the full OCR -> grading -> confidence -> weakness pipeline on one image."""
    if not image_path or not os.path.exists(image_path):
        return {
            "success": False,
            "error": f"Uploaded image not found at '{image_path}'.",
        }

    raw_mcqs = run_vision_pipeline(image_path)
    if not raw_mcqs:
        return {"success": False, "error": "No text found in image."}

    evaluated_data = get_groq_evaluation(raw_mcqs)
    if not evaluated_data:
        return {"success": False, "error": "Evaluation failed."}

    evaluated_data = add_confidence_checks(evaluated_data)

    weak_topics_dict = {}
    incorrect_questions = [
        item.get("question_text", "")
        for item in evaluated_data
        if str(item.get("status", "")).strip().lower() == "incorrect" and item.get("question_text")
    ]

    if incorrect_questions:
        topic_mapping = batch_detect_weakness_topics(incorrect_questions)
        for item in evaluated_data:
            q_text = item.get("question_text", "")
            if q_text in topic_mapping:
                topic = topic_mapping[q_text]
                item["weakness_topic"] = topic
                weak_topics_dict.setdefault(topic, []).append(q_text)

    total_questions = len(evaluated_data)
    correct = sum(1 for q in evaluated_data if str(q.get("status", "")).strip().lower() == "correct")
    incorrect = total_questions - correct

    return {
        "success": True,
        "summary": {
            "total_questions": total_questions,
            "correct": correct,
            "incorrect": incorrect,
            "score": correct
        },
        "report": evaluated_data,
        "weak_topics": weak_topics_dict
    }


def start_teaching(topic, weak_questions):
    failed_context = "\n".join(f"- {q}" for q in weak_questions)
    message = teach_topic(topic=topic, attempt=1, failed_concepts_context=failed_context)
    return {
        "success": True,
        "topic": topic,
        "context": failed_context,
        "message": message
    }


def student_chat(topic, weak_questions, student_message):
    """
    Mirrors the terminal's while-loop exactly:
        intent_data = get_intent(student_msg)
        if intent == GENERATE_QUIZ: break (signal ready for quiz)
        else: teach_topic(attempt=2, student_message=student_msg, failed_concepts_context=...)
    The terminal ALWAYS passes the raw student message (never extracted_doubt),
    regardless of whether the intent is SPECIFIC_DOUBT or EXPLAIN_MORE.
    """
    failed_context = "\n".join(f"- {q}" for q in weak_questions)
    intent_data = get_intent(student_message)
    intent = intent_data.get("intent")

    if intent == "GENERATE_QUIZ":
        return {
            "success": True,
            "intent": "GENERATE_QUIZ",
            "message": "Student is ready for quiz."
        }

    reply = teach_topic(topic=topic, attempt=2, student_message=student_message, failed_concepts_context=failed_context)

    return {
        "success": True,
        "intent": intent,
        "reply": reply
    }
def start_quiz(topic, weak_questions):

    failed_context = "\n".join(f"- {q}" for q in weak_questions)

    quiz = generate_mock_quiz(
        topic=topic,
        failed_concepts_context=failed_context
    )

    if not quiz:
        return {
            "success": False,
            "error": "Quiz generation failed."
        }

    quiz_id = str(uuid.uuid4())

    frontend_questions = [
        {
            "question": q["question"],
            "A": q["A"],
            "B": q["B"],
            "C": q["C"],
            "D": q["D"]
        }
        for q in quiz
    ]

    return {
        "success": True,

        "quiz_id": quiz_id,

        "topic": topic,

        # Frontend questions
        "questions": frontend_questions,

        # Full quiz for Mongo
        "original_quiz": quiz,

        "total_questions": len(frontend_questions)
    }



def evaluate_quiz(topic, quiz, answers):
    """
    Grades the quiz AND reproduces the terminal script's exact post-quiz behavior:
      - If the student made 0 mistakes -> a congratulatory line (no LLM call, same as terminal).
      - If the student made mistakes -> automatically calls teach_topic(attempt=3, ...)
        with the joined mistakes string, exactly like the terminal's
        `final_remedy = teach_topic(current_topic, attempt=3, failed_concepts_context=failed_concepts_history)`.
    This was the missing piece that made the web teaching module feel different
    from the terminal one.
    """

    print("TOPIC =", topic)
    print("QUIZ LENGTH =", len(quiz))
    print("ANSWERS LENGTH =", len(answers))
    print("ANSWERS =", answers)

    if len(answers) != len(quiz):
        return {
            "success": False,
            "error": "Invalid number of answers."
        }

    score = 0
    results = []
    mistakes = []

    for student_ans, question in zip(answers, quiz):

        student_ans = str(student_ans).strip().upper()
        correct = str(question["correct_option"]).strip().upper()

        if student_ans == correct:

            score += 1

            results.append({
                "question": question["question"],
                "status": "Correct"
            })

        else:

            results.append({
                "question": question["question"],
                "status": "Incorrect",
                "correct_answer": correct,
                "explanation": question["explanation"]
            })

            mistakes.append(
                f"Failed Question: {question['question']} | "
                f"Concept missed: {question['explanation']}"
            )

    # ---- Same branch the terminal script takes after printing the score ----
    if len(mistakes) == 0:

        final_tutor_note = (
            f"🏆 Excellent work! You answered everything correctly. "
            f"The micro-topics for '{topic}' are fully cleared!"
        )

    else:

        failed_concepts_history = "\n".join(mistakes)

        # SAME PROMPT
        final_tutor_note = teach_topic(
            topic,
            attempt=3,
            failed_concepts_context=failed_concepts_history
        )

    return {
        "success": True,
        "topic": topic,
        "score": score,
        "total": len(quiz),
        "results": results,
        "mistakes": mistakes,
        "final_tutor_note": final_tutor_note
    }


# # ==========================================
# # PHASE 5: FASTAPI REQUEST MODELS
# # ==========================================

# class TeachStartRequest(BaseModel):
#     topic: str
#     weak_questions: List[str]


# class TeachChatRequest(BaseModel):
#     topic: str
#     weak_questions: List[str]
#     message: str


# class QuizStartRequest(BaseModel):
#     topic: str
#     weak_questions: List[str]


# class QuizSubmitRequest(BaseModel):
#     quiz_id: str
#     answers: List[str]


# # ==========================================
# # PHASE 6: FASTAPI ENDPOINTS
# # ==========================================

# @app.post("/exam/upload")
# async def upload_exam(file: UploadFile = File(...)):
#     """
#     Upload a scanned exam image. Runs OCR + grading + confidence check +
#     weakness-topic detection and returns the full report.
#     """
#     file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
#     try:
#         with open(file_path, "wb") as f:
#             f.write(await file.read())

#         result = process_exam_image(file_path)
#         if not result.get("success"):
#             raise HTTPException(status_code=422, detail=result.get("error", "Processing failed."))
#         return result
#     finally:
#         if os.path.exists(file_path):
#             os.remove(file_path)


# @app.post("/teach/start")
# def teach_start(req: TeachStartRequest):
#     return start_teaching(req.topic, req.weak_questions)


# @app.post("/teach/chat")
# def teach_chat(req: TeachChatRequest):
#     return student_chat(req.topic, req.weak_questions, req.message)


# @app.post("/quiz/start")
# def quiz_start(req: QuizStartRequest):
#     result = start_quiz(req.topic, req.weak_questions)
#     if not result.get("success"):
#         raise HTTPException(status_code=500, detail=result.get("error", "Quiz generation failed."))
#     return result


# @app.post("/quiz/submit")
# def quiz_submit(req: QuizSubmitRequest):
#     result = evaluate_quiz(req.quiz_id, req.answers)
#     if not result.get("success"):
#         raise HTTPException(status_code=400, detail=result.get("error", "Could not evaluate quiz."))
#     return result


# @app.get("/health")
# def health():
#     return {
#         "status": "ok",
#         "model": GROQ_MODEL
#     }

def generate_ai_insights(data):
    """
    Generates personalized AI learning insights based on the student's
    overall quiz history.
    """

    prompt = f"""
You are an expert AI Learning Analytics Mentor.

Analyze the following student's learning statistics.

Student Data:

{json.dumps(data, indent=2)}

Write a personalized performance report.

Rules:

1. Mention the student's overall performance.
2. Mention whether the student is improving or declining.
3. Mention the strongest performance.
4. Mention the weakest topics.
5. Give practical study advice.
6. Mention whether the student is exam ready.
7. Maximum 180 words.
8. Use very simple English.
9. Do NOT use markdown.
10. Return ONLY the paragraph.

"""

    try:

        response = client.chat.completions.create(

            model=GROQ_MODEL,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.4

        )

        return {
            "success": True,
            "aiInsights": response.choices[0].message.content.strip()
        }

    except Exception as e:

        print(f"\n[DEBUG: AI Insights Failed: {e}]")

        return {
            "success": False,
            "aiInsights": (
                "Unable to generate AI insights at the moment. "
                "Please try again later."
            )
        }