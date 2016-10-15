'use strict';
import * as vscode from 'vscode';
import { RecordController } from "./recorder";

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "vscode-screen-record" is now active!');

    let controller = new RecordController();
    context.subscriptions.push(controller);
}

export function deactivate() {
}