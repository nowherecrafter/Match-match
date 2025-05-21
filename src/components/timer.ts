/**
 * Timer UI component.
 * Simply renders time in MM:SS format into the #timer element.
 */
export class Timer {
  render(seconds: number): void {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
