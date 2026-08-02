<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let { adminKey = '', refreshKey = 0 } = $props();

  let entries: {
    date: string;
    minutes: number;
    pushUps: number;
    pullUps: number;
    squats: number;
  }[] = $state([]);

  $effect(() => {
    if (browser) {
      refreshKey;
      fetchWorkouts();
    }
  });

  onMount(fetchWorkouts);

  async function fetchWorkouts() {
    const res = await fetch('/api/workouts');
    const data: Record<
      string,
      { minutes: number; pushUps: number; pullUps: number; squats: number }
    > = await res.json();
    entries = Object.entries(data)
      .map(([date, entry]) => ({ date, ...entry }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async function removeEntry(date: string) {
    await fetch('/api/workouts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ date }),
    });
    await fetchWorkouts();
  }
</script>

<div class="log">
    <h3>Josh's Workout Log</h3>
  <p class="count">{entries.length} workout{entries.length !== 1 ? 's' : ''}</p>

  {#if entries.length === 0}
    <p class="empty">...</p>
  {:else}
    <div class="table">
      <div class="thead">
        <span class="col-date">Date</span>
        <span class="col-num">Mins</span>
        <span class="col-num">Push-ups</span>
        <span class="col-num">Pull-ups</span>
        <span class="col-num">Squats</span>
        {#if adminKey}
          <span class="col-del"></span>
        {/if}
      </div>
      {#each entries as entry (entry.date)}
        <div class="trow">
          <span class="col-date">{entry.date}</span>
          <span class="col-num">{entry.minutes} <span class="check">&#10003;</span></span>
          <span class="col-num">{entry.pushUps}</span>
          <span class="col-num">{entry.pullUps}</span>
          <span class="col-num">{entry.squats}</span>
          {#if adminKey}
            <span class="col-del">
              <button class="del-btn" onclick={() => removeEntry(entry.date)} aria-label="Remove entry">&times;</button>
            </span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .log {
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }
  h3 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
  }
  .empty {
    color: #999;
    font-size: 0.85rem;
  }
  .count {
    color: #999;
    font-size: 0.85rem;
    margin: -0.5rem 0 1rem;
  }
  .table {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }
  .thead {
    display: flex;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
  }
  .thead .col-date {
    padding: 0.5rem 0.75rem;
    flex: 1;
  }
  .thead .col-num {
    padding: 0.5rem 0.75rem;
    width: 70px;
    text-align: center;
  }
  .thead .col-del {
    width: 36px;
  }
  .trow {
    display: flex;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.85rem;
    align-items: center;
  }
  .trow:last-child {
    border-bottom: none;
  }
  .trow .col-date {
    padding: 0.4rem 0.75rem;
    flex: 1;
    color: #333;
  }
  .trow .col-num {
    padding: 0.4rem 0.75rem;
    width: 70px;
    text-align: center;
    color: #333;
  }
  .trow .col-del {
    width: 36px;
    text-align: center;
  }
  .check {
    color: #ea580c;
    font-weight: 700;
  }
  .del-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    font-size: 1.1rem;
    padding: 0.2rem;
    line-height: 1;
  }
  .del-btn:hover {
    color: #ef4444;
  }
</style>
