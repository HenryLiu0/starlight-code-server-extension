import * as vscode from 'vscode';

export class CreatePipeProvider implements vscode.TreeDataProvider<CreatePipeItem> {
    // onDidChangeTreeData?: vscode.Event<CreatePipeItem | null | undefined> | undefined;
    private _onDidChangeTreeData: vscode.EventEmitter<CreatePipeItem | undefined | null | void> = new vscode.EventEmitter<CreatePipeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CreatePipeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    refresh(): void {
  
      this._onDidChangeTreeData.fire();
    }
    data: CreatePipeItem[];

    constructor(private workspaceRoot: string | undefined) {
        vscode.commands.registerCommand('starlight-extension.on_item_clicked', item => this.onItemClicked(item));
        this.data = [
            new CreatePipeItem('software stack', [
                new CreatePipeItem('basic algorithm'),
                new CreatePipeItem('medical biology')
            ]),
            new CreatePipeItem('platform', [
                new CreatePipeItem('TianHe'),
                new CreatePipeItem('ShenWei')
            ]),
        ];
    }

    onItemClicked(item: CreatePipeItem) {
        if (item.label === undefined) {
            return;
        }
        // 改变icon
        // 如果iconPath是ThemeIcon
        if (item.iconPath instanceof vscode.ThemeIcon) {
            if (item.iconPath.id === 'circle-large-outline') {  // unchecked
                // uncheck其它item
                // if (item.parent !== undefined) {
                //     this.data.forEach((i) => {
                //         if (i.label === item.parent?.label) {
                //             // i.children.forEach((j) => {
                //             //     j.iconPath = new vscode.ThemeIcon('circle-large-outline');
                //             // });
                //         }
                //         // i.children.forEach((child) => {
                //         //     child.iconPath = new vscode.ThemeIcon('circle-large-outline');
                //         // });
                //     });
                // }
                item.iconPath = new vscode.ThemeIcon('pass-filled');
            } else if (item.iconPath.id === 'pass-filled') {    // checked
                item.iconPath = new vscode.ThemeIcon('circle-large-outline');
            }
        }
        // 更新
        this.refresh();
        
        vscode.window.showInformationMessage(item.label.toString());
    }

    getTreeItem(element: CreatePipeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        // 为item设置点击事件
        element.command = {
            command: 'starlight-extension.on_item_clicked',
            title: '',
            arguments: [element],
        };
        return element;
    }

    getChildren(element?: CreatePipeItem | undefined): vscode.ProviderResult<CreatePipeItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}

class CreatePipeItem extends vscode.TreeItem {
    public children: CreatePipeItem[] | undefined;
    public parent: CreatePipeItem | undefined;

    constructor(label: string, children?: CreatePipeItem[] | undefined) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
        // 最底层item有box
        if (children === undefined) {
            this.iconPath = new vscode.ThemeIcon('circle-large-outline');
        } else if (children !== undefined) {
            // 给children的parent赋值
            children.forEach(element => {
                element.parent = this;
            });
        }
    }
}