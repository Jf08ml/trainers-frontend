import { apiTraining } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";
import { FormTemplate } from "./formTemplateService";

// Interfaz de respuesta a una pregunta
export interface Answer {
  questionId: string;
  questionText: string;
  questionType: string;
  value: string | number | string[] | boolean;
}

// Interfaz de respuesta de formulario
export interface FormResponse {
  _id: string;
  formTemplateId: string | FormTemplate;
  weeklyPlanId: string | { _id: string; name: string; startDate: string; endDate: string };
  clientId: string | { _id: string; name: string; email?: string; phoneNumber?: string };
  organizationId: string;
  status: "pending" | "completed";
  answers: Answer[];
  submittedAt?: string;
  createdBy?: string;
  createdByModel?: "Employee" | "Organization" | "System";
  createdAt?: string;
  updatedAt?: string;
}

// Payload para crear respuesta
export interface CreateFormResponsePayload {
  formTemplateId: string;
  weeklyPlanId?: string | null; // Opcional - null para formularios iniciales
  clientId: string;
  organizationId: string;
  createdBy?: string;
  createdByModel?: "Employee" | "Organization" | "System";
}

// Payload para enviar respuestas
export interface SubmitAnswersPayload {
  answers: {
    questionId: string;
    value: string | number | string[] | boolean;
  }[];
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// CREATE
export const createFormResponse = async (
  responseData: CreateFormResponsePayload
): Promise<FormResponse | undefined> => {
  try {
    const response = await apiTraining.post<Response<FormResponse>>(
      "/form-responses",
      responseData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error creando respuesta de formulario");
  }
};

// READ - By Client (all)
export const getFormResponsesByClientId = async (
  clientId: string,
  organizationId?: string
): Promise<FormResponse[]> => {
  try {
    const params = organizationId ? { organizationId } : {};
    const response = await apiTraining.get<Response<FormResponse[]>>(
      `/clients/${clientId}/form-responses`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo respuestas del cliente");
    return [];
  }
};

// READ - Pending by Client
export const getPendingFormResponsesByClientId = async (
  clientId: string,
  organizationId?: string
): Promise<FormResponse[]> => {
  try {
    const params = organizationId ? { organizationId } : {};
    const response = await apiTraining.get<Response<FormResponse[]>>(
      `/clients/${clientId}/form-responses/pending`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo formularios pendientes");
    return [];
  }
};

// READ - By ID
export const getFormResponseById = async (
  id: string
): Promise<FormResponse | undefined> => {
  try {
    const response = await apiTraining.get<Response<FormResponse>>(
      `/form-responses/${id}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo respuesta de formulario");
  }
};

// READ - By Weekly Plan
export const getFormResponseByWeeklyPlanId = async (
  planId: string
): Promise<FormResponse | null> => {
  try {
    const response = await apiTraining.get<Response<FormResponse>>(
      `/weekly-plans/${planId}/form-response`
    );
    return response.data.data;
  } catch (error) {
    // No es error si no existe
    return null;
  }
};

// UPDATE - Submit answers
export const submitFormResponse = async (
  id: string,
  payload: SubmitAnswersPayload
): Promise<FormResponse | undefined> => {
  try {
    const response = await apiTraining.put<Response<FormResponse>>(
      `/form-responses/${id}`,
      payload
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error enviando formulario");
  }
};

// READ - By Organization (admin)
export const getFormResponsesByOrganizationId = async (
  organizationId: string,
  status?: "pending" | "completed"
): Promise<FormResponse[]> => {
  try {
    const params = status ? { status } : {};
    const response = await apiTraining.get<Response<FormResponse[]>>(
      `/organizations/${organizationId}/form-responses`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo respuestas de la organización");
    return [];
  }
};
