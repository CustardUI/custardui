<!-- This boilerplate shows a split browser window with two tabs side by side -->
<!-- Supports 4 variables: -->
<!-- `content1` - Content for the left pane -->
<!-- `content2` - Content for the right pane -->
<!-- `url1` - URL for the left pane -->
<!-- `url2` - URL for the right pane -->


<!-- 
To use it, copy this:

<include src="browserBoxSplit.md" boilerplate>
<variable name="url1"> https://XXX </variable>
<variable name="url2"> https://YYY </variable>
<variable name="content1">


</variable>
<variable name="content2">


</variable>
</include>

-->


<div class="cv-browser-split">

  <div class="cv-browser-split-bar">
    <div class="cv-browser-split-dots">
      <div class="cv-browser-split-dot"></div>
      <div class="cv-browser-split-dot"></div>
      <div class="cv-browser-split-dot"></div>
    </div>
    <div class="cv-browser-split-urls">
      <div class="cv-browser-split-url">{{ url1 | safe }}</div>
      <div class="cv-browser-split-url-divider"></div>
      <div class="cv-browser-split-url">{{ url2 | safe }}</div>
    </div>
    <div class="cv-browser-split-menu">
      <div class="cv-browser-split-menu-dot"></div>
      <div class="cv-browser-split-menu-dot"></div>
      <div class="cv-browser-split-menu-dot"></div>
    </div>
  </div>

<div class="cv-browser-split-panes">

<div class="cv-browser-split-pane">

{{ content1 | safe }}
</div>
<div class="cv-browser-split-pane">

{{ content2 | safe }}
</div>

<!-- split planes -->
</div>

<!-- browser split -->
</div>

<style>
.cv-browser-split {
  border: 1px solid rgba(196,133,58,0.4);
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.cv-browser-split-bar {
  background: rgba(129,76,32,0.2);
  border-bottom: 1px solid rgba(129,76,32,0.35);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.cv-browser-split-dots {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.cv-browser-split-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(196,133,58,0.3);
}

.cv-browser-split-urls {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.6rem;
}

.cv-browser-split-url-divider {
  width: 1px;
  height: 14px;
  background: rgba(196,133,58,0.4);
  flex-shrink: 0;
}

.cv-browser-split-url {
  background: var(--bs-body-bg, #ffffff);
  border: 1px solid rgba(129,76,32,0.2);
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

.cv-browser-split-menu {
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

.cv-browser-split-menu-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--custard-light-brown);
}

.cv-browser-split-panes {
  display: flex;
  background: rgba(129,76,32,0.1);
  gap: 6px;
  padding: 6px;
}

.cv-browser-split-pane {
  padding: 1.25rem 1.5rem;
  font-size: 0.9rem;
  background: var(--bs-body-bg, #ffffff);
  flex: 1;
  min-width: 0;
  border-radius: 6px;
  border: 1px solid rgba(129,76,32,0.2);
}
</style>