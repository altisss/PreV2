function subCribeActiveStk (stkCd) {
    if (stkCd === null || stkCd === undefined || stkCd === "") {
      return;
    }
    setTimeout(() => (glb_sv.actStockCode = stkCd), 1000);
    const clientSeq = this.getRqSeq();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = glb_sv.subactive_stk;
    reqInfo.procStat = 0;
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    const arrOne = [];
    arrOne.push(stkCd);
    const msgObj2 = {
      ClientSeq: clientSeq,
      Command: "SUB",
      F1: "*",
      F2: arrOne
    };
    glb_sv.logMessage('subCribeActiveStk');
    glb_sv.logMessage(JSON.stringify(msgObj2));
    this.send2Sv(this.key_ClientReqMRK, JSON.stringify(msgObj2));
    // {"ClientSeq":31,"Command":"SUB","F1":"*","F2":["ACB"]}
    // {"ClientSeq":29,"Command":"SUB","F1":"*","F2":["ACB"]}
};

export {subCribeActiveStk}