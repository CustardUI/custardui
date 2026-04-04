{% set title = "Tabs" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}


<include src="browserBoxSplit.md" boilerplate>
<variable name="url1">https://cs4321.github.io/week6/time-management</variable>
<variable name="url2">https://cs4321.github.io/week7/networking</variable>
<variable name="content1">

#### Time Management

%%The Eisenhower Matrix helps prioritise tasks by urgency and importance. Not everything urgent is important; not everything important is urgent.%%

<cv-tabgroup group-id="tab-group-test" nav="auto">
<cv-tab tab-id="text" header="Text">

The matrix divides tasks into four quadrants:

1. **Do**: Urgent and important. Deadlines, critical bugs. Handle immediately.
2. **Decide**: Not urgent but important. Planning, learning, refactoring. Schedule time for these.
3. **Delegate**: Urgent but not important. Pass to someone else if possible.
4. **Delete**: Don't do it. Neither urgent nor important. Busywork, distractions. Drop entirely.

</cv-tab>
<cv-tab tab-id="diagram" header="Diagram">

<div style="display: flex; justify-content: center;">
<div style="width: 70%;">
<mermaid>
%%{init: { 'theme': 'neutral' } }%%
quadrantChart
  x-axis High Urgency --> Low Urgency
  y-axis Low Importance --> High Importance
  quadrant-1 Decide
  quadrant-2 Do
  quadrant-3 Delegate
  quadrant-4 Delete
  Critical bug fix: [0.15, 0.85]
  Project planning: [0.8, 0.8]
  Urgent email: [0.2, 0.75]
  Code refactoring: [0.75, 0.7]
  Updating internal wiki: [0.2, 0.25]
  Busywork: [0.8, 0.2]
</mermaid>
</div>
</div>

</cv-tab>
</cv-tabgroup>

%%Putting things to-do on a list frees your mind. But always question what is worth doing first.%%

</variable>
<variable name="content2">

#### HTTP Request-Response

%%Web interactions involve a client sending a request to a server, which may query a data source to return a structured response. Understanding this cycle is fundamental to building reliable web software.%%

<cv-tabgroup group-id="tab-group-test">
  <cv-tab tab-id="text" header="Text">

1. The **Client** sends a `GET /api/data` request to the **Server**.
2. The **Server** validates the request token with the **Auth** service.
3. Once authorized, the **Server** queries the **Database** using a SQL `SELECT` statement.
4. The **Database** returns the matching rows to the **Server**.
5. The **Server** formats the data as JSON.
6. The **Server** replies to the **Client** with `200 OK` and the JSON payload.

  </cv-tab>
  <cv-tab tab-id="diagram" header="Diagram">

<mermaid>
%%{init: { 'theme': 'neutral' } }%%
sequenceDiagram
  Client->>Server: GET /api/data
  Server->>Auth: Validate token
  Auth-->>Server: 200 Authorized
  Server->>Database: SELECT * FROM records
  Database-->>Server: rows[]
  Server->>Server: Format as JSON
  Server-->>Client: 200 OK, JSON payload
</mermaid>

  </cv-tab>
</cv-tabgroup>

%%A `404` response means the resource was not found. A `500` response indicates a server-side error. Always handle both in your client code.%%

</variable>
</include>


<panel header="Not preloaded option (Default Panel Behavior)">

Non preload.

<cv-tabgroup group-id="fruit">
<cv-tab tab-id="apple">
<cv-tab-header>

:fa-solid-heart: Apple Types
</cv-tab-header>
<cv-tab-body>

Apple types include **Granny Smith** and the **Cosmic Crisp**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="orange">
<cv-tab-header>

:fa-solid-circle: Orange Types
</cv-tab-header>
<cv-tab-body>

Orange types include the **Blood orange** and **Valencia orange**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="pear">
<cv-tab-header>

:fa-solid-leaf: Pear Types
</cv-tab-header>
<cv-tab-body>

Pear types include other pears.
</cv-tab-body>

</cv-tabgroup>

</panel>

<panel header="Example Usage - Preloaded" preload="true">
<!-- ------------------------ CODE OUTPUT ---------------------------- -->

<include src="codeAndOutput.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple" header="Apple">
  
**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

<box type="important" icon=":apple:">
    An apple a day keeps the doctor away!
</box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

<box type="warning" icon=":orange:">
    The color orange was named after the fruit, not the other way around
</box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

<box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
</box>

  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
</cv-tab-header>
<cv-tab-body>

Apple types include **Granny Smith** and the **Cosmic Crisp**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="orange">
<cv-tab-header>

:fa-solid-circle: Orange Types
</cv-tab-header>
<cv-tab-body>

Orange types include the **Blood orange** and **Valencia orange**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="pear">
<cv-tab-header>

:fa-solid-leaf: Pear Types
</cv-tab-header>
<cv-tab-body>
</cv-tabgroup>

</variable>
</include>

</panel>

<!-- ------------------------ CODE OUTPUT ---------------------------- -->
<br>

## Fruits Tabs

<cv-tabgroup group-id="fruit" >
  
  <cv-tab tab-id="apple" header="Apple">
  
  **Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

  <box type="important" icon=":apple:">
      An apple a day keeps the doctor away!
  </box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
  **Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

  <box type="warning" icon=":orange:">
      The color orange was named after the fruit, not the other way around
  </box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
  **Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

  <box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
  </box>
  </cv-tab>
</cv-tabgroup>

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
</cv-tab-header>
<cv-tab-body>

Apple types include **Granny Smith** and the **Cosmic Crisp**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="orange">
<cv-tab-header>

:fa-solid-circle: Orange Types
</cv-tab-header>
<cv-tab-body>

Orange types include the **Blood orange** and **Valencia orange**.
</cv-tab-body>
</cv-tab>
<cv-tab tab-id="pear">
<cv-tab-header>

:fa-solid-leaf: Pear Types
</cv-tab-header>
<cv-tab-body>

Pear types include the **Asian pear** and the **European pear**
</cv-tab-body>
</cv-tab>
</cv-tabgroup>

## Color Schemes

The redesigned `TabGroup` and `Tab` use generic colors (`currentColor`, `transparent`, and `opacity`) and no longer hardcode white backgrounds. This allows the tabs to adapt perfectly to differently colored parent containers.

<div style="background-color: #f8dbdb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; color: #842029;">
  <h4 style="margin-top: 0">Red Background Test</h4>
  <cv-tabgroup group-id="red-test">
    <cv-tab tab-id="r1" header="First Tab">Testing on a light red background.</cv-tab>
    <cv-tab tab-id="r2" header="Second Tab">Notice how the active tab has no white background block, and the text color inherits naturally!</cv-tab>
  </cv-tabgroup>
</div>

<div style="background-color: #052c65; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; color: #cfe2ff;">
  <h4 style="margin-top: 0">Dark Navy Background Test</h4>
  <cv-tabgroup group-id="navy-test">
    <cv-tab tab-id="n1" header="Intro">Testing on a dark navy background.</cv-tab>
    <cv-tab tab-id="n2" header="Details">The generic border fallback `rgba(128,128,128,0.3)` and text inheritance keeps this legible.</cv-tab>
  </cv-tabgroup>
</div>

<div style="background-color: #d1e7dd; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; color: #0f5132;">
  <h4 style="margin-top: 0">Green Background Test</h4>
  <cv-tabgroup group-id="green-test">
    <cv-tab tab-id="g1" header="Setup">Testing on a light green background.</cv-tab>
    <cv-tab tab-id="g2" header="Config">Tabs blend seamlessly into entirely different sections without needing specific `--cv-*` overwrites.</cv-tab>
  </cv-tabgroup>
</div>
