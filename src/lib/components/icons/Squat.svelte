<script lang="ts">
  let { size = 24, color = 'currentColor' }: { size?: number; color?: string } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="4" r="2" />
  <path d="M12 6v6" />
  <path d="M12 12l-5 4" />
  <path d="M12 12l5 4" />
  <path d="M7 16l-2 5" />
  <path d="M17 16l2 5" />
</svg>
