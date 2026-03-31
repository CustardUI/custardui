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


<!-- For toggles, better to show 3 examples of the same toggle, in each state -->

<!-- Each example, it is good to have some sort of animation of that sort. -->

---

<h2 class="cv-section-title">What it can do</h2>
<p class="cv-section-header">Hide irrelevant sections; Collapse less relevant sections.</p>

Let readers collapse what they don't need. Their choice sticks across pages and sessions.

<include src="browserBoxTriple.md" boilerplate>
<variable name="url">https://cs2103t.github.io/website/textbook</variable>
<variable name="content1">

#### Dependency Injection

**Toggle:** <cv-toggle-control toggle-id="code-example-hide" no-label></cv-toggle-control>

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

**Toggle:** <cv-toggle-control toggle-id="code-example-peek" no-label></cv-toggle-control>

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

**Toggle:** <cv-toggle-control toggle-id="code-example-show" no-label></cv-toggle-control>

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
