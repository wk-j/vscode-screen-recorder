import * as vscode from "vscode";
import {  EventEmitter } from "events";
import * as path from "path";
import * as fs from "fs";

var mac = require("mac-active-window")

var findActiveWindow = mac.findActiveWindow as (number) => Promise<{ location: IArea }>;
var findScreenSize = mac.findScreenSize as () => Promise<{ width: number, height: number }>;
var resizeFrontMostWindow = mac.resizeFrontMostWindow as (w,h) => Promise<{}>;
var Aperture = require("aperture.js") 

class Utility {
    static getUserHome() {
        return process.env.HOME || process.env.USERPROFILE;
    }
    
    static getDefaultName() {
        let base = `vscode-${Math.round(+new Date().getTime())}.mp4`;
        return base;
    }

    static copyToHome(file) {
        let home = Utility.getUserHome();
        let base = Utility.getDefaultName();
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

export class Resizer {
    constructor() {
        vscode.commands.registerCommand("screenRecorder.resizeWindow", () => {
            this.showSizeConfig();
        });
    }

    getUserConfig() {
       var config = vscode.workspace.getConfiguration("screenRecorder").get("windowSizes") as any[];
       if(config) {
        return config.map(x => {
            return { label: `${x.width}x${x.height}`, description: ""}
        });
       }else {
           return [];
       }
    }

    showSizeConfig() {
        var items: vscode.QuickPickItem[] = [
            { label: "400x240", description: "" },
            { label: "450x270", description: "" },
            { label: "640x360", description: "" },
            { label: "854x480", description: "" },
            { label: "1280x720", description: "" },
            { label: "1920x1080", description: "" },
        ];

        var config = this.getUserConfig();
        config.forEach(x => {
            items.push(x);
        });

        var quick = vscode.window.showQuickPick(items)
        quick.then(size => {
            let s = size.label.split("x").map(x => x.trim())
            let rs = resizeFrontMostWindow(s[0], s[1]);
            rs.catch(err => {
                vscode.window.showErrorMessage(err);
            });
        });
    }

    dispose() {}
}

export class RecordController {
    item : vscode.StatusBarItem;
    recorder = new Recorder();
    
    startText = "$(device-camera-video)  Record Screen";
    stopText = "$(diff-modified)  Stop Recording";
    
    green = "white";
    red = "#FF851B";
    
    default = { x: 0, y: 0, width: 100, height: 100 };
    
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
    
    getPid() {
        return process.env.VSCODE_PID as number;
    }
    
    async startOrStop() {
        let text = this.item.text;
        if(text == this.startText) {
            let pid = this.getPid();
            var screenSize = await findScreenSize();
            findActiveWindow(pid).then(rs => {
                let newLocation = {
                    x: rs.location.x,
                    y: screenSize.height - rs.location.y - rs.location.height,
                    width: rs.location.width,
                    height: rs.location.height
                }
                this.recorder.startRecord(0, newLocation);
                this.item.text = this.stopText;
                this.item.color = this.red;
            });
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