// One callback at a time; the next timer is scheduled only after completion.
export class Poller {
  constructor(callback, delay, visible = () => !document.hidden) {
    this.callback = callback; this.delay = delay; this.visible = visible;
    this.epoch = 0; this.timer = null; this.failures = 0;
  }
  stop() { this.epoch++; clearTimeout(this.timer); }
  start(delay = this.delay) {
    this.stop();
    const epoch = this.epoch;
    const tick = async () => {
      if (epoch !== this.epoch || !this.visible()) return;
      let next = this.delay;
      try { if (await this.callback() === false) return; this.failures = 0; }
      catch (error) {
        this.failures++;
        next = Math.max(error.retryAt ? error.retryAt - Date.now() : 0,
          Math.min(60000, this.delay * 2 ** this.failures));
      }
      if (epoch === this.epoch && this.visible()) this.timer = setTimeout(tick, next);
    };
    this.timer = setTimeout(tick, delay);
  }
}
