import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Text,
  Title,
  TextInput,
  Textarea,
  NumberInput,
  Radio,
  Checkbox,
  Slider,
  Button,
  Group,
  Alert,
  Badge,
  Paper,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconSend, IconCheck } from "@tabler/icons-react";
import {
  FormResponse,
  submitFormResponse,
  getFormResponseById,
} from "../services/formResponseService";
import { FormTemplate, Question } from "../services/formTemplateService";

interface FormFillerProps {
  opened: boolean;
  onClose: () => void;
  formResponseId: string;
  onSubmitSuccess?: () => void;
}

interface AnswerValue {
  questionId: string;
  value: string | number | string[] | boolean;
}

const FormFiller = ({
  opened,
  onClose,
  formResponseId,
  onSubmitSuccess,
}: FormFillerProps) => {
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [answers, setAnswers] = useState<AnswerValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opened && formResponseId) {
      loadFormResponse();
    }
  }, [opened, formResponseId]);

  const loadFormResponse = async () => {
    setLoading(true);
    try {
      const response = await getFormResponseById(formResponseId);
      if (response) {
        setFormResponse(response);
        const tmpl = response.formTemplateId as FormTemplate;
        setTemplate(tmpl);

        // Inicializar respuestas
        const initialAnswers: AnswerValue[] = tmpl.questions.map((q) => ({
          questionId: q._id!,
          value: getDefaultValue(q.questionType),
        }));
        setAnswers(initialAnswers);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo cargar el formulario",
        color: "red",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getDefaultValue = (type: string): string | number | string[] | boolean => {
    switch (type) {
      case "number":
      case "scale":
        return 0;
      case "multiple_choice":
        return [];
      case "yes_no":
        return false;
      default:
        return "";
    }
  };

  const updateAnswer = (questionId: string, value: string | number | string[] | boolean) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, value } : a))
    );
    // Limpiar error si existe
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const getAnswer = (questionId: string): string | number | string[] | boolean => {
    const answer = answers.find((a) => a.questionId === questionId);
    return answer?.value ?? "";
  };

  const validateAnswers = (): boolean => {
    if (!template) return false;

    const newErrors: Record<string, string> = {};

    template.questions.forEach((q) => {
      if (q.required) {
        const answer = getAnswer(q._id!);
        const isEmpty =
          answer === "" ||
          answer === 0 ||
          (Array.isArray(answer) && answer.length === 0);

        if (isEmpty && q.questionType !== "scale") {
          newErrors[q._id!] = "Esta pregunta es obligatoria";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      notifications.show({
        title: "Error",
        message: "Por favor completa todas las preguntas obligatorias",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      await submitFormResponse(formResponseId, { answers });

      // Determinar si es formulario inicial para mensaje apropiado
      const isInitial = !formResponse?.weeklyPlanId;
      notifications.show({
        title: "Formulario enviado",
        message: isInitial ? "Gracias por completar el formulario" : "Gracias por tu feedback",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      onSubmitSuccess?.();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "No se pudo enviar el formulario",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const questionId = question._id!;
    const value = getAnswer(questionId);
    const error = errors[questionId];
    const isRequired = question.required;

    const labelWithNumber = `${index + 1}. ${question.questionText}`;

    switch (question.questionType) {
      case "text":
        return (
          <TextInput
            key={questionId}
            label={labelWithNumber}
            placeholder="Tu respuesta..."
            required={isRequired}
            value={value as string}
            onChange={(e) => updateAnswer(questionId, e.currentTarget.value)}
            error={error}
          />
        );

      case "textarea":
        return (
          <Textarea
            key={questionId}
            label={labelWithNumber}
            placeholder="Tu respuesta..."
            required={isRequired}
            rows={3}
            value={value as string}
            onChange={(e) => updateAnswer(questionId, e.currentTarget.value)}
            error={error}
          />
        );

      case "number":
        return (
          <NumberInput
            key={questionId}
            label={labelWithNumber}
            placeholder="0"
            required={isRequired}
            value={value as number}
            onChange={(val) => updateAnswer(questionId, val || 0)}
            error={error}
          />
        );

      case "single_choice":
        return (
          <Radio.Group
            key={questionId}
            label={labelWithNumber}
            required={isRequired}
            value={value as string}
            onChange={(val) => updateAnswer(questionId, val)}
            error={error}
          >
            <Stack gap="xs" mt="xs">
              {question.options?.map((option, idx) => (
                <Radio key={idx} value={option} label={option} />
              ))}
            </Stack>
          </Radio.Group>
        );

      case "multiple_choice":
        return (
          <Checkbox.Group
            key={questionId}
            label={labelWithNumber}
            required={isRequired}
            value={value as string[]}
            onChange={(val) => updateAnswer(questionId, val)}
            error={error}
          >
            <Stack gap="xs" mt="xs">
              {question.options?.map((option, idx) => (
                <Checkbox key={idx} value={option} label={option} />
              ))}
            </Stack>
          </Checkbox.Group>
        );

      case "scale":
        const min = question.scaleMin || 1;
        const max = question.scaleMax || 10;
        return (
          <Paper key={questionId} p="md" withBorder radius="md">
            <Text fw={500} mb="xs">
              {labelWithNumber} {isRequired && <span style={{ color: "red" }}>*</span>}
            </Text>
            <Stack gap="xs">
              <Slider
                value={value as number}
                onChange={(val) => updateAnswer(questionId, val)}
                min={min}
                max={max}
                step={1}
                marks={[
                  { value: min, label: String(min) },
                  { value: max, label: String(max) },
                ]}
                styles={{ markLabel: { fontSize: 12 } }}
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {question.scaleMinLabel || `${min}`}
                </Text>
                <Badge variant="light" size="lg">
                  {value || min}
                </Badge>
                <Text size="xs" c="dimmed">
                  {question.scaleMaxLabel || `${max}`}
                </Text>
              </Group>
            </Stack>
            {error && (
              <Text size="xs" c="red" mt="xs">
                {error}
              </Text>
            )}
          </Paper>
        );

      case "yes_no":
        return (
          <Radio.Group
            key={questionId}
            label={labelWithNumber}
            required={isRequired}
            value={value === true ? "yes" : value === false ? "no" : ""}
            onChange={(val) => updateAnswer(questionId, val === "yes")}
            error={error}
          >
            <Group mt="xs">
              <Radio value="yes" label="Sí" />
              <Radio value="no" label="No" />
            </Group>
          </Radio.Group>
        );

      default:
        return null;
    }
  };

  // Determinar si es un formulario inicial (sin plan) o de feedback (con plan)
  const weeklyPlan = formResponse?.weeklyPlanId;
  const isInitialForm = !weeklyPlan;
  const planName =
    weeklyPlan && typeof weeklyPlan === "object"
      ? weeklyPlan.name
      : isInitialForm
      ? "Formulario de ingreso"
      : "Plan semanal";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Title order={4}>{template?.name || "Formulario"}</Title>
          <Text size="sm" c="dimmed">
            {planName}
          </Text>
        </div>
      }
      size="lg"
      centered
    >
      {loading ? (
        <Text>Cargando formulario...</Text>
      ) : template ? (
        <Stack gap="lg">
          {template.description && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              {template.description}
            </Alert>
          )}

          <Divider label="Preguntas" labelPosition="center" />

          <Stack gap="md">
            {template.questions
              .sort((a, b) => a.order - b.order)
              .map((q, idx) => renderQuestion(q, idx))}
          </Stack>

          <Divider />

          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              leftSection={<IconSend size={18} />}
              onClick={handleSubmit}
              loading={submitting}
            >
              {isInitialForm ? "Enviar formulario" : "Enviar feedback"}
            </Button>
          </Group>
        </Stack>
      ) : (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          No se pudo cargar el formulario
        </Alert>
      )}
    </Modal>
  );
};

export default FormFiller;
