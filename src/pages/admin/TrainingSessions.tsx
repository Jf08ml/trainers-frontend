import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Button,
  Table,
  Group,
  ActionIcon,
  Stack,
  Paper,
  Badge,
  Text,
  Menu,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCopy,
  IconDots,
  IconBarbell,
  IconRun,
} from "@tabler/icons-react";
import {
  getSessionsByOrganizationId,
  deleteSession,
  duplicateSession,
  type PopulatedSession,
} from "../../services/trainingSessionService";

const TrainingSessions: React.FC = () => {
  const navigate = useNavigate();
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  const [sessions, setSessions] = useState<PopulatedSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadSessions();
    }
  }, [organizationId]);

  const loadSessions = async () => {
    if (!organizationId) return;
    setLoading(true);
    const data = await getSessionsByOrganizationId(organizationId);
    setSessions(data);
    setLoading(false);
  };

  const handleDelete = async (sessionId: string) => {
    if (
      confirm(
        "¿Estás seguro de eliminar esta sesión? Esto también eliminará todos los ejercicios asociados."
      )
    ) {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      notifications.show({
        title: "Éxito",
        message: "Sesión eliminada exitosamente",
        color: "green",
      });
    }
  };

  const handleDuplicate = async (sessionId: string) => {
    const duplicated = await duplicateSession(sessionId);
    if (duplicated) {
      setSessions([duplicated, ...sessions]);
      notifications.show({
        title: "Éxito",
        message: "Sesión duplicada exitosamente",
        color: "green",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "strength" ? (
      <IconBarbell size={16} />
    ) : (
      <IconRun size={16} />
    );
  };

  const getTypeColor = (type: string) => {
    return type === "strength" ? "blue" : "green";
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Plantillas de Entrenamiento</Title>
            <Text c="dimmed" size="sm">
              Crea y gestiona plantillas de sesiones reutilizables
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/admin/training-sessions/new")}
          >
            Nueva Sesión
          </Button>
        </Group>

        <Paper shadow="sm" p="md">
          {loading ? (
            <Text ta="center" py="xl">
              Cargando sesiones...
            </Text>
          ) : sessions.length === 0 ? (
            <Stack align="center" py="xl" gap="md">
              <Text c="dimmed" size="lg">
                No hay sesiones creadas
              </Text>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate("/admin/training-sessions/new")}
              >
                Crear primera sesión
              </Button>
            </Stack>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Objetivos</Table.Th>
                  <Table.Th>Ejercicios</Table.Th>
                  <Table.Th style={{ width: 100 }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sessions.map((session) => (
                  <Table.Tr key={session._id}>
                    <Table.Td>
                      <Text fw={500}>{session.name}</Text>
                      {session.notes && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {session.notes}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getTypeColor(session.type)}
                        leftSection={getTypeIcon(session.type)}
                        variant="light"
                      >
                        {session.type === "strength" ? "Fuerza" : "Cardio"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {session.goals && session.goals.length > 0 ? (
                        <Group gap={4}>
                          {session.goals.slice(0, 2).map((goal) => (
                            <Badge key={goal._id} size="sm" variant="dot">
                              {goal.name}
                            </Badge>
                          ))}
                          {session.goals.length > 2 && (
                            <Badge size="sm" variant="dot" color="gray">
                              +{session.goals.length - 2}
                            </Badge>
                          )}
                        </Group>
                      ) : (
                        <Text c="dimmed" size="sm">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {session.exercises?.length || 0}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={() =>
                              navigate(`/admin/training-sessions/edit/${session._id}`)
                            }
                          >
                            Editar
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconCopy size={16} />}
                            onClick={() => handleDuplicate(session._id)}
                          >
                            Duplicar
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => handleDelete(session._id)}
                          >
                            Eliminar
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default TrainingSessions;
