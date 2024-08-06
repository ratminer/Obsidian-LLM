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

    constructor() {
        let params = {
            model: 'llama3.1',
            baseUrl: 'http://node-8:11434',
            options: {
                use_mmap: true,
                num_thread: 6,
                num_gpu: 6
            }
        }

        this.llm = new Ollama(params)

        const chatPrompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `{prompt}                
                `
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
