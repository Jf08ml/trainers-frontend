import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Stack,
  TextInput,
  Textarea,
  Select,
  Switch,
  ActionIcon,
  Paper,
  NumberInput,
  Divider,
  Badge,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
  IconAlertCircle,
  IconDeviceFloppy,
  IconArrowLeft,
} from "@tabler/icons-react";
import { RootState } from "../../app/store";
import {
  createFormTemplate,
  updateFormTemplate,
  getFormTemplateById,
  QuestionType,
  Question,
} from "../../services/formTemplateService";

interface QuestionForm {
  id: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  options: string[];
  scaleMin: number;
  scaleMax: number;
  scaleMinLabel: string;
  scaleMaxLabel: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "single_choice", label: "Selección única" },
  { value: "multiple_choice", label: "Selección múltiple" },
  { value: "scale", label: "Escala (1-10)" },
  { value: "yes_no", label: "Sí / No" },
];

const createEmptyQuestion = (): QuestionForm => ({
  id: Math.random().toString(36).substr(2, 9),
  questionText: "",
  questionType: "text",
  required: true,
  options: ["", ""],
  scaleMin: 1,
  scaleMax: 10,
  scaleMinLabel: "",
  scaleMaxLabel: "",
});

const FormBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );
  const userId = useSelector((state: RootState) => state.auth.userId);

  const [questions, setQuestions] = useState<QuestionForm[]>([createEmptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const templateForm = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value) => (!value.trim() ? "El nombre es obligatorio" : null),
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadTemplate();
    }
  }, [id, isEditing]);

  const loadTemplate = async () => {
    if (!id) return;
    setLoadingTemplate(true);
    try {
      const template = await getFormTemplateById(id);
      if (template) {
        templateForm.setValues({
          name: template.name,
          description: template.description || "",
        });
        setQuestions(
          template.questions.map((q: Question) => ({
            id: q._id || Math.random().toString(36).substr(2, 9),
            questionText: q.questionText,
            questionType: q.questionType,
            required: q.required,
            options: q.options || ["", ""],
            scaleMin: q.scaleMin || 1,
            scaleMax: q.scaleMax || 10,
            scaleMinLabel: q.scaleMinLabel || "",
            scaleMaxLabel: q.scaleMaxLabel || "",
          }))
        );
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo cargar el formulario",
        color: "red",
      });
      navigate("/admin/form-templates");
    } finally {
      setLoadingTemplate(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      notifications.show({
        title: "Error",
        message: "El formulario debe tener al menos una pregunta",
        color: "red",
      });
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length <= 2) {
      notifications.show({
        title: "Error",
        message: "Debe haber al menos 2 opciones",
        color: "red",
      });
      return;
    }
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const validateQuestions = (): boolean => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        notifications.show({
          title: "Error",
          message: `La pregunta ${i + 1} no tiene texto`,
          color: "red",
        });
        return false;
      }
      if (
        ["single_choice", "multiple_choice"].includes(q.questionType) &&
        q.options.filter((o) => o.trim()).length < 2
      ) {
        notifications.show({
          title: "Error",
          message: `La pregunta ${i + 1} debe tener al menos 2 opciones válidas`,
          color: "red",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const validation = templateForm.validate();
    if (validation.hasErrors) return;
    if (!validateQuestions()) return;
    if (!organizationId) return;

    setLoading(true);

    try {
      const questionsPayload = questions.map((q, index) => ({
        order: index,
        questionText: q.questionText.trim(),
        questionType: q.questionType,
        required: q.required,
        options: ["single_choice", "multiple_choice"].includes(q.questionType)
          ? q.options.filter((o) => o.trim())
          : undefined,
        scaleMin: q.questionType === "scale" ? q.scaleMin : undefined,
        scaleMax: q.questionType === "scale" ? q.scaleMax : undefined,
        scaleMinLabel: q.questionType === "scale" ? q.scaleMinLabel : undefined,
        scaleMaxLabel: q.questionType === "scale" ? q.scaleMaxLabel : undefined,
      }));

      if (isEditing && id) {
        await updateFormTemplate(id, {
          name: templateForm.values.name.trim(),
          description: templateForm.values.description.trim(),
          questions: questionsPayload,
        });
        notifications.show({
          title: "Formulario actualizado",
          message: "Los cambios se guardaron correctamente",
          color: "green",
        });
      } else {
        await createFormTemplate(organizationId, {
          name: templateForm.values.name.trim(),
          description: templateForm.values.description.trim(),
          questions: questionsPayload,
          createdBy: userId || undefined,
          createdByModel: "Organization",
        });
        notifications.show({
          title: "Formulario creado",
          message: "El formulario fue creado correctamente",
          color: "green",
        });
      }

      navigate("/admin/form-templates");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "No se pudo guardar el formulario",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const needsOptions = (type: QuestionType) =>
    ["single_choice", "multiple_choice"].includes(type);
  const needsScale = (type: QuestionType) => type === "scale";

  if (loadingTemplate) {
    return (
      <Container size="md" py="xl">
        <Text>Cargando formulario...</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => navigate("/admin/form-templates")}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <div>
            <Title order={2}>
              {isEditing ? "Editar Formulario" : "Nuevo Formulario"}
            </Title>
            <Text c="dimmed" size="sm">
              {isEditing
                ? "Modifica las preguntas de tu formulario"
                : "Crea un formulario de feedback para tus clientes"}
            </Text>
          </div>
        </Group>

        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <TextInput
              label="Nombre del formulario"
              placeholder="Ej: Feedback Semanal"
              required
              {...templateForm.getInputProps("name")}
            />
            <Textarea
              label="Descripción (opcional)"
              placeholder="Describe el propósito del formulario..."
              rows={2}
              {...templateForm.getInputProps("description")}
            />
          </Stack>
        </Paper>

        <Divider label="Preguntas" labelPosition="center" />

        <Stack gap="md">
          {questions.map((question, index) => (
            <Card key={question.id} withBorder radius="md" p="md">
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <Badge variant="light" size="lg">
                    Pregunta {index + 1}
                  </Badge>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      disabled={index === 0}
                      onClick={() => moveQuestion(index, "up")}
                    >
                      <IconChevronUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      disabled={index === questions.length - 1}
                      onClick={() => moveQuestion(index, "down")}
                    >
                      <IconChevronDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => removeQuestion(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <TextInput
                  label="Texto de la pregunta"
                  placeholder="Escribe tu pregunta..."
                  required
                  value={question.questionText}
                  onChange={(e) =>
                    updateQuestion(index, "questionText", e.currentTarget.value)
                  }
                />

                <Group grow>
                  <Select
                    label="Tipo de respuesta"
                    data={QUESTION_TYPES}
                    value={question.questionType}
                    onChange={(value) =>
                      updateQuestion(index, "questionType", value as QuestionType)
                    }
                  />
                  <Switch
                    label="Obligatoria"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(index, "required", e.currentTarget.checked)
                    }
                    mt={24}
                  />
                </Group>

                {needsOptions(question.questionType) && (
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Opciones
                    </Text>
                    {question.options.map((option, optIdx) => (
                      <Group key={optIdx} gap="xs">
                        <TextInput
                          placeholder={`Opción ${optIdx + 1}`}
                          value={option}
                          onChange={(e) =>
                            updateOption(index, optIdx, e.currentTarget.value)
                          }
                          style={{ flex: 1 }}
                        />
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => removeOption(index, optIdx)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => addOption(index)}
                      w="fit-content"
                    >
                      Agregar opción
                    </Button>
                  </Stack>
                )}

                {needsScale(question.questionType) && (
                  <Stack gap="xs">
                    <Group grow>
                      <NumberInput
                        label="Valor mínimo"
                        value={question.scaleMin}
                        onChange={(val) =>
                          updateQuestion(index, "scaleMin", val || 1)
                        }
                        min={0}
                        max={question.scaleMax - 1}
                      />
                      <NumberInput
                        label="Valor máximo"
                        value={question.scaleMax}
                        onChange={(val) =>
                          updateQuestion(index, "scaleMax", val || 10)
                        }
                        min={question.scaleMin + 1}
                        max={100}
                      />
                    </Group>
                    <Group grow>
                      <TextInput
                        label="Etiqueta mínimo"
                        placeholder="Ej: Muy mal"
                        value={question.scaleMinLabel}
                        onChange={(e) =>
                          updateQuestion(index, "scaleMinLabel", e.currentTarget.value)
                        }
                      />
                      <TextInput
                        label="Etiqueta máximo"
                        placeholder="Ej: Excelente"
                        value={question.scaleMaxLabel}
                        onChange={(e) =>
                          updateQuestion(index, "scaleMaxLabel", e.currentTarget.value)
                        }
                      />
                    </Group>
                  </Stack>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>

        <Button
          variant="outline"
          leftSection={<IconPlus size={18} />}
          onClick={addQuestion}
        >
          Agregar pregunta
        </Button>

        {questions.length === 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow">
            El formulario debe tener al menos una pregunta
          </Alert>
        )}

        <Divider />

        <Group justify="space-between">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => navigate("/admin/form-templates")}
          >
            Cancelar
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={18} />}
            onClick={handleSubmit}
            loading={loading}
            disabled={questions.length === 0}
          >
            {isEditing ? "Guardar cambios" : "Crear formulario"}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default FormBuilder;
