# 🚀 Ultimate Developer CLI Toolbox

> A comprehensive collection of **75+ essential CLI tools** that every developer needs. From blazing-fast package managers to productivity boosters, security tools, and workflow automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Star this repo](https://img.shields.io/github/stars/kenzycodex/dev-cli-arsenal?style=social)](https://github.com/kenzycodex/dev-cli-arsenal)

---

## 🎯 Quick Start

```bash
# Install the essentials in one go
npm install -g @antfu/ni rimraf serve nodemon trash-cli fkill-cli

# Or use our installation script
curl -fsSL https://raw.githubusercontent.com/kenzycodex/dev-cli-arsenal/main/install.sh | bash
```

---

## 📦 Package Managers & Installation Tools

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **ni** | `ni` | ⚡ Ultra-fast npm/yarn/pnpm detector | `npm install -g @antfu/ni` |
| **bun** | `bun install` | 🔥 10x faster than npm (Rust-based) | `curl -fsSL https://bun.sh/install \| bash` |
| **pnpm** | `pnpm install` | Efficient disk space, fast installs | `npm install -g pnpm` |
| **yarn** | `yarn install` | Modern package manager | `corepack enable && corepack prepare yarn@stable` |
| **volta** | `volta install node` | Fast Node version management | `curl https://get.volta.sh \| bash` |
| **n** | `n latest` | Simple Node version manager | `npm install -g n` |
| **nvm** | `nvm use 18` | Node version switcher | [Install Guide](https://github.com/nvm-sh/nvm) |
| **npkill** | `npkill` | Clean node_modules everywhere | `npm install -g npkill` |
| **nrm** | `nrm use taobao` | Switch npm registries | `npm install -g nrm` |

---

## 🗂️ File & Directory Operations

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **rimraf** | `rimraf dist` | Cross-platform rm -rf | `npm install -g rimraf` |
| **trash-cli** | `trash file.txt` | Safe delete (to trash) | `npm install -g trash-cli` |
| **zip-cli** | `zip -r archive.zip folder/` | Easy ZIP creation | `npm install -g zip-cli` |
| **fdir** | `fdir --name "*.js"` | Blazing fast file finder | `npm install -g fdir` |
| **globby** | `globby "**/*.{js,ts}"` | Advanced file globbing | `npm install -g globby-cli` |
| **tree** | `tree -a` | Visual directory structure | `brew install tree` |
| **fd** | `fd "\.js$"` | Fast alternative to find | `brew install fd` |
| **rg** | `rg "TODO"` | Ultra-fast grep (ripgrep) | `brew install ripgrep` |

---

## 🌐 Development Servers & Networking

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **serve** | `serve .` | Static file server | `npm install -g serve` |
| **live-server** | `live-server` | Auto-reload dev server | `npm install -g live-server` |
| **http-server** | `http-server -p 8080` | Simple HTTP server | `npm install -g http-server` |
| **vite** | `vite` | Lightning-fast dev server | `npm create vite@latest` |
| **json-server** | `json-server db.json` | Mock REST API | `npm install -g json-server` |
| **ngrok** | `ngrok http 3000` | Secure tunneling | [Download](https://ngrok.com) |
| **localtunnel** | `lt --port 3000` | Expose localhost publicly | `npm install -g localtunnel` |
| **wscat** | `wscat -c ws://localhost:8080` | WebSocket testing | `npm install -g wscat` |

---

## 🔄 Process Management & Monitoring

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **nodemon** | `nodemon app.js` | Auto-restart Node apps | `npm install -g nodemon` |
| **pm2** | `pm2 start app.js` | Production process manager | `npm install -g pm2` |
| **concurrently** | `concurrently "cmd1" "cmd2"` | Run multiple commands | `npm install -g concurrently` |
| **fkill** | `fkill :3000` | Interactive process killer | `npm install -g fkill-cli` |
| **kill-port** | `kill-port 3000` | Kill process on port | `npm install -g kill-port` |
| **gtop** | `gtop` | Graphical system monitor | `npm install -g gtop` |
| **htop** | `htop` | Interactive process viewer | `brew install htop` |

---

## 🎨 Code Quality & Formatting

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **prettier** | `prettier --write .` | Code formatter | `npm install -g prettier` |
| **eslint** | `eslint src/` | JavaScript linter | `npm install -g eslint` |
| **eslint_d** | `eslint_d .` | ESLint daemon (faster) | `npm install -g eslint_d` |
| **stylelint** | `stylelint "**/*.css"` | CSS linter | `npm install -g stylelint` |
| **tsc** | `tsc --noEmit` | TypeScript type checking | `npm install -g typescript` |
| **oxlint** | `oxlint .` | Ultra-fast Rust linter | `npm install -g oxlint` |

---

## 🚀 Build Tools & Bundlers

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **esbuild** | `esbuild app.js --bundle` | Extremely fast bundler | `npm install -g esbuild` |
| **swc** | `swc src -d dist` | Rust-based compiler | `npm install -g @swc/cli` |
| **turbo** | `turbo build` | High-performance build system | `npm install -g turbo` |
| **rollup** | `rollup -c` | Module bundler | `npm install -g rollup` |
| **webpack** | `webpack --mode production` | Popular bundler | `npm install -g webpack-cli` |

---

## 🧪 Testing & Debugging

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **vitest** | `vitest` | Blazing fast unit tests | `npm install -g vitest` |
| **jest** | `jest` | JavaScript testing framework | `npm install -g jest` |
| **playwright** | `playwright test` | End-to-end testing | `npm install -g @playwright/test` |
| **lighthouse** | `lighthouse https://example.com` | Performance auditing | `npm install -g lighthouse` |
| **madge** | `madge --circular src/` | Dependency analysis | `npm install -g madge` |

---

## 🔐 Security & Analysis

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **audit-ci** | `audit-ci` | Security audit in CI | `npm install -g audit-ci` |
| **snyk** | `snyk test` | Vulnerability scanning | `npm install -g snyk` |
| **licensee** | `licensee` | License compliance | `npm install -g licensee` |
| **is-website-vulnerable** | `is-website-vulnerable https://example.com` | Web security check | `npm install -g is-website-vulnerable` |

---

## 🌟 Productivity & Utilities

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **tldr** | `tldr curl` | Simplified man pages | `npm install -g tldr` |
| **fzf** | `fzf` | Fuzzy finder | `brew install fzf` |
| **bat** | `bat file.js` | Better cat with syntax highlighting | `brew install bat` |
| **delta** | `git diff` (with delta) | Better git diffs | `brew install git-delta` |
| **jq** | `jq '.name' package.json` | JSON processor | `brew install jq` |
| **yq** | `yq '.version' config.yml` | YAML processor | `brew install yq` |

---

## 🎭 Fun & Customization

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **neofetch** | `neofetch` | System info display | `brew install neofetch` |
| **figlet** | `figlet "Hello World"` | ASCII art banners | `brew install figlet` |
| **cowsay** | `cowsay "Hello!"` | Talking cow | `brew install cowsay` |
| **lolcat** | `echo "rainbow" \| lolcat` | Rainbow text | `brew install lolcat` |

---

## 🔗 Git & Repository Tools

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **git-open** | `git open` | Open repo in browser | `npm install -g git-open` |
| **degit** | `degit user/repo my-app` | Download repo without history | `npm install -g degit` |
| **gh** | `gh repo clone user/repo` | GitHub CLI | `brew install gh` |
| **gitmoji-cli** | `gitmoji -c` | Emoji commits | `npm install -g gitmoji-cli` |
| **conventional-commits** | `git cz` | Standardized commits | `npm install -g commitizen` |

---

## 📱 Mobile & Cross-Platform

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **expo-cli** | `expo start` | React Native development | `npm install -g @expo/cli` |
| **react-native-cli** | `react-native run-ios` | React Native tooling | `npm install -g react-native-cli` |
| **ionic** | `ionic serve` | Hybrid app development | `npm install -g @ionic/cli` |

---

## 🌍 Network & Performance

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **speed-test** | `speed-test` | Internet speed test | `npm install -g speed-test` |
| **fast-cli** | `fast` | Netflix speed test | `npm install -g fast-cli` |
| **httpie** | `http GET api.github.com` | HTTP client | `brew install httpie` |
| **curl** | `curl -X POST api.com` | Data transfer tool | Built-in |

---

## 📊 Data & Analytics

| Tool | Command | Description | Install |
|------|---------|-------------|---------|
| **carbon-now-cli** | `carbon-now src/app.js` | Code screenshots | `npm install -g carbon-now-cli` |
| **qrcode-terminal** | `qrcode-terminal "https://example.com"` | QR codes in terminal | `npm install -g qrcode-terminal` |
| **terminalizer** | `terminalizer record demo` | Terminal recording | `npm install -g terminalizer` |

---

## 🚀 Installation Scripts

### One-Line Essentials Install
```bash
# Core developer tools
npm install -g @antfu/ni rimraf serve nodemon pm2 trash-cli fkill-cli prettier eslint

# Advanced tools
npm install -g esbuild vitest turbo lighthouse carbon-now-cli tldr
```

### Platform-Specific Installers
```bash
# macOS (using Homebrew)
brew install fd ripgrep bat delta fzf tree htop jq yq neofetch figlet

# Ubuntu/Debian
sudo apt install fd-find ripgrep bat git-delta fzf tree htop jq

# Windows (using Scoop)
scoop install fd ripgrep bat delta fzf tree jq
```

---

## 🎯 Workflow Examples

### Frontend Development Setup
```bash
# Project initialization
ni create vite@latest my-app
cd my-app
ni

# Development workflow
concurrently "vite" "npx tailwindcss -w"
```

### Node.js API Development
```bash
# Process management
pm2 start app.js --name "api"
pm2 logs api
pm2 restart api
```

### Code Quality Pipeline
```bash
# Formatting and linting
prettier --write .
eslint_d . --fix
vitest run
lighthouse https://myapp.com
```

---

## 📚 Additional Resources

- **[Awesome CLI Apps](https://github.com/agarrharr/awesome-cli-apps)** - More CLI tools
- **[Modern Unix](https://github.com/ibraheemdev/modern-unix)** - Modern alternatives to classic tools
- **[CLI Guidelines](https://clig.dev/)** - Best practices for CLI design
- **[Terminal Trove](https://terminaltrove.com/)** - Discover terminal applications

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Add a Tool
1. Fork this repository
2. Add your tool to the appropriate category
3. Include: name, command, description, and install instructions
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## ⭐ Show Your Support

If this toolbox helped you, please ⭐ star this repository and share it with fellow developers!

---

**Happy Coding! 🚀**

> Built with ❤️ by developers, for developers.