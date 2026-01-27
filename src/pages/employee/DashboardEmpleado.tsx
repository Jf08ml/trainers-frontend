import React from "react";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Stack,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  IconHome,
  IconUser,
} from "@tabler/icons-react";

const DashboardEmpleado: React.FC = () => {
  const navigate = useNavigate();
  const { userName } = useSelector((state: RootState) => state.auth);
  const organization = useSelector(
    (state: RootState) => state.organization.organization
  );

  const quickAccessCards = [
    {
      title: "Mi Perfil",
      description: "Ver y editar mi información",
      icon: IconUser,
      color: "blue",
      path: "/informacion-empleado",
    },
    {
      title: "Inicio",
      description: "Volver a la página principal",
      icon: IconHome,
      color: "orange",
      path: "/",
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Bienvenida */}
        <div>
          <Title order={1} mb="xs">
            ¡Bienvenido, {userName || "Empleado"}! 👋
          </Title>
          <Text size="lg" c="dimmed">
            Panel de empleado de {organization?.name || "tu negocio"}
          </Text>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div>
          <Title order={2} size="h3" mb="md">
            ¿Qué deseas hacer?
          </Title>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
          >
            {quickAccessCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.path}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onClick={() => navigate(card.path)}
                >
                  <Group>
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      variant="light"
                      color={card.color}
                    >
                      <Icon size={24} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="sm">
                        {card.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {card.description}
                      </Text>
                    </div>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </div>
      </Stack>
    </Container>
  );
};

export default DashboardEmpleado;

