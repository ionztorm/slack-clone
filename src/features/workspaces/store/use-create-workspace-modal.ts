import { atom, useAtom } from "jotai";

const workspaceModal = atom(false);

// creates a kind of golobal state that can be used / persisted across the app.
export const useCreateWorkspaceModal = () => useAtom(workspaceModal);
