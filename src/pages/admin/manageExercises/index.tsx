import {
  Box,
  Card,
  Flex,
  TextInput,
  Group,
  Title,
  Button,
  Badge,
  Skeleton,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import ExerciseFormModal from "./ExerciseFormModal";
import ExerciseTable from "./ExerciseTable";
import { IoAddCircleOutline } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import {
  deleteExercise,
  Exercise,
  getExercisesByOrganizationId,
} from "../../../services/exerciseService";
import { showNotification } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";

const ManageExercises = () => {
  // State Management
  const [openModal, setOpenModal] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced] = useDebouncedValue(searchTerm, 250);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);

  // Redux selectors
  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );
  const isMobile = useMediaQuery("(max-width: 48rem)");

  // Handlers
  const handleOpenModal = (exercise: Exercise | null) => {
    setEditExercise(exercise);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditExercise(null);
  };

  // Data Fetching
  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      if (!organizationId) throw new Error("Se requiere el ID de la organización");
      const response = await getExercisesByOrganizationId(organizationId);
      setExercises(response);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener la lista de ejercicios");
      showNotification({
        title: "Error",
        message: "No fue posible cargar la lista de ejercicios",
        color: "red",
        autoClose: 5000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (organizationId) void fetchExercises();
  }, [organizationId]);

  // Memoized filtering (client-side search)
  const filteredExercises = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.description?.toLowerCase().includes(q) ||
        ex.muscleGroups.some((mg) => mg.toLowerCase().includes(q)) ||
        ex.equipment.some((eq) => eq.toLowerCase().includes(q))
    );
  }, [debounced, exercises]);

  // Delete handler
  const handleDeleteExercise = async (id: string) => {
    modals.openConfirmModal({
      title: "Eliminar ejercicio",
      children: "¿Estás seguro de que deseas eliminar este ejercicio? Esta acción no se puede deshacer.",
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteExercise(id);
          showNotification({
            title: "Ejercicio eliminado",
            message: "El ejercicio ha sido eliminado correctamente",
            color: "blue",
            autoClose: 2000,
            position: "top-right",
          });
          fetchExercises();
        } catch (error) {
          console.error(error);
          showNotification({
            title: "Error",
            message: (error as Error).message || "Error al eliminar",
            color: "red",
            autoClose: 5000,
            position: "top-right",
          });
        }
      },
    });
  };

  // Render
  return (
    <Box>
      {/* Header Card with Controls */}
      <Card
        withBorder
        radius="md"
        p="md"
        mb="md"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "var(--mantine-color-body)",
        }}
      >
        <Flex
          gap="sm"
          justify="space-between"
          align={isMobile ? "stretch" : "center"}
          direction={isMobile ? "column" : "row"}
          wrap="wrap"
        >
          <Group gap="sm">
            <Title order={2}>Ejercicios</Title>
            <Badge variant="light" size="sm">
              {filteredExercises.length} de {exercises.length}
            </Badge>
          </Group>

          <Group gap="sm" w={isMobile ? "100%" : "auto"}>
            <TextInput
              leftSection={<BsSearch />}
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              w={isMobile ? "100%" : 320}
              radius="md"
            />
            <Button
              leftSection={<IoAddCircleOutline />}
              onClick={() => handleOpenModal(null)}
            >
              {isMobile ? "Crear" : "Crear ejercicio"}
            </Button>
          </Group>
        </Flex>
      </Card>

      {/* Content Card */}
      {isLoading ? (
        <Card withBorder radius="md" p="md">
          <Skeleton height={36} mb="sm" />
          <Skeleton height={36} mb="sm" />
          <Skeleton height={36} />
        </Card>
      ) : (
        <Card withBorder radius="md" p="md">
          <ExerciseTable
            exercises={filteredExercises}
            handleDeleteExercise={handleDeleteExercise}
            handleEditExercise={handleOpenModal}
            error={error}
          />
        </Card>
      )}

      {/* Modal */}
      <ExerciseFormModal
        opened={openModal}
        onClose={handleCloseModal}
        fetchExercises={fetchExercises}
        exercise={editExercise}
      />
    </Box>
  );
};

export default ManageExercises;
