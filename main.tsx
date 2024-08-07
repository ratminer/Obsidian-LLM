import { App, Editor, Plugin } from 'obsidian'
import { createContext, useContext } from "react";
import { JournalChat } from "./src/views/JournalChatView";

export const VIEW_TYPE_JOURNAL_CHAT = "journal-chat";

export const AppContext = createContext<App | undefined>(undefined)

export const useApp = (): App | undefined => {
    return useContext(AppContext)
}

const config = {
    llmConnection: {
        model: 'llama3.1',
        baseUrl: 'http://node-8:11434',
        options: {
            use_mmap: true,
            num_thread: 6,
            num_gpu: 6
        }
    }
};

export default class AssistantPlugin extends Plugin {

    async onload() {
        this.registerView(VIEW_TYPE_JOURNAL_CHAT, (leaf) => new JournalChat(config, leaf))
        this.addRibbonIcon("bot", "Journal Chat", () => JournalChat.activate(this.app))
    }
}
