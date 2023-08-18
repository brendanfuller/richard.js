---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "richard.js"
  text: "The richest component framework."
  tagline: A blob of JavaScript that bloats your website.
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - icon: ⚛️
    title: Size Matters
    details: Double the size of Preact minified, at 7kb!
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 256 220.8"><path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z"/><path fill="#41B883" d="m0 0 128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z"/><path fill="#35495E" d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z"/></svg>
    title: Next Generation
    details: Inspired by VueJS 4 Spatial API
  - icon: 🚫
    title: No compiler/tooling required
    details: Like how real developers do it. 
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(5deg, rgba(15,116,141,1) 36%, #f6e2b6 100%);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(40px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(72px);
  }
}
</style>