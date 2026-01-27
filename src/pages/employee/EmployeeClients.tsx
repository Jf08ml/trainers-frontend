import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Avatar,
  Stack,
  Button,
  Skeleton,
  TextInput,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { IconSearch, IconBarbell, IconCalendar } from "@tabler/icons-react";
import { FaWhatsapp } from "react-icons/fa";
import { getClientsByAssignedEmployee, Client } from "../../services/clientService";
import { useDebouncedValue } from "@mantine/hooks";

const EmployeeClients = () => {
  const navigate = useNavigate();
  const { userId } = useSelector((state: RootState) => state.auth);
  const organizationId = useSelector(
    (state: RootState) => state.auth.organizationId
  );

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced] = useDebouncedValue(searchTerm, 250);

  useEffect(() => {
    const loadClients = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getClientsByAssignedEmployee(userId, organizationId || undefined);
        setClients(data);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, [userId, organizationId]);

  const filteredClients = clients.filter((c) => {
    const q = debounced.toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phoneNumber?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const getWhatsAppLink = (client: Client) => {
    const phone = client.phone_e164?.replace("+", "") || client.phoneNumber?.replace(/\D/g, "");
    return phone ? `https://wa.me/${phone}` : null;
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Skeleton height={40} width="50%" />
          <Skeleton height={50} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={180} radius="md" />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Mis Clientes
          </Title>
          <Text c="dimmed">
            Gestiona los planes de entrenamiento de tus clientes asignados
          </Text>
        </div>

        <Group justify="space-between" align="center">
          <TextInput
            leftSection={<IconSearch size={18} />}
            placeholder="Buscar por nombre, tel o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 400 }}
          />
          <Badge variant="light" size="lg">
            {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""}
          </Badge>
        </Group>

        {filteredClients.length === 0 ? (
          <Card withBorder radius="md" p="xl" ta="center">
            <Text c="dimmed" size="lg">
              {clients.length === 0
                ? "No tienes clientes asignados todavia"
                : "No se encontraron clientes con ese filtro"}
            </Text>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {filteredClients.map((client) => {
              const waLink = getWhatsAppLink(client);
              return (
                <Card key={client._id} withBorder radius="md" p="lg">
                  <Stack gap="md">
                    <Group>
                      <Avatar size={50} radius="xl" color="blue">
                        {client.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text fw={600} lineClamp={1}>
                          {client.name}
                        </Text>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {client.phone_e164 || client.phoneNumber}
                        </Text>
                      </div>
                    </Group>

                    <Stack gap="xs">
                      <Button
                        leftSection={<IconBarbell size={18} />}
                        variant="light"
                        onClick={() =>
                          navigate(`/employee/mis-clientes/${client._id}/planes`)
                        }
                        fullWidth
                      >
                        Ver Planes
                      </Button>

                      <Group gap="xs" grow>
                        {waLink && (
                          <Button
                            component="a"
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftSection={<FaWhatsapp size={16} />}
                            variant="outline"
                            color="green"
                            size="sm"
                          >
                            WhatsApp
                          </Button>
                        )}
                        <Button
                          leftSection={<IconCalendar size={16} />}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/employee/mis-clientes/${client._id}/planes/nuevo`)
                          }
                        >
                          Nuevo Plan
                        </Button>
                      </Group>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};

export default EmployeeClients;
