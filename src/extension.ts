'use strict';
import * as vscode from 'vscode';
import { RecordController, Resizer } from "./recorder";

export function activate(context: vscode.ExtensionContext) {

    console.log(process.env);

    console.log('Congratulations, your extension "vscode-screen-record" is now active!');

    let controller = new RecordController();
    let resizer = new Resizer();

    context.subscriptions.push(controller);
    context.subscriptions.push(resizer);
}

export function deactivate() {

}