/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { IconDeviceFloppy, IconUserPlus, IconX } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { CountryCode } from "libphonenumber-js";

import { RootState } from "../../../app/store";
import {
  createClient,
  updateClient,
  Client,
} from "../../../services/clientService";
import {
  getEmployeesByOrganizationId,
  Employee,
} from "../../../services/employeeService";
import {
  getFormTemplatesByOrganizationId,
  FormTemplate,
} from "../../../services/formTemplateService";
import {
  createFormResponse,
  getFormResponsesByClientId,
} from "../../../services/formResponseService";
import InternationalPhoneInput from "../../../components/InternationalPhoneInput";

interface ClientFormModalProps {
  opened: boolean;
  onClose: () => void;
  fetchClients: () => void;
  client?: Client | null;
  setClient?: React.Dispatch<React.SetStateAction<Client | null>>;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  opened,
  onClose,
  fetchClients,
  client,
  setClient,
}) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | null>(null);
  const [, setPhoneCountry] = useState<CountryCode | null>(null);
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Empleado asignado (entrenador)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Formulario inicial
  const [initialForms, setInitialForms] = useState<FormTemplate[]>([]);
  const [initialFormId, setInitialFormId] = useState<string | null>(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [hasInitialForm, setHasInitialForm] = useState(false); // Ya tiene formulario inicial asignado

  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );
  const organization = useSelector(
    (state: RootState) => state.organization.organization
  );

  const isEdit = !!client;

  const modalTitle = useMemo(
    () => (isEdit ? "Editar cliente" : "Nuevo cliente"),
    [isEdit]
  );

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setPhoneE164(null);
    setPhoneCountry(null);
    setPhoneValid(false);
    setPhoneError(null);
    setEmail("");
    setPassword("");
    setBirthDate(null);
    setAssignedEmployeeId(null);
    setInitialFormId(null);
    setHasInitialForm(false);
    setClient?.(null);
  };

  // Cargar empleados cuando se abre el modal
  useEffect(() => {
    const loadEmployees = async () => {
      if (!organizationId || !opened) return;
      setLoadingEmployees(true);
      try {
        const emps = await getEmployeesByOrganizationId(organizationId);
        // Filtrar empleados que NO estén explícitamente inactivos
        const filtered = emps.filter((e) => e.isActive !== false);
        setEmployees(filtered);
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [organizationId, opened]);

  // Cargar formularios cuando se abre el modal
  useEffect(() => {
    const loadInitialForms = async () => {
      if (!organizationId || !opened) return;
      setLoadingForms(true);
      try {
        const forms = await getFormTemplatesByOrganizationId(organizationId);
        setInitialForms(forms);

        // Si estamos editando, verificar si ya tiene formulario inicial asignado
        if (isEdit && client?._id) {
          const clientResponses = await getFormResponsesByClientId(client._id, organizationId);
          // Formulario inicial = respuesta sin weeklyPlanId
          const hasInitial = clientResponses.some((r) => !r.weeklyPlanId);
          setHasInitialForm(hasInitial);
        } else {
          setHasInitialForm(false);
        }
      } catch (error) {
        console.error("Error loading initial forms:", error);
      } finally {
        setLoadingForms(false);
      }
    };
    loadInitialForms();
  }, [organizationId, opened, isEdit, client?._id]);

  useEffect(() => {
    if (client && opened) {
      setName(client.name?.trim() ?? "");
      setPhoneNumber(client.phoneNumber?.trim() ?? "");
      setEmail(client.email?.trim() ?? "");
      setPassword("");
      setBirthDate(client.birthDate ? new Date(client.birthDate) : null);
      // Manejar assignedEmployeeId (puede ser string u objeto populado)
      if (client.assignedEmployeeId) {
        const empId = typeof client.assignedEmployeeId === "string"
          ? client.assignedEmployeeId
          : client.assignedEmployeeId._id;
        setAssignedEmployeeId(empId);
      } else {
        setAssignedEmployeeId(null);
      }

      setPhoneError(null);
      setPhoneValid(true);
    } else if (opened) {
      resetForm();
    }
  }, [client, opened]);

  const handlePhoneChange = (
    phone_e164: string | null,
    phone_country: CountryCode | null,
    isValid: boolean
  ) => {
    setPhoneE164(phone_e164);
    setPhoneCountry(phone_country);
    setPhoneValid(isValid);

    if (phone_e164) setPhoneNumber(phone_e164);

    if (!isValid && phone_e164) setPhoneError("Número de teléfono inválido");
    else setPhoneError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification({
        title: "Falta el nombre",
        message: "Escribe el nombre del cliente para continuar.",
        color: "red",
        autoClose: 2200,
      });
      return;
    }

    if (!phoneNumber.trim()) {
      setPhoneError("El teléfono es requerido");
      return;
    }

    if (!phoneValid || !phoneE164) {
      setPhoneError("Por favor ingresa un número de teléfono válido");
      return;
    }

    setLoading(true);
    try {
      if (!organizationId) throw new Error("Organization ID is required");

      const payload = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        birthDate: birthDate || null,
        assignedEmployeeId: assignedEmployeeId || undefined,
      };

      if (client) {
        await updateClient(client._id, payload);

        // Si se seleccionó un formulario inicial y no tenía uno, crearlo
        if (initialFormId && !hasInitialForm) {
          try {
            await createFormResponse({
              formTemplateId: initialFormId,
              weeklyPlanId: null,
              clientId: client._id,
              organizationId,
              createdByModel: "Organization",
            });
          } catch (formError) {
            console.error("Error creating initial form response:", formError);
          }
        }

        showNotification({
          title: "Cliente actualizado",
          message: "Los cambios se guardaron correctamente.",
          color: "green",
          autoClose: 2000,
          position: "top-right",
        });
      } else {
        await createClient({
          ...payload,
          organizationId,
          initialFormId: initialFormId || undefined,
        });
        showNotification({
          title: "Cliente creado",
          message: "El cliente quedó registrado correctamente.",
          color: "green",
          autoClose: 2000,
          position: "top-right",
        });
      }

      fetchClients();
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      showNotification({
        title: "No se pudo guardar",
        message:
          err.message ||
          (client ? "Error al actualizar el cliente" : "Error al crear el cliente"),
        color: "red",
        autoClose: 3200,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeWithReset = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={closeWithReset}
      centered
      radius="lg"
      size="lg"
      padding="lg"
      title={
        <Box>
          <Title order={4}>{modalTitle}</Title>
          <Text size="sm" c="dimmed">
            {isEdit
              ? "Actualiza los datos del cliente."
              : "Registra un cliente para agendamiento y recordatorios."}
          </Text>
        </Box>
      }
      overlayProps={{ blur: 4, opacity: 0.35 }}
      zIndex={999}
    >
      <Stack gap="md">
        <Box>
          <Text fw={600} mb={6}>
            Información básica
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Nombre"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              withAsterisk
              autoComplete="name"
            />

            <DateInput
              label="Fecha de nacimiento"
              value={birthDate}
              locale="es"
              valueFormat="DD/MM/YYYY"
              onChange={(value) => setBirthDate(value || null)}
              placeholder="Selecciona una fecha"
              maxDate={new Date()}
              clearable
              popoverProps={{ zIndex: 2000 }}
            />
          </SimpleGrid>

          <Box mt="md">
            <InternationalPhoneInput
              value={phoneNumber}
              organizationDefaultCountry={
                organization?.default_country as CountryCode
              }
              onChange={handlePhoneChange}
              error={phoneError}
              label="Teléfono"
              placeholder="300 000 0000"
              required
            />
            <Text size="xs" c="dimmed" mt={6}>
              Este número se usará para confirmaciones y recordatorios por WhatsApp/SMS (según tu configuración).
            </Text>
          </Box>

          <Select
            label="Entrenador asignado"
            placeholder={loadingEmployees ? "Cargando..." : "Selecciona un entrenador"}
            value={assignedEmployeeId}
            onChange={setAssignedEmployeeId}
            data={employees.map((emp) => ({
              value: emp._id,
              label: emp.names,
            }))}
            clearable
            searchable
            disabled={loadingEmployees}
            mt="md"
            description="El entrenador asignado podrá gestionar los planes de este cliente"
            comboboxProps={{ withinPortal: true, zIndex: 2000 }}
          />

          {initialForms.length > 0 && (!isEdit || !hasInitialForm) && (
            <Select
              label="Formulario inicial"
              placeholder={loadingForms ? "Cargando..." : "Selecciona un formulario"}
              value={initialFormId}
              onChange={setInitialFormId}
              data={initialForms.map((form) => ({
                value: form._id,
                label: form.name,
                description: form.description,
              }))}
              clearable
              searchable
              disabled={loadingForms}
              mt="md"
              description={
                isEdit
                  ? "Asigna un formulario inicial que el cliente deberá completar"
                  : "El cliente deberá completar este formulario al ingresar"
              }
              comboboxProps={{ withinPortal: true, zIndex: 2000 }}
            />
          )}
        </Box>

        <Divider />

        <Box>
          <Text fw={600} mb={6}>
            Acceso (opcional)
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Correo"
              placeholder="correo@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="email"
            />

            <TextInput
              type="password"
              label="Contraseña"
              placeholder={isEdit ? "Dejar vacío para no cambiar" : "Contraseña para acceso"}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}

              autoComplete={isEdit ? "new-password" : "new-password"}
            />
          </SimpleGrid>
        </Box>

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconX size={16} />}
            onClick={closeWithReset}
          >
            Cancelar
          </Button>

          <Group gap="sm">
            <Button
              variant="default"
              onClick={resetForm}
              disabled={loading}
            >
              Limpiar
            </Button>

            <Button
              onClick={handleSubmit}
              loading={loading}
              leftSection={
                isEdit ? <IconDeviceFloppy size={16} /> : <IconUserPlus size={16} />
              }
              disabled={!!phoneError}
            >
              {isEdit ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ClientFormModal;
