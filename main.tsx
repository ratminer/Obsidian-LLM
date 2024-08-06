import { App, Editor, Plugin } from 'obsidian'
import { AiAssistant, DocumentAnalysis } from "./src/langchain/AIAssistant";
import { createContext, useContext } from "react";
import { JournalChat } from "./src/views/JournalChatView";

export const VIEW_TYPE_JOURNAL_CHAT = "journal-chat";

export const AppContext = createContext<App | undefined>(undefined)

export const useApp = (): App | undefined => {
    return useContext(AppContext)
}

export default class ReplikaPlugin extends Plugin {

    async onload() {

        this.registerView(VIEW_TYPE_JOURNAL_CHAT, (leaf) => new JournalChat(leaf))
        this.addRibbonIcon("dice", "Journal Chat", () => JournalChat.activate(this.app))

        this.addCommand({
            id: 'Weekly summary',
            name: 'Weekly Summary',
            callback: async () => {

                const fileContents = await Promise.all(
                    this.app.vault.getMarkdownFiles().map((file) => this.app.vault.cachedRead(file))
                )

                // const summaries = await Promise.all(
                //     fileContents.map(async (document) => {
                //         return await summaryAI.sendMessage({ document })
                //     })
                // )
                // console.log('generating report')
                // const response = await weeklySummary.sendMessage({
                //     document: fileContents.join('\n---\n')
                // })

                // console.log(response)

                const message = await AiAssistant.sendMessage({
                    journal: fileContents.join('\n---\n')
                })

                console.log(message)
            }
        })

        this.addCommand({
            id: 'Analyze Document',
            name: 'Analyze Document',
            editorCallback: async (editor: Editor) => {
                const response = await DocumentAnalysis.sendMessage({
                    document: editor.getDoc().getValue()
                })
                console.log(response)
                const r2 = await AiAssistant.sendMessage({
                    journal: response
                })
                console.log(r2)
            }
        })
    }
}

/*

Note analyzer Service
- This service is responsible for analyzing your notes and extracting key points.
- Using NLP techniques to identify entities, relationships, and sentiment in the notes.

Insight Generator Service
- This service will generate insights based ont the analysis of the notes.
- Using machine learning to identify patterns and trends in the notes and provide insights.

Suggestion Generator Service
- This service will generate suggestions based on notes and preferences.
- Using a combination of NLP and machine learning to analyze notes and provide relevant suggestions.

Reminder and Scheduling Service
- This service is responsible for setting reminders and scheduling appointments.
- Using a scheduling library/API to integrate with a calendar to set reminders and appointments.

Emotional Support Service
- This service provides emotional support and offers word of encouragement.
- Using a combination of NLP and machine learning to analyze

 */