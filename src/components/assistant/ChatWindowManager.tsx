import React from 'react'
import styled from "styled-components";
import { Colors } from "../common/Constants";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { useState } from "react";
import { Button } from "../common/Button";
import { LlmConnection } from "./LlmConnection";
import { ChatBot } from "./ChatBot";
import { BaseMessage } from "@langchain/core/messages";

const Container = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 10px;    
`

const SideBar = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-right: 1px solid ${Colors.BORDER_COLOR};
`

const Content = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    max-width: 75%;
`

export interface Assistant {
    id: number
    connection: LlmConnection
    messageHistory: BaseMessage[]
}

interface Llm {
    id: number,
    connection: LlmConnection
}

export const ChatWindowManager: React.FC<{ config: any }> = ({ config }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [nextId, setNextId] = useState(1)
    const [assistants, setAssistant] = useState<Assistant[]>([])

    function addChatWindow() {
        setAssistant([...assistants, {id: nextId, connection: new LlmConnection(config), messageHistory: []}])
        setNextId(nextId + 1)
        setSelectedIndex(assistants.length)
    }

    function updateMessageHistory(id: number, messages: BaseMessage[]) {
        setAssistant((prevAssistants) =>
            prevAssistants.map((assistant) =>
                assistant.id === id ? { ...assistant, messageHistory: messages } : assistant
            )
        )
    }

    return (
        <Tabs selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
            <Container>
                <SideBar>
                    <Button onClick={addChatWindow}>Add Chat Window</Button>
                    <TabList>
                        {assistants.map((assistant) => (
                            <Tab key={assistant.id}>
                                <Container>
                                    <Button onClick={() => {
                                        setSelectedIndex(assistant.id)
                                    }}>
                                        Chat {assistant.id}
                                    </Button>
                                </Container>
                            </Tab>
                        ))}
                    </TabList>
                </SideBar>
                <Content>
                    {assistants.map((assistant) => (
                        <TabPanel key={assistant.id}>
                            <ChatBot
                                assistant={assistant}
                                chatLog={assistant.messageHistory}
                                updateMessageHistory={updateMessageHistory}
                            />
                        </TabPanel>
                    ))}
                </Content>
            </Container>
        </Tabs>
    )
}