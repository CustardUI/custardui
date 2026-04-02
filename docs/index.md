<frontmatter>
  title: CustardUI - Your docs, shaped for every reader
</frontmatter>

<h1 class="display-3 text-center"><md> **Custard**<span class="font-with-serif">UI</span> </md></h1>

<!-- Make the top more eye catching -->

<div class="lead text-center">

**Let readers customise your static web pages!**
</div>

Add CustardUI to your static website and let readers personalise their experience by hiding sections they don't need, setting their preferred view across every page, and sharing exactly the right content with others. No backend required.

<!-- It should be clear which are examples and which are main page content.

Example content should be realistic but also fully disjoint from page content e.g., Avoid installation details as example -->


<!-- Each example, it is good to have some sort of animation of that sort. -->

---

<h2 class="cv-section-title">What it can do</h2>
<p class="cv-section-header">Hide irrelevant sections; Collapse less relevant sections.</p>

Let readers collapse what they don't need. Their choice sticks across pages and sessions.

<include src="browserBoxTriple.md" boilerplate>
<variable name="url">https://cs2103t.github.io/website/textbook</variable>
<variable name="content1">

#### Dependency Injection

**Toggle:** <cv-toggle-control toggle-id="code-example-hide" inline></cv-toggle-control>

Dependency Injection (DI) is a technique where an object's dependencies are provided externally rather than created by the object itself. This reduces coupling and makes code easier to test.

<cv-toggle toggle-id="code-example-hide" show-label show-peek-border>


```java
// Without DI — tightly coupled
class UserService {
    private Database db = new Database();
}

// With DI — dependency is injected
class UserService {
    private Database db;

    public UserService(Database db) {
        this.db = db;
    }
}
```

</cv-toggle>

%%Prefer constructor injection over field injection — it makes dependencies explicit and the class easier to test.%%



</variable>
<variable name="content2">


#### Dependency Injection

**Toggle:** <cv-toggle-control toggle-id="code-example-peek" inline></cv-toggle-control>

Dependency Injection (DI) is a technique where an object's dependencies are provided externally rather than created by the object itself. This reduces coupling and makes code easier to test.

<cv-toggle toggle-id="code-example-peek" show-label show-peek-border>


```java
// Without DI — tightly coupled
class UserService {
    private Database db = new Database();
}

// With DI — dependency is injected
class UserService {
    private Database db;

    public UserService(Database db) {
        this.db = db;
    }
}
```

</cv-toggle>

%%Prefer constructor injection over field injection — it makes dependencies explicit and the class easier to test.%%


</variable>
<variable name="content3">


#### Dependency Injection

**Toggle:** <cv-toggle-control toggle-id="code-example-show" inline></cv-toggle-control>

Dependency Injection (DI) is a technique where an object's dependencies are provided externally rather than created by the object itself. This reduces coupling and makes code easier to test.

<cv-toggle toggle-id="code-example-show" show-label show-peek-border>


```java
// Without DI — tightly coupled
class UserService {
    private Database db = new Database();
}

// With DI — dependency is injected
class UserService {
    private Database db;

    public UserService(Database db) {
        this.db = db;
    }
}
```

</cv-toggle>

%%Prefer constructor injection over field injection — it makes dependencies explicit and the class easier to test.%%

</variable>
</include>

%%The same page, three toggle states, where each reader can set their own peferences and see only what they chose to.%%

---


<!-- TABGROUPS -->

<p class="cv-section-header">Set the default tab in tab groups.</p>

Let readers switch to their preferred view for tabgroups once, and this selection persists across your site.

* Hover and click the &nbsp; :fa-solid-bookmark: &nbsp; icon on any tab, or simply double-click it, to set it as your default across the site.
* Prefer a cleaner view? Hide the tab bar entirely in the settings modal through the&nbsp; :fa-solid-gear: &nbsp; icon on the left. Click the option to \
_"show only the selected tab"_ to hide the navigation headers and show only your preferred content!

<include src="browserBoxSplit.md" boilerplate>
<variable name="url1">https://course-website.org/textbook/sorting</variable>
<variable name="url2">https://course-website.org/textbook/searching</variable>
<variable name="content1">


#### Insertion Sort

%%Insertion Sort builds a sorted array one element at a time by picking each element and placing it in its correct position. Simple and efficient for small or nearly sorted arrays.%%

<cv-tabgroup group-id="tab-group-example" nav="auto">
<cv-tab tab-id="javascript" header="JavaScript">

```javascript
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
```

</cv-tab>
<cv-tab tab-id="java" header="Java">

```java
void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
```

</cv-tab>
<cv-tab tab-id="python" header="Python">

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
```

</cv-tab>
</cv-tabgroup>

%%Time complexity: O(n²) worst case, O(n) best case on nearly sorted arrays.%%

</variable>
<variable name="content2">

#### Binary Search

%%Binary Search finds a target value in a sorted array by repeatedly halving the search space. Far more efficient than linear search for large datasets.%%

<cv-tabgroup group-id="tab-group-example" nav="auto">
<cv-tab tab-id="javascript" header="JavaScript">

```javascript
function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```
</cv-tab>
<cv-tab tab-id="java" header="Java">

```java
int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

</cv-tab>
<cv-tab tab-id="python" header="Python">

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

</cv-tab>
</cv-tabgroup>

%%Time complexity: O(log n). Requires the array to be sorted before searching.%%

</variable>
</include>

%%Switch to Python on either page, and every code example across the site follows.%%


--- 

<p class="cv-section-header">Tweak placeholder text to match the reader's profile.</p>

Let readers personalise your page to their needs. 

* Define a placeholder once, readers fill it in, and every instance across the site updates instantly. No backend required.

<include src="browserBox.md" boilerplate>
<variable name="url">https://course-website.org/admin/setup</variable>
<variable name="content">

#### :fa-solid-graduation-cap: Course Instructions and Guide 

Follow the steps below to set up your individual project repository. Enter your GitHub username once — all links and commands on this page will update to match.

Enter your GitHub username here: &nbsp; <cv-placeholder-input name="username" hint="e.g. johndoe" layout="inline" appearance="underline" /> &nbsp;
<img src="https://github.com/[[username : github ]].png" 
  style="height: 1.8rem; vertical-align: middle; border-radius: 50%; margin-left: 0.5rem;" 
  class="cv-bind" 
  alt="GitHub Avatar" 
/> 

**Step 1 — Fork and accept the invitation**

Accept the GitHub Classroom invitation using your account at :fa-brands-github: <a href="https://github.com[[username ? /$ : ]]" class="cv-bind" target="_blank">github.com[[username ? /$ : ]]</a>. This will create a pre-configured fork of the exercise repository under your account.

**Step 2 — Clone and get started**

Run the command below to clone your repository to your local machine, then make your first commit to confirm everything is working.

```
git clone https://[[ username ? github.com/cs2103t/$-ip.git : your-repo-link ]]
```

%%Stuck? Raise an issue on the forum and include your GitHub username so tutors can locate your repository quickly.%%


</variable>
</include>

%%Type a username above — every link, command, and path updates live.%%

---

<!-- SHARE VIEW -->

<p class="cv-section-header">Share selected parts of a page with others.</p>

Link anyone directly to the exact paragraph, step, or answer they need. No more "scroll down and look for it."

<include src="browserBoxSplit.md" boilerplate>
<variable name="url1">cs2103t.github.io/textbook/week9</variable>
<variable name="url2">cs2103t.github.io/admin/faq</variable>
<variable name="content1">

#### Liskov Substitution Principle

The Liskov Substitution Principle (LSP) states that objects of a subclass should be substitutable for objects of the superclass without altering the correctness of the program.

<div id="lsp-violation-example">

**Common violation:** Overriding a method in a subclass to throw an exception or do nothing breaks substitutability — callers written against the superclass will break unexpectedly.

<a href="?cv-highlight=lsp-violation-example">:fa-solid-link: Share</a> &nbsp;·&nbsp; <a href="?cv-highlight=lsp-violation-example%3Ared%3Abr%3AWatch%2520out%2520for%2520this%2521">:fa-solid-link: Share with note</a>

</div>

The principle encourages designing inheritance hierarchies where subclasses genuinely extend, rather than contradict, the behaviour of their parent.

</variable>
<variable name="content2">

#### Frequently Asked Questions

**When is the submission deadline?**

All submissions are due Friday 11:59 PM. Push to your `master` branch on GitHub.

<div id="faq-team-repo">

**Where do I find my team repo?**

Your team repo is at `github.com/cs2103t-[team-id]/tp`. If you cannot access it, check that you have accepted the GitHub Classroom invitation.

<a href="?cv-highlight=faq-team-repo">:fa-solid-link: Share</a> &nbsp;·&nbsp; <a href="?cv-highlight=faq-team-repo%3A%3Atl%3ARefer%2520to%2520this%2521">:fa-solid-link: Share with note</a>

</div>

**How do I add my tutor as a collaborator?**

Go to your repo → Settings → Collaborators → Add your tutor's GitHub username.

</variable>
</include>


%%Click "Share" for a plain highlight, or "Share with note" to include a message and color. The URL encodes the element, color, position, and note — the recipient lands directly on that section.%%

**Generating share links is built in.** Add `#cv-share` to any page URL to enter share mode. Hover over any element on the page, add a note, and CustardUI generates the shareable URL for you. Links use content fingerprinting to stay robust even if the page text changes slightly.

---

<p class="cv-section-header">Share your customisations with others.</p>

<include src="browserBox.md" boilerplate >
<variable name="url">git-mastery.org/faq</variable>
<variable name="content">

Hello there!

Preconfigured usernames or team ids
Preconfigured tab settings


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
