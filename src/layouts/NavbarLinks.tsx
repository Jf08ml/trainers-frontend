import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  ScrollArea,
  Stack,
  NavLink as MantineNavLink,
  Divider,
  Text,
  rem,
} from "@mantine/core";
import { MdOutlineLoyalty } from "react-icons/md";
import { GrUserSettings } from "react-icons/gr";
import {  BiCalendarCheck } from "react-icons/bi";
import { GiPriceTag } from "react-icons/gi";
import {  FaUsers, FaWhatsapp } from "react-icons/fa";
import { IoAnalytics } from "react-icons/io5";
import { FaCrown } from "react-icons/fa";
import { BsChatText } from "react-icons/bs";
import { MdCampaign } from "react-icons/md";
import { IconBarbell, IconRun, IconClipboardList } from "@tabler/icons-react";
// import { usePermissions } from "../hooks/usePermissions";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import CustomLoader from "../components/customLoader/CustomLoader";
import UserInfoDisplay from "../components/UserInfoDisplay";

interface NavbarLinksProps {
  closeNavbar: () => void;
}

type LinkItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  canShow: boolean;
};

export default function NavbarLinks({ closeNavbar }: NavbarLinksProps) {
  // const { hasPermission } = usePermissions();
  const { organization, loading } = useSelector(
    (s: RootState) => s.organization
  );
  const { isAuthenticated, role: userType } = useSelector(
    (s: RootState) => s.auth
  );
  const location = useLocation();

  if (loading || !organization) {
    return (
      <CustomLoader
        loadingText={`Cargando ${organization?.name || "organización"}...`}
        logoUrl={organization?.branding?.logoUrl}
      />
    );
  }

  // Permisos (centralizado)
  // const can = {
  //   businessInfo: hasPermission("businessInformation:read"),
  //   employeeInfo: hasPermission("employeeInformation:read"),
  //   clientsRead: hasPermission("clients:read"),
  //   employeesRead: hasPermission("employees:read"),
  //   apptsAll: hasPermission("appointments:view_all"),
  //   apptsOwn: hasPermission("appointments:view_own"),
  //   onlineRes: hasPermission("reservationOnline:read"),
  //   cashRead: hasPermission("cashManagement:read"), // <-- fix typo
  //   whatsappRead: hasPermission("whatsapp:read"),
  //   analyticsRead: hasPermission("analytics:read"),
  // };

  // Estilos consistentes sobre navbar de color
  const textColor = "white";
  const activeBg = "rgba(255,255,255,0.18)";
  const hoverBg = "rgba(255,255,255,0.12)";

  // SECCIONES EN ORDEN FIJO - Cambia según tipo de usuario autenticado
  let sections: { title?: string; items: LinkItem[] }[] = [];

  // Si es ADMIN, mostrar todos los items de admin
  if (isAuthenticated && userType === "admin") {
    sections = [
      {
        title: "Gestión",
        items: [
          {
            label: "Gestionar Clientes",
            to: "/admin/gestionar-clientes",
            icon: <GrUserSettings size={18} />,
            canShow: true,
          },
          {
            label: "Gestionar Empleados",
            to: "/admin/gestionar-empleados",
            icon: <FaUsers size={18} />,
            canShow: true,
          },
          {
            label: "Ejercicios",
            to: "/admin/exercises",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
        ],
      },
      {
        title: "Entrenamiento",
        items: [
          {
            label: "Planes Semanales",
            to: "/admin/weekly-plans",
            icon: <IconRun size={18} />,
            canShow: true,
          },
          {
            label: "Sesiones de Entrenamiento",
            to: "/admin/training-sessions",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
          {
            label: "Catálogos de Entrenamiento",
            to: "/admin/training-catalogs",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
          {
            label: "Formularios de Feedback",
            to: "/admin/form-templates",
            icon: <IconClipboardList size={18} />,
            canShow: true,
          },
        ],
      },
      {
        title: "Comunicación",
        items: [
          {
            label: "Gestionar WhatsApp",
            to: "/admin/gestionar-whatsapp",
            icon: <FaWhatsapp size={18} />,
            canShow: true,
          },
          {
            label: "Mensajes de WhatsApp",
            to: "/admin/mensajes-whatsapp",
            icon: <BsChatText size={18} />,
            canShow: true,
          },
          {
            label: "Campañas WhatsApp",
            to: "/admin/campaigns",
            icon: <MdCampaign size={18} />,
            canShow: true,
          },
          {
            label: "Analíticas",
            to: "/admin/analytics-dashboard",
            icon: <IoAnalytics size={18} />,
            canShow: true,
          },
        ],
      },
      {
        title: "Configuración",
        items: [
          {
            label: "Información del Negocio",
            to: "/admin/informacion-negocio",
            icon: <MdOutlineLoyalty size={18} />,
            canShow: true,
          },
          {
            label: "Mi Membresía",
            to: "/admin/my-membership",
            icon: <FaCrown size={18} />,
            canShow: true,
          },
        ],
      },
    ];
  }
  // Si es EMPLOYEE, mostrar items de employee
  else if (isAuthenticated && userType === "employee") {
    sections = [
      {
        title: "Mi Área",
        items: [
          {
            label: "Mi Dashboard",
            to: "/employee",
            icon: <BiCalendarCheck size={18} />,
            canShow: true,
          },
          {
            label: "Mi Perfil",
            to: "/informacion-empleado",
            icon: <MdOutlineLoyalty size={18} />,
            canShow: true,
          },
        ],
      },
      {
        title: "Gestión",
        items: [
          {
            label: "Mis Clientes",
            to: "/employee/mis-clientes",
            icon: <FaUsers size={18} />,
            canShow: true,
          },
          {
            label: "Ejercicios",
            to: "/employee/exercises",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
        ],
      },
      {
        title: "Entrenamiento",
        items: [
          {
            label: "Planes Semanales",
            to: "/employee/weekly-plans",
            icon: <IconRun size={18} />,
            canShow: true,
          },
          {
            label: "Sesiones de Entrenamiento",
            to: "/employee/training-sessions",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
          {
            label: "Catálogos de Entrenamiento",
            to: "/employee/training-catalogs",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
        ],
      },
    ];
  }
  // Si es CLIENT, mostrar items de client
  else if (isAuthenticated && userType === "client") {
    sections = [
      {
        title: "Mi Centro",
        items: [
          {
            label: "Mi Dashboard",
            to: "/client",
            icon: <BiCalendarCheck size={18} />,
            canShow: true,
          },
          {
            label: "Mi Entrenamiento",
            to: "/client/mi-entrenamiento",
            icon: <IconBarbell size={18} />,
            canShow: true,
          },
          {
            label: "Mis Formularios",
            to: "/client/formularios",
            icon: <IconClipboardList size={18} />,
            canShow: true,
          },
          {
            label: "Mi Perfil",
            to: "/client/mi-perfil",
            icon: <MdOutlineLoyalty size={18} />,
            canShow: true,
          },
        ],
      },
    ];
  }
  // Si NO está autenticado, mostrar solo rutas públicas
  else {
    sections = [
      {
        title: "Explora",
        items: [
          {
            label: "Nuestros Servicios",
            to: "/servicios-precios",
            icon: <GiPriceTag size={18} />,
            canShow: true,
          },
        ],
      },
    ];
  }

  const linkStyles = {
    root: {
      color: textColor,
      padding: `${rem(8)} ${rem(10)}`,
      borderRadius: rem(10),
      "&:hover": { backgroundColor: hoverBg },
    },
    label: { fontWeight: 600 },
  } as const;

  const renderLink = (item: LinkItem) => {
    if (!item.canShow) return null;
    // For dashboard routes (exact paths like /client, /employee, /admin), only match exactly
    const isDashboardRoute = ["/client", "/employee", "/admin"].includes(item.to);
    const active = isDashboardRoute
      ? location.pathname === item.to
      : location.pathname === item.to ||
        (item.to !== "/" && location.pathname.startsWith(item.to));

    return (
      <MantineNavLink
        key={item.to}
        component={Link}
        to={item.to}
        leftSection={item.icon}
        label={item.label}
        onClick={closeNavbar}
        active={active}
        styles={{
          ...linkStyles,
          root: {
            ...linkStyles.root,
            backgroundColor: active ? activeBg : "transparent",
            borderLeft: active ? `${rem(3)} solid ${textColor}` : "transparent",
          },
        }}
      />
    );
  };

  return (
    <ScrollArea type="auto" scrollbars="y" style={{ paddingTop: rem(4) }}>
      <Stack gap="xs">
        {/* Mostrar info del usuario si está autenticado */}
        {isAuthenticated && (
          <>
            <Box px="xs" py="sm">
              <UserInfoDisplay />
            </Box>
            <Divider color="rgba(255,255,255,0.3)" />
          </>
        )}

        {sections.map(({ title, items }, idx) => {
          // Filtra items visibles según permisos
          const visible = items.filter((it) => it.canShow);
          if (visible.length === 0) return null;

          return (
            <Box key={idx}>
              {title && (
                <Divider
                  my="xs"
                  label={
                    <Text
                      size="xs"
                      fw={700}
                      c={textColor}
                      style={{ letterSpacing: ".02em" }}
                    >
                      {title}
                    </Text>
                  }
                  labelPosition="center"
                  color={textColor}
                  styles={{
                    label: { opacity: 0.9 },
                    root: { borderColor: "rgba(255,255,255,.35)" },
                  }}
                />
              )}
              <Stack gap={4} px="xs" py={4}>
                {visible.map(renderLink)}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
