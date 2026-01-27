import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Group, Text, Badge, Avatar } from "@mantine/core";
import { IoPersonCircle } from "react-icons/io5";

export const UserInfoDisplay: React.FC = () => {
  const { isAuthenticated, userName, role } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated || !userName) {
    return null;
  }

  const safeRole = role ?? "client";
  const roleLabel = {
    admin: "Administrador",
    employee: "Empleado",
    client: "Cliente",
  }[safeRole] || safeRole;

  const roleColor = {
    admin: "red",
    employee: "blue",
    client: "green",
  }[safeRole] || "gray";

  return (
    <Group gap="xs" wrap="nowrap" style={{ alignItems: "center" }}>
      <Avatar
        size="md"
        radius="xl"
        color={roleColor}
        style={{ flexShrink: 0 }}
      >
        <IoPersonCircle />
      </Avatar>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text size="sm" fw={600} truncate style={{ whiteSpace: "nowrap" }}>
          {userName}
        </Text>
        <Badge size="xs" color={roleColor} variant="light">
          {roleLabel}
        </Badge>
      </div>
    </Group>
  );
};

export default UserInfoDisplay;
