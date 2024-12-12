import * as https from 'https'

import stringWidth from 'string-width';
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

      if (obj.data) {

        const fundBaseInfoStr = await request(replacedUrl3);
        const fundBaseInfoJson = JSON.parse(fundBaseInfoStr);
        // console.log('fundBaseInfoJson', fundBaseInfoJson)
        let prevtradeday = obj.data.prevtradeday.split(",")
        // console.log('prevtradeday', prevtradeday)
        const data_now = obj.data.estimate.pop().split(",")
        // console.log('data_now', data_now)
        results.push({
          now: data_now[2],
          name: fundBaseInfoJson.data.name,
          code: fundBaseInfoJson.data.code,
          lastClose: prevtradeday[1],
          changeRate: data_now[1],
          changeAmount: (data_now[2] - prevtradeday[1]).toFixed(4),
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
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching fundCode ${fundCode}:`, error);
    }
  });

  // 等待所有异步任务完成
  await Promise.all(promises);
  let time = new Date()
  console.log('results', results, `time:${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
  // 返回最终结果
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
  let rest = source
  while (stringWidth(rest) >= length) {
    rest = rest.slice(0, rest.length - 1)
  }
  const addString = '  '.repeat(length - stringWidth(rest))
  return left ? `${rest}${addString}` : `${addString}${rest}`
}

export function unique(arr: any[]) {
  return Array.from(new Set(arr))
}