import commuChanel from '../constants/commChanel'



function getMsgObjectByMsgKey(msgKey, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST) {
    if (msgKey.substr(0, 3) === 'HSX') {
        // console.log(this.HSX_PRC_LIST)
        return HSX_PRC_LIST.find(o => o.itemName === msgKey);
      } else if (msgKey.substr(0, 3) === 'HNX') {
        let msgObj = HNX_PRC_LIST.find(o => o.itemName === msgKey);
        let stkCd = '';
        if (msgObj != null && msgObj !== undefined) {
          stkCd = msgObj.t55;
          if (stkCd === msgKey.substr(4)) {
            return msgObj;
          }
        }
        if (msgObj == null || msgObj === undefined) {
          msgObj = UPC_PRC_LIST.find(o => o.itemName === msgKey);
        }
        return msgObj;
      }
      return null;
};

export {getMsgObjectByMsgKey}