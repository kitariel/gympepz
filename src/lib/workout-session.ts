const WORKOUT_SESSION_ID_KEY = "gympepz.workoutSessionId";

export function getWorkoutSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WORKOUT_SESSION_ID_KEY);
}

export function setWorkoutSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORKOUT_SESSION_ID_KEY, sessionId);
}

export function clearWorkoutSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WORKOUT_SESSION_ID_KEY);
}
