import inquirer from "inquirer";

export const getProjectName = async () => {
  const { projectName } = await inquirer.prompt([
    { type: "input", name: "projectName", message: "Enter project name:" },
  ]);
  return projectName;
};

export const getCSSFramework = async () => {
  const { cssFramework } = await inquirer.prompt([
    {
      type: "list",
      name: "cssFramework",
      message: "Choose a CSS framework:",
      choices: ["Tailwind", "Bootstrap (CDN)", "React Bootstrap", "MUI"],
    },
  ]);
  return cssFramework;
};

export const getOptionalPackages = async () => {
  const { packages } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "packages",
      message: "Select optional packages:",
      choices: [
        { name: "Axios", value: "axios" },
        { name: "React Icons", value: "react-icons" },
        { name: "React Hook Form", value: "react-hook-form" },
        { name: "Yup", value: "yup" },
        { name: "Formik", value: "formik" },
        { name: "Moment.js", value: "moment" },
      ],
    },
  ]);
  return packages;
};
