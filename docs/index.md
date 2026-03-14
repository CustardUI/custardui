<frontmatter>
  title: CustardUI - Your docs, shaped for every reader
</frontmatter>

<div class="cv-hero-badge">✦ Open Source · Lightweight · Framework-Agnostic</div>

<h1 class="display-3"><md>**CustardUI**</md></h1>

<div class="lead">

**Your docs, shaped for every reader.**
Memory-persistent interactivity for static sites — no backend required.

</div>

CustardUI adds tabs that sync across pages, content that hides until needed, and shareable deep links — all from a single script tag. Built for educational sites, documentation portals, and course textbooks.

<div class="cv-hero-actions">
  <a href="{{baseUrl}}/authorGuide/gettingStarted.html" class="cv-btn-secondary"><md>:fa-solid-book:</md> Read the Docs</a>
  <a href="https://github.com/custardui/custardui" class="cv-btn-secondary"><md>:fa-brands-github:</md> View on GitHub</a>
</div>

---

<!-- ═══════════════════════════════════════════════ -->
<!--  LIVE DEMO                                      -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">See it in action</p>
<h2 class="cv-section-title">Static sites don't have to be static.</h2>

The demo below is a live CustardUI-powered page. Try interacting with the tabs, toggles, and placeholders to see how they work.

<div class="cv-demo-wrapper">
<div class="cv-demo-header">
  <div class="cv-demo-dot"></div>
  <span class="cv-demo-label">Live Demo — Project Setup Guide</span>
</div>
<div class="cv-demo-intro">

++**Hey, [[username]]!**++ Let's get your project set up.
_Your name is remembered across every page on this site — set it once, see it everywhere._

<cv-placeholder-input name="username" />

</div>

---

<cv-toggle toggle-id="prerequisites" show-label>

<br> 

#### Prerequisites

Make sure these are installed before continuing.

<cv-tabgroup group-id="os" nav="auto">
  <cv-tab tab-id="macos" header="macOS">

```bash
brew install node git
```

  </cv-tab>
  <cv-tab tab-id="windows" header="Windows">

```bash
winget install OpenJS.NodeJS Git.Git
```

  </cv-tab>
  <cv-tab tab-id="linux" header="Linux">

```bash
sudo apt install nodejs git
```

  </cv-tab>
</cv-tabgroup>

</cv-toggle>

<span class="cv-sticky-note">↑ _peeked by default_ — visible enough to know it's there, collapsed until you actually need it</span>

---

<cv-toggle toggle-id="installation" show-label>

<br> 

#### Installation

<cv-tabgroup group-id="pkg" nav="auto">
  <cv-tab tab-id="npm" header="npm">

```bash
npm install custardui
```

  </cv-tab>
  <cv-tab tab-id="yarn" header="yarn">

```bash
yarn add custardui
```

  </cv-tab>
  <cv-tab tab-id="pnpm" header="pnpm">

```bash
pnpm add custardui
```

  </cv-tab>
</cv-tabgroup>

</cv-toggle>

---

<cv-toggle toggle-id="configuration" show-label>

<br> 

#### Configuration

Config file location varies by OS:

<cv-tabgroup group-id="os" nav="auto">
  <cv-tab tab-id="macos" header="macOS">

```
~/.config/custardui/config.json
```

  </cv-tab>
  <cv-tab tab-id="windows" header="Windows">

```
%APPDATA%\custardui\config.json
```

  </cv-tab>
  <cv-tab tab-id="linux" header="Linux">

```
~/.config/custardui/config.json
```

  </cv-tab>
</cv-tabgroup>

<span class="cv-sticky-note">↑ _synced with Prerequisites_ — switching OS above updates this automatically. No extra clicks.</span>

<div id="demo-config-step">
<div class="highlight-target">

Set `"theme": "auto"` to follow the reader's system preference. This is the most commonly missed config option. <a href="?cv-highlight=demo-config-step"> :fa-solid-link: Share this step</a>

</div>
</div>

</cv-toggle>

---

<cv-toggle toggle-id="run-project" show-label>

<br> 

#### Running the Project

<cv-tabgroup group-id="pkg" nav="auto">
  <cv-tab tab-id="npm" header="npm">

```bash
npm run dev
```

  </cv-tab>
  <cv-tab tab-id="yarn" header="yarn">

```bash
yarn dev
```

  </cv-tab>
  <cv-tab tab-id="pnpm" header="pnpm">

```bash
pnpm dev
```

  </cv-tab>
</cv-tabgroup>

<span class="cv-sticky-note">↑ _synced with Installation_ — pick your package manager once, every code block on the site follows</span>

</cv-toggle>

---

<cv-toggle toggle-id="troubleshooting-setup" show-label show-peek-border>

<br> 

#### Troubleshooting

**Port already in use?** Kill the process on port 3000:

<cv-tabgroup group-id="os" nav="auto">
  <cv-tab tab-id="macos" header="macOS">

```bash
lsof -ti:3000 | xargs kill
```

  </cv-tab>
  <cv-tab tab-id="windows" header="Windows">

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

  </cv-tab>
  <cv-tab tab-id="linux" header="Linux">

```bash
fuser -k 3000/tcp
```

  </cv-tab>
</cv-tabgroup>

</cv-toggle>

<span class="cv-sticky-note">↑ _peeked by default_ — troubleshooting is there when you need it, invisible when you don't</span>

</div>

---

<!-- ═══════════════════════════════════════════════ -->
<!--  FOCUS & SHARE                                  -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">Focus & Share</p>
<h2 class="cv-section-title">Answer questions with a link.</h2>

Did you notice the **Share this step** link in the demo above? Any element on the page can become a shareable, highlighted anchor — with or without an existing `id`. No more "scroll down and find the paragraph about the config file." You can even share this paragraph [right here](?cv-highlight=W3sidCI6IlAiLCJpIjoyOSwicCI6ImNvbnRlbnQtd3JhcHBlciIsInMiOiJEaWQgeW91IG5vdGljZSB0aGUgU2hhcmUgdGhpcyB0aSIsImgiOjg0Mzk0NDcxNywiaWQiOiIifV0%3D).

<box type="info">

**For TAs and instructors:** When a student asks a question that's already answered on the site, share a URL like:

```
https://your-course-site.com/textbook?cv-highlight=the-element-id
```

The page loads with that section visually highlighted — drawing the student's eye straight to the answer.

</box>

---

<!-- ═══════════════════════════════════════════════ -->
<!--  ADAPTATIONS SECTION                            -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">Adaptations</p>
<h2 class="cv-section-title">One resource. Every audience.</h2>

Adaptations go beyond themes. They let different organizations share the same underlying content while each seeing a version tailored to them — logos, links, terminology, and all. No backend. No duplicate repositories.

<p>Consider a Git mastery guide used by multiple courses:</p>

<div class="cv-adaptations-split">
  <div class="cv-adaptation-card org-a">

#### <span style="color: #F2CA55;">:fa-solid-circle:</span> Organization A — NUS CS2103T

Students see the CS2103T branding, TEAMMATES-specific Git workflow diagrams, and links to their course forum. The "fork and PR" model matches their exact project setup.
  </div>
  <div class="cv-adaptation-card org-b">

#### <span style="color: #4A90D9;">:fa-solid-circle:</span> Organization B — A different course

The same guide, but with their own branding, a different recommended branching model, and links to their issue tracker. No content was duplicated — only the adaptation config differs.
  </div>
</div>

<box type="tip">

This is how **[git-mastery.org](https://git-mastery.org/)** uses CustardUI — a single site serving multiple audiences with zero backend infrastructure.

</box>

---

<!-- ═══════════════════════════════════════════════ -->
<!--  QUICK SETUP                                    -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">Getting started</p>
<h2 class="cv-section-title">Up and running in minutes.</h2>

No build step, no server to manage. Works with MarkBind, Jekyll, plain HTML — anything.

<div class="cv-setup-steps">
  <div class="cv-setup-step">
    <div class="cv-step-num">1</div>
    <div>

#### Add the script tag
Include the CustardUI CDN script in your base layout or page template.
    </div>
  </div>
  <div class="cv-setup-step">
    <div class="cv-step-num">2</div>
    <div>

#### Create your config
Add a `config.json` to your site root defining your toggles, tabs, and placeholders.
    </div>
  </div>
  <div class="cv-setup-step">
    <div class="cv-step-num">3</div>
    <div>

#### Use the components
Wrap content with `<cv-toggle>`, `<cv-tabgroup>`, and add `[[placeholders]]` anywhere.
    </div>
  </div>
</div>

```html
<!-- Step 1: Add to your <head> or base layout -->
<script src="https://cdn.jsdelivr.net/npm/@custardui/custardui" data-base-url="/"></script>
```

```js
// Step 2: config.json — define your toggles and tabs
{
  "config": {
    "toggles": [
      {
        "toggleId": "prerequisites",
        "label": "Prerequisites",
        "isLocal": true,
        "default": "peek"
      },
      ...
    ],
    "tabgroups": [
      {
        "groupId": "os",
        "tabs": [
          { "tabId": "macos", "label": "macOS" },
          { "tabId": "windows", "label": "Windows" },
          { "tabId": "linux", "label": "Linux" }
        ],
        ...
      }
    ],
    "placeholders": [
      {
        "name": "username",
        "defaultValue": "there",
        ...
      }
    ]
  },
  ...
}
```

[:fa-solid-book: Full documentation →]({{baseUrl}}/authorGuide/gettingStarted.html)


<!-- ═══════════════════════════════════════════════ -->
<!--  CTA                                            -->
<!-- ═══════════════════════════════════════════════ -->

<div class="cv-cta">
<div class="cv-cta-body">

## Your docs, shaped for every reader.

CustardUI is open source, free to use, and designed to slot into your existing workflow with minimal effort.

<div class="cv-cta-actions">
  <a href="{{baseUrl}}/authorGuide/gettingStarted.html" class="cv-btn-primary"><md>:fa-solid-book:</md> Get Started</a>
  <a href="https://github.com/custardui/custardui" class="cv-btn-secondary"><md>:fa-brands-github:</md> GitHub</a>
</div>

</div>
<div class="cv-used-by">
  <span class="cv-used-by-label">Used by</span>
  <div class="cv-used-by-divider"></div>
  <div class="cv-used-by-sites">
    <a href="https://git-mastery.org/" target="_blank"><span><md>:fa-solid-code-branch:</md> git-mastery.org</span></a>
    <a href="https://www.comp.nus.edu.sg/~cs2103" target="_blank"><span><md>:fa-solid-graduation-cap:</md> CS2103T Website</span></a>
  </div>
</div>
</div>


<div style="text-align: center; margin: 3rem 0 1.5rem;">
  <img src="{{baseUrl}}/images/custards-drip.jpg" style="max-width: 480px; width: 100%; opacity: 0.92;">
</div>

<br>
