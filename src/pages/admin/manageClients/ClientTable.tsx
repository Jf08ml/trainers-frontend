import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  Table,
  Select,
  Group,
  Pagination,
  ScrollArea,
  Alert,
  Card,
  Avatar,
  Stack,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { useMediaQuery } from "@mantine/hooks";
import { Client as ClientType } from "../../../services/clientService";
import ClientRow from "./ClientRow";

interface ClientTableProps {
  clients: ClientType[];
  handleDeleteClient: (id: string) => void;
  handleEditClient: (client: ClientType) => void;
  handleViewForms: (client: ClientType) => void;
  error: string | null;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  handleDeleteClient,
  handleEditClient,
  handleViewForms,
  error,
}) => {
  const isMobile = useMediaQuery("(max-width: 48rem)");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(clients.length / pageSize);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, clients.length);

  const displayedClients = useMemo(
    () => clients.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [clients, currentPage, pageSize]
  );

  const confirmAction = (
    action: () => void,
    title: string,
    message: string,
    actionType: "register" | "refer" | "delete"
  ) => {
    openConfirmModal({
      title,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: "Confirmar", cancel: "Cancelar" },
      confirmProps: { color: actionType === "delete" ? "red" : "green" },
      onConfirm: action,
      centered: true,
    });
  };

  return (
    <Box>
      {error && (
        <Alert color="red" mb="sm" title="Error">
          {error}
        </Alert>
      )}

      {/* Top controls (pager) */}
      <Group justify="space-between" align="center" mb="xs" wrap="wrap">
        <Text size="sm" c="dimmed">
          Mostrando {clients.length === 0 ? 0 : from}–{to} de {clients.length}
        </Text>
        <Group gap="xs" align="center">
          <Select
            placeholder="Seleccione"
            data={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
            value={pageSize.toString()}
            onChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
            w={120}
          />
          <Pagination
            total={Math.max(totalPages, 1)}
            value={currentPage}
            onChange={setCurrentPage}
          />
        </Group>
      </Group>

      {/* Desktop: Tabla / Mobile: Cards */}
      {!isMobile ? (
        <ScrollArea.Autosize mah={560}>
          <Table
            withTableBorder
            withColumnBorders
            stickyHeader
            highlightOnHover
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "center" }}>Nombre</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Teléfono</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Email</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {displayedClients.map((client) => (
                <ClientRow
                  key={client._id}
                  client={client}
                  confirmAction={confirmAction}
                  handleEditClient={handleEditClient}
                  handleDeleteClient={handleDeleteClient}
                  handleViewForms={handleViewForms}
                />
              ))}
              {displayedClients.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center" py="md">
                      No hay clientes para mostrar.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      ) : (
        <Stack gap="sm">
          {displayedClients.length === 0 && (
            <Card withBorder radius="md" p="md">
              <Text c="dimmed" ta="center">
                No hay clientes para mostrar.
              </Text>
            </Card>
          )}
          {displayedClients.map((c) => (
            <Card key={c._id} withBorder radius="md" p="md">
              <Group justify="space-between" align="center">
                <Group>
                  <Avatar radius="xl">{c.name.charAt(0).toUpperCase()}</Avatar>
                  <div>
                    <Text fw={600}>{c.name}</Text>
                    <Text size="sm" c="dimmed">
                      {c.phoneNumber}
                    </Text>
                  </div>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {/* Bottom controls (pager) */}
      <Group justify="space-between" align="center" mt="md" wrap="wrap">
        <Text size="sm" c="dimmed">
          Mostrando {clients.length === 0 ? 0 : from}–{to} de {clients.length}
        </Text>
      </Group>
    </Box>
  );
};

export default ClientTable;
