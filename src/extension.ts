// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { CreatePipeProvider } from './createPipeline';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "starlight-extension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('starlight-extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Starlight-Extension!');
	});

	context.subscriptions.push(disposable);

	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const createPipelineProvider = new CreatePipeProvider(rootPath);
	vscode.window.registerTreeDataProvider("create-pipeline", createPipelineProvider);
	vscode.commands.registerCommand('starlight-extension.create', () =>
		createPipelineProvider.generateGitlabCiYml()
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
