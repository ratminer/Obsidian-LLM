import { App, Editor, Plugin } from 'obsidian'
import { createContext, useContext } from "react";
import { JournalChat } from "./src/views/JournalChatView";
import { ExtractionAgent, journalSchema } from "./src/components/extraction/ExtractionAgent";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

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

        this.addCommand({
            id: 'a',
            name:'a',
            editorCallback: async (editor: Editor) => {
                const llm = new ChatOllama(extractionConfig)
                const wso = llm.withStructuredOutput(journalSchema, {
                    name: 'extractor',
                    method: 'functionCalling',
                    includeRaw: true
                })

                const taggingPrompt = ChatPromptTemplate.fromTemplate(`
                Extract the desired information from the following passage.
                Make sure to use the 'extractor' tool.
                
                Passage:
                {input}
                `)

                const taggingChain = taggingPrompt.pipe(wso)

                const response = await taggingChain.invoke({
                    input: editor.getValue()
                })

                console.log(response)
            }
        })

        this.addCommand({
            id: 'build AST',
            name: 'build AST',
            editorCallback: (editor: Editor) => {
                const ast = buildAST(editor.getValue())

                console.log(extractTextFromAST(ast))

                console.log(preprocessText(extractTextFromAST(ast)))
                const topics = runLDAModel(preprocessText(extractTextFromAST(ast)))
                console.log(topics)
                console.log(generateHumanReadableTopic(topics[0]))
            }
        })
    }
}

const stopwords = require('stopword')
const lda = require('lda')

function preprocessText(text) {
    let tokens = text.toLowerCase().match(/\w+/g)
    tokens = stopwords.removeStopwords(tokens)
    return tokens
}

function runLDAModel(journalEntries, numTopics= 5, numTermsPerTopic= 10) {
    const documents= journalEntries.map(entry => preprocessText(entry).join(' '))
    return lda(documents, numTopics, numTermsPerTopic , null, null, null, null)
}

function generateHumanReadableTopic(terms) {
    terms.sort((a, b) => b.probability - a.probability)

    return `${terms[0].term} and ${terms[1].term}`
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

function extractTextFromAST(node: any) {
    let text = ''
    if (node.text) {
        text += node.text + ' '
    }

    if (node.children) {
        node.children.forEach(child => {
            text += ' ' + extractTextFromAST(child)
        })
    }

    return text.trim()
}

function tokenizeEntry(entryText: string) {
    const sections = entryText.split(/(?:^|\n)## /).map(section => section.trim())
    return sections.map(section => {
        const paragraphs = section.split(/\n\n+/).map(paragraph => paragraph.trim())
        return paragraphs.map(paragraph => {
            return paragraph.split(/[.!?]\s+/).map(sentence => sentence.trim())
        })
    })
}

export function buildAST(entryText: string) {
    const entryNode = {
        type: 'Entry',
        date: new Date().toISOString(),
        title: 'Sample Entry',
        children: []
    }

    const sections = tokenizeEntry(entryText)

    sections.forEach(section => {
        const sectionNode = {
            type: 'Section',
            title: section[0][0],
            children: []
        }
        section.forEach(paragraph => {
            const paragraphNode = {
                type: 'Paragraph',
                children: []
            }
            paragraph.forEach(sentence => {
                const sentenceNode = {
                    type: 'Sentence',
                    text: sentence
                }
                paragraphNode.children.push(sentenceNode)
            })
            sectionNode.children.push(paragraphNode)
        })
        entryNode.children.push(sectionNode)
    })
    return entryNode
}

function extractMetadata(entryText: string) {
    const metadata = {}
    const metadataRegex = /(?:^|\n)@(\w+): (.+?)(?=\n|$)/g
    let match;

    while((match = metadataRegex.exec(entryText)) !== null) {
        metadata[match[1]] = match[2].trim()
    }
    return metadata
}

function buildASTWithMetadata(entryText: string) {
    const metadata : any = extractMetadata(entryText)
    const entryNode = {
        type: 'Entry',
        date: metadata.date || new Date().toISOString(),
        title: metadata.title || 'Sample Entry',
        children: []
    }
}

// const Redis = require('ioredis')
// const redis = new Redis()
//
// async function storeNodeInRedis(node, parentKey = null) {
//     const nodeId = `node:${Math.random().toString(36).substring(2, 9)}`
//     const nodeKey= `entry:123:${nodeId}`
//
//     await redis.hmset(nodeKey, {
//         type: node.type,
//         text: node.text || '',
//         title: node.title || '',
//         date: node.date || '',
//     })
//
//     if (node.children) {
//         for (const child of node.children) {
//             await storeNodeInRedis(child, nodeKey)
//         }
//     }
//
//     if (parentKey) {
//         await redis.sadd(`${parentKey}:children`, nodeKey)
//     }
//
//     return nodeKey
// }