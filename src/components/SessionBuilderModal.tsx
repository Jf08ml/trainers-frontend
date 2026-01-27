import React from "react";
import { Modal } from "@mantine/core";
import SessionForm from "./SessionForm";

interface SessionBuilderModalProps {
  opened: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: string, sessionName: string) => void;
}

const SessionBuilderModal: React.FC<SessionBuilderModalProps> = ({
  opened,
  onClose,
  onSessionCreated,
}) => {
  const handleSave = (sessionId: string, sessionName: string) => {
    onSessionCreated(sessionId, sessionName);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Crear Sesión Personalizada"
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
        onSave={handleSave}
        onCancel={onClose}
        showCancelButton={true}
        cancelButtonLabel="Cancelar"
        saveButtonLabel="Crear Sesión"
      />
    </Modal>
  );
};

export default SessionBuilderModal;
