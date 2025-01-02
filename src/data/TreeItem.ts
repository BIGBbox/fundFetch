import { TreeItem, TreeItemCollapsibleState, ExtensionContext, Uri } from 'vscode'
import { fillString, fundNameSimp, getTimeStr } from '../utils'
import * as path from 'path';
import { fundHandle } from './Handle';
export default class FundItem extends TreeItem {
  info: FundInfo | undefined

  constructor(info: FundInfo, tag: string = '', collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None) {
    if (!info) {
      super(tag)
      return
    }
    const rate = Number(info.changeRate)
    // const icon = rate >= 0 ? '📈' : '📉'
    let icon = "up2"
    if (rate >= 1.5) {
      icon = "up2";
    } else if (rate > 0 && rate < 1.5) {
      icon = "up";
    } else if (rate <= -1.5) {
      icon = "down2";
    } else if (rate < 0 && rate > -1.5) {
      icon = "down";
    }
    const prev = Math.abs(rate) >= 0 ? '' : ''
    const rage = fillString(`${prev}${Math.abs(rate).toFixed(2)}%`, 10)
    const name = fundNameSimp(info.name)
    let time = getTimeStr(info.updateTime)
    super(`${time}  ${rage}${name}`)
    this.iconPath = Uri.file(path.join(fundHandle.extensionPath, '', 'images', `${icon}.svg`));


    let sliceName = info.name
    if (sliceName.length > 8) {
      sliceName = `${sliceName.slice(0, 8)}...`
    }
    const tips = [
      `代码:　${info.code}`,
      `名称:　${sliceName}`,
      `--------------------------`,
      `单位净值:　　　　${Number(info.now).toFixed(4)}`,
      `涨跌幅:　　　　　${Number(info.changeRate).toFixed(2)}%`,
      // `涨跌额:　　　　　${info.changeAmount}`,
      // `昨收:　　　　　　${info.lastClose}`,
    ]

    this.info = info
    this.tooltip = tips.join('\r\n')
  }
}
