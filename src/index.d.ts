interface FundInfo {
  now: string
  name: string
  code: string
  lastClose: string
  changeRate: string
  changeAmount: string
  updateTime: string[]
  updateTimeWithMins?: string
}

/**请求蚂蚁基金实时数据 */
interface antFetchFundDate {
  csrf: string,
  productId: string,
  fundCode: string,
  cookie: string,
}

/**蚂蚁基金实时数据结构 */
interface antFundEstimateIntraday {
  sucess: boolean,
  list: [
    /**bizSeq:序号 time:时间戳 forecastNetValue:当前净值 forecastGrowth:当前成长率 */
    { bizSeq: string, time: string, forecastNetValue: string, forecastGrowth: string }
  ]
}

/**蚂蚁基金基础数据结构 */
interface antFundDate {
  success: boolean,
  message: string,
  materialInfo: {
    productId: string,
    fundCode: string,
    fundType: string,
    isEstimateDowngrade: true,
    estimateDowngradeText: string,
    titleInfo: {
      fundLimit: string
      netValue: string//上一个交易日净值
      netValueDate: string////上一个交易日日期
      profitSevenDays: string
      profitTenThousand: string
      dayOfGrowth: string
      lastWeek: string
      riskEvaluation: string
      establishmentDate: string
      assetSize: string
      fundManagerName: string
    },
    fundBrief: {
      fundNameAbbr: string,//华夏国证半导体芯片ETF联接C
      fundName: string,//华夏国证半导体芯片交易型开放式指数证券投资基金发起式联接基金C类
      fundCode: string,
      establishmentDate: string,
      shareSize: string
      assetSize: string
      fundManagerName: string
      saleStatus: string
      fundCompanyName: string
      trusteeName: string
      manageRate: string
      trusteeRate: string
      purchaseMinMount: string
      redeemMinMount: string
      purchaseRatio: string
      redeemRatio: string
      generalInfo: [Object]
    }
  },
  isLogin: false,
  csrf: string,
  isCloseEstimate: false,
  pageName: 'matiaria?fundCode=008888',
  uriBroker: {
    'favicon.ico.url': 'https://gw.alipayobjects.com/zos/rmsportal/mgPTSSvpLkKrsQwhoDzv.ico',
    'app.404.url': 'https://www.alipay.com/404.html',
    'zdrmdata.rest.url': 'http://zdrmdata-pool.gz00g.alipay.com',
    'app.errorpage.url': 'https://www.alipay.com/50x.html',
    'authcenter.url': 'https://auth.alipay.com',
    'app.goto.url': 'https://my.alipay.com/portal/i.htm',
    'bumng.url': 'https://bumng.alipay.com',
    'omeo.check.url': 'http://omeo-pool.gz00g.alipay.com',
    'omeo.get.url': 'https://omeo.alipay.com',
    'assets.url': 'https://gw.alipayobjects.com/a'
  }
}
