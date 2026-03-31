<frontmatter>
  title: CustardUI - Your docs, shaped for every reader
</frontmatter>

<h1 class="display-3 text-center font-with-serif"><md> **CustardUI** </md></h1>


<!-- Make the top more eye catching -->

<div class="lead text-center">

**Let readers customise your static web pages!**
</div>

Add CustardUI to your static website and let readers personalise their experience by hiding sections they don't need, setting their preferred view across every page, and sharing exactly the right content with others. No backend required.

<!-- It should be clear which are examples and which are main page content.

Example content should be realistic but also fully disjoint from page content e.g., Avoid installation details as example -->


<!-- For toggles, better to show 3 examples of the same toggle, in each state -->

<!-- Each example, it is good to have some sort of animation of that sort. -->

---

<h2 class="cv-section-title">What it can do</h2>
<p class="cv-section-header">Hide irrelevant sections; Collapse less relevant sections.</p>

Let readers collapse what they don't need. Their choice sticks across pages and sessions.

<include src="browserBoxSplit.md" boilerplate>
<variable name="url1">https://nus-cs2103t.github.io/week6/topics</variable>
<variable name="url2">https://nus-cs2103t.github.io/week7/topics</variable>
<variable name="content1">


#### Week 6 — Recursion

<cv-toggle-control toggle-id="optional-exercises"></cv-toggle-control>
<br>

%%Recursion is a technique where a function calls itself to solve a smaller version of the same problem.%%

<cv-toggle toggle-id="optional-exercises">

**Optional Exercises**

Try these additional problems to reinforce your understanding of recursion.

1. Implement `fibonacci(n)` recursively.
2. Write a recursive function to flatten a nested list.

</cv-toggle>

<cv-toggle toggle-id="additional-info">

**Additional Information**

Recursion can cause a stack overflow if the base case is missing or unreachable. Always verify your base case before testing.

</cv-toggle>

%%The base case is the most important part of any recursive function.%%


</variable>
<variable name="content2">


#### Week 7 — Binary Search

<cv-toggle-control toggle-id="additional-info"></cv-toggle-control>
<br>

%%Binary search finds an element in a sorted list by repeatedly halving the search space.%%

<cv-toggle toggle-id="optional-exercises">

**Optional Exercises**

Practice binary search with these problems.

1. Find the index of a target value in a sorted array.
2. Implement binary search recursively.

</cv-toggle>

<cv-toggle toggle-id="additional-info" show-peek-border>

**Additional Information**

Binary search requires the list to be sorted. Applying it to an unsorted list will produce incorrect results.

</cv-toggle>

%%Time complexity: O(log n). Space complexity: O(1) for the iterative version.%%


</variable>
</include>


%%Toggle preferences sync across pages.%%

---


<p class="cv-section-header">Set the default tab in tab groups.</p>

Let readers switch to their preferred view for tabgroups once, and it follows them across pages.

<include src="browserBoxSplit.md" boilerplate>
<variable name="url1">https://cs4321.github.io/week6/software-process</variable>
<variable name="url2">https://cs4321.github.io/week7/networking</variable>
<variable name="content1">

#### Git Branching Strategy

%%A Git branching strategy defines how branches organise work. In a typical feature branch workflow, changes are developed in isolation and merged back to `main` only after review.%%

<cv-tabgroup group-id="uml-view" nav="auto">
<cv-tab tab-id="text" header="Text">

1. A `feature` branch is created off `main` for new work.
2. Two commits are made: the login form and its validation.
3. Meanwhile, a `hotfix` branch is cut from `main` to address a bug.
4. `hotfix` is merged back into `main` first.
5. `feature` is then merged into `main` after review.

</cv-tab>
<cv-tab tab-id="diagram" header="Diagram">

<mermaid>
%%{init: { 'theme': 'neutral' } }%%
gitGraph
  commit id: "Initial"
  branch feature
  checkout feature
  commit id: "Login form"
  checkout main
  branch hotfix
  checkout hotfix
  commit id: "Fix bug"
  checkout main
  merge feature
</mermaid>

</cv-tab>
</cv-tabgroup>

%%Branches should be short-lived. Long-running branches accumulate merge conflicts and slow down the team.%%

</variable>
<variable name="content2">

#### HTTP Request-Response

%%Web interactions involve a client sending a request to a server, which may query a data source to return a structured response.%%

<cv-tabgroup group-id="uml-view">
  <cv-tab tab-id="text" header="Text">

1. The **Client** sends a `GET /api/data` request to the **Server**.
2. The **Server** queries the **Database** using a SQL `SELECT` statement.
3. The **Database** returns the matching rows to the **Server**.
4. The **Server** formats the data as JSON and replies with `200 OK`.


  </cv-tab>
  <cv-tab tab-id="diagram" header="Diagram">

<mermaid>
sequenceDiagram
  Client->>Server: GET /api/data
  Server->>Database: SELECT * FROM records
  Database-->>Server: rows[]
  Server-->>Client: 200 OK, JSON payload
</mermaid>

  </cv-tab>
</cv-tabgroup>

%%A `404` response means the resource was not found. A `500` response indicates a server-side error. Always handle both in your client code.%%

</variable>
</include>

%%Switch between "Diagram" and "Text" on the left — the right pane follows automatically.%%




--- 

<p class="cv-section-header">Tweak placeholder text to match the reader's profile.</p>


<include src="browserBox.md" boilerplate >
<variable name="url">git-mastery.org/faq</variable>
<variable name="content">

Hello there!
</variable>
</include>

---

<p class="cv-section-header">Share selected parts of a page with others.</p>

<include src="browserBox.md" boilerplate >
<variable name="url">git-mastery.org/faq</variable>
<variable name="content">

Hello there!
</variable>
</include>


---

<p class="cv-section-header">Share your customisations with others.</p>

<include src="browserBox.md" boilerplate >
<variable name="url">git-mastery.org/faq</variable>
<variable name="content">

Hello there!
</variable>
</include>

---

<p class="cv-section-header">Advanced: let adopters create ‘adaptation’ of your site.</p>

<include src="browserBoxSplit.md" boilerplate>
<variable name="url1"> https://XXX </variable>
<variable name="url2"> https://YYY </variable>
<variable name="content1">


</variable>
<variable name="content2">


</variable>
</include>

---


<h2 class="cv-section-title"> How it Works</h2>

<!-- How well does it work? -->


All settings saved in the Browser. Works with all popular browsers. 
You control what can be customised.



---

<h2 class="cv-section-title">How to Get Started</h2>

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
Add a `custardui.config.json` to your site root defining your toggles, tabs, and placeholders.
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

The author guide is here.

<div class="cv-cta-actions">
  <a href="{{baseUrl}}/authorGuide/gettingStarted.html" class="cv-btn-secondary"><md>:fa-solid-book:</md> Read the Docs</a>
  <a href="https://github.com/custardui/custardui" class="cv-btn-secondary"><md>:fa-brands-github:</md> View on GitHub</a>
</div>

<div style="text-align: center; margin: 3rem 0 1.5rem;">
  <img src="{{baseUrl}}/images/custards-drip.jpg" style="max-width: 480px; width: 100%; opacity: 0.92;">
</div>

<br>
