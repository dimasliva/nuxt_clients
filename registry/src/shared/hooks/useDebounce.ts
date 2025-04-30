const timeoutId = ref<NodeJS.Timeout | null>(null);
export function useDebounce(callback: () => void, delay: number = 1000) {
  // Функция для дебаунс-вызова переданной callback-функции
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value);
  }
  timeoutId.value = setTimeout(() => {
    callback();
    timeoutId.value = null;
  }, delay);
}
