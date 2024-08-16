import { OllamaFunctions } from "@langchain/community/experimental/chat_models/ollama_functions";
import { Runnable } from "@langchain/core/runnables";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

const SYSTEM_PROMPT_TEMPLATE = `
You are an expert extraction algorithm.
Only extract relevant information from the text.
If you do not know the value of an attribute asked to extract, you may omit the attribute's value.
`

export const journalSchema = z
    .object({
        people: z.optional(z.array(z.object({
            name: z
                .optional(z.string())
                .describe("name of the person"),
            relationship: z
                .optional(z.string())
                .describe("relationship to the user")
        }))),
        places: z.optional(z.array(z.object({
            location: z
                .string()
                .describe("name of the place"),
            address: z
                .optional(z.string())
                .describe("address of the place")
        }))),
        dates: z.optional(z.array(z.object({
            date: z
                .date()
                .describe("date of the event"),
            info: z
                .optional(z.string())
                .describe("description of the event")
        }))),
        theme: z
            .optional(z.string())
            .describe("category or topic related to the journal entry"),
        emotion: z
            .optional(z.string())
            .describe("dominant emotion expressed in the entry")
    })

export class ExtractionAgent {

    llmWithTools: Runnable
    prompt: ChatPromptTemplate

    constructor(config: any) {
        this.llmWithTools = new OllamaFunctions(config)
            .bind({
                functions: [
                    {
                        name: "information_extraction",
                        description: "Extracts the relevant information from the passage.",
                        parameters: {
                            type: "object",
                            properties: zodToJsonSchema(journalSchema)
                        }
                    }
                ],
                function_call: {
                    name: "information_extraction"
                }
            })

        this.prompt = ChatPromptTemplate.fromMessages([
            [ "system", SYSTEM_PROMPT_TEMPLATE ],
            [ "human", "{text}" ]
        ])
    }

    async extractInfo(content: string) {
        const chain = await this.prompt
            .pipe(this.llmWithTools)
            .pipe(new JsonOutputFunctionsParser())
        return await chain.invoke({ text: content })
    }
}