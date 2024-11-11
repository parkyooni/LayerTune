import { EXCLUDED_ELEMENTS } from "@/config/constant";
import * as match from "./match";

export const isExcludedElement = (element) => {
  return EXCLUDED_ELEMENTS.some(
    (exclusion) =>
      match.matchTagName(element, exclusion) ||
      match.matchId(element, exclusion) ||
      match.matchClassName(element, exclusion)
  );
};
