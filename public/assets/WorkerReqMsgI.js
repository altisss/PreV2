
self.tradview_StkList = [];
self.stkInfoTradviewMap = new Map();
self.mrkIndexArr_HNXINDEX = [];
self.mrkIndexArr_VNINDEX = [];
self.mrkIndexArr_UPCOMINDEX = [];
self.mrkIndexArr_HNX30INDEX = [];
self.mrkIndexArr_VN30INDEX = [];

self.mrkIndexArr_VN100INDEX = [];
self.mrkIndexArr_VNX50INDEX = [];
self.mrkIndexArr_VNXALLINDEX = [];
self.mrkIndexArr_VNFININDEX = [];
self.mrkIndexArr_VNREALINDEX = [];
self.mrkIndexArr_VNSMLINDEX = [];
self.mrkIndexArr_VNMIDINDEX = [];
self.mrkIndexArr_VNUTIINDEX = [];
self.mrkIndexArr_VNCONSINDEX = [];
self.mrkIndexArr_VNALLINDEX = [];
self.mrkIndexArr_VNSIINDEX = [];
self.mrkIndexArr_VNENEINDEX = [];
self.mrkIndexArr_VNINDINDEX = [];
self.mrkIndexArr_VNMATINDEX = [];
self.mrkIndexArr_VNITINDEX = [];

self.VN_INDEX = {};
self.VN30_INDEX = {};
self.HNX_INDEX = {};
self.HNX30_INDEX = {};
self.UPCOM_INDEX = {};

self.VN100_INDEX = {};
self.VNX50_INDEX = {};
self.VNXALL_INDEX = {};
self.VNFIN_INDEX = {};
self.VNREAL_INDEX = {};
self.VNSML_INDEX = {};
self.VNMID_INDEX = {};
self.VNUTI_INDEX = {};
self.VNCONS_INDEX = {};
self.VNALL_INDEX = {};
self.VNSI_INDEX = {};
self.VNENE_INDEX = {};
self.VNIND_INDEX = {};
self.VNMAT_INDEX = {};
self.VNIT_INDEX = {};

self.onmessage = function (event) {
    const msgInfo = JSON.parse(event.data);
    let i = 0;
    for (i = 0; i < msgInfo.length; i++) {
        self.sprocess_ForOneMsg(msgInfo[i]);
    };
    self.proc_get_index_hist(1);
    self.proc_get_index_hist(2);
    self.proc_get_index_hist(3);
    self.proc_get_index_hist(4);
    self.proc_get_index_hist(5);
    self.proc_get_index_hist(6);
    self.proc_get_index_hist(7);
    self.proc_get_index_hist(8);
    self.proc_get_index_hist(9);
    self.proc_get_index_hist(10);
    self.proc_get_index_hist(11);
    self.proc_get_index_hist(12);
    self.proc_get_index_hist(13);
    self.proc_get_index_hist(14);
    self.proc_get_index_hist(15);
    self.proc_get_index_hist(16);
    self.proc_get_index_hist(17);
    self.proc_get_index_hist(18);
    self.proc_get_index_hist(19);
    self.proc_get_index_hist(20);

    let obj = {
        '1': self.tradview_StkList,
        '2': self.stkInfoTradviewMap,
        // '3': self.mrkIndexArr_HNXINDEX,
        // '4': self.mrkIndexArr_VNINDEX,
        // '5': self.mrkIndexArr_UPCOMINDEX,
        // '6': self.mrkIndexArr_HNX30INDEX,
        // '7': self.mrkIndexArr_VN30INDEX,
        '8': self.VN_INDEX,
        '9': self.VN30_INDEX,
        '10': self.HNX_INDEX,
        '11': self.HNX30_INDEX,
        '12': self.UPCOM_INDEX,
        '13': self.VN100_INDEX,
        '14': self.VNX50_INDEX,
        '15': self.VNXALL_INDEX,
        '16': self.VNFIN_INDEX,
        '17': self.VNREAL_INDEX,
        '18': self.VNSML_INDEX,
        '19': self.VNMID_INDEX,
        '20': self.VNUTI_INDEX,
        '21': self.VNCONS_INDEX,
        '22': self.VNALL_INDEX,
        '23': self.VNSI_INDEX,
        '24': self.VNENE_INDEX,
        '25': self.VNIND_INDEX,
        '26': self.VNMAT_INDEX,
        '27': self.VNIT_INDEX
    };
    // console.log(self.VN100_INDEX); 
    postMessage(obj);
};

self.sprocess_ForOneMsg = (msgObj) => {
    const u8Arr = msgObj['U8'].split('|');
    if (u8Arr[2] != null && u8Arr[2] !== undefined) {
        const dextObj = {};
        let ls_sanGd = 'HNX';
        if (u8Arr[0] === 'HSX') {
            ls_sanGd = 'HOSE';
        }
        const symbol = u8Arr[2].toUpperCase();
        dextObj['symbol'] = symbol;
        dextObj['full_name'] = symbol;
        dextObj['description'] = msgObj['t18'];
        dextObj['exchange'] = ls_sanGd;
        dextObj['type'] = 'index';
        if (self.tradview_StkList.length === 0 || self.tradview_StkList.findIndex(x => x.symbol === symbol) < 0) {
            self.tradview_StkList.push(dextObj);
            const stkTradInfo = {};
            stkTradInfo['name'] = symbol;
            stkTradInfo['full_name'] = symbol;
            stkTradInfo['exchange'] = ls_sanGd;
            stkTradInfo['exchange-traded'] = ls_sanGd;
            stkTradInfo['exchange-listed'] = ls_sanGd;
            stkTradInfo['timezone'] = 'Asia/Bangkok';
            stkTradInfo['minmov'] = 1;
            stkTradInfo['minmov2'] = 0;
            stkTradInfo['pointvalue'] = 1;
            stkTradInfo['session'] = '0915-1530';
            stkTradInfo['has_intraday'] = true;
            stkTradInfo['has_seconds'] = true;
            // stkTradInfo['has_daily'] = true;
            stkTradInfo['intraday_multipliers'] = ['1S', '5S', '15S', '30S', '1', '5', '15', '30', '60'];
            // stkTradInfo['intraday_multipliers'] = ['1', '60'];
            // stkTradInfo['seconds_multipliers'] = ['1', '5', '15', '30'];
            stkTradInfo['has_no_volume'] = false;
            stkTradInfo['pricescale'] = 100;
            stkTradInfo['description'] = msgObj['t18'];
            stkTradInfo['type'] = 'index';
            stkTradInfo['currency_code'] = 'VND';
            stkTradInfo['supported_resolutions'] = ['1S', '5S', '15S', '30S', '1', '5', '15', '30', '60', 'D', 'W', 'M', '3M'];
            // stkTradInfo['supported_resolutions'] = ['1', '5', '15', '30', '60', 'D', 'W', 'M', '3M'];
            stkTradInfo['ticker'] = symbol;
            self.stkInfoTradviewMap.set(symbol, stkTradInfo);
        }
    }

    if ((Number(msgObj['seq']) + Number(msgObj['subseq'])) > 0 && msgObj['U12'] === 0) {
        return;
    }
    const splitted = msgObj['U8'].split('|', 3);
    const msgKey = splitted[0] + '_' + splitted[2];
    if (msgKey.toUpperCase() === 'HNX_HNXINDEX') {
        self.mrkIndexArr_HNXINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_HSXINDEX') {
        self.mrkIndexArr_VNINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HNX_HNXUPCOMINDEX') {
        self.mrkIndexArr_UPCOMINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HNX_HNX30') {
        self.mrkIndexArr_HNX30INDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VN30') {
        self.mrkIndexArr_VN30INDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VN100') {
        self.mrkIndexArr_VN100INDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNX50') {
        self.mrkIndexArr_VNX50INDEX.push(msgObj);
    } if (msgKey.toUpperCase() === 'HSX_VNXALL') {
        self.mrkIndexArr_VNXALLINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNFIN') {
        self.mrkIndexArr_VNFININDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNREAL') {
        self.mrkIndexArr_VNREALINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNSML') {
        self.mrkIndexArr_VNSMLINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNMID') {
        self.mrkIndexArr_VNMIDINDEX.push(msgObj);
    }    if (msgKey.toUpperCase() === 'HSX_VNUTI') {
        self.mrkIndexArr_VNUTIINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNCONS') {
        self.mrkIndexArr_VNCONSINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNALL') {
        self.mrkIndexArr_VNALLINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNSI') {
        self.mrkIndexArr_VNSIINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNENE') {
        self.mrkIndexArr_VNENEINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNIND') {
        self.mrkIndexArr_VNINDINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNMAT') {
        self.mrkIndexArr_VNMATINDEX.push(msgObj);
    } else if (msgKey.toUpperCase() === 'HSX_VNIT') {
        self.mrkIndexArr_VNITINDEX.push(msgObj);
    }

};

self.proc_get_index_hist = (mrkTp) => {
    let arrIndexLength = 0;
    if (mrkTp === 1) {
        // console.log(JSON.stringify(self.mrkIndexArr_VNINDEX))
        if (self.mrkIndexArr_VNINDEX == null || self.mrkIndexArr_VNINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNINDEX.length;
        }
    } else if (mrkTp === 2) {
        if (self.mrkIndexArr_VN30INDEX == null || self.mrkIndexArr_VN30INDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VN30INDEX.length;
        }
    } else if (mrkTp === 3) {
        if (self.mrkIndexArr_HNXINDEX == null || self.mrkIndexArr_HNXINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_HNXINDEX.length;
        }
    } else if (mrkTp === 4) {
        if (self.mrkIndexArr_HNX30INDEX == null || self.mrkIndexArr_HNX30INDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_HNX30INDEX.length;
        }
    } else if (mrkTp === 5) {
        if (self.mrkIndexArr_UPCOMINDEX == null || self.mrkIndexArr_UPCOMINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_UPCOMINDEX.length;
        }
    } else if (mrkTp === 6) {
        if (self.mrkIndexArr_VN100INDEX == null || self.mrkIndexArr_VN100INDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VN100INDEX.length;
        }
    } else if (mrkTp === 7) {
        if (self.mrkIndexArr_VNX50INDEX == null || self.mrkIndexArr_VNX50INDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNX50INDEX.length;
        }
    } else if (mrkTp === 8) {
        if (self.mrkIndexArr_VNXALLINDEX == null || self.mrkIndexArr_VNXALLINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNXALLINDEX.length;
        }
    } else if (mrkTp === 9) {
        if (self.mrkIndexArr_VNFININDEX == null || self.mrkIndexArr_VNFININDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNFININDEX.length;
        }
    } else if (mrkTp === 10) {
        if (self.mrkIndexArr_VNREALINDEX == null || self.mrkIndexArr_VNREALINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNREALINDEX.length;
        }
    } else if (mrkTp === 11) {
        if (self.mrkIndexArr_VNSMLINDEX == null || self.mrkIndexArr_VNSMLINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNSMLINDEX.length;
        }
    } else if (mrkTp === 12) {
        if (self.mrkIndexArr_VNMIDINDEX == null || self.mrkIndexArr_VNMIDINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNMIDINDEX.length;
        }
    } else if (mrkTp === 13) {
        if (self.mrkIndexArr_VNUTIINDEX == null || self.mrkIndexArr_VNUTIINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNUTIINDEX.length;
        }
    } else if (mrkTp === 14) {
        if (self.mrkIndexArr_VNCONSINDEX == null || self.mrkIndexArr_VNCONSINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNCONSINDEX.length;
        }
    } else if (mrkTp === 15) {
        if (self.mrkIndexArr_VNALLINDEX == null || self.mrkIndexArr_VNALLINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNALLINDEX.length;
        }
    } else if (mrkTp === 16) {
        if (self.mrkIndexArr_VNSIINDEX == null || self.mrkIndexArr_VNSIINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNSIINDEX.length;
        }
    } else if (mrkTp === 17) {
        if (self.mrkIndexArr_VNENEINDEX == null || self.mrkIndexArr_VNENEINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNENEINDEX.length;
        }
    } else if (mrkTp === 18) {
        if (self.mrkIndexArr_VNINDINDEX == null || self.mrkIndexArr_VNINDINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNINDINDEX.length;
        }
    } else if (mrkTp === 19) {
        if (self.mrkIndexArr_VNMATINDEX == null || self.mrkIndexArr_VNMATINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNMATINDEX.length;
        }
    } else if (mrkTp === 20) {
        if (self.mrkIndexArr_VNITINDEX == null || self.mrkIndexArr_VNITINDEX === undefined) {
            arrIndexLength = 0;
        } else {
            arrIndexLength = self.mrkIndexArr_VNITINDEX.length;
        }
    }

    if (arrIndexLength > 0) {
        let vnIndex;
        if (mrkTp === 1) { vnIndex = self.mrkIndexArr_VNINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 2) { vnIndex = self.mrkIndexArr_VN30INDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 3) { vnIndex = self.mrkIndexArr_HNXINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 4) { vnIndex = self.mrkIndexArr_HNX30INDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 5) { vnIndex = self.mrkIndexArr_UPCOMINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }

        if (mrkTp === 6) { vnIndex = self.mrkIndexArr_VN100INDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 7) { vnIndex = self.mrkIndexArr_VNX50INDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 8) { vnIndex = self.mrkIndexArr_VNXALLINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 9) { vnIndex = self.mrkIndexArr_VNFININDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 10) { vnIndex = self.mrkIndexArr_VNREALINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 11) { vnIndex = self.mrkIndexArr_VNSMLINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 12) { vnIndex = self.mrkIndexArr_VNMIDINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 13) { vnIndex = self.mrkIndexArr_VNUTIINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 14) { vnIndex = self.mrkIndexArr_VNCONSINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 15) { vnIndex = self.mrkIndexArr_VNALLINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 16) { vnIndex = self.mrkIndexArr_VNSIINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 17) { vnIndex = self.mrkIndexArr_VNENEINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 18) { vnIndex = self.mrkIndexArr_VNINDINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 19) { vnIndex = self.mrkIndexArr_VNMATINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
        if (mrkTp === 20) { vnIndex = self.mrkIndexArr_VNITINDEX.sort(function (a, b) { return ((a.t4 || '09:00:00') > (b.t4 || '09:00:00')) ? 1 : (((b.t4 || '09:00:00') > (a.t4 || '09:00:00')) ? -1 : 0); }); }
                // if (mrkTp === 3) {
        //   this.logMessage(JSON.stringify(vnIndex));
        // }
        let refIndex = 0;
        let i = 0;
        const newVnindex = [];
        let calTime = '';
        for (i = 0; i < vnIndex.length; i++) {
            if ((Number(vnIndex[i]['seq']) + Number(vnIndex[i]['subseq'])) > 0 && vnIndex[i]['U12'] === 0) {
                return;
            }
            if (vnIndex[i]['t4'] === null || vnIndex[i]['t4'] === undefined) {
                calTime = '09:00:00';
            } else {
                calTime = vnIndex[i]['t4'];
            }
            calTime = calTime.substr(0, 8);
            const calTimeSpilit = calTime.split(':', 3);
            let newIndexNode = [];
            if (Number(vnIndex[i]['U12']) === 0 && (vnIndex[i]['seq'] === 0 && vnIndex[i]['subseq'] === 0)) {
                refIndex = Number(vnIndex[i]['t3']);
                if (mrkTp === 1) { self.VN_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 2) { self.VN30_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 3) { self.HNX_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 4) { self.HNX30_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 5) { self.UPCOM_INDEX['ref'] = Number(vnIndex[i]['t3']); }

                if (mrkTp === 6) { self.VN100_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 7) { self.VNX50_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 8) { self.VNXALL_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 9) { self.VNFIN_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 10) { self.VNREAL_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 11) { self.VNSML_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 12) { self.VNMID_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 13) { self.VNUTI_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 14) { self.VNCONS_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 15) { self.VNALL_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 16) { self.VNSI_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 17) { self.VNENE_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 18) { self.VNIND_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 19) { self.VNMAT_INDEX['ref'] = Number(vnIndex[i]['t3']); }
                if (mrkTp === 20) { self.VNIT_INDEX['ref'] = Number(vnIndex[i]['t3']); }


                newIndexNode = [[9, 0, 0], refIndex, 0, refIndex];
                newVnindex.push(newIndexNode);
            } else {
                newIndexNode = [
                    [calTimeSpilit[0], calTimeSpilit[1], calTimeSpilit[2]],
                    Number(vnIndex[i]['t3']),
                    Number(vnIndex[i]['U12']),
                    // Number(vnIndex[i]['t3']) - Number(vnIndex[i]['t5'])
                    refIndex
                ];
                newVnindex.push(newIndexNode);
            }
        }
        let realIndex;
        if (mrkTp === 1) {
            newVnindex.unshift(['Time', 'VNI', 'Vol', 'Ref']);
            realIndex = self.VN_INDEX['indexArr'];
        }
        if (mrkTp === 2) {
            newVnindex.unshift(['Time', 'VN30', 'Vol', 'Ref']);
            realIndex = self.VN30_INDEX['indexArr'];
        }
        if (mrkTp === 3) {
            newVnindex.unshift(['Time', 'HNX', 'Vol', 'Ref']);
            realIndex = self.HNX_INDEX['indexArr'];
        }
        if (mrkTp === 4) {
            newVnindex.unshift(['Time', 'HNX30', 'Vol', 'Ref']);
            realIndex = self.HNX30_INDEX['indexArr'];
        }
        if (mrkTp === 5) {
            newVnindex.unshift(['Time', 'UPCOM', 'Vol', 'Ref']);
            realIndex = self.UPCOM_INDEX['indexArr'];
        }
        if (mrkTp === 6) {
            newVnindex.unshift(['Time', 'VN100', 'Vol', 'Ref']);
            realIndex = self.VN100_INDEX['indexArr'];
        }
        if (mrkTp === 7) {
            newVnindex.unshift(['Time', 'VNX50', 'Vol', 'Ref']);
            realIndex = self.VNX50_INDEX['indexArr'];
        }
        if (mrkTp === 8) {
            newVnindex.unshift(['Time', 'VNXALL', 'Vol', 'Ref']);
            realIndex = self.VNXALL_INDEX['indexArr'];
        }
        if (mrkTp === 9) {
            newVnindex.unshift(['Time', 'VNFIN', 'Vol', 'Ref']);
            realIndex = self.VNFIN_INDEX['indexArr'];
        }
        if (mrkTp === 10) {
            newVnindex.unshift(['Time', 'VNREAL', 'Vol', 'Ref']);
            realIndex = self.VNREAL_INDEX['indexArr'];
        }
        if (mrkTp === 11) {
            newVnindex.unshift(['Time', 'VNSML', 'Vol', 'Ref']);
            realIndex = self.VNSML_INDEX['indexArr'];
        }
        if (mrkTp === 12) {
            newVnindex.unshift(['Time', 'VNMID', 'Vol', 'Ref']);
            realIndex = self.VNMID_INDEX['indexArr'];
        }
        if (mrkTp === 13) {
            newVnindex.unshift(['Time', 'VNUTI', 'Vol', 'Ref']);
            realIndex = self.VNUTI_INDEX['indexArr'];
        }
        if (mrkTp === 14) {
            newVnindex.unshift(['Time', 'VNCONS', 'Vol', 'Ref']);
            realIndex = self.VNCONS_INDEX['indexArr'];
        }
        if (mrkTp === 15) {
            newVnindex.unshift(['Time', 'VNALL', 'Vol', 'Ref']);
            realIndex = self.VNALL_INDEX['indexArr'];
        }
        if (mrkTp === 16) {
            newVnindex.unshift(['Time', 'VNSI', 'Vol', 'Ref']);
            realIndex = self.VNSI_INDEX['indexArr'];
        }
        if (mrkTp === 17) {
            newVnindex.unshift(['Time', 'VNENE', 'Vol', 'Ref']);
            realIndex = self.VNENE_INDEX['indexArr'];
        }
        if (mrkTp === 18) {
            newVnindex.unshift(['Time', 'VNIND', 'Vol', 'Ref']);
            realIndex = self.VNIND_INDEX['indexArr'];
        }
        if (mrkTp === 19) {
            newVnindex.unshift(['Time', 'VNMAT', 'Vol', 'Ref']);
            realIndex = self.VNMAT_INDEX['indexArr'];
        }
        if (mrkTp === 20) {
            newVnindex.unshift(['Time', 'VNIT', 'Vol', 'Ref']);
            realIndex = self.VNIT_INDEX['indexArr'];
        }

        if (realIndex != null && realIndex !== undefined && realIndex.length > 0) {

            if (mrkTp === 1) { self.VN_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 2) { self.VN30_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 3) { self.HNX_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 4) { self.HNX30_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 5) { self.UPCOM_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 6) { self.VN100_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 7) { self.VNX50_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 8) { self.VNXALL_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 9) { self.VNFIN_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 10) { self.VNREAL_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 11) { self.VNSML_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 12) { self.VNMID_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 13) { self.VNUTI_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 14) { self.VNCONS_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 15) { self.VNALL_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 16) { self.VNSI_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 17) { self.VNENE_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 18) { self.VNIND_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 19) { self.VNMAT_INDEX['indexArr'] = newVnindex.concat(realIndex); }
            if (mrkTp === 20) { self.VNIT_INDEX['indexArr'] = newVnindex.concat(realIndex); }
        } else {
            if (newVnindex === undefined) newVnindex = [];
            if (mrkTp === 1) { self.VN_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 2) { self.VN30_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 3) { self.HNX_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 4) { self.HNX30_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 5) { self.UPCOM_INDEX['indexArr'] = newVnindex; }

            if (mrkTp === 6) { self.VN100_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 7) { self.VNX50_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 8) { self.VNXALL_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 9) { self.VNFIN_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 10) { self.VNREAL_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 11) { self.VNSML_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 12) { self.VNMID_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 13) { self.VNUTI_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 14) { self.VNCONS_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 15) { self.VNALL_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 16) { self.VNSI_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 17) { self.VNENE_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 18) { self.VNIND_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 19) { self.VNMAT_INDEX['indexArr'] = newVnindex; }
            if (mrkTp === 20) { self.VNIT_INDEX['indexArr'] = newVnindex; }
        }
    }
}