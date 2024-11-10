import { getCompleteXPath, validateXPath } from "../../src/utils";

describe("getCompleteXPath 함수 테스트", () => {
  let element;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="parent">
        <span class="child">Child</span>
      </div>
    `;
    element = document.querySelector(".child");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("ID가 있는 요소에 대해 XPath를 생성할 수 있어야 합니다", () => {
    const parentElement = document.getElementById("parent");
    const xpath = getCompleteXPath(parentElement);
    expect(xpath).toBe('//*[@id="parent"]');
  });

  it("ID가 없는 요소에 대해 XPath를 생성할 수 있어야 합니다", () => {
    const xpath = getCompleteXPath(element);
    expect(xpath).toBe("/html[1]/body[1]/div[1]/span[1]");
  });
});

describe("validateXPath 함수 테스트", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="parent">
        <span class="child">Child</span>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("유효한 XPath가 주어졌을 때 true를 반환해야 합니다", () => {
    const xpath = '//*[@id="parent"]';
    const isValid = validateXPath(xpath);
    expect(isValid).toBe(true);
  });
});
