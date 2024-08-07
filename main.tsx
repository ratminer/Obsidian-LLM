import { App, Plugin } from 'obsidian'
import { createContext, useContext } from "react";
import { JournalChat } from "./src/views/JournalChatView";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ChatOllama } from "@langchain/ollama";

export const VIEW_TYPE_JOURNAL_CHAT = "journal-chat";

export const AppContext = createContext<App | undefined>(undefined)

export const useApp = (): App | undefined => {
    return useContext(AppContext)
}

const OLLAMA_URL = 'http://node-8:11434'

const config = {
    llmConnection: {
        model: 'llama3.1',
        baseUrl: OLLAMA_URL,
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

        this.addCommand(extractContentCommand)
    }
}
const SYSTEM_PROMPT_TEMPLATE = `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you do not know the value of an attribute asked to extract, you may omit the attribute's value.`

const extractionConfig = {
    model: 'mistral',
    baseUrl: OLLAMA_URL,
    options: {
        use_mmap: true,
        num_thread: 6,
        num_gpu: 6
    }
}

const extractContentCommand = {
    id: 'extract-content',
    name: 'Extract Content',
    callback: async () => {


        const personSchema = z
            .object({
                name: z.optional(z.string()).describe("The name of the person"),
                hair_color: z
                    .optional(z.string())
                    .describe("The color of the person's hair, if known"),
                height_in_meters: z
                    .optional(z.string())
                    .describe("Height measured in meters"),
            })
            .describe("Information about a person.")

        const ollama = new OllamaFunctions(extractionConfig)
            .bind({
                functions:[
                    {
                        name: "information_extraction",
                        description: "Extracts the relevant information from the passage.",
                        parameters: {
                            type: "object",
                            properties: zodToJsonSchema(personSchema)
                        }
                    }
                ],
                function_call: {
                    name: "information_extraction"
                }
            })

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_PROMPT_TEMPLATE],
            ["human", "{text}"]
        ])

        const chain = await prompt.pipe(ollama).pipe(new JsonOutputFunctionsParser())


        //const extractionRunnable = await prompt.pipe(ollama.withStructuredOutput(personSchema))

        const text = "Alan Smith is 6 feet tall and has blond hair."

        const response = await chain.invoke({
            text
        })

        console.log(response)
    }
}


