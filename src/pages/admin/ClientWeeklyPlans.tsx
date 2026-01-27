import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Button,
  Group,
  ActionIcon,
  Stack,
  Paper,
  Badge,
  Text,
  Menu,
  Card,
  Avatar,
  ScrollArea,
  Progress,
  Tooltip,
  Box,
  ThemeIcon,
  Loader,
  Center,
  Switch,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCopy,
  IconDots,
  IconCalendar,
  IconArrowLeft,
  IconCalendarEvent,
  IconPlayerPlay,
  IconHistory,
  IconClipboardList,
  IconClipboardCheck,
  IconClock,
} from "@tabler/icons-react";
import {
  getWeeklyPlansByClientId,
  deleteWeeklyPlan,
  duplicateWeeklyPlan,
  type WeeklyPlan,
} from "../../services/weeklyPlanService";
import { getClientById, type Client } from "../../services/clientService";
import { getFormResponseByWeeklyPlanId } from "../../services/formResponseService";
import FormResponseViewer from "../../components/FormResponseViewer";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const ClientWeeklyPlans: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  // Client state
  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Filter state
  const [showPastPlans, setShowPastPlans] = useState(false);

  // Form response state
  const [formResponseId, setFormResponseId] = useState<string | null>(null);
  const [formViewerOpen, setFormViewerOpen] = useState(false);
  const [formResponsesMap, setFormResponsesMap] = useState<Record<string, { _id: string; status: string } | null>>({});

  // Load client and plans
  useEffect(() => {
    if (clientId) {
      loadClient();
      loadClientPlans();
    }
  }, [clientId, organizationId]);

  const loadClient = async () => {
    if (!clientId) return;
    setLoadingClient(true);
    const data = await getClientById(clientId);
    setClient(data || null);
    setLoadingClient(false);
  };

  const loadClientPlans = async () => {
    if (!clientId) return;
    setLoadingPlans(true);
    const data = await getWeeklyPlansByClientId(clientId, organizationId);
    // Sort by startDate descending (most recent first)
    const sorted = data.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    setPlans(sorted);
    setLoadingPlans(false);

    // Load form responses for plans with formTemplateId
    loadFormResponses(sorted);
  };

  const loadFormResponses = async (plansList: WeeklyPlan[]) => {
    const plansWithForms = plansList.filter((p) => p.formTemplateId);
    const responsesMap: Record<string, { _id: string; status: string } | null> = {};

    for (const plan of plansWithForms) {
      try {
        const response = await getFormResponseByWeeklyPlanId(plan._id);
        responsesMap[plan._id] = response
          ? { _id: response._id, status: response.status }
          : null;
      } catch {
        responsesMap[plan._id] = null;
      }
    }

    setFormResponsesMap(responsesMap);
  };

  const handleViewFormResponse = async (planId: string) => {
    const existingResponse = formResponsesMap[planId];
    if (existingResponse) {
      setFormResponseId(existingResponse._id);
      setFormViewerOpen(true);
    }
  };

  const handleDelete = async (planId: string) => {
    if (confirm("¿Estás seguro de eliminar este plan semanal?")) {
      await deleteWeeklyPlan(planId);
      setPlans(plans.filter((p) => p._id !== planId));
      notifications.show({
        title: "Éxito",
        message: "Plan semanal eliminado exitosamente",
        color: "green",
      });
    }
  };

  const handleDuplicate = async (planId: string) => {
    // Backend handles next week calculation (Monday to Sunday after plan ends)
    const duplicated = await duplicateWeeklyPlan(planId);
    if (duplicated) {
      await loadClientPlans();
      notifications.show({
        title: "Éxito",
        message: `Plan duplicado para la semana del ${formatDate(duplicated.startDate)}`,
        color: "green",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    const endStr = end.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  const getDaysCount = (plan: WeeklyPlan) => {
    return plan.weekDays?.length || 0;
  };

  const getCompletedCount = (plan: WeeklyPlan) => {
    return plan.weekDays?.filter((day) => day.completed).length || 0;
  };

  const getProgressPercent = (plan: WeeklyPlan) => {
    const total = getDaysCount(plan);
    if (total === 0) return 0;
    return Math.round((getCompletedCount(plan) / total) * 100);
  };

  const isPlanCurrent = (plan: WeeklyPlan) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(plan.endDate);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  };

  const isPlanFuture = (plan: WeeklyPlan) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(plan.startDate);
    start.setHours(0, 0, 0, 0);
    return start > now;
  };

  const isPlanPast = (plan: WeeklyPlan) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(plan.endDate);
    end.setHours(0, 0, 0, 0);
    return end < now;
  };

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter plans based on toggle
  const filteredPlans = showPastPlans
    ? plans
    : plans.filter((p) => !isPlanPast(p) || isPlanCurrent(p));

  // Group plans by status
  const groupedPlans = {
    current: filteredPlans.filter((p) => isPlanCurrent(p) && p.isActive),
    upcoming: filteredPlans.filter((p) => isPlanFuture(p) && p.isActive),
    past: filteredPlans.filter((p) => isPlanPast(p) && !isPlanCurrent(p)),
    inactive: filteredPlans.filter((p) => !p.isActive),
  };

  const renderPlanCard = (plan: WeeklyPlan) => {
    const progress = getProgressPercent(plan);
    const isCurrent = isPlanCurrent(plan);
    const isPast = isPlanPast(plan);

    return (
      <Card key={plan._id} shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <Text fw={600} size="sm">
              {plan.name}
            </Text>
            {isCurrent && (
              <Badge size="xs" color="blue" variant="filled">
                En curso
              </Badge>
            )}
            {isPast && progress === 100 && (
              <Badge size="xs" color="green" variant="light">
                Completado
              </Badge>
            )}
          </Group>
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => navigate(`/admin/weekly-plans/edit/${plan._id}`)}
              >
                Editar
              </Menu.Item>
              <Menu.Item
                leftSection={<IconCopy size={14} />}
                onClick={() => handleDuplicate(plan._id)}
              >
                Duplicar (siguiente semana)
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(plan._id)}
              >
                Eliminar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="xs" mb="sm">
          <IconCalendar size={14} color="gray" />
          <Text size="xs" c="dimmed">
            {formatDateRange(plan.startDate, plan.endDate)}
          </Text>
        </Group>

        {/* Days of week visualization */}
        <Group gap={4} mb="sm">
          {DAY_NAMES.map((dayName, index) => {
            const daySession = plan.weekDays?.find((d) => d.dayOfWeek === index);
            const hasSession = !!daySession;
            const isCompleted = daySession?.completed;

            return (
              <Tooltip
                key={index}
                label={
                  hasSession
                    ? isCompleted
                      ? `${dayName}: Completado`
                      : `${dayName}: Pendiente`
                    : `${dayName}: Sin sesión`
                }
              >
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: !hasSession
                      ? "var(--mantine-color-gray-1)"
                      : isCompleted
                      ? "var(--mantine-color-green-6)"
                      : "var(--mantine-color-blue-1)",
                    border: hasSession && !isCompleted
                      ? "2px solid var(--mantine-color-blue-4)"
                      : "none",
                  }}
                >
                  <Text
                    size="xs"
                    fw={600}
                    c={!hasSession ? "dimmed" : isCompleted ? "white" : "blue"}
                  >
                    {dayName[0]}
                  </Text>
                </Box>
              </Tooltip>
            );
          })}
        </Group>

        {/* Progress */}
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Progreso
            </Text>
            <Text size="xs" fw={500}>
              {getCompletedCount(plan)} / {getDaysCount(plan)} días
            </Text>
          </Group>
          <Progress
            value={progress}
            size="sm"
            color={progress === 100 ? "green" : "blue"}
          />
        </Stack>

        {plan.notes && (
          <Text size="xs" c="dimmed" mt="sm" lineClamp={2}>
            {plan.notes}
          </Text>
        )}

        {/* Form Response Indicator */}
        {plan.formTemplateId && (
          <Group gap="xs" mt="sm" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            {formResponsesMap[plan._id] ? (
              <Tooltip
                label={
                  formResponsesMap[plan._id]?.status === "completed"
                    ? "Formulario completado - click para ver respuestas"
                    : "Formulario pendiente de respuesta"
                }
              >
                <Badge
                  size="sm"
                  variant="light"
                  color={formResponsesMap[plan._id]?.status === "completed" ? "green" : "orange"}
                  leftSection={
                    formResponsesMap[plan._id]?.status === "completed" ? (
                      <IconClipboardCheck size={12} />
                    ) : (
                      <IconClock size={12} />
                    )
                  }
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewFormResponse(plan._id);
                  }}
                >
                  {formResponsesMap[plan._id]?.status === "completed"
                    ? "Ver feedback"
                    : "Feedback pendiente"}
                </Badge>
              </Tooltip>
            ) : (
              <Tooltip label="Este plan tiene un formulario asignado pero aún no se ha generado la respuesta">
                <Badge
                  size="sm"
                  variant="light"
                  color="gray"
                  leftSection={<IconClipboardList size={12} />}
                >
                  Formulario asignado
                </Badge>
              </Tooltip>
            )}
          </Group>
        )}
      </Card>
    );
  };

  const renderPlanSection = (
    title: string,
    plansList: WeeklyPlan[],
    icon: React.ReactNode
  ) => {
    if (plansList.length === 0) return null;

    return (
      <Stack gap="sm">
        <Group gap="xs">
          {icon}
          <Text fw={600} size="sm">
            {title}
          </Text>
          <Badge size="sm" variant="light" color="gray">
            {plansList.length}
          </Badge>
        </Group>
        <Stack gap="sm">
          {plansList.map(renderPlanCard)}
        </Stack>
      </Stack>
    );
  };

  if (loadingClient) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!client) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Text c="dimmed">Cliente no encontrado</Text>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/admin/weekly-plans")}
            >
              Volver a clientes
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate("/admin/weekly-plans")} size="sm">
            Clientes
          </Anchor>
          <Text size="sm">{client.name}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Paper shadow="sm" p="md">
          <Group justify="space-between">
            <Group gap="md">
              <Avatar size="lg" radius="xl" color="blue">
                {getClientInitials(client.name)}
              </Avatar>
              <div>
                <Title order={3}>{client.name}</Title>
                <Text size="sm" c="dimmed">
                  {client.phoneNumber || client.email || "Sin contacto"}
                </Text>
              </div>
            </Group>
            <Group>
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate("/admin/weekly-plans")}
              >
                Volver
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  navigate(`/admin/weekly-plans/new?clientId=${client._id}`)
                }
              >
                Nuevo Plan
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Filter toggle */}
        <Group justify="space-between">
          <Text fw={500}>Planes Semanales</Text>
          <Switch
            label="Mostrar planes pasados"
            checked={showPastPlans}
            onChange={(e) => setShowPastPlans(e.currentTarget.checked)}
            labelPosition="left"
          />
        </Group>

        {/* Plans list */}
        <Paper shadow="sm" p="md" mih={300}>
          {loadingPlans ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : filteredPlans.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                  <IconCalendarEvent size={30} />
                </ThemeIcon>
                <Text c="dimmed" ta="center">
                  {showPastPlans
                    ? "Este cliente no tiene planes semanales"
                    : "No hay planes actuales o futuros"}
                </Text>
                {!showPastPlans && plans.length > 0 && (
                  <Button
                    size="sm"
                    variant="subtle"
                    leftSection={<IconHistory size={14} />}
                    onClick={() => setShowPastPlans(true)}
                  >
                    Ver planes pasados ({plans.filter(isPlanPast).length})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={() =>
                    navigate(`/admin/weekly-plans/new?clientId=${client._id}`)
                  }
                >
                  Crear nuevo plan
                </Button>
              </Stack>
            </Center>
          ) : (
            <ScrollArea>
              <Stack gap="lg">
                {renderPlanSection(
                  "En Curso",
                  groupedPlans.current,
                  <ThemeIcon size="sm" color="blue" variant="light">
                    <IconPlayerPlay size={12} />
                  </ThemeIcon>
                )}
                {renderPlanSection(
                  "Próximos",
                  groupedPlans.upcoming,
                  <ThemeIcon size="sm" color="cyan" variant="light">
                    <IconCalendar size={12} />
                  </ThemeIcon>
                )}
                {showPastPlans &&
                  renderPlanSection(
                    "Pasados",
                    groupedPlans.past,
                    <ThemeIcon size="sm" color="gray" variant="light">
                      <IconHistory size={12} />
                    </ThemeIcon>
                  )}
                {renderPlanSection(
                  "Inactivos",
                  groupedPlans.inactive,
                  <ThemeIcon size="sm" color="gray" variant="light">
                    <IconCalendarEvent size={12} />
                  </ThemeIcon>
                )}
              </Stack>
            </ScrollArea>
          )}
        </Paper>
      </Stack>

      {/* Form Response Viewer Modal */}
      <FormResponseViewer
        opened={formViewerOpen}
        onClose={() => {
          setFormViewerOpen(false);
          setFormResponseId(null);
        }}
        formResponseId={formResponseId}
      />
    </Container>
  );
};

export default ClientWeeklyPlans;
