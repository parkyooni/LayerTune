import { DOM_IDS, CLASS_NAMES } from "../config/constant";

const getElementById = (id) => document.getElementById(id);
const getElementsByClass = (className) =>
  document.querySelectorAll(`.${className}`);

const elementCache = {};

const findElement = (key) => {
  if (DOM_IDS[key]) return getElementById(DOM_IDS[key]);
  if (CLASS_NAMES[key]) return getElementsByClass(CLASS_NAMES[key]);
  return null;
};

const handler = {
  get(target, key) {
    if (!(key in target)) {
      const element = findElement(key);
      target[key] = element || null;

      if (!element) {
        console.warn(
          `${DOM_IDS[key] ? `ID '${DOM_IDS[key]}'` : `Class '${CLASS_NAMES[key]}'`}을(를) 찾을 수 없습니다`
        );
      }
    }
    return target[key];
  },
};

export const elements = new Proxy(elementCache, handler);
