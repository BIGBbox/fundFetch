import * as vscode from 'vscode';
import axios from 'axios';

import { FundSplitwords, ShowTimeType } from './data/enum';

/**
 * 
 * @param fundConfig 基金代码
 * @returns 
 */
export async function fundApi(fundConfig: string[]): Promise<FundInfo[]> {
  const results: FundInfo[] = []; // 用于存储所有 fundCode 的最终结果
  const promises = fundConfig.map(async (fundCode) => {
    try {
      let data = await getAntFundBaseInfo(fundCode)
      data && results.push(data)
    } catch (error) {
      console.error("API fundApi error fundCode:%s \nerror:%s", fundCode, error)
    }
  });
  await Promise.allSettled(promises);
  return results;
}


/**
 * 
 * @param fundConfig 指数代码
 * @returns 
 */
export async function indexApi(fundConfig: string[]): Promise<FundInfo[]> {
  const results: FundInfo[] = []; // 用于存储所有 fundCode 的最终结果
  const promises = fundConfig.map(async (fundCode) => {
    try {
      const response = await axios.get(`https://d.10jqka.com.cn/v4/time/zs_${fundCode}/last.js`);
      const str = response.data.replace(/.*?\((.*?)\)/, "$1");
      const obj = JSON.parse(str)
      if (obj) {
        let info = obj[`zs_${fundCode}`];
        const data_now = info.data.split(";").pop().split(",");
        const formattedDate = `${info.dates[0].slice(4, 6)}-${info.dates[0].slice(6)}`;
        results.push({
          now: data_now[1],
          name: info.name,
          code: fundCode,
          lastClose: info.pre,
          changeRate: `${(((data_now[1] - info.pre) / info.pre) * 100).toFixed(4)}`,
          changeAmount: `${(data_now[1] - info.pre).toFixed(4)}`,
          updateTime: getUpdateTimeWithMins(formattedDate, data_now[0]),
        });
      }
    } catch (error) {
      console.error("API indexApi error indexCode:%s \nerror:%s", fundCode, error)
    }
  })
  await Promise.all(promises);
  return results;
}

/**
 * 字符串长度拼接
 * @param source 原字符串长度
 * @param length 修改后的字符串长度
 * @param left 原字符串是否靠左边
 */
export function fillString(source: string, length: number,): string {
  const strWidth = source.length;
  if (strWidth >= length) {
    return source.slice(0, length);
  }
  const padding = ' '.repeat(length - strWidth);
  return source + padding;
}

/**
 * 
 * @param fundName 基金原始名字
 * @returns 简化后的名字
 */
export function fundNameSimp(fundName: string): string {
  let newName = fundName;
  FundSplitwords.forEach((word: string) => {
    if (fundName.includes(word)) {
      const escapedWord = word.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
      newName = fundName.replace(new RegExp(escapedWord, 'g'), '');
    }
  })
  return newName
}

export function unique(arr: any[]) {
  return Array.from(new Set(arr))
}


export function getTimeStr(timeObj: string[]): string {
  let showUpdateTime = vscode.workspace.getConfiguration().get('fund-watch.showUpdateTime', 0);
  switch (showUpdateTime) {
    case ShowTimeType.SHOWYMD:
      return `(${timeObj[0]})`
    case ShowTimeType.SHOWYMNHM:
      return `(${timeObj[0]} ${timeObj[2]})`
    default:
      return ''
  }
}

/**
 * 
 * @param timeDate 年-月-日（2023-12-12）
 * @param timsMinStr 时分（1500）
 * @returns 
 */
function getUpdateTimeWithMins(timeDate: string, timsMinStr: string) {
  let minObj = [timeDate, '', '15:00']
  if (timsMinStr.length !== 4) {
    minObj[2] = "15:00"
  } else {
    minObj[2] = timsMinStr.slice(0, 2) + ":" + timsMinStr.slice(2);
  }
  return minObj
}

/**
 * 获取当前以及下一天的年月日
 * @returns 
 */
function getCurrentAndNextDay() {
  const currentDate = new Date();
  const formatDate = (date: any) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1); // 设置为下一天

  return {
    today: formatDate(currentDate),
    tomorrow: formatDate(nextDate),
  };
};

/**
 * 时间戳转时间字符串
 * @param timestamp 时间戳
 * @returns 时间字符串
 */
function formatTimestamp(timestamp: number): string[] {
  const date = new Date(timestamp);
  // 格式化为字符串，例如 "YYYY-MM-DD HH:mm:ss"
  // const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  // const seconds = String(date.getSeconds()).padStart(2, '0');
  return [`${month}-${day}`, '', `${hours}:${minutes}`];
}


async function getAntFundBaseInfo(fundCode: string) {
  //基金展示数据结构
  let res: FundInfo = {
    name: "",
    code: "",
    now: "",
    lastClose: "",
    changeRate: "",
    changeAmount: "",
    updateTime: []
  }
  try {
    const response = await axios.get(`https://www.fund123.cn/matiaria?fundCode=${fundCode}`)
    if (response['status'] !== 200) {
      console.error(`fundBaseInfo get fail,fundCode:${fundCode}`)
      return res;
    }

    let ctoken = '';
    let spanner = '';
    const setCookie = response?.headers?.['set-cookie'];
    Array.isArray(setCookie) && setCookie.forEach((cookie: any) => {
      if (cookie.startsWith('ctoken=')) {
        ctoken = cookie.match(/ctoken=([^;]+)/)[1];
      }
      if (cookie.startsWith('spanner=')) {
        spanner = cookie.match(/spanner=([^;]+)/)[1];
      }
    });

    const cookie = `receive-cookie-deprecation=1;ctoken=${ctoken}; spanner=${spanner}`
    const regex = /window\.context\s*=\s*(\{.*?\});/s;
    const match = response['data'].match(regex);

    if (match) {
      const contentValue = JSON.parse(match[1]) as antFundDate;
      res.name = contentValue.materialInfo.fundBrief.fundNameAbbr;
      res.code = contentValue.materialInfo.fundBrief.fundCode;
      res.now = contentValue.materialInfo.titleInfo.netValue;
      res.changeRate = contentValue.materialInfo.titleInfo.dayOfGrowth;
      res.updateTime = [contentValue.materialInfo.titleInfo.netValueDate, '', '15:00'];

      let fundData = await getCurAntFundData({
        csrf: contentValue.csrf,
        productId: contentValue.materialInfo.productId,
        fundCode: contentValue.materialInfo.fundCode,
        cookie: cookie
      })
      if (fundData) {
        res.now = fundData.curValue;
        res.changeRate = +fundData.curGroth * 100 + '';
        res.updateTime = formatTimestamp(+fundData.curTimeStamp)
      }
      return res;
    }
  } catch (error) {
    console.error("API getAntFundBaseInfo error fundCode:%s \nerror:%s", fundCode, error)
    return res;
  }

}

/**获取当前最新数据 */
async function getCurAntFundData(params: antFetchFundDate) {
  const date = getCurrentAndNextDay();
  try {
    const response = await axios.post(
      `https://www.fund123.cn/api/fund/queryFundEstimateIntraday?_csrf=${params.csrf}`,
      {
        startTime: date.today,
        endTime: date.tomorrow,
        limit: 200,
        productId: params.productId,
        format: true,
        source: 'WEALTHBFFWEB',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': `https://www.fund123.cn/matiaria?fundCode=${params.fundCode}`,
          'Cookie': params.cookie,
        },
      }
    );

    const data = response.data as antFundEstimateIntraday;
    const curFundData = data.list.pop();
    if (curFundData) {
      return {
        curValue: curFundData?.forecastNetValue || "0",
        curGroth: curFundData?.forecastGrowth || "0",
        curTimeStamp: curFundData?.time || "0"
      };
    }
  } catch (error) {
    console.error("API getCurAntFundData error params:%s \nerror:%s", params, error)
    return;
  }
}