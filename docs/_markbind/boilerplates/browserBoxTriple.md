<!-- This boilerplate shows a single browser window with three panes side by side -->
<!-- Useful for showing the same content in three different states (e.g. Shown / Hidden / Peek) -->
<!-- Supports 7 variables: -->
<!-- `url`    - The URL shown in the browser bar -->
<!-- `content1` / `content2` / `content3` - Content for each pane (left to right) -->
<!-- No label variables needed -->

<!--
To use it, copy this:

<include src="browserBoxTriple.md" boilerplate>
<variable name="url">example.com/page</variable>
<variable name="content1">

</variable>
<variable name="content2">

</variable>
<variable name="content3">

</variable>
</include>

-->

<div class="cv-browser-triple">

  <div class="cv-browser-triple-bar">
    <div class="cv-browser-triple-dots">
      <div class="cv-browser-triple-dot"></div>
      <div class="cv-browser-triple-dot"></div>
      <div class="cv-browser-triple-dot"></div>
    </div>
    <div class="cv-browser-triple-url">{{ url | safe }}</div>
    <div class="cv-browser-triple-menu">
      <div class="cv-browser-triple-menu-dot"></div>
      <div class="cv-browser-triple-menu-dot"></div>
      <div class="cv-browser-triple-menu-dot"></div>
    </div>
  </div>

<div class="cv-browser-triple-panes">

<div class="cv-browser-triple-col">
<div class="cv-browser-triple-pane">

{{ content1 | safe }}

</div>
</div>

<div class="cv-browser-triple-col">
<div class="cv-browser-triple-pane">

{{ content2 | safe }}

</div>
</div>

<div class="cv-browser-triple-col">
<div class="cv-browser-triple-pane">

{{ content3 | safe }}

</div>
</div>

</div>

</div>

<style>
.cv-browser-triple {
  border: 1px solid rgba(196,133,58,0.4);
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.cv-browser-triple-bar {
  background: rgba(129,76,32,0.2);
  border-bottom: 1px solid rgba(196,133,58,0.35);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.cv-browser-triple-dots {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.cv-browser-triple-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(196,133,58,0.3);
}

.cv-browser-triple-url {
  background: var(--bs-body-bg, #ffffff);
  border: 1px solid rgba(196,133,58,0.2);
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.72rem;
  color: var(--bs-body-color);
  opacity: 0.8;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-browser-triple-panes {
  display: flex;
  background: rgba(129,76,32,0.1);
  gap: 6px;
  padding: 6px;
  align-items: stretch;
}

.cv-browser-triple-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cv-browser-triple-pane {
  padding: 1rem 1.25rem;
  font-size: 0.85rem;
  background: var(--bs-body-bg, #ffffff);
  border-radius: 6px;
  border: 1px solid rgba(196,133,58,0.15);
  flex: 1;
}

.cv-browser-triple-menu {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
  width: 40px;
  align-items: flex-end;
  justify-content: center;
  opacity: 0.4;
  padding-right: 4px;
}

.cv-browser-triple-menu-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--custard-light-brown);
}

</style>
