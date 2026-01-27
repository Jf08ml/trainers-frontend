import { useEffect, useState } from "react";
import { Select, Text, Group, Badge } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";
import {
  getFormTemplatesByOrganizationId,
  FormTemplate,
} from "../services/formTemplateService";

interface FormTemplateSelectorProps {
  organizationId: string | undefined;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const FormTemplateSelector = ({
  organizationId,
  value,
  onChange,
  disabled = false,
}: FormTemplateSelectorProps) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);

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
      console.error("Error loading form templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectData = templates.map((t) => ({
    value: t._id,
    label: t.name,
    description: `${t.questions.length} pregunta${t.questions.length !== 1 ? "s" : ""}`,
  }));

  return (
    <Select
      label={
        <Group gap={6}>
          <IconClipboardList size={16} />
          <Text size="sm" fw={500}>Formulario de feedback</Text>
        </Group>
      }
      description="Al finalizar el plan, el cliente recibirá este formulario para completar"
      placeholder={loading ? "Cargando..." : "Selecciona un formulario (opcional)"}
      data={selectData}
      value={value}
      onChange={onChange}
      clearable
      searchable
      disabled={disabled || loading}
      nothingFoundMessage="No hay formularios disponibles"
      renderOption={({ option }) => {
        const template = templates.find((t) => t._id === option.value);
        return (
          <Group justify="space-between" w="100%">
            <Text size="sm">{option.label}</Text>
            {template && (
              <Badge variant="light" size="xs">
                {template.questions.length} preg.
              </Badge>
            )}
          </Group>
        );
      }}
    />
  );
};

export default FormTemplateSelector;
