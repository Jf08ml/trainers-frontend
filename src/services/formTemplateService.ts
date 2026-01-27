import { apiTraining } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";

// Tipos de preguntas disponibles
export type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "single_choice"
  | "multiple_choice"
  | "scale"
  | "yes_no";

// Interfaz de pregunta
export interface Question {
  _id?: string;
  order: number;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

// Interfaz de plantilla de formulario
export interface FormTemplate {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  questions: Question[];
  isActive: boolean;
  createdBy?: string;
  createdByModel?: "Employee" | "Organization";
  createdAt?: string;
  updatedAt?: string;
}

// Payload para crear/actualizar plantilla
export interface CreateFormTemplatePayload {
  name: string;
  description?: string;
  questions: Omit<Question, "_id">[];
  createdBy?: string;
  createdByModel?: "Employee" | "Organization";
}

export interface UpdateFormTemplatePayload {
  name?: string;
  description?: string;
  questions?: Omit<Question, "_id">[];
  isActive?: boolean;
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// CREATE
export const createFormTemplate = async (
  organizationId: string,
  templateData: CreateFormTemplatePayload
): Promise<FormTemplate | undefined> => {
  try {
    const response = await apiTraining.post<Response<FormTemplate>>(
      `/organizations/${organizationId}/form-templates`,
      templateData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando plantilla de formulario");
  }
};

// READ - By Organization
export const getFormTemplatesByOrganizationId = async (
  organizationId: string,
  options?: { includeInactive?: boolean }
): Promise<FormTemplate[]> => {
  try {
    const params: Record<string, string | boolean> = {};
    if (options?.includeInactive) {
      params.includeInactive = true;
    }
    const response = await apiTraining.get<Response<FormTemplate[]>>(
      `/organizations/${organizationId}/form-templates`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo plantillas de formulario");
    return [];
  }
};

// READ - By ID
export const getFormTemplateById = async (
  id: string
): Promise<FormTemplate | undefined> => {
  try {
    const response = await apiTraining.get<Response<FormTemplate>>(
      `/form-templates/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo plantilla de formulario");
  }
};

// UPDATE
export const updateFormTemplate = async (
  id: string,
  updateData: UpdateFormTemplatePayload
): Promise<FormTemplate | undefined> => {
  try {
    const response = await apiTraining.put<Response<FormTemplate>>(
      `/form-templates/${id}`,
      updateData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando plantilla de formulario");
  }
};

// DELETE (soft delete)
export const deleteFormTemplate = async (id: string): Promise<void> => {
  try {
    await apiTraining.delete<Response<void>>(`/form-templates/${id}`);
  } catch (error) {
    handleAxiosError(error, "Error eliminando plantilla de formulario");
  }
};
