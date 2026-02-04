import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Group,
  Box,
  Text,
  SimpleGrid,
  Image,
  Divider,
  TagsInput,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  createDish,
  updateDish,
  Dish,
  MEAL_CATEGORIES,
  type MealCategory,
} from "../../../services/dishService";

interface DishFormModalProps {
  opened: boolean;
  onClose: () => void;
  fetchDishes: () => void;
  dish: Dish | null;
}

const DishFormModal: React.FC<DishFormModalProps> = ({
  opened,
  onClose,
  fetchDishes,
  dish,
}) => {
  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preparation, setPreparation] = useState("");
  const [calories, setCalories] = useState<number>(0);
  const [carbohydrates, setCarbohydrates] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [proteins, setProteins] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Redux
  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );

  const isEdit = !!dish;

  // Form reset
  const resetForm = () => {
    setName("");
    setCategory("");
    setIngredients([]);
    setPreparation("");
    setCalories(0);
    setCarbohydrates(0);
    setFats(0);
    setProteins(0);
    setNotes("");
    setImageUrl("");
  };

  // Populate form on edit
  useEffect(() => {
    if (dish && opened) {
      setName(dish.name?.trim() ?? "");
      setCategory(dish.category ?? "");
      setIngredients(dish.ingredients || []);
      setPreparation(dish.preparation?.trim() ?? "");
      setCalories(dish.nutritionalInfo?.calories ?? 0);
      setCarbohydrates(dish.nutritionalInfo?.carbohydrates ?? 0);
      setFats(dish.nutritionalInfo?.fats ?? 0);
      setProteins(dish.nutritionalInfo?.proteins ?? 0);
      setNotes(dish.notes?.trim() ?? "");
      setImageUrl(dish.imageUrl?.trim() ?? "");
    } else if (opened) {
      resetForm();
    }
  }, [dish, opened]);

  // Handle close with reset
  const closeWithReset = () => {
    resetForm();
    onClose();
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification({
        title: "Falta el nombre",
        message: "Escribe el nombre del plato",
        color: "red",
        autoClose: 2200,
      });
      return;
    }

    if (!category) {
      showNotification({
        title: "Falta la categoría",
        message: "Selecciona una categoría para el plato",
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
        category: category as MealCategory,
        ingredients,
        preparation: preparation.trim(),
        nutritionalInfo: {
          calories,
          carbohydrates,
          fats,
          proteins,
        },
        notes: notes.trim(),
        imageUrl: imageUrl.trim(),
      };

      if (dish) {
        await updateDish(dish._id, payload);
        showNotification({
          title: "Plato actualizado",
          message: "Los cambios se guardaron correctamente",
          color: "green",
          autoClose: 2000,
        });
      } else {
        await createDish({
          ...payload,
          organizationId,
        });
        showNotification({
          title: "Plato creado",
          message: "El plato quedó registrado correctamente",
          color: "green",
          autoClose: 2000,
        });
      }

      fetchDishes();
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
      title={isEdit ? "Editar plato" : "Nuevo plato"}
    >
      <Stack gap="md">
        {/* Basic Info */}
        <Box>
          <Text fw={600} mb={6}>
            Información básica
          </Text>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Avena con frutas"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              withAsterisk
            />
            <Select
              label="Categoría"
              placeholder="Selecciona..."
              data={MEAL_CATEGORIES}
              value={category}
              onChange={(v) => setCategory(v || "")}
              withAsterisk
            />
            <TagsInput
              label="Ingredientes"
              placeholder="Escribe y presiona Enter"
              value={ingredients}
              onChange={setIngredients}
              clearable
            />
            <Textarea
              label="Preparación"
              placeholder="Instrucciones de preparación..."
              value={preparation}
              onChange={(e) => setPreparation(e.currentTarget.value)}
              minRows={3}
              maxRows={6}
            />
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Nutritional Info */}
        <Box>
          <Text fw={600} mb={6}>
            Información nutricional
          </Text>
          <SimpleGrid cols={{ base: 2 }} spacing="md">
            <NumberInput
              label="Calorías (kcal)"
              placeholder="0"
              value={calories}
              onChange={(v) => setCalories(typeof v === "number" ? v : 0)}
              min={0}
            />
            <NumberInput
              label="Proteínas (g)"
              placeholder="0"
              value={proteins}
              onChange={(v) => setProteins(typeof v === "number" ? v : 0)}
              min={0}
            />
            <NumberInput
              label="Carbohidratos (g)"
              placeholder="0"
              value={carbohydrates}
              onChange={(v) => setCarbohydrates(typeof v === "number" ? v : 0)}
              min={0}
            />
            <NumberInput
              label="Grasas (g)"
              placeholder="0"
              value={fats}
              onChange={(v) => setFats(typeof v === "number" ? v : 0)}
              min={0}
            />
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Notes & Image */}
        <Box>
          <Text fw={600} mb={6}>
            Adicional (opcional)
          </Text>
          <SimpleGrid cols={{ base: 1 }} spacing="md">
            <Textarea
              label="Notas"
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              minRows={2}
              maxRows={4}
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
              {isEdit ? "Guardar cambios" : "Crear plato"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DishFormModal;
