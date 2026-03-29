{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">Author Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Getting Started]({{baseUrl}}/authorGuide/gettingStarted.html)
* Site Integrations
  * [MarkBind]({{baseUrl}}/authorGuide/integrations/setupWithMarkbind.html)
* [Configuration]({{baseUrl}}/authorGuide/configuration.html)
* [URL Sharing]({{baseUrl}}/authorGuide/urlSharing.html)
* Site Adaptations
  * [Adaptations]({{baseUrl}}/authorGuide/adaptations/adaptations.html)
  * [Configuration]({{baseUrl}}/authorGuide/adaptations/configuration.html)
  * [Sample Adaptation Page]({{baseUrl}}/authorGuide/adaptations/samplePage.html)
* [Components]({{baseUrl}}/authorGuide/components/all.html) :expanded:
  * [Toggles]({{baseUrl}}/authorGuide/components/toggles.html)
  * [TabGroups and Tabs]({{baseUrl}}/authorGuide/components/tabs.html)
  * [Placeholders]({{baseUrl}}/authorGuide/components/placeholders.html)
  * [Settings Dialog]({{baseUrl}}/authorGuide/components/settings.html)
  * [Focused Views]({{baseUrl}}/authorGuide/components/share.html)
  * [Labels]({{baseUrl}}/authorGuide/components/labels.html)
      </site-nav>
    </div>
  </nav>
  <div id="content-wrapper">
    <breadcrumb />
    {{ content }}
  </div>
  <nav id="page-nav">
    <div class="nav-component slim-scroll">
      <page-nav />
    </div>
  </nav>
  <scroll-top-button></scroll-top-button>
</div>

<include src="footers/footer.md" />
