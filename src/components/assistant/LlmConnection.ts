import { Ollama } from "@langchain/community/llms/ollama";
import { Runnable } from "@langchain/core/runnables";
import { ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, BaseMessage } from "@langchain/core/messages";

export class LlmConnection {

    llm: Ollama
    chain: Runnable

    public prompt: string = "";
    public messageHistory: ChatMessageHistory

    constructor(config: any) {

        this.llm = new Ollama(config)

        const chatPrompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `{prompt}`
            ],
            new MessagesPlaceholder("messages")
        ])

        this.chain = chatPrompt.pipe(this.llm)

        this.messageHistory = new ChatMessageHistory()
    }

    async sendMessage(message: BaseMessage) {
        await this.messageHistory.addMessage(message)

        const response = await this.chain.invoke({
            prompt: this.prompt,
            messages: await this.messageHistory.getMessages()
        });

        await this.messageHistory.addMessage(new AIMessage(response))

        return response
    }
}
