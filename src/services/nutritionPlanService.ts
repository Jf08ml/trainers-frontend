import { apiNutrition } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";
import type { Dish, MealCategory, NutritionalInfo } from "./dishService";

// Interfaces

export interface RecommendedDish {
  dishId: string | Dish;
  mealType: MealCategory;
  weekNumber: number;
  dayOfWeek: number;
}

export interface ClientSelection {
  dishId: string | Dish;
  mealType: MealCategory;
  weekNumber: number;
  dayOfWeek: number;
}

export interface NutritionPlan {
  _id: string;
  name: string;
  clientId: string | { _id: string; name: string; email?: string; phoneNumber?: string };
  organizationId: string;
  totalWeeks: number;
  recommendedDishes: RecommendedDish[];
  clientSelections: ClientSelection[];
  nutritionalTargets: NutritionalInfo;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNutritionPlanPayload {
  name: string;
  organizationId: string;
  clientId: string;
  totalWeeks?: number;
  recommendedDishes?: {
    dishId: string;
    mealType: MealCategory;
    weekNumber: number;
    dayOfWeek: number;
  }[];
  nutritionalTargets?: Partial<NutritionalInfo>;
  notes?: string;
}

export interface UpdateNutritionPlanPayload {
  name?: string;
  totalWeeks?: number;
  recommendedDishes?: {
    dishId: string;
    mealType: MealCategory;
    weekNumber: number;
    dayOfWeek: number;
  }[];
  nutritionalTargets?: Partial<NutritionalInfo>;
  notes?: string;
  isActive?: boolean;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// CRUD Operations

export const createNutritionPlan = async (
  planData: CreateNutritionPlanPayload
): Promise<NutritionPlan | undefined> => {
  try {
    const response = await apiNutrition.post<Response<NutritionPlan>>(
      `/organizations/${planData.organizationId}/nutrition-plans`,
      planData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando plan nutricional");
  }
};

export const getNutritionPlansByOrganizationId = async (
  organizationId: string
): Promise<NutritionPlan[]> => {
  try {
    const response = await apiNutrition.get<Response<NutritionPlan[]>>(
      `/organizations/${organizationId}/nutrition-plans`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener planes nutricionales");
    return [];
  }
};

export const getNutritionPlansByClientId = async (
  clientId: string,
  organizationId?: string
): Promise<NutritionPlan[]> => {
  try {
    const response = await apiNutrition.get<Response<NutritionPlan[]>>(
      `/clients/${clientId}/nutrition-plans`,
      { params: organizationId ? { organizationId } : {} }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener planes del cliente");
    return [];
  }
};

export const getActiveNutritionPlansByClientId = async (
  clientId: string,
  organizationId?: string
): Promise<NutritionPlan[]> => {
  try {
    const response = await apiNutrition.get<Response<NutritionPlan[]>>(
      `/clients/${clientId}/nutrition-plans/active`,
      { params: organizationId ? { organizationId } : {} }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener planes activos");
    return [];
  }
};

export const getNutritionPlanById = async (
  planId: string
): Promise<NutritionPlan | undefined> => {
  try {
    const response = await apiNutrition.get<Response<NutritionPlan>>(
      `/nutrition-plans/${planId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo plan nutricional");
  }
};

export const updateNutritionPlan = async (
  planId: string,
  planData: UpdateNutritionPlanPayload
): Promise<NutritionPlan | undefined> => {
  try {
    const response = await apiNutrition.put<Response<NutritionPlan>>(
      `/nutrition-plans/${planId}`,
      planData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando plan nutricional");
  }
};

export const updateClientSelections = async (
  planId: string,
  selections: {
    dishId: string;
    mealType: MealCategory;
    weekNumber: number;
    dayOfWeek: number;
  }[]
): Promise<NutritionPlan | undefined> => {
  try {
    const response = await apiNutrition.put<Response<NutritionPlan>>(
      `/nutrition-plans/${planId}/selections`,
      { selections }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando selecciones");
  }
};

export const deleteNutritionPlan = async (
  planId: string
): Promise<void> => {
  try {
    await apiNutrition.delete<Response<void>>(`/nutrition-plans/${planId}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando plan nutricional");
  }
};
