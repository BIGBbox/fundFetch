import * as vscode from 'vscode';
import * as https from 'https'

import stringWidth from 'string-width';
import { FundSplitwords, ShowTimeType } from './data/enum';
// import * as stringWidth from 'string-width'

const url1 = 'https://fund.10jqka.com.cn/guzhi/chart/v1?module=api&controller=index&action=chartByTradeCode&code={fundCode}&start=0930'
const url2 = 'https://fund.10jqka.com.cn/quotation/fund_detail/v2/base/{fundCode}'
const url3 = 'https://fund.10jqka.com.cn/quotation/fund_detail/get?fundCode={fundCode}'

// 请求
const request = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let chunks = ''
      if (!res) {
        reject(new Error('网络请求错误!'))
        return
      }

      res.on('data', (chunk) => {
        chunks += chunk.toString('utf8')
      })
      res.on('end', () => {
        resolve(chunks)
      })
    })
  })
}

export async function fundApi(fundConfig: string[]): Promise<FundInfo[]> {
  const results: FundInfo[] = []; // 用于存储所有 fundCode 的最终结果

  const promises = fundConfig.map(async (fundCode) => {
    const replacedUrl1 = url1.replace('{fundCode}', fundCode);
    const replacedUrl2 = url2.replace('{fundCode}', fundCode);
    const replacedUrl3 = url3.replace('{fundCode}', fundCode);

    try {
      // 请求第一个 URL
      const res = await request(replacedUrl1);
      const obj = JSON.parse(res);
      // console.log('rsp1', JSON.parse(res))

      const fundBaseInfoStr = await request(replacedUrl3);
      const fundBaseInfoJson = JSON.parse(fundBaseInfoStr);
      if (obj.data) {

        // console.log('fundBaseInfoJson', fundBaseInfoJson)
        let prevtradeday = obj.data.prevtradeday.split(",")
        // console.log('prevtradeday', prevtradeday)
        const data_now = obj.data.estimate.pop().split(",")
        results.push({
          now: data_now[2],
          name: fundBaseInfoJson.data.name,
          code: fundBaseInfoJson.data.code,
          lastClose: prevtradeday[1],
          changeRate: data_now[1],
          changeAmount: (data_now[2] - prevtradeday[1]).toFixed(4),
          updateTime: getUpdateTimeWithMins(obj.data.estimatedate, data_now[0]),
        });
      } else {
        // 如果第一个 URL 返回的数据为 null，尝试请求第二个 URL
        // console.log(`Fund code ${fundCode}: First URL returned null, trying second URL...`);
        const res = await request(replacedUrl2);
        const obj = JSON.parse(res).data;
        // console.log('obj', JSON.parse(res))
        if (obj) {
          results.push({
            now: obj.handicap?.latestNet,
            name: obj.simpleName,
            code: obj.fundCode,
            lastClose: obj.handicap?.latestNet,
            changeRate: obj.handicap?.latestRate,
            changeAmount: '-----',
            updateTime: getUpdateTimeWithMins(fundBaseInfoJson.data.date, ''),
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching fundCode ${fundCode}:`, error);
    }
  });

  await Promise.all(promises);
  let time = new Date()
  // console.log('results', results, `time:${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
  return results;
}


/**
 * 字符串长度拼接
 * @param source 原字符串长度
 * @param length 修改后的字符串长度
 * @param left 原字符串是否靠左边
 */
export function fillString(
  source: string,
  length: number,
  left = true
): string {
  const strWidth = stringWidth(source);
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
      newName = fundName.replace(new RegExp(escapedWord, 'g'), '');  // 替换为 '' 即删除该词
    }
  })
  return newName
}

export function unique(arr: any[]) {
  return Array.from(new Set(arr))
}

/**
 * 
 * @param timeDate 年-月-日（2023-12-12）
 * @param timsMinStr 时分（1500）
 * @returns 
 */
function getUpdateTimeWithMins(timeDate: string, timsMinStr: string) {
  let showUpdateTime = vscode.workspace.getConfiguration().get('fund-watch.showUpdateTime', 0);
  let timeStr = '';
  let minStr = ''

  if (timsMinStr.length !== 4) {
    minStr = "15:00"
  } else {
    minStr = timsMinStr.slice(0, 2) + ":" + timsMinStr.slice(2);
  }

  switch (showUpdateTime) {
    case ShowTimeType.SHOWYMD:
      timeStr = timeDate
      break;
    case ShowTimeType.SHOWYMNHM:
      timeStr = `${timeDate} ${minStr}`
      break;
  }

  return timeStr
}