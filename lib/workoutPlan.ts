export const WORKOUT_PLAN = {
  Push: {
    label: "Day 01 — Push",
    color: "orange",
    sections: [
      {
        name: "Chest",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: 10, note: "Start 15kg → build to 25kg" },
          { name: "Dumbbell Incline Fly", sets: 3, reps: 10, note: "7.5 → 12.5 kg, squeeze at top" },
          { name: "Barbell Incline Press", sets: 3, reps: 10, note: "15 → 20 kg, drop if form breaks" },
          { name: "Pec Deck Fly", sets: 3, reps: 12, note: "Squeeze 2 sec at peak" },
        ],
      },
      {
        name: "Triceps",
        exercises: [
          { name: "Cable Pushdown (rope)", sets: 3, reps: 12, note: "Elbows fixed, slow return" },
          { name: "Overhead Rope Extension", sets: 3, reps: 12, note: "Arms fully up, push back down" },
        ],
      },
      {
        name: "Core",
        exercises: [
          { name: "Plank", sets: 3, reps: 30, note: "seconds — build to 60s" },
          { name: "Crunches", sets: 3, reps: 20, note: "Slow, feel the squeeze" },
          { name: "Leg Raises", sets: 3, reps: 15, note: "Lower abs — belly area" },
        ],
      },
    ],
  },
  Pull: {
    label: "Day 02 — Pull",
    color: "blue",
    sections: [
      {
        name: "Back",
        exercises: [
          { name: "Lat Pulldown", sets: 4, reps: 10, note: "53 → 71 kg range" },
          { name: "Cable Row", sets: 3, reps: 10, note: "41 kg — squeeze shoulder blades" },
          { name: "Barbell Row", sets: 3, reps: 10, note: "Use 20–25 kg minimum" },
          { name: "Dumbbell One Arm Row", sets: 3, reps: 10, note: "Good for back thickness" },
        ],
      },
      {
        name: "Biceps",
        exercises: [
          { name: "Barbell Curl", sets: 3, reps: 10, note: "7.5 kg — clean form only" },
          { name: "Hammer Curl", sets: 3, reps: 10, note: "7.5 → 10 kg" },
        ],
      },
      {
        name: "Core",
        exercises: [
          { name: "Russian Twist", sets: 3, reps: 20, note: "Obliques — side belly" },
          { name: "Bicycle Crunch", sets: 3, reps: 20, note: "Full ab activation" },
          { name: "Plank", sets: 2, reps: 30, note: "seconds" },
        ],
      },
    ],
  },
  Shoulders: {
    label: "Day 03 — Shoulders + Arms",
    color: "purple",
    sections: [
      {
        name: "Shoulders",
        exercises: [
          { name: "Shoulder Press Machine", sets: 4, reps: 10, note: "Main compound — go heavy" },
          { name: "Dumbbell Side Lateral Raise", sets: 3, reps: 12, note: "Light — strict form, no swinging" },
          { name: "Barbell Front Raise", sets: 3, reps: 10, note: "Control it down slowly" },
          { name: "Barbell Upright Row", sets: 3, reps: 10, note: "Stop at chin height" },
        ],
      },
      {
        name: "Arms",
        exercises: [
          { name: "Dumbbell Curl", sets: 3, reps: 12, note: "Left arm first — fix imbalance" },
          { name: "Preacher Curl", sets: 3, reps: 10, note: "Max 15 kg — clean reps only" },
          { name: "Cable Pushdown", sets: 2, reps: 12, note: "Light — arms already tired" },
        ],
      },
      {
        name: "Core",
        exercises: [
          { name: "Hanging Knee Raise", sets: 3, reps: 15, note: "Great for lower belly" },
          { name: "Russian Twist", sets: 3, reps: 20, note: "Obliques" },
          { name: "Plank", sets: 3, reps: 40, note: "seconds" },
        ],
      },
    ],
  },
  Legs: {
    label: "Day 04 — Legs + Core",
    color: "green",
    sections: [
      {
        name: "Legs",
        exercises: [
          { name: "Full Squat Smith Machine", sets: 4, reps: 10, note: "Most important — don't skip" },
          { name: "Leg Press", sets: 3, reps: 10, note: "Good volume builder" },
          { name: "Leg Extension", sets: 3, reps: 12, note: "Quad isolation" },
          { name: "Leg Curl", sets: 3, reps: 12, note: "Don't skip hamstrings" },
          { name: "Calf Raise", sets: 3, reps: 15, note: "You cycle — build these" },
        ],
      },
      {
        name: "Core — Hardest Day",
        exercises: [
          { name: "Plank", sets: 3, reps: 45, note: "seconds" },
          { name: "Leg Raises", sets: 3, reps: 20, note: "Lower abs" },
          { name: "Crunches", sets: 3, reps: 25, note: "Slow and controlled" },
          { name: "Russian Twist", sets: 3, reps: 20, note: "Side belly" },
          { name: "Bicycle Crunch", sets: 3, reps: 20, note: "Full activation" },
        ],
      },
    ],
  },
  "Core Only": {
    label: "Rest Day — Core Only",
    color: "gray",
    sections: [
      {
        name: "Core",
        exercises: [
          { name: "Plank", sets: 3, reps: 45, note: "seconds" },
          { name: "Crunches", sets: 3, reps: 25, note: "Slow" },
          { name: "Leg Raises", sets: 3, reps: 15, note: "Lower abs" },
        ],
      },
    ],
  },
  Rest: {
    label: "Rest Day",
    color: "gray",
    sections: [],
  },
};

// The order you do sessions — not tied to any specific day of the week.
// You go when you can. The sequence just repeats.
export const SESSION_SEQUENCE: Array<keyof typeof WORKOUT_PLAN> = [
  "Push",
  "Pull",
  "Shoulders",
  "Legs",
];

// Given past logs, figure out what the next session should be
export const getNextSession = (
  pastDayTypes: Array<keyof typeof WORKOUT_PLAN>
): keyof typeof WORKOUT_PLAN => {
  const gymSessions = pastDayTypes.filter(
    (d) => d !== "Rest" && d !== "Core Only"
  );
  const lastSession = gymSessions[gymSessions.length - 1];
  if (!lastSession) return "Push"; // default: start with Push
  const idx = SESSION_SEQUENCE.indexOf(lastSession as typeof SESSION_SEQUENCE[number]);
  if (idx === -1) return "Push";
  return SESSION_SEQUENCE[(idx + 1) % SESSION_SEQUENCE.length];
};
