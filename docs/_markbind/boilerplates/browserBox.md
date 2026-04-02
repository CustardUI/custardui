<!-- This boilerplate shows a styling browser window -->
<!-- Supports 2 variables. -->
<!-- `content` -This variable will appear in the browser window -->
<!-- `url` -The url that appears in the browser window -->

<!-- 
To use it, copy this:

<include src="browserBox.md" boilerplate >
<variable name="url"> https://XXX </variable>
<variable name="content">

My content here

</variable>
</include>

-->

<div class="cv-browser-single">
  <div class="cv-browser-single-bar">
    <div class="cv-browser-single-dots">
      <div class="cv-browser-single-dot"></div>
      <div class="cv-browser-single-dot"></div>
      <div class="cv-browser-single-dot"></div>
    </div>
    <div class="cv-browser-single-url">{{ url | safe}}</div>
    <div class="cv-browser-triple-menu">
      <div class="cv-browser-triple-menu-dot"></div>
      <div class="cv-browser-triple-menu-dot"></div>
      <div class="cv-browser-triple-menu-dot"></div>
    </div>
  </div>
  <div class="cv-browser-single-body">

  {{ content | safe }}

  </div>
</div>

<style>
.cv-browser-single {
  border: 1px solid rgba(196,133,58,0.4);
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.cv-browser-single-bar {
  background: rgba(129,76,32,0.2);
  border-bottom: 1px solid rgba(196,133,58,0.35);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.cv-browser-single-dots {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.cv-browser-single-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(196,133,58,0.3);
}

.cv-browser-single-url {
  background: var(--bs-body-bg, #ffffff);
  border: 1px solid rgba(196,133,58,0.2);
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 0.72rem;
  color: var(--custard-muted);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-browser-single-body {
  background: var(--bs-body-bg, #ffffff);
  padding: 1.25rem 1.5rem;
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