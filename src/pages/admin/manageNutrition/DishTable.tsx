import {
  Table,
  ScrollArea,
  Group,
  Button,
  Badge,
  Text,
  Pagination,
  Select,
  Box,
  Alert,
  Card,
  Stack,
  Flex,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Dish, MEAL_CATEGORIES } from "../../../services/dishService";

interface DishTableProps {
  dishes: Dish[];
  handleDeleteDish: (id: string) => void;
  handleEditDish: (dish: Dish) => void;
  error: string | null;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    desayuno: "yellow",
    merienda_am: "orange",
    almuerzo: "green",
    merienda_pm: "grape",
    cena: "blue",
  };
  return colors[category] || "gray";
};

const getCategoryLabel = (category: string): string => {
  return MEAL_CATEGORIES.find((c) => c.value === category)?.label || category;
};

const DishTable: React.FC<DishTableProps> = ({
  dishes,
  handleDeleteDish,
  handleEditDish,
  error,
}) => {
  const isMobile = useMediaQuery("(max-width: 48rem)");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(dishes.length / pageSize);
  const displayedDishes = useMemo(
    () => dishes.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [dishes, currentPage, pageSize]
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [dishes.length]);

  return (
    <Box>
      {error && (
        <Alert color="red" mb="sm" title="Error">
          {error}
        </Alert>
      )}

      {dishes.length === 0 && !error && (
        <Alert color="blue" title="No hay platos">
          No se encontraron platos. Crea uno nuevo para comenzar.
        </Alert>
      )}

      {dishes.length > 0 && (
        <>
          {/* Pagination Top */}
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="dimmed">
              Mostrando{" "}
              {dishes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, dishes.length)} de{" "}
              {dishes.length}
            </Text>
            <Group gap="xs">
              <Select
                placeholder="Items por página"
                data={["10", "20", "50"]}
                value={pageSize.toString()}
                onChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
                w={120}
              />
              <Pagination
                total={Math.max(totalPages, 1)}
                value={currentPage}
                onChange={setCurrentPage}
                size={isMobile ? "sm" : "md"}
              />
            </Group>
          </Group>

          {/* Desktop Table / Mobile Cards */}
          {!isMobile ? (
            <ScrollArea.Autosize mah={560}>
              <Table
                withTableBorder
                withColumnBorders
                stickyHeader
                highlightOnHover
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Categoría</Table.Th>
                    <Table.Th>Calorías</Table.Th>
                    <Table.Th>Proteínas</Table.Th>
                    <Table.Th>Carbos</Table.Th>
                    <Table.Th>Grasas</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {displayedDishes.map((dish) => (
                    <Table.Tr key={dish._id}>
                      <Table.Td>
                        <Text fw={500}>{dish.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={getCategoryColor(dish.category)}
                        >
                          {getCategoryLabel(dish.category)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dish.nutritionalInfo?.calories || 0} kcal
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dish.nutritionalInfo?.proteins || 0}g
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dish.nutritionalInfo?.carbohydrates || 0}g
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dish.nutritionalInfo?.fats || 0}g
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => handleEditDish(dish)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => handleDeleteDish(dish._id)}
                          >
                            Eliminar
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea.Autosize>
          ) : (
            <Stack gap="sm">
              {displayedDishes.map((dish) => (
                <Card key={dish._id} withBorder radius="md" p="md">
                  <Flex direction="column" gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Text fw={600}>{dish.name}</Text>
                        <Badge
                          variant="light"
                          color={getCategoryColor(dish.category)}
                          size="sm"
                          mt={4}
                        >
                          {getCategoryLabel(dish.category)}
                        </Badge>
                      </Box>
                    </Group>

                    <Group gap="xs">
                      <Badge variant="outline" size="xs" color="red">
                        {dish.nutritionalInfo?.calories || 0} kcal
                      </Badge>
                      <Badge variant="outline" size="xs" color="blue">
                        P: {dish.nutritionalInfo?.proteins || 0}g
                      </Badge>
                      <Badge variant="outline" size="xs" color="green">
                        C: {dish.nutritionalInfo?.carbohydrates || 0}g
                      </Badge>
                      <Badge variant="outline" size="xs" color="yellow">
                        G: {dish.nutritionalInfo?.fats || 0}g
                      </Badge>
                    </Group>

                    {dish.ingredients.length > 0 && (
                      <Group gap={4}>
                        <Text size="xs" c="dimmed" fw={500}>
                          Ingredientes:
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {dish.ingredients.join(", ")}
                        </Text>
                      </Group>
                    )}

                    <Group mt="sm" gap="xs">
                      <Button
                        size="xs"
                        fullWidth
                        onClick={() => handleEditDish(dish)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="xs"
                        fullWidth
                        color="red"
                        onClick={() => handleDeleteDish(dish._id)}
                      >
                        Eliminar
                      </Button>
                    </Group>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}

          {/* Pagination Bottom */}
          <Group justify="center" mt="md">
            <Pagination
              total={Math.max(totalPages, 1)}
              value={currentPage}
              onChange={setCurrentPage}
              size={isMobile ? "sm" : "md"}
            />
          </Group>
        </>
      )}
    </Box>
  );
};

export default DishTable;
