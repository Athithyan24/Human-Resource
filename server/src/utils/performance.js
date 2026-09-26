export function gradeFromScore(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  return "Needs Improvement";
}

export function computePerformance({
  attendanceRate = 0,
  taskCompletion = 0,
  timelyReporting = 0,
  productivity = 0,
}) {
  const score =
    attendanceRate * 0.2 +
    taskCompletion * 0.4 +
    timelyReporting * 0.2 +
    productivity * 0.2;
  return {
    attendanceRate,
    taskCompletion,
    timelyReporting,
    productivity,
    score: Math.round(score * 10) / 10,
    grade: gradeFromScore(score),
  };
}
