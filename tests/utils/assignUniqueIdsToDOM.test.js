import { assignUniqueIdsToDOM } from "../../src/utils";

describe("assignUniqueIdsToDOM 함수 테스트", () => {
  let root;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <div>
          <span>Nested Span</span>
          <script>console.log("This is a script");</script>
          <style>.test { color: red; }</style>
        </div>
      </div>
    `;
    root = document.querySelector("div");
  });

  it("모든 요소에 고유한 data-id를 할당해야 합니다", () => {
    assignUniqueIdsToDOM(root);

    expect(root.dataset.id).toBe("0");
    expect(root.querySelector("p:nth-child(1)").dataset.id).toBe("0.0");
    expect(root.querySelector("p:nth-child(2)").dataset.id).toBe("0.1");
    expect(root.querySelector("div").dataset.id).toBe("0.2");
    expect(root.querySelector("span").dataset.id).toBe("0.2.0");
  });

  it("SCRIPT 및 STYLE 요소에는 data-id가 할당되지 않아야 합니다", () => {
    assignUniqueIdsToDOM(root);

    const scriptElement = root.querySelector("script");
    const styleElement = root.querySelector("style");

    expect(scriptElement.dataset.id).toBeUndefined();
    expect(styleElement.dataset.id).toBeUndefined();
  });

  it("재귀적으로 모든 자식 요소에 고유한 data-id를 할당해야 합니다", () => {
    assignUniqueIdsToDOM(root);

    const allElements = root.querySelectorAll("*:not(script):not(style)");
    allElements.forEach((element) => {
      expect(element.dataset.id).toBeDefined();
    });
  });
});
