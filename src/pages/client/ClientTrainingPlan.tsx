/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Card,
  Group,
  Badge,
  Button,
  ThemeIcon,
  Loader,
  Center,
  Divider,
  Modal,
  Alert,
  RingProgress,
  SimpleGrid,
  Checkbox,
  Accordion,
  Image,
  AspectRatio,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBarbell,
  IconCheck,
  IconClock,
  IconCalendar,
  IconTarget,
  IconPlayerPlay,
  IconTrophy,
  IconFlame,
  IconChevronRight,
  IconWeight,
  IconRun,
  IconHeartRateMonitor,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import {
  getActivePlansByClientId,
  getWeeklyPlanById,
  markDayCompleted,
  markExerciseCompleted,
  type WeeklyPlan,
} from "../../services/weeklyPlanService";
import {
  getSessionExercisesBySessionId,
  type PopulatedSessionExercise,
  type StrengthConfig,
  type CardioContinuousConfig,
  type CardioIntervalConfig,
} from "../../services/trainingSessionService";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Match patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const ClientTrainingPlan: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const organization = useSelector(
    (state: RootState) => state.organization.organization
  );

  const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingDay, setMarkingDay] = useState<number | null>(null);
  const [markingExercise, setMarkingExercise] = useState<string | null>(null);

  // Session detail modal
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedDaySession, setSelectedDaySession] = useState<any>(null);
  const [sessionExercises, setSessionExercises] = useState<PopulatedSessionExercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const today = new Date();
  const currentDayOfWeek = today.getDay();

  useEffect(() => {
    if (userId) {
      loadActivePlan();
    }
  }, [userId]);

  const loadActivePlan = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const plans = await getActivePlansByClientId(userId, organization?._id);
      if (plans.length > 0) {
        // Get the most recent active plan with full details
        const fullPlan = await getWeeklyPlanById(plans[0]._id);
        setActivePlan(fullPlan || null);
      } else {
        setActivePlan(null);
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    }
    setLoading(false);
  };

  const handleMarkCompleted = async (dayOfWeek: number, completed: boolean) => {
    if (!activePlan) return;

    setMarkingDay(dayOfWeek);
    try {
      const updated = await markDayCompleted(activePlan._id, {
        dayOfWeek,
        completed,
      });
      if (updated) {
        setActivePlan(updated);
        // Update selectedDaySession if the modal is open
        if (selectedDaySession && selectedDaySession.dayOfWeek === dayOfWeek) {
          const updatedDay = updated.weekDays?.find((d) => d.dayOfWeek === dayOfWeek);
          if (updatedDay) {
            setSelectedDaySession(updatedDay);
          }
        }
        notifications.show({
          title: completed ? "¡Felicitaciones!" : "Día desmarcado",
          message: completed
            ? "Has completado tu entrenamiento del día"
            : "El día ha sido desmarcado",
          color: completed ? "green" : "gray",
          icon: completed ? <IconTrophy size={16} /> : undefined,
        });
      }
    } catch (error) {
      console.error("Error marking day completed:", error);
      notifications.show({
        title: "Error",
        message: "No se pudo actualizar el estado",
        color: "red",
      });
    }
    setMarkingDay(null);
  };

  const handleMarkExerciseCompleted = async (sessionExerciseId: string, completed: boolean) => {
    if (!activePlan || !selectedDaySession) return;

    setMarkingExercise(sessionExerciseId);
    try {
      const updated = await markExerciseCompleted(activePlan._id, {
        dayOfWeek: selectedDaySession.dayOfWeek,
        sessionExerciseId,
        completed,
      });
      if (updated) {
        setActivePlan(updated);
        // Update selectedDaySession with the updated data
        const updatedDay = updated.weekDays?.find((d) => d.dayOfWeek === selectedDaySession.dayOfWeek);
        if (updatedDay) {
          setSelectedDaySession(updatedDay);
        }
      }
    } catch (error) {
      console.error("Error marking exercise completed:", error);
      notifications.show({
        title: "Error",
        message: "No se pudo actualizar el estado del ejercicio",
        color: "red",
      });
    }
    setMarkingExercise(null);
  };

  const isExerciseCompleted = (exerciseId: string): boolean => {
    if (!selectedDaySession?.completedExercises) return false;
    return selectedDaySession.completedExercises.some(
      (id: string) => id === exerciseId || id.toString() === exerciseId
    );
  };

  const handleViewSession = async (daySession: any) => {
    setSelectedDaySession(daySession);
    setSessionModalOpen(true);

    if (daySession.sessionId?._id) {
      setLoadingExercises(true);
      try {
        const exercises = await getSessionExercisesBySessionId(daySession.sessionId._id);
        setSessionExercises(exercises);
      } catch (error) {
        console.error("Error loading exercises:", error);
      }
      setLoadingExercises(false);
    }
  };

  const getProgressStats = () => {
    if (!activePlan) return { completed: 0, total: 0, percent: 0 };
    const total = activePlan.weekDays?.length || 0;
    const completed = activePlan.weekDays?.filter((d) => d.completed).length || 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  const getTodaySession = () => {
    if (!activePlan) return null;
    return activePlan.weekDays?.find((d) => d.dayOfWeek === currentDayOfWeek);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
    });
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case "strength":
        return "Fuerza";
      case "cardio":
        return "Cardio";
      case "mixed":
        return "Mixto";
      default:
        return type;
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <IconWeight size={14} />;
      case "cardio":
        return <IconRun size={14} />;
      default:
        return <IconBarbell size={14} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "principiante":
        return "green";
      case "intermedio":
        return "yellow";
      case "avanzado":
        return "red";
      default:
        return "gray";
    }
  };

  const renderStrengthConfig = (config: StrengthConfig) => {
    return (
      <Stack gap={4}>
        <Text size="xs" fw={500} c="blue">
          {config.sets?.length || 0} series
        </Text>
        {config.sets?.map((set, idx) => (
          <Group key={idx} gap="xs">
            <Badge size="xs" variant="outline" color="gray">
              Serie {idx + 1}
            </Badge>
            <Text size="xs" c="dimmed">
              {set.repsMin}-{set.repsMax} reps
              {set.load ? ` • ${set.load}kg` : ""}
              {set.restSeconds ? ` • ${set.restSeconds}s descanso` : ""}
              {set.rpe ? ` • RPE ${set.rpe}` : ""}
            </Text>
          </Group>
        ))}
      </Stack>
    );
  };

  const renderCardioContinuousConfig = (config: CardioContinuousConfig) => {
    return (
      <Stack gap={4}>
        <Group gap="xs">
          <IconHeartRateMonitor size={14} color="gray" />
          <Text size="xs" c="dimmed">
            {config.durationMinutes} minutos
            {config.zone ? ` • Zona ${config.zone}` : ""}
            {config.effort ? ` • Esfuerzo ${config.effort}/10` : ""}
            {config.pace ? ` • Ritmo: ${config.pace}` : ""}
          </Text>
        </Group>
      </Stack>
    );
  };

  const renderCardioIntervalConfig = (config: CardioIntervalConfig) => {
    return (
      <Stack gap={4}>
        <Group gap="xs">
          <IconPlayerPlayFilled size={14} color="gray" />
          <Text size="xs" c="dimmed">
            {config.rounds} rondas • {config.workSeconds}s trabajo / {config.restSeconds}s descanso
          </Text>
        </Group>
        {(config.workEffort || config.restEffort) && (
          <Text size="xs" c="dimmed" ml="lg">
            {config.workEffort ? `Esfuerzo trabajo: ${config.workEffort}/10` : ""}
            {config.workEffort && config.restEffort ? " • " : ""}
            {config.restEffort ? `Esfuerzo descanso: ${config.restEffort}/10` : ""}
          </Text>
        )}
      </Stack>
    );
  };

  const stats = getProgressStats();
  const todaySession = getTodaySession();

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!activePlan) {
    return (
      <Container size="md" py="xl">
        <Stack gap="xl" align="center">
          <ThemeIcon size={80} radius="xl" variant="light" color="gray">
            <IconBarbell size={40} />
          </ThemeIcon>
          <Stack align="center" gap="xs">
            <Title order={2}>Sin plan activo</Title>
            <Text c="dimmed" ta="center" maw={400}>
              Actualmente no tienes un plan de entrenamiento asignado. Contacta con tu
              entrenador para que te asigne una rutina semanal.
            </Text>
          </Stack>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={2}>Mi Entrenamiento</Title>
          <Text c="dimmed" size="sm">
            {activePlan.name}
          </Text>
        </div>

        {/* Progress Card */}
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Text fw={600}>Progreso Semanal</Text>
              <Text size="sm" c="dimmed">
                {formatDate(activePlan.startDate)} - {formatDate(activePlan.endDate)}
              </Text>
              <Group gap="xs" mt="xs">
                <Badge
                  size="lg"
                  variant="filled"
                  color={stats.percent === 100 ? "green" : "blue"}
                  leftSection={
                    stats.percent === 100 ? (
                      <IconTrophy size={14} />
                    ) : (
                      <IconFlame size={14} />
                    )
                  }
                >
                  {stats.completed} de {stats.total} días completados
                </Badge>
              </Group>
            </Stack>
            <RingProgress
              size={100}
              thickness={10}
              roundCaps
              sections={[
                {
                  value: stats.percent,
                  color: stats.percent === 100 ? "green" : "blue",
                },
              ]}
              label={
                <Center>
                  <Text fw={700} size="lg">
                    {stats.percent}%
                  </Text>
                </Center>
              }
            />
          </Group>
        </Paper>

        {/* Today's Session Highlight */}
        {todaySession && (
          <Card shadow="sm" padding="lg" radius="md" withBorder bg="blue.0">
            <Group justify="space-between">
              <Group gap="md">
                <ThemeIcon size="xl" radius="md" color="blue">
                  <IconPlayerPlay size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Hoy - {DAY_NAMES[currentDayOfWeek]}
                  </Text>
                  <Text fw={600} size="lg">
                    {todaySession.sessionId?.name || "Sesión de entrenamiento"}
                  </Text>
                  {todaySession.notes && (
                    <Text size="sm" c="dimmed">
                      {todaySession.notes}
                    </Text>
                  )}
                </div>
              </Group>
              {todaySession.completed ? (
                <Badge size="lg" color="green" variant="filled" leftSection={<IconCheck size={14} />}>
                  Completado
                </Badge>
              ) : (
                <Button
                  size="md"
                  color="green"
                  leftSection={<IconCheck size={18} />}
                  loading={markingDay === currentDayOfWeek}
                  onClick={() => handleMarkCompleted(currentDayOfWeek, true)}
                >
                  Marcar como completado
                </Button>
              )}
            </Group>
          </Card>
        )}

        {!todaySession && (
          <Alert color="blue" icon={<IconCalendar size={16} />}>
            Hoy es tu día de descanso. ¡Aprovecha para recuperarte!
          </Alert>
        )}

        <Divider label="Semana completa" labelPosition="center" />

        {/* Weekly Calendar View */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {DAY_NAMES.map((_dayName, index) => {
            const daySession = activePlan.weekDays?.find((d) => d.dayOfWeek === index);
            const isToday = index === currentDayOfWeek;
            const isPast = index < currentDayOfWeek;
            const hasSession = !!daySession;

            return (
              <Card
                key={index}
                shadow={isToday ? "md" : "xs"}
                padding="md"
                radius="md"
                withBorder
                style={{
                  borderColor: isToday ? "var(--mantine-color-blue-4)" : undefined,
                  borderWidth: isToday ? 2 : 1,
                  opacity: !hasSession ? 0.6 : 1,
                }}
              >
                <Group justify="space-between" mb={hasSession ? "sm" : 0}>
                  <Group gap="sm">
                    <Badge
                      size="lg"
                      variant={isToday ? "filled" : "light"}
                      color={isToday ? "blue" : "gray"}
                    >
                      {DAY_SHORT[index]}
                    </Badge>
                    {isToday && (
                      <Badge size="sm" color="blue" variant="dot">
                        Hoy
                      </Badge>
                    )}
                  </Group>
                  {hasSession && daySession.completed && (
                    <ThemeIcon size="sm" color="green" variant="filled" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  )}
                </Group>

                {hasSession ? (
                  <Stack gap="xs">
                    <Text fw={500} size="sm">
                      {daySession.sessionId?.name || "Sesión"}
                    </Text>
                    {daySession.sessionId?.type && (
                      <Badge
                        size="xs"
                        variant="light"
                        color={daySession.sessionId.type === "strength" ? "blue" : "green"}
                        leftSection={getSessionTypeIcon(daySession.sessionId.type)}
                      >
                        {getSessionTypeLabel(daySession.sessionId.type)}
                      </Badge>
                    )}

                    <Group gap="xs" mt="xs">
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconChevronRight size={14} />}
                        onClick={() => handleViewSession(daySession)}
                      >
                        Ver detalles
                      </Button>

                      {(isToday || isPast) && !daySession.completed && (
                        <Button
                          size="xs"
                          color="green"
                          variant="filled"
                          leftSection={<IconCheck size={14} />}
                          loading={markingDay === index}
                          onClick={() => handleMarkCompleted(index, true)}
                        >
                          Completar
                        </Button>
                      )}

                      {daySession.completed && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => handleMarkCompleted(index, false)}
                          loading={markingDay === index}
                        >
                          Desmarcar
                        </Button>
                      )}
                    </Group>
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    Día de descanso
                  </Text>
                )}
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Plan Notes */}
        {activePlan.notes && (
          <Paper shadow="xs" p="md" radius="md" withBorder>
            <Text size="sm" fw={600} mb="xs">
              Notas del entrenador
            </Text>
            <Text size="sm" c="dimmed">
              {activePlan.notes}
            </Text>
          </Paper>
        )}
      </Stack>

      {/* Session Detail Modal */}
      <Modal
        opened={sessionModalOpen}
        onClose={() => {
          setSessionModalOpen(false);
          setSelectedDaySession(null);
          setSessionExercises([]);
        }}
        closeOnClickOutside={false}
        title={
          <Group gap="sm">
            <ThemeIcon size="md" variant="light" color="blue">
              <IconBarbell size={16} />
            </ThemeIcon>
            <div>
              <Text fw={600}>
                {selectedDaySession?.sessionId?.name || "Sesión de entrenamiento"}
              </Text>
              {selectedDaySession?.sessionId?.type && (
                <Badge
                  size="xs"
                  variant="light"
                  color={selectedDaySession.sessionId.type === "strength" ? "blue" : "green"}
                  leftSection={getSessionTypeIcon(selectedDaySession.sessionId.type)}
                >
                  {getSessionTypeLabel(selectedDaySession.sessionId.type)}
                </Badge>
              )}
            </div>
          </Group>
        }
        size="lg"
      >
        {loadingExercises ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <Stack gap="md">
            {/* Session info */}
            {selectedDaySession?.sessionId?.goals?.length > 0 && (
              <Group gap="xs">
                <IconTarget size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  Objetivos:
                </Text>
                {selectedDaySession.sessionId.goals.map((goal: any) => (
                  <Badge key={goal._id} size="sm" variant="light">
                    {goal.name}
                  </Badge>
                ))}
              </Group>
            )}

            {selectedDaySession?.sessionId?.muscleFocus?.length > 0 && (
              <Group gap="xs">
                <IconBarbell size={16} color="gray" />
                <Text size="sm" c="dimmed">
                  Músculos:
                </Text>
                {selectedDaySession.sessionId.muscleFocus.map((muscle: any) => (
                  <Badge key={muscle._id} size="sm" variant="light" color="orange">
                    {muscle.name}
                  </Badge>
                ))}
              </Group>
            )}

            {selectedDaySession?.sessionId?.notes && (
              <Alert color="gray" icon={<IconClock size={16} />}>
                <Text size="sm">{selectedDaySession.sessionId.notes}</Text>
              </Alert>
            )}

            {selectedDaySession?.notes && (
              <Alert color="blue" icon={<IconClock size={16} />}>
                <Text size="sm" fw={500}>Nota del día:</Text>
                <Text size="sm">{selectedDaySession.notes}</Text>
              </Alert>
            )}

            <Divider label={`Ejercicios (${sessionExercises.length})`} labelPosition="left" />

            {sessionExercises.length === 0 ? (
              <Text c="dimmed" ta="center" py="md">
                No hay ejercicios configurados para esta sesión
              </Text>
            ) : (
              <Accordion variant="separated">
                {sessionExercises.map((exercise, idx) => {
                  const exerciseCompleted = isExerciseCompleted(exercise._id);
                  const exerciseData = exercise.exerciseId;

                  return (
                    <Accordion.Item key={exercise._id} value={exercise._id}>
                      <Accordion.Control>
                        <Group gap="sm" wrap="nowrap">
                          <Checkbox
                            checked={exerciseCompleted}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleMarkExerciseCompleted(exercise._id, e.currentTarget.checked);
                            }}
                            disabled={markingExercise === exercise._id}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <ThemeIcon
                            size="sm"
                            radius="xl"
                            color={exerciseCompleted ? "green" : "blue"}
                            variant={exerciseCompleted ? "filled" : "light"}
                          >
                            {exerciseCompleted ? (
                              <IconCheck size={12} />
                            ) : (
                              <Text size="xs" fw={600}>
                                {idx + 1}
                              </Text>
                            )}
                          </ThemeIcon>
                          <div style={{ flex: 1 }}>
                            <Text
                              fw={500}
                              size="sm"
                              td={exerciseCompleted ? "line-through" : undefined}
                              c={exerciseCompleted ? "dimmed" : undefined}
                            >
                              {exerciseData?.name || "Ejercicio"}
                            </Text>
                            {exerciseData?.difficulty && (
                              <Badge
                                size="xs"
                                variant="light"
                                color={getDifficultyColor(exerciseData.difficulty)}
                              >
                                {exerciseData.difficulty}
                              </Badge>
                            )}
                          </div>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="sm">
                          {/* Exercise details */}
                          {exerciseData?.description && (
                            <Text size="sm" c="dimmed">
                              {exerciseData.description}
                            </Text>
                          )}

                          {/* Muscle groups and equipment */}
                          <Group gap="md">
                            {exerciseData?.muscleGroups?.length > 0 && (
                              <Group gap="xs">
                                <Text size="xs" c="dimmed">Músculos:</Text>
                                {exerciseData.muscleGroups.map((mg: any) => (
                                  <Badge key={mg._id} size="xs" variant="dot" color="orange">
                                    {mg.name}
                                  </Badge>
                                ))}
                              </Group>
                            )}
                            {exerciseData?.equipment?.length > 0 && (
                              <Group gap="xs">
                                <Text size="xs" c="dimmed">Equipamiento:</Text>
                                {exerciseData.equipment.map((eq: any) => (
                                  <Badge key={eq._id} size="xs" variant="dot" color="cyan">
                                    {eq.name}
                                  </Badge>
                                ))}
                              </Group>
                            )}
                          </Group>

                          {/* Embedded YouTube video */}
                          {exerciseData?.videoUrl && (() => {
                            const videoId = getYouTubeVideoId(exerciseData.videoUrl);
                            if (videoId) {
                              return (
                                <AspectRatio ratio={16 / 9}>
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={exerciseData.name}
                                    style={{ border: 0, borderRadius: 8 }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </AspectRatio>
                              );
                            }
                            return null;
                          })()}

                          {/* Exercise image */}
                          {exerciseData?.imageUrl && (
                            <Image
                              src={exerciseData.imageUrl}
                              alt={exerciseData.name}
                              radius="md"
                              mah={200}
                              fit="contain"
                            />
                          )}

                          <Divider />

                          {/* Configuration based on type */}
                          <div>
                            <Text size="sm" fw={500} mb="xs">
                              Configuración:
                            </Text>
                            {exercise.config?.type === "strength" &&
                              renderStrengthConfig(exercise.config as StrengthConfig)}
                            {exercise.config?.type === "cardio_continuous" &&
                              renderCardioContinuousConfig(exercise.config as CardioContinuousConfig)}
                            {exercise.config?.type === "cardio_interval" &&
                              renderCardioIntervalConfig(exercise.config as CardioIntervalConfig)}
                          </div>

                          {/* Exercise notes */}
                          {exercise.notes && (
                            <Alert color="blue" variant="light" icon={<IconClock size={14} />}>
                              <Text size="xs">{exercise.notes}</Text>
                            </Alert>
                          )}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}

            {/* Complete from modal */}
            {selectedDaySession && !selectedDaySession.completed && (
              <Button
                fullWidth
                size="md"
                color="green"
                leftSection={<IconCheck size={18} />}
                loading={markingDay === selectedDaySession.dayOfWeek}
                onClick={() => {
                  handleMarkCompleted(selectedDaySession.dayOfWeek, true);
                }}
              >
                Marcar día como completado
              </Button>
            )}

            {selectedDaySession?.completed && (
              <Button
                fullWidth
                size="md"
                variant="light"
                color="gray"
                loading={markingDay === selectedDaySession.dayOfWeek}
                onClick={() => {
                  handleMarkCompleted(selectedDaySession.dayOfWeek, false);
                }}
              >
                Desmarcar día
              </Button>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default ClientTrainingPlan;
