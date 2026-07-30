<script lang="ts">
  import { onMount } from 'svelte';
  import Timer from '$lib/components/Timer.svelte';
  import History from '$lib/components/History.svelte';
  import Dumbbell from '$lib/components/icons/Dumbbell.svelte';

  let adminKey = $state('');
  let saved = $state(false);
  let showKeyInput = $state(false);
  let keyVerified = $state(false);
  let historyKey = $state(0);

  onMount(() => {
    const stored = localStorage.getItem('adminKey');
    if (stored) {
      adminKey = stored;
      saved = true;
      verifyKey(stored);
    }
  });

  async function verifyKey(key: string) {
    const res = await fetch('/api/workouts/verify', {
      headers: { 'x-admin-key': key },
    });
    keyVerified = res.ok;
  }

  function saveKey() {
    if (adminKey.trim()) {
      localStorage.setItem('adminKey', adminKey.trim());
      saved = true;
      showKeyInput = false;
      verifyKey(adminKey.trim());
    }
  }

  function exitAdmin() {
    localStorage.removeItem('adminKey');
    adminKey = '';
    saved = false;
    keyVerified = false;
  }

  function handleCompleted(detail: { minutes: number }) {
    if (!adminKey || !keyVerified) return;
    const today = new Date().toISOString().slice(0, 10);
    fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({ date: today, minutes: detail.minutes }),
    }).then(() => historyKey++);
  }
</script>

<svelte:head>
  <title>Workout Thingy</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ea580c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z'/%3E%3Cpath d='m2.5 21.5 1.4-1.4'/%3E%3Cpath d='m20.1 3.9 1.4-1.4'/%3E%3Cpath d='M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z'/%3E%3Cpath d='m9.6 14.4 4.8-4.8'/%3E%3C/svg%3E" />
</svelte:head>

<header class="site-header">
  <Dumbbell size={24} color="#ea580c" />
  <span>Josh's Workout Thingy</span>
</header>

<div class="top-bar">
  {#if showKeyInput}
    <div class="key-form">
      <input
        type="password"
        placeholder="Enter admin key"
        bind:value={adminKey}
        onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && saveKey()}
      />
      <button class="btn-sm" onclick={saveKey}>Save</button>
      <button class="btn-sm btn-cancel" onclick={() => { showKeyInput = false; }}>Cancel</button>
    </div>
  {:else if saved}
    <div class="admin-bar">
      <span class="status" class:verified={keyVerified}>
        {keyVerified ? 'Admin mode' : 'Key invalid'}
      </span>
      <button class="btn-sm" onclick={() => showKeyInput = true}>Change key</button>
      <button class="btn-sm btn-cancel" onclick={exitAdmin}>Exit admin</button>
    </div>
  {:else}
    <button class="key-toggle" onclick={() => showKeyInput = true}>Admin mode</button>
  {/if}
</div>

<main>
  <div class="left">
    <Timer oncompleted={handleCompleted} />
  </div>
  <div class="right">
    <History {adminKey} refreshKey={historyKey} />
  </div>
</main>

<style>
  .site-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1rem 0;
    font-family: system-ui, sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
  }
  .top-bar {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1rem;
    font-family: system-ui, sans-serif;
  }
  .key-form {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  .key-form input {
    padding: 0.35rem 0.6rem;
    font-size: 0.85rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 180px;
  }
  .admin-bar {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  .status {
    font-size: 0.8rem;
    color: #ef4444;
    font-weight: 600;
  }
  .status.verified {
    color: #ea580c;
  }
  .btn-sm {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #f97316;
    color: #fff;
    font-weight: 600;
  }
  .btn-cancel {
    background: #e5e7eb;
    color: #333;
  }
  .key-toggle {
    font-size: 0.8rem;
    padding: 0.3rem 0.7rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    background: #fff;
    color: #666;
  }
  main {
    display: flex;
    gap: 2rem;
    padding: 0 1rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: system-ui, sans-serif;
    align-items: flex-start;
  }
  .left {
    flex-shrink: 0;
  }
  .right {
    flex: 1;
    min-width: 0;
  }
</style>
