
export class SushiWrapper {
    public async getConsoleOutput(fshFilePath: string) : Promise<string>  {
        return new Promise((resolve, reject) => {
            this.getRessourcePath(fshFilePath).then((ressourcesFolderPath) => {
                resolve(this.execShellCommand("sushi " + ressourcesFolderPath));
            }).catch((error) => {
                reject(error);
            });
        });
    }
    
     private getRessourcePath(fshFilePath:string): Promise<string> {
        return new Promise((resolve, reject) => {
            var resPath = this.searchRessourcePath(fshFilePath, '/input/fsh');
            if(this.isValidPath(resPath)){
                resolve(resPath);
            }
            resPath = this.searchRessourcePath(fshFilePath, '/_preprocessed');
            if(this.isValidPath(resPath)){
                resolve(resPath);
            }
            reject(new Error("Unable to find folder structure expected by SUSHI for a FSH project"));
        });
    }

    private searchRessourcePath(fshFilePath: string, input: string) {
        var resPath = fshFilePath.split(input)[0];
        if (resPath[0] === "/") {
            resPath = resPath.substring(1);
        }
        return resPath;
    }

    private isValidPath(resPath: string): boolean {
        console.log(resPath)
        if(resPath.split('/').pop() === "Resources"){
            return true;
        }
        return false;
    }

    private execShellCommand(cmd: string) : Promise<string>{
        const exec = require('child_process').exec;
        return new Promise((resolve, reject) => {
            exec(cmd, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.log(error);
                //reject(new Error(error));
            }
            resolve(stdout);
            });
        });
    }
}
