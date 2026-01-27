import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Button,
  Stack,
  Paper,
  TextInput,
  Textarea,
  Select,
  Group,
  Card,
  Text,
  ActionIcon,
  Modal,
  Badge,
  Alert,
  Switch,
  Grid,
  SegmentedControl,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash, IconAlertCircle } from "@tabler/icons-react";
import {
  getWeeklyPlanById,
  createWeeklyPlan,
  updateWeeklyPlan,
  type DaySession,
} from "../../services/weeklyPlanService";
import { getSessionsByOrganizationId } from "../../services/trainingSessionService";
import { getClientsByOrganizationId } from "../../services/clientService";
import SessionBuilderModal from "../../components/SessionBuilderModal";
import FormTemplateSelector from "../../components/FormTemplateSelector";

interface DaySessionForm {
  dayOfWeek: number;
  sessionId: string;
  sessionName: string;
  notes: string;
  completed: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

const WeeklyPlanBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const isEditing = !!id;

  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );
  const userId = useSelector((state: RootState) => state.auth.userId);
  const userRole = useSelector((state: RootState) => state.auth.role);

  // Data
  const [clients, setClients] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dayAssignments, setDayAssignments] = useState<DaySessionForm[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [addDayModal, setAddDayModal] = useState(false);
  const [sessionBuilderModal, setSessionBuilderModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [creationMode, setCreationMode] = useState<"template" | "create">("template");

  // Form
  const planForm = useForm({
    initialValues: {
      name: "",
      clientId: preselectedClientId || "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "",
      isActive: true,
      formTemplateId: null as string | null,
    },
    validate: {
      name: (value) => (!value.trim() ? "El nombre es obligatorio" : null),
      clientId: (value) => (!value ? "Debes seleccionar un cliente" : null),
      startDate: (value) => (!value ? "La fecha de inicio es obligatoria" : null),
      endDate: (value, values) => {
        if (!value) return "La fecha de fin es obligatoria";
        if (values.startDate && value < values.startDate) {
          return "La fecha de fin debe ser posterior a la fecha de inicio";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  useEffect(() => {
    if (isEditing && id) {
      loadPlan();
    }
  }, [id, isEditing]);

  // Auto-fill plan name with client name if preselected
  useEffect(() => {
    if (preselectedClientId && clients.length > 0 && !isEditing) {
      const client = clients.find((c) => c._id === preselectedClientId);
      if (client && !planForm.values.name) {
        const weekNumber = Math.ceil(
          (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
        planForm.setFieldValue("name", `${client.name} - Semana ${weekNumber}`);
      }
    }
  }, [preselectedClientId, clients, isEditing]);

  const loadData = async () => {
    if (!organizationId) return;
    const [clientsData, sessionsData] = await Promise.all([
      getClientsByOrganizationId(organizationId),
      getSessionsByOrganizationId(organizationId),
    ]);
    setClients(clientsData);
    setSessions(sessionsData);
  };

  const loadPlan = async () => {
    if (!id) return;
    setLoading(true);
    const plan = await getWeeklyPlanById(id);
    if (plan) {
      planForm.setValues({
        name: plan.name,
        clientId: typeof plan.clientId === "object" ? plan.clientId._id : plan.clientId,
        startDate: new Date(plan.startDate),
        endDate: new Date(plan.endDate),
        notes: plan.notes || "",
        isActive: plan.isActive,
        formTemplateId: typeof plan.formTemplateId === "object"
          ? plan.formTemplateId?._id || null
          : plan.formTemplateId || null,
      });

      const assignments: DaySessionForm[] = plan.weekDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        sessionId:
          typeof day.sessionId === "object" ? day.sessionId._id : day.sessionId,
        sessionName:
          typeof day.sessionId === "object" ? day.sessionId.name : "Sesión",
        notes: day.notes || "",
        completed: day.completed,
      }));
      setDayAssignments(assignments);
    }
    setLoading(false);
  };

  const handleAddDay = () => {
    if (selectedDay === null) {
      notifications.show({
        title: "Error",
        message: "Debes seleccionar un día",
        color: "red",
      });
      return;
    }

    if (dayAssignments.some((d) => d.dayOfWeek === selectedDay)) {
      notifications.show({
        title: "Error",
        message: "Este día ya tiene una sesión asignada",
        color: "red",
      });
      return;
    }

    if (creationMode === "template") {
      if (!selectedSession) {
        notifications.show({
          title: "Error",
          message: "Debes seleccionar una sesión",
          color: "red",
        });
        return;
      }

      const session = sessions.find((s) => s._id === selectedSession);
      if (!session) return;

      setDayAssignments([
        ...dayAssignments,
        {
          dayOfWeek: selectedDay,
          sessionId: selectedSession,
          sessionName: session.name,
          notes: "",
          completed: false,
        },
      ]);

      closeAddDayModal();
    } else {
      // Open SessionBuilderModal
      setSessionBuilderModal(true);
    }
  };

  const handleSessionCreated = (sessionId: string, sessionName: string) => {
    if (selectedDay === null) return;

    setDayAssignments([
      ...dayAssignments,
      {
        dayOfWeek: selectedDay,
        sessionId,
        sessionName,
        notes: "",
        completed: false,
      },
    ]);

    // Reload sessions to include the new one
    loadData();

    closeAddDayModal();
  };

  const closeAddDayModal = () => {
    setAddDayModal(false);
    setSelectedDay(null);
    setSelectedSession("");
    setCreationMode("template");
  };

  const handleRemoveDay = (dayOfWeek: number) => {
    setDayAssignments(dayAssignments.filter((d) => d.dayOfWeek !== dayOfWeek));
  };

  const handleUpdateDayNotes = (dayOfWeek: number, notes: string) => {
    setDayAssignments(
      dayAssignments.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, notes } : d
      )
    );
  };

  const handleSubmit = async () => {
    const validation = planForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (dayAssignments.length === 0) {
      notifications.show({
        title: "Error",
        message: "Debes asignar al menos un día de entrenamiento",
        color: "red",
      });
      return;
    }

    if (!organizationId) return;

    setLoading(true);

    try {
      const weekDays: DaySession[] = dayAssignments.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        sessionId: d.sessionId,
        notes: d.notes,
        completed: d.completed,
      }));

      const payload = {
        name: planForm.values.name.trim(),
        organizationId,
        clientId: planForm.values.clientId,
        weekDays,
        startDate: planForm.values.startDate.toISOString(),
        endDate: planForm.values.endDate.toISOString(),
        notes: planForm.values.notes.trim(),
        formTemplateId: planForm.values.formTemplateId || null,
        createdBy: userId || undefined,
        createdByModel: userRole === "employee" ? "Employee" as const : "Organization" as const,
      };

      if (isEditing && id) {
        await updateWeeklyPlan(id, {
          name: payload.name,
          weekDays: payload.weekDays,
          startDate: payload.startDate,
          endDate: payload.endDate,
          isActive: planForm.values.isActive,
          notes: payload.notes,
          formTemplateId: payload.formTemplateId,
        });
        notifications.show({
          title: "Éxito",
          message: "Plan semanal actualizado exitosamente",
          color: "green",
        });
      } else {
        await createWeeklyPlan(payload);
        notifications.show({
          title: "Éxito",
          message: "Plan semanal creado exitosamente",
          color: "green",
        });
      }

      navigate("/admin/weekly-plans");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Error al guardar el plan",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((d) => d.value === dayOfWeek)?.label || "Día";
  };

  const getAvailableDays = () => {
    const assignedDays = dayAssignments.map((d) => d.dayOfWeek);
    return DAYS_OF_WEEK.filter((d) => !assignedDays.includes(d.value));
  };

  const sortedDayAssignments = [...dayAssignments].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              {isEditing ? "Editar Plan Semanal" : "Nuevo Plan Semanal"}
            </Title>
            <Text c="dimmed" size="sm">
              Crea planes semanales personalizados para tus clientes
            </Text>
          </div>
          <Button variant="subtle" onClick={() => navigate("/admin/weekly-plans")}>
            Cancelar
          </Button>
        </Group>

        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Title order={4}>Información del Plan</Title>

            <TextInput
              label="Nombre del plan"
              placeholder="Ej: Plan de fuerza - Semana 1"
              {...planForm.getInputProps("name")}
              withAsterisk
            />

            <Select
              label="Cliente"
              placeholder="Selecciona un cliente"
              data={clients.map((c) => ({ value: c._id, label: c.name }))}
              {...planForm.getInputProps("clientId")}
              withAsterisk
              searchable
            />

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DatePickerInput
                  label="Fecha de inicio"
                  placeholder="Selecciona fecha"
                  {...planForm.getInputProps("startDate")}
                  withAsterisk
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DatePickerInput
                  label="Fecha de fin"
                  placeholder="Selecciona fecha"
                  {...planForm.getInputProps("endDate")}
                  withAsterisk
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Notas (opcional)"
              placeholder="Observaciones sobre el plan..."
              minRows={3}
              {...planForm.getInputProps("notes")}
            />

            <FormTemplateSelector
              organizationId={organizationId}
              value={planForm.values.formTemplateId}
              onChange={(value) => planForm.setFieldValue("formTemplateId", value)}
            />

            {isEditing && (
              <Switch
                label="Plan activo"
                {...planForm.getInputProps("isActive", { type: "checkbox" })}
              />
            )}
          </Stack>
        </Paper>

        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Días de Entrenamiento</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setAddDayModal(true)}
                disabled={dayAssignments.length >= 7}
              >
                Agregar Día
              </Button>
            </Group>

            {dayAssignments.length === 0 ? (
              <Alert icon={<IconAlertCircle />} color="blue">
                No hay días asignados. Haz clic en "Agregar Día" para comenzar.
              </Alert>
            ) : (
              <Stack gap="sm">
                {sortedDayAssignments.map((day) => (
                  <Card key={day.dayOfWeek} shadow="xs" padding="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <Badge size="lg" variant="filled">
                          {getDayName(day.dayOfWeek)}
                        </Badge>
                        <Text fw={500}>{day.sessionName}</Text>
                      </Group>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveDay(day.dayOfWeek)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                    <Textarea
                      placeholder="Notas para este día (opcional)..."
                      value={day.notes}
                      onChange={(e) =>
                        handleUpdateDayNotes(day.dayOfWeek, e.currentTarget.value)
                      }
                      minRows={2}
                      size="sm"
                    />
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate("/admin/weekly-plans")}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEditing ? "Guardar Cambios" : "Crear Plan"}
          </Button>
        </Group>
      </Stack>

      {/* Add Day Modal */}
      <Modal
        opened={addDayModal}
        onClose={closeAddDayModal}
        title="Agregar Día de Entrenamiento"
        centered
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Día de la semana"
            placeholder="Selecciona un día"
            data={getAvailableDays().map((d) => ({
              value: d.value.toString(),
              label: d.label,
            }))}
            value={selectedDay?.toString() || ""}
            onChange={(value) => setSelectedDay(value ? parseInt(value) : null)}
            withAsterisk
          />

          <SegmentedControl
            value={creationMode}
            onChange={(value) => setCreationMode(value as "template" | "create")}
            data={[
              { label: "Usar plantilla existente", value: "template" },
              { label: "Crear sesión nueva", value: "create" },
            ]}
            fullWidth
          />

          {creationMode === "template" ? (
            <Select
              label="Sesión de entrenamiento"
              placeholder="Selecciona una sesión"
              data={sessions.map((s) => ({ value: s._id, label: s.name }))}
              value={selectedSession}
              onChange={(value) => setSelectedSession(value || "")}
              withAsterisk
              searchable
              description={
                sessions.length === 0
                  ? "No hay plantillas. Selecciona 'Crear sesión nueva' para crear una."
                  : undefined
              }
            />
          ) : (
            <Alert color="blue" icon={<IconAlertCircle />}>
              Se abrirá el formulario completo para crear una nueva sesión de entrenamiento.
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeAddDayModal}>
              Cancelar
            </Button>
            <Button onClick={handleAddDay} loading={loading}>
              {creationMode === "template" ? "Agregar" : "Crear Sesión"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Session Builder Modal */}
      <SessionBuilderModal
        opened={sessionBuilderModal}
        onClose={() => setSessionBuilderModal(false)}
        onSessionCreated={handleSessionCreated}
      />
    </Container>
  );
};

export default WeeklyPlanBuilder;