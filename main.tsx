import { App, Editor, Plugin } from 'obsidian'
import { createContext, useContext } from "react";
import { JournalChat } from "./src/views/JournalChatView";

export const VIEW_TYPE_JOURNAL_CHAT = "journal-chat";

export const AppContext = createContext<App | undefined>(undefined)

export const useApp = (): App | undefined => {
    return useContext(AppContext)
}

export default class AssistantPlugin extends Plugin {

    async onload() {
        this.registerView(VIEW_TYPE_JOURNAL_CHAT, (leaf) => new JournalChat(leaf))
        this.addRibbonIcon("dice", "Journal Chat", () => JournalChat.activate(this.app))
    }
}
