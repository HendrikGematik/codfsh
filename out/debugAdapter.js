"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
/*
 * debugAdapter.js is the entrypoint of the debug adapter when it runs as a separate process.
 */
/*
 * Since here we run the debug adapter as a separate ("external") process, it has no access to VS Code API.
 * So we can only use node.js API for accessing files.
 */
var fsAccessor = {
    isWindows: process.platform === 'win32',
    readFile: function (path) {
        return fs_1.promises.readFile(path);
    },
    writeFile: function (path, contents) {
        return fs_1.promises.writeFile(path, contents);
    }
};
//# sourceMappingURL=debugAdapter.js.map