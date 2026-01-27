import { apiExercise } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";

// Interfaces
export interface Exercise {
  _id: string;
  name: string;
  description?: string;
  muscleGroups: any[]; // Can be string[] or populated MuscleGroup[]
  difficulty: "principiante" | "intermedio" | "avanzado";
  equipment: any[]; // Can be string[] or populated Equipment[]
  videoUrl?: string;
  imageUrl?: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExercisePayload {
  name: string;
  description?: string;
  muscleGroups: string[];
  difficulty: "principiante" | "intermedio" | "avanzado";
  equipment: string[];
  videoUrl?: string;
  imageUrl?: string;
  organizationId: string;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// CRUD Operations

export const getExercisesByOrganizationId = async (
  organizationId: string
): Promise<Exercise[]> => {
  try {
    const response = await apiExercise.get<Response<Exercise[]>>(
      `/organization/${organizationId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los ejercicios");
    return [];
  }
};

export const searchExercises = async (
  organizationId: string,
  searchQuery: string = "",
  limit: number = 50
): Promise<Exercise[]> => {
  try {
    const response = await apiExercise.get<Response<Exercise[]>>(
      `/organization/${organizationId}/search`,
      { params: { search: searchQuery, limit } }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error buscando ejercicios");
    return [];
  }
};

export const getExerciseById = async (
  exerciseId: string
): Promise<Exercise | undefined> => {
  try {
    const response = await apiExercise.get<Response<Exercise>>(
      `/${exerciseId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo ejercicio");
  }
};

export const createExercise = async (
  exerciseData: CreateExercisePayload
): Promise<Exercise | undefined> => {
  try {
    const response = await apiExercise.post<Response<Exercise>>(
      "/",
      exerciseData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando ejercicio");
  }
};

export const updateExercise = async (
  exerciseId: string,
  updatedData: Partial<Exercise>
): Promise<Exercise | undefined> => {
  try {
    const response = await apiExercise.put<Response<Exercise>>(
      `/${exerciseId}`,
      updatedData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando ejercicio");
  }
};

export const deleteExercise = async (exerciseId: string): Promise<void> => {
  try {
    await apiExercise.delete<Response<void>>(`/${exerciseId}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando ejercicio");
  }
};
