import { atom, useAtom } from "jotai";

const channelModal = atom(false);

// creates a kind of golobal state that can be used / persisted across the app.
export const useCreateChannelModal = () => useAtom(channelModal);
