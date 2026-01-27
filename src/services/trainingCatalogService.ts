import { apiTraining } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";

// ========== INTERFACES ==========

export interface MuscleGroup {
  _id: string;
  name: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Equipment {
  _id: string;
  name: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionGoal {
  _id: string;
  name: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// ========== MUSCLE GROUPS ==========

export const getMuscleGroupsByOrganizationId = async (
  organizationId: string
): Promise<MuscleGroup[]> => {
  try {
    const response = await apiTraining.get<Response<MuscleGroup[]>>(
      `/organizations/${organizationId}/muscle-groups`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener grupos musculares");
    return [];
  }
};

export const createMuscleGroup = async (
  organizationId: string,
  name: string
): Promise<MuscleGroup | undefined> => {
  try {
    const response = await apiTraining.post<Response<MuscleGroup>>(
      `/organizations/${organizationId}/muscle-groups`,
      { name, organizationId }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando grupo muscular");
  }
};

export const updateMuscleGroup = async (
  id: string,
  name: string
): Promise<MuscleGroup | undefined> => {
  try {
    const response = await apiTraining.put<Response<MuscleGroup>>(
      `/muscle-groups/${id}`,
      { name }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando grupo muscular");
  }
};

export const deleteMuscleGroup = async (id: string): Promise<void> => {
  try {
    await apiTraining.delete(`/muscle-groups/${id}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando grupo muscular");
  }
};

// ========== EQUIPMENT ==========

export const getEquipmentByOrganizationId = async (
  organizationId: string
): Promise<Equipment[]> => {
  try {
    const response = await apiTraining.get<Response<Equipment[]>>(
      `/organizations/${organizationId}/equipment`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener equipamiento");
    return [];
  }
};

export const createEquipment = async (
  organizationId: string,
  name: string
): Promise<Equipment | undefined> => {
  try {
    const response = await apiTraining.post<Response<Equipment>>(
      `/organizations/${organizationId}/equipment`,
      { name, organizationId }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando equipamiento");
  }
};

export const updateEquipment = async (
  id: string,
  name: string
): Promise<Equipment | undefined> => {
  try {
    const response = await apiTraining.put<Response<Equipment>>(
      `/equipment/${id}`,
      { name }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando equipamiento");
  }
};

export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    await apiTraining.delete(`/equipment/${id}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando equipamiento");
  }
};

// ========== SESSION GOALS ==========

export const getSessionGoalsByOrganizationId = async (
  organizationId: string
): Promise<SessionGoal[]> => {
  try {
    const response = await apiTraining.get<Response<SessionGoal[]>>(
      `/organizations/${organizationId}/session-goals`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener objetivos");
    return [];
  }
};

export const createSessionGoal = async (
  organizationId: string,
  name: string
): Promise<SessionGoal | undefined> => {
  try {
    const response = await apiTraining.post<Response<SessionGoal>>(
      `/organizations/${organizationId}/session-goals`,
      { name, organizationId }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando objetivo");
  }
};

export const updateSessionGoal = async (
  id: string,
  name: string
): Promise<SessionGoal | undefined> => {
  try {
    const response = await apiTraining.put<Response<SessionGoal>>(
      `/session-goals/${id}`,
      { name }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando objetivo");
  }
};

export const deleteSessionGoal = async (id: string): Promise<void> => {
  try {
    await apiTraining.delete(`/session-goals/${id}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando objetivo");
  }
};
