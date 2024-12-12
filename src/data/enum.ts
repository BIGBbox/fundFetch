//避免基金名字过长，去除基金内部分字符串
export const FundSplitwords = ["(人民币份额)", "-人民币"]

export enum ShowTimeType {
    CLOSE = 0,
    SHOWYMD = 1,
    SHOWYMNHM = 2
}