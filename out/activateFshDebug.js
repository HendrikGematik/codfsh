"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceFileAccessor = exports.activateMockDebug = void 0;
var vscode = require("vscode");
var vscode_1 = require("vscode");
var sushiRunner_1 = require("./sushiRunner");
function activateMockDebug(context, factory) {
    // when debugger startet, program gets registered -> here we go with sushi and analyze the file
    context.subscriptions.push(vscode.commands.registerCommand('extension.fsh-validator.getProgramName', function (config) {
        var _a;
        var f = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
        var diagnosticCollection;
        // array per file in Map (aka. folder)
        var diagnostics = Array();
        vscode.window.showInformationMessage('Hallo Robert, du hast F5 gedrückt');
        diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
        // 1. run sushi
        console.info('### run some sushi Resources');
        var sushi = new sushiRunner_1.SushiRunner();
        sushi.runSushi();
        // 2. filter sushi errors
        console.info('### IF sushi error then ADD problem');
        if (f) {
            if (sushi.sushiError.length > 0) {
                for (var _i = 0, _b = sushi.sushiError; _i < _b.length; _i++) {
                    var err = _b[_i];
                    var range = new vscode.Range(4, 0, 4, 100);
                    var d = new vscode_1.Diagnostic(range, err.toString(), vscode.DiagnosticSeverity.Error);
                    diagnostics.push(d);
                }
            }
            if (sushi.sushiWarn.length > 0) {
                for (var _c = 0, _d = sushi.sushiWarn; _c < _d.length; _c++) {
                    var warn = _d[_c];
                    var range = new vscode.Range(1, 2, 1, 6);
                    var d = new vscode_1.Diagnostic(range, warn.toString(), vscode.DiagnosticSeverity.Warning);
                    diagnostics.push(d);
                }
            }
            if (sushi.sushiInfo.length > 0) {
                for (var _e = 0, _f = sushi.sushiInfo; _e < _f.length; _e++) {
                    var info = _f[_e];
                    var d = new vscode_1.Diagnostic(new vscode.Range(0, 0, 0, 0), info.toString(), vscode.DiagnosticSeverity.Information);
                    diagnostics.push(d);
                }
            }
            diagnosticCollection.set(f, diagnostics);
        }
        // now maybe exit?
        // 3. run validator
        console.info('### RUN hapi validator for dedicated sushi-output-file ' + f + '.JSON');
        // 4. filter HAPI validation errors
        console.info('### IF validation error then ADD more problems');
    }));
    // register a configuration provider for 'mock' debug type
    var provider = new MockConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', provider));
    // register a dynamic configuration provider for 'mock' debug type
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', {
        provideDebugConfigurations: function (folder) {
            return [
                {
                    name: "Dynamic Launch",
                    request: "launch",
                    type: "mock",
                    program: "${file}"
                },
                {
                    name: "Another Dynamic Launch",
                    request: "launch",
                    type: "mock",
                    program: "${file}"
                },
                {
                    name: "Mock Launch",
                    request: "launch",
                    type: "mock",
                    program: "${file}"
                }
            ];
        }
    }, vscode.DebugConfigurationProviderTriggerKind.Dynamic));
    // override VS Code's default implementation of the "inline values" feature"
    context.subscriptions.push(vscode.languages.registerInlineValuesProvider('markdown', {
        provideInlineValues: function (document, viewport, context) {
            var allValues = [];
            for (var l = viewport.start.line; l <= context.stoppedLocation.end.line; l++) {
                var line = document.lineAt(l);
                var regExp = /\$([a-z][a-z0-9]*)/ig; // variables are words starting with '$'
                do {
                    var m = regExp.exec(line.text);
                    if (m) {
                        var varName = m[1];
                        var varRange = new vscode.Range(l, m.index, l, m.index + varName.length);
                        // some literal text
                        //allValues.push(new vscode.InlineValueText(varRange, `${varName}: ${viewport.start.line}`));
                        // value found via variable lookup
                        allValues.push(new vscode.InlineValueVariableLookup(varRange, varName, false));
                        // value determined via expression evaluation
                        //allValues.push(new vscode.InlineValueEvaluatableExpression(varRange, varName));
                    }
                } while (m);
            }
            return allValues;
        }
    }));
}
exports.activateMockDebug = activateMockDebug;
var MockConfigurationProvider = /** @class */ (function () {
    function MockConfigurationProvider() {
    }
    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    MockConfigurationProvider.prototype.resolveDebugConfiguration = function (folder, config, token) {
        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(function (_) {
                return undefined; // abort launch
            });
        }
        return config;
    };
    return MockConfigurationProvider;
}());
exports.workspaceFileAccessor = {
    isWindows: false,
    readFile: function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            uri = pathToUri(path);
                        }
                        catch (e) {
                            return [2 /*return*/, new TextEncoder().encode("cannot read '".concat(path, "'"))];
                        }
                        return [4 /*yield*/, vscode.workspace.fs.readFile(uri)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    writeFile: function (path, contents) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.fs.writeFile(pathToUri(path), contents)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
};
function pathToUri(path) {
    try {
        return vscode.Uri.file(path);
    }
    catch (e) {
        return vscode.Uri.parse(path);
    }
}
//# sourceMappingURL=activateFshDebug.js.map