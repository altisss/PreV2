import commuChanel from '../constants/commChanel'
import { inform_broadcast } from "./broadcast_service"
import { update_value_for_glb_sv } from './update_value_for_glb_sv'

function updateFvlGroup(actionTp = 0, fvlId = 0, fvlNm = '', get_value_from_glb_sv_seq, component) {
    const sq = get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: component, value: 'FVL_STK_LIST', sq:sq})
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, FVL_STK_LIST) => {
        if (actionTp !== 0 && actionTp !== 1 && actionTp !== 2) { return; };
        if (fvlId == null) { return; }
        if (actionTp === 0) {
          if (fvlNm == null || fvlNm.trim().length === 0) { return; }
          const fvlObj = { GRP_ID: fvlId, GRP_NM: fvlNm, STK_LIST: [], FVL_PRICEBOARD: [] };
          FVL_STK_LIST.push(fvlObj);
          update_value_for_glb_sv({component: component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
          const msg = { type: commuChanel.UPDATE_GRP_FVL, component: component};
          inform_broadcast(commuChanel.UPDATE_GRP_FVL, msg)
        //   this.commonEvent.next(msg);
        } else {
          const fvlLength = FVL_STK_LIST.length;
          let i = 0;
          for (i = 0; i < fvlLength; i++) {
            if (FVL_STK_LIST[i]['GRP_ID'] === fvlId) {
              if (actionTp === 1) {
                FVL_STK_LIST.splice(i, 1);
                update_value_for_glb_sv({component: component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
              } else {
                FVL_STK_LIST[i]['GRP_NM'] = fvlNm;
                update_value_for_glb_sv({component: component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
              }
              const msg = { type: commuChanel.UPDATE_GRP_FVL, component: component };
              inform_broadcast(commuChanel.UPDATE_GRP_FVL, msg)
            //   this.commonEvent.next(msg);
              return;
            }
          }
        }
        return;
    })
    // console.log('updateFvlGroup',this.FVL_STK_LIST);
    
}
export {updateFvlGroup};