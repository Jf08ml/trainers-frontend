import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Card,
  Avatar,
  SimpleGrid,
  ThemeIcon,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconUsers,
  IconChevronRight,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { getWeeklyPlansByOrganizationId, type WeeklyPlan } from "../../services/weeklyPlanService";
import { getClientsByOrganizationId, type Client } from "../../services/clientService";

interface ClientWithPlans extends Client {
  plansCount: number;
  activePlansCount: number;
  hasCurrentPlan: boolean;
}

const WeeklyPlans: React.FC = () => {
  const navigate = useNavigate();
  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  // Clients state
  const [clientsWithPlans, setClientsWithPlans] = useState<ClientWithPlans[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithPlans[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Load clients and plans on mount
  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  // Filter clients when search changes
  useEffect(() => {
    if (clientSearch.trim() === "") {
      setFilteredClients(clientsWithPlans);
    } else {
      const query = clientSearch.toLowerCase();
      setFilteredClients(
        clientsWithPlans.filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.phoneNumber?.includes(query) ||
            client.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [clientSearch, clientsWithPlans]);

  const loadData = async () => {
    if (!organizationId) return;
    setLoading(true);

    const [clients, plans] = await Promise.all([
      getClientsByOrganizationId(organizationId),
      getWeeklyPlansByOrganizationId(organizationId),
    ]);

    // Create a map of client plans
    const clientPlansMap = new Map<string, WeeklyPlan[]>();
    plans.forEach((plan) => {
      const clientId = typeof plan.clientId === "object" ? plan.clientId._id : plan.clientId;
      if (!clientPlansMap.has(clientId)) {
        clientPlansMap.set(clientId, []);
      }
      clientPlansMap.get(clientId)!.push(plan);
    });

    // Enrich clients with plan info
    const enrichedClients: ClientWithPlans[] = clients.map((client) => {
      const clientPlans = clientPlansMap.get(client._id) || [];
      const now = new Date();

      const activePlans = clientPlans.filter((p) => p.isActive);
      const hasCurrentPlan = clientPlans.some((p) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        return p.isActive && now >= start && now <= end;
      });

      return {
        ...client,
        plansCount: clientPlans.length,
        activePlansCount: activePlans.length,
        hasCurrentPlan,
      };
    });

    // Sort: clients with current plans first, then by name
    enrichedClients.sort((a, b) => {
      if (a.hasCurrentPlan && !b.hasCurrentPlan) return -1;
      if (!a.hasCurrentPlan && b.hasCurrentPlan) return 1;
      if (a.activePlansCount !== b.activePlansCount) return b.activePlansCount - a.activePlansCount;
      return a.name.localeCompare(b.name);
    });

    setClientsWithPlans(enrichedClients);
    setFilteredClients(enrichedClients);
    setLoading(false);
  };

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/admin/weekly-plans/client/${clientId}`);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Planes Semanales</Title>
            <Text c="dimmed" size="sm">
              Selecciona un cliente para gestionar sus planes de entrenamiento
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/admin/weekly-plans/new")}
          >
            Nuevo Plan
          </Button>
        </Group>

        {/* Search */}
        <Paper shadow="sm" p="md">
          <Stack gap="md">
            <Group gap="xs">
              <IconUsers size={18} />
              <Text fw={600}>Clientes</Text>
              <Badge size="sm" variant="light">
                {clientsWithPlans.length}
              </Badge>
            </Group>

            <TextInput
              placeholder="Buscar cliente por nombre, teléfono o email..."
              leftSection={<IconSearch size={16} />}
              value={clientSearch}
              onChange={(e) => setClientSearch(e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        {/* Clients grid */}
        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : filteredClients.length === 0 ? (
          <Paper shadow="sm" p="xl">
            <Center>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                  <IconUsers size={30} />
                </ThemeIcon>
                <Text c="dimmed" ta="center">
                  {clientSearch
                    ? "No se encontraron clientes con esa búsqueda"
                    : "No hay clientes registrados"}
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {filteredClients.map((client) => (
              <Card
                key={client._id}
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{ cursor: "pointer" }}
                onClick={() => handleClientClick(client._id)}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                      size="md"
                      radius="xl"
                      color={client.hasCurrentPlan ? "blue" : "gray"}
                    >
                      {getClientInitials(client.name)}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={500} truncate>
                        {client.name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {client.phoneNumber || client.email || "Sin contacto"}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    {client.hasCurrentPlan ? (
                      <Badge size="sm" color="blue" variant="light">
                        Activo
                      </Badge>
                    ) : client.plansCount > 0 ? (
                      <Badge size="sm" color="gray" variant="light">
                        {client.plansCount} plan{client.plansCount !== 1 ? "es" : ""}
                      </Badge>
                    ) : (
                      <ThemeIcon size="sm" variant="light" color="gray">
                        <IconCalendarEvent size={12} />
                      </ThemeIcon>
                    )}
                    <IconChevronRight size={16} color="gray" />
                  </Group>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};

export default WeeklyPlans;
