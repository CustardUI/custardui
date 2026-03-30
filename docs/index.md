<frontmatter>
  title: CustardUI - Your docs, shaped for every reader
</frontmatter>

<h1 class="display-3 text-center font-with-serif"><md> **CustardUI** </md></h1>


<div class="lead text-center">

**Let readers customise your static web pages!**
</div>

Add CustardUI to your static website and let readers personalise their experience by hiding sections they don't need, setting their preferred view across every page, and sharing exactly the right content with others. No backend required.



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

Recursion is a technique where a function calls itself to solve a smaller version of the same problem.

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

</variable>
<variable name="content2">


#### Week 7 — Binary Search

<cv-toggle-control toggle-id="additional-info"></cv-toggle-control>
<br>

Binary search finds an element in a sorted list by repeatedly halving the search space.

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

</variable>
</include>

---


<p class="cv-section-header">Set the default tab in tab groups.</p>




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




---

<p class="cv-section-header">Share your customisations with others.</p>

---

<p class="cv-section-header">Advanced: let adopters create ‘adaptation’ of your site.</p>



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
