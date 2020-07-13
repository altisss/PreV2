import { getIndexByMsgKey } from "./get_index_by_msg_key"
import commuChanel from '../constants/commChanel'
import { inform_broadcast } from "./broadcast_service"
import { update_value_for_glb_sv } from "./update_value_for_glb_sv"


function update_stock_to_Fvl(actionTp = 0, fvlId = 0, stkCd = '', component, get_value_from_glb_sv_seq) {
    const sq= get_value_from_glb_sv_seq()
    // window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: 'FVL_STK_LIST'})
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: ['FVL_STK_LIST', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
        const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
        const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
        const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
        const FVL_STK_LIST = agrs.get('FVL_STK_LIST')
        console.log(FVL_STK_LIST)
        if (actionTp !== 0 && actionTp !== 1) { return; } // -- 0 -> Add stk, 1 -> Remove stk
        if (fvlId == null || stkCd.trim().length === 0) { return; }
        const fvlLength = FVL_STK_LIST.length;
        let i = 0;
        for (i = 0; i < fvlLength; i++) {
          if (FVL_STK_LIST[i]['GRP_ID'] === fvlId) {
            if (actionTp === 0) {
              let msgObj, index;
              // index = this.glbStore.msgMrkInfoArr_indexMap.get('HSX_' + stkCd.trim());
            //   index = this.getIndexByMsgKey('HSX_' + stkCd.trim());
              index = getIndexByMsgKey('HSX_' + stkCd.trim(), HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
              if (index != null && index !== undefined) {
                msgObj = HSX_PRC_LIST[index];
              }
              if (msgObj == null || msgObj === undefined) {
                // index = this.glbStore.msgMrkInfoArr_indexMap.get('HNX_' + stkCd.trim());
                // index = this.getIndexByMsgKey('HNX_' + stkCd.trim());
                index = getIndexByMsgKey('HNX_' + stkCd.trim(), HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (index != null && index !== undefined) {
                  msgObj = HNX_PRC_LIST[index];
                  if (msgObj == null || msgObj === undefined || msgObj['t55'] !== stkCd.trim()) {
                    msgObj = UPC_PRC_LIST[index];
                  }
                }
              }
              if (msgObj != null && msgObj !== undefined) {
                FVL_STK_LIST[i]['STK_LIST'].push(stkCd.trim());
                FVL_STK_LIST[i]['FVL_PRICEBOARD'].push(msgObj);
                update_value_for_glb_sv({component: component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
              }
              // console.log('updateFvlGroup',this.FVL_STK_LIST);
              const msg = { type: commuChanel.UPDATE_FVL, GRP_ID: fvlId , component: component};
            //   this.commonEvent.next(msg);
              inform_broadcast(commuChanel.UPDATE_FVL, msg)
              return;
            } else {
              const fvlgrpLength = FVL_STK_LIST[i]['FVL_PRICEBOARD'].length;
              let j = 0, index = 0;
              let stkPriceB;
              for (j = 0; j < fvlgrpLength; j++) {
                stkPriceB = FVL_STK_LIST[i]['FVL_PRICEBOARD'][j]['t55'];
                if (stkPriceB != null && stkPriceB.trim() === stkCd.trim()) {
                  index = FVL_STK_LIST[i]['STK_LIST'].indexOf(stkCd.trim());
                  if (index >= 0) {
                    FVL_STK_LIST[i]['STK_LIST'].splice(index, 1)
                    update_value_for_glb_sv({component: component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
                  }
                  FVL_STK_LIST[i]['FVL_PRICEBOARD'].splice(j, 1);
                  update_value_for_glb_sv({component: component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
                  // console.log('updateFvlGroup',this.FVL_STK_LIST);
                  const msg = { type: commuChanel.UPDATE_FVL, GRP_ID: fvlId , component: component};
                //   this.commonEvent.next(msg);
                  inform_broadcast(commuChanel.UPDATE_FVL, msg)
                  return;
                }
              }
            }
          }
        }
    
        return;
        })
};

export {update_stock_to_Fvl}