self.HNX_PRC_LIST = []
self.HSX_PRC_LIST = []
self.UPC_PRC_LIST = []
self.TPDN_PRC_LIST = []
self.mrk_StkList = []
self.tradview_StkList = []
self.stkInfoTradviewMap = new Map()
self.mapArr = [] // -- for store session

self.onmessage = function(event) {
    const stkInfo = JSON.parse(event.data)
    let i = 0,
        tradObj = {},
        stkTradInfo = {}
    for (i = 0; i < stkInfo.length; i++) {
        tradObj = {}
        stkTradInfo = {}
        let ls_sanGd
        if (stkInfo[i]['U10'] === '05') {
            ls_sanGd = 'UPC'
        }
        if (stkInfo[i]['U10'] === '01') {
            ls_sanGd = 'HOSE'
        }
        if (stkInfo[i]['U10'] === '03') {
            ls_sanGd = 'HNX'
        }
        if (stkInfo[i]['U10'] === '90') {
            ls_sanGd = 'TPN'
        }
        const stkfullNm = stkInfo[i]['t55'].trim() + ' - ' + ls_sanGd + ' - ' + stkInfo[i]['U9'].trim()
        const stkItem = { value: stkInfo[i]['t55'], label: stkfullNm }
        if (
            stkInfo[i]['t55'] != null &&
            stkInfo[i]['t55'] !== undefined &&
            stkInfo[i]['U9'] != null &&
            stkInfo[i]['U9'] !== undefined
        ) {
            if (self.mrk_StkList.findIndex(x => x === stkfullNm) < 0) {
                self.mrk_StkList.push(stkItem)
            }
            if (self.tradview_StkList.findIndex(x => x.symbol === stkInfo[i]['t55']) < 0) {
                tradObj['symbol'] = stkInfo[i]['t55']
                tradObj['full_name'] = stkInfo[i]['t55']
                tradObj['description'] = stkfullNm
                tradObj['exchange'] = ls_sanGd
                tradObj['type'] = 'stock'
                self.tradview_StkList.push(tradObj)
                // -- đẩy dữ liệu vào hashmap thông tin CK
                stkTradInfo['name'] = stkInfo[i]['t55']
                stkTradInfo['full_name'] = ls_sanGd + ':' + stkInfo[i]['t55']
                stkTradInfo['exchange'] = ls_sanGd
                stkTradInfo['exchange-traded'] = ls_sanGd
                stkTradInfo['exchange-listed'] = ls_sanGd
                stkTradInfo['timezone'] = 'Asia/Bangkok'
                stkTradInfo['minmov'] = 1
                stkTradInfo['minmov2'] = 0
                stkTradInfo['pointvalue'] = 1
                stkTradInfo['session'] = '0915-1530'
                stkTradInfo['has_intraday'] = true
                stkTradInfo['has_seconds'] = true
                // stkTradInfo['has_daily'] = true;
                stkTradInfo['intraday_multipliers'] = ['1S', '5S', '15S', '30S', '1', '5', '15', '30', '60']
                // stkTradInfo['intraday_multipliers'] = ['1', '60'];
                // stkTradInfo['seconds_multipliers'] = ['1', '5', '15', '30'];
                stkTradInfo['has_no_volume'] = false
                stkTradInfo['pricescale'] = 1
                stkTradInfo['description'] = stkfullNm
                stkTradInfo['type'] = 'stock'
                stkTradInfo['currency_code'] = 'VND'
                stkTradInfo['supported_resolutions'] = [
                    '1S',
                    '5S',
                    '15S',
                    '30S',
                    '1',
                    '5',
                    '15',
                    '30',
                    '60',
                    'D',
                    'W',
                    'M',
                    '3M',
                ]
                // stkTradInfo['supported_resolutions'] = ['1', '5', '15', '30', '60', 'D', 'W', 'M', '3M'];
                stkTradInfo['ticker'] = stkInfo[i]['t55']
                stkTradInfo['pro_name'] = ls_sanGd + ':' + stkInfo[i]['t55']
                self.stkInfoTradviewMap.set(stkInfo[i]['t55'], stkTradInfo)
            }
        }
        if (stkInfo[i]['U8'] != null && stkInfo[i]['U8'] !== undefined && stkInfo[i]['U8'].trim() !== '') {
            self.updSI_Msg2MrkInfoMap(stkInfo[i])
        }
    }
    self.stkInfoTradviewMap.forEach((value, key) => {
        const mapObj = {}
        mapObj[0] = key
        mapObj[1] = value
        self.mapArr.push(mapObj)
    })

    let obj = {
        '1': self.HNX_PRC_LIST,
        '2': self.HSX_PRC_LIST,
        '3': self.UPC_PRC_LIST,
        '5': self.tradview_StkList,
        '6': self.stkInfoTradviewMap,
        '7': self.mapArr,
        '8': self.mrk_StkList,
        '9': self.TPDN_PRC_LIST,
    }

    postMessage(obj)
    self.HNX_PRC_LIST = []
    self.HSX_PRC_LIST = []
    self.UPC_PRC_LIST = []
    self.TPDN_PRC_LIST = []
    self.mrk_StkList = []
    self.tradview_StkList = []
    self.stkInfoTradviewMap = new Map()
    self.mapArr = [] // -- for store session
}

self.updSI_Msg2MrkInfoMap = msgObj => {
    const splitted = msgObj['U8'].split('|', 3)
    msgObj['t31_color'] = 'price_basic_color'
    const mskey = splitted[0] + '_' + splitted[2]
    msgObj.itemName = mskey
    if (msgObj.U10 === '03') {
        self.HNX_PRC_LIST[self.HNX_PRC_LIST.length] = msgObj
    } else if (msgObj.U10 === '01') {
        self.HSX_PRC_LIST[self.HSX_PRC_LIST.length] = msgObj
    } else if (msgObj.U10 === '05') {
        self.UPC_PRC_LIST[self.UPC_PRC_LIST.length] = msgObj
    } else if (msgObj.U10 === '90') {
        self.TPDN_PRC_LIST[self.TPDN_PRC_LIST.length] = msgObj
    }
}
