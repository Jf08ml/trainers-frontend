import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Tabs,
  Button,
  Table,
  Modal,
  TextInput,
  Group,
  ActionIcon,
  Stack,
  Paper,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBarbell,
  IconTarget,
} from "@tabler/icons-react";
import {
  getMuscleGroupsByOrganizationId,
  createMuscleGroup,
  updateMuscleGroup,
  deleteMuscleGroup,
  getEquipmentByOrganizationId,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getSessionGoalsByOrganizationId,
  createSessionGoal,
  updateSessionGoal,
  deleteSessionGoal,
  type MuscleGroup,
  type Equipment,
  type SessionGoal,
} from "../../services/trainingCatalogService";
import { GiMuscleUp } from "react-icons/gi";

const TrainingCatalogs: React.FC = () => {
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  // State for data
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [sessionGoals, setSessionGoals] = useState<SessionGoal[]>([]);

  // State for modals
  const [muscleGroupModal, setMuscleGroupModal] = useState(false);
  const [equipmentModal, setEquipmentModal] = useState(false);
  const [sessionGoalModal, setSessionGoalModal] = useState(false);

  // State for editing
  const [editingMuscleGroup, setEditingMuscleGroup] =
    useState<MuscleGroup | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [editingSessionGoal, setEditingSessionGoal] =
    useState<SessionGoal | null>(null);

  // Forms
  const muscleGroupForm = useForm({
    initialValues: { name: "" },
    validate: {
      name: (value) => (value.trim() ? null : "El nombre es obligatorio"),
    },
  });

  const equipmentForm = useForm({
    initialValues: { name: "" },
    validate: {
      name: (value) => (value.trim() ? null : "El nombre es obligatorio"),
    },
  });

  const sessionGoalForm = useForm({
    initialValues: { name: "" },
    validate: {
      name: (value) => (value.trim() ? null : "El nombre es obligatorio"),
    },
  });

  // Load data
  useEffect(() => {
    if (organizationId) {
      loadAllData();
    }
  }, [organizationId]);

  const loadAllData = async () => {
    if (!organizationId) return;
    const [mg, eq, sg] = await Promise.all([
      getMuscleGroupsByOrganizationId(organizationId),
      getEquipmentByOrganizationId(organizationId),
      getSessionGoalsByOrganizationId(organizationId),
    ]);
    setMuscleGroups(mg);
    setEquipment(eq);
    setSessionGoals(sg);
  };

  // ========== MUSCLE GROUPS ==========
  const handleCreateMuscleGroup = async (values: { name: string }) => {
    if (!organizationId) return;
    const result = await createMuscleGroup(organizationId, values.name);
    if (result) {
      setMuscleGroups([...muscleGroups, result]);
      setMuscleGroupModal(false);
      muscleGroupForm.reset();
      notifications.show({
        title: "Éxito",
        message: "Grupo muscular creado exitosamente",
        color: "green",
      });
    }
  };

  const handleUpdateMuscleGroup = async (values: { name: string }) => {
    if (!editingMuscleGroup) return;
    const result = await updateMuscleGroup(editingMuscleGroup._id, values.name);
    if (result) {
      setMuscleGroups(
        muscleGroups.map((mg) => (mg._id === result._id ? result : mg))
      );
      setMuscleGroupModal(false);
      setEditingMuscleGroup(null);
      muscleGroupForm.reset();
      notifications.show({
        title: "Éxito",
        message: "Grupo muscular actualizado exitosamente",
        color: "green",
      });
    }
  };

  const handleDeleteMuscleGroup = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este grupo muscular?")) {
      await deleteMuscleGroup(id);
      setMuscleGroups(muscleGroups.filter((mg) => mg._id !== id));
      notifications.show({
        title: "Éxito",
        message: "Grupo muscular eliminado exitosamente",
        color: "green",
      });
    }
  };

  // ========== EQUIPMENT ==========
  const handleCreateEquipment = async (values: { name: string }) => {
    if (!organizationId) return;
    const result = await createEquipment(organizationId, values.name);
    if (result) {
      setEquipment([...equipment, result]);
      setEquipmentModal(false);
      equipmentForm.reset();
      notifications.show({
        title: "Éxito",
        message: "Equipamiento creado exitosamente",
        color: "green",
      });
    }
  };

  const handleUpdateEquipment = async (values: { name: string }) => {
    if (!editingEquipment) return;
    const result = await updateEquipment(editingEquipment._id, values.name);
    if (result) {
      setEquipment(equipment.map((eq) => (eq._id === result._id ? result : eq)));
      setEquipmentModal(false);
      setEditingEquipment(null);
      equipmentForm.reset();
      notifications.show({
        title: "Éxito",
        message: "Equipamiento actualizado exitosamente",
        color: "green",
      });
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este equipamiento?")) {
      await deleteEquipment(id);
      setEquipment(equipment.filter((eq) => eq._id !== id));
      notifications.show({
        title: "Éxito",
        message: "Equipamiento eliminado exitosamente",
        color: "green",
      });
    }
  };

  // ========== SESSION GOALS ==========
  const handleCreateSessionGoal = async (values: { name: string }) => {
    if (!organizationId) return;
    const result = await createSessionGoal(organizationId, values.name);
    if (result) {
      setSessionGoals([...sessionGoals, result]);
      setSessionGoalModal(false);
      sessionGoalForm.reset();
      notifications.show({
        title: "Éxito",
        message: "Objetivo creado exitosamente",
        color: "green",
      });
    }
  };

  const handleUpdateSessionGoal = async (values: { name: string }) => {
    if (!editingSessionGoal) return;
    const result = await updateSessionGoal(editingSessionGoal._id, values.name);
    if (result) {
      setSessionGoals(
        sessionGoals.map((sg) => (sg._id === result._id ? result : sg))
      );
      setSessionGoalModal(false);
      setEditingSessionGoal(null);
      sessionGoalForm.reset();
      notifications.show({
        title: "Éxito",
        message: "Objetivo actualizado exitosamente",
        color: "green",
      });
    }
  };

  const handleDeleteSessionGoal = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este objetivo?")) {
      await deleteSessionGoal(id);
      setSessionGoals(sessionGoals.filter((sg) => sg._id !== id));
      notifications.show({
        title: "Éxito",
        message: "Objetivo eliminado exitosamente",
        color: "green",
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2}>Catálogos de Entrenamiento</Title>
        <Text c="dimmed">
          Configura los catálogos que se usarán para clasificar ejercicios y
          sesiones de entrenamiento
        </Text>

        <Tabs defaultValue="muscle-groups">
          <Tabs.List>
            <Tabs.Tab value="muscle-groups" leftSection={<GiMuscleUp size={16} />}>
              Grupos Musculares
            </Tabs.Tab>
            <Tabs.Tab value="equipment" leftSection={<IconBarbell size={16} />}>
              Equipamiento
            </Tabs.Tab>
            <Tabs.Tab value="session-goals" leftSection={<IconTarget size={16} />}>
              Objetivos de Sesión
            </Tabs.Tab>
          </Tabs.List>

          {/* MUSCLE GROUPS TAB */}
          <Tabs.Panel value="muscle-groups" pt="lg">
            <Paper p="md">
              <Group justify="space-between" mb="md">
                <Title order={4}>Grupos Musculares</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setEditingMuscleGroup(null);
                    muscleGroupForm.reset();
                    setMuscleGroupModal(true);
                  }}
                >
                  Agregar
                </Button>
              </Group>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th style={{ width: 100 }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {muscleGroups.map((mg) => (
                    <Table.Tr key={mg._id}>
                      <Table.Td>{mg.name}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => {
                              setEditingMuscleGroup(mg);
                              muscleGroupForm.setValues({ name: mg.name });
                              setMuscleGroupModal(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteMuscleGroup(mg._id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          {/* EQUIPMENT TAB */}
          <Tabs.Panel value="equipment" pt="lg">
            <Paper p="md">
              <Group justify="space-between" mb="md">
                <Title order={4}>Equipamiento</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setEditingEquipment(null);
                    equipmentForm.reset();
                    setEquipmentModal(true);
                  }}
                >
                  Agregar
                </Button>
              </Group>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th style={{ width: 100 }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {equipment.map((eq) => (
                    <Table.Tr key={eq._id}>
                      <Table.Td>{eq.name}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => {
                              setEditingEquipment(eq);
                              equipmentForm.setValues({ name: eq.name });
                              setEquipmentModal(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteEquipment(eq._id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          {/* SESSION GOALS TAB */}
          <Tabs.Panel value="session-goals" pt="lg">
            <Paper p="md">
              <Group justify="space-between" mb="md">
                <Title order={4}>Objetivos de Sesión</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setEditingSessionGoal(null);
                    sessionGoalForm.reset();
                    setSessionGoalModal(true);
                  }}
                >
                  Agregar
                </Button>
              </Group>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th style={{ width: 100 }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sessionGoals.map((sg) => (
                    <Table.Tr key={sg._id}>
                      <Table.Td>{sg.name}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => {
                              setEditingSessionGoal(sg);
                              sessionGoalForm.setValues({ name: sg.name });
                              setSessionGoalModal(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteSessionGoal(sg._id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* MUSCLE GROUP MODAL */}
      <Modal
        opened={muscleGroupModal}
        onClose={() => {
          setMuscleGroupModal(false);
          setEditingMuscleGroup(null);
          muscleGroupForm.reset();
        }}
        title={editingMuscleGroup ? "Editar Grupo Muscular" : "Nuevo Grupo Muscular"}
      >
        <form
          onSubmit={muscleGroupForm.onSubmit(
            editingMuscleGroup ? handleUpdateMuscleGroup : handleCreateMuscleGroup
          )}
        >
          <Stack>
            <TextInput
              label="Nombre"
              placeholder="Ej: Pectorales, Cuádriceps, etc."
              {...muscleGroupForm.getInputProps("name")}
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setMuscleGroupModal(false);
                  setEditingMuscleGroup(null);
                  muscleGroupForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingMuscleGroup ? "Actualizar" : "Crear"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* EQUIPMENT MODAL */}
      <Modal
        opened={equipmentModal}
        onClose={() => {
          setEquipmentModal(false);
          setEditingEquipment(null);
          equipmentForm.reset();
        }}
        title={editingEquipment ? "Editar Equipamiento" : "Nuevo Equipamiento"}
      >
        <form
          onSubmit={equipmentForm.onSubmit(
            editingEquipment ? handleUpdateEquipment : handleCreateEquipment
          )}
        >
          <Stack>
            <TextInput
              label="Nombre"
              placeholder="Ej: Barra, Mancuernas, Máquina Smith, etc."
              {...equipmentForm.getInputProps("name")}
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setEquipmentModal(false);
                  setEditingEquipment(null);
                  equipmentForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingEquipment ? "Actualizar" : "Crear"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* SESSION GOAL MODAL */}
      <Modal
        opened={sessionGoalModal}
        onClose={() => {
          setSessionGoalModal(false);
          setEditingSessionGoal(null);
          sessionGoalForm.reset();
        }}
        title={editingSessionGoal ? "Editar Objetivo" : "Nuevo Objetivo"}
      >
        <form
          onSubmit={sessionGoalForm.onSubmit(
            editingSessionGoal
              ? handleUpdateSessionGoal
              : handleCreateSessionGoal
          )}
        >
          <Stack>
            <TextInput
              label="Nombre"
              placeholder="Ej: Hipertrofia, Resistencia, Potencia, etc."
              {...sessionGoalForm.getInputProps("name")}
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => {
                  setSessionGoalModal(false);
                  setEditingSessionGoal(null);
                  sessionGoalForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingSessionGoal ? "Actualizar" : "Crear"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default TrainingCatalogs;
