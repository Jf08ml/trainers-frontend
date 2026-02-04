import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Stack,
  Badge,
  Text,
  Card,
  Group,
  ThemeIcon,
  Loader,
  Center,
  Box,
  Spoiler,
  Image,
  TextInput,
  SimpleGrid,
  SegmentedControl,
} from "@mantine/core";
import { IconSalad, IconSearch } from "@tabler/icons-react";
import {
  getDishesByOrganizationId,
  MEAL_CATEGORIES,
  type Dish,
} from "../../services/dishService";

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

const ClientDishCatalog: React.FC = () => {
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (organizationId) {
      loadDishes();
    }
  }, [organizationId]);

  const loadDishes = async () => {
    if (!organizationId) return;
    setLoading(true);
    const data = await getDishesByOrganizationId(organizationId);
    setDishes(data);
    setLoading(false);
  };

  const filteredDishes = useMemo(() => {
    let result = dishes;

    if (activeCategory !== "all") {
      result = result.filter((d) => d.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    return result;
  }, [dishes, activeCategory, searchTerm]);

  // Group filtered dishes by category for display
  const groupedDishes = useMemo(() => {
    if (activeCategory !== "all") {
      const cat = MEAL_CATEGORIES.find((c) => c.value === activeCategory);
      if (!cat) return [];
      return [{ ...cat, dishes: filteredDishes }];
    }

    return MEAL_CATEGORIES.map((cat) => ({
      ...cat,
      dishes: filteredDishes.filter((d) => d.category === cat.value),
    })).filter((g) => g.dishes.length > 0);
  }, [filteredDishes, activeCategory]);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (dishes.length === 0) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" variant="light" color="gray">
              <IconSalad size={30} />
            </ThemeIcon>
            <Title order={3} c="dimmed">
              Catálogo
            </Title>
            <Text c="dimmed" ta="center">
              Aún no hay platos disponibles.
              <br />
              Tu entrenador los configurará pronto.
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={2}>Catálogo de Platos</Title>
          <Text c="dimmed" size="sm">
            Explora todos los platos disponibles con su información nutricional
          </Text>
        </div>

        {/* Search */}
        <TextInput
          placeholder="Buscar por nombre o ingrediente..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          size="md"
        />

        {/* Category filter */}
        <SegmentedControl
          value={activeCategory}
          onChange={setActiveCategory}
          data={[
            { value: "all", label: "Todos" },
            ...MEAL_CATEGORIES.map((cat) => ({
              value: cat.value,
              label: cat.label,
            })),
          ]}
          fullWidth
        />

        {/* Dishes by category */}
        {groupedDishes.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No se encontraron platos</Text>
          </Center>
        ) : (
          groupedDishes.map((group) => (
            <Stack key={group.value} gap="md">
              {/* Category header */}
              <Group gap="xs">
                <Badge
                  variant="filled"
                  color={getCategoryColor(group.value)}
                  size="lg"
                >
                  {group.label}
                </Badge>
                <Text size="sm" c="dimmed">
                  {group.dishes.length} plato
                  {group.dishes.length !== 1 ? "s" : ""}
                </Text>
              </Group>

              {/* Dish cards */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {group.dishes.map((dish) => (
                  <Card
                    key={dish._id}
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                  >
                    {/* Image */}
                    {dish.imageUrl && (
                      <Card.Section>
                        <Image
                          src={dish.imageUrl}
                          alt={dish.name}
                          h={160}
                          fallbackSrc="https://placehold.co/400x160?text=Sin+imagen"
                        />
                      </Card.Section>
                    )}

                    <Stack gap="xs" mt={dish.imageUrl ? "sm" : 0}>
                      {/* Name */}
                      <Text fw={700} size="md">
                        {dish.name}
                      </Text>

                      {/* Nutritional badges */}
                      {dish.nutritionalInfo && (
                        <Group gap={6}>
                          <Badge variant="light" size="sm" color="red">
                            {dish.nutritionalInfo.calories || 0} kcal
                          </Badge>
                          <Badge variant="light" size="sm" color="blue">
                            P: {dish.nutritionalInfo.proteins || 0}g
                          </Badge>
                          <Badge variant="light" size="sm" color="green">
                            C: {dish.nutritionalInfo.carbohydrates || 0}g
                          </Badge>
                          <Badge variant="light" size="sm" color="yellow">
                            G: {dish.nutritionalInfo.fats || 0}g
                          </Badge>
                        </Group>
                      )}

                      {/* Ingredients */}
                      {dish.ingredients && dish.ingredients.length > 0 && (
                        <Box>
                          <Text size="xs" fw={600} c="dimmed" mb={2}>
                            Ingredientes
                          </Text>
                          <Text size="sm">
                            {dish.ingredients.join(", ")}
                          </Text>
                        </Box>
                      )}

                      {/* Preparation */}
                      {dish.preparation && (
                        <Box>
                          <Text size="xs" fw={600} c="dimmed" mb={2}>
                            Preparación
                          </Text>
                          <Spoiler
                            maxHeight={60}
                            showLabel="Ver más"
                            hideLabel="Ver menos"
                            styles={{
                              control: { fontSize: 12 },
                            }}
                          >
                            <Text size="sm">{dish.preparation}</Text>
                          </Spoiler>
                        </Box>
                      )}

                      {/* Notes */}
                      {dish.notes && (
                        <Text size="xs" c="dimmed" fs="italic">
                          {dish.notes}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          ))
        )}
      </Stack>
    </Container>
  );
};

export default ClientDishCatalog;
