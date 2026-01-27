import React, { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  ThemeIcon,
  Loader,
  Center,
  ScrollArea,
  Box,
  Title,
  Button,
} from "@mantine/core";
import {
  IconClipboardList,
  IconClipboardCheck,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  getFormResponsesByClientId,
  FormResponse,
} from "../../../services/formResponseService";
import { FormTemplate } from "../../../services/formTemplateService";
import FormResponseViewer from "../../../components/FormResponseViewer";

interface ClientFormsHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  clientId: string | null;
  clientName: string;
}

const ClientFormsHistoryModal: React.FC<ClientFormsHistoryModalProps> = ({
  opened,
  onClose,
  clientId,
  clientName,
}) => {
  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );

  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (opened && clientId) {
      loadResponses();
    }
  }, [opened, clientId]);

  const loadResponses = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const data = await getFormResponsesByClientId(clientId, organizationId || undefined);
      // Ordenar por fecha de creación descendente
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );
      setResponses(sorted);
    } catch (error) {
      console.error("Error loading form responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewResponse = (responseId: string) => {
    setSelectedResponseId(responseId);
    setViewerOpen(true);
  };

  const pendingResponses = responses.filter((r) => r.status === "pending");
  const completedResponses = responses.filter((r) => r.status === "completed");

  const renderResponseCard = (response: FormResponse) => {
    const template = response.formTemplateId as FormTemplate;
    const plan = response.weeklyPlanId as {
      _id: string;
      name: string;
      startDate: string;
      endDate: string;
    } | null;
    const isInitialForm = !plan;
    const isPending = response.status === "pending";

    return (
      <Card key={response._id} withBorder radius="md" p="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" mb={4}>
              <ThemeIcon
                size="sm"
                variant="light"
                color={isPending ? "orange" : "green"}
              >
                {isPending ? <IconClock size={14} /> : <IconCheck size={14} />}
              </ThemeIcon>
              <Text fw={600} size="sm" lineClamp={1}>
                {template?.name || "Formulario"}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {isInitialForm
                ? "Formulario de ingreso"
                : plan?.name || "Plan semanal"}
            </Text>
            {!isInitialForm && plan && (
              <Text size="xs" c="dimmed" mt={4}>
                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
              </Text>
            )}
            {response.submittedAt && (
              <Text size="xs" c="dimmed" mt={4}>
                Enviado el {formatDate(response.submittedAt)}
              </Text>
            )}
          </Box>
          <Stack gap="xs" align="flex-end">
            <Group gap="xs">
              {isInitialForm && (
                <Badge color="blue" variant="light" size="xs">
                  Inicial
                </Badge>
              )}
              <Badge
                color={isPending ? "orange" : "green"}
                variant="light"
                size="xs"
              >
                {isPending ? "Pendiente" : "Completado"}
              </Badge>
            </Group>
            {!isPending && (
              <Button
                size="xs"
                variant="light"
                leftSection={<IconClipboardCheck size={14} />}
                onClick={() => handleViewResponse(response._id)}
              >
                Ver respuestas
              </Button>
            )}
          </Stack>
        </Group>
      </Card>
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Box>
            <Title order={4}>Formularios de {clientName}</Title>
            <Text size="sm" c="dimmed">
              Historial de formularios asignados y completados
            </Text>
          </Box>
        }
        size="lg"
        centered
        radius="lg"
        overlayProps={{ blur: 4, opacity: 0.35 }}
      >
        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : responses.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                <IconClipboardList size={30} />
              </ThemeIcon>
              <Text c="dimmed" ta="center">
                Este cliente no tiene formularios asignados
              </Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea.Autosize mah={500}>
            <Stack gap="md">
              {pendingResponses.length > 0 && (
                <Box>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon size="sm" color="orange" variant="light">
                      <IconClock size={12} />
                    </ThemeIcon>
                    <Text fw={600} size="sm">
                      Pendientes
                    </Text>
                    <Badge size="xs" color="orange" variant="filled">
                      {pendingResponses.length}
                    </Badge>
                  </Group>
                  <Stack gap="sm">
                    {pendingResponses.map(renderResponseCard)}
                  </Stack>
                </Box>
              )}

              {completedResponses.length > 0 && (
                <Box>
                  <Group gap="xs" mb="sm">
                    <ThemeIcon size="sm" color="green" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text fw={600} size="sm">
                      Completados
                    </Text>
                    <Badge size="xs" color="green" variant="filled">
                      {completedResponses.length}
                    </Badge>
                  </Group>
                  <Stack gap="sm">
                    {completedResponses.map(renderResponseCard)}
                  </Stack>
                </Box>
              )}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Modal>

      <FormResponseViewer
        opened={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedResponseId(null);
        }}
        formResponseId={selectedResponseId}
      />
    </>
  );
};

export default ClientFormsHistoryModal;
