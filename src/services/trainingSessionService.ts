import { apiTraining } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";
import type {
  MuscleGroup,
  Equipment,
  SessionGoal,
} from "./trainingCatalogService";

// ========== INTERFACES ==========

// Base session without populated references
export interface Session {
  _id: string;
  name: string;
  type: "strength" | "cardio" | "mixed";
  organizationId: string;
  goals?: string[] | SessionGoal[];
  muscleFocus?: string[] | MuscleGroup[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Session with populated references (from GET)
export interface PopulatedSession extends Omit<Session, "goals" | "muscleFocus"> {
  goals: SessionGoal[];
  muscleFocus: MuscleGroup[];
  exercises?: PopulatedSessionExercise[];
}

// Payload for creating session
export interface CreateSessionPayload {
  name: string;
  type: "strength" | "cardio" | "mixed";
  organizationId: string;
  goals?: string[];
  muscleFocus?: string[];
  notes?: string;
}

// Exercise configuration types
export interface StrengthSet {
  load?: number;
  repsMin: number;
  repsMax: number;
  restSeconds?: number;
  rpe?: number;
}

export interface StrengthConfig {
  type: "strength";
  sets: StrengthSet[];
}

export interface CardioContinuousConfig {
  type: "cardio_continuous";
  durationMinutes: number;
  effort?: number;
  zone?: number;
  pace?: string;
}

export interface CardioIntervalConfig {
  type: "cardio_interval";
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  workEffort?: number;
  restEffort?: number;
}

export type ExerciseConfig =
  | StrengthConfig
  | CardioContinuousConfig
  | CardioIntervalConfig;

// Session exercise
export interface SessionExercise {
  _id: string;
  organizationId: string;
  sessionId: string;
  exerciseId: string;
  order: number;
  notes?: string;
  config: ExerciseConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  _id: string;
  name: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  difficulty: "principiante" | "intermedio" | "avanzado";
  equipment: Equipment[];
  videoUrl?: string;
  imageUrl?: string;
  organizationId: string;
}

export interface PopulatedSessionExercise extends Omit<SessionExercise, "exerciseId"> {
  exerciseId: Exercise;
}

export interface CreateSessionExercisePayload {
  organizationId: string;
  sessionId: string;
  exerciseId: string;
  order?: number;
  notes?: string;
  config: ExerciseConfig;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// ========== SESSIONS ==========

export const getSessionsByOrganizationId = async (
  organizationId: string
): Promise<PopulatedSession[]> => {
  try {
    const response = await apiTraining.get<Response<PopulatedSession[]>>(
      `/organizations/${organizationId}/sessions`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener sesiones");
    return [];
  }
};

export const getSessionById = async (
  sessionId: string
): Promise<PopulatedSession | undefined> => {
  try {
    const response = await apiTraining.get<Response<PopulatedSession>>(
      `/sessions/${sessionId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener sesión");
  }
};

export const createSession = async (
  sessionData: CreateSessionPayload
): Promise<Session | undefined> => {
  try {
    const response = await apiTraining.post<Response<Session>>(
      `/organizations/${sessionData.organizationId}/sessions`,
      sessionData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando sesión");
  }
};

export const updateSession = async (
  sessionId: string,
  sessionData: Partial<CreateSessionPayload>
): Promise<Session | undefined> => {
  try {
    const response = await apiTraining.put<Response<Session>>(
      `/sessions/${sessionId}`,
      sessionData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando sesión");
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await apiTraining.delete(`/sessions/${sessionId}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando sesión");
  }
};

export const duplicateSession = async (
  sessionId: string
): Promise<PopulatedSession | undefined> => {
  try {
    const response = await apiTraining.post<Response<PopulatedSession>>(
      `/sessions/${sessionId}/duplicate`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error duplicando sesión");
  }
};

// ========== SESSION EXERCISES ==========

export const getSessionExercisesBySessionId = async (
  sessionId: string
): Promise<PopulatedSessionExercise[]> => {
  try {
    const response = await apiTraining.get<Response<PopulatedSessionExercise[]>>(
      `/sessions/${sessionId}/exercises`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener ejercicios de la sesión");
    return [];
  }
};

export const createSessionExercise = async (
  sessionId: string,
  exerciseData: CreateSessionExercisePayload
): Promise<SessionExercise | undefined> => {
  try {
    const response = await apiTraining.post<Response<SessionExercise>>(
      `/sessions/${sessionId}/exercises`,
      exerciseData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error agregando ejercicio a la sesión");
  }
};

export const updateSessionExercise = async (
  exerciseId: string,
  exerciseData: Partial<CreateSessionExercisePayload>
): Promise<SessionExercise | undefined> => {
  try {
    const response = await apiTraining.patch<Response<SessionExercise>>(
      `/session-exercises/${exerciseId}`,
      exerciseData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando ejercicio de sesión");
  }
};

export const deleteSessionExercise = async (exerciseId: string): Promise<void> => {
  try {
    await apiTraining.delete(`/session-exercises/${exerciseId}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando ejercicio de sesión");
  }
};

export const reorderSessionExercises = async (
  sessionId: string,
  exerciseOrders: { id: string; order: number }[]
): Promise<PopulatedSessionExercise[]> => {
  try {
    const response = await apiTraining.patch<Response<PopulatedSessionExercise[]>>(
      `/sessions/${sessionId}/exercises/reorder`,
      { exerciseOrders }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error reordenando ejercicios");
    return [];
  }
};
