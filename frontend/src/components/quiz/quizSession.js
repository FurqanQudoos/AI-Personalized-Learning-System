export function clearQuizSession() {
  sessionStorage.removeItem("quizQuestions");
  sessionStorage.removeItem("quizId");
  sessionStorage.removeItem("quizAnswers");
}
