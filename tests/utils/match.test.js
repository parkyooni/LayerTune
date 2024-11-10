import { matchTagName, matchId, matchClassName } from "../../src/utils/match";

describe("match.js 필수 테스트", () => {
  let element;

  beforeEach(() => {
    element = document.createElement("div");
  });

  it("태그 이름, ID, 클래스 이름이 exclusion과 일치하면 각각 true를 반환해야 합니다", () => {
    const tagElement = document.createElement("div");
    const tagExclusion = { tagName: "div" };
    expect(matchTagName(tagElement, tagExclusion)).toBe(true);

    element.id = "test-id";
    const idExclusion = { id: "test-id" };
    expect(matchId(element, idExclusion)).toBe(true);

    element.classList.add("test-class");
    const classExclusion = { className: "test-class" };
    expect(matchClassName(element, classExclusion)).toBe(true);
  });

  it("태그 이름, ID, 클래스 이름이 exclusion과 일치하지 않으면 각각 false를 반환해야 합니다", () => {
    const spanElement = document.createElement("span");
    const tagExclusion = { tagName: "div" };
    expect(matchTagName(spanElement, tagExclusion)).toBe(false);

    element.id = "different-id";
    const idExclusion = { id: "test-id" };
    expect(matchId(element, idExclusion)).toBe(false);

    element.classList.add("different-class");
    const classExclusion = { className: "test-class" };
    expect(matchClassName(element, classExclusion)).toBe(false);
  });
});
