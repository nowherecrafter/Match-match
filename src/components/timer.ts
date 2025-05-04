// src/services/Timer.ts
export class Timer {
  private intervalId: number | null = null;  // ID интервала для остановки таймера
  private seconds: number = 0;  // Количество секунд, отслеживаемое таймером
  private onTickCallback?: (seconds: number) => void;  // Callback для обновления состояния времени

  constructor(onTickCallback?: (seconds: number) => void) {
    this.onTickCallback = onTickCallback;
  }

  start(): void {
    if (this.intervalId !== null) return;  // Если таймер уже запущен, ничего не делаем
    this.intervalId = window.setInterval(() => {
      this.seconds++;  // Увеличиваем количество секунд
      if (this.onTickCallback) {
        this.onTickCallback(this.seconds);  // Обновляем состояние через callback
      }
    }, 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);  // Останавливаем таймер
      this.intervalId = null;  // Сбрасываем ID интервала
    }
  }

  reset(): void {
    this.stop();  // Останавливаем таймер
    this.seconds = 0;  // Сбрасываем счетчик секунд
    if (this.onTickCallback) {
      this.onTickCallback(this.seconds);  // Обновляем состояние времени после сброса
    }
  }

  getTime(): number {
    return this.seconds;
  }
}
