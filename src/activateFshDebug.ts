import { ChildProcess } from 'child_process';
import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken, Diagnostic } from 'vscode';
import { FileAccessor } from './fshRuntime';
import { SushiRunner } from './sushiRunner';


export function activateMockDebug(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory) {

	// when debugger startet, program gets registered -> here we go with sushi and analyze the file
	context.subscriptions.push(vscode.commands.registerCommand('extension.fsh-validator.getProgramName', config => {

		var f = vscode.window.activeTextEditor?.document.uri;
		let diagnosticCollection: vscode.DiagnosticCollection;
		// array per file in Map (aka. folder)
		let diagnostics: Array<vscode.Diagnostic> = Array();
		vscode.window.showInformationMessage('Hallo Robert, du hast F5 gedrückt');

		diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');

		// 1. run sushi
		console.info('### run some sushi Resources');
		var sushi = new SushiRunner();
		sushi.runSushi();

		// 2. filter sushi errors
		console.info('### IF sushi error then ADD problem');
		if (f) {
			if (sushi.sushiError.length > 0) {
				for (var err of sushi.sushiError) {
					let range = new vscode.Range(4, 0, 4, 100);
					let d = new Diagnostic(range, err.toString() , vscode.DiagnosticSeverity.Error);

					diagnostics.push(d);
				}
			}

			if (sushi.sushiWarn.length > 0) {
				for (var warn of sushi.sushiWarn) {
					let range = new vscode.Range(1, 2, 1, 6);
					let d = new Diagnostic(range, warn.toString() , vscode.DiagnosticSeverity.Warning);

					diagnostics.push(d);
				}
			}

			if (sushi.sushiInfo.length > 0) {
				for (var info of sushi.sushiInfo) {
					let d = new Diagnostic(new vscode.Range(0, 0, 0, 0), info.toString() , vscode.DiagnosticSeverity.Information);

					diagnostics.push(d);
				}
			}

			diagnosticCollection.set(f, diagnostics);
		}

		// now maybe exit?


		// 3. run validator
		console.info('### RUN hapi validator for dedicated sushi-output-file '+ f + '.JSON');

		// 4. filter HAPI validation errors
		console.info('### IF validation error then ADD more problems');


	}));

	// register a configuration provider for 'mock' debug type
	const provider = new MockConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', provider));

	// register a dynamic configuration provider for 'mock' debug type
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', {
		provideDebugConfigurations(folder: WorkspaceFolder | undefined): ProviderResult<DebugConfiguration[]> {
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

		provideInlineValues(document: vscode.TextDocument, viewport: vscode.Range, context: vscode.InlineValueContext) : vscode.ProviderResult<vscode.InlineValue[]> {

			const allValues: vscode.InlineValue[] = [];

			for (let l = viewport.start.line; l <= context.stoppedLocation.end.line; l++) {
				const line = document.lineAt(l);
				var regExp = /\$([a-z][a-z0-9]*)/ig;	// variables are words starting with '$'
				do {
					var m = regExp.exec(line.text);
					if (m) {
						const varName = m[1];
						const varRange = new vscode.Range(l, m.index, l, m.index + varName.length);

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

class MockConfigurationProvider implements vscode.DebugConfigurationProvider {

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		if (!config.program) {
			return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
				return undefined;	// abort launch
			});
		}

		return config;
	}
}

export const workspaceFileAccessor: FileAccessor = {
	isWindows: false,
	async readFile(path: string): Promise<Uint8Array> {
		let uri: vscode.Uri;
		try {
			uri = pathToUri(path);
		} catch (e) {
			return new TextEncoder().encode(`cannot read '${path}'`);
		}

		return await vscode.workspace.fs.readFile(uri);
	},
	async writeFile(path: string, contents: Uint8Array) {
		await vscode.workspace.fs.writeFile(pathToUri(path), contents);
	}
};

function pathToUri(path: string) {
	try {
		return vscode.Uri.file(path);
	} catch (e) {
		return vscode.Uri.parse(path);
	}
}

