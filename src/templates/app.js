import path from "node:path";
import fs from "node:fs";

export const createAppTemplate = (projectName, projectPath) => {
    const appFile = fs.existsSync(path.join(projectPath, "src/App.jsx"))
        ? path.join(projectPath, "src/App.jsx")
        : path.join(projectPath, "src/App.tsx");

    const appContent = `export default function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        background: "#f9fafb",
        color: "#111",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          fontWeight: 600,
        }}
      >
        Welcome to{" "}
        <span style={{ color: "#2563eb" }}>${projectName}</span> 🚀
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555" }}>
        Your project is ready. Start building amazing things!
      </p>
    </div>
  );
}`;

    fs.writeFileSync(appFile, appContent);
};