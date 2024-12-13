import { window, Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'

// import fundHandle from './Handle'
// eslint-disable-next-line no-unused-vars
import FundItem from './TreeItem'
import { fundApi } from '../utils'
import { fundHandle } from './Handle'

enum ItemType {
  FUND = "基金",
  INDEX = '指数'
}

export default class DataProvider implements TreeDataProvider<FundItem> {
  public refreshEvent: EventEmitter<FundItem | null> = new EventEmitter<FundItem | null>()

  readonly onDidChangeTreeData: Event<FundItem | null> = this.refreshEvent.event

  private order: number;
  private tagList = [ItemType.FUND, ItemType.INDEX];
  private showState: any = {};


  constructor() {
    this.tagList.forEach(ItemType => {
      this.showState[ItemType] = 0
    });
    this.order = -1
  }

  refresh() {
    setTimeout(() => {
      this.refreshEvent.fire(null)
    }, 200)
  }

  // eslint-disable-next-line class-methods-use-this
  getTreeItem(info: any): any {
    // return new FundItem(info)
    return info
  }

  getChildren(element?: any): Promise<FundItem[]> {
    const { order } = this
    console.log('element', order)
    let info: any;
    let elementList: FundItem[] = []

    return new Promise((res, rej) => {
      if (!element) {
        // 根节点
        this.tagList.forEach((tagName: string) => {
          elementList.push(new tagItem(tagName, info, TreeItemCollapsibleState.Collapsed))
        })
        res(elementList);
        return
      }

      switch (element.tag) {
        case ItemType.FUND:
          this.showState[ItemType.FUND] = 1
          fundHandle.info.sort(({ changeRate: a = 0 }, { changeRate: b = 0 }) => {
            return (+a >= +b ? -1 : 1) * this.order
          })
          for (let i = 0; i < fundHandle.info.length; i++) {
            elementList.push(new tagItem(ItemType.FUND, fundHandle.info[i]))
          }
          break;
        case ItemType.INDEX:
          this.showState[ItemType.INDEX] = 1
          for (let i = 0; i < 2; i++) {
            elementList.push(new tagItem(`${ItemType.INDEX}__${i}`, info))
          }
          break;
      }
      res(elementList);
    })
  }

  changeOrder(): void {
    this.order *= -1
    this.refresh()
  }

  async addFund() {
    const res = await window.showInputBox({
      value: '',
      valueSelection: [5, -1],
      prompt: '添加基金到自选',
      placeHolder: 'Add Fund To Favorite',
      validateInput: (inputCode: string) => {
        const codeArray = inputCode.split(/[\W]/)
        const hasError = codeArray.some((code) => {
          return code !== '' && !/^\d+$/.test(code)
        })
        return hasError ? '基金代码输入有误' : null
      },
    })

    if (res !== undefined) {
      const codeArray = res.split(/[\W]/) || []
      const newFunds: string[] = [...codeArray]
      const result = await fundApi(newFunds)
      if (result && result.length > 0) {
        // 只更新能正常请求的代码
        const codes = result.map((i: { code: any }) => i.code)
        fundHandle.updateConfig(codes)
        this.refresh()
      } else {
        window.showWarningMessage('stocks not found')
      }
    }
  }
}

class tagItem extends FundItem {
  constructor(
    public readonly tag: string,
    public readonly info: FundInfo,
    public readonly collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None
  ) {
    super(info, tag, collapsibleState);
    this.command = {
      command: 'fund.item.click',
      title: 'click Item',
      arguments: [tag],
    };
  }
}