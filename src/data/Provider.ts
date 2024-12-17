import { window, Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'

// import fundHandle from './Handle'
// eslint-disable-next-line no-unused-vars
import FundItem from './TreeItem'
import { fundApi, indexApi } from '../utils'
import { fundHandle } from './Handle'

const ItemTypeMap: any = {
  FUND: "基金",
  INDEX: '指数'
}

const ItemTypeEng: any = {
  '基金': "FUND",
  '指数': 'INDEX'
}

export enum ItemType {
  FUND = "FUND",
  INDEX = 'INDEX'
}

export default class DataProvider implements TreeDataProvider<FundItem> {
  public refreshEvent: EventEmitter<FundItem | null> = new EventEmitter<FundItem | null>()

  readonly onDidChangeTreeData: Event<FundItem | null> = this.refreshEvent.event

  private order: number;
  private tagList = [ItemTypeMap.FUND, ItemTypeMap.INDEX];
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
  getTreeItem(info: tagItem): tagItem {
    // return new FundItem(info)
    return info
  }

  getChildren(element?: any): Promise<FundItem[]> {
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

      switch (element.contextValue) {
        case ItemType.FUND:
          this.getData(elementList, ItemType.FUND)
          break;
        case ItemType.INDEX:
          this.getData(elementList, ItemType.INDEX)
          break;
      }
      res(elementList);
    })
  }

  changeOrder(): void {
    this.order *= -1
    this.refresh()
  }

  async addFund(type: string) {
    const res = await window.showInputBox({
      value: '',
      valueSelection: [5, -1],
      prompt: `添加${ItemTypeMap[type]}到自选'`,
      placeHolder: `Add ${type} To Favorite`,
      validateInput: (inputCode: string) => {
        // const codeArray = inputCode.split(/[\W]/)
        // const hasError = codeArray.some((code) => {
        //   return code !== '' && !/^\d+$/.test(code)
        // })
        return !inputCode ? '基金代码输入有误' : null
      },
    })

    if (res !== undefined) {
      const newFunds: string[] = [res]
      let result: FundInfo[] = []
      switch (type) {
        case ItemType.FUND:
          result = await fundApi(newFunds)
          break;
        case ItemType.INDEX:
          result = await indexApi(newFunds)
          break;
      }
      if (result && result.length > 0) {
        // 只更新能正常请求的代码
        const codes = result.map((i: { code: any }) => i.code)
        fundHandle.updateConfig(codes, type)
        this.refresh()
      } else {
        window.showWarningMessage('stocks not found')
      }
    }
  }

  private getData(elementList: FundItem[], type: string) {
    this.showState[type] = 1
    let result: FundInfo[] = []
    switch (type) {
      case ItemType.FUND:
        result = fundHandle.fundInfo
        break;
      case ItemType.INDEX:
        result = fundHandle.indexInfo
        break;
    }
    result.sort((a: FundInfo, b: FundInfo) => {
      const timeDifference = new Date(a.updateTime.split(" ")[0]).getTime() - new Date(b.updateTime.split(" ")[0]).getTime();
      if (timeDifference !== 0) {
        return timeDifference * -1;
      }
      return (+a.changeRate - +b.changeRate) * this.order;
    })
    for (let i = 0; i < result.length; i++) {
      elementList.push(new tagItem("", result[i]))
    }
  }
}

export class tagItem extends FundItem {
  constructor(
    public readonly tag: string,
    public readonly info: FundInfo,
    public readonly collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None
  ) {
    super(info, tag, collapsibleState);
    this.contextValue = ItemTypeEng[tag] ?? ""
    this.command = {
      command: 'fund.item.click',
      title: 'click Item',
      arguments: [ItemTypeEng[tag]],
    };
  }
}