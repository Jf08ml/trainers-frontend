import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  SimpleGrid,
  TextInput,
  Skeleton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconDots,
  IconClipboardList,
} from "@tabler/icons-react";
import { RootState } from "../../app/store";
import {
  getFormTemplatesByOrganizationId,
  deleteFormTemplate,
  FormTemplate,
} from "../../services/formTemplateService";
import { useDebouncedValue } from "@mantine/hooks";

const FormTemplates = () => {
  const navigate = useNavigate();
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced] = useDebouncedValue(searchTerm, 250);

  useEffect(() => {
    if (organizationId) {
      loadTemplates();
    }
  }, [organizationId]);

  const loadTemplates = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await getFormTemplatesByOrganizationId(organizationId);
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar el formulario "${name}"?`)) return;

    try {
      await deleteFormTemplate(id);
      notifications.show({
        title: "Formulario eliminado",
        message: "El formulario fue eliminado correctamente",
        color: "green",
      });
      loadTemplates();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo eliminar el formulario",
        color: "red",
      });
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const q = debounced.toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Texto corto",
      textarea: "Texto largo",
      number: "Número",
      single_choice: "Selección única",
      multiple_choice: "Selección múltiple",
      scale: "Escala",
      yes_no: "Sí/No",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Skeleton height={40} width="50%" />
          <Skeleton height={50} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={200} radius="md" />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Formularios de Feedback
            </Title>
            <Text c="dimmed">
              Crea y gestiona formularios para recopilar feedback de tus clientes
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate("/admin/form-templates/nuevo")}
          >
            Nuevo Formulario
          </Button>
        </Group>

        <TextInput
          leftSection={<IconSearch size={18} />}
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          style={{ maxWidth: 400 }}
        />

        {filteredTemplates.length === 0 ? (
          <Card withBorder radius="md" p="xl" ta="center">
            <Stack align="center" gap="md">
              <IconClipboardList size={48} color="gray" />
              <Text c="dimmed" size="lg">
                {templates.length === 0
                  ? "No tienes formularios creados todavía"
                  : "No se encontraron formularios con ese filtro"}
              </Text>
              {templates.length === 0 && (
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate("/admin/form-templates/nuevo")}
                >
                  Crear primer formulario
                </Button>
              )}
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {filteredTemplates.map((template) => (
              <Card key={template._id} withBorder radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} lineClamp={1}>
                        {template.name}
                      </Text>
                      {template.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {template.description}
                        </Text>
                      )}
                    </div>
                    <Menu shadow="sm" width={180} withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={16} />}
                          onClick={() =>
                            navigate(`/admin/form-templates/${template._id}/editar`)
                          }
                        >
                          Editar
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handleDelete(template._id, template.name)}
                        >
                          Eliminar
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <div>
                    <Text size="sm" c="dimmed" mb={4}>
                      {template.questions.length} pregunta
                      {template.questions.length !== 1 ? "s" : ""}
                    </Text>
                    <Group gap="xs">
                      {template.questions.slice(0, 3).map((q, idx) => (
                        <Badge key={idx} variant="light" size="sm">
                          {getQuestionTypeLabel(q.questionType)}
                        </Badge>
                      ))}
                      {template.questions.length > 3 && (
                        <Badge variant="outline" size="sm" color="gray">
                          +{template.questions.length - 3}
                        </Badge>
                      )}
                    </Group>
                  </div>

                  <Button
                    variant="light"
                    fullWidth
                    onClick={() =>
                      navigate(`/admin/form-templates/${template._id}/editar`)
                    }
                  >
                    Ver detalles
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};

export default FormTemplates;
