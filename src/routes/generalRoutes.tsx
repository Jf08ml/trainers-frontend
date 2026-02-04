import React from "react";
import SearchClient from "../pages/loyalty/SearchClient";
import PlanViewer from "../pages/loyalty/PlanViewer";
import LoginAdmin from "../pages/admin/LoginAdmin";
import ClientManagement from "../pages/admin/manageClients";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminEmployees from "../pages/admin/manageEmployees";
import OrganizationInfo from "../pages/admin/OrganizationInfo/index";
import Home from "../pages/Home";
import Location from "../pages/location/location";
import WhatsappMultiSession from "../pages/admin/manageWhatsapp";
import SuperadminManagement from "../pages/superadmin/SuperadminManagement";
import DashboardCliente from "../pages/client/DashboardCliente";
import DashboardEmpleado from "../pages/employee/DashboardEmpleado";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import MyMembership from "../pages/admin/MyMembership";
import PublicCancelPage from "../pages/public/PublicCancelPage";
import WhatsappTemplateEditor from "../pages/admin/WhatsappTemplateEditor";
import PaymentSuccess from "../pages/public/PaymentSuccess";
import MembershipPlans from "../pages/public/MembershipPlans";
import PaymentHistory from "../pages/admin/PaymentHistory";
import CampaignList from "../pages/admin/campaigns/CampaignList";
import CampaignWizard from "../pages/admin/campaigns/CampaignWizard";
import CampaignDetail from "../pages/admin/campaigns/CampaignDetail";
import ManageExercises from "../pages/admin/manageExercises";
import TrainingCatalogs from "../pages/admin/TrainingCatalogs";
import TrainingSessions from "../pages/admin/TrainingSessions";
import SessionBuilder from "../pages/admin/SessionBuilder";
import WeeklyPlans from "../pages/admin/WeeklyPlans";
import ClientWeeklyPlans from "../pages/admin/ClientWeeklyPlans";
import WeeklyPlanBuilder from "../pages/admin/WeeklyPlanBuilder";
import ClientTrainingPlan from "../pages/client/ClientTrainingPlan";
import FormTemplates from "../pages/admin/FormTemplates";
import FormBuilder from "../pages/admin/FormBuilder";
import ClientForms from "../pages/client/ClientForms";
import ManageDishes from "../pages/admin/manageNutrition/ManageDishes";
import NutritionPlans from "../pages/admin/NutritionPlans";
import ClientNutritionPlans from "../pages/admin/ClientNutritionPlans";
import NutritionPlanBuilder from "../pages/admin/NutritionPlanBuilder";
import ClientNutritionPlan from "../pages/client/ClientNutritionPlan";
import ClientDishCatalog from "../pages/client/ClientDishCatalog";

const generalRoutes = [
  // ==================== RUTAS PÚBLICAS ====================
  {
    path: "/",
    component: Home,
    MediaMetadata: {
      title: "Inicio",
      description: "Inicio de página.",
    },
  },
  {
    path: "/plans",
    component: MembershipPlans,
    MediaMetadata: {
      title: "Planes",
      description: "Elige y paga tu plan de membresía",
    },
  },
  {
    path: "/payment/success",
    component: PaymentSuccess,
    MediaMetadata: {
      title: "Pago exitoso",
      description: "Verificación de pago de membresía",
    },
  },
  {
    path: "/cancel",
    component: PublicCancelPage,
    MediaMetadata: {
      title: "Cancelar Reserva",
      description: "Cancelación de reserva o cita.",
    },
  },
  {
    path: "/search-client",
    component: SearchClient,
    MediaMetadata: {
      title: "Buscar Cliente",
      description: "Búsqueda de cliente para el plan de fidelidad.",
    },
  },
  {
    path: "/plan-viewer",
    component: PlanViewer,
    MediaMetadata: {
      title: "Plan de fidelidad",
      description: "Visualización del plan de fidelidad del cliente.",
    },
  },
  {
    path: "/location",
    component: Location,
    MediaMetadata: {
      title: "Ubicación",
      description: "Ubicación en google maps.",
    },
  },
  {
    path: "/login-admin",
    component: LoginAdmin,
    MediaMetadata: {
      title: "Iniciar Sesión",
      description: "Inicia sesión en tu cuenta.",
    },
  },

  // ==================== RUTAS ADMIN ====================
  {
    path: "/admin",
    component: () => (
      <ProtectedRoute>
        <DashboardAdmin />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Dashboard Admin",
      description: "Panel de administración principal.",
    },
  },
  {
    path: "/admin/gestionar-clientes",
    component: () => (
      <ProtectedRoute>
        <ClientManagement />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestionar Clientes",
      description: "Administra los clientes de tu negocio.",
    },
  },
  {
    path: "/admin/gestionar-empleados",
    component: () => (
      <ProtectedRoute>
        <AdminEmployees />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestionar Empleados",
      description: "Gestiona los empleados de Galaxia Glamour.",
    },
  },
  {
    path: "/admin/gestionar-whatsapp",
    component: () => (
      <ProtectedRoute>
        <WhatsappMultiSession />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestionar WhatsApp",
      description: "Configura tu integración de WhatsApp.",
    },
  },
  {
    path: "/admin/mensajes-whatsapp",
    component: () => (
      <ProtectedRoute>
        <WhatsappTemplateEditor />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mensajes de WhatsApp",
      description: "Personaliza los mensajes automáticos de WhatsApp.",
    },
  },
  {
    path: "/admin/campaigns",
    component: () => (
      <ProtectedRoute>
        <CampaignList />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Campañas de WhatsApp",
      description: "Gestiona tus campañas masivas de WhatsApp",
    },
  },
  {
    path: "/admin/campaigns/new",
    component: () => (
      <ProtectedRoute>
        <CampaignWizard />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nueva Campaña",
      description: "Crea una nueva campaña de WhatsApp",
    },
  },
  {
    path: "/admin/campaigns/:campaignId",
    component: () => (
      <ProtectedRoute>
        <CampaignDetail />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Detalle de Campaña",
      description: "Ver detalles y métricas de campaña",
    },
  },
  {
    path: "/admin/exercises",
    component: () => (
      <ProtectedRoute>
        <ManageExercises />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestión de Ejercicios",
      description: "Administra el catálogo de ejercicios",
    },
  },
  {
    path: "/admin/training-catalogs",
    component: () => (
      <ProtectedRoute>
        <TrainingCatalogs />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Catálogos de Entrenamiento",
      description: "Administra grupos musculares, equipamiento, etiquetas y objetivos",
    },
  },
  {
    path: "/admin/training-sessions",
    component: () => (
      <ProtectedRoute>
        <TrainingSessions />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Sesiones de Entrenamiento",
      description: "Gestiona sesiones y plantillas de entrenamiento",
    },
  },
  {
    path: "/admin/training-sessions/new",
    component: () => (
      <ProtectedRoute>
        <SessionBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nueva Sesión",
      description: "Crea una nueva sesión de entrenamiento",
    },
  },
  {
    path: "/admin/training-sessions/edit/:id",
    component: () => (
      <ProtectedRoute>
        <SessionBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Sesión",
      description: "Edita una sesión de entrenamiento existente",
    },
  },
  {
    path: "/admin/weekly-plans",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes Semanales",
      description: "Gestiona planes de entrenamiento semanales para clientes",
    },
  },
  {
    path: "/admin/weekly-plans/client/:clientId",
    component: () => (
      <ProtectedRoute>
        <ClientWeeklyPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes del Cliente",
      description: "Gestiona los planes semanales de un cliente",
    },
  },
  {
    path: "/admin/weekly-plans/new",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nuevo Plan Semanal",
      description: "Crea un nuevo plan de entrenamiento semanal",
    },
  },
  {
    path: "/admin/weekly-plans/edit/:id",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Plan Semanal",
      description: "Edita un plan de entrenamiento semanal existente",
    },
  },
  {
    path: "/admin/form-templates",
    component: () => (
      <ProtectedRoute>
        <FormTemplates />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Formularios de Feedback",
      description: "Gestiona formularios de feedback para clientes",
    },
  },
  {
    path: "/admin/form-templates/nuevo",
    component: () => (
      <ProtectedRoute>
        <FormBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nuevo Formulario",
      description: "Crea un nuevo formulario de feedback",
    },
  },
  {
    path: "/admin/form-templates/:id/editar",
    component: () => (
      <ProtectedRoute>
        <FormBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Formulario",
      description: "Edita un formulario de feedback existente",
    },
  },
  {
    path: "/admin/dishes",
    component: () => (
      <ProtectedRoute>
        <ManageDishes />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestión de Platos",
      description: "Administra el catálogo de platos",
    },
  },
  {
    path: "/admin/nutrition-plans",
    component: () => (
      <ProtectedRoute>
        <NutritionPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes Nutricionales",
      description: "Gestiona planes de alimentación para clientes",
    },
  },
  {
    path: "/admin/nutrition-plans/client/:clientId",
    component: () => (
      <ProtectedRoute>
        <ClientNutritionPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes del Cliente",
      description: "Gestiona los planes nutricionales de un cliente",
    },
  },
  {
    path: "/admin/nutrition-plans/new",
    component: () => (
      <ProtectedRoute>
        <NutritionPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nuevo Plan Nutricional",
      description: "Crea un nuevo plan de alimentación",
    },
  },
  {
    path: "/admin/nutrition-plans/edit/:id",
    component: () => (
      <ProtectedRoute>
        <NutritionPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Plan Nutricional",
      description: "Edita un plan de alimentación existente",
    },
  },
  {
    path: "/admin/my-membership",
    component: () => (
      <ProtectedRoute>
        <MyMembership />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mi Membresía",
      description: "Ver detalles de tu membresía y plan",
    },
  },
  {
    path: "/admin/payment-history",
    component: () => (
      <ProtectedRoute>
        <PaymentHistory />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Historial de Pagos",
      description: "Eventos recientes del proveedor de pagos",
    },
  },
  {
    path: "/admin/informacion-negocio",
    component: () => (
      <ProtectedRoute>
        <OrganizationInfo />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Información del Negocio",
      description: "Configura la información de tu negocio.",
    },
  },

  // ==================== RUTAS EMPLOYEE ====================
  {
    path: "/employee",
    component: () => (
      <ProtectedRoute>
        <DashboardEmpleado />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Dashboard de Empleado",
      description: "Tu panel de empleado.",
    },
  },
  {
    path: "/employee/mis-clientes",
    component: () => {
      // Lazy import para evitar cargar todo en el bundle inicial
      const EmployeeClients = React.lazy(() => import("../pages/employee/EmployeeClients"));
      return (
        <ProtectedRoute>
          <React.Suspense fallback={<div>Cargando...</div>}>
            <EmployeeClients />
          </React.Suspense>
        </ProtectedRoute>
      );
    },
    MediaMetadata: {
      title: "Mis Clientes",
      description: "Clientes asignados al entrenador.",
    },
  },
  {
    path: "/employee/mis-clientes/:clientId/planes",
    component: () => (
      <ProtectedRoute>
        <ClientWeeklyPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes del Cliente",
      description: "Planes semanales del cliente.",
    },
  },
  {
    path: "/employee/mis-clientes/:clientId/planes/nuevo",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nuevo Plan Semanal",
      description: "Crea un nuevo plan semanal para el cliente.",
    },
  },
  {
    path: "/employee/mis-clientes/:clientId/planes/:planId/editar",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Plan Semanal",
      description: "Edita el plan semanal del cliente.",
    },
  },
  {
    path: "/employee/exercises",
    component: () => (
      <ProtectedRoute>
        <ManageExercises />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Ejercicios",
      description: "Gestión de ejercicios.",
    },
  },
  {
    path: "/employee/training-sessions",
    component: () => (
      <ProtectedRoute>
        <TrainingSessions />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Sesiones de Entrenamiento",
      description: "Gestión de sesiones.",
    },
  },
  {
    path: "/employee/training-sessions/nueva",
    component: () => (
      <ProtectedRoute>
        <SessionBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nueva Sesión",
      description: "Crea una nueva sesión de entrenamiento.",
    },
  },
  {
    path: "/employee/training-sessions/:sessionId/editar",
    component: () => (
      <ProtectedRoute>
        <SessionBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Sesión",
      description: "Edita la sesión de entrenamiento.",
    },
  },
  {
    path: "/employee/weekly-plans",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes Semanales",
      description: "Gestión de planes semanales.",
    },
  },
  {
    path: "/employee/weekly-plans/:clientId",
    component: () => (
      <ProtectedRoute>
        <ClientWeeklyPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes del Cliente",
      description: "Planes semanales del cliente.",
    },
  },
  {
    path: "/employee/weekly-plans/:clientId/nuevo",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nuevo Plan Semanal",
      description: "Crea un nuevo plan semanal.",
    },
  },
  {
    path: "/employee/weekly-plans/:clientId/:planId/editar",
    component: () => (
      <ProtectedRoute>
        <WeeklyPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Plan Semanal",
      description: "Edita el plan semanal.",
    },
  },
  {
    path: "/employee/training-catalogs",
    component: () => (
      <ProtectedRoute>
        <TrainingCatalogs />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Catálogos de Entrenamiento",
      description: "Gestión de catálogos.",
    },
  },
  {
    path: "/employee/dishes",
    component: () => (
      <ProtectedRoute>
        <ManageDishes />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestión de Platos",
      description: "Gestión del catálogo de platos.",
    },
  },
  {
    path: "/employee/nutrition-plans",
    component: () => (
      <ProtectedRoute>
        <NutritionPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes Nutricionales",
      description: "Gestión de planes nutricionales.",
    },
  },
  {
    path: "/employee/nutrition-plans/client/:clientId",
    component: () => (
      <ProtectedRoute>
        <ClientNutritionPlans />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Planes del Cliente",
      description: "Planes nutricionales del cliente.",
    },
  },
  {
    path: "/employee/nutrition-plans/new",
    component: () => (
      <ProtectedRoute>
        <NutritionPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Nuevo Plan Nutricional",
      description: "Crea un nuevo plan nutricional.",
    },
  },
  {
    path: "/employee/nutrition-plans/edit/:id",
    component: () => (
      <ProtectedRoute>
        <NutritionPlanBuilder />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Editar Plan Nutricional",
      description: "Edita un plan nutricional.",
    },
  },

  // ==================== RUTAS CLIENT ====================
  {
    path: "/client",
    component: () => (
      <ProtectedRoute>
        <DashboardCliente />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mi Centro de Bienestar",
      description: "Tu dashboard personal.",
    },
  },
  {
    path: "/client/mi-perfil",
    component: () => (
      <ProtectedRoute>
        <DashboardCliente />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mi Perfil",
      description: "Tu perfil de cliente.",
    },
  },
  {
    path: "/client/mi-entrenamiento",
    component: () => (
      <ProtectedRoute>
        <ClientTrainingPlan />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mi Entrenamiento",
      description: "Tu plan de entrenamiento semanal.",
    },
  },
  {
    path: "/client/mi-nutricion",
    component: () => (
      <ProtectedRoute>
        <ClientNutritionPlan />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mi Nutrición",
      description: "Tu plan de alimentación personalizado.",
    },
  },
  {
    path: "/client/catalogo",
    component: () => (
      <ProtectedRoute>
        <ClientDishCatalog />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Catálogo de Platos",
      description: "Explora todos los platos disponibles con su información nutricional.",
    },
  },
  {
    path: "/client/formularios",
    component: () => (
      <ProtectedRoute>
        <ClientForms />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mis Formularios",
      description: "Completa formularios de feedback para tu entrenador.",
    },
  },

  // ==================== RUTAS SUPERADMIN ====================
  {
    path: "/superadmin",
    component: SuperadminManagement,
    MediaMetadata: {
      title: "Panel de Superadmin",
      description: "Administra organizaciones y membresías.",
    },
  },

  // ==================== RUTAS LEGADAS (para compatibilidad) ====================
  {
    path: "/gestionar-clientes",
    component: () => (
      <ProtectedRoute>
        <ClientManagement />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestionar Clientes",
      description: "Dashboard de Galaxia Glamour.",
    },
  },
  {
    path: "/gestionar-empleados",
    component: () => (
      <ProtectedRoute>
        <AdminEmployees />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestionar Empleados",
      description: "Gestiona los empleados de Galaxia Glamour.",
    },
  },
  {
    path: "/informacion-negocio",
    component: () => (
      <ProtectedRoute>
        <OrganizationInfo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gestionar-whatsapp",
    component: () => (
      <ProtectedRoute>
        <WhatsappMultiSession />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Gestionar WhatsApp",
      description: "Gestiona los empleados de Galaxia Glamour.",
    },
  },
  {
    path: "/mensajes-whatsapp",
    component: () => (
      <ProtectedRoute>
        <WhatsappTemplateEditor />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mensajes de WhatsApp",
      description: "Personaliza los mensajes automáticos de WhatsApp.",
    },
  },
  {
    path: "/my-membership",
    component: () => (
      <ProtectedRoute>
        <MyMembership />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Mi Membresía",
      description: "Ver detalles de tu membresía y plan",
    },
  },
  {
    path: "/payment-history",
    component: () => (
      <ProtectedRoute>
        <PaymentHistory />
      </ProtectedRoute>
    ),
    MediaMetadata: {
      title: "Historial de Pagos",
      description: "Eventos recientes del proveedor de pagos",
    },
  },
];

export default generalRoutes;
