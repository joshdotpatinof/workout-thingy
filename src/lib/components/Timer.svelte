<script lang="ts">
  import ArrowUpFromLine from '@lucide/svelte/icons/arrow-up-from-line';
  import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
  import Play from '@lucide/svelte/icons/play';
  import PauseIcon from '@lucide/svelte/icons/pause';

  let { oncompleted }: { oncompleted?: (detail: { minutes: number }) => void } = $props();

  const EXERCISES = [
    { name: 'Push-ups', icon: ArrowUpFromLine },
    { name: 'Pull-ups', icon: ArrowDownToLine },
  ];

  let minutes = $state(10);
  let remaining = $state(0);
  let running = $state(false);
  let interval: ReturnType<typeof setInterval> | undefined = $state(undefined);
  let done = $state(false);

  const totalMinutes = $derived(Math.max(1, Math.floor(minutes)));
  const currentMinute = $derived(Math.max(0, Math.floor(remaining / 60)));
  const elapsed = $derived(totalMinutes - currentMinute);
  const exerciseIndex = $derived(elapsed > 0 ? (elapsed - 1) % EXERCISES.length : 0);
  const nextIndex = $derived((exerciseIndex + 1) % EXERCISES.length);
  const secondsInMinute = $derived(remaining % 60);
  const showNothing = $derived(running && secondsInMinute === 0);
  const showingNext = $derived(running && secondsInMinute === 1);
  const currentExercise = $derived(EXERCISES[exerciseIndex]);
  const nextExercise = $derived(EXERCISES[nextIndex]);
  const progress = $derived(totalMinutes > 0 ? elapsed / totalMinutes : 0);

  function beep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  function start() {
    if (running) return;
    done = false;
    if (remaining <= 0) {
      remaining = totalMinutes * 60;
    }
    running = true;
    interval = setInterval(() => {
      remaining--;
      if (remaining > 0 && remaining % 60 === 0) beep();
      if (remaining <= 0) {
        stop();
        done = true;
        oncompleted?.({ minutes: totalMinutes });
      }
    }, 1000);
  }

  function pause() {
    running = false;
    if (interval) clearInterval(interval);
    interval = undefined;
  }

  function reset() {
    pause();
    remaining = 0;
    done = false;
  }

  function handleDone() {
    reset();
  }

  function stop() {
    pause();
  }
</script>

<div class="timer">
  <h2>Timer</h2>

  <div class="input-group">
    <label for="minutes">Minutes:</label>
    <input
      id="minutes"
      type="number"
      min="1"
      max="120"
      bind:value={minutes}
      disabled={running}
    />
  </div>

  {#if done}
    <div class="done-message">
      <span class="check">&#10003;</span>
      Complete
    </div>
    <div class="controls">
      <button class="btn btn-start" onclick={handleDone}>Done</button>
    </div>
  {:else if running || remaining > 0}
    <div class="display">
      {#if !showNothing}
        <div class="exercise" class:active={running}>
          {#if showingNext}
            <span class="next-label">Next</span>
            <nextExercise.icon size={36} />
            <span>{nextExercise.name}</span>
          {:else}
            <currentExercise.icon size={48} />
            <span>{currentExercise.name}</span>
          {/if}
        </div>
      {/if}
      <div class="time">
        {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
      </div>
      <div class="elapsed">
        Minute {elapsed} of {totalMinutes}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress * 100}%"></div>
      </div>
    </div>
    <div class="controls">
      {#if running}
        <button class="btn btn-pause" onclick={pause} aria-label="Pause"><PauseIcon size={20} /></button>
      {:else}
        <button class="btn btn-start" onclick={start} aria-label="Resume"><Play size={20} /></button>
      {/if}
      <button class="btn btn-reset" onclick={reset}>Reset</button>
    </div>
  {:else}
    <p class="hint">Set your minutes and press <strong>Start</strong>.</p>
    <div class="controls">
      <button class="btn btn-start" onclick={start} aria-label="Start">
        <Play size={20} />
      </button>
      <button class="btn btn-reset" onclick={reset}>Reset</button>
    </div>
  {/if}
</div>

<style>
  .timer {
    max-width: 480px;
    padding: 2rem;
    text-align: center;
    font-family: system-ui, sans-serif;
  }
  h2 {
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
  }
  .input-group {
    margin-bottom: 1.5rem;
  }
  .input-group label {
    margin-right: 0.5rem;
    font-weight: 600;
  }
  .input-group input {
    width: 80px;
    padding: 0.4rem;
    font-size: 1rem;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  .input-group input:disabled {
    opacity: 0.5;
  }
  .display {
    margin: 1.5rem 0;
  }
  .exercise {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    transition: color 0.3s;
    color: #666;
  }
  .exercise.active {
    color: #f97316;
  }
  .next-label {
    font-size: 0.8rem;
    font-weight: 400;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .time {
    font-size: 3rem;
    font-weight: 300;
    font-variant-numeric: tabular-nums;
    margin-bottom: 0.5rem;
  }
  .elapsed {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
  }
  .progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fb923c, #ea580c);
    transition: width 1s linear;
    border-radius: 4px;
  }
  .controls {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
  }
  .btn {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .btn-start {
    background: #f97316;
    color: #fff;
  }
  .btn-pause {
    background: #f59e0b;
    color: #fff;
  }
  .btn-reset {
    background: #ef4444;
    color: #fff;
  }
  .done-message {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #ea580c;
  }
  .check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ea580c;
    color: #fff;
    font-size: 1.1rem;
    margin-right: 0.5rem;
  }
  .hint {
    margin: 1.5rem 0;
    font-size: 0.85rem;
    color: #999;
    line-height: 1.5;
  }
</style>
