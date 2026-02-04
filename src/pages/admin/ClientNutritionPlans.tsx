import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Button,
  Group,
  ActionIcon,
  Stack,
  Paper,
  Badge,
  Text,
  Menu,
  Card,
  Avatar,
  ScrollArea,
  ThemeIcon,
  Loader,
  Center,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconArrowLeft,
  IconSalad,
} from "@tabler/icons-react";
import {
  getNutritionPlansByClientId,
  deleteNutritionPlan,
  type NutritionPlan,
} from "../../services/nutritionPlanService";
import { getClientById, type Client } from "../../services/clientService";
import { MEAL_CATEGORIES, type Dish } from "../../services/dishService";

const ClientNutritionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadClient();
      loadClientPlans();
    }
  }, [clientId, organizationId]);

  const loadClient = async () => {
    if (!clientId) return;
    setLoadingClient(true);
    const data = await getClientById(clientId);
    setClient(data || null);
    setLoadingClient(false);
  };

  const loadClientPlans = async () => {
    if (!clientId) return;
    setLoadingPlans(true);
    const data = await getNutritionPlansByClientId(clientId, organizationId);
    setPlans(data);
    setLoadingPlans(false);
  };

  const handleDelete = async (planId: string) => {
    if (confirm("¿Estás seguro de eliminar este plan nutricional?")) {
      await deleteNutritionPlan(planId);
      setPlans(plans.filter((p) => p._id !== planId));
      notifications.show({
        title: "Éxito",
        message: "Plan nutricional eliminado exitosamente",
        color: "green",
      });
    }
  };

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDishName = (dish: string | Dish): string => {
    return typeof dish === "object" ? dish.name : dish;
  };

  const renderPlanCard = (plan: NutritionPlan) => {
    const dishCount = plan.recommendedDishes?.length || 0;
    const planTotalWeeks = (plan as any).totalWeeks ?? 1;
    const configuredDays = new Set(
      plan.recommendedDishes?.map(
        (rd) => `${(rd as any).weekNumber ?? 1}-${(rd as any).dayOfWeek ?? 0}`
      ) || []
    ).size;
    const totalCalories = plan.recommendedDishes?.reduce((sum, rd) => {
      if (typeof rd.dishId === "object") {
        return sum + (rd.dishId.nutritionalInfo?.calories || 0);
      }
      return sum;
    }, 0) || 0;

    // Group recommended dishes by mealType
    const groupedDishes = MEAL_CATEGORIES.map((cat) => ({
      ...cat,
      dishes: plan.recommendedDishes?.filter((rd) => rd.mealType === cat.value) || [],
    })).filter((g) => g.dishes.length > 0);

    return (
      <Card key={plan._id} shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <Text fw={600} size="sm">
              {plan.name}
            </Text>
            <Badge
              size="xs"
              color={plan.isActive ? "teal" : "gray"}
              variant={plan.isActive ? "filled" : "light"}
            >
              {plan.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </Group>
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() =>
                  navigate(`/admin/nutrition-plans/edit/${plan._id}`)
                }
              >
                Editar
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(plan._id)}
              >
                Eliminar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Summary stats */}
        <Group gap="xs" mb="sm">
          <Badge variant="outline" size="xs" color="violet">
            {planTotalWeeks === 1
              ? "1 semana"
              : `${planTotalWeeks} semanas`}
          </Badge>
          {configuredDays > 0 && (
            <Badge variant="outline" size="xs" color="indigo">
              {configuredDays} día{configuredDays !== 1 ? "s" : ""} configurado{configuredDays !== 1 ? "s" : ""}
            </Badge>
          )}
          <Badge variant="outline" size="xs" color="orange">
            {dishCount} platos
          </Badge>
          {totalCalories > 0 && (
            <Badge variant="outline" size="xs" color="red">
              {totalCalories} kcal
            </Badge>
          )}
          {plan.nutritionalTargets?.calories > 0 && (
            <Badge variant="outline" size="xs" color="blue">
              Meta: {plan.nutritionalTargets.calories} kcal
            </Badge>
          )}
        </Group>

        {/* Grouped dishes preview */}
        {groupedDishes.length > 0 && (
          <Stack gap={4}>
            {groupedDishes.slice(0, 3).map((group) => (
              <Group key={group.value} gap={4}>
                <Text size="xs" fw={500} c="dimmed" w={80}>
                  {group.label}:
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                  {group.dishes
                    .map((rd) => getDishName(rd.dishId))
                    .join(", ")}
                </Text>
              </Group>
            ))}
            {groupedDishes.length > 3 && (
              <Text size="xs" c="dimmed" fs="italic">
                +{groupedDishes.length - 3} categorías más
              </Text>
            )}
          </Stack>
        )}

        {plan.notes && (
          <Text size="xs" c="dimmed" mt="sm" lineClamp={2}>
            {plan.notes}
          </Text>
        )}
      </Card>
    );
  };

  if (loadingClient) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!client) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Text c="dimmed">Cliente no encontrado</Text>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/admin/nutrition-plans")}
            >
              Volver a clientes
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Separate active and inactive plans
  const activePlans = plans.filter((p) => p.isActive);
  const inactivePlans = plans.filter((p) => !p.isActive);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor
            onClick={() => navigate("/admin/nutrition-plans")}
            size="sm"
          >
            Clientes
          </Anchor>
          <Text size="sm">{client.name}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Paper shadow="sm" p="md">
          <Group justify="space-between">
            <Group gap="md">
              <Avatar size="lg" radius="xl" color="teal">
                {getClientInitials(client.name)}
              </Avatar>
              <div>
                <Title order={3}>{client.name}</Title>
                <Text size="sm" c="dimmed">
                  {client.phoneNumber || client.email || "Sin contacto"}
                </Text>
              </div>
            </Group>
            <Group>
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate("/admin/nutrition-plans")}
              >
                Volver
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  navigate(
                    `/admin/nutrition-plans/new?clientId=${client._id}`
                  )
                }
              >
                Nuevo Plan
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Plans */}
        <Text fw={500}>Planes Nutricionales</Text>

        <Paper shadow="sm" p="md" mih={300}>
          {loadingPlans ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : plans.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                  <IconSalad size={30} />
                </ThemeIcon>
                <Text c="dimmed" ta="center">
                  Este cliente no tiene planes nutricionales
                </Text>
                <Button
                  size="sm"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={() =>
                    navigate(
                      `/admin/nutrition-plans/new?clientId=${client._id}`
                    )
                  }
                >
                  Crear nuevo plan
                </Button>
              </Stack>
            </Center>
          ) : (
            <ScrollArea>
              <Stack gap="lg">
                {activePlans.length > 0 && (
                  <Stack gap="sm">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="teal" variant="light">
                        <IconSalad size={12} />
                      </ThemeIcon>
                      <Text fw={600} size="sm">
                        Activos
                      </Text>
                      <Badge size="sm" variant="light" color="gray">
                        {activePlans.length}
                      </Badge>
                    </Group>
                    <Stack gap="sm">
                      {activePlans.map(renderPlanCard)}
                    </Stack>
                  </Stack>
                )}

                {inactivePlans.length > 0 && (
                  <Stack gap="sm">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="gray" variant="light">
                        <IconSalad size={12} />
                      </ThemeIcon>
                      <Text fw={600} size="sm">
                        Inactivos
                      </Text>
                      <Badge size="sm" variant="light" color="gray">
                        {inactivePlans.length}
                      </Badge>
                    </Group>
                    <Stack gap="sm">
                      {inactivePlans.map(renderPlanCard)}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </ScrollArea>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default ClientNutritionPlans;
