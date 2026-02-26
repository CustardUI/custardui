<head-bottom>
  <link rel="stylesheet" href="{{baseUrl}}/stylesheets/main.css">
  <link rel="stylesheet" href="{{baseUrl}}/stylesheets/custard.css">
</head-bottom>

<div tags="beta-release" class="w-100 p-1 bg-warning text-center d-print-none"><md>**This site documents the features of CustomViews in development and possible beta breaking changes.
For the latest stable release, visit [here](https://custardui.github.io).**</md></div>

<header sticky>
  <navbar type="dark">
    <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand"><img src="{{baseUrl}}/images/custardUI-words.png" height="40"></a>
    <li><a highlight-on="exact" href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/readerGuide/index.html" class="nav-link">READER GUIDE</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/authorGuide/index.html" class="nav-link">AUTHOR GUIDE</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li>
    <li><a highlight-on="exact" href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
    <li>
      <a href="https://github.com/custardui/custard" target="_blank" class="nav-link"><md>:fab-github:</md></a>
    </li>
    <li>
      <a href="#cv-open" class="nav-link">OPEN DIALOG</a>
    </li>
    <li slot="right">
      <form class="navbar-form">
        <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
      </form>
    </li>
  </navbar>
</header>
