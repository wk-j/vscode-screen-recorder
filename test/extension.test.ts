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

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});

suite("Recorder Tests", () => {
    test("Should record", (done) => {
        let rc = new Recorder();
        rc.startRecord(5000);
        rc.on("finish", (file) => {
            assert.equal("", file);
            done();
        });
    });
});
