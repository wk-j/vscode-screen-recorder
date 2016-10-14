import * as vscode from "vscode";
import {  EventEmitter } from "events";

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

var Aperture = require("aperture.js") 

export class Recorder extends EventEmitter {

    aperture: IAperture;
    
    constructor() {
        super();
        this.aperture = Aperture();
    }
    
    startRecord(ms) {
        let cropArea = { x : 100, y: 100, width: 100, height: 100 };
        let rc = this.aperture.startRecording({fps: 30, cropArea });
        rc.then(file => {
            console.log(file);
            setTimeout(() => {
                this.stopRecord();
            }, ms);
        });
        
        rc.catch((err: IError) => {
            console.error(err);
        });
    }
    
    stopRecord() {
        let rc = this.aperture.stopRecording();
        rc.then(file => {
            console.log(file);
            this.emit("finish", file);
        });
        
        rc.catch((err: IError) => {
            console.error(err);
        });
    }
}