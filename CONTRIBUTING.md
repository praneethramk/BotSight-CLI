# Contributing to BotSight

Thank you for your interest in contributing to BotSight! This document provides guidelines and information to help you contribute effectively.

## 📋 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/botsight.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add some feature"`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Create a pull request

## 📁 Project Structure

```
botsight/
├── packages/
│   ├── botsight-core/      # Core scraping and extraction logic
│   ├── botsight-cli/       # Command-line interface
│   ├── botsight-npm/       # NPM package for website integration
│   └── botsight-snippet/   # Client-side snippet
├── server/                 # Backend server
├── tools/                  # Development tools
├── docs/                   # Documentation
└── examples/               # Example implementations
```

## 🛠️ Development Setup

1. Install dependencies: `pnpm install`
2. Build the project: `pnpm build`
3. Run tests: `pnpm test`

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Follow the existing code style
- Use descriptive variable and function names
- Add JSDoc comments for public APIs

### Security
- Never commit sensitive information (API keys, passwords, etc.)
- Use environment variables for configuration
- Validate all inputs
- Use parameterized queries for database operations

### Testing
- Write unit tests for new functionality
- Ensure existing tests pass before submitting PR
- Include integration tests for API endpoints

## 🧪 Testing

Run all tests:
```bash
pnpm test
```

Run tests for a specific package:
```bash
cd packages/botsight-core
pnpm test
```

## 📖 Documentation

- Update README.md if you change functionality
- Add JSDoc comments to new functions
- Update relevant documentation in the docs/ directory
- Include examples for new features

## 🐛 Reporting Issues

- Use the issue tracker to report bugs
- Describe the issue clearly
- Include steps to reproduce
- Mention your environment (Node.js version, OS, etc.)

## 🎉 Pull Request Process

1. Ensure your code follows the coding standards
2. Add tests for new functionality
3. Update documentation as needed
4. Verify all tests pass
5. Create a pull request with a clear description

## 🤝 Community

- Join our [Discord](link-to-discord) for discussions
- Follow us on [Twitter](link-to-twitter) for updates
- Check out our [Blog](link-to-blog) for tutorials and insights

Thank you for contributing to BotSight!