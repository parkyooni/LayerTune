import { isExcludedElement } from "../../src/utils";
import { EXCLUDED_ELEMENTS } from "../../src/config/constant";
import * as match from "../../src/utils/match";

describe("isExcludedElement 함수 테스트", () => {
  let element;

  beforeEach(() => {
    EXCLUDED_ELEMENTS.length = 0;

    element = document.createElement("div");
    document.body.appendChild(element);

    jest
      .spyOn(match, "matchTagName")
      .mockImplementation((el, exclusion) =>
        exclusion.tagName
          ? el.tagName.toLowerCase() === exclusion.tagName.toLowerCase()
          : false
      );
    jest
      .spyOn(match, "matchId")
      .mockImplementation((el, exclusion) =>
        exclusion.id ? el.id === exclusion.id : false
      );
    jest
      .spyOn(match, "matchClassName")
      .mockImplementation((el, exclusion) =>
        exclusion.className ? el.classList.contains(exclusion.className) : false
      );
  });

  afterEach(() => {
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  it("태그 이름, ID, 또는 클래스 이름이 EXCLUDED_ELEMENTS에 포함되면 true를 반환해야 합니다", () => {
    EXCLUDED_ELEMENTS.push({ tagName: "EXCLUDE_TAG" });
    const tagElement = document.createElement("EXCLUDE_TAG");
    document.body.appendChild(tagElement);
    expect(isExcludedElement(tagElement)).toBe(true);
    expect(match.matchTagName).toHaveBeenCalledWith(tagElement, {
      tagName: "EXCLUDE_TAG",
    });

    EXCLUDED_ELEMENTS[0] = { id: "exclude-id" };
    element.id = "exclude-id";
    expect(isExcludedElement(element)).toBe(true);
    expect(match.matchId).toHaveBeenCalledWith(element, { id: "exclude-id" });

    EXCLUDED_ELEMENTS[0] = { className: "exclude-class" };
    element.classList.add("exclude-class");
    expect(isExcludedElement(element)).toBe(true);
    expect(match.matchClassName).toHaveBeenCalledWith(element, {
      className: "exclude-class",
    });
  });

  it("어떤 속성도 EXCLUDED_ELEMENTS에 포함되지 않으면 false를 반환해야 합니다", () => {
    EXCLUDED_ELEMENTS.push(
      { tagName: "EXCLUDE_TAG" },
      { id: "exclude-id" },
      { className: "exclude-class" }
    );
    const nonExcludedElement = document.createElement("NON_EXCLUDED_TAG");
    nonExcludedElement.id = "non-exclude-id";
    nonExcludedElement.classList.add("non-exclude-class");
    document.body.appendChild(nonExcludedElement);

    expect(isExcludedElement(nonExcludedElement)).toBe(false);
  });
});
