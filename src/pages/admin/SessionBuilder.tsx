import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Title, Group, Button } from "@mantine/core";
import SessionForm from "../../components/SessionForm";

const SessionBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const handleSave = () => {
    navigate("/admin/training-sessions");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>
          {isEditing ? "Editar Sesión" : "Nueva Sesión"}
        </Title>
        <Button variant="subtle" onClick={handleCancel}>
          Cancelar
        </Button>
      </Group>

      <SessionForm
        sessionId={id}
        onSave={handleSave}
        onCancel={handleCancel}
        showCancelButton={false}
        saveButtonLabel="Guardar Sesión"
      />
    </Container>
  );
};

export default SessionBuilder;
