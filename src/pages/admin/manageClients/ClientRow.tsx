import React from "react";
import { Client } from "../../../services/clientService";
import { ActionIcon, Menu, Table, Text } from "@mantine/core";
import { BiTrash } from "react-icons/bi";
import { CgOptions } from "react-icons/cg";
import { MdEdit } from "react-icons/md";
import { IconClipboardList } from "@tabler/icons-react";

const ClientRow = React.memo(
  ({
    client,
    confirmAction,
    handleEditClient,
    handleDeleteClient,
    handleViewForms,
  }: {
    client: Client;
    confirmAction: (
      action: () => void,
      title: string,
      message: string,
      actionType: "register" | "refer" | "delete"
    ) => void;
    handleEditClient: (client: Client) => void;
    handleDeleteClient: (id: string) => void;
    handleViewForms: (client: Client) => void;
  }) => (
    <Table.Tr key={client._id}>
      <Table.Td>
        <Text ta="center" tt="capitalize" fw={500}>
          {client.name}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: "center" }}>{client.phoneNumber}</Table.Td>
      <Table.Td style={{ textAlign: "center" }}>
        <Text size="sm" c="dimmed">
          {client.email || "—"}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: "center" }}>
        <Menu shadow="sm" width={220} withinPortal>
          <Menu.Target>
            <ActionIcon radius="xl" variant="default">
              <CgOptions size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Acciones</Menu.Label>
            <Menu.Item
              leftSection={<MdEdit />}
              onClick={() => handleEditClient(client)}
            >
              Editar cliente
            </Menu.Item>
            <Menu.Item
              leftSection={<IconClipboardList size={16} />}
              onClick={() => handleViewForms(client)}
            >
              Ver formularios
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<BiTrash />}
              onClick={() =>
                confirmAction(
                  () => handleDeleteClient(client._id),
                  "Eliminar Cliente",
                  "¿Estás seguro? Esta acción no se puede deshacer.",
                  "delete"
                )
              }
            >
              Eliminar cliente
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  )
);

export default ClientRow;
