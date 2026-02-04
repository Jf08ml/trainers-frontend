import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  MultiSelect,
  Button,
  Group,
  Box,
  Text,
  SimpleGrid,
  Image,
  Divider,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  createExercise,
  updateExercise,
  Exercise,
} from "../../../services/exerciseService";
import {
  getMuscleGroupsByOrganizationId,
  getEquipmentByOrganizationId,
  type MuscleGroup,
  type Equipment,
} from "../../../services/trainingCatalogService";

interface ExerciseFormModalProps {
  opened: boolean;
  onClose: () => void;
  fetchExercises: () => void;
  exercise: Exercise | null;
}

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  opened,
  onClose,
  fetchExercises,
  exercise,
}) => {
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Catalogs from DB
  const [muscleGroupsCatalog, setMuscleGroupsCatalog] = useState<MuscleGroup[]>([]);
  const [equipmentCatalog, setEquipmentCatalog] = useState<Equipment[]>([]);

  // Redux
  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );

  const isEdit = !!exercise;

  // Load catalogs
  useEffect(() => {
    if (organizationId && opened) {
      loadCatalogs();
    }
  }, [organizationId, opened]);

  const loadCatalogs = async () => {
    if (!organizationId) return;
    const [mg, eq] = await Promise.all([
      getMuscleGroupsByOrganizationId(organizationId),
      getEquipmentByOrganizationId(organizationId),
    ]);
    setMuscleGroupsCatalog(mg);
    setEquipmentCatalog(eq);
  };

  // Form reset
  const resetForm = () => {
    setName("");
    setDescription("");
    setMuscleGroups([]);
    setEquipment([]);
    setVideoUrl("");
    setImageUrl("");
  };

  // Populate form on edit
  useEffect(() => {
    if (exercise && opened) {
      setName(exercise.name?.trim() ?? "");
      setDescription(exercise.description?.trim() ?? "");
      // Convert populated objects to IDs if needed
      const mgIds = Array.isArray(exercise.muscleGroups)
        ? exercise.muscleGroups.map((mg: any) => (typeof mg === "string" ? mg : mg._id))
        : [];
      const eqIds = Array.isArray(exercise.equipment)
        ? exercise.equipment.map((eq: any) => (typeof eq === "string" ? eq : eq._id))
        : [];
      setMuscleGroups(mgIds);
      setEquipment(eqIds);
      setVideoUrl(exercise.videoUrl?.trim() ?? "");
      setImageUrl(exercise.imageUrl?.trim() ?? "");
    } else if (opened) {
      resetForm();
    }
  }, [exercise, opened]);

  // Handle close with reset
  const closeWithReset = () => {
    resetForm();
    onClose();
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      showNotification({
        title: "Falta el nombre",
        message: "Escribe el nombre del ejercicio",
        color: "red",
        autoClose: 2200,
      });
      return;
    }

    setLoading(true);
    try {
      if (!organizationId) throw new Error("Se requiere el ID de la organización");

      const payload = {
        name: name.trim(),
        description: description.trim(),
        muscleGroups,
        equipment,
        videoUrl: videoUrl.trim(),
        imageUrl: imageUrl.trim(),
      };

      if (exercise) {
        // UPDATE
        await updateExercise(exercise._id, payload);
        showNotification({
          title: "Ejercicio actualizado",
          message: "Los cambios se guardaron correctamente",
          color: "green",
          autoClose: 2000,
        });
      } else {
        // CREATE
        await createExercise({
          ...payload,
          organizationId,
        });
        showNotification({
          title: "Ejercicio creado",
          message: "El ejercicio quedó registrado correctamente",
          color: "green",
          autoClose: 2000,
        });
      }

      fetchExercises();
      resetForm();
      onClose();
    } catch (err: any) {
      showNotification({
        title: "Error",
        message: err.message || "Error al guardar",
        color: "red",
        autoClose: 3200,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={closeWithReset}
      centered
      radius="lg"
      size="lg"
      padding="lg"
      title={isEdit ? "Editar ejercicio" : "Nuevo ejercicio"}
    >
      <Stack gap="md">
        {/* Basic Info Section */}
        <Box>
          <Text fw={600} mb={6}>
            Información básica
          </Text>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Press de banca"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              withAsterisk
            />
            <Textarea
              label="Descripción"
              placeholder="Descripción detallada del ejercicio..."
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              minRows={3}
              maxRows={6}
            />
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Exercise Details */}
        <Box>
          <Text fw={600} mb={6}>
            Detalles del ejercicio
          </Text>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            <MultiSelect
              label="Grupos musculares"
              placeholder="Selecciona..."
              data={muscleGroupsCatalog.map((mg) => ({
                value: mg._id,
                label: mg.name,
              }))}
              value={muscleGroups}
              onChange={setMuscleGroups}
              searchable
              description={
                muscleGroupsCatalog.length === 0
                  ? "Configura grupos musculares en Catálogos de Entrenamiento"
                  : undefined
              }
            />
            <MultiSelect
              label="Equipamiento"
              placeholder="Selecciona..."
              data={equipmentCatalog.map((eq) => ({
                value: eq._id,
                label: eq.name,
              }))}
              value={equipment}
              onChange={setEquipment}
              searchable
              description={
                equipmentCatalog.length === 0
                  ? "Configura equipamiento en Catálogos de Entrenamiento"
                  : undefined
              }
            />
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Media Section */}
        <Box>
          <Text fw={600} mb={6}>
            Multimedia (opcional)
          </Text>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            <TextInput
              label="URL del video"
              placeholder="https://youtube.com/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.currentTarget.value)}
            />
            <TextInput
              label="URL de la imagen"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.currentTarget.value)}
            />
            {imageUrl && imageUrl.trim() && (
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  Vista previa:
                </Text>
                <Image
                  src={imageUrl}
                  alt="Preview"
                  radius="md"
                  fit="contain"
                  h={150}
                  fallbackSrc="https://placehold.co/400x300?text=Imagen+no+disponible"
                />
              </Box>
            )}
          </SimpleGrid>
        </Box>

        {/* Action Buttons */}
        <Group justify="space-between" mt="xs">
          <Button variant="subtle" color="gray" onClick={closeWithReset}>
            Cancelar
          </Button>

          <Group gap="sm">
            <Button variant="default" onClick={resetForm} disabled={loading}>
              Limpiar
            </Button>

            <Button onClick={handleSubmit} loading={loading}>
              {isEdit ? "Guardar cambios" : "Crear ejercicio"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ExerciseFormModal;
