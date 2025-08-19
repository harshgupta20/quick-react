import path from "node:path";
import fs from "node:fs";
import { run } from "./utils.js";

export const createViteProject = (projectName) => {
  run(`npm create vite@latest ${projectName} -- --template react`);
  return path.join(process.cwd(), projectName);
};

export const installPackages = (packages, projectPath) => {
  if (packages.length > 0) {
    run(`npm install ${packages.join(" ")}`, projectPath);
  }
};

export const createFolderStructure = (projectPath) => {
  const folders = ["components", "pages", "hooks", "store", "utils", "assets"];
  for (const folder of folders) {
    fs.mkdirSync(path.join(projectPath, "src", folder), { recursive: true });
  }
};

export const createAxiosInstance = (projectPath) => {
  const axiosContent = `import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: { "Content-Type": "application/json" },
    timeout: 10000
});

// ✅ Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Example: Add token if available
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
    },
    (error) => {
            return Promise.reject(error);
        }
);

// ✅ Response Interceptor
api.interceptors.response.use(
    (response) => {
            return response.data; // Return only data for convenience
        },
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.data?.message || error.message);
            // Example: Handle unauthorized
            if (error.response.status === 401) {
            // Optionally redirect to login
                window.location.href = "/login";
            }
        } else if (error.request) {
            console.error("No response received from server.");
        } else {
            console.error("Request setup error:", error.message);
        }
        return Promise.reject(error);
    }
);
`;

  fs.writeFileSync(
    path.join(projectPath, "src", "utils", "axiosInstance.js"),
    axiosContent
  );
};

export const cleanupDefaultFiles = (projectPath, cssFramework) => {
  const appCssPath = path.join(projectPath, "src", "App.css");
  if (fs.existsSync(appCssPath)) fs.unlinkSync(appCssPath);

  const indexCssPath = path.join(projectPath, "src", "index.css");
  if (cssFramework !== "Tailwind" && fs.existsSync(indexCssPath)) {
    fs.unlinkSync(indexCssPath);
  }
};
