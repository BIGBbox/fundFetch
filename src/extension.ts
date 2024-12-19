// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands, window, workspace } from 'vscode';
import Provider, { tagItem } from './data/Provider';
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
	fundHandle.updateData(()=>{
		provider.refresh();
	})
	interval = setInterval(() => {
		fundHandle.updateData(()=>{
			provider.refresh();
		})
	}, intervalTime * 1000);
}

export function activate(context: vscode.ExtensionContext) {

	fundHandle.extensionPath = context.extensionPath;
	let intervalTime = workspace.getConfiguration().get('fund-watch.interval', 2)
	if (intervalTime < 2) {
		intervalTime = 2
	}

	fundHandle.updateData(() => {
		// 基金类
		provider = new Provider()
	})



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
		if (e.affectsConfiguration('fund-watch.favoriteFunds')) {
			fundHandle.updateData(()=>{
				provider.refresh();
			})
		}
		if (e.affectsConfiguration('fund-watch.favoriteIndexs')) {
			fundHandle.updateData(()=>{
				provider.refresh();
			})
		}
	});

	// 定时任务
	setupInterval();

	// menu 事件
	context.subscriptions.push(
		commands.registerCommand(`fund.add`, (item: tagItem) => {
			provider.addFund(item.contextValue ?? "")
		}),
		commands.registerCommand(`fund.order`, () => {
			provider.changeOrder()
		}),
		commands.registerCommand(`fund.refresh`, () => {
			provider.refresh()
		}),
		commands.registerCommand('fund.item.remove', (item: tagItem) => {
			fundHandle.removeConfig(item.info.code)
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


/**
	"fund-watch.favoriteFunds":[
		"000043",
		"161128",
		"160632",
		"017436",
		"001593",
		"014855",
		"501312",
		"008888"
	],
	"fund-watch.interval":5,
	"fund-watch.showUpdateTime": 0,
	"fund-watch.favoriteIndexs": [
		"1A0001",
		"399001",
		"399006"
	]
 */