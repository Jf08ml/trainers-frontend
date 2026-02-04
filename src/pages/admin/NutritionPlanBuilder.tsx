import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Badge,
  Text,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Card,
  ActionIcon,
  SimpleGrid,
  ThemeIcon,
  Loader,
  Center,
  Divider,
  Modal,
  Progress,
  Box,
  ScrollArea,
  Tabs,
  SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconArrowLeft,
  IconDeviceFloppy,
  IconSearch,
  IconSalad,
  IconCopy,
} from "@tabler/icons-react";
import {
  createNutritionPlan,
  updateNutritionPlan,
  getNutritionPlanById,
} from "../../services/nutritionPlanService";
import {
  getDishesByOrganizationId,
  MEAL_CATEGORIES,
  type Dish,
  type MealCategory,
} from "../../services/dishService";
import {
  getClientsByOrganizationId,
  type Client,
} from "../../services/clientService";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface RecommendedDishEntry {
  dishId: string;
  dish?: Dish;
  mealType: MealCategory;
  weekNumber: number;
  dayOfWeek: number;
}

const NutritionPlanBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id: planId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");
  const isEdit = !!planId;

  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  // Form state
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string | null>(
    preselectedClientId || null
  );
  const [notes, setNotes] = useState("");
  const [totalWeeks, setTotalWeeks] = useState<number>(1);
  const [caloriesTarget, setCaloriesTarget] = useState<number>(0);
  const [carbsTarget, setCarbsTarget] = useState<number>(0);
  const [fatsTarget, setFatsTarget] = useState<number>(0);
  const [proteinsTarget, setProteinsTarget] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [recommendedDishes, setRecommendedDishes] = useState<
    RecommendedDishEntry[]
  >([]);

  // Navigation state
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [activeDay, setActiveDay] = useState<number>(0);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dish picker modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<MealCategory>("desayuno");
  const [pickerSearch, setPickerSearch] = useState("");

  // Copy week modal
  const [copyWeekOpen, setCopyWeekOpen] = useState(false);
  const [copySource, setCopySource] = useState<string>("1");
  const [copyTarget, setCopyTarget] = useState<string>("2");

  // Load data
  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  useEffect(() => {
    if (planId && dishes.length > 0) {
      loadPlan();
    }
  }, [planId, dishes]);

  const loadData = async () => {
    if (!organizationId) return;
    setLoading(true);

    const [clientsData, dishesData] = await Promise.all([
      getClientsByOrganizationId(organizationId),
      getDishesByOrganizationId(organizationId),
    ]);

    setClients(clientsData);
    setDishes(dishesData);
    setLoading(false);
  };

  const loadPlan = async () => {
    if (!planId) return;
    const plan = await getNutritionPlanById(planId);
    if (!plan) return;

    setName(plan.name);
    setTotalWeeks(plan.totalWeeks ?? 1);
    setClientId(
      typeof plan.clientId === "object" ? plan.clientId._id : plan.clientId
    );
    setNotes(plan.notes || "");
    setCaloriesTarget(plan.nutritionalTargets?.calories || 0);
    setCarbsTarget(plan.nutritionalTargets?.carbohydrates || 0);
    setFatsTarget(plan.nutritionalTargets?.fats || 0);
    setProteinsTarget(plan.nutritionalTargets?.proteins || 0);
    setIsActive(plan.isActive);

    // Map recommended dishes with full dish objects
    const mapped: RecommendedDishEntry[] = (plan.recommendedDishes || []).map(
      (rd) => {
        const dishIdStr =
          typeof rd.dishId === "object" ? rd.dishId._id : rd.dishId;
        const dishObj = dishes.find((d) => d._id === dishIdStr);
        return {
          dishId: dishIdStr,
          dish: dishObj || (typeof rd.dishId === "object" ? rd.dishId : undefined),
          mealType: rd.mealType,
          weekNumber: rd.weekNumber ?? 1,
          dayOfWeek: rd.dayOfWeek ?? 0,
        };
      }
    );
    setRecommendedDishes(mapped);
  };

  // Handle totalWeeks change — prune dishes from removed weeks
  const handleTotalWeeksChange = (value: number | string) => {
    const newVal = Math.max(1, Math.floor(typeof value === "number" ? value : 1));
    setTotalWeeks(newVal);
    setRecommendedDishes((prev) => prev.filter((rd) => rd.weekNumber <= newVal));
    if (activeWeek > newVal) setActiveWeek(newVal);
  };

  // Current day dishes (filtered by activeWeek + activeDay)
  const currentDayDishes = useMemo(
    () =>
      recommendedDishes.filter(
        (rd) => rd.weekNumber === activeWeek && rd.dayOfWeek === activeDay
      ),
    [recommendedDishes, activeWeek, activeDay]
  );

  // Dish count per day (for badges on SegmentedControl)
  const getDayDishCount = (week: number, day: number): number =>
    recommendedDishes.filter(
      (rd) => rd.weekNumber === week && rd.dayOfWeek === day
    ).length;

  // Dish picker
  const openDishPicker = (category: MealCategory) => {
    setPickerCategory(category);
    setPickerSearch("");
    setPickerOpen(true);
  };

  const filteredPickerDishes = dishes.filter((dish) => {
    if (dish.category !== pickerCategory) return false;
    if (pickerSearch.trim()) {
      const q = pickerSearch.toLowerCase();
      return (
        dish.name.toLowerCase().includes(q) ||
        dish.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const addDish = (dish: Dish) => {
    setRecommendedDishes((prev) => [
      ...prev,
      {
        dishId: dish._id,
        dish,
        mealType: pickerCategory,
        weekNumber: activeWeek,
        dayOfWeek: activeDay,
      },
    ]);
    setPickerOpen(false);
  };

  const removeDish = (globalIdx: number) => {
    setRecommendedDishes((prev) => prev.filter((_, i) => i !== globalIdx));
  };

  // Copy week handler
  const handleCopyWeek = () => {
    const src = Number(copySource);
    const tgt = Number(copyTarget);
    if (src === tgt) {
      notifications.show({ title: "Error", message: "Las semanas deben ser diferentes", color: "red" });
      return;
    }
    const sourceDishes = recommendedDishes.filter((rd) => rd.weekNumber === src);
    const filtered = recommendedDishes.filter((rd) => rd.weekNumber !== tgt);
    const copied = sourceDishes.map((rd) => ({ ...rd, weekNumber: tgt }));
    setRecommendedDishes([...filtered, ...copied]);
    setCopyWeekOpen(false);
    notifications.show({
      title: "Copiado",
      message: `Semana ${src} copiada a semana ${tgt}`,
      color: "green",
    });
  };

  // Nutritional totals for current day
  const dayTotals = useMemo(() => {
    return currentDayDishes.reduce(
      (acc, rd) => {
        const dish = rd.dish;
        if (dish?.nutritionalInfo) {
          acc.calories += dish.nutritionalInfo.calories || 0;
          acc.carbohydrates += dish.nutritionalInfo.carbohydrates || 0;
          acc.fats += dish.nutritionalInfo.fats || 0;
          acc.proteins += dish.nutritionalInfo.proteins || 0;
        }
        return acc;
      },
      { calories: 0, carbohydrates: 0, fats: 0, proteins: 0 }
    );
  }, [currentDayDishes]);

  const getProgressColor = (current: number, target: number): string => {
    if (target === 0) return "gray";
    const pct = (current / target) * 100;
    if (pct <= 80) return "blue";
    if (pct <= 100) return "green";
    return "red";
  };

  const getProgressPct = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // Save
  const handleSave = async () => {
    if (!name.trim()) {
      notifications.show({
        title: "Error",
        message: "El nombre del plan es obligatorio",
        color: "red",
      });
      return;
    }

    if (!clientId) {
      notifications.show({
        title: "Error",
        message: "Selecciona un cliente",
        color: "red",
      });
      return;
    }

    if (!organizationId) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        organizationId,
        clientId,
        totalWeeks,
        recommendedDishes: recommendedDishes.map((rd) => ({
          dishId: rd.dishId,
          mealType: rd.mealType,
          weekNumber: rd.weekNumber,
          dayOfWeek: rd.dayOfWeek,
        })),
        nutritionalTargets: {
          calories: caloriesTarget,
          carbohydrates: carbsTarget,
          fats: fatsTarget,
          proteins: proteinsTarget,
        },
        notes: notes.trim(),
        isActive,
      };

      if (isEdit && planId) {
        await updateNutritionPlan(planId, payload);
        notifications.show({
          title: "Éxito",
          message: "Plan nutricional actualizado",
          color: "green",
        });
      } else {
        await createNutritionPlan(payload);
        notifications.show({
          title: "Éxito",
          message: "Plan nutricional creado",
          color: "green",
        });
      }

      if (clientId) {
        navigate(`/admin/nutrition-plans/client/${clientId}`);
      } else {
        navigate("/admin/nutrition-plans");
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Error al guardar el plan",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              {isEdit ? "Editar Plan Nutricional" : "Nuevo Plan Nutricional"}
            </Title>
            <Text c="dimmed" size="sm">
              {isEdit
                ? "Modifica los datos del plan de alimentación"
                : "Crea un plan de alimentación para tu cliente"}
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/admin/nutrition-plans")}
            >
              Volver
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              {isEdit ? "Guardar cambios" : "Crear plan"}
            </Button>
          </Group>
        </Group>

        {/* Plan Info */}
        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Text fw={600}>Datos del plan</Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <TextInput
                label="Nombre del plan"
                placeholder="Ej: Plan mes enero - Definición"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                withAsterisk
              />
              <Select
                label="Cliente"
                placeholder="Selecciona un cliente"
                data={clients.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))}
                value={clientId}
                onChange={setClientId}
                searchable
                withAsterisk
              />
              <NumberInput
                label="Semanas del plan"
                value={totalWeeks}
                onChange={handleTotalWeeksChange}
                min={1}
                max={12}
              />
            </SimpleGrid>
            <Textarea
              label="Notas"
              placeholder="Indicaciones generales para el cliente..."
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              minRows={2}
              maxRows={4}
            />
          </Stack>
        </Paper>

        {/* Nutritional Targets */}
        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Text fw={600}>Metas nutricionales diarias</Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <NumberInput
                label="Calorías (kcal)"
                value={caloriesTarget}
                onChange={(v) =>
                  setCaloriesTarget(typeof v === "number" ? v : 0)
                }
                min={0}
              />
              <NumberInput
                label="Proteínas (g)"
                value={proteinsTarget}
                onChange={(v) =>
                  setProteinsTarget(typeof v === "number" ? v : 0)
                }
                min={0}
              />
              <NumberInput
                label="Carbohidratos (g)"
                value={carbsTarget}
                onChange={(v) =>
                  setCarbsTarget(typeof v === "number" ? v : 0)
                }
                min={0}
              />
              <NumberInput
                label="Grasas (g)"
                value={fatsTarget}
                onChange={(v) =>
                  setFatsTarget(typeof v === "number" ? v : 0)
                }
                min={0}
              />
            </SimpleGrid>

            {/* Progress bars — scoped to current day */}
            {(caloriesTarget > 0 ||
              proteinsTarget > 0 ||
              carbsTarget > 0 ||
              fatsTarget > 0) && (
              <>
                <Divider />
                <Text size="sm" fw={500}>
                  Totales del día ({DAY_LABELS[activeDay]}
                  {totalWeeks > 1 ? ` — Sem ${activeWeek}` : ""}) vs metas
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {caloriesTarget > 0 && (
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs">Calorías</Text>
                        <Text size="xs" fw={500}>
                          {dayTotals.calories} / {caloriesTarget} kcal
                        </Text>
                      </Group>
                      <Progress
                        value={getProgressPct(dayTotals.calories, caloriesTarget)}
                        color={getProgressColor(dayTotals.calories, caloriesTarget)}
                        size="sm"
                      />
                    </Box>
                  )}
                  {proteinsTarget > 0 && (
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs">Proteínas</Text>
                        <Text size="xs" fw={500}>
                          {dayTotals.proteins} / {proteinsTarget}g
                        </Text>
                      </Group>
                      <Progress
                        value={getProgressPct(dayTotals.proteins, proteinsTarget)}
                        color={getProgressColor(dayTotals.proteins, proteinsTarget)}
                        size="sm"
                      />
                    </Box>
                  )}
                  {carbsTarget > 0 && (
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs">Carbohidratos</Text>
                        <Text size="xs" fw={500}>
                          {dayTotals.carbohydrates} / {carbsTarget}g
                        </Text>
                      </Group>
                      <Progress
                        value={getProgressPct(dayTotals.carbohydrates, carbsTarget)}
                        color={getProgressColor(dayTotals.carbohydrates, carbsTarget)}
                        size="sm"
                      />
                    </Box>
                  )}
                  {fatsTarget > 0 && (
                    <Box>
                      <Group justify="space-between" mb={4}>
                        <Text size="xs">Grasas</Text>
                        <Text size="xs" fw={500}>
                          {dayTotals.fats} / {fatsTarget}g
                        </Text>
                      </Group>
                      <Progress
                        value={getProgressPct(dayTotals.fats, fatsTarget)}
                        color={getProgressColor(dayTotals.fats, fatsTarget)}
                        size="sm"
                      />
                    </Box>
                  )}
                </SimpleGrid>
              </>
            )}
          </Stack>
        </Paper>

        {/* Recommended Dishes — with Week + Day navigation */}
        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Platos recomendados</Text>
              {totalWeeks > 1 && (
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconCopy size={14} />}
                  onClick={() => setCopyWeekOpen(true)}
                >
                  Copiar semana
                </Button>
              )}
            </Group>

            {/* Week tabs — only if totalWeeks > 1 */}
            {totalWeeks > 1 && (
              <Tabs
                value={activeWeek.toString()}
                onChange={(v) => setActiveWeek(Number(v))}
              >
                <Tabs.List>
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(
                    (w) => {
                      const weekDishCount = recommendedDishes.filter(
                        (rd) => rd.weekNumber === w
                      ).length;
                      return (
                        <Tabs.Tab key={w} value={w.toString()}>
                          <Group gap={4} wrap="nowrap">
                            <span>Sem {w}</span>
                            {weekDishCount > 0 && (
                              <Badge size="xs" variant="filled" circle>
                                {weekDishCount}
                              </Badge>
                            )}
                          </Group>
                        </Tabs.Tab>
                      );
                    }
                  )}
                </Tabs.List>
              </Tabs>
            )}

            {/* Day segmented control */}
            <SegmentedControl
              value={activeDay.toString()}
              onChange={(v) => setActiveDay(Number(v))}
              data={DAY_LABELS.map((label, idx) => {
                const count = getDayDishCount(activeWeek, idx);
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

            {/* Meal categories for current week+day */}
            {MEAL_CATEGORIES.map((category) => {
              const categoryDishes = currentDayDishes.filter(
                (rd) => rd.mealType === category.value
              );

              return (
                <Box key={category.value}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge variant="light" color={getCategoryColor(category.value)}>
                        {category.label}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {categoryDishes.length} plato
                        {categoryDishes.length !== 1 ? "s" : ""}
                      </Text>
                    </Group>
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        openDishPicker(category.value as MealCategory)
                      }
                    >
                      Agregar
                    </Button>
                  </Group>

                  {categoryDishes.length > 0 ? (
                    <Stack gap={4}>
                      {categoryDishes.map((rd) => {
                        const globalIdx = recommendedDishes.indexOf(rd);
                        return (
                          <Card key={globalIdx} withBorder p="xs" radius="sm">
                            <Group justify="space-between" wrap="nowrap">
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text size="sm" fw={500} truncate>
                                  {rd.dish?.name || rd.dishId}
                                </Text>
                                {rd.dish?.nutritionalInfo && (
                                  <Group gap={4} mt={2}>
                                    <Badge variant="dot" size="xs" color="red">
                                      {rd.dish.nutritionalInfo.calories} kcal
                                    </Badge>
                                    <Badge variant="dot" size="xs" color="blue">
                                      P: {rd.dish.nutritionalInfo.proteins}g
                                    </Badge>
                                    <Badge variant="dot" size="xs" color="green">
                                      C: {rd.dish.nutritionalInfo.carbohydrates}g
                                    </Badge>
                                    <Badge variant="dot" size="xs" color="yellow">
                                      G: {rd.dish.nutritionalInfo.fats}g
                                    </Badge>
                                  </Group>
                                )}
                              </Box>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => removeDish(globalIdx)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Card>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Text size="xs" c="dimmed" fs="italic">
                      Sin platos asignados
                    </Text>
                  )}

                  <Divider mt="sm" />
                </Box>
              );
            })}
          </Stack>
        </Paper>

        {/* Bottom save button */}
        <Group justify="flex-end">
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
            loading={saving}
            size="md"
          >
            {isEdit ? "Guardar cambios" : "Crear plan"}
          </Button>
        </Group>
      </Stack>

      {/* Dish Picker Modal */}
      <Modal
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={`Agregar plato - ${MEAL_CATEGORIES.find((c) => c.value === pickerCategory)?.label}`}
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            placeholder="Buscar plato..."
            leftSection={<IconSearch size={16} />}
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.currentTarget.value)}
          />

          <ScrollArea.Autosize mah={400}>
            {filteredPickerDishes.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="sm">
                  <ThemeIcon size={40} radius="xl" variant="light" color="gray">
                    <IconSalad size={20} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    No hay platos en esta categoría
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="xs">
                {filteredPickerDishes.map((dish) => (
                  <Card
                    key={dish._id}
                    withBorder
                    p="sm"
                    radius="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => addDish(dish)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={500}>
                          {dish.name}
                        </Text>
                        {dish.ingredients.length > 0 && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {dish.ingredients.join(", ")}
                          </Text>
                        )}
                        <Group gap={4} mt={4}>
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
                      </Box>
                      <IconPlus size={16} color="gray" />
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea.Autosize>
        </Stack>
      </Modal>

      {/* Copy Week Modal */}
      <Modal
        opened={copyWeekOpen}
        onClose={() => setCopyWeekOpen(false)}
        title="Copiar semana"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Copia todos los platos de una semana a otra. Los platos existentes en
            la semana destino serán reemplazados.
          </Text>
          <Select
            label="Semana origen"
            data={Array.from({ length: totalWeeks }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Semana ${i + 1}`,
            }))}
            value={copySource}
            onChange={(v) => v && setCopySource(v)}
          />
          <Select
            label="Semana destino"
            data={Array.from({ length: totalWeeks }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Semana ${i + 1}`,
            }))}
            value={copyTarget}
            onChange={(v) => v && setCopyTarget(v)}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCopyWeekOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCopyWeek} leftSection={<IconCopy size={14} />}>
              Copiar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

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

export default NutritionPlanBuilder;
