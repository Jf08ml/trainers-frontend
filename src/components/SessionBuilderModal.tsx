import React from "react";
import { Modal } from "@mantine/core";
import SessionForm from "./SessionForm";

interface SessionBuilderModalProps {
  opened: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: string, sessionName: string) => void;
  sessionId?: string;
}

const SessionBuilderModal: React.FC<SessionBuilderModalProps> = ({
  opened,
  onClose,
  onSessionCreated,
  sessionId,
}) => {
  const isEditing = !!sessionId;

  const handleSave = (savedSessionId: string, sessionName: string) => {
    onSessionCreated(savedSessionId, sessionName);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Editar Sesión" : "Crear Sesión Personalizada"}
      size="xl"
      centered
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <SessionForm
        sessionId={sessionId}
        onSave={handleSave}
        onCancel={onClose}
        showCancelButton={true}
        cancelButtonLabel="Cancelar"
        saveButtonLabel={isEditing ? "Guardar Cambios" : "Crear Sesión"}
      />
    </Modal>
  );
};

export default SessionBuilderModal;
