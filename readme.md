# ⚡ quickstart-react (React Package Solution)

🚀 **quickstart-react** is an open-source CLI tool that lets you instantly create a Vite + React app with your choice of CSS framework, optional packages, and pre-configured project structure — all in one command.

## ✨ Features
- **Language Selection & Type Safety** — prompts you to choose JavaScript or TypeScript. Automatically sets up PropTypes for JS or installs TypeScript and types for TS. All generated files use the correct extensions and templates for your selection.
- **Interactive Setup** — prompts you for project name, CSS framework, and optional packages
- **CSS Framework Support** — Tailwind CSS, Bootstrap, or MUI (Material UI)
- **Optional Packages** — easily add Axios, React Icons, React Hook Form, Yup, Formik, and Moment.js
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
1. **Choose Project Language** — JavaScript or TypeScript
2. **Enter Project Name** — e.g., `my-app`
3. **Choose CSS Framework** — Tailwind, Bootstrap, or MUI
4. **Select Optional Packages** — choose from a list of commonly used React libraries

Example run:
```bash
npx quickstart-react
```

### Example Walkthrough
```
? Enter project name: my-portfolio
? Choose a CSS framework: Tailwind
? Select optional packages: Axios, React Icons
```

This will:
- Create a new Vite + React project in `my-portfolio/`
- Install Tailwind CSS and configure it with Vite
- Install Axios and React Icons
- Create standard project folders
- Add a clean welcome screen
- Set up an Axios instance at `src/utils/axiosInstance.js`
- Use `.tsx`/`.ts` files and install TypeScript/types if you chose TypeScript, or use `.jsx`/`.js` files and set up PropTypes if you chose JavaScript
## 🧠 How Language Selection & Type Safety Works

- At the start, you choose JavaScript or TypeScript.
- The tool uses the correct Vite template (`react` or `react-ts`) based on your choice.
- All generated files (e.g., `App.jsx`/`App.tsx`, `main.jsx`/`main.tsx`) use the appropriate extension.
- If you select JavaScript, PropTypes is installed and set up in the main App component for runtime prop validation.
- If you select TypeScript, TypeScript and all necessary type packages are installed and used throughout the project.
- The tool automatically detects and updates either `vite.config.js` or `vite.config.ts` for Tailwind setup.

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
