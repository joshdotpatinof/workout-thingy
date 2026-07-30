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
  <path d="m18 9-6-6-6 6" />
  <path d="M12 3v14" />
  <path d="M5 21h14" />
</svg>
