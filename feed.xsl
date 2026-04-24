<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="rss/channel/title"/> RSS Feed</title>
        <style>
          :root {
            color-scheme: light;
            --bg: #f5f1e8;
            --panel: rgba(255, 252, 246, 0.92);
            --ink: #1f2a24;
            --ink-soft: #55635a;
            --line: rgba(31, 42, 36, 0.12);
            --accent: #1c6b57;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px 16px 48px;
            background: linear-gradient(180deg, #f7f3eb 0%, #f2ecdf 100%);
            color: var(--ink);
            font: 16px/1.7 "IBM Plex Sans", "Avenir Next", sans-serif;
          }
          .shell {
            max-width: 980px;
            margin: 0 auto;
          }
          .panel {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 18px 40px rgba(41, 50, 45, 0.08);
          }
          h1, h2 {
            font-family: "Iowan Old Style", Georgia, serif;
            line-height: 1.15;
            margin: 0 0 12px;
          }
          p {
            margin: 0;
            color: var(--ink-soft);
          }
          a {
            color: var(--accent);
          }
          .feed-link {
            display: inline-block;
            margin-top: 18px;
            color: #fff;
            background: var(--accent);
            border-radius: 999px;
            padding: 10px 16px;
            text-decoration: none;
          }
          .list {
            margin-top: 20px;
            display: grid;
            gap: 14px;
          }
          .item {
            padding: 18px 20px;
            border-radius: 18px;
            border: 1px solid var(--line);
            background: rgba(255, 255, 255, 0.76);
          }
          .meta {
            color: var(--ink-soft);
            font-size: 0.92rem;
            margin-top: 8px;
          }
          .item p {
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="panel">
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p><xsl:value-of select="rss/channel/description"/></p>
            <a class="feed-link">
              <xsl:attribute name="href"><xsl:value-of select="rss/channel/atom:link/@href"/></xsl:attribute>
              Copy feed URL
            </a>
            <div class="list">
              <xsl:for-each select="rss/channel/item">
                <article class="item">
                  <h2>
                    <a>
                      <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                      <xsl:value-of select="title"/>
                    </a>
                  </h2>
                  <div class="meta">
                    <xsl:value-of select="pubDate"/>
                  </div>
                  <p><xsl:value-of select="description"/></p>
                </article>
              </xsl:for-each>
            </div>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
