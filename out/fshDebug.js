"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*
 * mockDebug.ts implements the Debug Adapter that "adapts" or translates the Debug Adapter Protocol (DAP) used by the client (e.g. VS Code)
 * into requests and events of the real "execution engine" or "debugger" (here: class MockRuntime).
 * When implementing your own debugger extension for VS Code, most of the work will go into the Debug Adapter.
 * Since the Debug Adapter is independent from VS Code, it can be used in any client (IDE) supporting the Debug Adapter Protocol.
 *
 * The most important class of the Debug Adapter is the MockDebugSession which implements many DAP requests by talking to the MockRuntime.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.MockDebugSession = void 0;
var debugadapter_1 = require("@vscode/debugadapter");
var path_browserify_1 = require("path-browserify");
var fshRuntime_1 = require("./fshRuntime");
var await_notify_1 = require("await-notify");
var MockDebugSession = /** @class */ (function (_super) {
    __extends(MockDebugSession, _super);
    /**
     * Creates a new debug adapter that is used for one debug session.
     * We configure the default implementation of a debug adapter here.
     */
    function MockDebugSession(fileAccessor) {
        var _this = _super.call(this, "fsh-validator.txt") || this;
        _this._configurationDone = new await_notify_1.Subject();
        _this._cancellationTokens = new Map();
        // this debugger uses zero-based lines and columns
        _this.setDebuggerLinesStartAt1(false);
        _this.setDebuggerColumnsStartAt1(false);
        _this._runtime = new fshRuntime_1.MockRuntime(fileAccessor);
        // setup event handlers
        _this._runtime.on('stopOnEntry', function () {
            _this.sendEvent(new debugadapter_1.StoppedEvent('entry', MockDebugSession.threadID));
        });
        _this._runtime.on('stopOnStep', function () {
            _this.sendEvent(new debugadapter_1.StoppedEvent('step', MockDebugSession.threadID));
        });
        _this._runtime.on('stopOnBreakpoint', function () {
            _this.sendEvent(new debugadapter_1.StoppedEvent('breakpoint', MockDebugSession.threadID));
        });
        _this._runtime.on('stopOnDataBreakpoint', function () {
            _this.sendEvent(new debugadapter_1.StoppedEvent('data breakpoint', MockDebugSession.threadID));
        });
        _this._runtime.on('stopOnInstructionBreakpoint', function () {
            _this.sendEvent(new debugadapter_1.StoppedEvent('instruction breakpoint', MockDebugSession.threadID));
        });
        _this._runtime.on('stopOnException', function (exception) {
            if (exception) {
                _this.sendEvent(new debugadapter_1.StoppedEvent("exception(".concat(exception, ")"), MockDebugSession.threadID));
            }
            else {
                _this.sendEvent(new debugadapter_1.StoppedEvent('exception', MockDebugSession.threadID));
            }
        });
        _this._runtime.on('breakpointValidated', function (bp) {
            _this.sendEvent(new debugadapter_1.BreakpointEvent('changed', { verified: bp.verified, id: bp.id }));
        });
        _this._runtime.on('output', function (type, text, filePath, line, column) {
            var category;
            switch (type) {
                case 'prio':
                    category = 'important';
                    break;
                case 'out':
                    category = 'stdout';
                    break;
                case 'err':
                    category = 'stderr';
                    break;
                default:
                    category = 'console';
                    break;
            }
            var e = new debugadapter_1.OutputEvent("".concat(text, "\n"), category);
            if (text === 'start' || text === 'startCollapsed' || text === 'end') {
                e.body.group = text;
                e.body.output = "group-".concat(text, "\n");
            }
            e.body.source = _this.createSource(filePath);
            e.body.line = _this.convertDebuggerLineToClient(line);
            e.body.column = _this.convertDebuggerColumnToClient(column);
            _this.sendEvent(e);
        });
        _this._runtime.on('end', function () {
            _this.sendEvent(new debugadapter_1.TerminatedEvent());
        });
        return _this;
    }
    /**
     * The 'initialize' request is the first request called by the frontend
     * to interrogate the features the debug adapter provides.
     */
    MockDebugSession.prototype.initializeRequest = function (response, args) {
        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};
        // the adapter implements the configurationDone request.
        response.body.supportsConfigurationDoneRequest = true;
        // make VS Code use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true;
        // make VS Code show a 'step back' button
        response.body.supportsStepBack = true;
        // make VS Code support data breakpoints
        response.body.supportsDataBreakpoints = true;
        // make VS Code support completion in REPL
        response.body.supportsCompletionsRequest = true;
        response.body.completionTriggerCharacters = [".", "["];
        // make VS Code send cancel request
        response.body.supportsCancelRequest = true;
        // make VS Code send the breakpointLocations request
        response.body.supportsBreakpointLocationsRequest = true;
        // make VS Code provide "Step in Target" functionality
        response.body.supportsStepInTargetsRequest = true;
        // the adapter defines two exceptions filters, one with support for conditions.
        response.body.supportsExceptionFilterOptions = true;
        response.body.exceptionBreakpointFilters = [
            {
                filter: 'namedException',
                label: "Named Exception",
                description: "Break on named exceptions. Enter the exception's name as the Condition.",
                default: false,
                supportsCondition: true,
                conditionDescription: "Enter the exception's name"
            },
            {
                filter: 'otherExceptions',
                label: "Other Exceptions",
                description: 'This is a other exception',
                default: true,
                supportsCondition: false
            }
        ];
        // make VS Code send exceptionInfo request
        response.body.supportsExceptionInfoRequest = true;
        // make VS Code send setVariable request
        response.body.supportsSetVariable = true;
        // make VS Code send setExpression request
        response.body.supportsSetExpression = true;
        // make VS Code send disassemble request
        response.body.supportsDisassembleRequest = true;
        response.body.supportsSteppingGranularity = true;
        response.body.supportsInstructionBreakpoints = true;
        // make VS Code able to read and write variable memory
        response.body.supportsReadMemoryRequest = true;
        response.body.supportsWriteMemoryRequest = true;
        response.body.supportSuspendDebuggee = true;
        response.body.supportTerminateDebuggee = true;
        response.body.supportsFunctionBreakpoints = true;
        response.body.supportsDelayedStackTraceLoading = true;
        this.sendResponse(response);
        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new debugadapter_1.InitializedEvent());
    };
    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
     */
    MockDebugSession.prototype.configurationDoneRequest = function (response, args) {
        _super.prototype.configurationDoneRequest.call(this, response, args);
        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    };
    MockDebugSession.prototype.disconnectRequest = function (response, args, request) {
        console.log("disconnectRequest suspend: ".concat(args.suspendDebuggee, ", terminate: ").concat(args.terminateDebuggee));
    };
    MockDebugSession.prototype.attachRequest = function (response, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.launchRequest(response, args)];
            });
        });
    };
    MockDebugSession.prototype.launchRequest = function (response, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // make sure to 'Stop' the buffered logging if 'trace' is not set
                        debugadapter_1.logger.setup(args.trace ? debugadapter_1.Logger.LogLevel.Verbose : debugadapter_1.Logger.LogLevel.Stop, false);
                        // wait 1 second until configuration has finished (and configurationDoneRequest has been called)
                        return [4 /*yield*/, this._configurationDone.wait(1000)];
                    case 1:
                        // wait 1 second until configuration has finished (and configurationDoneRequest has been called)
                        _a.sent();
                        // start the program in the runtime
                        return [4 /*yield*/, this._runtime.start(args.program, !!args.stopOnEntry, !args.noDebug)];
                    case 2:
                        // start the program in the runtime
                        _a.sent();
                        if (args.compileError) {
                            // simulate a compile/build error in "launch" request:
                            // the error should not result in a modal dialog since 'showUser' is set to false.
                            // A missing 'showUser' should result in a modal dialog.
                            this.sendErrorResponse(response, {
                                id: 1001,
                                format: "compile error: some fake error.",
                                showUser: args.compileError === 'show' ? true : (args.compileError === 'hide' ? false : undefined)
                            });
                        }
                        else {
                            this.sendResponse(response);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MockDebugSession.prototype.setFunctionBreakPointsRequest = function (response, args, request) {
        this.sendResponse(response);
    };
    MockDebugSession.prototype.setBreakPointsRequest = function (response, args) {
        return __awaiter(this, void 0, void 0, function () {
            var path, clientLines, actualBreakpoints0, actualBreakpoints;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = args.source.path;
                        clientLines = args.lines || [];
                        // clear all breakpoints for this file
                        this._runtime.clearBreakpoints(path);
                        actualBreakpoints0 = clientLines.map(function (l) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, verified, line, id, bp;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(l))];
                                    case 1:
                                        _a = _b.sent(), verified = _a.verified, line = _a.line, id = _a.id;
                                        bp = new debugadapter_1.Breakpoint(verified, this.convertDebuggerLineToClient(line));
                                        bp.id = id;
                                        return [2 /*return*/, bp];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(actualBreakpoints0)];
                    case 1:
                        actualBreakpoints = _a.sent();
                        // send back the actual breakpoint positions
                        response.body = {
                            breakpoints: actualBreakpoints
                        };
                        this.sendResponse(response);
                        return [2 /*return*/];
                }
            });
        });
    };
    MockDebugSession.prototype.threadsRequest = function (response) {
        // runtime supports no threads so just return a default thread.
        response.body = {
            threads: [
                new debugadapter_1.Thread(MockDebugSession.threadID, "thread 1"),
                new debugadapter_1.Thread(MockDebugSession.threadID + 1, "thread 2"),
            ]
        };
        this.sendResponse(response);
    };
    MockDebugSession.prototype.continueRequest = function (response, args) {
        this._runtime.continue(false);
        this.sendResponse(response);
    };
    MockDebugSession.prototype.reverseContinueRequest = function (response, args) {
        this._runtime.continue(true);
        this.sendResponse(response);
    };
    MockDebugSession.prototype.nextRequest = function (response, args) {
        this._runtime.step(args.granularity === 'instruction', false);
        this.sendResponse(response);
    };
    MockDebugSession.prototype.stepBackRequest = function (response, args) {
        this._runtime.step(args.granularity === 'instruction', true);
        this.sendResponse(response);
    };
    MockDebugSession.prototype.stepInTargetsRequest = function (response, args) {
        var targets = this._runtime.getStepInTargets(args.frameId);
        response.body = {
            targets: targets.map(function (t) {
                return { id: t.id, label: t.label };
            })
        };
        this.sendResponse(response);
    };
    MockDebugSession.prototype.stepInRequest = function (response, args) {
        this._runtime.stepIn(args.targetId);
        this.sendResponse(response);
    };
    MockDebugSession.prototype.stepOutRequest = function (response, args) {
        this._runtime.stepOut();
        this.sendResponse(response);
    };
    MockDebugSession.prototype.completionsRequest = function (response, args) {
        response.body = {
            targets: [
                {
                    label: "item 10",
                    sortText: "10"
                },
                {
                    label: "item 1",
                    sortText: "01",
                    detail: "detail 1"
                },
                {
                    label: "item 2",
                    sortText: "02",
                    detail: "detail 2"
                },
                {
                    label: "array[]",
                    selectionStart: 6,
                    sortText: "03"
                },
                {
                    label: "func(arg)",
                    selectionStart: 5,
                    selectionLength: 3,
                    sortText: "04"
                }
            ]
        };
        this.sendResponse(response);
    };
    MockDebugSession.prototype.cancelRequest = function (response, args) {
        if (args.requestId) {
            this._cancellationTokens.set(args.requestId, true);
        }
    };
    MockDebugSession.prototype.createSource = function (filePath) {
        return new debugadapter_1.Source((0, path_browserify_1.basename)(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'mock-adapter-data');
    };
    // we don't support multiple threads, so we can use a hardcoded ID for the default thread
    MockDebugSession.threadID = 1;
    return MockDebugSession;
}(debugadapter_1.LoggingDebugSession));
exports.MockDebugSession = MockDebugSession;
//# sourceMappingURL=fshDebug.js.map