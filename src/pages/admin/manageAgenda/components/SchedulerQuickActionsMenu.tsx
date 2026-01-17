// components/schedule/SchedulerQuickActionsMenu.tsx
import React from "react";
import {
  ActionIcon,
  Menu,
  Tooltip,
} from "@mantine/core";
import {
  BiDotsVerticalRounded,
  BiSearch,
  BiRefresh,
  BiPlus,
  BiSort,
} from "react-icons/bi";

export interface SchedulerQuickActionsMenuProps {
  // handlers
  onOpenSearch: () => void;
  onReloadMonth: () => void;
  onAddAppointment: () => void;
  onReorderEmployees: () => void;

  // estado/flags
  isWhatsappReady: boolean;
  reasonForDisabled?: string | null;

  // permisos
  canSearchAppointments: boolean;
  canCreate: boolean;
  canReorderEmployees: boolean;

  // opcional: accesibilidad
  ariaLabel?: string;
}

const SchedulerQuickActionsMenu: React.FC<SchedulerQuickActionsMenuProps> = ({
  onOpenSearch,
  onReloadMonth,
  onAddAppointment,
  onReorderEmployees,
  canSearchAppointments,
  canCreate,
  canReorderEmployees,
  ariaLabel = "Más acciones",
}) => {
  return (
    <Menu position="bottom-end" withArrow shadow="md">
      <Menu.Target>
        <Tooltip label="Acciones" withArrow>
          <ActionIcon variant="subtle" aria-label={ariaLabel} size="md">
            <BiDotsVerticalRounded size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<BiSearch size={16} />}
          onClick={onOpenSearch}
          disabled={!canSearchAppointments}
        >
          Buscar citas
        </Menu.Item>

        <Menu.Item
          leftSection={<BiRefresh size={16} />}
          onClick={onReloadMonth}
        >
          Recargar agenda
        </Menu.Item>

        <Menu.Item
          leftSection={<BiPlus size={16} />}
          onClick={onAddAppointment}
          disabled={!canCreate}
        >
          Añadir cita
        </Menu.Item>

        <Menu.Item
          leftSection={<BiSort size={16} />}
          onClick={onReorderEmployees}
          disabled={!canReorderEmployees}
        >
          Reordenar empleados
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default React.memo(SchedulerQuickActionsMenu);
