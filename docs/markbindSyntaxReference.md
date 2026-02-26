# MarkBind Comprehensive Syntax Reference

This document compiles all syntax features for MarkBind 6.3.1.

---

## 1. Structure & Metadata

### Frontmatter
```html
<frontmatter>
  title: Binary Search Tree
  pageNav: 2
</frontmatter>
```

### Variables
Place global variables in `_markbind/variables.md`.
```html
<variable name="year">2018</variable>
The year was {{ year }}
```

### Includes
```html
<include src="foo.md#bar" boilerplate inline trim>
  <variable name="x">5</variable>
</include>
```

---

## 2. Basic Formatting

### Text Styles
| Style | Syntax |
| :--- | :--- |
| **Bold** | `**Bold**` |
| *Italic* | `_Italic_` |
| ***Bold & Italic*** | `___Bold & Italic___` |
| `Inline Code` | `` `Inline Code` `` |
| ~~Strike through~~ | `~~Strike through~~` |
| ****Super Bold**** | `****Super Bold****` |
| !!Underline!! | `!!Underline!!` |
| ==Highlight== | `==Highlight==` |
| %%Dim%% | `%%Dim%%` |
| ++Large++ | `++Large++` |
| --Small-- | `--Small--` |
| Super^script^ | `Super^script^` |
| Sub~script~ | `Sub~script~` |

### Headings
```markdown
### Heading level 3
###### Heading level 6
```

### Lists
```markdown
1. Item 1
   1. Sub item 1.1
* Item 2
- [ ] Item 3 (Checkbox)
- [x] Item 4 (Completed)
- ( ) Item 5 (Radio)
```

### Tables
```markdown
Animal | Trainable?| Price | Remarks
:----- | :-------: | ----: | ----
Ants   | no        | 5     |
Cats   | yes       | 100   |
```

---

## 3. Components & Layout



### Badges
```html
<span class="badge bg-primary">Primary</span>
<span class="badge rounded-pill bg-success">Success</span>
<button type="button" class="btn btn-primary">
  Difficulty Level <span class="badge bg-light text-dark">4</span>
</button>
```

### Blockquotes
```md
> Blockquote, first paragraph
>
> Second paragraph
>> Nested blockquote
```

### Boxes
```html
<box type="warning">
  warning
</box>
```

### Panels
```html
<panel header="primary type panel" type="primary" >
  ...
</panel>
```

### Tabs
```html
<tabs>
  <tab header="First tab">Content</tab>
  <tab-group header="Third tab group :tv:">
    <tab header="Stars :star:">Stuff...</tab>
  </tab-group>
</tabs>
```

### CardStacks
```html
<cardstack searchable blocks="2">
    <card header="**Basic Card** :rocket:" tag="Basic Card">
        Content...
    </card>
</cardstack>
```

---

## 4. Navigation & Search

### Navbars & Site Menus
```html
<navbar type="primary">
  <a slot="brand" href="/" class="navbar-brand">MarkBind</a>
  <li><a href="/docs" class="nav-link">Link</a></li>
</navbar>

<site-nav>
* [**Getting Started**](/userGuide/gettingStarted.html)
* **Authoring Contents** :expanded:
  * [Overview](/userGuide/authoringContents.html)
</site-nav>
```

### Page Navigation & Tools
* **Breadcrumbs:** `<breadcrumb />`
* **Page Nav TOC:** `<page-nav-print />`
* **Search Bar:** `<searchbar :data="searchData" placeholder="Search"></searchbar>`
* **Scroll Top:** `<scroll-top-button icon=":fas-arrow-circle-up:" icon-size="2x"></scroll-top-button>`

---

## 5. Media & Diagrams

### Images, Pictures & Thumbnails
```markdown
![alt text](url "title")

<pic src="url" width="300" lazy>Caption</pic>

<thumb circle src="url" size="100"/>
```

### Annotations
```html
<annotate src="image.png" width="500">
  <a-point x="25%" y="25%" content="Lorem ipsum" />
  <a-point x="50%" y="25%" content="With label" label="1a"/>
</annotate>
```

### Diagrams (PlantUML)
```html
<puml width=300>
@startuml
alice -> bob : hello
@enduml
</puml>
```

### Embeds
```markdown
@[youtube](v40b3ExbM0c)
@[powerpoint](https://onedrive.live.com/embed?...)
```

---

## 6. Interactive Features

### Modals, Popovers & Tooltips
```html
<trigger trigger="click" for="modal:id">Click</trigger>
<modal header="Header" id="modal:id">Content</modal>

<trigger for="pop:id">Hover</trigger>
<popover id="pop:id" header="Title"><div slot="content">Info</div></popover>

<tooltip content="Markdown support">Hover here</tooltip>
```

### Questions & Quizzes
```html
<question type="mcq">
  Question?
  <q-option>Wrong</q-option>
  <q-option correct>Right <div slot="reason">Why it's right</div></q-option>
</question>

<question type="blanks">
  The capital is __________.
  <q-option keywords="Paris"></q-option>
</question>
```

---

## 7. Advanced Syntax

### Classes & Attributes
```markdown
add a space before '{' for block level {.class-name #id}
**inline**{.text-danger}
```

### Math Formulae
```markdown
Inline: \( e^{i\pi}+1=0 \)

Block:
\[ 3x + y = 11 \]
```

### Footnotes
```markdown
Reference[^1]
[^1]: The footnote content.
```

### Tree View
```text
<tree>
C:/course/
  textbook/
    index.md
</tree>
```

### Tags
```html
<p tags="language--java advanced">System.out.println("Hello");</p>
```