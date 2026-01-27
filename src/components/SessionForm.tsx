import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import {
  Button,
  Stack,
  Paper,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Group,
  Card,
  Text,
  Divider,
  ActionIcon,
  NumberInput,
  Modal,
  Badge,
  Alert,
  Collapse,
  SegmentedControl,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import {
  getMuscleGroupsByOrganizationId,
  getSessionGoalsByOrganizationId,
  type MuscleGroup,
  type SessionGoal,
} from "../services/trainingCatalogService";
import {
  createSession,
  createSessionExercise,
  updateSession,
  updateSessionExercise,
  deleteSessionExercise,
  getSessionById,
  type ExerciseConfig,
  type StrengthSet,
} from "../services/trainingSessionService";
import { getExercisesByOrganizationId, type Exercise } from "../services/exerciseService";

interface SessionExerciseForm {
  _id?: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  notes: string;
  config: ExerciseConfig;
  isNew?: boolean;
  expanded?: boolean;
}

interface SessionFormProps {
  /** Session ID for editing mode */
  sessionId?: string;
  /** Called when session is saved successfully */
  onSave?: (sessionId: string, sessionName: string) => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Whether to show cancel button */
  showCancelButton?: boolean;
  /** Custom label for save button */
  saveButtonLabel?: string;
  /** Custom label for cancel button */
  cancelButtonLabel?: string;
}

const SessionForm: React.FC<SessionFormProps> = ({
  sessionId,
  onSave,
  onCancel,
  showCancelButton = true,
  saveButtonLabel,
  cancelButtonLabel = "Cancelar",
}) => {
  const isEditing = !!sessionId;

  const organizationId = useSelector(
    (state: RootState) => state.organization.organization?._id
  );

  // Catalogs
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [sessionGoals, setSessionGoals] = useState<SessionGoal[]>([]);

  // Session exercises
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseForm[]>([]);

  // Exercise selection
  const [exerciseModal, setExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [exerciseFilter, setExerciseFilter] = useState("");
  const [selectedExerciseType, setSelectedExerciseType] = useState<"strength" | "cardio">("strength");
  const [selectedCardioMode, setSelectedCardioMode] = useState<"cardio_continuous" | "cardio_interval">("cardio_continuous");

  // Loading
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const sessionForm = useForm({
    initialValues: {
      name: "",
      type: "mixed" as "strength" | "cardio" | "mixed",
      goals: [] as string[],
      muscleFocus: [] as string[],
      notes: "",
    },
    validate: {
      name: (value) => (value.trim() ? null : "El nombre es obligatorio"),
      type: (value) => (value ? null : "El tipo es obligatorio"),
    },
  });

  // Load catalogs and exercises on mount
  useEffect(() => {
    if (organizationId) {
      loadCatalogs();
      loadExercises();
    }
  }, [organizationId]);

  // Load session if editing
  useEffect(() => {
    if (isEditing && sessionId && organizationId) {
      loadSession(sessionId);
    }
  }, [isEditing, sessionId, organizationId]);

  // Reset form when sessionId changes (for modal reuse)
  useEffect(() => {
    if (!sessionId) {
      sessionForm.reset();
      setSessionExercises([]);
      setExerciseFilter("");
    }
  }, [sessionId]);

  const loadCatalogs = async () => {
    if (!organizationId) return;
    const [mg, sg] = await Promise.all([
      getMuscleGroupsByOrganizationId(organizationId),
      getSessionGoalsByOrganizationId(organizationId),
    ]);
    setMuscleGroups(mg);
    setSessionGoals(sg);
  };

  const loadExercises = async () => {
    if (!organizationId) return;
    const exercises = await getExercisesByOrganizationId(organizationId);
    setAvailableExercises(exercises);
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    const session = await getSessionById(id);
    if (session) {
      sessionForm.setValues({
        name: session.name,
        type: session.type,
        goals: session.goals.map((g) => g._id),
        muscleFocus: session.muscleFocus.map((m) => m._id),
        notes: session.notes || "",
      });

      if (session.exercises) {
        const formExercises: SessionExerciseForm[] = session.exercises.map(
          (ex) => ({
            _id: ex._id,
            exerciseId: ex.exerciseId._id,
            exerciseName: ex.exerciseId.name,
            order: ex.order,
            notes: ex.notes || "",
            config: ex.config,
            isNew: false,
            expanded: false,
          })
        );
        setSessionExercises(formExercises);
      }
    }
    setLoading(false);
  };

  // Handle session submission
  const handleSaveSession = async (values: typeof sessionForm.values) => {
    if (!organizationId) return;

    if (sessionExercises.length === 0) {
      notifications.show({
        title: "Error",
        message: "Debes agregar al menos un ejercicio a la sesión",
        color: "red",
      });
      return;
    }

    setSaving(true);
    try {
      let savedSessionId: string;
      let savedSessionName: string;

      if (isEditing && sessionId) {
        // Update existing session
        await updateSession(sessionId, {
          ...values,
          organizationId,
        });
        savedSessionId = sessionId;
        savedSessionName = values.name;

        // Save exercises
        await saveSessionExercises(sessionId);
      } else {
        // Create new session
        const newSession = await createSession({
          ...values,
          organizationId,
        });

        if (!newSession) {
          throw new Error("Error al crear la sesión");
        }

        savedSessionId = newSession._id;
        savedSessionName = newSession.name;

        // Create exercises
        for (const ex of sessionExercises) {
          await createSessionExercise(savedSessionId, {
            organizationId,
            sessionId: savedSessionId,
            exerciseId: ex.exerciseId,
            order: ex.order,
            notes: ex.notes,
            config: ex.config,
          });
        }
      }

      notifications.show({
        title: "Éxito",
        message: `Sesión ${isEditing ? "actualizada" : "creada"} exitosamente`,
        color: "green",
      });

      onSave?.(savedSessionId, savedSessionName);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Error al guardar la sesión",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSessionExercises = async (sessId: string) => {
    if (!organizationId) return;

    for (const ex of sessionExercises) {
      if (ex.isNew) {
        await createSessionExercise(sessId, {
          organizationId,
          sessionId: sessId,
          exerciseId: ex.exerciseId,
          order: ex.order,
          notes: ex.notes,
          config: ex.config,
        });
      } else if (ex._id) {
        await updateSessionExercise(ex._id, {
          order: ex.order,
          notes: ex.notes,
          config: ex.config,
        });
      }
    }
  };

  // Add exercise to session
  const handleAddExercise = (exercise: Exercise) => {
    const sessionType = sessionForm.values.type;

    let defaultConfig: ExerciseConfig;

    // For mixed sessions, use the selected exercise type
    // For strength/cardio sessions, use the session type
    const exerciseType = sessionType === "mixed" ? selectedExerciseType : sessionType;

    if (exerciseType === "strength") {
      defaultConfig = {
        type: "strength",
        sets: [
          {
            repsMin: 8,
            repsMax: 12,
            load: undefined,
            restSeconds: 90,
            rpe: undefined,
          },
        ],
      };
    } else {
      // Use selected cardio mode
      if (selectedCardioMode === "cardio_interval") {
        defaultConfig = {
          type: "cardio_interval",
          workSeconds: 30,
          restSeconds: 30,
          rounds: 10,
          workEffort: undefined,
          restEffort: undefined,
        };
      } else {
        defaultConfig = {
          type: "cardio_continuous",
          durationMinutes: 20,
          effort: undefined,
          pace: undefined,
        };
      }
    }

    const newExercise: SessionExerciseForm = {
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      order: sessionExercises.length,
      notes: "",
      config: defaultConfig,
      isNew: true,
      expanded: true,
    };

    setSessionExercises([...sessionExercises, newExercise]);
    setExerciseModal(false);
    setExerciseFilter("");
  };

  // Remove exercise
  const handleRemoveExercise = async (index: number) => {
    const exercise = sessionExercises[index];
    if (exercise._id && !exercise.isNew) {
      await deleteSessionExercise(exercise._id);
    }
    setSessionExercises(sessionExercises.filter((_, i) => i !== index));
  };

  // Update exercise config
  const updateExerciseConfig = (index: number, config: ExerciseConfig) => {
    const updated = [...sessionExercises];
    updated[index].config = config;
    setSessionExercises(updated);
  };

  // Toggle exercise expansion
  const toggleExerciseExpansion = (index: number) => {
    const updated = [...sessionExercises];
    updated[index].expanded = !updated[index].expanded;
    setSessionExercises(updated);
  };

  // Render exercise config based on type
  const renderExerciseConfig = (exercise: SessionExerciseForm, index: number) => {
    const config = exercise.config;

    if (config.type === "strength") {
      return (
        <Stack gap="sm">
          {config.sets.map((set, setIndex) => (
            <Card key={setIndex} withBorder p="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  Serie {setIndex + 1}
                </Text>
                {config.sets.length > 1 && (
                  <ActionIcon
                    size="sm"
                    color="red"
                    variant="subtle"
                    onClick={() => {
                      const newSets = config.sets.filter((_, i) => i !== setIndex);
                      updateExerciseConfig(index, { ...config, sets: newSets });
                    }}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Group>
              <Group grow>
                <NumberInput
                  label="Carga (kg)"
                  placeholder="Opcional"
                  min={0}
                  value={set.load}
                  onChange={(val) => {
                    const newSets = [...config.sets];
                    newSets[setIndex].load = val as number | undefined;
                    updateExerciseConfig(index, { ...config, sets: newSets });
                  }}
                />
                <NumberInput
                  label="Reps Mín"
                  min={1}
                  required
                  value={set.repsMin}
                  onChange={(val) => {
                    const newSets = [...config.sets];
                    newSets[setIndex].repsMin = val as number;
                    updateExerciseConfig(index, { ...config, sets: newSets });
                  }}
                />
                <NumberInput
                  label="Reps Máx"
                  min={1}
                  required
                  value={set.repsMax}
                  onChange={(val) => {
                    const newSets = [...config.sets];
                    newSets[setIndex].repsMax = val as number;
                    updateExerciseConfig(index, { ...config, sets: newSets });
                  }}
                />
                <NumberInput
                  label="Descanso (seg)"
                  placeholder="Opcional"
                  min={0}
                  value={set.restSeconds}
                  onChange={(val) => {
                    const newSets = [...config.sets];
                    newSets[setIndex].restSeconds = val as number | undefined;
                    updateExerciseConfig(index, { ...config, sets: newSets });
                  }}
                />
                <NumberInput
                  label="RPE (1-10)"
                  placeholder="Opcional"
                  min={1}
                  max={10}
                  value={set.rpe}
                  onChange={(val) => {
                    const newSets = [...config.sets];
                    newSets[setIndex].rpe = val as number | undefined;
                    updateExerciseConfig(index, { ...config, sets: newSets });
                  }}
                />
              </Group>
            </Card>
          ))}
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              const lastSet = config.sets[config.sets.length - 1];
              const newSet: StrengthSet = {
                repsMin: lastSet.repsMin,
                repsMax: lastSet.repsMax,
                load: lastSet.load,
                restSeconds: lastSet.restSeconds,
                rpe: lastSet.rpe,
              };
              updateExerciseConfig(index, {
                ...config,
                sets: [...config.sets, newSet],
              });
            }}
          >
            Agregar serie
          </Button>
        </Stack>
      );
    }

    if (config.type === "cardio_continuous") {
      return (
        <Stack gap="sm">
          <Group grow>
            <NumberInput
              label="Duración (min)"
              required
              min={0.1}
              step={0.5}
              value={config.durationMinutes}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  durationMinutes: val as number,
                })
              }
            />
            <NumberInput
              label="Zona (1-5)"
              placeholder="Opcional"
              min={1}
              max={5}
              value={config.zone}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  zone: val as number | undefined,
                })
              }
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Esfuerzo (1-10)"
              placeholder="Opcional"
              min={1}
              max={10}
              value={config.effort}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  effort: val as number | undefined,
                })
              }
            />
            <TextInput
              label="Ritmo"
              placeholder="Ej: 10 km/h"
              value={config.pace || ""}
              onChange={(e) =>
                updateExerciseConfig(index, {
                  ...config,
                  pace: e.target.value,
                })
              }
            />
          </Group>
        </Stack>
      );
    }

    if (config.type === "cardio_interval") {
      return (
        <Stack gap="sm">
          <Group grow>
            <NumberInput
              label="Tiempo de ejecución (seg)"
              required
              min={1}
              value={config.workSeconds}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  workSeconds: val as number,
                })
              }
            />
            <NumberInput
              label="Tiempo de descanso (seg)"
              required
              min={0}
              value={config.restSeconds}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  restSeconds: val as number,
                })
              }
            />
            <NumberInput
              label="Rondas"
              required
              min={1}
              value={config.rounds}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  rounds: val as number,
                })
              }
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Esfuerzo Trabajo (1-10)"
              placeholder="Opcional"
              min={1}
              max={10}
              value={config.workEffort}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  workEffort: val as number | undefined,
                })
              }
            />
            <NumberInput
              label="Esfuerzo Descanso (1-10)"
              placeholder="Opcional"
              min={1}
              max={10}
              value={config.restEffort}
              onChange={(val) =>
                updateExerciseConfig(index, {
                  ...config,
                  restEffort: val as number | undefined,
                })
              }
            />
          </Group>
        </Stack>
      );
    }

    return null;
  };

  // Check if can change to a specific type
  const canChangeToType = (targetType: "strength" | "cardio" | "mixed") => {
    if (sessionExercises.length === 0) return true;
    if (targetType === "mixed") return true; // Can always change to mixed

    const hasStrengthExercises = sessionExercises.some(
      (ex) => ex.config.type === "strength"
    );
    const hasCardioExercises = sessionExercises.some(
      (ex) =>
        ex.config.type === "cardio_continuous" ||
        ex.config.type === "cardio_interval"
    );

    if (targetType === "strength" && hasCardioExercises) return false;
    if (targetType === "cardio" && hasStrengthExercises) return false;

    return true;
  };

  const filteredExercises = availableExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(exerciseFilter.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(exerciseFilter.toLowerCase())
  );

  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Text c="dimmed">Cargando sesión...</Text>
      </Stack>
    );
  }

  return (
    <>
      <form onSubmit={sessionForm.onSubmit(handleSaveSession)}>
        <Stack gap="md">
          {/* Session Metadata */}
          <Paper withBorder p="md">
            <Stack gap="md">
              <Text fw={500}>Información General</Text>
              <TextInput
                label="Nombre de la Sesión"
                placeholder="Ej: Hipertrofia Pecho/Tríceps, HIIT 20min, etc."
                required
                {...sessionForm.getInputProps("name")}
              />

              <Select
                label="Tipo de Sesión"
                placeholder="Selecciona el tipo"
                required
                data={[
                  {
                    value: "mixed",
                    label: "Mixta (Fuerza + Cardio)",
                  },
                  {
                    value: "strength",
                    label: "Solo Fuerza",
                    disabled: !canChangeToType("strength"),
                  },
                  {
                    value: "cardio",
                    label: "Solo Cardio",
                    disabled: !canChangeToType("cardio"),
                  },
                ]}
                {...sessionForm.getInputProps("type")}
              />

              {sessionExercises.length > 0 &&
                (sessionForm.values.type !== "mixed" && !canChangeToType(sessionForm.values.type)) && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Cambio de tipo bloqueado"
                  color="yellow"
                >
                  No puedes cambiar a este tipo porque ya contiene ejercicios incompatibles.
                  Cambia a "Mixta" para permitir ambos tipos.
                </Alert>
              )}

              <MultiSelect
                label="Objetivos"
                placeholder="Selecciona uno o más objetivos"
                data={sessionGoals.map((sg) => ({
                  value: sg._id,
                  label: sg.name,
                }))}
                {...sessionForm.getInputProps("goals")}
              />

              <MultiSelect
                label="Enfoque Muscular"
                placeholder="Selecciona grupos musculares"
                data={muscleGroups.map((mg) => ({
                  value: mg._id,
                  label: mg.name,
                }))}
                {...sessionForm.getInputProps("muscleFocus")}
              />

              <Textarea
                label="Notas"
                placeholder="Notas adicionales sobre la sesión"
                rows={2}
                {...sessionForm.getInputProps("notes")}
              />
            </Stack>
          </Paper>

          {/* Session Exercises */}
          <Paper withBorder p="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>Ejercicios ({sessionExercises.length})</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="light"
                  size="sm"
                  onClick={() => setExerciseModal(true)}
                >
                  Agregar Ejercicio
                </Button>
              </Group>

              {sessionExercises.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">
                  No hay ejercicios agregados. Haz clic en "Agregar Ejercicio"
                  para comenzar.
                </Text>
              ) : (
                <Stack gap="sm">
                  {sessionExercises.map((exercise, index) => (
                    <Card key={index} withBorder p="sm">
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Group>
                            <ActionIcon
                              variant="subtle"
                              style={{ cursor: "grab" }}
                            >
                              <IconGripVertical size={16} />
                            </ActionIcon>
                            <div>
                              <Text fw={500} size="sm">
                                {exercise.exerciseName}
                              </Text>
                              <Badge size="xs" variant="light">
                                {exercise.config.type === "strength"
                                  ? "Fuerza"
                                  : exercise.config.type === "cardio_continuous"
                                  ? "Cardio Continuo"
                                  : "Cardio Intervalos"}
                              </Badge>
                            </div>
                          </Group>
                          <Group>
                            <ActionIcon
                              variant="subtle"
                              onClick={() => toggleExerciseExpansion(index)}
                            >
                              {exercise.expanded ? (
                                <IconChevronUp size={16} />
                              ) : (
                                <IconChevronDown size={16} />
                              )}
                            </ActionIcon>
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => handleRemoveExercise(index)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>

                        <Collapse in={exercise.expanded}>
                          <Stack gap="sm" pt="sm">
                            {sessionForm.values.type === "cardio" && (
                              <Select
                                label="Modalidad de Cardio"
                                size="xs"
                                data={[
                                  {
                                    value: "cardio_continuous",
                                    label: "Cardio Continuo",
                                  },
                                  {
                                    value: "cardio_interval",
                                    label: "Cardio por Intervalos",
                                  },
                                ]}
                                value={exercise.config.type}
                                onChange={(value) => {
                                  if (
                                    value === "cardio_continuous" ||
                                    value === "cardio_interval"
                                  ) {
                                    const newConfig: ExerciseConfig =
                                      value === "cardio_continuous"
                                        ? {
                                            type: "cardio_continuous",
                                            durationMinutes: 20,
                                          }
                                        : {
                                            type: "cardio_interval",
                                            workSeconds: 30,
                                            restSeconds: 30,
                                            rounds: 10,
                                          };
                                    updateExerciseConfig(index, newConfig);
                                  }
                                }}
                              />
                            )}

                            <Divider label="Configuración" labelPosition="left" />
                            {renderExerciseConfig(exercise, index)}

                            <Textarea
                              label="Notas del ejercicio"
                              placeholder="Notas específicas"
                              size="xs"
                              value={exercise.notes}
                              onChange={(e) => {
                                const updated = [...sessionExercises];
                                updated[index].notes = e.target.value;
                                setSessionExercises(updated);
                              }}
                            />
                          </Stack>
                        </Collapse>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Group justify="flex-end">
            {showCancelButton && onCancel && (
              <Button variant="subtle" onClick={onCancel}>
                {cancelButtonLabel}
              </Button>
            )}
            <Button type="submit" loading={saving}>
              {saveButtonLabel || (isEditing ? "Guardar Cambios" : "Crear Sesión")}
            </Button>
          </Group>
        </Stack>
      </form>

      {/* Exercise Selection Modal */}
      <Modal
        opened={exerciseModal}
        onClose={() => {
          setExerciseModal(false);
          setExerciseFilter("");
        }}
        title="Seleccionar Ejercicio"
        size="lg"
        centered
      >
        <Stack gap="md">
          {/* Type selector for mixed sessions */}
          {sessionForm.values.type === "mixed" && (
            <SegmentedControl
              value={selectedExerciseType}
              onChange={(value) => setSelectedExerciseType(value as "strength" | "cardio")}
              data={[
                { label: "Ejercicio de Fuerza", value: "strength" },
                { label: "Ejercicio de Cardio", value: "cardio" },
              ]}
              fullWidth
            />
          )}

          {/* Cardio mode selector - show when cardio is selected (mixed) or session is cardio-only */}
          {(sessionForm.values.type === "cardio" ||
            (sessionForm.values.type === "mixed" && selectedExerciseType === "cardio")) && (
            <SegmentedControl
              value={selectedCardioMode}
              onChange={(value) => setSelectedCardioMode(value as "cardio_continuous" | "cardio_interval")}
              data={[
                { label: "Continuo", value: "cardio_continuous" },
                { label: "Por Intervalos", value: "cardio_interval" },
              ]}
              fullWidth
              size="xs"
            />
          )}

          <TextInput
            placeholder="Filtrar ejercicios..."
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.currentTarget.value)}
          />

          {filteredExercises.length === 0 ? (
            <Text c="dimmed" ta="center" py="md">
              {availableExercises.length === 0
                ? "No hay ejercicios en el catálogo"
                : "No se encontraron ejercicios"}
            </Text>
          ) : (
            <Stack gap="xs" mah={400} style={{ overflow: "auto" }}>
              {filteredExercises.map((exercise) => (
                <Card
                  key={exercise._id}
                  withBorder
                  p="sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAddExercise(exercise)}
                >
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{exercise.name}</Text>
                      {exercise.description && (
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {exercise.description}
                        </Text>
                      )}
                    </div>
                    <Badge>{exercise.difficulty}</Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default SessionForm;
