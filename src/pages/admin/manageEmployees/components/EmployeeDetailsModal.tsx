/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Text,
  Title,
  Table,
  ScrollArea,
  Loader,
  Select,
  Group,
  Modal,
  Tabs,
  NumberInput,
  Stack,
  Grid,

} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  Advance,
  getAdvancesByEmployee,
} from "../../../../services/advanceService";
import { Employee } from "../../../../services/employeeService";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectOrganization } from "../../../../features/organization/sliceOrganization";
import { formatCurrency as formatCurrencyUtil } from "../../../../utils/formatCurrency";

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loadingAdvances, setLoadingAdvances] = useState(false);
  const [interval, setInterval] = useState<string>("daily");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [customCommission, setCustomCommission] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (employee && isOpen) {
      calculateDates(interval);
    }
  }, [employee, isOpen, interval]);

  useEffect(() => {
    if (employee && startDate && endDate) {
      fetchAdvances();
    }
  }, [employee, startDate, endDate]);

  const calculateDates = (interval: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (interval) {
      case "daily":
        start = dayjs(now).startOf("day").toDate();
        end = dayjs(now).endOf("day").toDate();
        break;
      case "weekly":
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - now.getDay() + 1
        ); // Lunes
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "biweekly":
        start =
          now.getDate() <= 15
            ? new Date(now.getFullYear(), now.getMonth(), 1)
            : new Date(now.getFullYear(), now.getMonth(), 16);
        end =
          now.getDate() <= 15
            ? new Date(now.getFullYear(), now.getMonth(), 15)
            : new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "custom":
        // Fechas personalizadas
        break;
      default:
        break;
    }

    if (interval !== "custom") {
      setStartDate(start);
      setEndDate(end);
    }
  };


  const fetchAdvances = async () => {
    if (!employee || !startDate || !endDate) return;

    setLoadingAdvances(true);
    try {
      const employeeAdvances = await getAdvancesByEmployee(employee._id);
      const filteredAdvances = employeeAdvances.filter(
        (advance) =>
          new Date(advance.date) >= startDate &&
          new Date(advance.date) <= endDate
      );

      setAdvances(filteredAdvances);
    } catch (error) {
      console.error("Error al cargar avances del empleado", error);
    } finally {
      setLoadingAdvances(false);
    }
  };

  const org = useSelector(selectOrganization);
  const formatCurrency = (value: number) =>
    formatCurrencyUtil(value, org?.currency || "COP");

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Detalles - ${employee?.names || "Empleado"}`}
      size="xl"
      centered
    >
      <Box>
        <Tabs defaultValue="payroll">
          <Tabs.List>
            <Tabs.Tab value="payroll">Nómina y Pagos</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="payroll" pt="md">
            <Stack gap="md">
              {/* Filtros y período */}
              <Card shadow="sm" radius="md" p="md" withBorder>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Intervalo de pago"
                      placeholder="Selecciona intervalo"
                      data={[
                        { value: "daily", label: "Diario" },
                        { value: "weekly", label: "Semanal" },
                        { value: "biweekly", label: "Quincenal" },
                        { value: "monthly", label: "Mensual" },
                        { value: "custom", label: "Personalizado" },
                      ]}
                      value={interval}
                      onChange={(value) => setInterval(value || "daily")}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                      label="% Comisión personalizado"
                      description="Deja vacío para usar el del empleado"
                      placeholder={`Por defecto: ${employee?.commissionPercentage ?? 0}%`}
                      min={0}
                      max={100}
                      value={customCommission}
                      onChange={(val) => setCustomCommission(val as number | undefined)}
                      rightSection={<Text size="xs" c="dimmed">%</Text>}
                    />
                  </Grid.Col>
                </Grid>

                {interval === "custom" ? (
                  <Group mt="md">
                    <DatePickerInput
                      label="Fecha de inicio"
                      value={startDate}
                      onChange={setStartDate}
                    />
                    <DatePickerInput
                      label="Fecha de fin"
                      value={endDate}
                      onChange={setEndDate}
                    />
                  </Group>
                ) : (
                  <Group mt="sm" justify="center">
                    <Text size="sm" c="dimmed">
                      <strong>Período:</strong> {startDate?.toLocaleDateString() || "N/A"} -{" "}
                      {endDate?.toLocaleDateString() || "N/A"}
                    </Text>
                  </Group>
                )}
              </Card>

              {/* Tabla de avances */}
              <Card shadow="sm" radius="md" p="md" withBorder>
                <Title order={4} mb="md">
                  Avances del Período
                </Title>
                <ScrollArea style={{ height: "200px" }}>
                  {loadingAdvances ? (
                    <Box ta="center" py="xl">
                      <Loader />
                    </Box>
                  ) : advances.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      No hay avances en este período
                    </Text>
                  ) : (
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Fecha</Table.Th>
                          <Table.Th>Monto</Table.Th>
                          <Table.Th>Descripción</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {advances.map((advance) => (
                          <Table.Tr key={advance._id}>
                            <Table.Td>
                              {new Date(advance.date).toLocaleDateString()}
                            </Table.Td>
                            <Table.Td>{formatCurrency(advance.amount)}</Table.Td>
                            <Table.Td>
                              {advance.description || "Sin descripción"}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </ScrollArea>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Modal>
  );
};

export default EmployeeDetailsModal;
