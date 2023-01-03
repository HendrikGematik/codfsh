"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiRunner = void 0;
var node_child_process_1 = require("node:child_process");
var SushiRunner = /** @class */ (function () {
    function SushiRunner() {
        this.sushiInfo = Array();
        this.sushiWarn = Array();
        this.sushiError = Array();
    }
    SushiRunner.prototype.runSushi = function () {
        var buf = (0, node_child_process_1.execSync)('ls');
        var sushiOutput = buf.toString();
        if (sushiOutput.length > 0) {
            var sushiResult = sushiOutput.split("\n");
            for (var _i = 0, sushiResult_1 = sushiResult; _i < sushiResult_1.length; _i++) {
                var s = sushiResult_1[_i];
                if (s.startsWith("Desktop")) {
                    this.sushiError.push("ERROR in Zeile 42, da ist was kaputt");
                }
                else if (s.startsWith("bin")) {
                    this.sushiWarn.push("WARNING, ich bin total unterhopft");
                }
                else if (s.startsWith("Documents")) {
                    this.sushiInfo.push("INFO, die 688 bitte an die 443. Die 688 bitte an die 443");
                }
            }
        }
    };
    return SushiRunner;
}());
exports.SushiRunner = SushiRunner;
//# sourceMappingURL=sushiRunner.js.map