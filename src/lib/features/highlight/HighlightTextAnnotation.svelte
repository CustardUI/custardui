<script lang="ts">
  import { type AnnotationCorner, ANNOTATION_PREVIEW_LENGTH, DEFAULT_ANNOTATION_CORNER } from '$features/highlight/services/highlight-annotations';

  interface Props {
    annotation: string;
    annotationCorner?: AnnotationCorner | undefined;
  }

  let { annotation, annotationCorner }: Props = $props();
  let expanded = $state(false);

  function toggle() {
    expanded = !expanded;
  }

  function getBadgeStyle(corner: AnnotationCorner): string {
    switch (corner) {
      case 'tl': return 'top: 6px; left: 6px;';
      case 'tr': return 'top: 6px; right: 6px;';
      case 'bl': return 'bottom: 6px; left: 6px;';
      case 'br': return 'bottom: 6px; right: 6px;';
      default: {
        const exhaustiveCheck: never = corner;
        throw new Error(`Unhandled corner case: ${exhaustiveCheck}`);
      }
    }
  }
</script>

<button
  type="button"
  class="cv-annotation-badge"
  class:cv-annotation-badge--expanded={expanded}
  style={getBadgeStyle(annotationCorner ?? DEFAULT_ANNOTATION_CORNER)}
  onclick={(e) => { e.stopPropagation(); toggle(); }}
  aria-label={expanded ? 'Collapse annotation' : 'Expand annotation'}
  aria-expanded={expanded}
>
  {#if expanded}
    <span class="cv-annotation-text">{annotation}</span>
  {:else}
    <span class="cv-annotation-text">
      {annotation.length > ANNOTATION_PREVIEW_LENGTH
        ? annotation.slice(0, ANNOTATION_PREVIEW_LENGTH) + '…'
        : annotation}
    </span>
  {/if}
</button>

<style>
  .cv-annotation-badge {
    position: absolute;
    z-index: 10;
    pointer-events: auto;
    max-width: 180px;
    background: white;
    border: 1.5px solid var(--cv-highlight-color);
    border-radius: 6px;
    padding: 4px 7px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(44, 26, 14, 0.15);
    font-family: ui-sans-serif, system-ui, sans-serif;
    text-align: left;
  }

  .cv-annotation-badge--expanded {
    max-width: 260px;
    z-index: 20;
  }

  .cv-annotation-text {
    display: block;
    font-size: 9px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    word-break: break-word;
    white-space: pre-wrap;
  }
</style>
