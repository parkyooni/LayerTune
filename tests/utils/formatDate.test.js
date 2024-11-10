import { formatDate } from "../../src/utils";

describe("formatDate 함수 테스트", () => {
  it("올바른 ISO 문자열을 입력했을 때 'YYYY.MM.DD' 형식으로 반환해야 합니다", () => {
    const isoString = "2024-11-10T10:46:42.153Z";
    const formattedDate = formatDate(isoString);
    expect(formattedDate).toBe("2024.11.10");
  });

  it("유효하지 않은 날짜 문자열을 입력했을 때 'Invalid Date'가 포함된 문자열을 반환하지 않도록 합니다", () => {
    const invalidDateString = "invalid-date";
    const formattedDate = formatDate(invalidDateString);
    expect(formattedDate).toBe("NaN.NaN.NaN");
  });
});
