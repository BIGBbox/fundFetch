import { workspace } from 'vscode'
import { fundApi, unique } from '../utils'

export class fundHandle {
  private static _infos: FundInfo[] = []
  static updateConfig(funds: string[]) {
    const config = workspace.getConfiguration()
    const favorites = unique([
      ...config.get('fund-watch.favorites', []),
      ...funds,
    ])
    config.update('fund-watch.favorites', favorites, true)
  }

  static removeConfig(code: string) {
    const config = workspace.getConfiguration()
    const favorites: string[] = [...config.get('fund-watch.favorites', [])]
    const index = favorites.indexOf(code)
    if (index === -1) return
    favorites.splice(index, 1)
    config.update('fund-watch.favorites', favorites, true)
  }

  static async getFavorites(): Promise<FundInfo[]> {
    const favorite: string[] = workspace
      .getConfiguration()
      .get('fund-watch.favorites', [])
    let res = favorite.filter(item => !!item);
    this.info = await fundApi([...res])
    let time = new Date()
    console.log('data update success,time:%s',`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
    return this.info
  }

  static get info() {
    return this._infos
  }

  static set info(info) {
    this._infos = info
  }
}

// export default fundHandle
