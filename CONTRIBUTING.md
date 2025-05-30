# Contributing to dev-cli-arsenal

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/github/contributors/kenzycodex/dev-cli-arsenal.svg?style=flat-square)](https://github.com/kenzycodex/dev-cli-arsenal/graphs/contributors)

Thank you for your interest in contributing to **dev-cli-arsenal**! This project thrives because of contributors like you. Whether you're fixing bugs, adding new tools, improving documentation, or sharing feedback, every contribution matters.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Types of Contributions](#types-of-contributions)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Review Process](#review-process)
- [Recognition](#recognition)

## 🤝 Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🛠️ How to Contribute

### Quick Start for New Contributors

1. **Star the repository** ⭐ to show your support
2. **Fork the repository** to your GitHub account
3. **Clone your fork** locally
4. **Create a feature branch** for your changes
5. **Make your changes** following our guidelines
6. **Test your changes** thoroughly
7. **Submit a pull request** with a clear description

### Detailed Setup Process

```bash
# Fork the repository on GitHub, then:

# Clone your fork
git clone https://github.com/YOUR_USERNAME/dev-cli-arsenal.git
cd dev-cli-arsenal

# Add upstream remote
git remote add upstream https://github.com/kenzycodex/dev-cli-arsenal.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Install dependencies (if any)
npm install

# Make your changes...

# Test your changes
npm test

# Commit your changes
git add .
git commit -m "feat: add awesome new CLI tool"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

## 🎯 Types of Contributions

### 🆕 Adding a New Tool

**Before adding a tool, please ensure it:**
- Is actively maintained (updated within the last 12 months)
- Provides genuine value to developers
- Has a stable installation method
- Doesn't duplicate existing functionality without clear benefits
- Is production-ready and well-documented

**Tool Entry Format:**
```markdown
| **tool-name** | `command example` | Brief description (max 60 chars) | `installation command` |
```

**Required Information:**
- **Name**: Clear, recognizable tool name
- **Command**: Most common usage example
- **Description**: Concise explanation of what it does
- **Installation**: Working installation command
- **Category**: Appropriate section placement

### 📊 Benchmarking Contributions

We welcome performance comparisons and benchmarks:
- Tool speed comparisons
- Memory usage analysis
- Installation time measurements
- File size comparisons

### 📚 Documentation Improvements

- Fix typos and grammatical errors
- Improve existing descriptions
- Add usage examples
- Create workflow guides
- Update installation instructions
- Add troubleshooting sections

### 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Screenshots**: If applicable

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### 💡 Feature Requests

For new features or enhancements:
- Check existing issues to avoid duplicates
- Clearly describe the feature and its benefits
- Provide use cases and examples
- Consider implementation complexity

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## 🔧 Development Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git** (latest version)

### Local Development

```bash
# Install development dependencies
npm install

# Run verification tests
npm run verify

# Run linting
npm run lint

# Format code
npm run format

# Generate documentation
npm run docs

# Run all checks
npm run check-all
```

### Testing Your Additions

Before submitting:

```bash
# Test tool installation
./scripts/verify-tools.js

# Validate README format
npm run validate-readme

# Check for broken links
npm run check-links

# Run security audit
npm audit

# Verify cross-platform compatibility
npm run test-platforms
```

## 📝 Style Guidelines

### Tool Descriptions

- **Length**: Maximum 60 characters
- **Style**: Descriptive, not promotional
- **Focus**: What the tool does, not why it's amazing
- **Consistency**: Follow existing patterns

**Good examples:**
- ✅ "Ultra-fast package manager detector"
- ✅ "Cross-platform rm -rf alternative"
- ✅ "Auto-restart Node.js applications"

**Avoid:**
- ❌ "The best and fastest tool ever!"
- ❌ "Revolutionary game-changing utility"
- ❌ "Must-have tool for all developers"

### Installation Commands

- **Accuracy**: Test on multiple platforms
- **Completeness**: Include all necessary steps
- **Clarity**: Use the most common installation method
- **Updates**: Keep installation commands current

### Categories

Place tools in the most appropriate category:

- **Package Managers & Installation Tools**
- **File & Directory Operations**
- **Development Servers & Networking**
- **Process Management & Monitoring**
- **Code Quality & Formatting**
- **Build Tools & Bundlers**
- **Testing & Debugging**
- **Security & Analysis**
- **Productivity & Utilities**
- **Fun & Customization**
- **Git & Repository Tools**
- **Mobile & Cross-Platform**
- **Network & Performance**
- **Data & Analytics**

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature or tool addition
- `fix`: Bug fix or correction
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat: add esbuild to build tools category
fix: correct installation command for ripgrep on Ubuntu
docs: improve setup instructions for Windows users
chore: update tool verification script
```

## 🔍 Review Process

### Pull Request Guidelines

1. **Clear Title**: Descriptive title explaining the change
2. **Detailed Description**: Explain what and why you changed
3. **Testing**: Include evidence of testing
4. **Documentation**: Update relevant documentation
5. **Single Purpose**: One feature/fix per PR

### Review Criteria

Our maintainers review PRs based on:

- **Accuracy**: Installation commands work correctly
- **Quality**: Tool provides genuine value
- **Maintenance**: Tool is actively maintained
- **Documentation**: Clear and helpful descriptions
- **Consistency**: Follows project standards
- **Testing**: Changes are properly tested

### Response Time

- **Initial Response**: Within 48 hours
- **Review Completion**: Within 1 week
- **Feedback Address**: Within 2 weeks

## 🎖️ Recognition

### Contributors

All contributors are recognized in:
- GitHub contributors graph
- Release notes for significant contributions
- Annual contributor highlights
- Special mentions for exceptional contributions

### Types of Recognition

- **Tool Contributors**: Added valuable new tools
- **Documentation Heroes**: Improved guides and docs
- **Bug Hunters**: Found and fixed important issues
- **Performance Experts**: Provided benchmarks and optimizations
- **Community Builders**: Helped other contributors

## 📊 Contribution Statistics

We track and celebrate:
- Number of tools added
- Documentation improvements
- Bug fixes and enhancements
- Community engagement

## 🎯 Contribution Ideas

### Beginner-Friendly

- Fix typos in documentation
- Update outdated installation commands
- Add missing tool descriptions
- Improve existing tool descriptions

### Intermediate

- Add new tools to existing categories
- Create installation verification scripts
- Write platform-specific guides
- Benchmark tool performance

### Advanced

- Create new tool categories
- Build automated testing systems
- Develop interactive installers
- Design tool comparison matrices

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Specific implementation discussions

### Maintainer Contact

For urgent matters or private concerns, contact the maintainers through GitHub.

## 📜 Additional Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Open Source Guide](https://opensource.guide/)
- [First Contributions Guide](https://github.com/firstcontributions/first-contributions)

## 🙏 Thank You

Your contributions make dev-cli-arsenal better for developers worldwide. Whether you're adding a single tool or making major improvements, we appreciate your time and effort.

**Happy Contributing! 🚀**

---

*This contributing guide is inspired by open-source best practices and is continuously improved based on community feedback.*