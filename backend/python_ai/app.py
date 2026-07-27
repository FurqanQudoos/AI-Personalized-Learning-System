
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import shutil
import os
import time
import uuid

load_dotenv()

from master_pipeline import (
    process_exam_image,
    start_teaching,
    student_chat,
    start_quiz,
    evaluate_quiz,
    generate_ai_insights
)

app = FastAPI()

# ==============================
# CORS (from .env CORS_ORIGINS)
# ==============================
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:5000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# Request Models
# ==============================

# class TeachRequest(BaseModel):
#     topic: str
#     weak_questions: list[str]
class TeachRequest(BaseModel):
    weak_topics: dict[str, list[str]]


class ChatRequest(BaseModel):
    weak_topics: dict[str, list[str]]
    student_message: str


class QuizRequest(BaseModel):
    weak_topics: dict[str, list[str]]

class SubmitQuizRequest(BaseModel):
    quiz_id: str
    topic: str
    quiz: list[dict]
    answers: list[str]

class InsightsRequest(BaseModel):
    totalQuizzes: int
    averageScore: float
    latestScore: float
    previousScore: float
    improvement: float
    bestScore: float
    performanceLevel: str
    weakTopics: list
# ==============================
# HOME
# ==============================

@app.get("/")
def home():
    return {
        "success": True,
        "message": "AI Exam Checker Backend Running"
    }


# ==============================
# ANALYZE EXAM
# ==============================

@app.post("/analyze")
async def analyze_exam(file: UploadFile = File(...)):

    file_path = None

    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        upload_dir = os.path.join(base_dir, "uploads")
        os.makedirs(upload_dir, mode=0o775, exist_ok=True)

        try:
            os.chmod(upload_dir, 0o775)
        except OSError:
            pass

        safe_name = os.path.basename(file.filename or "exam.jpg")
        file_path = os.path.join(
            upload_dir,
            f"{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}_{safe_name}"
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            os.chmod(file_path, 0o664)
        except OSError:
            pass

        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            raise FileNotFoundError("Uploaded image was not saved correctly.")

        print(f"✅ Image Uploaded: {file_path}")

        result = process_exam_image(file_path)

        return result

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        if file_path and os.path.exists(file_path):
            os.remove(file_path)


# ==============================
# START TEACHING
# ==============================

# @app.post("/teach")
# def teach(request: TeachRequest):

#     return start_teaching(
#         request.topic,
#         request.weak_questions
#     )
@app.post("/teach")
def teach(request: TeachRequest):

    if not request.weak_topics:
        return {
            "success": False,
            "error": "No weak topics found."
        }

    print("WEAK TOPICS =", request.weak_topics)

    combined_message = []

    for topic, weak_questions in request.weak_topics.items():

        print("CURRENT TOPIC =", topic)
        print("QUESTIONS =", weak_questions)

        response = start_teaching(
            topic,
            weak_questions
        )

        print("SUCCESS =", response.get("success"))

        if response.get("success"):

            print("MESSAGE LENGTH =", len(response["message"]))

            combined_message.append(
                f"\n\n==================== {topic} ====================\n\n"
                + response["message"]
            )

    print("TOTAL TOPICS TAUGHT =", len(combined_message))

    return {
        "success": True,
        "message": "\n".join(combined_message)
    }


# ==============================
# CHAT WITH TUTOR
# ==============================

@app.post("/chat")
def chat(request: ChatRequest):

    if not request.weak_topics:
        return {
            "success": False,
            "error": "No weak topics found."
        }

    topic = next(iter(request.weak_topics.keys()))
    weak_questions = request.weak_topics[topic]

    return student_chat(
        topic,
        weak_questions,
        request.student_message
    )


# ==============================
# GENERATE QUIZ
# ==============================

@app.post("/quiz")
def quiz(request: QuizRequest):

    if not request.weak_topics:
        return {
            "success": False,
            "error": "No weak topics found."
        }

    topic = next(iter(request.weak_topics.keys()))
    weak_questions = request.weak_topics[topic]

    return start_quiz(
        topic,
        weak_questions
    )

# ==============================
# SUBMIT QUIZ
# ==============================

@app.post("/submit-quiz")
def submit_quiz(request: SubmitQuizRequest):

    try:

        return evaluate_quiz(
            request.topic,
            request.quiz,
            request.answers
        )

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
# ==============================
# AI INSIGHTS
# ==============================

@app.post("/insights")
def insights(request: InsightsRequest):

    try:

        result = generate_ai_insights({

            "totalQuizzes": request.totalQuizzes,
            "averageScore": request.averageScore,
            "latestScore": request.latestScore,
            "previousScore": request.previousScore,
            "improvement": request.improvement,
            "bestScore": request.bestScore,
            "performanceLevel": request.performanceLevel,
            "weakTopics": request.weakTopics

        })

        return result

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }