---
layout: page
title: "HTML Docs"
description: "Standalone HTML documents published directly from the repository."
---
{% assign html_static_docs = site.static_files | where_exp: "item", "item.path contains '/html/'" | where_exp: "item", "item.extname == '.html'" | where_exp: "item", "item.name != 'index.html'" | sort: "path" %}
{% assign html_page_docs = site.pages | where_exp: "item", "item.url contains '/html/'" | where_exp: "item", "item.url != '/html/'" | where_exp: "item", "item.name != 'index.html'" | sort: "url" %}

<div class="doc-callout">
  <div>
    <h2>Raw HTML and Markdown can live side by side.</h2>
    <p>Future HTML documents can be dropped directly into <code>/html/</code>. Plain HTML files are published as-is; HTML files with front matter can also reuse Jekyll layouts, metadata, and navigation.</p>
  </div>
</div>

{% assign html_doc_total = html_static_docs.size | plus: html_page_docs.size %}
{% if html_doc_total == 0 %}
<div class="doc-empty-state">
  <p>No standalone HTML documents have been added yet.</p>
  <p>Place files like <code>/html/my-doc.html</code> or <code>/html/reference/networking/index.html</code> in the repo and they will publish automatically.</p>
</div>
{% else %}
<section class="doc-grid">
  {% for doc in html_page_docs %}
  <article class="doc-card">
    <div class="doc-card-kicker">Processed HTML</div>
    <h2><a href="{{ doc.url | prepend: site.baseurl }}">{{ doc.title | default: doc.name }}</a></h2>
    <p>{{ doc.description | default: "HTML page rendered through Jekyll." }}</p>
    <div class="doc-card-meta">
      <span>{{ doc.url }}</span>
    </div>
  </article>
  {% endfor %}

  {% for doc in html_static_docs %}
  <article class="doc-card">
    <div class="doc-card-kicker">Raw HTML</div>
    <h2><a href="{{ doc.path | prepend: site.baseurl }}">{{ doc.basename | replace: '-', ' ' | replace: '_', ' ' }}</a></h2>
    <p>Published directly from <code>{{ doc.path }}</code>.</p>
    <div class="doc-card-meta">
      <span>{{ doc.path }}</span>
      <span>{{ doc.modified_time | date: "%Y-%m-%d" }}</span>
    </div>
  </article>
  {% endfor %}
</section>
{% endif %}
