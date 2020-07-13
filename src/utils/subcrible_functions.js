import {requestInfo} from '../utils/globalSv/models/requestInfo'
import commuChanel from '../constants/commChanel'
import functionList from '../constants/functionList'
import {update_value_for_glb_sv} from '../utils/update_value_for_glb_sv'

function on_subcribeMrk(component, reqFunct, msg){
    window.ipcRenderer.send(commuChanel.on_subcribeMrk, {component, reqFunct, msg})
}

function subcribeMrk (glb_sv, socket_sv, component, reqFunct, msg) {
    // console.log(stkList);
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = reqFunct
    reqInfo.procStat = 0;
    reqInfo.component = component;
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    const msgObj2 = msg
    msgObj2['ClientSeq'] = clientSeq
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2));
    // console.log('room own subcribeMrk',JSON.stringify(msgObj2));
}




function on_subcribeIndex(arr, component, reqFunct=null, msg=null){
    if (!reqFunct && !msg) window.ipcRenderer.send(commuChanel.on_subcribeIndex, {arr, component})
    else if(reqFunct && !msg) window.ipcRenderer.send(commuChanel.on_subcribeIndex, {arr, component, reqFunct})
    else if(reqFunct && msg) window.ipcRenderer.send(commuChanel.on_subcribeIndex, {arr, component, reqFunct, msg})
}
// chỉ số chart
function subcribeIndex(arr, glb_sv, socket_sv, component, reqFunct=null, msg=null) {

    console.log('subcribeIndex', arr)
    
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = !reqFunct ? functionList.SUBSCRIBE_INDEX_REAL_TIME + `__${component}` : reqFunct
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = !msg ? {Command: 'SUB', F1: 'INDEX', F2: arr } : msg
    msgObj2['ClientSeq'] = clientSeq
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))

}

function on_subcribeIndexList(arr, component, reqFunct, msg){
    if (!reqFunct) window.ipcRenderer.send(commuChanel.on_subcribeIndexList, {arr, component})
    else if(reqFunct && !msg) window.ipcRenderer.send(commuChanel.on_subcribeIndexList, {arr, component, reqFunct})
    else if(reqFunct && msg) window.ipcRenderer.send(commuChanel.on_subcribeIndexList, {arr, component, reqFunct, msg})
}
// mã ck
function subcribeIndexList(stkList, glb_sv, socket_sv, component, reqFunct=null, msg=null) {
    console.log('subcribeIndexList')
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = !reqFunct ? functionList.SUBSCRIBE_INDEX + `__${component}` : reqFunct
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = !msg ? {Command: 'SUB', F1: '*', F2: stkList } : msg
    msgObj2['ClientSeq'] = clientSeq
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))

}

function on_subcribeIndexAll(arr, component,  reqFunct, msg){
    if(reqFunct && msg) window.ipcRenderer.send(commuChanel.on_subcribeIndexAll, {arr: [arr], component, reqFunct, msg})
    else {
        window.ipcRenderer.send(commuChanel.on_subcribeIndexAll, {arr: [arr], component})
    }
}
// sàn 
function subcribeIndexAll(key, glb_sv, socket_sv, component, reqFunct=null, msg=null) {
    console.log('subcribeIndexAll')
    
    let index = '01'
    if (key === 'HNXINDEX') index = '03'
    if (key === 'UPCINDEX') index = '05'
    console.log(index)
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = !reqFunct ? functionList.SUBSCRIBE_INDEX + `__${component}` : reqFunct
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = !msg ? {Command: 'SUB', F1: index, F2: ['*'] } : msg
    msgObj2['ClientSeq'] = clientSeq
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))
}

function on_subcribeListCont(arr, component){
    window.ipcRenderer.send(commuChanel.on_subcribeListCont, {arr, component})
}

function subcribeListCont(stkList, glb_sv, socket_sv, component) {
    console.log('subcribeListCont')
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = functionList.SUBSCRIBE_INDEX_SCROLL + `__${component}`
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = {ClientSeq: clientSeq, Command: 'SUB', F1: '*', F2: stkList }
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))
}

function on_subcribeOneStkFVLt(arr, component){
    window.ipcRenderer.send(commuChanel.on_subcribeOneStkFVLt, {arr: [arr], component})
}

function subcribeOneStkFVL(addStk2Fvl_Stk, glb_sv, socket_sv, component) {
    console.log('subcribeOneStkFVL')
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = functionList.SUBSCRIBE_FVL_ONE + `__${component}`
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = {ClientSeq: clientSeq, Command: 'SUB', F1: '*', F2: addStk2Fvl_Stk }
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))
}


function on_unSubcribeFVL(arr, component){
    window.ipcRenderer.send(commuChanel.on_unSubcribeFVL, {arr, component})
}

function unSubcribeFVL(stkList, glb_sv, socket_sv, component) {
    console.log('unSubcribeFVL')
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = functionList.UNSUBSCRIBE_FVL +  `__${component}`
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = {ClientSeq: clientSeq, Command: 'UNSUB', F1: '*', F2: stkList }
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))

    setTimeout(() => socket_sv.subCribeActiveStk(glb_sv.actStockCode), 500)
}


function on_unSubStkList(component, msg=null){
    if (!msg) window.ipcRenderer.send(commuChanel.on_unSubStkList, {component})
    else if(msg) window.ipcRenderer.send(commuChanel.on_unSubStkList, {component, msg})
}

function unSubStkList(arr, glb_sv, socket_sv, component, msg=null) {
    console.log('unSubStkList')
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo()
    reqInfo.component = component;
    reqInfo.reqFunct = functionList.UNSUBSCRIBE + `__${component}`
    reqInfo.procStat = 0
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    // const msgObj2 = {ClientSeq: clientSeq, Command: 'UNSUB', F1: '*', F2: ['*'] }
    const msgObj2 = !msg ? {Command: 'UNSUB', F1: '*', F2: arr } : msg
    msgObj2['ClientSeq'] = clientSeq
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))
    setTimeout(() => socket_sv.subCribeActiveStk(glb_sv.actStockCode), 500)
}

function on_unsubcribeMrk(component, reqFunct, msg){
    window.ipcRenderer.send(commuChanel.on_unsubcribeMrk, {component, reqFunct, msg})
}

function unsubcribeMrk(glb_sv, socket_sv, component, reqFunc, msg){
    // console.log(stkList);
    const clientSeq = socket_sv.getRqSeq();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = reqFunc;
    reqInfo.procStat = 0;
    reqInfo.component = component
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj2 = msg
    msgObj2['ClientSeq'] = clientSeq
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj2))
}


function on_unsubcribeIndex(arr, component){
    window.ipcRenderer.send(commuChanel.on_unsubcribeIndex, {arr, component})
}

function unsubcribeIndex(arr, glb_sv, socket_sv, component) {
    console.log('unsubcribeIndex', arr)
    // -- Subcribe index theo mảng U8
    const reqInfo = new requestInfo();
    const clientSeq = socket_sv.getRqSeq();
    // const request_seq_comp = get_rq_seq_comp()
    reqInfo.reqFunct = 'UNSUBSCRIBE_INDEX_REAL_TIME_OTHER';
    reqInfo.procStat = 0;
    reqInfo.component = component;
    reqInfo.receiveFunct = ''
    glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    // req_component.set(request_seq_comp, reqInfo)
    const msgObj = {ClientSeq: clientSeq, 'Command': 'UNSUB', 'F1': 'INDEX', 'F2': arr };
    socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj));
    // window.ipcRenderer.send(commuChanel.send_req, {
    //   req_component:{
    //     component: reqInfo.component,
    //     request_seq_comp: request_seq_comp,
    //     channel: socket_sv.key_ClientReqMRK,
    //     reqFunct: reqInfo.reqFunct,
    //     msgObj: msgObj
    //   }, 
    //   svInputPrm:{}
    // })
  }


export {
        subcribeIndex, 
        subcribeIndexList, 
        subcribeIndexAll, 
        subcribeListCont, 
        subcribeOneStkFVL,
        subcribeMrk,
        unSubcribeFVL, 
        unSubStkList, 
        unsubcribeIndex,
        unsubcribeMrk,

        on_subcribeIndex,
        on_subcribeIndexList,
        on_subcribeIndexAll,
        on_subcribeListCont,
        on_subcribeOneStkFVLt,
        on_subcribeMrk,
        on_unSubcribeFVL,
        on_unSubStkList,
        on_unsubcribeIndex,
        on_unsubcribeMrk
    }
