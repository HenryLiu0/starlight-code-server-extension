import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as YAML from 'yaml';

export class CreatePipeProvider implements vscode.TreeDataProvider<CreatePipeItem> {
    // onDidChangeTreeData?: vscode.Event<CreatePipeItem | null | undefined> | undefined;
    private _onDidChangeTreeData: vscode.EventEmitter<CreatePipeItem | undefined | null | void> = new vscode.EventEmitter<CreatePipeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CreatePipeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    refresh(): void {
  
      this._onDidChangeTreeData.fire();
    }
    data: CreatePipeItem[];
    rootPath: string | undefined;

    constructor(private workspaceRoot: string | undefined) {
        vscode.commands.registerCommand('starlight-extension.on_item_clicked', item => this.onItemClicked(item));
        this.data = [
            new CreatePipeItem('软件栈', [
                new CreatePipeItem('基础算法库', [
                    new CreatePipeItem('Metis'),new CreatePipeItem('SciPy'),new CreatePipeItem('NumPy'),new CreatePipeItem('ELPA'),
                ]),
                new CreatePipeItem('大气海洋', [
                    new CreatePipeItem('WRF'),new CreatePipeItem('NAQPMS'),new CreatePipeItem('LICOM'),new CreatePipeItem('IAP DGVM'),
                ]),
                new CreatePipeItem('工业制造', [
                    new CreatePipeItem('Openfoam'),new CreatePipeItem('SU2'),new CreatePipeItem('OpenCFD'),new CreatePipeItem('CFL3D'),
                ]),
                new CreatePipeItem('材料设计', [
                    new CreatePipeItem('CP2K'),new CreatePipeItem('LAMMPS'),new CreatePipeItem('GROMOS'),new CreatePipeItem('NAMD'),
                ]),
                new CreatePipeItem('生物医药', [
                    new CreatePipeItem('Gromacs'),new CreatePipeItem('LAMMPS'),new CreatePipeItem('Peridigm'),new CreatePipeItem('CASTEP'),
                ]),
                new CreatePipeItem('能源', [
                    new CreatePipeItem('Openmoc'),new CreatePipeItem('RT'),new CreatePipeItem('OOFEM'),new CreatePipeItem('espreso'),
                ]),
                new CreatePipeItem('人工智能与大数据', [
                    new CreatePipeItem('StarBALib'),new CreatePipeItem('Mimir'),new CreatePipeItem('RTAI'),
                ])
            ]),
            new CreatePipeItem('平台', [
                new CreatePipeItem('TianHe'),
                new CreatePipeItem('ShenWei')
            ]),
        ];
        this.rootPath = workspaceRoot;
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

    // 生成.gitlab-ci.yml文件
    generateGitlabCiYml() {
        // 遍历data第一层，如果有两个以上checked报错
        for (const item of this.data) {
            let checkedCount = 0;
            if(item.children) {
                for (const child of item.children) {
                    if (child.iconPath instanceof vscode.ThemeIcon && child.iconPath.id === 'pass-filled') {
                        checkedCount++;
                    }
                }
                if (checkedCount > 1) {
                    vscode.window.showErrorMessage('只能选择一个' + item.label);
                    return;
                }
                if (checkedCount === 0) {
                    vscode.window.showErrorMessage('请选择' + item.label);
                    return;
                }
            }
        }

        // 生成.gitlab-ci.yml文件
        // const content = 'exampleContent';
        // const filePath = path.join(vscode.workspace.rootPath, 'fileName.extension');
        // fs.writeFileSync(filePath, content, 'utf8');

        // 打开.gitlab-ci.yml文件
        // console.log(__dirname);  // out

        // vscode.window.showInformationMessage(buffer);
        // const openPath = vscode.Uri.file(filePath);
        // vscode.workspace.openTextDocument(openPath).then(doc => {
            // vscode.window.showTextDocument(doc);
        // });
        const ciTemplateFilePath = path.join(__dirname, '..', 'ci', '.gitlab-ci.yml');
        var buffer = fs.readFileSync(ciTemplateFilePath, 'utf8');
        let ciTemplateFile = YAML.parse(buffer);
        console.log(ciTemplateFile);

        if (this.rootPath === undefined) {
            vscode.window.showErrorMessage('请先打开一个文件夹');
            return;
        }
        // let ciCodeFile = ciTemplateFile;
        // 根据check修改ciCodeFile
        let ciCodeFile = this.ciYmlModify(ciTemplateFile);
        const ciCodeFilePath = path.join(this.rootPath, '.gitlab-ci.yml');
        // 写文件加上日期
        const date = new Date();
        const dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds();
        let out = '#' + dateString + '\n' + YAML.stringify(ciCodeFile);
        fs.writeFileSync(ciCodeFilePath, out, 'utf8');
        vscode.window.showInformationMessage(".gitlab-ci.yml文件生成成功");
    }

    // map映射数据
    ciMap: any = {
        '软件栈': {
            '基础算法库': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04-rtm3d:1',
            },
            '大气海洋': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:atmosphere-ocean',
            },
            '工业制造': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:industry-manufacture',
            },
            '材料设计': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:material-design',
            },
            '能源': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:energy',
            },
            '生物医药': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:medical-biology',
            },
            '人工智能与大数据': {
                'image': 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:ai-bigdata',
            }
        },
        '平台': {
            'TianHe': {
                'tags': ['TianHe'],
            },
            'ShenWei': {
                'tags': ['ShenWei'],
            }
        }
    };

    ciYmlModify(ciTemplateFile: any) {
        let ciCodeFile = ciTemplateFile;
        // 修改tags和image
        for (const item of this.data) {
            if(item.children) {
                for (const child of item.children) {
                    if (child.iconPath instanceof vscode.ThemeIcon && child.iconPath.id === 'pass-filled') {
                        if (item.label === '软件栈') {
                            // if (child.label === '基础算法库') {
                            //     ciCodeFile['compile-project']['image'] = 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04-rtm3d:1';
                            // } else if (child.label === '生物医药') {
                            //     ciCodeFile['compile-project']['image'] = 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:medical-biology';
                            // } else if (child.label === '人工智能与大数据') {
                            //     ciCodeFile['compile-project']['image'] = 'hub.starlight.nscc-gz.cn/nscc-gz_hailiu_public/ubuntu-20.04:ai-bigdata';
                            // }
                            if (typeof child.label === 'string') {
                                ciCodeFile['compile-project']['image'] = this.ciMap['软件栈'][child.label.toString()]['image'];
                            }
                        } else if (item.label === '平台') {
                            // if (child.label === 'TianHe') {
                            //     ciCodeFile['compile-project']['tags'] = ['TianHe'];
                            //     ciCodeFile['build-image']['tags'] = ['TianHe'];
                            // } else if (child.label === 'ShenWei') {
                            //     ciCodeFile['compile-project']['tags'] = ['ShenWei'];
                            //     ciCodeFile['build-image']['tags'] = ['ShenWei'];
                            // }
                            if (typeof child.label === 'string') {
                                ciCodeFile['compile-project']['tags'][0] = this.ciMap['平台'][child.label.toString()]['tags'][0];
                                ciCodeFile['build-image']['tags'][0] = this.ciMap['平台'][child.label.toString()]['tags'][0];
                            }
                        }
                    }
                }
            }
        }
        return ciCodeFile;
    }

}

class CreatePipeItem extends vscode.TreeItem {
    public children: CreatePipeItem[] | undefined;
    public parent: CreatePipeItem | undefined;

    constructor(label: string, children?: CreatePipeItem[] | undefined) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
        // 最底层item有box
        // if (children === undefined) {
        //     this.iconPath = new vscode.ThemeIcon('circle-large-outline');
        // }
        if (label === '软件栈') {
            children?.forEach((item) => {
                item.iconPath = new vscode.ThemeIcon('circle-large-outline');
                item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            });
        }
        if (label === '平台') {
            children?.forEach((item) => {
                item.iconPath = new vscode.ThemeIcon('circle-large-outline');
                // item.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            });
        }
        if (children !== undefined) {
            // 给children的parent赋值
            children.forEach(element => {
                element.parent = this;
            });
        }
    }
}