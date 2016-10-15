//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as ext from '../src/extension';

import { Recorder } from "../src/recorder";

var findActiveWindow = require("mac-active-window")
    .findActiveWindow as (number) => Promise<{ location: any }>;


// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});

suite("Recorder Tests", () => {
    test.skip("Should record", (done) => {
        let rc = new Recorder();
        rc.startRecord(5000, { x: 100, y: 100, width: 100, height: 100 } );
        rc.on("finish", (file) => {
            done();
        });
    });
    
    test("Should get location", (done) => {
        console.log(process.pid);
        findActiveWindow(process.pid).then(rs => {
            console.log(rs);
            done();
        });
    });
});
