import { TreeItem, TreeItemCollapsibleState } from 'vscode'
import { fillString, fundNameSimp } from '../utils'

export default class FundItem extends TreeItem {
  info: FundInfo | undefined

  constructor(info: FundInfo, tag: string = '', collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None) {
    if (!info) {
      super(tag)
      return
    }
    const rate = Number(info.changeRate)
    const icon = rate >= 0 ? '📈' : '📉'
    const prev = rate >= 0 ? '+' : '-'
    const rage = fillString(`${prev}${Math.abs(rate).toFixed(2)}%`, 10)
    const name = fundNameSimp(info.name)
    let time = info.updateTime ? `(${info.updateTime})` : ''
    super(`${icon}${time}${rage}${name}`)

    let sliceName = info.name
    if (sliceName.length > 8) {
      sliceName = `${sliceName.slice(0, 8)}...`
    }
    const tips = [
      `代码:　${info.code}`,
      `名称:　${sliceName}`,
      `--------------------------`,
      `单位净值:　　　　${info.now}`,
      `涨跌幅:　　　　　${info.changeRate}%`,
      `涨跌额:　　　　　${info.changeAmount}`,
      `昨收:　　　　　　${info.lastClose}`,
    ]

    this.info = info
    this.tooltip = tips.join('\r\n')
  }
}
