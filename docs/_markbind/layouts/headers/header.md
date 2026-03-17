<head-bottom>
  <link rel="stylesheet" href="{{baseUrl}}/stylesheets/main.css">
  <link rel="stylesheet" href="{{baseUrl}}/stylesheets/custard.css">
</head-bottom>

<div tags="beta-release" class="w-100 p-1 bg-warning text-center d-print-none"><md>**This site documents pre-release features of CustardUI and possible beta breaking changes.
For the latest stable release, visit [here](https://custardui.github.io).**</md></div>

<div tags="dev-release" class="w-100 p-1 bg-info text-center d-print-none"><md>**This site documents developmental features of CustardUI (head of develop branch) and possible breaking changes.
For the latest stable release, visit [here](https://custardui.github.io).**</md></div>

<header sticky>
  <navbar type="dark">
    <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/custardUI-words.png" height="40"></a>
    <li><a highlight-on="exact" href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/authorGuide/index.html" class="nav-link">AUTHOR GUIDE</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li>
    <li><a highlight-on="exact" href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
    <li><a highlight-on="none" href="#cv-open" class="nav-link"><include src="icons/IconGear.md" /></a></li>
    <li><a highlight-on="none" href="#cv-share" class="nav-link"><include src="icons/IconShare.md" /></a></li>
    <li><a href="https://github.com/custardui/custardui" target="_blank" class="nav-link"><md>:fab-github:</md></a></li>
    <li slot="right">
      <form class="navbar-form">
        <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
      </form>
    </li>
  </navbar>
</header>
