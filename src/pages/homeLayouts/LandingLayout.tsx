import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Card,
  Box,
  SimpleGrid,
  useMantineTheme,
  rem,
  Stack,
  Badge,
  Grid,
  Group,
  Button,
  Divider,
} from "@mantine/core";
import { ReactNode, useEffect, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { useSelector } from "react-redux";
import { selectOrganization } from "../../features/organization/sliceOrganization";

interface Feature {
  title: string;
  icon: ReactNode;
  link: string;
  show?: boolean;
}

interface LandingLayoutProps {
  features: Feature[];
  welcomeTitle: string;
  welcomeDescription: string;
  organizationId?: string;
}

export function LandingLayout({
  features,
  welcomeTitle,
  welcomeDescription,
  organizationId,
}: LandingLayoutProps) {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const org = useSelector(selectOrganization);

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: theme.white,
      }}
    >
      {/* Hero Section */}
      <Box
        style={{
          background: `linear-gradient(135deg, ${theme.colors[theme.primaryColor][6]} 0%, ${theme.colors[theme.primaryColor][8]} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            filter: "blur(100px)",
          }}
        />

        <Container size="lg" py={{ base: 60, sm: 80, md: 100 }}>
          <Stack gap="xl" align="center" style={{ position: "relative", zIndex: 1 }}>
            <Title
              ta="center"
              fw={900}
              c="white"
              fz={{ base: rem(32), sm: rem(42), md: rem(52) }}
              style={{
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.2)",
                lineHeight: 1.2,
              }}
            >
              {welcomeTitle}
            </Title>

            <Text
              ta="center"
              c="white"
              fz={{ base: "md", sm: "lg", md: "xl" }}
              fw={500}
              maw={700}
              style={{
                lineHeight: 1.6,
                textShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
                opacity: 0.95,
              }}
            >
              {welcomeDescription}
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Servicios Destacados */}
      <Container size="lg" py={{ base: 60, sm: 80 }}>
        <Stack gap="xl">
          <div>
            <Title
              ta="center"
              fw={800}
              c={theme.colors.gray[9]}
              fz={{ base: rem(28), sm: rem(36) }}
              mb="xs"
            >
              Nuestros Servicios
            </Title>
            <Text
              ta="center"
              c={theme.colors.gray[6]}
              fz={{ base: "md", sm: "lg" }}
              maw={600}
              mx="auto"
            >
              Descubre lo que tenemos para ti
            </Text>
          </div>

          <Group justify="center" mt="lg">
            <Button
              component={Link}
              to="/servicios-precios"
              size="lg"
              variant="outline"
              color={theme.primaryColor}
              radius="xl"
            >
              Ver Todos los Servicios
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Acciones Rápidas */}
      <Box bg={theme.colors.gray[0]} py={{ base: 60, sm: 80 }}>
        <Container size="lg">
          <Stack gap="xl">
            <Title
              ta="center"
              fw={800}
              c={theme.colors.gray[9]}
              fz={{ base: rem(28), sm: rem(36) }}
            >
              ¿Qué deseas hacer?
            </Title>

            <SimpleGrid
              cols={{
                base: 1,
                sm: 2,
                md: features.length >= 3 ? 3 : 2,
              }}
              spacing="lg"
            >
              {features.map((f) => (
                <Card
                  key={f.link}
                  component={Link}
                  to={f.link}
                  withBorder
                  radius="lg"
                  p="xl"
                  shadow="sm"
                  style={{
                    transition: "all 200ms ease",
                    backgroundColor: theme.white,
                    borderColor: theme.colors.gray[3],
                  }}
                  className="action-card"
                >
                  <Stack align="center" gap="md">
                    <Box
                      style={{
                        width: rem(80),
                        height: rem(80),
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors[theme.primaryColor][6],
                        color: theme.white,
                        boxShadow: `0 4px 20px ${primary}40`,
                      }}
                    >
                      {f.icon}
                    </Box>

                    <Text size="xl" fw={700} c={theme.colors.gray[9]} ta="center">
                      {f.title}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      <style>
        {`
          @media (prefers-reduced-motion: no-preference) {
            .service-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
            }
            .action-card:hover {
              transform: translateY(-8px);
              box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12) !important;
            }
            .action-card:focus-visible {
              transform: translateY(-8px);
              box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12) !important;
              outline: 2px solid ${primary};
              outline-offset: 2px;
            }
          }
        `}
      </style>
    </Box>
  );
}
