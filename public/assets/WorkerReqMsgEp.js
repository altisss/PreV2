self.autionTimePrcObj = []
self.autionTimeUnixPrcObj = []
self.autionTimePrcObjChart = []

self.onmessage = function(event) {
    const msgInfo = JSON.parse(event.data)
    self.autionTimePrcObj = []
    self.autionTimeUnixPrcObj = []
    self.autionTimePrcObjChart = []
    let i = 0
    for (i = 0; i < msgInfo.data.length; i++) {
        self.sprocess_ForOneMsg(msgInfo.data[i], msgInfo.t260)
    }
    let obj = {
        '1': self.autionTimePrcObj,
        '2': self.autionTimePrcObjChart,
        '3': msgInfo.key,
        '4': self.autionTimeUnixPrcObj,
    }
    postMessage(JSON.stringify(obj))
}

self.sprocess_ForOneMsg = (msgObj, t260) => {
    const sendtime = msgObj['t52'].substr(9)
    if (sendtime.length !== 8) {
        return
    }
    const seq = msgObj['seq']
    let subseq = msgObj['subseq']
    if (subseq == null || subseq === undefined) {
        subseq = 0
    }
    const sendTimeSplit = sendtime.split(':', 3)
    const sendtimeArr = [Number(sendTimeSplit[0]), Number(sendTimeSplit[1]), Number(sendTimeSplit[2])]
    const today = new Date()
    const dateTimes = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        Number(sendTimeSplit[0]),
        Number(sendTimeSplit[1]),
        Number(sendTimeSplit[2])
    )
    const unixtime = dateTimes.getTime() / 1000
    const matchPrice = Number(msgObj['t31'])
    const matchVolum = Number(msgObj['t32'])
    // let find = false;
    if (self.autionTimePrcObj.length > 0) {
        const objFind = self.autionTimePrcObj.find(o => o.c3 === seq && o.c4 === subseq)
        if (objFind) {
            return
        }
        self.autionTimePrcObj.push({
            c0: sendtime,
            c1: matchVolum,
            c2: matchPrice,
            c3: seq,
            c4: subseq,
        })
        self.autionTimeUnixPrcObj.push({
            c0: unixtime,
            c1: matchVolum,
            c2: matchPrice,
            c3: seq,
            c4: subseq,
        })
        const newObj = [sendtimeArr, matchPrice, matchVolum, t260]
        self.autionTimePrcObjChart.splice(2, 0, newObj)
        // const newObj = [sendtimeArr, matchPrice, matchVolum, t260];
        // console.log('vào clientSeq>0: ' + JSON.stringify(newObj));
        // self.autionTimePrcObjChart.push(newObj);
    } else {
        self.autionTimePrcObj = []
        self.autionTimeUnixPrcObj = []
        self.autionTimePrcObjChart = []
        self.autionTimePrcObj.push({
            c0: sendtime,
            c1: matchVolum,
            c2: matchPrice,
            c3: seq,
            c4: subseq,
        })
        self.autionTimeUnixPrcObj.push({
            c0: unixtime,
            c1: matchVolum,
            c2: matchPrice,
            c3: seq,
            c4: subseq,
        })
        let labelObj = ['Time', 'Price', 'Volume', 'Ref']
        self.autionTimePrcObjChart.push(labelObj)
        labelObj = [[9, 0, 0], null, null, t260]
        self.autionTimePrcObjChart.push(labelObj)
        const newObj = [sendtimeArr, matchPrice, matchVolum, t260]
        self.autionTimePrcObjChart.push(newObj)
        // console.log('vào not found, : self.autionTimePrcObjChart' + JSON.stringify(self.autionTimePrcObjChart));
    }
}
