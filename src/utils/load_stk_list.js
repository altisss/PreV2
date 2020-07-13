import { requestInfo } from '../utils/globalSv/models/requestInfo'
import commuChanel from '../constants/commChanel'
import socket_sv from '../utils/globalSv/service/socket_service'
import { on_subcribeIndex } from './subcrible_functions'
import functionList from '../constants/functionList'
import { update_value_for_glb_sv } from './update_value_for_glb_sv'

function load_stk_list(req_component, request_seq_comp, component) {
  const reqInfo = new requestInfo();
  // const request_seq_comp = this.get_rq_seq_comp()
  reqInfo.reqFunct = functionList.getStk_list;
  reqInfo.procStat = 0;
  reqInfo.reqTime = new Date();
  reqInfo.receiveFunct = ''

  reqInfo.component = component;
  req_component.set(request_seq_comp, reqInfo)
  const msgObj = { 'Command': 'STKLIST' }
  window.ipcRenderer.send(commuChanel.send_req, {
    req_component: {
      component: reqInfo.component,
      request_seq_comp: request_seq_comp,
      channel: socket_sv.key_ClientReqMRK,
      reqFunct: reqInfo.reqFunct,
      msgObj: msgObj
    },
    svInputPrm: {}
  })
}


function load_tradview_stk_list(req_component, request_seq_comp, component, get_value_from_glb_sv_seq, arrdefault = []) {
  const values = ['getLast_Imsg', 'tradingViewPage', 'getIndexHist']
  const sq1 = get_value_from_glb_sv_seq()
  window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: component, value: values, sq: sq1 })
  window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq1}`, (event, agrs) => {
    const getLast_Imsg = agrs.get('getLast_Imsg')
    const tradingViewPage = agrs.get('tradingViewPage')
    const getIndexHist = agrs.get('getIndexHist')
    // console.log(tradingViewPage)

    const clientSeq_main = request_seq_comp()
    const reqInfo_main = new requestInfo()
    reqInfo_main.component = component;
    reqInfo_main.reqFunct = getLast_Imsg
    reqInfo_main.procStat = 0
    reqInfo_main.reqTime = new Date()
    reqInfo_main.receiveFunct = ''
    req_component.set(clientSeq_main, reqInfo_main)
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
    const msgObj_main = { Command: 'LAST_MSG', F1: 'I' }
    // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj_main))
    // this.subcribeIndex()
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo_main.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReqMRK,
        reqFunct: reqInfo_main.reqFunct,
        msgObj: msgObj_main
      },
      svInputPrm: {}
    })
    // -- Subcribe index 3 sàn lớn
    console.log('-- Subcribe index 3 sàn lớn')
    const arr = ['HSX|I|HSXIndex', 'HNX|I|HNXIndex', 'HNX|I|HNXUpcomIndex']
    // subcribeIndex(arr, req_component, request_seq_comp, component)
    on_subcribeIndex(arr, component)
    if (arrdefault.length > 0) {
      //subcribe index cac sàn con
      // console.log(arrdefault)
      on_subcribeIndex(arrdefault, component)
    }

    if (!tradingViewPage) {
      console.log('getIndexHist')
      // console.log('if')
      const clientSeq = request_seq_comp()
      const reqInfo = new requestInfo()
      reqInfo.component = component;
      req_component.set(clientSeq, reqInfo)
      reqInfo.reqFunct = getIndexHist + 'HSX'
      reqInfo.procStat = 0
      reqInfo.reqTime = new Date()
      reqInfo.receiveFunct = ''
      // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
      const msgObj = { Command: 'INDEX_MSG', F1: 'HSX|I|HSXIndex' }
      // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj))

      window.ipcRenderer.send(commuChanel.send_req, {
        req_component: {
          component: reqInfo.component,
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReqMRK,
          reqFunct: reqInfo.reqFunct,
          msgObj: msgObj
        },
        svInputPrm: {}
      })

      const clientSeq2 = request_seq_comp()
      const reqInfo2 = new requestInfo()
      reqInfo2.component = component;
      reqInfo2.reqFunct = getIndexHist + 'HNX'
      reqInfo2.procStat = 0
      reqInfo2.reqTime = new Date()
      reqInfo2.receiveFunct = ''
      req_component.set(clientSeq2, reqInfo2)
      // glb_sv.setReqInfoMapValue(clientSeq2, reqInfo2)
      const msgObj2 = { Command: 'INDEX_MSG', F1: 'HNX|I|HNXIndex' }
      // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj1))
      window.ipcRenderer.send(commuChanel.send_req, {
        req_component: {
          component: reqInfo2.component,
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReqMRK,
          reqFunct: reqInfo2.reqFunct,
          msgObj: msgObj2
        },
        svInputPrm: {}
      })

      const clientSeq3 = request_seq_comp()
      const reqInfo3 = new requestInfo()
      reqInfo3.component = component;
      reqInfo3.reqFunct = getIndexHist + 'UPC'
      reqInfo3.procStat = 0
      reqInfo3.reqTime = new Date()
      reqInfo3.finishIndex = 'finish3GetIndex'
      reqInfo3.receiveFunct = ''
      req_component.set(clientSeq3, reqInfo3)
      // glb_sv.setReqInfoMapValue(clientSeq3, reqInfo3)
      const msgObj3 = { Command: 'INDEX_MSG', F1: 'HNX|I|HNXUpcomIndex' }
      // socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj1))
      window.ipcRenderer.send(commuChanel.send_req, {
        req_component: {
          component: reqInfo3.component,
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReqMRK,
          reqFunct: reqInfo3.reqFunct,
          msgObj: msgObj3
        },
        svInputPrm: {}
      })
      update_value_for_glb_sv({ component: component, key: 'finishGetImsg', value: true })
    } else {
      console.log('finishGetImsg')
      update_value_for_glb_sv({ component: component, key: 'finishGetImsg', value: true })
      // glb_sv.finishGetImsg = true
    }
  })
  // -- send request to get lastest of "I" msg market
}


export { load_stk_list, load_tradview_stk_list }