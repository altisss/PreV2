self.onmessage = function(event) {
    //-- Nhận dữ liệu data + client clientSeq
    const msgInfo = event.data
    let dataArr = msgInfo.data
    let clientSeq = msgInfo.clientSeq
    let resolution = msgInfo.resolution
    const objData = { t: [], o: [], h: [], l: [], c: [], v: [], s: 'no_data' }
    // -- sort lại time
    let newArr = [],
        i = 0
    for (i = 0; i < dataArr.length; i++) {
        if (isNaN(dataArr[i][2]) || dataArr[i][2] === 0) continue
        const timeTd =
            self.convDate2StrDt(new Date()) + '' + dataArr[i][0][0] + '' + dataArr[i][0][1] + '' + dataArr[i][0][2]
        const unixTm = self.convStrDtime2UnixTime(timeTd)
        //-- c0: Thời gian, c1: Khối lượng, c2: Giá
        const newObj = { c0: unixTm, c1: dataArr[i][2], c2: dataArr[i][1] }
        newArr.push(newObj)
    }

    if (!newArr || newArr.length === 0) {
        postMessage({ data: objData, clientSeq: clientSeq })
        return
    } else {
        newArr = newArr.sort(function(a, b) {
            return a['c0'] > b['c0'] ? 1 : b['c0'] > a['c0'] ? -1 : 0
        })
    }
    const todayStr = self.convDate2StrDt(new Date()) + '' + '09' + '00' + '00'
    const todayEnd = self.convDate2StrDt(new Date()) + '' + '15' + '00' + '00'
    const finishDay = self.convStrDtime2UnixTime(todayEnd)
    let startTime = self.convStrDtime2UnixTime(todayStr),
        endTime = 0,
        rangeTime = 0
    const find = resolution.indexOf('S')
    if (find >= 0) {
        rangeTime = Number(resolution.substr(0, resolution.length - 1))
    } else {
        rangeTime = Number(resolution) * 60
    }
    do {
        endTime = startTime + rangeTime
        // endTime = startTime + 5 * 60
        const filterArr = []
        Object.assign(
            filterArr,
            newArr.filter(item => item.c0 >= startTime && item.c0 < endTime)
        )
        if (!!filterArr && filterArr.length > 0) {
            const t = filterArr[filterArr.length - 1]['c0']
            const oObj = filterArr.reduce(self.getOpenPriceItem)
            const cObj = filterArr.reduce(self.getClosePriceItem)
            const hObj = filterArr.reduce(self.getMaxPriceItem)
            const lObj = filterArr.reduce(self.getMinPriceItem)
            objData['t'].push(t)
            objData['o'].push(oObj['c2'])
            objData['h'].push(hObj['c2'])
            objData['l'].push(lObj['c2'])
            objData['c'].push(cObj['c2'])
            objData['v'].push(filterArr.reduce(self.getTotalVolArr, 0))
        }
        startTime = endTime
        if (endTime >= finishDay) break
    } while (true)
    objData['s'] = 'ok'
    // postMessage -> Trả dữ liệu
    postMessage({ data: objData, clientSeq: clientSeq })
}

self.convDate2StrDt = Datt => {
    const y2 = Datt.getFullYear()
    const m2 = Datt.getMonth() + 1
    const sm = ('0' + m2).slice(-2)
    const d2 = Datt.getDate()
    const sd = ('0' + d2).slice(-2)
    const result = y2 + '' + sm + '' + sd
    return result
}

self.convStrDtime2UnixTime = strTime => {
    try {
        //example: strTime = 2020 05 22 10 01 02
        const y = Number(strTime.substr(0, 4))
        const m = Number(strTime.substr(4, 2)) - 1
        const d = Number(strTime.substr(6, 2))
        const h = Number(strTime.substr(8, 2))
        const mi = Number(strTime.substr(10, 2))
        const s = Number(strTime.substr(12, 2))
        const dates = new Date(y, m, d, h, mi, s)
        const unixtime = dates.getTime() / 1000
        return unixtime
    } catch (error) {
        // self.logMessage('Error at convStrDt2UnixTime: ' + error);
        return -1
    }
}

self.getMinPriceItem = function(prev, curr) {
    return prev['c2'] < curr['c2'] ? prev : curr
}

self.getMaxPriceItem = function(prev, curr) {
    return prev['c2'] > curr['c2'] ? prev : curr
}

self.getTotalVolArr = function(prev, curr) {
    return prev + curr['c1']
}

self.getOpenPriceItem = function(prev, curr) {
    return prev['c0'] < curr['c0'] ? prev : curr
}

self.getClosePriceItem = function(prev, curr) {
    return prev['c0'] > curr['c0'] ? prev : curr
}
