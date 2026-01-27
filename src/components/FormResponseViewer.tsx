/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
  ThemeIcon,
  Divider,
  Loader,
  Center,
  Progress,
} from "@mantine/core";
import {
  IconClipboardCheck,
  IconClock,
  IconCheck,
  IconX,
  IconCalendar,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  getFormResponseById,
  FormResponse,
} from "../services/formResponseService";

interface FormResponseViewerProps {
  opened: boolean;
  onClose: () => void;
  formResponseId: string | null;
}

interface Answer {
  questionId: string;
  questionText: string;
  questionType: string;
  value: any;
}

const FormResponseViewer = ({
  opened,
  onClose,
  formResponseId,
}: FormResponseViewerProps) => {
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && formResponseId) {
      loadResponse();
    }
  }, [opened, formResponseId]);

  const loadResponse = async () => {
    if (!formResponseId) return;
    setLoading(true);
    try {
      const data = await getFormResponseById(formResponseId);
      setResponse(data ?? null);
    } catch (error) {
      console.error("Error loading form response:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAnswerValue = (answer: Answer) => {
    const { questionType, value } = answer;

    switch (questionType) {
      case "yes_no":
        return (
          <Group gap="xs">
            <ThemeIcon
              size="sm"
              color={value ? "green" : "red"}
              variant="light"
            >
              {value ? <IconCheck size={14} /> : <IconX size={14} />}
            </ThemeIcon>
            <Text fw={500}>{value ? "Sí" : "No"}</Text>
          </Group>
        );

      case "scale":
        { const scaleValue = Number(value) || 0;
        return (
          <Stack gap="xs">
            <Group gap="xs">
              <Text fw={600} size="xl" c="blue">
                {scaleValue}
              </Text>
              <Text c="dimmed" size="sm">
                / 10
              </Text>
            </Group>
            <Progress
              value={scaleValue * 10}
              size="sm"
              color={scaleValue >= 7 ? "green" : scaleValue >= 4 ? "yellow" : "red"}
              style={{ width: 150 }}
            />
          </Stack>
        ); }

      case "number":
        return (
          <Text fw={600} size="lg" c="blue">
            {value}
          </Text>
        );

      case "single_choice":
        return (
          <Badge size="lg" variant="light" color="blue">
            {value}
          </Badge>
        );

      case "multiple_choice":
        if (Array.isArray(value) && value.length > 0) {
          return (
            <Group gap="xs">
              {value.map((v: string, idx: number) => (
                <Badge key={idx} variant="light" color="blue">
                  {v}
                </Badge>
              ))}
            </Group>
          );
        }
        return <Text c="dimmed">Sin selección</Text>;

      case "text":
      case "textarea":
      default:
        return (
          <Paper p="sm" bg="gray.0" radius="sm">
            <Text style={{ whiteSpace: "pre-wrap" }}>{value || "Sin respuesta"}</Text>
          </Paper>
        );
    }
  };

  const template = response?.formTemplateId as any;
  const plan = response?.weeklyPlanId as any;
  const isPending = response?.status === "pending";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon
            size="md"
            variant="light"
            color={isPending ? "orange" : "green"}
          >
            {isPending ? <IconClock size={16} /> : <IconClipboardCheck size={16} />}
          </ThemeIcon>
          <div>
            <Text fw={600}>{template?.name || "Formulario de Feedback"}</Text>
            <Badge size="xs" color={isPending ? "orange" : "green"} variant="light">
              {isPending ? "Pendiente" : "Completado"}
            </Badge>
          </div>
        </Group>
      }
      size="lg"
    >
      {loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : !response ? (
        <Center py="xl">
          <Text c="dimmed">No se pudo cargar la respuesta</Text>
        </Center>
      ) : (
        <Stack gap="md">
          {/* Plan info */}
          {plan && (
            <Paper p="sm" bg="blue.0" radius="sm">
              <Group gap="xs">
                <IconCalendar size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  Plan:
                </Text>
                <Text size="sm" fw={500}>
                  {plan.name}
                </Text>
              </Group>
            </Paper>
          )}

          {/* Submission date */}
          {response.submittedAt && (
            <Text size="sm" c="dimmed">
              Enviado el {formatDate(response.submittedAt)}
            </Text>
          )}

          {isPending ? (
            <Paper p="lg" bg="orange.0" radius="md" ta="center">
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} color="orange" variant="light">
                  <IconClock size={24} />
                </ThemeIcon>
                <Text fw={500}>Formulario pendiente</Text>
                <Text size="sm" c="dimmed">
                  El cliente aún no ha completado este formulario
                </Text>
              </Stack>
            </Paper>
          ) : (
            <>
              <Divider label="Respuestas" labelPosition="left" />

              {/* Answers */}
              <Stack gap="lg">
                {response.answers?.map((answer: Answer, index: number) => (
                  <Paper key={answer.questionId || index} p="md" withBorder radius="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <Badge size="xs" variant="light" color="gray">
                          {index + 1}
                        </Badge>
                        <Text fw={500} size="sm">
                          {answer.questionText}
                        </Text>
                      </Group>
                      {renderAnswerValue(answer)}
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {(!response.answers || response.answers.length === 0) && (
                <Text c="dimmed" ta="center" py="md">
                  No hay respuestas registradas
                </Text>
              )}
            </>
          )}
        </Stack>
      )}
    </Modal>
  );
};

export default FormResponseViewer;
