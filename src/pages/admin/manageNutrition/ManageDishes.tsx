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
  Select,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import DishFormModal from "./DishFormModal";
import DishTable from "./DishTable";
import { IoAddCircleOutline } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import {
  deleteDish,
  Dish,
  getDishesByOrganizationId,
  MEAL_CATEGORIES,
} from "../../../services/dishService";
import { showNotification } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";

const ManageDishes = () => {
  // State
  const [openModal, setOpenModal] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [debounced] = useDebouncedValue(searchTerm, 250);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editDish, setEditDish] = useState<Dish | null>(null);

  // Redux
  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );
  const isMobile = useMediaQuery("(max-width: 48rem)");

  // Handlers
  const handleOpenModal = (dish: Dish | null) => {
    setEditDish(dish);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditDish(null);
  };

  // Data Fetching
  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      if (!organizationId) throw new Error("Se requiere el ID de la organización");
      const response = await getDishesByOrganizationId(organizationId);
      setDishes(response);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener la lista de platos");
      showNotification({
        title: "Error",
        message: "No fue posible cargar la lista de platos",
        color: "red",
        autoClose: 5000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) void fetchDishes();
  }, [organizationId]);

  // Memoized filtering
  const filteredDishes = useMemo(() => {
    let result = dishes;

    if (categoryFilter) {
      result = result.filter((d) => d.category === categoryFilter);
    }

    const q = debounced.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    return result;
  }, [debounced, categoryFilter, dishes]);

  // Delete handler
  const handleDeleteDish = async (id: string) => {
    modals.openConfirmModal({
      title: "Eliminar plato",
      children:
        "¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer.",
      labels: { confirm: "Eliminar", cancel: "Cancelar" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteDish(id);
          showNotification({
            title: "Plato eliminado",
            message: "El plato ha sido eliminado correctamente",
            color: "blue",
            autoClose: 2000,
            position: "top-right",
          });
          fetchDishes();
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

  return (
    <Box>
      {/* Header */}
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
            <Title order={2}>Platos</Title>
            <Badge variant="light" size="sm">
              {filteredDishes.length} de {dishes.length}
            </Badge>
          </Group>

          <Group gap="sm" w={isMobile ? "100%" : "auto"}>
            <TextInput
              leftSection={<BsSearch />}
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              w={isMobile ? "100%" : 250}
              radius="md"
            />
            <Select
              placeholder="Categoría"
              data={[{ value: "", label: "Todas" }, ...MEAL_CATEGORIES]}
              value={categoryFilter || ""}
              onChange={(v) => setCategoryFilter(v || null)}
              w={isMobile ? "100%" : 160}
              radius="md"
              clearable
            />
            <Button
              leftSection={<IoAddCircleOutline />}
              onClick={() => handleOpenModal(null)}
            >
              {isMobile ? "Crear" : "Nuevo plato"}
            </Button>
          </Group>
        </Flex>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card withBorder radius="md" p="md">
          <Skeleton height={36} mb="sm" />
          <Skeleton height={36} mb="sm" />
          <Skeleton height={36} />
        </Card>
      ) : (
        <Card withBorder radius="md" p="md">
          <DishTable
            dishes={filteredDishes}
            handleDeleteDish={handleDeleteDish}
            handleEditDish={handleOpenModal}
            error={error}
          />
        </Card>
      )}

      {/* Modal */}
      <DishFormModal
        opened={openModal}
        onClose={handleCloseModal}
        fetchDishes={fetchDishes}
        dish={editDish}
      />
    </Box>
  );
};

export default ManageDishes;
