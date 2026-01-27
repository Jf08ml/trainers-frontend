import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
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
import {
  IconUsers,
  IconPackage,
  IconBriefcase,
  IconMessageCircle,
  IconChartBar,
  IconCreditCard,
  IconSettings,
  IconBarbell,
  IconRun,
} from "@tabler/icons-react";

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { userName } = useSelector((state: RootState) => state.auth);
  const organization = useSelector(
    (state: RootState) => state.organization.organization
  );

  const quickAccessCards = [
    {
      title: "Gestionar Clientes",
      description: "Ver y editar información de clientes",
      icon: IconUsers,
      color: "green",
      path: "/admin/gestionar-clientes",
    },
    {
      title: "Gestionar Servicios",
      description: "Configurar servicios y precios",
      icon: IconPackage,
      color: "orange",
      path: "/admin/gestionar-servicios",
    },
    {
      title: "Gestionar Empleados",
      description: "Administrar equipo de trabajo",
      icon: IconBriefcase,
      color: "violet",
      path: "/admin/gestionar-empleados",
    },
    {
      title: "WhatsApp",
      description: "Gestionar mensajería automática",
      icon: IconMessageCircle,
      color: "teal",
      path: "/admin/gestionar-whatsapp",
    },
    {
      title: "Planes Semanales",
      description: "Planes de entrenamiento por cliente",
      icon: IconRun,
      color: "cyan",
      path: "/admin/weekly-plans",
    },
    {
      title: "Sesiones de Entrenamiento",
      description: "Crear y gestionar sesiones",
      icon: IconBarbell,
      color: "blue",
      path: "/admin/training-sessions",
    },
    {
      title: "Catálogos de Entrenamiento",
      description: "Grupos musculares, equipamiento",
      icon: IconBarbell,
      color: "grape",
      path: "/admin/training-catalogs",
    },
    {
      title: "Analíticas",
      description: "Ver estadísticas del negocio",
      icon: IconChartBar,
      color: "indigo",
      path: "/admin/analytics-dashboard",
    },
    {
      title: "Mi Membresía",
      description: "Plan y facturación",
      icon: IconCreditCard,
      color: "pink",
      path: "/admin/my-membership",
    },
    {
      title: "Configuración",
      description: "Información del negocio",
      icon: IconSettings,
      color: "gray",
      path: "/admin/informacion-negocio",
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Bienvenida */}
        <div>
          <Title order={1} mb="xs">
            ¡Bienvenido, {userName || "Administrador"}! 👋
          </Title>
          <Text size="lg" c="dimmed">
            Panel de administración de {organization?.name || "tu negocio"}
          </Text>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div>
          <Title order={2} size="h3" mb="md">
            ¿Qué deseas hacer?
          </Title>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
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

export default DashboardAdmin;
