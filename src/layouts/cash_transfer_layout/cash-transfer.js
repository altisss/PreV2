import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import SelectBasic from "../../conponents/basic/selectBasic/SelectBasic";
import { toast } from 'react-toastify';
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { focusELM } from '../../utils/focus_elm'
import { filterNumber } from '../../utils/filterNumber'
import HistoryList from '../../conponents/history_table_for_cash_transaction/history/historyList'
import SearchAccount from '../../conponents/search_account/SearchAccount';


const remote = require('electron').remote;
// import _ from "lodash";

class CashTransfer extends PureComponent {
  constructor(props) {
    super(props)
    this.request_seq_comp = 0
    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.popin_window = this.popin_window.bind(this)
    this.req_component = new Map();
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)

      })
    }
    this.state = {
      transCashObj: {
        acntNo: '',
        acntNoRcv: '',
        bankAcnt_rcv: null,
        cashAvaiable: null,
        trans_amt: '',
        trans_amt_require: false,
        note: null,
        bankinfo: null
      },
      acntItemsRcv: [],
      acntItems: [],
      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
    }
  }
  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }


  // -- transfer function
  transCash_FunctNm = 'TRANSCASH_001';
  transCashFunct_ReqTimeOut;
  // -- get cash available informations
  getCashAvaibleFlag = false;
  getCashAvaible_FunctNm = 'TRANSCASH_002';
  getCashAvaibleFunct_ReqTimeOut;
  // -- get transfer transaction list
  transCashListDataTable = [];
  transCashListTemple = [];
  getTransCashListFlag = false;
  getTransCashList_FunctNm = 'TRANSCASH_003';
  getTransCashListFunct_ReqTimeOut;
  // -- get account list which transferable
  getAcntTransListFlag = false;
  getAcntTransList_FunctNm = 'TRANSCASH_004';


  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
        name: this.props.name,
        language: this.props.language,
        themePage: this.props.themePage,
        style: this.props.style
      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      this.transCashObj = agrs.state.transCashObj
      // this.bankConn['acntNo'] = agrs.state.bankConn['acntNo']
      // this.bankConn['cashAmt'] = agrs.state.bankConn['cashAmt']
      // this.bankConn['cashAvail'] = agrs.state.bankConn['cashAvail']
      // this.bankConn['connectStatus'] = agrs.state.bankConn['connectStatus']

    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)

    })

  }


  componentDidMount() {
    this.transCashObj = this.state.transCashObj;

    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      // glb_sv.themePage = agrs
      this.setState({ themePage: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      // glb_sv.language = agrs
      this.setState({ language: agrs })
    })

    window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
      this.popin_window()
    })

    window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
      window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
    })

    window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
      bf_popout(this.component, this.props.node, this.state)
    })

    window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
      // console.log('this.req_component', agrs, this.req_component);
      reply_send_req(agrs, this.req_component)
    })

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfmCashTransfer) this.setState({ cfmCashTransfer: false });
      // else {
      //   const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
      //   // glb_sv.commonEvent.next(msg);
      //   inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      // }
    })

    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'openModalCashTransfer') this.setState({ cfmCashTransfer: true });
    })

    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      glb_sv.objShareGlb = agrs.objShareGlb;
    })
    this.delayLoadData();
  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    this.request_seq_comp = 0
    if (this.transCashFunct_ReqTimeOut) { clearTimeout(this.transCashFunct_ReqTimeOut); }
    if (this.getCashAvaibleFunct_ReqTimeOut) { clearTimeout(this.getCashAvaibleFunct_ReqTimeOut); }
    if (this.getTransCashListFunct_ReqTimeOut) { clearTimeout(this.getTransCashListFunct_ReqTimeOut); }
  }

  delayLoadData() {
    if (!glb_sv.flagProcessPopout) {
      this.loadData();
    } else {
      setTimeout(() => {
        this.loadData();
      }, 100);
    }
  }

  loadData() {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')
      const activeAcnt = agrs.get('activeAcnt')
      // update session for popout windows
      glb_sv.objShareGlb = objShareGlb

      this.acntItems = objShareGlb['acntNoList'];
      let acntStr = '';
      if (activeAcnt !== '' && activeAcnt !== '' &&
        activeAcnt.substr(11) !== '%') {
        acntStr = activeAcnt;
      } else {
        acntStr = this.acntItems[0]['id'];
      }
      this.transCashObj['acntNo'] = acntStr;
      // this.getRcvSubno(acntStr);
      this.transCashObj['bankAcnt_rcv'] = '';
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1].substr(0, 2);
      console.log('loadData')
      this.getCashAvaiableInfo();
      this.getTransferCashTransactionList();
      this.getOtherAcntsTransList();
      this.setState({ acntItems: this.acntItems });
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          acntNo: this.transCashObj.acntNo,
          bankAcnt_rcv: this.transCashObj.bankAcnt_rcv
        }
      }))
    })

  }



  getTransCashListResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getTransCashListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getTransCashListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code'], this.component)
      }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.transCashListTemple = this.transCashListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getTransCashListFlag = false;
        this.transCashListDataTable = this.transCashListTemple;
      }
    }
  }

  getCashAvaibleResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getCashAvaibleFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    this.getCashAvaibleFlag = false;
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code'], this.component)
      }
      return;
    } else {
      let jsondata, value;
      try {
        jsondata = JSON.parse(message['Data']);
        if (!isNaN(Number(jsondata[0]['c5']))) value = Number(jsondata[0]['c5']);
        else value = 0;
        this.transCashObj['cashAvaiable'] = value;
        this.setState(prevState => ({
          transCashObj: {
            ...prevState.transCashObj,
            cashAvaiable: this.transCashObj['cashAvaiable'],
          }
        }))
      } catch (err) {
        // glb_sv.logMessage(err);
        this.transCashObj['cashAvaiable'] = 0;
        this.setState(prevState => ({
          transCashObj: {
            ...prevState.transCashObj,
            cashAvaiable: 0,
          }
        }))
      }
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }
  }

  transCashResultProc = (reqInfoMap, message) => {
    clearTimeout(this.transCashFunct_ReqTimeOut);
    this.transCashFlag = false;
    this.setState({ transCashFlag: false });
    this.setState({ cfmCashTransfer: false })
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, null, this.component)
        this.setState({ cfmCashTransfer: false });
      }
    } else {

      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', null, null, this.component);
      this.transCashObj.trans_amt = 0;
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          trans_amt: this.transCashObj.trans_amt
        }
      }))
      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }

  getAcntTransListResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getAcntTransListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    this.getAcntTransListFlag = false;
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', '', message['Code'], this.component)
      }
      return;
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);

        this.acntItemsRcv = jsondata.map(item => {
          const newItem = {};
          newItem.id = item.c0 + '.' + item.c1;
          newItem.name = item.c2;
          return newItem;
        });

        this.setState({ acntItemsRcv: this.acntItemsRcv });
        if (this.acntItemsRcv.length > 0) this.transCashObj['acntNoRcv'] = this.acntItemsRcv[0].id;
        this.setState(prevState => ({
          transCashObj: {
            ...prevState.transCashObj,
            acntNoRcv: this.transCashObj['acntNoRcv']
          }
        }))
      } catch (err) {
        // glb_sv.logMessage(err);
        this.acntTransList = [];
      }
      // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    }
  }

  // --- get orderlist function
  getOtherAcntsTransList = () => {
    if (this.getAcntTransListFlag) { return; }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '');
    //   return;
    // }
    this.getAcntTransListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getAcntTransListResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getAcntTransList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getAcntTransListResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_Common';
    //(in_1: 09, in_2: Tài khoản chuyển, in_3: Tiểu khoản chuyển)  
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['09', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getAcntTransListFunct_ReqTimeOut = setTimeout(this.solvingTransCash_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.transCashObj['acntNoRcv'] = [];
    this.setState(prevState => ({
      transCashObj: {
        ...prevState.transCashObj,
        acntNoRcv: []
      }
    }))
    this.req_component.set(request_seq_comp, reqInfo)
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }

  getRcvSubno = (acntinfo) => {
    const rcvAcntList = [];
    if (acntinfo === null || acntinfo === '') {
      return;
    }
    for (let i = 0; i < this.acntItems.length; i++) {
      if (this.acntItems[i]['id'].substr(0, 10) === acntinfo.substr(0, 10) && this.acntItems[i]['id'] !== acntinfo) {
        rcvAcntList.push(this.acntItems[i]);
      }
    }

    this.setState({ acntItemsRcv: rcvAcntList });
    if (rcvAcntList.length > 0) {
      this.transCashObj['acntNoRcv'] = rcvAcntList[0]['id'];
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          acntNoRcv: this.transCashObj['acntNoRcv']
        }
      }))
    } else {
      this.transCashObj['acntNoRcv'] = '';
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          acntNoRcv: '',
        }
      }))
    }
  }

  // -- get cash information
  getCashAvaiableInfo = () => {
    if (this.getCashAvaibleFlag) { return; }
    this.getCashAvaibleFlag = true;

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getCashAvaibleResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getCashAvaible_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getCashAvaibleResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_0201_3';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getCashAvaibleFunct_ReqTimeOut = setTimeout(this.solvingTransCash_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    reqInfo.inputParam = svInputPrm.InVal;
    this.req_component.set(request_seq_comp, reqInfo)
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }

  // --- get orderlist function
  getTransferCashTransactionList = () => {
    if (this.getTransCashListFlag) { return; }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
    //   return;
    // }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }
    this.getTransCashListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getTransCashListResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getTransCashList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getTransCashListResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_0201_3';


    svInputPrm.ClientSentTime = '0';

    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['3', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    // console.log(JSON.stringify(svInputPrm))
    this.getTransCashListFunct_ReqTimeOut = setTimeout(this.solvingTransCash_TimeOut,
      functionList.reqTimeout, request_seq_comp);

    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.transCashListTemple = [];
    this.req_component.set(request_seq_comp, reqInfo)
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }

  solvingTransCash_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    this.setState({ refreshFlag: '' });
    console.log('solvingTransCash_TimeOut',reqIfMap.reqFunct )
    if (reqIfMap.reqFunct === this.getCashAvaible_FunctNm) {
      this.getCashAvaibleFlag = false;
    } else if (reqIfMap.reqFunct === this.getTransCashList_FunctNm) {
      this.getTransCashListFlag = false;
    } else if (reqIfMap.reqFunct === this.transCash_FunctNm) {
      this.setState({ transCashFlag: false });
      this.transCashFlag = false;
    } else if (reqIfMap.reqFunct === this.getAcntTransList_FunctNm) {
      this.getAcntTransListFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', '', '', this.component)

  }

  openConfirmSendTransCash = () => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      const acntNoRcv = this.transCashObj['acntNoRcv'];

      if (acntNoRcv === null || acntNoRcv === undefined || acntNoRcv.length <= 10) {
        focusELM('transCashObj_acntNoRcv');
        glb_sv.checkToast(toast, 'warn', this.props.t('choose_receiv_subacnt'), 'transCash_not_rece_sub');
        return;
      }
      const trans_amtStr = this.transCashObj['trans_amt'];
      const cashAvaiable = this.transCashObj['cashAvaiable'];
      let trans_amt = filterNumber(trans_amtStr);
      if (trans_amt === null || trans_amt === undefined || isNaN(trans_amt)) { trans_amt = 0; }
      if (this.state.transCashObj.trans_amt === null || this.state.transCashObj.trans_amt === '') {
        focusELM('transCashObj_trans_amt');
        glb_sv.checkToast(toast, 'warn', this.props.t('transfer_cash_require'), 'transCash_require');
        return;
      }
      if (Number(trans_amt) <= 0) {
        focusELM('transCashObj_trans_amt');
        glb_sv.checkToast(toast, 'warn', this.props.t('transfer_amount_must_over_zero'), 'transCash_not_zezo');
        return;
      };
      if (Number(cashAvaiable) < Number(trans_amt)) {
        focusELM('transCashObj_trans_amt');
        glb_sv.checkToast(toast, 'warn', this.props.t('transfer_amount_over_available'), 'transCash_not_avail');
        return;
      };
      if (!glb_sv.checkOtp('openModalCashTransfer')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
        }
        return;
      };
      this.setState({ cfmCashTransfer: true });
    })


  }

  /////////////////////////////////////

  onAcntChange = (e, key) => {
    const acntNo = e.target.value;
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      let activeAcnt = args.get('activeAcnt')
      const objShareGlb = args.get('objShareGlb')

      // update session for popout window
      glb_sv.objShareGlb = objShareGlb


      this.transCashObj.acntNoRcv = acntNo;
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          acntNoRcv: this.transCashObj.acntNoRcv,
        }
      }))
    })

  }

  handleChangePrice = (e) => {
    const value = filterNumber(e.target.value);
    if (value > 999) { this.transCashObj.trans_amt = FormatNumber(value); }
    else this.transCashObj.trans_amt = value;
    this.setState(prevState => ({
      transCashObj: {
        ...prevState.transCashObj,
        trans_amt: this.transCashObj.trans_amt
      }
    }))
  }

  validateInput = () => {
    if (this.state.transCashObj.trans_amt === null || this.state.transCashObj.trans_amt === "" || this.state.transCashObj.trans_amt === 0) {
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          trans_amt_requite: true
        }
      })
      );
    } else {
      this.setState(prevState => ({
        transCashObj: {
          ...prevState.transCashObj,
          trans_amt_requite: false
        }
      })
      );
    }
  }

  // -- send request to withdraw
  sendTransferCashConfirm = (cfmTp) => {
    this.transCashFlag = false;
    if (this.transCashFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfmCashTransfer: false })
      return;
    }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
    //   return;
    // }
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      //update session for popout component
      glb_sv.objShareGlb = objShareGlb

      const trans_amtStr = this.transCashObj['trans_amt'];
      const trans_amt = filterNumber(trans_amtStr);
      const noteInfo = this.transCashObj['note']
      const acntNoRcv = this.transCashObj['acntNoRcv'];
      const pieces_to = acntNoRcv.split('.');
      const acntNo_to = pieces_to[0];
      const subNo_to = pieces_to[1];
      this.transCashFlag = true;
      this.setState({ transCashFlag: true });
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap transCashResultProc
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.transCash_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.transCashResultProc
      // -- service info
      let svInputPrm = new serviceInputPrm();
      // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
      svInputPrm.WorkerName = 'ALTxCash';
      // svInputPrm.ServiceName = 'ALTxCash_0201_3';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'I';
      if (this.actn_curr === acntNo_to) {
        svInputPrm.ServiceName = 'ALTxCash_0201_3';
        svInputPrm.InVal = [this.actn_curr, this.sub_curr, acntNo_to, subNo_to, trans_amt + '', noteInfo];
      } else {
        svInputPrm.ServiceName = 'ALTxCash_0201_2';
        svInputPrm.InVal = [this.actn_curr, this.sub_curr, '4', '1', '', '', trans_amt + '', '0', noteInfo,
          '', '', '', '', '', '', acntNo_to, subNo_to];
      }
      // svInputPrm.InVal = [this.actn_curr, this.sub_curr, acntNo_to, subNo_to, trans_amt + '', noteInfo];
      svInputPrm.TotInVal = svInputPrm.InVal.length;

      this.transCashFunct_ReqTimeOut = setTimeout(this.solvingTransCash_TimeOut,
        functionList.reqTimeout, request_seq_comp);
      reqInfo.inputParam = svInputPrm.InVal;
      this.req_component.set(request_seq_comp, reqInfo)
      window.ipcRenderer.send(commuChanel.send_req, {
        req_component: {
          component: reqInfo.component,
          request_seq_comp: request_seq_comp,
          channel: socket_sv.key_ClientReq
        },
        svInputPrm: svInputPrm
      })
    })

  }
  modalAfterOpened = () => {
    const elm = document.getElementById('bt_sendTransCashOk');
    if (elm) elm.focus();
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;

    if (name === 'transCashObj_trans_amt' && code === 13) {
      this.openConfirmSendTransCash();
    }

  }

  handleChangeAccount = ({ value, label }) => {
    this.activeAcnt = value;
    this.transCashObj.acntNo = value;
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.transCashListDataTable = [];
    this.transCashObj['cashAvaiable'] = 0;
    this.setState(prevState => ({
      transCashObj: {
        ...prevState.transCashObj,
        acntNo: this.transCashObj.acntNo,
        cashAvaiable: this.transCashObj.cashAvaiable
      }
    }));
    if (!glb_sv.flagProcessPopout) {
      this.getOtherAcntsTransList();
      this.getCashAvaiableInfo();
      this.getTransferCashTransactionList();
    };
  }

  render() {
    const { t } = this.props
    return (
      <div className='cash-transfer ' style={{ paddingTop: 10 }}>
        <div className="card form-cash-transaction">
          <div className="card-body widget-body">
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('trans_sub_account')}</label>
              <div className='col-sm-7 no-padding-left'>
                <SearchAccount
                  handleChangeAccount={this.handleChangeAccount}
                  component={this.component}
                  req_component={this.req_component}
                  get_rq_seq_comp={this.get_rq_seq_comp}
                  get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                  language={this.props.language}
                  themePage={this.props.themePage}
                  style={this.props.style}
                  isShowDetail={true}
                />
              </div>

            </div>
            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('cash_available')}
              </label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.transCashObj.cashAvaiable)}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('receive_sub_account')}</label>
              <div className='col-sm-7 no-padding-left'>
                <SelectBasic
                  inputtype={"text"}
                  name={"transCashObj_acntNoRcv"}
                  value={this.state.transCashObj.acntNoRcv}
                  options={this.state.acntItemsRcv}
                  onChange={(e) => this.onAcntChange(e, 2)}
                  classextend={'form-control-sm'}
                />
              </div>
            </div>

            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('transfer_amount')}<span className="mustInput">*</span></label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"transCashObj_trans_amt"}
                  value={this.state.transCashObj.trans_amt}
                  onChange={this.handleChangePrice}
                  onBlur={this.validateInput}
                  onKeyDown={this.handleKeyPress}
                  classextend={'form-control-sm text-right'}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-group row" style={{ marginTop: 25 }}>
              <div className='col-sm fullWidthButton'>
                <button className="btn btn-pill btn-sm btn-block pull-right btn-wizard" onClick={this.openConfirmSendTransCash}>
                  {t('common_button_sumbit')} &nbsp;
                        <i className="fa fa-check" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          id="divBottom"
          className="panel-body"
          style={{ height: 'calc(100% - 35px)' }}>
          <HistoryList t={t}
            getList={this.state.getList}
            get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
            component={this.component}
            req_component={this.req_component}
            get_rq_seq_comp={this.get_rq_seq_comp}
            name={this.state.name}
            activeAcnt={this.state.transCashObj.acntNo}
          />
        </div>

        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfmCashTransfer}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('confirm_transfer_cash_message')}
          </ModalHeader>
          <ModalBody>
            {t('from_sub_account')}: {this.state.transCashObj['acntNo']} {t('to_sub_account')}: {this.state.transCashObj['acntNoRcv']}
            <br />{t('transfer_amount')}: {this.state.transCashObj['trans_amt']} VNĐ?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_sendTransCashOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.sendTransferCashConfirm('Y')}>
                    {this.state.transCashFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.sendTransferCashConfirm('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div >
    )
  }
}

export default translate('translations')(CashTransfer);