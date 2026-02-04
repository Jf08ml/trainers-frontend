import {
  Table,
  ScrollArea,
  Group,
  Button,
  Badge,
  Text,
  Pagination,
  Select,
  Box,
  Alert,
  Card,
  Stack,
  Flex,
} from "@mantine/core";
import { useState, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Exercise } from "../../../services/exerciseService";

interface ExerciseTableProps {
  exercises: Exercise[];
  handleDeleteExercise: (id: string) => void;
  handleEditExercise: (exercise: Exercise) => void;
  error: string | null;
}

const ExerciseTable: React.FC<ExerciseTableProps> = ({
  exercises,
  handleDeleteExercise,
  handleEditExercise,
  error,
}) => {
  const isMobile = useMediaQuery("(max-width: 48rem)");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(exercises.length / pageSize);
  const displayedExercises = useMemo(
    () =>
      exercises.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [exercises, currentPage, pageSize]
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [exercises.length]);

  return (
    <Box>
      {error && (
        <Alert color="red" mb="sm" title="Error">
          {error}
        </Alert>
      )}

      {exercises.length === 0 && !error && (
        <Alert color="blue" title="No hay ejercicios">
          No se encontraron ejercicios. Crea uno nuevo para comenzar.
        </Alert>
      )}

      {exercises.length > 0 && (
        <>
          {/* Pagination Top */}
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="dimmed">
              Mostrando{" "}
              {exercises.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, exercises.length)} de{" "}
              {exercises.length}
            </Text>
            <Group gap="xs">
              <Select
                placeholder="Items por página"
                data={["10", "20", "50"]}
                value={pageSize.toString()}
                onChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
                w={120}
              />
              <Pagination
                total={Math.max(totalPages, 1)}
                value={currentPage}
                onChange={setCurrentPage}
                size={isMobile ? "sm" : "md"}
              />
            </Group>
          </Group>

          {/* Desktop Table / Mobile Cards */}
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
                    <Table.Th>Nombre</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {displayedExercises.map((exercise) => (
                    <Table.Tr key={exercise._id}>
                      <Table.Td>
                        <Text fw={500}>{exercise.name}</Text>
                        {exercise.description && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {exercise.description}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => handleEditExercise(exercise)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => handleDeleteExercise(exercise._id)}
                          >
                            Eliminar
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea.Autosize>
          ) : (
            <Stack gap="sm">
              {displayedExercises.map((exercise) => (
                <Card key={exercise._id} withBorder radius="md" p="md">
                  <Flex direction="column" gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Text fw={600}>{exercise.name}</Text>
                        {exercise.description && (
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {exercise.description}
                          </Text>
                        )}
                      </Box>
                    </Group>

                    {exercise.muscleGroups.length > 0 && (
                      <Group gap={4}>
                        <Text size="xs" c="dimmed" fw={500}>
                          Músculos:
                        </Text>
                        {exercise.muscleGroups.slice(0, 3).map((mg, idx) => (
                          <Badge key={idx} variant="light" size="xs">
                            {mg}
                          </Badge>
                        ))}
                        {exercise.muscleGroups.length > 3 && (
                          <Badge variant="light" size="xs" color="gray">
                            +{exercise.muscleGroups.length - 3}
                          </Badge>
                        )}
                      </Group>
                    )}

                    {exercise.equipment.length > 0 && (
                      <Group gap={4}>
                        <Text size="xs" c="dimmed" fw={500}>
                          Equipamiento:
                        </Text>
                        {exercise.equipment.slice(0, 2).map((eq, idx) => (
                          <Badge key={idx} variant="outline" size="xs">
                            {eq}
                          </Badge>
                        ))}
                        {exercise.equipment.length > 2 && (
                          <Badge variant="outline" size="xs" color="gray">
                            +{exercise.equipment.length - 2}
                          </Badge>
                        )}
                      </Group>
                    )}

                    <Group mt="sm" gap="xs">
                      <Button
                        size="xs"
                        fullWidth
                        onClick={() => handleEditExercise(exercise)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="xs"
                        fullWidth
                        color="red"
                        onClick={() => handleDeleteExercise(exercise._id)}
                      >
                        Eliminar
                      </Button>
                    </Group>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}

          {/* Pagination Bottom */}
          <Group justify="center" mt="md">
            <Pagination
              total={Math.max(totalPages, 1)}
              value={currentPage}
              onChange={setCurrentPage}
              size={isMobile ? "sm" : "md"}
            />
          </Group>
        </>
      )}
    </Box>
  );
};

export default ExerciseTable;
