import * as vscode from 'vscode';

const API_URL = 'https://pastebin.com/api/api_post.php';

function upload_to_pastebin(expire: string) {
	const API_KEY: string | undefined = vscode.workspace.getConfiguration().get("uploadertopastebin.api_key");

		if (API_KEY === undefined || API_KEY === "") {
			const header = "API key didn't set";
			const options: vscode.MessageOptions = { detail: "Please, set your API key in settings", modal: true};
			const ok: vscode.MessageItem = {title: "OK",  isCloseAffordance: true };
			vscode.window.showInformationMessage(header, options, ok);
			return;
		}

		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		const programming_language = editor?.document?.languageId ?? "text";

		if (selection === undefined || selection.isEmpty) {	
			vscode.window.showInformationMessage("Sorry, I can't paste empty selection");
			return;
		}

		const selectionRange = new vscode.Range(selection?.start, selection?.end);
		const highlighted = editor?.document.getText(selectionRange);

		const content = {
			'api_dev_key': API_KEY,
			'api_paste_code': String(highlighted),
			'api_option': 'paste',
			'api_paste_format': programming_language,
			'api_paste_expire_date': expire
		};

		fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: new URLSearchParams(content).toString(),
		}).then((response) => {
			response.text().then((response_text) => {
				if (response.status !== 200) {
					const header = "Some errors occurred";
					const options: vscode.MessageOptions = { detail: response_text, modal: true};
					const ok: vscode.MessageItem = {title: "OK",  isCloseAffordance: true };
					vscode.window.showInformationMessage(header, options, ok);
				} else {
					vscode.env.clipboard.writeText(response_text);
					const output_to_user = 'Code is uploaded, link at clipboard';
					vscode.window.showInformationMessage(output_to_user);
				}
			});
		});
}

export function activate(context: vscode.ExtensionContext) {

	let expire_never = vscode.commands.registerCommand('uploadertopastebin.uploadcode', () => {
		upload_to_pastebin('N');
	});

	let expire_in_hour = vscode.commands.registerCommand('uploadertopastebin.uploadcode_1h', () => {
		upload_to_pastebin('1H');
	});

	let expire_in_day = vscode.commands.registerCommand('uploadertopastebin.uploadcode_1d', () => {
		upload_to_pastebin('1D');
	});

	let expire_in_week = vscode.commands.registerCommand('uploadertopastebin.uploadcode_1w', () => {
		upload_to_pastebin('1W');
	});

	context.subscriptions.push(expire_never, expire_in_hour, expire_in_day, expire_in_week);
}

// This method is called when your extension is deactivated
export function deactivate() {}
