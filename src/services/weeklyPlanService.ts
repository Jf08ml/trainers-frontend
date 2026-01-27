import { apiTraining } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";

// Interfaces
export interface DaySession {
  dayOfWeek: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  sessionId: string | any; // Can be string or populated Session
  notes?: string;
  completed: boolean;
  completedExercises?: string[]; // Array of SessionExercise IDs that are completed
}

export interface WeeklyPlan {
  _id: string;
  name: string;
  organizationId: string;
  clientId: string | any; // Can be string or populated Client
  employeeId?: string | any; // Can be string or populated Employee
  weekDays: DaySession[];
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  isActive: boolean;
  notes?: string;
  formTemplateId?: string | { _id: string; name: string; description?: string } | null;
  createdBy?: string;
  createdByModel?: "Employee" | "Organization";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWeeklyPlanPayload {
  name: string;
  organizationId: string;
  clientId: string;
  employeeId?: string;
  weekDays: DaySession[];
  startDate: string;
  endDate: string;
  notes?: string;
  formTemplateId?: string | null;
  createdBy?: string;
  createdByModel?: "Employee" | "Organization";
}

export interface UpdateWeeklyPlanPayload {
  name?: string;
  weekDays?: DaySession[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  notes?: string;
  formTemplateId?: string | null;
}

export interface MarkDayCompletedPayload {
  dayOfWeek: number;
  completed: boolean;
}

export interface MarkExerciseCompletedPayload {
  dayOfWeek: number;
  sessionExerciseId: string;
  completed: boolean;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// CRUD Operations

// CREATE
export const createWeeklyPlan = async (
  planData: CreateWeeklyPlanPayload
): Promise<WeeklyPlan | undefined> => {
  try {
    const response = await apiTraining.post<Response<WeeklyPlan>>(
      `/organizations/${planData.organizationId}/weekly-plans`,
      planData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando plan semanal");
  }
};

// READ - By Organization
export const getWeeklyPlansByOrganizationId = async (
  organizationId: string
): Promise<WeeklyPlan[]> => {
  try {
    const response = await apiTraining.get<Response<WeeklyPlan[]>>(
      `/organizations/${organizationId}/weekly-plans`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo planes semanales");
    return [];
  }
};

// READ - By Client
export const getWeeklyPlansByClientId = async (
  clientId: string,
  organizationId?: string
): Promise<WeeklyPlan[]> => {
  try {
    const params = organizationId ? { organizationId } : {};
    const response = await apiTraining.get<Response<WeeklyPlan[]>>(
      `/clients/${clientId}/weekly-plans`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo planes del cliente");
    return [];
  }
};

// READ - Active plans by Client
export const getActivePlansByClientId = async (
  clientId: string,
  organizationId?: string
): Promise<WeeklyPlan[]> => {
  try {
    const params = organizationId ? { organizationId } : {};
    const response = await apiTraining.get<Response<WeeklyPlan[]>>(
      `/clients/${clientId}/weekly-plans/active`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo planes activos");
    return [];
  }
};

// READ - By ID
export const getWeeklyPlanById = async (
  id: string
): Promise<WeeklyPlan | undefined> => {
  try {
    const response = await apiTraining.get<Response<WeeklyPlan>>(
      `/weekly-plans/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo plan semanal");
  }
};

// UPDATE
export const updateWeeklyPlan = async (
  id: string,
  updatedData: UpdateWeeklyPlanPayload
): Promise<WeeklyPlan | undefined> => {
  try {
    const response = await apiTraining.put<Response<WeeklyPlan>>(
      `/weekly-plans/${id}`,
      updatedData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando plan semanal");
  }
};

// UPDATE - Mark day completed
export const markDayCompleted = async (
  id: string,
  payload: MarkDayCompletedPayload
): Promise<WeeklyPlan | undefined> => {
  try {
    const response = await apiTraining.patch<Response<WeeklyPlan>>(
      `/weekly-plans/${id}/mark-day`,
      payload
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando estado del día");
  }
};

// UPDATE - Mark exercise completed
export const markExerciseCompleted = async (
  id: string,
  payload: MarkExerciseCompletedPayload
): Promise<WeeklyPlan | undefined> => {
  try {
    const response = await apiTraining.patch<Response<WeeklyPlan>>(
      `/weekly-plans/${id}/mark-exercise`,
      payload
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando estado del ejercicio");
  }
};

// DELETE
export const deleteWeeklyPlan = async (id: string): Promise<void> => {
  try {
    await apiTraining.delete<Response<void>>(`/weekly-plans/${id}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando plan semanal");
  }
};

// DUPLICATE
export const duplicateWeeklyPlan = async (
  id: string,
  newClientId?: string
): Promise<WeeklyPlan | undefined> => {
  try {
    const response = await apiTraining.post<Response<WeeklyPlan>>(
      `/weekly-plans/${id}/duplicate`,
      { newClientId }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error duplicando plan semanal");
  }
};
