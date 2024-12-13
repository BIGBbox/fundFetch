// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands, window, workspace } from 'vscode';
import Provider from './data/Provider';
import { fundHandle } from './data/Handle';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let interval: NodeJS.Timeout;
let provider: Provider;


function getIntervalTime() {
	let intervalTime = vscode.workspace.getConfiguration().get('fund-watch.interval', 2);
	if (intervalTime < 2) {
		intervalTime = 2;
	}
	return intervalTime;
}


function setupInterval() {
	const intervalTime = getIntervalTime();

	if (interval) {
		clearInterval(interval);
	}

	interval = setInterval(() => {
		fundHandle.getFavorites()
		provider.refresh();
	}, intervalTime * 1000);
}

export function activate(context: vscode.ExtensionContext) {


	let intervalTime = workspace.getConfiguration().get('fund-watch.interval', 2)
	if (intervalTime < 2) {
		intervalTime = 2
	}
	// 基金类
	provider = new Provider()

	// 数据注册
	window.registerTreeDataProvider('fund-list', provider)

	// 监听配置变化，动态更新定时器间隔
	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('fund-watch.interval')) {
			setupInterval();
		}
		if (e.affectsConfiguration('fund-watch.showUpdateTime')) {
			provider.refresh()
		}
	});

	// 定时任务
	setupInterval();

	// menu 事件
	context.subscriptions.push(
		commands.registerCommand(`fund.add`, () => {
			provider.addFund()
		}),
		commands.registerCommand(`fund.order`, () => {
			provider.changeOrder()
		}),
		commands.registerCommand(`fund.refresh`, () => {
			provider.refresh()
		}),
		commands.registerCommand('fund.item.remove', (fund) => {
			const { code } = fund
			fundHandle.removeConfig(code)
			provider.refresh()
		}),
		commands.registerCommand('fund.item.click', (fund) => {
			// const { code } = fund
			console.log('click item', fund)
		})
	)
}

// This method is called when your extension is deactivated
export function deactivate() {
	clearInterval(interval);
}
