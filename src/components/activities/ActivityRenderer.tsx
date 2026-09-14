import { CountSelectActivity } from "@/components/activities/CountSelectActivity";
import { MultipleChoiceActivity } from "@/components/activities/MultipleChoiceActivity";
import { NumberRecognitionActivity } from "@/components/activities/NumberRecognitionActivity";
import type { ActivityComponentProps } from "@/types/learning";

/**
 * Selects the right activity component for a question's activity type.
 * Unimplemented types (COUNT_INPUT, DRAG_MATCH, TRACE_NUMBER, COUNT_CIRCLE,
 * SAME_AMOUNT) fall back to the option-choice renderer for now — none of
 * them are seeded yet (see prisma/seed.ts), so this path isn't reachable
 * with current content, but content authored later shouldn't crash if it
 * uses a type whose dedicated component hasn't been built.
 */
export function ActivityRenderer(props: ActivityComponentProps) {
  switch (props.question.activityType) {
    case "MULTIPLE_CHOICE":
      return <MultipleChoiceActivity {...props} />;
    case "NUMBER_RECOGNITION":
      return <NumberRecognitionActivity {...props} />;
    case "COUNT_SELECT":
    default:
      return <CountSelectActivity {...props} />;
  }
}
