import fs from "fs";
import path from 'path';
import { createFolder } from './utils.js';

export const setupStateManagement = (stateManagement, projectPath) => {
    const storePath = path.join(projectPath, "src", "store");
    createFolder(storePath);

    if (stateManagement === "Zustand") {
        fs.writeFileSync(
            path.join(storePath, "useStore.js"),
            `import { create } from 'zustand';

export const useStore = create((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}));`
        );
    }

    if (stateManagement === "Redux Toolkit") {
        fs.writeFileSync(
            path.join(storePath, "store.js"),
            `import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
  },
});

export const { increment } = counterSlice.actions;

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});`
        );
    }

    if (stateManagement === "Jotai") {
        fs.writeFileSync(
            path.join(storePath, "atoms.js"),
            `import { atom } from 'jotai';

export const countAtom = atom(0);`
        );
    }
}
