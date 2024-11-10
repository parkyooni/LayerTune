import { getElementByXPath } from "../../src/utils";

describe("getElementByXPath 함수 테스트", () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sample-id">
        <span class="sample-class">Hello</span>
      </div>
    `;

    element = document.getElementById("sample-id");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("ID 기반의 XPath를 사용하여 요소를 가져올 수 있어야 합니다", () => {
    const xpath = '//*[@id="sample-id"]';
    const result = getElementByXPath(xpath);
    expect(result).toBe(element);
  });

  it("일반 XPath를 사용하여 요소를 가져올 수 있어야 합니다", () => {
    const xpath = "/html/body/div/span";
    const result = getElementByXPath(xpath);
    expect(result).not.toBeNull();
    expect(result.textContent).toBe("Hello");
  });
});
