import { createContext } from "svelte";

export const connections: {
    gapiInitialized: boolean;
    gapiToken: string;
    gapiClient: google.accounts.oauth2.TokenClient | null;
    canvasToken: string;
    canvasConnected: boolean;
    edstemToken: string;
    edstemConnected: boolean;
    gradescopeToken: string;
    gradescopeConnected: boolean;
    demoMode?: boolean;
} = $state({
    gapiInitialized: false,
    gapiToken: "",
    gapiClient: null,
    canvasToken: "",
    canvasConnected: false,
    edstemToken: "",
    edstemConnected: false,
    gradescopeToken: "",
    gradescopeConnected: false
});
