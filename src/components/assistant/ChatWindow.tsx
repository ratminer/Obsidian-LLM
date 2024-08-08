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
    flex-direction: column-reverse;
`

const MessageContainer = styled.div`
    & {
        border: 1px solid ${Colors.BORDER_COLOR};

        border-radius: 10px;
        padding: 5px;
        margin-bottom: 5px;
        background-color: ${Colors.MESSAGES_COLOR};
        max-width: 60%;
        word-wrap: break-word;
        user-select: text;
        font-size: small;
    }
`

const AiMessage = styled(MessageContainer)`
    align-self: flex-start;
    border-bottom-left-radius: 0;    
`
const HumanMessage = styled(MessageContainer)`
    align-self: flex-end;
    border-bottom-right-radius: 0;
    
`
const SystemMessage = styled(MessageContainer)`
    align-self: center;
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
            {messages.slice().reverse().map((msg, index) => {
                const content = <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content.toString()}</ReactMarkdown>
                switch(msg._getType()) {
                    case 'ai':
                        return <AiMessage key={index}>{content}</AiMessage>
                    case "human":
                        return <HumanMessage key={index}>{content}</HumanMessage>
                    case "system":
                    default:
                        return <SystemMessage key={index}>{content}</SystemMessage>
                }
            })}
        </ChatWindowContainer>
    )
}
