import { OptionChoiceActivity } from "@/components/activities/OptionChoiceActivity";
import type { ActivityComponentProps } from "@/types/learning";

export function MultipleChoiceActivity(props: ActivityComponentProps) {
  return <OptionChoiceActivity {...props} />;
}
