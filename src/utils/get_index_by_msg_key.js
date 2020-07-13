

function getIndexByMsgKey(msgKey, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST){
        let indexObj
        if (msgKey.substr(0, 3) === 'HSX') {
        indexObj = HSX_PRC_LIST.findIndex(o => o.itemName === msgKey);
        } else if (msgKey.substr(0, 3) === 'HNX') {
        indexObj = HNX_PRC_LIST.findIndex(o => o.itemName === msgKey);
        if (indexObj == null || indexObj === undefined || indexObj < 0) {
            indexObj = UPC_PRC_LIST.findIndex(o => o.itemName === msgKey);
        }
        }
        if (indexObj === -1) {
        indexObj = null;
        }
        return indexObj;
};
export {getIndexByMsgKey}