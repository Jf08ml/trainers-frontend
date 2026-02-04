import { apiDish } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";

// Types
export type MealCategory =
  | "desayuno"
  | "merienda_am"
  | "almuerzo"
  | "merienda_pm"
  | "cena";

export interface NutritionalInfo {
  calories: number;
  carbohydrates: number;
  fats: number;
  proteins: number;
}

export interface Dish {
  _id: string;
  name: string;
  category: MealCategory;
  ingredients: string[];
  preparation?: string;
  nutritionalInfo: NutritionalInfo;
  notes?: string;
  imageUrl?: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDishPayload {
  name: string;
  category: MealCategory;
  ingredients?: string[];
  preparation?: string;
  nutritionalInfo?: Partial<NutritionalInfo>;
  notes?: string;
  imageUrl?: string;
  organizationId: string;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

export const MEAL_CATEGORIES: { value: MealCategory; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "merienda_am", label: "Merienda AM" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "merienda_pm", label: "Merienda PM" },
  { value: "cena", label: "Cena" },
];

// CRUD Operations

export const getDishesByOrganizationId = async (
  organizationId: string
): Promise<Dish[]> => {
  try {
    const response = await apiDish.get<Response<Dish[]>>(
      `/organization/${organizationId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los platos");
    return [];
  }
};

export const searchDishes = async (
  organizationId: string,
  searchQuery: string = "",
  category: string = "",
  limit: number = 50
): Promise<Dish[]> => {
  try {
    const response = await apiDish.get<Response<Dish[]>>(
      `/organization/${organizationId}/search`,
      { params: { search: searchQuery, category, limit } }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error buscando platos");
    return [];
  }
};

export const getDishById = async (
  dishId: string
): Promise<Dish | undefined> => {
  try {
    const response = await apiDish.get<Response<Dish>>(`/${dishId}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo plato");
  }
};

export const createDish = async (
  dishData: CreateDishPayload
): Promise<Dish | undefined> => {
  try {
    const response = await apiDish.post<Response<Dish>>("/", dishData);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando plato");
  }
};

export const updateDish = async (
  dishId: string,
  updatedData: Partial<CreateDishPayload>
): Promise<Dish | undefined> => {
  try {
    const response = await apiDish.put<Response<Dish>>(
      `/${dishId}`,
      updatedData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando plato");
  }
};

export const deleteDish = async (dishId: string): Promise<void> => {
  try {
    await apiDish.delete<Response<void>>(`/${dishId}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando plato");
  }
};
