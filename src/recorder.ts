import * as vscode from "vscode";
import {  EventEmitter } from "events";
import * as path from "path";
import * as fs from "fs";

var Aperture = require("aperture.js") 


class Utility {
    static getUserHome() {
        return process.env.HOME || process.env.USERPROFILE;
    }

    static copyToHome(file) {
        let home = Utility.getUserHome();
        let base = path.basename(file).replace("tmp", "vscode");
        let dest = path.join(home, "Desktop", base);
        fs.createReadStream(file).pipe(fs.createWriteStream(dest));
        return dest;
    }
}

interface IArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ISetting {
   fps: number;
   cropArea: IArea;
}

interface IError {
    code: string;
    message: string;
    stack: string;
}

interface IAperture {
    startRecording: (area: ISetting) => Promise<string>;
    stopRecording: () => Promise<string>;
}

export class RecordController {
    item : vscode.StatusBarItem;
    recorder = new Recorder();
    
    startText = "$(device-camera-video)  Record Screen";
    stopText = "$(diff-modified)  Stop Recording";
    
    //green = "#88CC88";
    green = "white";
    red = "#D46F6A";
    
    constructor() {
        this.recorder.on("error", (msg) => {
            vscode.window.showErrorMessage(msg);
        });
        
        this.recorder.on("finish", (file) => {
            let final = Utility.copyToHome(file);
            vscode.window.showInformationMessage(final);
        });

        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.item.text = this.startText; 
        this.item.command = "screenRecorder.startOrStopRecording"
        this.item.color = this.green;
        this.item.show();
        
        vscode.commands.registerCommand("screenRecorder.startOrStopRecording", () => {
            this.startOrStop();
        });
    }
    
    dispose() {
        this.recorder.stopRecord();
        this.item.dispose();
    }
    
    startOrStop() {
        let text = this.item.text;
        if(text == this.startText) {
            this.recorder.startRecord(0, { x: 0, y: 0, width: 200, height: 200 });
            this.item.text = this.stopText;
            this.item.color = this.red;
        }else if(text == this.stopText) {
            this.recorder.stopRecord();
            this.item.text = this.startText;
            this.item.color = this.green;
        }
    }
}

export class Recorder extends EventEmitter {

    aperture: IAperture;
    
    constructor() {
        super();
        this.aperture = Aperture();
    }
    
    startRecord(ms, cropArea: IArea) {
        let rc = this.aperture.startRecording({fps: 30, cropArea });
        
        rc.then(file => {
            if(ms != 0) {
                setTimeout(() => { this.stopRecord() }, ms);
            }
        });
        
        rc.catch((err: IError) => {
            this.emit("error", err);
        });
    }
    
    stopRecord() {
        let rc = this.aperture.stopRecording();
        rc.then(file => {
            this.emit("finish", file);
        });
        
        rc.catch((err: IError) => {
            this.emit("error", err.message);
        });
    }
}