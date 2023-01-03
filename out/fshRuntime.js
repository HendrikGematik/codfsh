"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRuntime = exports.timeout = exports.RuntimeVariable = void 0;
var events_1 = require("events");
var RuntimeVariable = /** @class */ (function () {
    function RuntimeVariable(name, _value) {
        this.name = name;
        this._value = _value;
    }
    Object.defineProperty(RuntimeVariable.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this._memory = undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RuntimeVariable.prototype, "memory", {
        get: function () {
            if (this._memory === undefined && typeof this._value === 'string') {
                this._memory = new TextEncoder().encode(this._value);
            }
            return this._memory;
        },
        enumerable: false,
        configurable: true
    });
    RuntimeVariable.prototype.setMemory = function (data, offset) {
        if (offset === void 0) { offset = 0; }
        var memory = this.memory;
        if (!memory) {
            return;
        }
        memory.set(data, offset);
        this._memory = memory;
        this._value = new TextDecoder().decode(memory);
    };
    return RuntimeVariable;
}());
exports.RuntimeVariable = RuntimeVariable;
function timeout(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.timeout = timeout;
/**
 * A Mock runtime with minimal debugger functionality.
 * MockRuntime is a hypothetical (aka "Mock") "execution engine with debugging support":
 * it takes a Markdown (*.md) file and "executes" it by "running" through the text lines
 * and searching for "command" patterns that trigger some debugger related functionality (e.g. exceptions).
 * When it finds a command it typically emits an event.
 * The runtime can not only run through the whole file but also executes one line at a time
 * and stops on lines for which a breakpoint has been registered. This functionality is the
 * core of the "debugging support".
 * Since the MockRuntime is completely independent from VS Code or the Debug Adapter Protocol,
 * it can be viewed as a simplified representation of a real "execution engine" (e.g. node.js)
 * or debugger (e.g. gdb).
 * When implementing your own debugger extension for VS Code, you probably don't need this
 * class because you can rely on some existing debugger or runtime.
 */
var MockRuntime = /** @class */ (function (_super) {
    __extends(MockRuntime, _super);
    function MockRuntime(fileAccessor) {
        var _this = _super.call(this) || this;
        _this.fileAccessor = fileAccessor;
        // the initial (and one and only) file we are 'debugging'
        _this._sourceFile = '';
        _this.variables = new Map();
        // the contents (= lines) of the one and only file
        _this.sourceLines = [];
        _this.instructions = [];
        _this.starts = [];
        _this.ends = [];
        // This is the next line that will be 'executed'
        _this._currentLine = 0;
        // This is the next instruction that will be 'executed'
        _this.instruction = 0;
        // maps from sourceFile to array of IRuntimeBreakpoint
        _this.breakPoints = new Map();
        // all instruction breakpoint addresses
        _this.instructionBreakpoints = new Set();
        // since we want to send breakpoint events, we will assign an id to every event
        // so that the frontend can match events with breakpoints.
        _this.breakpointId = 1;
        _this.breakAddresses = new Map();
        _this.otherExceptions = false;
        return _this;
    }
    Object.defineProperty(MockRuntime.prototype, "sourceFile", {
        get: function () {
            return this._sourceFile;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MockRuntime.prototype, "currentLine", {
        get: function () {
            return this._currentLine;
        },
        set: function (x) {
            this._currentLine = x;
            this.instruction = this.starts[x];
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Start executing the given program.
     */
    MockRuntime.prototype.start = function (program, stopOnEntry, debug) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadSource(this.normalizePathAndCasing(program))];
                    case 1:
                        _a.sent();
                        if (!debug) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.verifyBreakpoints(this._sourceFile)];
                    case 2:
                        _a.sent();
                        if (stopOnEntry) {
                            this.findNextStatement(false, 'stopOnEntry');
                        }
                        else {
                            // we just start to run until we hit a breakpoint, an exception, or the end of the program
                            this.continue(false);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        this.continue(false);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Continue execution to the end/beginning.
     */
    MockRuntime.prototype.continue = function (reverse) {
        while (!this.executeLine(this.currentLine, reverse)) {
            if (this.updateCurrentLine(reverse)) {
                break;
            }
            if (this.findNextStatement(reverse)) {
                break;
            }
        }
    };
    /**
     * Step to the next/previous non empty line.
     */
    MockRuntime.prototype.step = function (instruction, reverse) {
        if (instruction) {
            if (reverse) {
                this.instruction--;
            }
            else {
                this.instruction++;
            }
            this.sendEvent('stopOnStep');
        }
        else {
            if (!this.executeLine(this.currentLine, reverse)) {
                if (!this.updateCurrentLine(reverse)) {
                    this.findNextStatement(reverse, 'stopOnStep');
                }
            }
        }
    };
    MockRuntime.prototype.updateCurrentLine = function (reverse) {
        if (reverse) {
            if (this.currentLine > 0) {
                this.currentLine--;
            }
            else {
                // no more lines: stop at first line
                this.currentLine = 0;
                this.currentColumn = undefined;
                this.sendEvent('stopOnEntry');
                return true;
            }
        }
        else {
            if (this.currentLine < this.sourceLines.length - 1) {
                this.currentLine++;
            }
            else {
                // no more lines: run to end
                this.currentColumn = undefined;
                this.sendEvent('end');
                return true;
            }
        }
        return false;
    };
    /**
     * "Step into" for Mock debug means: go to next character
     */
    MockRuntime.prototype.stepIn = function (targetId) {
        if (typeof targetId === 'number') {
            this.currentColumn = targetId;
            this.sendEvent('stopOnStep');
        }
        else {
            if (typeof this.currentColumn === 'number') {
                if (this.currentColumn <= this.sourceLines[this.currentLine].length) {
                    this.currentColumn += 1;
                }
            }
            else {
                this.currentColumn = 1;
            }
            this.sendEvent('stopOnStep');
        }
    };
    /**
     * "Step out" for Mock debug means: go to previous character
     */
    MockRuntime.prototype.stepOut = function () {
        if (typeof this.currentColumn === 'number') {
            this.currentColumn -= 1;
            if (this.currentColumn === 0) {
                this.currentColumn = undefined;
            }
        }
        this.sendEvent('stopOnStep');
    };
    MockRuntime.prototype.getStepInTargets = function (frameId) {
        var line = this.getLine();
        var words = this.getWords(this.currentLine, line);
        // return nothing if frameId is out of range
        if (frameId < 0 || frameId >= words.length) {
            return [];
        }
        var _a = words[frameId], name = _a.name, index = _a.index;
        // make every character of the frame a potential "step in" target
        return name.split('').map(function (c, ix) {
            return {
                id: index + ix,
                label: "target: ".concat(c)
            };
        });
    };
    /**
     * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
     */
    MockRuntime.prototype.stack = function (startFrame, endFrame) {
        var line = this.getLine();
        var words = this.getWords(this.currentLine, line);
        words.push({ name: 'BOTTOM', line: -1, index: -1 }); // add a sentinel so that the stack is never empty...
        // if the line contains the word 'disassembly' we support to "disassemble" the line by adding an 'instruction' property to the stackframe
        var instruction = line.indexOf('disassembly') >= 0 ? this.instruction : undefined;
        var column = typeof this.currentColumn === 'number' ? this.currentColumn : undefined;
        var frames = [];
        // every word of the current line becomes a stack frame.
        for (var i = startFrame; i < Math.min(endFrame, words.length); i++) {
            var stackFrame = {
                index: i,
                name: "".concat(words[i].name, "(").concat(i, ")"),
                file: this._sourceFile,
                line: this.currentLine,
                column: column,
                instruction: instruction
            };
            frames.push(stackFrame);
        }
        return {
            frames: frames,
            count: words.length
        };
    };
    /*
     * Determine possible column breakpoint positions for the given line.
     * Here we return the start location of words with more than 8 characters.
     */
    MockRuntime.prototype.getBreakpoints = function (path, line) {
        return this.getWords(line, this.getLine(line)).filter(function (w) { return w.name.length > 8; }).map(function (w) { return w.index; });
    };
    /*
     * Set breakpoint in file with given line.
     */
    MockRuntime.prototype.setBreakPoint = function (path, line) {
        return __awaiter(this, void 0, void 0, function () {
            var bp, bps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = this.normalizePathAndCasing(path);
                        bp = { verified: false, line: line, id: this.breakpointId++ };
                        bps = this.breakPoints.get(path);
                        if (!bps) {
                            bps = new Array();
                            this.breakPoints.set(path, bps);
                        }
                        bps.push(bp);
                        return [4 /*yield*/, this.verifyBreakpoints(path)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, bp];
                }
            });
        });
    };
    /*
     * Clear breakpoint in file with given line.
     */
    MockRuntime.prototype.clearBreakPoint = function (path, line) {
        var bps = this.breakPoints.get(this.normalizePathAndCasing(path));
        if (bps) {
            var index = bps.findIndex(function (bp) { return bp.line === line; });
            if (index >= 0) {
                var bp = bps[index];
                bps.splice(index, 1);
                return bp;
            }
        }
        return undefined;
    };
    MockRuntime.prototype.clearBreakpoints = function (path) {
        this.breakPoints.delete(this.normalizePathAndCasing(path));
    };
    MockRuntime.prototype.setDataBreakpoint = function (address, accessType) {
        var x = accessType === 'readWrite' ? 'read write' : accessType;
        var t = this.breakAddresses.get(address);
        if (t) {
            if (t !== x) {
                this.breakAddresses.set(address, 'read write');
            }
        }
        else {
            this.breakAddresses.set(address, x);
        }
        return true;
    };
    MockRuntime.prototype.clearAllDataBreakpoints = function () {
        this.breakAddresses.clear();
    };
    MockRuntime.prototype.setExceptionsFilters = function (namedException, otherExceptions) {
        this.namedException = namedException;
        this.otherExceptions = otherExceptions;
    };
    MockRuntime.prototype.setInstructionBreakpoint = function (address) {
        this.instructionBreakpoints.add(address);
        return true;
    };
    MockRuntime.prototype.clearInstructionBreakpoints = function () {
        this.instructionBreakpoints.clear();
    };
    MockRuntime.prototype.getGlobalVariables = function (cancellationToken) {
        return __awaiter(this, void 0, void 0, function () {
            var a, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        a = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 10)) return [3 /*break*/, 4];
                        a.push(new RuntimeVariable("global_".concat(i), i));
                        if (cancellationToken && cancellationToken()) {
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, timeout(1000)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, a];
                }
            });
        });
    };
    MockRuntime.prototype.getLocalVariables = function () {
        return Array.from(this.variables, function (_a) {
            var name = _a[0], value = _a[1];
            return value;
        });
    };
    MockRuntime.prototype.getLocalVariable = function (name) {
        return this.variables.get(name);
    };
    /**
     * Return words of the given address range as "instructions"
     */
    MockRuntime.prototype.disassemble = function (address, instructionCount) {
        var instructions = [];
        for (var a = address; a < address + instructionCount; a++) {
            if (a >= 0 && a < this.instructions.length) {
                instructions.push({
                    address: a,
                    instruction: this.instructions[a].name,
                    line: this.instructions[a].line
                });
            }
            else {
                instructions.push({
                    address: a,
                    instruction: 'nop'
                });
            }
        }
        return instructions;
    };
    // private methods
    MockRuntime.prototype.getLine = function (line) {
        return this.sourceLines[line === undefined ? this.currentLine : line].trim();
    };
    MockRuntime.prototype.getWords = function (l, line) {
        // break line into words
        var WORD_REGEXP = /[a-z]+/ig;
        var words = [];
        var match;
        while (match = WORD_REGEXP.exec(line)) {
            words.push({ name: match[0], line: l, index: match.index });
        }
        return words;
    };
    MockRuntime.prototype.loadSource = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this._sourceFile !== file)) return [3 /*break*/, 2];
                        this._sourceFile = this.normalizePathAndCasing(file);
                        _a = this.initializeContents;
                        return [4 /*yield*/, this.fileAccessor.readFile(file)];
                    case 1:
                        _a.apply(this, [_b.sent()]);
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    MockRuntime.prototype.initializeContents = function (memory) {
        this.sourceLines = new TextDecoder().decode(memory).split(/\r?\n/);
        this.instructions = [];
        this.starts = [];
        this.instructions = [];
        this.ends = [];
        for (var l = 0; l < this.sourceLines.length; l++) {
            this.starts.push(this.instructions.length);
            var words = this.getWords(l, this.sourceLines[l]);
            for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                var word = words_1[_i];
                this.instructions.push(word);
            }
            this.ends.push(this.instructions.length);
        }
    };
    /**
     * return true on stop
     */
    MockRuntime.prototype.findNextStatement = function (reverse, stepEvent) {
        var _loop_1 = function (ln) {
            // is there a source breakpoint?
            var breakpoints = this_1.breakPoints.get(this_1._sourceFile);
            if (breakpoints) {
                var bps = breakpoints.filter(function (bp) { return bp.line === ln; });
                if (bps.length > 0) {
                    // send 'stopped' event
                    this_1.sendEvent('stopOnBreakpoint');
                    // the following shows the use of 'breakpoint' events to update properties of a breakpoint in the UI
                    // if breakpoint is not yet verified, verify it now and send a 'breakpoint' update event
                    if (!bps[0].verified) {
                        bps[0].verified = true;
                        this_1.sendEvent('breakpointValidated', bps[0]);
                    }
                    this_1.currentLine = ln;
                    return { value: true };
                }
            }
            var line = this_1.getLine(ln);
            if (line.length > 0) {
                this_1.currentLine = ln;
                return "break";
            }
        };
        var this_1 = this;
        for (var ln = this.currentLine; reverse ? ln >= 0 : ln < this.sourceLines.length; reverse ? ln-- : ln++) {
            var state_1 = _loop_1(ln);
            if (typeof state_1 === "object")
                return state_1.value;
            if (state_1 === "break")
                break;
        }
        if (stepEvent) {
            this.sendEvent(stepEvent);
            return true;
        }
        return false;
    };
    /**
     * "execute a line" of the readme markdown.
     * Returns true if execution sent out a stopped event and needs to stop.
     */
    MockRuntime.prototype.executeLine = function (ln, reverse) {
        // first "execute" the instructions associated with this line and potentially hit instruction breakpoints
        while (reverse ? this.instruction >= this.starts[ln] : this.instruction < this.ends[ln]) {
            reverse ? this.instruction-- : this.instruction++;
            if (this.instructionBreakpoints.has(this.instruction)) {
                this.sendEvent('stopOnInstructionBreakpoint');
                return true;
            }
        }
        var line = this.getLine(ln);
        // find variable accesses
        var reg0 = /\$([a-z][a-z0-9]*)(=(false|true|[0-9]+(\.[0-9]+)?|\".*\"|\{.*\}))?/ig;
        var matches0;
        while (matches0 = reg0.exec(line)) {
            if (matches0.length === 5) {
                var access = void 0;
                var name_1 = matches0[1];
                var value = matches0[3];
                var v = new RuntimeVariable(name_1, value);
                if (value && value.length > 0) {
                    if (value === 'true') {
                        v.value = true;
                    }
                    else if (value === 'false') {
                        v.value = false;
                    }
                    else if (value[0] === '"') {
                        v.value = value.slice(1, -1);
                    }
                    else if (value[0] === '{') {
                        v.value = [
                            new RuntimeVariable('fBool', true),
                            new RuntimeVariable('fInteger', 123),
                            new RuntimeVariable('fString', 'hello'),
                            new RuntimeVariable('flazyInteger', 321)
                        ];
                    }
                    else {
                        v.value = parseFloat(value);
                    }
                    if (this.variables.has(name_1)) {
                        // the first write access to a variable is the "declaration" and not a "write access"
                        access = 'write';
                    }
                    this.variables.set(name_1, v);
                }
                else {
                    if (this.variables.has(name_1)) {
                        // variable must exist in order to trigger a read access
                        access = 'read';
                    }
                }
                var accessType = this.breakAddresses.get(name_1);
                if (access && accessType && accessType.indexOf(access) >= 0) {
                    this.sendEvent('stopOnDataBreakpoint', access);
                    return true;
                }
            }
        }
        // if 'log(...)' found in source -> send argument to debug console
        var reg1 = /(log|prio|out|err)\(([^\)]*)\)/g;
        var matches1;
        while (matches1 = reg1.exec(line)) {
            if (matches1.length === 3) {
                this.sendEvent('output', matches1[1], matches1[2], this._sourceFile, ln, matches1.index);
            }
        }
        // if pattern 'exception(...)' found in source -> throw named exception
        var matches2 = /exception\((.*)\)/.exec(line);
        if (matches2 && matches2.length === 2) {
            var exception = matches2[1].trim();
            if (this.namedException === exception) {
                this.sendEvent('stopOnException', exception);
                return true;
            }
            else {
                if (this.otherExceptions) {
                    this.sendEvent('stopOnException', undefined);
                    return true;
                }
            }
        }
        else {
            // if word 'exception' found in source -> throw exception
            if (line.indexOf('exception') >= 0) {
                if (this.otherExceptions) {
                    this.sendEvent('stopOnException', undefined);
                    return true;
                }
            }
        }
        // nothing interesting found -> continue
        return false;
    };
    MockRuntime.prototype.verifyBreakpoints = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var bps;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bps = this.breakPoints.get(path);
                        if (!bps) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadSource(path)];
                    case 1:
                        _a.sent();
                        bps.forEach(function (bp) {
                            if (!bp.verified && bp.line < _this.sourceLines.length) {
                                var srcLine = _this.getLine(bp.line);
                                // if a line is empty or starts with '+' we don't allow to set a breakpoint but move the breakpoint down
                                if (srcLine.length === 0 || srcLine.indexOf('+') === 0) {
                                    bp.line++;
                                }
                                // if a line starts with '-' we don't allow to set a breakpoint but move the breakpoint up
                                if (srcLine.indexOf('-') === 0) {
                                    bp.line--;
                                }
                                // don't set 'verified' to true if the line contains the word 'lazy'
                                // in this case the breakpoint will be verified 'lazy' after hitting it once.
                                if (srcLine.indexOf('lazy') < 0) {
                                    bp.verified = true;
                                    _this.sendEvent('breakpointValidated', bp);
                                }
                            }
                        });
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    MockRuntime.prototype.sendEvent = function (event) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        setTimeout(function () {
            _this.emit.apply(_this, __spreadArray([event], args, false));
        }, 0);
    };
    MockRuntime.prototype.normalizePathAndCasing = function (path) {
        if (this.fileAccessor.isWindows) {
            return path.replace(/\//g, '\\').toLowerCase();
        }
        else {
            return path.replace(/\\/g, '/');
        }
    };
    return MockRuntime;
}(events_1.EventEmitter));
exports.MockRuntime = MockRuntime;
//# sourceMappingURL=fshRuntime.js.map