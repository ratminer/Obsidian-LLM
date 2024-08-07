import { App, ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { AppContext, VIEW_TYPE_JOURNAL_CHAT } from "../../main";
import { ChatWindowManager } from "../components/assistant/ChatWindowManager";

export class JournalChat extends ItemView {
    root: Root | null = null
    config: null

    constructor(config: any, leaf: WorkspaceLeaf) {
        super(leaf);
        this.config = config
    }

    getViewType(): string {
        return VIEW_TYPE_JOURNAL_CHAT
    }

    getDisplayText(): string {
        return "Journal Chat"
    }

    async onOpen() {
        this.root = createRoot(this.containerEl.children[1])
        this.root.render(
            <AppContext.Provider value={this.app}>
                <ChatWindowManager config={this.config}/>
            </AppContext.Provider>
        )
    }

    async onClose() {
        this.root?.unmount()
    }

    static async activate(app: App) {
        const { workspace} = app
        let leaf: WorkspaceLeaf | null = null

        const leaves = workspace.getLeavesOfType(VIEW_TYPE_JOURNAL_CHAT)
        if (leaves.length > 0) {
            leaf = leaves[0]
        } else {
            leaf = workspace.getRightLeaf(false)
            await leaf?.setViewState({type: VIEW_TYPE_JOURNAL_CHAT, active: true})
        }
        workspace.revealLeaf(leaf!!)
    }
}
