[![Staart Site](https://raw.githubusercontent.com/staart/staart.js.org/master/assets/svg/site.svg?sanitize=true)](https://staart.js.org/site)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fstaart%2Fsite.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fstaart%2Fsite?ref=badge_shield)

Staart Site is a static site generator for helpdesk or documentation websites written in TypeScript. It creates beautiful, accessible, and ultra-lightweight websites that score 100/100 on Lightbox.

|  | Status |
| - | - |
| Build | [![GitHub Actions](https://github.com/staart/site/workflows/Node%20CI/badge.svg)](https://github.com/staart/site/actions) [![Travis CI](https://img.shields.io/travis/staart/site?label=Travis%20CI)](https://travis-ci.org/staart/site) [![Circle CI](https://img.shields.io/circleci/build/github/staart/site?label=Circle%20CI)](https://circleci.com/gh/staart/site) [![Azure Pipelines](https://dev.azure.com/staart/site/_apis/build/status/staart.site?branchName=master)](https://dev.azure.com/staart/site/_build/latest?branchName=master) |
| Dependencies | [![Dependencies](https://img.shields.io/david/staart/site.svg)](https://david-dm.org/staart/site) [![Dev dependencies](https://img.shields.io/david/dev/staart/site.svg)](https://david-dm.org/staart/site) ![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/staart/site.svg) |
| Community | [![Contributors](https://img.shields.io/github/contributors/staart/site.svg)](https://github.com/staart/site/graphs/contributors) [![GitHub](https://img.shields.io/github/license/staart/site.svg)](https://github.com/staart/site/blob/master/LICENSE) ![Type definitions](https://img.shields.io/badge/types-TypeScript-blue.svg) [![npm package version](https://img.shields.io/npm/v/@staart/site)](https://www.npmjs.com/package/@staart/site) |

## 🌟 Features

- Zero-config, no setup required
- Scores 100/100 on [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- Sitemap & schema data for SEO
- 1.2kb minzipped CSS, dark & light theme

## 💻 Getting started

The easiest way is to use `npx` to generate a static site in your current working directory:

```bash
npx @staart/site
```

You should see something like the following output in your terminal:

```
✔  success   Start Site built in 0.39s
```

Alternately, you can add the package as a `devDependency`:

```bash
npm install @staart/site --save-dev
```

Then, run the `site` command to generate your static site:

```bash
npm run site
```

Or programmatically use the `generate` function:

```ts
import { generate } from "@staart/site";

generate({ /* options */ })
  .then(() => console.log("Completed"))
  .catch(error => console.error(error));
```

## [📝 Documentation](https://staart.js.org/site)

- [Getting started](https://staart.js.org/site/getting-started.html)
- [Configuration](https://staart.js.org/site/configuration.html)
- [Creating themes](https://staart.js.org/site/creating-themes.html)
- [Redirects](https://staart.js.org/site/redirects.html)
- [Shields.io schema](https://staart.js.org/site/shields-schema.html)
- [Static files](https://staart.js.org/site/static-files.html)
- [Updating Staart Site](https://staart.js.org/site/update.html)

## 🏗️ Built with Staart Site

- [Accessibility Guidelines](https://accessibilityguidelines.com)
- [O15Y](https://o15y.com)
- [Staart.js.org](https://staart.js.org)
- [Uppload](https://uppload.js.org)
- **[Add your Staart Site](https://github.com/staart/site/edit/master/README.md)**


## [🏁 Staart Ecosystem](https://staart.js.org)

The Staart ecosystem consists of open-source projects to build your SaaS startup, written in TypeScript.

| Package |  |  |
| - | - | - |
| [🛠️ Staart API](https://github.com/staart/api) | Node.js backend with RESTful APIs | [![Build status](https://img.shields.io/circleci/build/github/staart/api)](https://circleci.com/gh/staart/api) [![Docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fstaart.js.org%2Fshield-schema%2Fapi.json)](https://staart.js.org/api) [![npm package version](https://img.shields.io/npm/v/@staart/manager)](https://www.npmjs.com/package/@staart/manager) |
| [🌐 Staart UI](https://github.com/staart/ui) | Frontend Vue.js Progressive Web App | [![Build status](https://img.shields.io/circleci/build/github/staart/ui)](https://circleci.com/gh/staart/ui) [![Docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fstaart.js.org%2Fshield-schema%2Fui.json)](https://staart.js.org/ui) [![npm package version](https://img.shields.io/npm/v/@staart/ui)](https://www.npmjs.com/package/@staart/ui) |
| [📑 Staart Site](https://github.com/staart/site) | Static site generator for docs/helpdesk | [![Build status](https://img.shields.io/circleci/build/github/staart/site)](https://circleci.com/gh/staart/site) [![Docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fstaart.js.org%2Fshield-schema%2Fsite.json)](https://staart.js.org/site) [![npm package version](https://img.shields.io/npm/v/@staart/site)](https://www.npmjs.com/package/@staart/site) |
| [📱 Staart Native](https://github.com/staart/native) | React Native app for Android and iOS | [![Build status](https://img.shields.io/circleci/build/github/staart/native)](https://circleci.com/gh/staart/native) [![Docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fstaart.js.org%2Fshield-schema%2Fnative.json)](https://staart.js.org/native) [![npm package version](https://img.shields.io/npm/v/@staart/native)](https://www.npmjs.com/package/@staart/native) |
| [🎨 Staart.css](https://github.com/staart/css) | Sass/CSS framework and utilities | [![Build status](https://img.shields.io/circleci/build/github/staart/css)](https://circleci.com/gh/staart/css) [![Docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fstaart.js.org%2Fshield-schema%2Fcss.json)](https://staart.js.org/css) [![npm package version](https://img.shields.io/npm/v/@staart/css)](https://www.npmjs.com/package/@staart/css) |
| [📦 Staart Packages](https://github.com/staart/packages) | Helper functions and utility packages | [![Build status](https://img.shields.io/circleci/build/github/staart/packages)](https://circleci.com/gh/staart/packages) [![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fservices.anandchowdhary.now.sh%2Fapi%2Fgithub-files%3Frepo%3Dstaart%2Fpackages%26path%3Dpackages%26label%3Dstaart%26message%3D%25241%2524%2520package%2524S%2524%26color%3Dblueviolet)](https://www.npmjs.com/org/staart) |

## 💝 Sponsors

The development of Staart projects is supported by these wonderful companies. [Find us on OpenCollective](https://opencollective.com/staart)

<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/OswaldLabsOpenSource"><img src="https://avatars3.githubusercontent.com/u/21421587?v=4" width="100px" alt=""/><br><sub><b>Oswald Labs</b></sub></a></td>
    <td align="center"><a href="https://github.com/O15Y"><img src="https://avatars3.githubusercontent.com/u/48348500?v=4" width="100px" alt=""/><br><sub><b>O15Y</b></sub></a></td>
    <td align="center"><a href="https://github.com/speakupnl"><img src="https://avatars3.githubusercontent.com/u/33686381?v=4" width="100px" alt=""/><br><sub><b>Speakup</b></sub></a></td>
  </tr>
</table>

## 📄 License

- Code: [MIT](https://github.com/staart/site/blob/master/LICENSE)
- Logo and assets: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fstaart%2Fsite.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fstaart%2Fsite?ref=badge_large)