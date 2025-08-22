# ⚡ quickstart-react (React Package Solution)

🚀 **quickstart-react** is an open-source CLI tool that lets you instantly create a Vite + React app with your choice of CSS framework, optional packages, and pre-configured project structure — all in one command.

## ✨ Features
- **Interactive Setup** — prompts you for project name, CSS framework, and optional packages
- **CSS Framework Support** — Tailwind CSS, Bootstrap, or MUI (Material UI)
- **Testing Framework Integration** — Vitest, Jest, or Cypress support with pre-configured setups
- **Development Tools** — ESLint + Prettier, Husky git hooks, Commitizen for conventional commits
- **Optional Packages** — easily add Axios, React Icons, React Hook Form, Yup, Formik, Moment.js, Zustand, TanStack Query, Framer Motion, and React Helmet
- **Automatic Folder Structure** — creates `components`, `pages`, `hooks`, `store`, `utils`, `assets` folders
- **Boilerplate Ready** — replaces default Vite boilerplate with a clean welcome page
- **Axios Setup** — pre-configured Axios instance if selected
- **CSS Integration** — automatically configures your chosen CSS framework with Vite

## 📦 Installation
You don’t need to install it globally — run it instantly with `npx`:
```bash
npx quickstart-react
```

## 🛠 Usage
When you run `npx quickstart-react`, you will be prompted to:
1. **Enter Project Name** — e.g., `my-app`
2. **Choose CSS Framework** — Tailwind, Bootstrap, or MUI
3. **Select Testing Framework** — Vitest, Jest, Cypress, or None
4. **Choose Optional Packages** — choose from a list of commonly used React libraries
5. **Select Development Tools** — ESLint + Prettier, Husky, Commitizen

Example run:
```bash
npx quickstart-react
```

### Example Walkthrough
```
? Enter project name: my-portfolio
? Choose a CSS framework: Tailwind
? Choose a testing framework: Vitest + React Testing Library
? Select optional packages: Axios, React Icons, Zustand
? Select development tools: ESLint + Prettier, Husky
```

This will:
- Create a new Vite + React project in `my-portfolio/`
- Install Tailwind CSS and configure it with Vite
- Set up Vitest with React Testing Library for testing
- Install Axios, React Icons, and Zustand
- Configure ESLint + Prettier for code quality
- Set up Husky for git hooks
- Create standard project folders
- Add a clean welcome screen
- Set up an Axios instance at `src/utils/axiosInstance.js`

## 📂 Folder Structure
After running, your project will look like this:
```
my-app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   │   └── axiosInstance.js (if Axios selected)
│   ├── assets/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── vite.config.js
├── package.json
└── README.md
```

## ⚡ CSS Framework Integration
### Tailwind CSS
- Installs `tailwindcss` & `@tailwindcss/vite`
- Updates `vite.config.js` to use Tailwind plugin
- Sets up `index.css` with Tailwind directives
- Removes unused default CSS files

### Bootstrap
- Installs `bootstrap`
- Imports Bootstrap CSS in `main.jsx`
- Removes unused default CSS files

### MUI (Material UI)
- Installs `@mui/material`, `@emotion/react`, `@emotion/styled`
- Removes unused default CSS files

## 🧩 Optional Packages
You can add these during setup:
- **Axios** — with a ready-to-use `axiosInstance.js`
- **React Icons** — icon library
- **React Hook Form** — form management
- **Yup** — schema validation
- **Formik** — form management
- **Moment.js** — date/time utilities
- **Zustand** — lightweight state management
- **TanStack Query** — data fetching and caching
- **Framer Motion** — animation library
- **React Helmet** — document head management for SEO

## 🧪 Testing Framework Support
Choose from these testing options:
- **Vitest + React Testing Library** — fast unit testing with Vite integration
- **Jest + React Testing Library** — traditional React testing setup
- **Cypress** — end-to-end testing framework
- **None** — skip testing setup

## 🛠️ Development Tools
Enhance your development workflow with:
- **ESLint + Prettier** — code linting and formatting
- **Husky** — git hooks for pre-commit checks
- **Commitizen** — conventional commit messages

## 🚀 Quick Start
```bash
npx quickstart-react my-dashboard
```
Select Tailwind, Bootstrap, or MUI, add any packages, and start coding immediately

## 👐 Contributing
We welcome contributions! Follow these steps:
1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Added new feature"`
4. Push to your branch: `git push origin feature-name`
5. Open a Pull Request

Before submitting, please ensure:
- Your code follows project style guidelines
- You have tested your changes locally

#### Happy Hacking 🐱‍🏍
