import { execSync } from 'node:child_process';

export class SushiRunner {

    public sushiInfo: Array<String> = Array();
    public sushiWarn: Array<String> = Array();
    public sushiError: Array<String> = Array();

    constructor() {
    }

    public runSushi()  {

        let buf = execSync('ls');
        var sushiOutput = buf.toString();

        if (sushiOutput.length > 0) {
            let sushiResult: Array<String> = sushiOutput.split("\n");

            for (var s of sushiResult) {
                if (s.startsWith("Desktop")) {
                    this.sushiError.push("ERROR in Zeile 42, da ist was kaputt");
                } else if (s.startsWith("bin")) {
                    this.sushiWarn.push("WARNING, ich bin total unterhopft");
                } else if (s.startsWith("Documents")) {
                    this.sushiInfo.push("INFO, die 688 bitte an die 443. Die 688 bitte an die 443");
                }
            }
        }

    }

}