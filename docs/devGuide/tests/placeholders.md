{% set title = "Placeholder Tests" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

This page is for smoke testing the Placeholders feature of CustardUI.

### Placeholders from Config work with tabgroup on page:



I like eating `\[[ fruit ]]`:
* I like eating [[ fruit]]

The placeholder should be populated with the default `fruit` tab even when visiting from a incognito window or new page.


### Fall forward Behavior

Given username is: `\[[ username ? $ : None ]]`
* Given username is: `[[ username ? $ : None ]]`

Given username* is: `\[[ username* ? $ : None ]]`
* Given username is: `[[ username* ? $ : None ]]`


#### `placeholderTest` placeholder Tests

Test default, fallback empty, fallback value, truthy falsly.

* `\[[placeholderTest]]`: [[placeholderTest]]
* `\[[placeholderTest : ]]`: [[ placeholderTest :  ]]
* `\[[placeholderTest* : ]]`: [[ placeholderTest* :  ]]
* `\[[placeholderTest : fallback]]`: [[placeholderTest : fallback]]
* `\[[placeholderTest* : fallback]]`: [[placeholderTest* : fallback]]
* `\[[placeholderTest ? Truth : Falsy]]`: [[placeholderTest ? Truth : Falsy]]
* `\[[placeholderTest* ? Truth : Falsy]]`: [[placeholderTest* ? Truth : Falsy]]


#### Toggle Tests

```html
<cv-toggle placeholder-id="placeholderTest">Welcome, \[[placeholderTest]]!</cv-toggle>
```

* <cv-toggle placeholder-id="placeholderTest">Welcome, [[placeholderTest]]!</cv-toggle>


```html
<cv-toggle placeholder-id="placeholderTest*">Welcome, \[[placeholderTest]]!</cv-toggle>
```

* <cv-toggle placeholder-id="placeholderTest*">Welcome, [[placeholderTest]]!</cv-toggle>
