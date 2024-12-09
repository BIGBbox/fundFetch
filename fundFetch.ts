const http = require('http');

const codeList = [
    '161128',//易方达标普信息科技指数(QDII-LOF)A(人民币份额)
    '017436',//华宝纳斯达克精选股票发起式(QDII)A
    '000043',//嘉实美国成长股票(QDII)-人民币
    '008888',//华夏国证半导体芯片ETF联接C
    '160632'//鹏华酒A
];

const options = {
    hostname: 'fund.10jqka.com.cn',
    path: '',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
};

const fundDataList = []; // 用于存储基金信息

function req(code, callback) {
    options.path = `/interface/net/index/0_${code}`;
    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const jsdata = JSON.parse(data).data;
                fundDataList.push({
                    name: jsdata.name,
                    code: code,
                    date: jsdata.date,
                    rate: parseFloat(jsdata.rate),
                    manager: jsdata.manager,
                });
                callback(); // 通知请求完成
            } catch (e) {
                console.error('解析响应数据时出错:', e.message);
                callback(); // 即使出错，也通知请求完成，防止阻塞
            }
        });
    });

    req.on('error', (e) => {
        console.error('请求错误:', e.message);
        callback(); // 发生错误时，也通知请求完成
    });

    req.end();
}

function main() {
    let completedRequests = 0;

    function checkAllRequests() {
        completedRequests++;
        if (completedRequests === codeList.length) {
            // 所有请求完成后，按日期排序并打印
            fundDataList.sort((a, b) => new Date(b.date) - new Date(a.date));

            fundDataList.forEach(fund => {
                const rateColor = fund.rate >= 0 ? '\x1b[31m' : '\x1b[32m'; // 红色 (正值), 绿色 (负值)
                const dateColor = '\x1b[33m'; // 黄色高亮
                const resetColor = '\x1b[0m'; // 重置颜色

                console.log(
                    "基金名字: %s\n基金代码: %s\n日期: %s%s%s\n当前收益率: %s%s%%%s\n基金经理: %s\n",
                    fund.name,
                    fund.code,
                    dateColor, // 应用日期高亮颜色
                    fund.date,
                    resetColor, // 恢复默认颜色
                    rateColor, // 应用收益率颜色
                    fund.rate,
                    resetColor, // 恢复默认颜色
                    fund.manager
                );
            });
        }
    }

    // 发起所有请求
    codeList.forEach(code => req(code, checkAllRequests));
}

main();
