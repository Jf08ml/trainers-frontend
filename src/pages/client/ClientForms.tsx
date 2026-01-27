import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Button,
  Tabs,
  Skeleton,
  SimpleGrid,
  ThemeIcon,
  Alert,
} from "@mantine/core";
import {
  IconClipboardList,
  IconClipboardCheck,
  IconClock,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { RootState } from "../../app/store";
import {
  getFormResponsesByClientId,
  FormResponse,
} from "../../services/formResponseService";
import { FormTemplate } from "../../services/formTemplateService";
import FormFiller from "../../components/FormFiller";

const ClientForms = () => {
  const { userId } = useSelector((state: RootState) => state.auth);
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [formFillerOpen, setFormFillerOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadResponses();
    }
  }, [userId, organizationId]);

  const loadResponses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getFormResponsesByClientId(userId, organizationId);
      setResponses(data);
    } catch (error) {
      console.error("Error loading form responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingResponses = responses.filter((r) => r.status === "pending");
  const completedResponses = responses.filter((r) => r.status === "completed");

  const handleOpenForm = (responseId: string) => {
    setSelectedResponseId(responseId);
    setFormFillerOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    loadResponses();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderResponseCard = (response: FormResponse, isPending: boolean) => {
    const template = response.formTemplateId as FormTemplate;
    const plan = response.weeklyPlanId as { _id: string; name: string; startDate: string; endDate: string } | null;
    // Formulario inicial = no tiene plan semanal asociado
    const isInitialForm = !plan;

    return (
      <Card key={response._id} withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Group gap="xs" mb={4}>
                <ThemeIcon
                  size="sm"
                  variant="light"
                  color={isPending ? "orange" : "green"}
                >
                  {isPending ? <IconClock size={14} /> : <IconCheck size={14} />}
                </ThemeIcon>
                <Text fw={600} lineClamp={1}>
                  {template?.name || "Formulario"}
                </Text>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {isInitialForm
                  ? "Formulario de ingreso"
                  : (plan?.name || "Plan semanal")}
              </Text>
            </div>
            <Group gap="xs">
              {isInitialForm && (
                <Badge color="blue" variant="light" size="sm">
                  Inicial
                </Badge>
              )}
              <Badge color={isPending ? "orange" : "green"} variant="light">
                {isPending ? "Pendiente" : "Completado"}
              </Badge>
            </Group>
          </Group>

          {plan && (
            <Text size="xs" c="dimmed">
              Plan: {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
            </Text>
          )}

          {isInitialForm && !isPending && response.submittedAt && (
            <Text size="xs" c="dimmed">
              Completado el {formatDate(response.submittedAt)}
            </Text>
          )}

          {template?.description && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {template.description}
            </Text>
          )}

          {isPending ? (
            <Button
              variant="light"
              fullWidth
              leftSection={<IconClipboardList size={16} />}
              onClick={() => handleOpenForm(response._id)}
            >
              Completar formulario
            </Button>
          ) : (
            !isInitialForm && (
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  Enviado el {response.submittedAt ? formatDate(response.submittedAt) : ""}
                </Text>
              </Group>
            )
          )}
        </Stack>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Skeleton height={40} width="50%" />
          <Skeleton height={50} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={180} radius="md" />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Mis Formularios
          </Title>
          <Text c="dimmed">
            Completa los formularios pendientes para que tu entrenador pueda
            conocerte mejor y ajustar tu plan
          </Text>
        </div>

        {pendingResponses.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="orange"
            title="Tienes formularios pendientes"
          >
            Completa tus formularios pendientes para que tu entrenador pueda
            personalizar tu experiencia de entrenamiento.
          </Alert>
        )}

        <Tabs defaultValue="pending">
          <Tabs.List>
            <Tabs.Tab
              value="pending"
              leftSection={<IconClock size={16} />}
              rightSection={
                pendingResponses.length > 0 && (
                  <Badge size="xs" color="orange" variant="filled">
                    {pendingResponses.length}
                  </Badge>
                )
              }
            >
              Pendientes
            </Tabs.Tab>
            <Tabs.Tab
              value="completed"
              leftSection={<IconClipboardCheck size={16} />}
              rightSection={
                completedResponses.length > 0 && (
                  <Badge size="xs" color="green" variant="filled">
                    {completedResponses.length}
                  </Badge>
                )
              }
            >
              Completados
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending" pt="lg">
            {pendingResponses.length === 0 ? (
              <Card withBorder radius="md" p="xl" ta="center">
                <Stack align="center" gap="md">
                  <ThemeIcon size={48} variant="light" color="green">
                    <IconCheck size={24} />
                  </ThemeIcon>
                  <Text c="dimmed">No tienes formularios pendientes</Text>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {pendingResponses.map((r) => renderResponseCard(r, true))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="completed" pt="lg">
            {completedResponses.length === 0 ? (
              <Card withBorder radius="md" p="xl" ta="center">
                <Stack align="center" gap="md">
                  <ThemeIcon size={48} variant="light" color="gray">
                    <IconClipboardList size={24} />
                  </ThemeIcon>
                  <Text c="dimmed">No has completado ningún formulario todavía</Text>
                </Stack>
              </Card>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {completedResponses.map((r) => renderResponseCard(r, false))}
              </SimpleGrid>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {selectedResponseId && (
        <FormFiller
          opened={formFillerOpen}
          onClose={() => {
            setFormFillerOpen(false);
            setSelectedResponseId(null);
          }}
          formResponseId={selectedResponseId}
          onSubmitSuccess={handleFormSubmitSuccess}
        />
      )}
    </Container>
  );
};

export default ClientForms;
