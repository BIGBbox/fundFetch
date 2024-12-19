import { workspace } from 'vscode'
import { fundApi, indexApi, unique } from '../utils'
import { ItemType } from './Provider'

export class fundHandle {
  private static _Fundinfos: FundInfo[] = []
  private static _Indexinfos: FundInfo[] = []
  private static _extensionPath: string = ""
  static updateConfig(funds: string[], type: string) {
    const config = workspace.getConfiguration()
    let cfgKey = this.getCfgKey(type);
    const favoriteFunds = unique([
      ...config.get(cfgKey, []),
      ...funds,
    ])
    config.update(cfgKey, favoriteFunds, true)
  }

  static removeConfig(code: string) {
    const config = workspace.getConfiguration()
    const favoriteFunds: string[] = [...config.get('fund-watch.favoriteFunds', [])]
    const favoriteIndexs: string[] = [...config.get('fund-watch.favoriteIndexs', [])]
    const indexFunds = favoriteFunds.indexOf(code)
    const indexIndex = favoriteIndexs.indexOf(code)
    if (indexFunds != -1) {
      favoriteFunds.splice(indexFunds, 1)
      config.update('fund-watch.favoriteFunds', favoriteFunds, true)
      return;
    }
    if (indexIndex != -1) {
      favoriteIndexs.splice(indexIndex, 1)
      config.update('fund-watch.favoriteIndexs', favoriteIndexs, true)
      return;
    }
  }

  /**基金数据 */
  private static async updateFavoriteFunds(): Promise<FundInfo[]> {
    const favorite: string[] = workspace
      .getConfiguration()
      .get('fund-watch.favoriteFunds', [])
    let res = favorite.filter(item => !!item);
    this.fundInfo = await fundApi([...res])
    // let time = new Date()
    // console.log('data update success,time:%s',`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
    return this.fundInfo
  }

  /**指数数据 */
  private static async updateFavoriteIndexs(): Promise<FundInfo[]> {
    const favorite: string[] = workspace
      .getConfiguration()
      .get('fund-watch.favoriteIndexs', [])
    let res = favorite.filter(item => !!item);
    this.indexInfo = await indexApi([...res])
    // let time = new Date()
    // console.log('data update success,time:%s',`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
    return this.indexInfo
  }

  static async updateData(cb?:Function) {
    this.updateFavoriteFunds()
    this.updateFavoriteIndexs()
    cb && cb()
  }

  private static getCfgKey(type: string) {
    let cfgKey = "fund-watch.favoriteFunds";
    switch (type) {
      case ItemType.FUND:
        cfgKey = "fund-watch.favoriteFunds";
        break;
      case ItemType.INDEX:
        cfgKey = "fund-watch.favoriteIndexs";
        break;
    }
    return cfgKey
  }

  static get extensionPath() {
    return this._extensionPath
  }

  static set extensionPath(extensionPath) {
    this._extensionPath = extensionPath
  }

  static get fundInfo() {
    return this._Fundinfos
  }

  static set fundInfo(fundInfo) {
    this._Fundinfos = fundInfo
  }

  static get indexInfo() {
    return this._Indexinfos
  }

  static set indexInfo(indexInfo) {
    this._Indexinfos = indexInfo
  }
}

// export default fundHandle
