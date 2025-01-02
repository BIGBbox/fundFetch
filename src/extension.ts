// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands, window, workspace } from 'vscode';
import Provider, { ItemType, tagItem } from './data/Provider';
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
	fundHandle.updateData(() => {
		provider.refresh();
	})
	interval = setInterval(() => {
		fundHandle.updateData(() => {
			provider.refresh();
		})
	}, intervalTime * 1000);
}

function openWedSite(param: string[]) {
	const _openWebsite = (url: string) => {
		const uri = vscode.Uri.parse(url);
		vscode.env.openExternal(uri).then(
			() => vscode.window.showInformationMessage(`Opened: ${url}`),
			(err) => vscode.window.showErrorMessage(`Failed to open ${url}: ${err}`)
		);
	}
	switch (param[0]) {
		case ItemType.FUND:
			_openWebsite(`https://www.fund123.cn/matiaria?fundCode=${param[1]}`)
			break;
		case ItemType.INDEX:
			_openWebsite(`https://quote.eastmoney.com/center/hszs.html`)
			break;
	}
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
			fundHandle.updateData(() => {
				provider.refresh();
			})
		}
		if (e.affectsConfiguration('fund-watch.favoriteIndexs')) {
			fundHandle.updateData(() => {
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
		commands.registerCommand('fund.item.click', (fundType: string, fundInfo: string) => {
			// const { code } = fund
			console.log('click item', fundType, fundInfo)
			openWedSite(fundInfo.split("_"))
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