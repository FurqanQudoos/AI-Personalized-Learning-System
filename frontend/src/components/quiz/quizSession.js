const QUIZ_KEYS = [
  "quizQuestions",
  "quizId",
  "quizAnswers",
  "quizResult",
  "quizAttempted",
];

export function clearQuizSession() {
  QUIZ_KEYS.forEach((key) => sessionStorage.removeItem(key));
}

/** Clears only an in-progress quiz (keeps completed result). */
export function clearActiveQuizSession() {
  sessionStorage.removeItem("quizQuestions");
  sessionStorage.removeItem("quizId");
  sessionStorage.removeItem("quizAnswers");
}

export function saveQuizResult(result) {
  sessionStorage.setItem("quizResult", JSON.stringify(result));
  sessionStorage.setItem("quizAttempted", "true");
  clearActiveQuizSession();
}

export function getQuizResult() {
  try {
    const saved = sessionStorage.getItem("quizResult");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function hasAttemptedQuiz() {
  return (
    sessionStorage.getItem("quizAttempted") === "true" &&
    Boolean(getQuizResult())
  );
}
