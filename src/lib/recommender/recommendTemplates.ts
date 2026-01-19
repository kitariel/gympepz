import type { ProgramTemplate, TemplateTag } from "@/lib/program-templates/types";
import type { UserTrainingProfile } from "@/lib/training-profile/types";

type Scored<T> = { item: T; score: number; reasons: string[] };

function hasTag(template: ProgramTemplate, tag: TemplateTag): boolean {
  return template.tags.includes(tag);
}

function isCompatible(profile: UserTrainingProfile, template: ProgramTemplate): boolean {
  if (profile.equipment === "full_gym") return true;
  if (profile.equipment === "bodyweight") return hasTag(template, "bodyweight");
  // dumbbells_only can also do bodyweight templates
  if (profile.equipment === "dumbbells_only") {
    return hasTag(template, "dumbbells_only") || hasTag(template, "bodyweight");
  }
  return true;
}

function scoreTemplate(
  profile: UserTrainingProfile,
  template: ProgramTemplate,
): Scored<ProgramTemplate> {
  let score = 0;
  const reasons: string[] = [];

  // Days/week match (strong signal)
  if (template.daysPerWeek === profile.daysPerWeek) {
    score += 40;
    reasons.push("days/week match");
  } else {
    // allow near matches but lower score
    const diff = Math.abs(template.daysPerWeek - profile.daysPerWeek);
    score += Math.max(0, 15 - diff * 5);
    reasons.push("days/week close");
  }

  // Experience
  if (profile.experience === "newbie" && hasTag(template, "newbie")) {
    score += 25;
    reasons.push("newbie");
  }
  if (profile.experience === "returning" && hasTag(template, "returning")) {
    score += 25;
    reasons.push("returning");
  }
  if (
    profile.experience === "intermediate" &&
    (hasTag(template, "intermediate") || hasTag(template, "beginner"))
  ) {
    score += 15;
    reasons.push("experience ok");
  }

  // Goal
  if (profile.goal === "fat_loss" && hasTag(template, "fat_loss")) {
    score += 20;
    reasons.push("fat loss");
  }
  if (profile.goal === "build_muscle" && hasTag(template, "build_muscle")) {
    score += 20;
    reasons.push("build muscle");
  }
  if (profile.goal === "strength" && hasTag(template, "strength")) {
    score += 20;
    reasons.push("strength");
  }
  if (profile.goal === "general_fitness" && hasTag(template, "general_fitness")) {
    score += 12;
    reasons.push("general fitness");
  }

  // Equipment
  if (profile.equipment === "full_gym") {
    // full gym can do everything, but prefer templates tagged full_gym
    if (hasTag(template, "full_gym")) {
      score += 12;
      reasons.push("full gym");
    }
  } else if (profile.equipment === "dumbbells_only") {
    if (hasTag(template, "dumbbells_only")) {
      score += 18;
      reasons.push("dumbbells");
    } else if (hasTag(template, "bodyweight")) {
      score += 10;
      reasons.push("bodyweight ok");
    } else {
      score -= 10;
      reasons.push("not dumbbells");
    }
  } else if (profile.equipment === "bodyweight") {
    if (hasTag(template, "bodyweight")) {
      score += 18;
      reasons.push("bodyweight");
    } else {
      score -= 10;
      reasons.push("not bodyweight");
    }
  }

  return { item: template, score, reasons };
}

export function recommendTemplates(
  profile: UserTrainingProfile,
  templates: ProgramTemplate[],
): ProgramTemplate[] {
  const scored = templates.map((t) => scoreTemplate(profile, t));

  // Hard filter: only show compatible templates for the chosen equipment.
  const filtered = scored.filter((s) => isCompatible(profile, s.item));

  filtered.sort((a, b) => b.score - a.score);
  return filtered.map((s) => s.item);
}

