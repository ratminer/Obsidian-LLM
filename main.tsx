import { App, Editor, Plugin } from 'obsidian'
import { createContext, useContext } from "react";
import { JournalChat } from "./src/views/JournalChatView";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { ExtractionAgent, journalSchema } from "./src/components/extraction/ExtractionAgent";

export const VIEW_TYPE_JOURNAL_CHAT = "journal-chat";

export const AppContext = createContext<App | undefined>(undefined)

export const useApp = (): App | undefined => {
    return useContext(AppContext)
}

const OLLAMA_URL = 'http://node-8:11434'

const chatConfig= {
    model: 'llama3.1',
    baseUrl: OLLAMA_URL,
    options: {
        use_mmap: true,
        num_thread: 6,
        num_gpu: 6
    }
}

const extractionConfig = {
    model: 'mistral',
    baseUrl: OLLAMA_URL,
    options: {
        use_mmap: true,
        num_thread: 6,
        num_gpu: 6
    }
}

export default class AssistantPlugin extends Plugin {

    async onload() {
        this.registerView(VIEW_TYPE_JOURNAL_CHAT, (leaf) => new JournalChat(chatConfig, leaf))
        this.addRibbonIcon("bot", "Journal Chat", () => JournalChat.activate(this.app))

        this.addCommand(extractContentCommand)
    }
}

const extractContentCommand = {
    id: 'extract-content',
    name: "Extract Content",
    editorCallback: async (editor: Editor) => {
        const llm = new ExtractionAgent(extractionConfig)

        const response = await llm.extractInfo(editor.getValue())

        console.log(response)
    }
}

