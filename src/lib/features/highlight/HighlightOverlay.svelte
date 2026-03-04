<script lang="ts">
  import { type RectData } from '$features/highlight/services/highlight-types';

  // Future: add more styles here as the style picker is built out
  type HighlightStyle = 'marker' | 'frame';

  interface Props {
    box: { rects: RectData[] };
    style?: HighlightStyle;
  }

  let { box, style = 'marker' }: Props = $props();
  let rects = $derived(box.rects);
</script>

<div class="cv-highlight-overlay">
  {#each rects as rect, i (`${rect.top}-${rect.left}-${rect.width}-${rect.height}`)}
    <div
      class="cv-highlight-group"
      style="top: {rect.top}px; left: {rect.left}px; width: {rect.width}px; height: {rect.height}px;"
    >
      <div class="cv-highlight-box {style}"></div>
      {#if i === rects.length - 1}
        <div class="cv-highlight-attr">
          <a href="https://custardui.js.org" target="_blank" rel="noopener noreferrer">
            Highlighted by CustardUI ↗
          </a>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .cv-highlight-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 8000;
    overflow: visible;
  }

  .cv-highlight-group {
    position: absolute;
    pointer-events: none;
  }

  .cv-highlight-box {
    position: absolute;
    inset: 0;
    background: transparent;
    pointer-events: none;
    animation: highlightFadeIn 0.35s ease forwards;
  }

  @keyframes highlightFadeIn {
    from {
      opacity: 0;
      transform: scale(0.985) rotate(-0.5deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(-0.5deg);
    }
  }

  /* ─── Marker style (default) ───────────────────────────────────────────────
     Hand-drawn feel: organic asymmetric radius, slight tilt, pure yellow stroke.
     Inset shadow gives the frame depth without adding a rigid outer ring.
  */
  .cv-highlight-box.marker {
    border: 3.5px solid #f3cb52;
    border-radius: 200px 15px 225px 15px / 15px 225px 15px 255px;
    transform: rotate(-0.5deg);
    opacity: 0.92;
    box-shadow:
      0 4px 12px rgba(44, 26, 14, 0.18),
      0 2px 4px rgba(44, 26, 14, 0.1),
      inset 0 3px 14px rgba(44, 26, 14, 0.22);
  }

  /* ─── Frame style ───────────────────────────────────────────────────────────
     Crisp, elevated frame: dual-border (yellow + brown ring), strong inset shadow.
     For future use in the style picker.
  */
  .cv-highlight-box.frame {
    border: 3px solid #f3cb52;
    border-radius: 10px;
    box-shadow:
      0 0 0 2px #804b18,
      0 4px 10px 1px rgba(44, 26, 14, 0.5),
      0 2px 4px rgba(44, 26, 14, 0.3),
      inset 0 2px 10px rgba(44, 26, 14, 0.18);
  }

  /* ─── Attribution ───────────────────────────────────────────────────────── */
  .cv-highlight-attr {
    position: absolute;
    bottom: -22px;
    right: 0;
    pointer-events: auto;
    white-space: nowrap;
  }

  .cv-highlight-attr a {
    font-size: 11px;
    color: #9a7355;
    text-decoration: none;
    font-family: system-ui, sans-serif;
    letter-spacing: 0.02em;
    transition: color 0.15s ease;
  }

  .cv-highlight-attr a:hover {
    color: #804b18;
  }
</style>
