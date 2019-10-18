# 📑 Staart Site

Staart Site is a docs/helpdesk website starter with static site generator written in TypeScript. It creates tiny, accessible, and beautiful webpages.

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

And then use the `generate` function:

```ts
import { generate } from "@staart/site";

generate({ /* options */ })
  .then(() => console.log("Completed"))
  .catch(error => console.error(error));
```

## 🛠️ Configuration

You can create a `.staartrc` file or another [Cosmiconfig](https://github.com/davidtheclark/cosmiconfig)-compatible configuration file, like `staart.config.js`.

| Option | Description | Default |
| ------ | ----------- | ------- |
| `title` | Name of the site | `Staart Site` |
| `repo` | URL to git repository | `repository` key in `package.json` |
| `contentDir` | Folder with markdown content | `./content` |
| `distDir` | Output directory | `./public` |
| `templatePath` | HTML template file path | `./index.html` |
| `stylePath` | Scss stylesheet path | `style.scss` |
| `homePath` | Markdown file path for homepage | `README.md` |
| `hostname` | Base URL for sitemap | `http://localhost:8080` |
| `themeColor` | Main theme color | `#0e632c` |
| `textColor` | Dark text color | `#001b01` |
| `linkColor` | Hyperlink color | `#0e632c` |
| `lightColor` | Light text color | `#ffffff` |
| `navbar` | Array of filenames for navbar | Root files/folders in `contentDir` |
| `contentFileExt` | File extension for content files | `md` |
| `keepHomeHeading` | Show `h1` heading on homepage | `false` |
| `ignoreReplaceTitle` | Don't update `<title>` from `title` | `false` |
| `ignoreReplaceDescription` | Don't update meta description | `false` |
| `ignoreReplaceAuthor` | Don't update footer author | `false` |
| `ignoreReplaceYear` | Don't update copyright year | `false` |
| `noHome` | Don't generate `index.html` | `false` |
| `noSitemap` | Don't generate sitemaps | `false` |
| `noContentList` | Don't add content lists | `false` |

Staart Site also uses the `repository` and `author` fields for copyright/last modified information, but you can overwrite them using the configuration above.

## 🏗️ Built with Staart Site

- **[Add your Staart Site](https://github.com/staart/site/edit/master/README.md)**

## 📄 License

- Code: [MIT](https://github.com/staart/site/blob/master/LICENSE)
- Logo and assets: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
