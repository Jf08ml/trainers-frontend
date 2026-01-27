import { apiClient } from "./axiosConfig";
import { handleAxiosError } from "../utils/handleAxiosError";

// Definir la estructura del entrenador asignado
export interface AssignedTrainer {
  _id: string;
  names: string;
  email?: string;
  phoneNumber?: string;
  phone_e164?: string;
  profilePhoto?: string;
}

// Definir la estructura de un cliente
export interface Client {
  _id: string;
  name: string;
  phoneNumber: string; // Número local sin código de país
  phone_e164?: string; // Formato internacional E.164 (ej: +573001234567)
  phone_country?: string; // Código de país ISO2 (ej: CO, MX, PE)
  email?: string;
  password?: string; // Opcional para login de clientes
  organizationId: string;
  birthDate: Date | null;
  assignedEmployeeId?: string | AssignedTrainer; // ID del entrenador asignado
  createdAt?: string;
  updatedAt?: string;
}

interface CreateClientPayload {
  name: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  organizationId: string;
  birthDate: Date | null;
  assignedEmployeeId?: string | null;
  initialFormId?: string; // Formulario inicial para asignar al cliente
}

interface Response<T> {
  code: number;
  status: string;
  data: T;
  message: string;
}

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<Response<Client[]>>("/");
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los clientes");
    return [];
  }
};

// Obtener clientes por organizationId
export const getClientsByOrganizationId = async (
  organizationId: string
): Promise<Client[]> => {
  try {
    const response = await apiClient.get<Response<Client[]>>(
      `/organization/${organizationId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los clientes");
    return [];
  }
};

// 🚀 Búsqueda optimizada de clientes con filtros
export const searchClients = async (
  organizationId: string,
  searchQuery: string = "",
  limit: number = 20
): Promise<Client[]> => {
  try {
    const response = await apiClient.get<Response<Client[]>>(
      `/organization/${organizationId}/search`,
      {
        params: { search: searchQuery, limit }
      }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los clientes por organización");
    return [];
  }
};

// Obtener un cliente por ID
export const getClientById = async (
  clientId: string
): Promise<Client | undefined> => {
  try {
    const response = await apiClient.get<Response<Client>>(`/${clientId}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener el cliente");
  }
};

// Crear un nuevo cliente
export const createClient = async (
  clientData: CreateClientPayload
): Promise<Client | undefined> => {
  try {
    const response = await apiClient.post<Response<Client>>("/", clientData);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al crear el cliente");
  }
};

// Actualizar un cliente
export const updateClient = async (
  clientId: string,
  updatedData: Partial<Client>
): Promise<Client | undefined> => {
  try {
    const response = await apiClient.put<Response<Client>>(
      `/${clientId}`,
      updatedData
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al actualizar el cliente");
  }
};

// Eliminar un cliente
export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    await apiClient.delete<Response<void>>(`/${clientId}`);
  } catch (error) {
    handleAxiosError(error, "Error al eliminar el cliente");
  }
};

// Obtener un cliente por número de teléfono
export const getClientByPhoneNumberAndOrganization = async (
  phoneNumber: string,
  organizationId: string
): Promise<Client | undefined> => {
  try {
    const response = await apiClient.get<Response<Client>>(
      `/phone/${phoneNumber}/organization/${organizationId}`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al buscar el cliente");
  }
};

// Carga masiva de clientes desde Excel
export const bulkUploadClients = async (
  clients: Array<{
    name: string;
    phoneNumber: string;
    email?: string;
    birthDate?: Date | null;
  }>,
  organizationId: string
): Promise<{
  success: Array<{ row: number; name: string; phoneNumber: string }>;
  errors: Array<{ row: number; name: string; phoneNumber: string; error: string }>;
  totalProcessed: number;
  totalSuccess: number;
  totalErrors: number;
}> => {
  try {
    const response = await apiClient.post<
      Response<{
        success: Array<{ row: number; name: string; phoneNumber: string }>;
        errors: Array<{ row: number; name: string; phoneNumber: string; error: string }>;
        totalProcessed: number;
        totalSuccess: number;
        totalErrors: number;
      }>
    >("/bulk-upload", { clients, organizationId });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al cargar los clientes");
    throw error;
  }
};

// Obtener el entrenador asignado de un cliente
export const getAssignedTrainer = async (
  clientId: string
): Promise<AssignedTrainer | null> => {
  try {
    const response = await apiClient.get<Response<AssignedTrainer | null>>(
      `/${clientId}/assigned-trainer`
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener el entrenador asignado");
    return null;
  }
};

// Obtener clientes asignados a un empleado
export const getClientsByAssignedEmployee = async (
  employeeId: string,
  organizationId?: string
): Promise<Client[]> => {
  try {
    const params = organizationId ? { organizationId } : {};
    const response = await apiClient.get<Response<Client[]>>(
      `/employees/${employeeId}/assigned-clients`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los clientes asignados");
    return [];
  }
};
