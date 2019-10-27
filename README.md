[![Staart Site](https://raw.githubusercontent.com/staart/staart.js.org/master/assets/svg/site.svg?sanitize=true)](https://staart.js.org/site)

Staart Site is a static site generator for helpdesk or documentation websites written in TypeScript. It creates beautiful, accessible, and ultra-lightweight websites that score 100/100 on Lightbox.

|  | Status |
| - | - |
| Build | [![GitHub Actions](https://github.com/staart/site/workflows/Node%20CI/badge.svg)](https://github.com/staart/site/actions) [![Travis CI](https://img.shields.io/travis/staart/site?label=Travis%20CI)](https://travis-ci.org/staart/site) [![Circle CI](https://img.shields.io/circleci/build/github/staart/site?label=Circle%20CI)](https://circleci.com/gh/staart/site) [![Azure Pipelines](https://dev.azure.com/anandchowdhary0001/Staart%20Site/_apis/build/status/staart.site?branchName=master)](https://dev.azure.com/anandchowdhary0001/Staart%20Site/_build/latest?definitionId=10&branchName=master) |
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
- [Updating Staart Site](https://staart.js.org/site/update.html)

## 🛠️ Configuration

You can create a `.staartrc` file or another [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig)-compatible configuration file, like `staart.config.js` or the `staart` key in `package.json`. You can also supply these options as an object parameter to the `generate` function.

| Option | Description | Default |
| ------ | ----------- | ------- |
| `title` | Name of the site | `Staart Site` |
| `repo` | URL to git repository | `repository` key in `package.json` |
| `contentDir` | Folder with markdown content | `./content` |
| `distDir` | Output directory | `./public` |
| `assetsDir` | Static assets directory | `./assets` |
| `templatePath` | HTML template file path | `./index.html` |
| `stylePath` | Scss stylesheet path | `style.scss` |
| `homePath` | Markdown file path for homepage | `README.md` |
| `hostname` | Base URL for sitemap | `http://localhost:8080` |
| `themeColor` | Main theme color | `#0e632c` |
| `textColor` | Dark text color | `#001b01` |
| `linkColor` | Hyperlink color | `#0e632c` |
| `lightColor` | Light text color | `#ffffff` |
| `navbar` | Array of filenames for navbar | Root files/folders in `contentDir` |
| `footerNavbar` | Array of filenames for footer | `[]` |
| `contentFileExt` | File extension for content files | `md` |
| `keepHomeHeading` | Show `h1` heading on homepage | `false` |
| `ignoreReplaceTitle` | Don't update `<title>` from `title` | `false` |
| `ignoreReplaceDescription` | Don't update meta description | `false` |
| `ignoreReplaceAuthor` | Don't update footer author | `false` |
| `ignoreReplaceYear` | Don't update copyright year | `false` |
| `noHome` | Don't generate `index.html` | `false` |
| `noSitemap` | Don't generate sitemaps | `false` |
| `noContentList` | Don't add content lists | `false` |
| `noDelayWithoutToken` | Don't delay GitHub API requests | `false` |
| `noLastModified` | Don't add last modified commit info | `false` |
| `noGenerator` | Don't add meta generator tag | `false` |
| `noSyntaxHighlighting` | Disable code syntax highlighting | `false` |
| `noShieldSchema` | Don't generate Shields schema | `false` |
| `shieldSchemaLabel` | Label text for Shields schema | `docs` |
| `shieldSchemaColor` | Badge color in Shields schema | `blueviolet` |

Staart Site also uses the `repository` and `author` fields for copyright/last modified information, but you can overwrite them using the configuration above.

## 🏗️ Built with Staart Site

- **[Add your Staart Site](https://github.com/staart/site/edit/master/README.md)**


## [🏁 Staart Ecosystem](https://staart.js.org)

The Staart ecosystem consists of open-source projects to build your SaaS startup, written in TypeScript.

| Package |  |  |
| - | - | - |
| [🛠️ Staart API](https://github.com/o15y/staart) | Node.js backend with RESTful APIs | [![Travis CI](https://img.shields.io/travis/o15y/staart)](https://travis-ci.org/o15y/staart) [![GitHub](https://img.shields.io/github/license/o15y/staart.svg)](https://github.com/o15y/staart/blob/master/LICENSE) [![npm package version](https://img.shields.io/npm/v/@staart/manager)](https://www.npmjs.com/package/@staart/manager) |
| [🌐 Staart UI](https://github.com/o15y/staart-ui) | Frontend Vue.js Progressive Web App | [![Travis CI](https://img.shields.io/travis/o15y/staart-ui)](https://travis-ci.org/o15y/staart-ui) [![GitHub](https://img.shields.io/github/license/o15y/staart-ui.svg)](https://github.com/o15y/staart-ui/blob/master/LICENSE) [![npm package version](https://img.shields.io/npm/v/@staart/ui)](https://www.npmjs.com/package/@staart/ui) |
| [📑 Staart Site](https://github.com/staart/site) | Static site generator for docs/helpdesk | [![Travis CI](https://img.shields.io/travis/staart/site)](https://travis-ci.org/staart/site) [![GitHub](https://img.shields.io/github/license/staart/site.svg)](https://github.com/staart/site/blob/master/LICENSE) [![npm package version](https://img.shields.io/npm/v/@staart/site)](https://www.npmjs.com/package/@staart/site) |
| [📱 Staart Native](https://github.com/o15y/staart-native) | React Native app for Android and iOS | [![Travis CI](https://img.shields.io/travis/o15y/staart-native)](https://travis-ci.org/o15y/staart-native) [![GitHub](https://img.shields.io/github/license/o15y/staart-native.svg)](https://github.com/o15y/staart-native/blob/master/LICENSE) [![npm package version](https://img.shields.io/npm/v/@staart/native)](https://www.npmjs.com/package/@staart/native) |
| [🎨 Staart.css](https://github.com/o15y/staart.css) | Sass/CSS framework and utilities | [![Travis CI](https://img.shields.io/travis/o15y/staart.css)](https://travis-ci.org/o15y/staart.css) [![GitHub](https://img.shields.io/github/license/o15y/staart.css.svg)](https://github.com/o15y/staart.css/blob/master/LICENSE) [![npm package version](https://img.shields.io/npm/v/@staart/css)](https://www.npmjs.com/package/@staart/css) |

## 📄 License

- Code: [MIT](https://github.com/staart/site/blob/master/LICENSE)
- Logo and assets: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
