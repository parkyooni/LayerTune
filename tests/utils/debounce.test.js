import { debounce } from "../../src/utils";

describe("debounce 함수 테스트", () => {
  jest.useFakeTimers();

  let mockFunction;
  let debouncedFunction;

  beforeEach(() => {
    mockFunction = jest.fn();
    debouncedFunction = debounce(mockFunction, 500);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("지정된 지연 시간 후에 함수가 호출되어야 합니다", () => {
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it("이전에 설정된 타이머가 있을 때 새 호출이 타이머를 초기화하는지 확인합니다", () => {
    debouncedFunction();
    jest.advanceTimersByTime(300);

    debouncedFunction();
    jest.advanceTimersByTime(500);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
