import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Stack,
  Paper,
  Badge,
  Text,
  Card,
  Group,
  ThemeIcon,
  Loader,
  Center,
  Checkbox,
  Button,
  Progress,
  Box,
  Spoiler,
  Image,
  TextInput,
  Tooltip,
  NumberInput,
  Tabs,
  SegmentedControl,
  SimpleGrid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconSalad,
  IconDeviceFloppy,
  IconStar,
  IconSearch,
} from "@tabler/icons-react";
import {
  getActiveNutritionPlansByClientId,
  createNutritionPlan,
  updateClientSelections,
  type NutritionPlan,
} from "../../services/nutritionPlanService";
import {
  getDishesByOrganizationId,
  MEAL_CATEGORIES,
  type Dish,
  type MealCategory,
} from "../../services/dishService";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

// Convert JS day (0=Sun..6=Sat) to Spanish convention (0=Mon..6=Sun)
const getSpanishDayOfWeek = (): number => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

const makeKey = (
  weekNumber: number,
  dayOfWeek: number,
  dishId: string,
  mealType: string
): string => `${weekNumber}|${dayOfWeek}|${dishId}|${mealType}`;

const ClientNutritionPlan: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // For self-creation when no trainer plan exists
  const [planName, setPlanName] = useState("Mi plan de alimentación");
  const [planTotalWeeks, setPlanTotalWeeks] = useState<number>(1);

  // Navigation state
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [activeDay, setActiveDay] = useState<number>(getSpanishDayOfWeek());

  // Selections: set of "weekNumber|dayOfWeek|dishId|mealType" keys
  const [selections, setSelections] = useState<Set<string>>(new Set());

  // (recommendedKeys built per-day via currentDayRecommendedIds)

  useEffect(() => {
    if (userId && organizationId) {
      loadData();
    }
  }, [userId, organizationId]);

  const totalWeeks = plan ? (plan.totalWeeks ?? 1) : planTotalWeeks;

  const loadData = async () => {
    if (!userId || !organizationId) return;
    setLoading(true);

    const [plans, dishes] = await Promise.all([
      getActiveNutritionPlansByClientId(userId, organizationId),
      getDishesByOrganizationId(organizationId),
    ]);

    setAllDishes(dishes);

    if (plans.length > 0) {
      const activePlan = plans[0];
      setPlan(activePlan);
      setPlanName(activePlan.name);

      // Initialize selections from saved clientSelections
      const savedSelections = new Set<string>();
      activePlan.clientSelections?.forEach((cs) => {
        const dishId =
          typeof cs.dishId === "object" ? cs.dishId._id : cs.dishId;
        savedSelections.add(
          makeKey(cs.weekNumber ?? 1, cs.dayOfWeek ?? 0, dishId, cs.mealType)
        );
      });
      setSelections(savedSelections);
    }

    setLoading(false);
  };

  const toggleSelection = (dishId: string, mealType: MealCategory) => {
    const key = makeKey(activeWeek, activeDay, dishId, mealType);
    setSelections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Build a map of dishId -> Dish for quick lookup
  const dishMap = useMemo(() => {
    const map = new Map<string, Dish>();
    allDishes.forEach((d) => map.set(d._id, d));
    return map;
  }, [allDishes]);

  // Calculate selected totals for current day only
  const daySelectionTotals = useMemo(() => {
    const prefix = `${activeWeek}|${activeDay}|`;
    const totals = { calories: 0, carbohydrates: 0, fats: 0, proteins: 0 };
    selections.forEach((key) => {
      if (key.startsWith(prefix)) {
        const parts = key.split("|");
        const dishId = parts[2];
        const dish = dishMap.get(dishId);
        if (dish?.nutritionalInfo) {
          totals.calories += dish.nutritionalInfo.calories || 0;
          totals.carbohydrates += dish.nutritionalInfo.carbohydrates || 0;
          totals.fats += dish.nutritionalInfo.fats || 0;
          totals.proteins += dish.nutritionalInfo.proteins || 0;
        }
      }
    });
    return totals;
  }, [selections, activeWeek, activeDay, dishMap]);

  // Count selections per day (for badges)
  const getDaySelectionCount = (week: number, day: number): number => {
    const prefix = `${week}|${day}|`;
    let count = 0;
    selections.forEach((key) => {
      if (key.startsWith(prefix)) count++;
    });
    return count;
  };

  // Recommended dishes for current day
  const currentDayRecommendedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!plan) return ids;
    plan.recommendedDishes?.forEach((rd) => {
      if (
        (rd.weekNumber ?? 1) === activeWeek &&
        (rd.dayOfWeek ?? 0) === activeDay
      ) {
        const dishId =
          typeof rd.dishId === "object" ? rd.dishId._id : rd.dishId;
        ids.add(`${dishId}|${rd.mealType}`);
      }
    });
    return ids;
  }, [plan, activeWeek, activeDay]);

  // Filter dishes by search
  const filteredDishes = useMemo(() => {
    if (!searchTerm.trim()) return allDishes;
    const q = searchTerm.toLowerCase();
    return allDishes.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.ingredients.some((ing) => ing.toLowerCase().includes(q))
    );
  }, [searchTerm, allDishes]);

  const handleSave = async () => {
    if (!userId || !organizationId) return;
    setSaving(true);

    const selectionsList = Array.from(selections).map((key) => {
      const [weekNumber, dayOfWeek, dishId, mealType] = key.split("|");
      return {
        dishId,
        mealType: mealType as MealCategory,
        weekNumber: Number(weekNumber),
        dayOfWeek: Number(dayOfWeek),
      };
    });

    try {
      if (plan) {
        await updateClientSelections(plan._id, selectionsList);
        notifications.show({
          title: "Guardado",
          message: "Tus selecciones se guardaron correctamente",
          color: "green",
        });
      } else {
        if (!planName.trim()) {
          notifications.show({
            title: "Error",
            message: "Dale un nombre a tu plan",
            color: "red",
          });
          setSaving(false);
          return;
        }

        const newPlan = await createNutritionPlan({
          name: planName.trim(),
          organizationId,
          clientId: userId,
          totalWeeks: planTotalWeeks,
          recommendedDishes: [],
          nutritionalTargets: {},
          notes: "",
        });

        if (newPlan) {
          await updateClientSelections(newPlan._id, selectionsList);
          setPlan(newPlan);
          notifications.show({
            title: "Plan creado",
            message: "Tu plan de alimentación se guardó correctamente",
            color: "green",
          });
        }
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Error al guardar",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const getProgressPct = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (current: number, target: number): string => {
    if (target === 0) return "gray";
    const pct = (current / target) * 100;
    if (pct <= 80) return "blue";
    if (pct <= 100) return "green";
    return "red";
  };

  const hasTargets =
    plan &&
    (plan.nutritionalTargets?.calories > 0 ||
      plan.nutritionalTargets?.proteins > 0 ||
      plan.nutritionalTargets?.carbohydrates > 0 ||
      plan.nutritionalTargets?.fats > 0);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (allDishes.length === 0 && !plan) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" variant="light" color="gray">
              <IconSalad size={30} />
            </ThemeIcon>
            <Title order={3} c="dimmed">
              Mi Nutrición
            </Title>
            <Text c="dimmed" ta="center">
              Aún no hay platos disponibles en el catálogo.
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
          <Title order={2}>Mi Nutrición</Title>
          {plan ? (
            <Text c="dimmed" size="sm">
              {plan.name}
            </Text>
          ) : (
            <Text c="dimmed" size="sm">
              Arma tu plan de alimentación eligiendo los platos que prefieras
            </Text>
          )}
        </div>

        {/* Plan name + weeks input (only when creating new) */}
        {!plan && (
          <Paper shadow="sm" p="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Nombre de tu plan"
                placeholder="Ej: Mi plan de alimentación"
                value={planName}
                onChange={(e) => setPlanName(e.currentTarget.value)}
              />
              <NumberInput
                label="Semanas del plan"
                value={planTotalWeeks}
                onChange={(v) =>
                  setPlanTotalWeeks(
                    Math.max(1, Math.floor(typeof v === "number" ? v : 1))
                  )
                }
                min={1}
                max={12}
              />
            </SimpleGrid>
          </Paper>
        )}

        {/* Trainer notes */}
        {plan?.notes && (
          <Paper shadow="sm" p="md">
            <Text fw={600} mb="xs">
              Indicaciones de tu entrenador
            </Text>
            <Text size="sm" c="dimmed">
              {plan.notes}
            </Text>
          </Paper>
        )}

        {/* Week tabs — only if totalWeeks > 1 */}
        {totalWeeks > 1 && (
          <Tabs
            value={activeWeek.toString()}
            onChange={(v) => setActiveWeek(Number(v))}
          >
            <Tabs.List>
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                <Tabs.Tab key={w} value={w.toString()}>
                  Sem {w}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        )}

        {/* Day segmented control */}
        <SegmentedControl
          value={activeDay.toString()}
          onChange={(v) => setActiveDay(Number(v))}
          data={DAY_LABELS.map((label, idx) => {
            const count = getDaySelectionCount(activeWeek, idx);
            return {
              value: idx.toString(),
              label: (
                <Group gap={4} wrap="nowrap" justify="center">
                  <span>{label}</span>
                  {count > 0 && (
                    <Badge size="xs" variant="filled" circle>
                      {count}
                    </Badge>
                  )}
                </Group>
              ),
            };
          })}
          fullWidth
        />

        {/* Nutritional progress for current day */}
        {hasTargets && (
          <Paper shadow="sm" p="md">
            <Text fw={600} mb="sm">
              Progreso nutricional del día ({DAY_LABELS[activeDay]}
              {totalWeeks > 1 ? ` — Sem ${activeWeek}` : ""})
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {plan.nutritionalTargets.calories > 0 && (
                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs">Calorías</Text>
                    <Text size="xs" fw={500}>
                      {daySelectionTotals.calories} /{" "}
                      {plan.nutritionalTargets.calories} kcal
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressPct(
                      daySelectionTotals.calories,
                      plan.nutritionalTargets.calories
                    )}
                    color={getProgressColor(
                      daySelectionTotals.calories,
                      plan.nutritionalTargets.calories
                    )}
                    size="md"
                  />
                </Box>
              )}
              {plan.nutritionalTargets.proteins > 0 && (
                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs">Proteínas</Text>
                    <Text size="xs" fw={500}>
                      {daySelectionTotals.proteins} /{" "}
                      {plan.nutritionalTargets.proteins}g
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressPct(
                      daySelectionTotals.proteins,
                      plan.nutritionalTargets.proteins
                    )}
                    color={getProgressColor(
                      daySelectionTotals.proteins,
                      plan.nutritionalTargets.proteins
                    )}
                    size="md"
                  />
                </Box>
              )}
              {plan.nutritionalTargets.carbohydrates > 0 && (
                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs">Carbohidratos</Text>
                    <Text size="xs" fw={500}>
                      {daySelectionTotals.carbohydrates} /{" "}
                      {plan.nutritionalTargets.carbohydrates}g
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressPct(
                      daySelectionTotals.carbohydrates,
                      plan.nutritionalTargets.carbohydrates
                    )}
                    color={getProgressColor(
                      daySelectionTotals.carbohydrates,
                      plan.nutritionalTargets.carbohydrates
                    )}
                    size="md"
                  />
                </Box>
              )}
              {plan.nutritionalTargets.fats > 0 && (
                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs">Grasas</Text>
                    <Text size="xs" fw={500}>
                      {daySelectionTotals.fats} / {plan.nutritionalTargets.fats}
                      g
                    </Text>
                  </Group>
                  <Progress
                    value={getProgressPct(
                      daySelectionTotals.fats,
                      plan.nutritionalTargets.fats
                    )}
                    color={getProgressColor(
                      daySelectionTotals.fats,
                      plan.nutritionalTargets.fats
                    )}
                    size="md"
                  />
                </Box>
              )}
            </SimpleGrid>
          </Paper>
        )}

        {/* Totals summary (when no targets) */}
        {!hasTargets && getDaySelectionCount(activeWeek, activeDay) > 0 && (
          <Paper shadow="sm" p="md">
            <Text fw={600} mb="sm">
              Resumen nutricional — {DAY_LABELS[activeDay]}
              {totalWeeks > 1 ? ` (Sem ${activeWeek})` : ""}
            </Text>
            <Group gap="md">
              <Badge variant="light" color="red" size="lg">
                {daySelectionTotals.calories} kcal
              </Badge>
              <Badge variant="light" color="blue" size="lg">
                P: {daySelectionTotals.proteins}g
              </Badge>
              <Badge variant="light" color="green" size="lg">
                C: {daySelectionTotals.carbohydrates}g
              </Badge>
              <Badge variant="light" color="yellow" size="lg">
                G: {daySelectionTotals.fats}g
              </Badge>
            </Group>
          </Paper>
        )}

        {/* Search */}
        <TextInput
          placeholder="Buscar platos..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />

        {/* Dishes by category */}
        {MEAL_CATEGORIES.map((category) => {
          const categoryDishes = filteredDishes.filter(
            (d) => d.category === category.value
          );

          if (categoryDishes.length === 0) return null;

          const selectedCount = categoryDishes.filter((d) =>
            selections.has(
              makeKey(activeWeek, activeDay, d._id, category.value)
            )
          ).length;

          return (
            <Paper key={category.value} shadow="sm" p="md">
              <Group gap="xs" mb="md">
                <Badge
                  variant="filled"
                  color={getCategoryColor(category.value)}
                  size="lg"
                >
                  {category.label}
                </Badge>
                <Text size="xs" c="dimmed">
                  {categoryDishes.length} disponible
                  {categoryDishes.length !== 1 ? "s" : ""}
                </Text>
                {selectedCount > 0 && (
                  <Badge variant="light" color="teal" size="sm">
                    {selectedCount} seleccionado
                    {selectedCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </Group>

              <Stack gap="sm">
                {categoryDishes.map((dish) => {
                  const selKey = makeKey(
                    activeWeek,
                    activeDay,
                    dish._id,
                    category.value
                  );
                  const isSelected = selections.has(selKey);
                  const isRecommended = currentDayRecommendedIds.has(
                    `${dish._id}|${category.value}`
                  );

                  return (
                    <Card
                      key={dish._id}
                      withBorder
                      p="sm"
                      radius="md"
                      style={{
                        borderColor: isSelected
                          ? "var(--mantine-color-teal-5)"
                          : isRecommended
                          ? "var(--mantine-color-orange-3)"
                          : undefined,
                        backgroundColor: isSelected
                          ? "var(--mantine-color-teal-0)"
                          : undefined,
                      }}
                    >
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            toggleSelection(
                              dish._id,
                              category.value as MealCategory
                            )
                          }
                          mt={4}
                        />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group gap={6} align="center">
                            <Text fw={600} size="sm">
                              {dish.name}
                            </Text>
                            {isRecommended && (
                              <Tooltip label="Recomendado por tu entrenador para este día">
                                <Badge
                                  variant="light"
                                  color="orange"
                                  size="xs"
                                  leftSection={<IconStar size={10} />}
                                >
                                  Recomendado
                                </Badge>
                              </Tooltip>
                            )}
                          </Group>

                          {dish.nutritionalInfo && (
                            <Group gap={4} mt={4}>
                              <Badge variant="outline" size="xs" color="red">
                                {dish.nutritionalInfo.calories || 0} kcal
                              </Badge>
                              <Badge variant="outline" size="xs" color="blue">
                                P: {dish.nutritionalInfo.proteins || 0}g
                              </Badge>
                              <Badge variant="outline" size="xs" color="green">
                                C:{" "}
                                {dish.nutritionalInfo.carbohydrates || 0}g
                              </Badge>
                              <Badge
                                variant="outline"
                                size="xs"
                                color="yellow"
                              >
                                G: {dish.nutritionalInfo.fats || 0}g
                              </Badge>
                            </Group>
                          )}

                          {dish.ingredients && dish.ingredients.length > 0 && (
                            <Text size="xs" c="dimmed" mt={4}>
                              Ingredientes: {dish.ingredients.join(", ")}
                            </Text>
                          )}

                          {dish.preparation && (
                            <Spoiler
                              maxHeight={0}
                              showLabel="Ver preparación"
                              hideLabel="Ocultar"
                              mt={4}
                              styles={{
                                control: { fontSize: 12 },
                              }}
                            >
                              <Text size="xs" c="dimmed" mt={4}>
                                {dish.preparation}
                              </Text>
                            </Spoiler>
                          )}

                          {dish.imageUrl && (
                            <Image
                              src={dish.imageUrl}
                              alt={dish.name}
                              radius="sm"
                              h={120}
                              fit="cover"
                              mt="xs"
                              fallbackSrc="https://placehold.co/400x200?text=Sin+imagen"
                            />
                          )}

                          {dish.notes && (
                            <Text size="xs" c="dimmed" fs="italic" mt={4}>
                              {dish.notes}
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Paper>
          );
        })}

        {/* Save button */}
        <Group justify="center">
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            loading={saving}
            size="md"
            color="teal"
            disabled={selections.size === 0}
          >
            {plan ? "Guardar mis selecciones" : "Crear mi plan"}
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default ClientNutritionPlan;
