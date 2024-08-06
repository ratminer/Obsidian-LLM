import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm";
import { Colors } from "../common/Constants";
import { BaseMessage } from "@langchain/core/messages";

interface ChatWindowProps {
    messages: BaseMessage[];
}

const ChatWindowContainer = styled.div`
    flex: 1;
    border: 1px solid ${Colors.BORDER_COLOR};
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
`

const alignment = (type: string) => {
    switch (type) {
        case 'human':
            return 'flex-end';
        case 'ai':
            return 'flex-start';
        default:
            return 'center';
    }
}

const MessageContainer = styled.div<{ type: string }>`
    border: 1px solid ${Colors.BORDER_COLOR};
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 5px;
    background-color: ${Colors.MESSAGES_COLOR};
    align-self: ${props => alignment(props.type)};
    max-width: 60%;
    word-wrap: break-word;
    user-select: text;
    font-size: small;
`

export const ChatWindow: React.FC<ChatWindowProps> = ({messages}) => {

    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
        }
    }, [messages])

    return (
        <ChatWindowContainer ref={chatWindowRef}>
            {messages.map((msg, index) => (
                <MessageContainer key={index} type={msg._getType()}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content.toString()}</ReactMarkdown>
                </MessageContainer>
            ))}
        </ChatWindowContainer>
    )
}
