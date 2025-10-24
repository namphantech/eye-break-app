import exercises from "@/lib/exercises.json";

export interface Exercise {
  id: string;
  type: string;
  title: string;
  description: string;
  actionText: string;
  duration: number;
  animation: string;
  sound: string;
}

export const getRandomExercise = (): Exercise => {
  const randomIndex = Math.floor(Math.random() * exercises.length);
  return exercises[randomIndex];
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((exercise) => exercise.id === id);
};
