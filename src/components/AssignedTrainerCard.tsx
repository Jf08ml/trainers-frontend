import { useEffect, useState } from "react";
import {
  Card,
  Group,
  Avatar,
  Text,
  Stack,
  Button,
  Skeleton,
  ThemeIcon,
} from "@mantine/core";
import { IconUser, IconMail, IconPhone } from "@tabler/icons-react";
import { FaWhatsapp } from "react-icons/fa";
import { getAssignedTrainer, AssignedTrainer } from "../services/clientService";

interface AssignedTrainerCardProps {
  clientId: string;
}

const AssignedTrainerCard = ({ clientId }: AssignedTrainerCardProps) => {
  const [trainer, setTrainer] = useState<AssignedTrainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainer = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const data = await getAssignedTrainer(clientId);
        setTrainer(data);
      } catch (error) {
        console.error("Error loading trainer:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTrainer();
  }, [clientId]);

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Group>
          <Skeleton circle height={50} />
          <Stack gap={4} style={{ flex: 1 }}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="40%" />
          </Stack>
        </Group>
      </Card>
    );
  }

  if (!trainer) {
    return (
      <Card withBorder radius="md" p="lg">
        <Group>
          <ThemeIcon size={50} radius="xl" variant="light" color="gray">
            <IconUser size={24} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={600} c="dimmed">
              Sin entrenador asignado
            </Text>
            <Text size="sm" c="dimmed">
              Contacta con tu centro para que te asignen un entrenador
            </Text>
          </Stack>
        </Group>
      </Card>
    );
  }

  // Generar link de WhatsApp
  const whatsappNumber = trainer.phone_e164?.replace("+", "") || trainer.phoneNumber?.replace(/\D/g, "");
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group>
          <Avatar
            src={trainer.profilePhoto}
            size={60}
            radius="xl"
            color="blue"
          >
            {trainer.names?.charAt(0).toUpperCase()}
          </Avatar>
          <Stack gap={2} style={{ flex: 1 }}>
            <Text fw={700} size="lg">
              {trainer.names}
            </Text>
            <Text size="sm" c="dimmed">
              Tu entrenador personal
            </Text>
          </Stack>
        </Group>

        <Stack gap="xs">
          {trainer.email && (
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="gray">
                <IconMail size={14} />
              </ThemeIcon>
              <Text size="sm">{trainer.email}</Text>
            </Group>
          )}
          {trainer.phoneNumber && (
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="gray">
                <IconPhone size={14} />
              </ThemeIcon>
              <Text size="sm">{trainer.phone_e164 || trainer.phoneNumber}</Text>
            </Group>
          )}
        </Stack>

        {whatsappLink && (
          <Button
            component="a"
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<FaWhatsapp size={18} />}
            color="green"
            variant="filled"
            fullWidth
          >
            Contactar por WhatsApp
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default AssignedTrainerCard;
