<frontmatter>
  title: CustardUI - Personalized, Interactive Static Websites
</frontmatter>

<div class="cv-hero-badge">✦ Open Source · Lightweight · Framework-Agnostic</div>

<h1 class="display-3"><md>**CustardUI**</md></h1>

<div class="lead">

++**Generate <tooltip content="level up your website!">_more interactive_</tooltip> websites.**++
Personalized for any reader. Optimized for interacting with any kind of text-based websites %%e.g., eLearning websites, online instruction manuals, project documentation etc.%%
</div>

CustardUI (formerly named CustomViews) adds dynamic, memory-persistent interactivity to static websites — no backend required. Built for educational sites, documentation portals, and course textbooks.

<div class="cv-hero-actions">
  <a href="{{baseUrl}}/authorGuide/gettingStarted.html" class="cv-btn-secondary"><md>:fa-solid-book:</md> Read the Docs</a>
  <a href="https://github.com/custardui/custardui" class="cv-btn-secondary"><md>:fa-brands-github:</md> View on GitHub</a>
</div>

<!-- ═══════════════════════════════════════════════ -->
<!--  WHAT IS CUSTARDUI                              -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">The problem it solves</p>
<h2 class="cv-section-title">One site. Many readers. Zero compromise.</h2>
<p class="cv-section-lead">

Text-heavy educational websites serve students, instructors, and whole organizations — all with different needs. CustardUI lets a single static site adapt to each of them, without duplicate pages or complex servers. 
</p>

<!-- ═══════════════════════════════════════════════ -->
<!--  FEATURE CARDS                                  -->
<!-- ═══════════════════════════════════════════════ -->

<div class="cv-features-grid">
<div class="cv-feature-card">
<div class="cv-feature-icon"><md>:fa-solid-table-columns:</md></div>

### Memory-Persistent Tabs

Tab selections sync across the entire site and are remembered across visits. A student who prefers the CLI view never has to switch back.

</div>
<div class="cv-feature-card">
<div class="cv-feature-icon"><md>:fa-solid-eye:</md></div>

### Content Toggles

Show, hide, or "peek" sections based on reader preferences. Perfect for optional deep-dives, platform-specific steps, or progressive disclosure.

</div>
<div class="cv-feature-card">
<div class="cv-feature-icon"><md>:fa-solid-user-pen:</md></div>

### Dynamic Placeholders

Personalize text with reader-defined values — greet students by name, pre-fill their team ID, or adapt instructions to their context.

</div>
<div class="cv-feature-card">
<div class="cv-feature-icon"><md>:fa-solid-link:</md></div>

### Focus & Share

Highlight and link directly to any content block on the page. TAs can share a URL that lands readers on exactly the right paragraph.

</div>
<div class="cv-feature-card">
<div class="cv-feature-icon"><md>:fa-solid-layer-group:</md></div>

### Adaptations

Serve entirely different audiences from a single deployment. Swap images, links, and text so the same resource feels native to each organization.

</div>
<div class="cv-feature-card">
<div class="cv-feature-icon"><md>:fa-solid-bolt:</md></div>

### Zero Backend, Any Site

Works with MarkBind, Jekyll, plain HTML — anything. One script tag and a config file is all it takes to get started.

</div>
</div>

---

<!-- ═══════════════════════════════════════════════ -->
<!--  FOCUS & SHARE CALLOUT                          -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">Focus & Share</p>
<h2 class="cv-section-title">Answer questions with a link.</h2>

Did you notice the **Share this tip** link in Step 3 above? That's Focus & Share in action. Any element on the page, with or without an `id`, can become a shareable, highlighted anchor. No more "scroll down and find the paragraph about tempering eggs." You can even share this text paragraph [here](?cv-highlight=W3sidCI6IlAiLCJpIjoyOSwicCI6ImNvbnRlbnQtd3JhcHBlciIsInMiOiJEaWQgeW91IG5vdGljZSB0aGUgU2hhcmUgdGhpcyB0aSIsImgiOjg0Mzk0NDcxNywiaWQiOiIifV0%3D)!

<box type="info">

**How it works for TAs and instructors:** When a student asks a forum question, instead of typing out an explanation, a TA can share a URL like:

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

This is how **[git-mastery.org](https://git-mastery.org/)** will use CustardUI — a single site serving multiple audiences with zero backend infrastructure.

</box>

---

<!-- ═══════════════════════════════════════════════ -->
<!--  QUICK SETUP                                    -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">Getting started</p>
<h2 class="cv-section-title">Up and running in minutes.</h2>

CustardUI works with any static site. There's no build step, no npm install, and no server to manage.

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
        "toggleId": "nutrition",
        "label": "Nutrition",
        "isLocal": true,
        "default": "peek"
      },
      ...
    ],
    "tabgroups": [
    {
      "groupId": "units",
      "tabs": [
        { "tabId": "metric", "label": "Metric" },
        { "tabId": "imperial", "label": "Imperial" }
      ],
      ...
    }
   ],
   "placeholders": [
    {
      "name": "username",
      "defaultValue": "Guest",
      ...
    }
   ]
  },
  ...
}
```


[:fa-solid-book: Full documentation →]({{baseUrl}}/authorGuide/gettingStarted.html)


<!-- ═══════════════════════════════════════════════ -->
<!--  LIVE DEMO                                      -->
<!-- ═══════════════════════════════════════════════ -->

<p class="cv-section-eyebrow">See it in action</p>
<h2 class="cv-section-title">A taste of CustardUI</h2>
  
This demo page _is itself_ a CustardUI-powered site. The recipe below uses live tabs, toggles, and placeholders — exactly as your readers would experience them.

Before you continue, you can update your **username** here: <cv-placeholder-input name="username" /> to see how CustardUI adapts the page in real-time. Click <a href="https://www.google.com/search?q=[[username]] is awesome!" class="cv-bind">
here
</a> for a surprise!

<div class="cv-demo-wrapper">
  <div class="cv-demo-header">
    <div class="cv-demo-dot"></div>
    <span class="cv-demo-label">Live Demo — Classic Custard Pudding Recipe</span>
  </div>

<img src="{{baseUrl}}/images/custardUI.png" height="56" style="margin-bottom: 1rem; display: block;">

++**Hello, [[username]]!**++ Welcome to your personalized recipe card. %%(Your name is set via the CustardUI settings panel — try it!)%%

---

<cv-toggle toggle-id="ingredients">

#### Ingredients

Select your preferred units — this preference will be remembered across the whole site. Double-click a tab to "pin" your preference, or set it via the settings panel.

#### :fa-solid-fire: Caramel Sauce

<cv-tabgroup group-id="units" nav="auto">
  <cv-tab tab-id="metric" header="Metric">
<ul class="cv-ingredient-list">
  <li><span class="cv-ingredient-name">Granulated sugar</span><span class="cv-ingredient-amount">70 g</span></li>
  <li><span class="cv-ingredient-name">Water, room temp</span><span class="cv-ingredient-amount">1 Tbsp</span></li>
  <li><span class="cv-ingredient-name">Hot water</span><span class="cv-ingredient-amount">1 Tbsp</span></li>
</ul>
  </cv-tab>
  <cv-tab tab-id="imperial" header="Imperial">
<ul class="cv-ingredient-list">
  <li><span class="cv-ingredient-name">Granulated sugar</span><span class="cv-ingredient-amount">5 Tbsp</span></li>
  <li><span class="cv-ingredient-name">Water, room temp</span><span class="cv-ingredient-amount">1 Tbsp</span></li>
  <li><span class="cv-ingredient-name">Hot water</span><span class="cv-ingredient-amount">1 Tbsp</span></li>
</ul>
  </cv-tab>
</cv-tabgroup>

#### :fa-solid-egg: Custard

<cv-tabgroup group-id="units" nav="auto">
  <cv-tab tab-id="metric" header="Metric">
<ul class="cv-ingredient-list">
  <li><span class="cv-ingredient-name">Whole milk</span><span class="cv-ingredient-amount">400 ml</span></li>
  <li><span class="cv-ingredient-name">Heavy whipping cream</span><span class="cv-ingredient-amount">100 ml</span></li>
  <li><span class="cv-ingredient-name">Pure vanilla extract</span><span class="cv-ingredient-amount">½ tsp</span></li>
  <li><span class="cv-ingredient-name">Large eggs</span><span class="cv-ingredient-amount">3</span></li>
  <li><span class="cv-ingredient-name">Sugar</span><span class="cv-ingredient-amount">70 g</span></li>
</ul>
  </cv-tab>
  <cv-tab tab-id="imperial" header="Imperial">
<ul class="cv-ingredient-list">
  <li><span class="cv-ingredient-name">Whole milk</span><span class="cv-ingredient-amount">1⅔ cups</span></li>
  <li><span class="cv-ingredient-name">Heavy whipping cream</span><span class="cv-ingredient-amount">6 Tbsp + 2 tsp</span></li>
  <li><span class="cv-ingredient-name">Pure vanilla extract</span><span class="cv-ingredient-amount">½ tsp</span></li>
  <li><span class="cv-ingredient-name">Large eggs</span><span class="cv-ingredient-amount">3</span></li>
  <li><span class="cv-ingredient-name">Sugar</span><span class="cv-ingredient-amount">5 Tbsp</span></li>
</ul>
  </cv-tab>
</cv-tabgroup>

</cv-toggle>

<cv-toggle toggle-id="instructions">

#### Cooking Instructions

**Step 1.** Whisk the egg yolks and sugar together until pale and slightly thickened.

**Step 2.** Heat the milk and cream in a saucepan over medium heat until just steaming — do not boil.

**Step 3.** Slowly pour the hot milk into the egg mixture, whisking constantly to temper the eggs.

<div id="demo-tempering-step">

<div class="highlight-target">

**Tip — Why tempering matters:** Adding hot liquid to eggs too quickly will scramble them. Pour in a thin, steady stream while whisking vigorously. This is the most important step for a silky custard. <a href="?cv-highlight=demo-tempering-step"> :fa-solid-link: Share this tip</a>

</div>

</div>

**Step 4.** Return the mixture to the saucepan. Stir over low heat until thickened, about 8–10 minutes.

**Step 5.** Pour into ramekins and chill for at least 2 hours.

</cv-toggle>

<cv-toggle toggle-id="tips" show-label show-peek-border>

#### ✨ Optional Finishing Touches

Try these out if you'd like to go the extra mile:

<box type="tip">

**Vanilla Bean Upgrade**

Swap vanilla extract for a split vanilla pod steeped in the warm milk. Remove before tempering. The flavour difference is remarkable.

</box>


<box type="tip">

**Crème Brûlée Finish** 

Once chilled, sprinkle 1 tsp of caster sugar over each ramekin and torch until caramelised. Crack through that golden crust for a satisfying moment.

</box>

</cv-toggle>

<cv-toggle toggle-id="nutrition" show-label show-peek-border>

#### :fa-solid-heart-pulse: Nutrition %%per serving%%

<ul class="cv-ingredient-list">
  <li><span class="cv-ingredient-name">Calories</span><span class="cv-ingredient-amount">268 kcal</span></li>
  <li><span class="cv-ingredient-name">Carbohydrates</span><span class="cv-ingredient-amount">32 g</span></li>
  <li><span class="cv-ingredient-name">Protein</span><span class="cv-ingredient-amount">7 g</span></li>
  <li><span class="cv-ingredient-name">Fat</span><span class="cv-ingredient-amount">13 g</span></li>
  <li><span class="cv-ingredient-name">Saturated Fat</span><span class="cv-ingredient-amount">7 g</span></li>
  <li><span class="cv-ingredient-name">Polyunsaturated Fat</span><span class="cv-ingredient-amount">1 g</span></li>
  <li><span class="cv-ingredient-name">Monounsaturated Fat</span><span class="cv-ingredient-amount">3 g</span></li>
  <li><span class="cv-ingredient-name">Trans Fat</span><span class="cv-ingredient-amount">0.01 g</span></li>
  <li><span class="cv-ingredient-name">Cholesterol</span><span class="cv-ingredient-amount">144 mg</span></li>
  <li><span class="cv-ingredient-name">Sodium</span><span class="cv-ingredient-amount">79 mg</span></li>
  <li><span class="cv-ingredient-name">Potassium</span><span class="cv-ingredient-amount">181 mg</span></li>
  <li><span class="cv-ingredient-name">Sugar</span><span class="cv-ingredient-amount">33 g</span></li>
  <li><span class="cv-ingredient-name">Vitamin A</span><span class="cv-ingredient-amount">585 IU</span></li>
  <li><span class="cv-ingredient-name">Vitamin C</span><span class="cv-ingredient-amount">0.1 mg</span></li>
  <li><span class="cv-ingredient-name">Calcium</span><span class="cv-ingredient-amount">129 mg</span></li>
  <li><span class="cv-ingredient-name">Iron</span><span class="cv-ingredient-amount">1 mg</span></li>
</ul>

</cv-toggle>

</div>


<div class="cv-cta">
<div class="cv-cta-body">

## Make your site work for every reader.

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


