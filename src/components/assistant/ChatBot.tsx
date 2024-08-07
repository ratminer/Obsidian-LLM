import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "../common/Button";
import { TextAreaInput } from "../common/TextArea";
import { ChatWindow } from "./ChatWindow";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Assistant } from "./ChatWindowManager";

export interface ChatBotProps {
    assistant: Assistant
    chatLog: BaseMessage[]
    updateMessageHistory: (id: number, messages: BaseMessage[]) => void
}

const ChatBotContainer = styled.div`
    height: 90vh;
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
`

export const ChatBot: React.FC<ChatBotProps> = ({ assistant, chatLog, updateMessageHistory }) => {
    const [messages, setMessages] = useState<BaseMessage[]>(chatLog)
    const [prompt, setPrompt] = useState<string>('')

    useEffect(() => {
        updateMessageHistory(assistant.id, messages)
    }, [messages])

    async function handleSetPrompt(prompt: string) {
        setPrompt(prompt)
        assistant.connection.prompt = prompt
        await sendMessage(new SystemMessage(prompt))
    }

    async function handleSendMessage(message: string) {
        if (message.length <= 0)
            return
        await sendMessage(new HumanMessage(message))
    }

    async function sendMessage(message: BaseMessage) {
        // this line just allows for user message to show up before waiting for AI response
        setMessages([...messages, message])
        await assistant.connection.sendMessage(message)
        setMessages(await assistant.connection.messageHistory.getMessages())
    }

    async function handleClear() {
        await assistant.connection.messageHistory.clear()
        setMessages([])
    }

    const promptPlaceholder = 'Set initial prompt for the bot'
    const messagePlaceholder  = 'Send Message'

    return (
        <ChatBotContainer>
            <TextAreaInput onSetValue={handleSetPrompt} placeholder={promptPlaceholder}>Set Prompt</TextAreaInput>
            <ChatWindow messages={messages}/>
            <TextAreaInput onSetValue={handleSendMessage} placeholder={messagePlaceholder} resetOnEnter={true}>Send Message</TextAreaInput>
            <Button onClick={handleClear}>Clear Chat Log</Button>
        </ChatBotContainer>
    );
}
