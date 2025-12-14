"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import WorkoutChat from "./components/workout-chat";
// removed router since right panel is purely profile

export default function AIPlannerPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const [goal] = useState("");
  const [days] = useState(3);
  const [experience] = useState<"Beginner" | "Intermediate" | "Advanced">(
    "Beginner",
  );
  const [equipment] = useState<"Full Gym" | "Dumbbells" | "Home Setup">(
    "Full Gym",
  );

  // generation and adjustments happen within the chat component

  return (
    <div className="h-full overflow-hidden">
      <WorkoutChat
        userId={userId}
        goal={goal}
        days={days}
        experience={experience}
        equipment={equipment}
        onPlanCreated={(id) => void id}
      />
    </div>
  );
}
