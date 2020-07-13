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
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';

import { checkToast } from '../../utils/check_toast'
import { focusELM } from '../../utils/focus_elm'
import { filterNumber } from '../../utils/filterNumber'
import { checkOtp, send_checkOTP } from '../../utils/checkOtp'
import { ModalConfirmGottenOTP } from '../../conponents/modal_confirm_gotten_otp/modal_confirm_gotten_otp'
import HistoryList from '../../conponents/history_table_for_cash_transaction/history/historyList'
import { TabPane } from 'reactstrap'
import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

class WithdrawRegist extends PureComponent {
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
      withdrObj: {
        acntNo: '',
        cashAvaiable: 0,
        withdr_amt: '',
        withdr_amt_require: false,
        bankAcnt_rcv: '',
        bankAcnt_rcv_require: null,
        bankinfo: null
      },
      bankAcntTps: [],
      acntItems: [],
      reqWithdrawFlag: false,
      refreshFlag: '',

      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style
    }
  }

  // -- request to withdraw
  reqWithdraw_FunctNm = 'WITHDRAW_001';
  // -- get cash available informations
  getCashAvaibleFlag = false;
  getCashAvaible_FunctNm = 'WITHDRAW_002';
  // -- get bank account list
  bankAcntTps = [];
  bankAcntTpsTmp = [];
  getBankAcntListFlag = false;
  getBankAcntList_FunctNm = 'WITHDRAW_004';

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

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

      this.withdrObj = agrs.state.withdrObj
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
    this.withdrObj = this.state.withdrObj;
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      this.setState({ stkList: agrs });
    })
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
      if (this.state.cfm_withd_request) this.setState({ cfm_withd_request: false });
      // else {
      //   const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
      //   // glb_sv.commonEvent.next(msg);
      //   inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      // }
    })
    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      glb_sv.objShareGlb = agrs.objShareGlb;
    })
    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'confirmWithdReq') this.setState({ cfm_withd_request: true });
    })
    this.delayLoadData();
  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    this.request_seq_comp = 0
    if (this.reqWithdrawFunct_ReqTimeOut) { clearTimeout(this.reqWithdrawFunct_ReqTimeOut); }
    if (this.getCashAvaibleFunct_ReqTimeOut) { clearTimeout(this.getCashAvaibleFunct_ReqTimeOut); }
    if (this.getWithdrawListFunct_ReqTimeOut) { clearTimeout(this.getWithdrawListFunct_ReqTimeOut); }
    if (this.getBankAcntListFunct_ReqTimeOut) { clearTimeout(this.getBankAcntListFunct_ReqTimeOut); }
    if (this.cancelWithdrawFunct_ReqTimeOut) { clearTimeout(this.cancelWithdrawFunct_ReqTimeOut); }
    // const modal = document.querySelector('.wizard-modal');
    // modal.style.width = '';
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

      const objShareGlb = agrs.get('objShareGlb');
      const activeAcnt = agrs.get('activeAcnt');

      glb_sv.objShareGlb = objShareGlb

      this.acntItems = objShareGlb['acntNoList'];
      let acntStr = '';
      if (activeAcnt !== null && activeAcnt !== undefined && activeAcnt !== '' &&
        activeAcnt.substr(11) !== '%') {
        acntStr = activeAcnt;
      } else {
        acntStr = this.acntItems[0]['id'];
      }
      this.withdrObj['acntNo'] = acntStr;
      this.withdrObj['bankAcnt_rcv'] = '';
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1].substr(0, 2);
      this.setState({ acntItems: this.acntItems });
      this.setState(prevState => ({
        withdrObj: {
          ...prevState.withdrObj,
          acntNo: this.withdrObj.acntNo,
          bankAcnt_rcv: this.withdrObj.bankAcnt_rcv,
        }
      }));
      console.log('loadData');
      this.getBankAcntList();
      this.getCashAvaiableInfo();
    })

  }



  getBankAcntList_ResultProc = (reqInfoMap, message) => {
    // -- process after get result --
    if (this.getBankAcntListFunct_ReqTimeOut) clearTimeout(this.getBankAcntListFunct_ReqTimeOut);
    this.getBankAcntListFlag = false;
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;

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
      this.bankAcntTpsTmp = this.bankAcntTpsTmp.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.bankAcntTps = this.bankAcntTpsTmp;
        this.setState({ bankAcntTps: this.bankAcntTps });
        if (this.bankAcntTps.length > 0) {
          this.withdrObj['bankAcnt_rcv'] = this.bankAcntTps[0];
          this.withdrObj['bankinfo'] = this.bankAcntTps[0]['c2'];
          this.setState(prevState => ({
            withdrObj: {
              ...prevState.withdrObj,
              bankAcnt_rcv: this.withdrObj.bankAcnt_rcv,
              bankinfo: this.withdrObj.bankinfo,
            }
          }))
        }
      }
    }
  }

  getCashAvaible_ResultProc = (reqInfoMap, message) => {
    if (this.getCashAvaibleFunct_ReqTimeOut) clearTimeout(this.getCashAvaibleFunct_ReqTimeOut)
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // this.getCashAvaibleFlag = false;
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code'], this.component)
      }
      return;
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        this.withdrObj['cashAvaiable'] = jsondata[0]['c5'];
        this.setState(prevState => ({
          withdrObj: {
            ...prevState.withdrObj,
            cashAvaiable: this.withdrObj.cashAvaiable,
          }
        }))
      } catch (err) {
        this.withdrObj['cashAvaiable'] = 0;
        this.setState(prevState => ({
          withdrObj: {
            ...prevState.withdrObj,
            cashAvaiable: this.withdrObj.cashAvaiable,
          }
        }))
      }
    }
  }
  reqWithdraw_ResultProc = (reqInfoMap, message) => {
    this.reqWithdrawFlag = false;
    this.setState({ reqWithdrawFlag: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
        this.setState({ cfm_withd_request: false });
      }
    } else {
      this.setState({ cfm_withd_request: false });
      this.withdrObj['withdr_amt'] = 0;
      this.setState(prevState => ({
        withdrObj: {
          ...prevState.withdrObj,
          withdr_amt: this.withdrObj.withdr_amt,
        }
      }))
      this.getCashAvaiableInfo();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)

      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }


  changBankAcntRcv = (e) => {
    const item = JSON.parse(e.target.value);
    this.withdrObj.bankAcnt_rcv = item;
    this.withdrObj['bankinfo'] = item['c1'];
    this.setState(prevState => ({
      withdrObj: {
        ...prevState.withdrObj,
        bankAcnt_rcv: this.withdrObj.bankAcnt_rcv,
        bankinfo: this.withdrObj.bankinfo,
      }
    }))
  }

  handleChangePrice = (e) => {
    // event.persist();
    const value = filterNumber(e.target.value);
    if (value > 999) { this.withdrObj.withdr_amt = FormatNumber(value); }
    else this.withdrObj.withdr_amt = value;
    this.setState(prevState => ({
      withdrObj: {
        ...prevState.withdrObj,
        withdr_amt: this.withdrObj.withdr_amt
      }
    }))
  }

  solvingwithdraw_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    this.setState({ refreshFlag: '' });

    console.log('solvingwithdraw_TimeOut', reqIfMap.reqFunct)

    if (reqIfMap.reqFunct === this.getBankAcntList_FunctNm) {
      this.getBankAcntListFlag = false;
    } else if (reqIfMap.reqFunct === this.getCashAvaible_FunctNm) {
      this.getCashAvaibleFlag = false;
    } else if (reqIfMap.reqFunct === this.getWithdrawList_FunctNm) {
      this.getWithdrawListFlag = false;
    } else if (reqIfMap.reqFunct === this.reqWithdraw_FunctNm) {
      this.setState({ reqWithdrawFlag: false });
      this.reqWithdrawFlag = false;
    } else if (reqIfMap.reqFunct === this.cancelWithdraw_FunctNm) {
      this.cancelWithdrawFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', false, '', this.component)
  }

  openConfirmModalWithdraw = () => {
    if (this.state.withdrObj.bankAcnt_rcv === null || this.state.withdrObj.bankAcnt_rcv === "") {
      focusELM('withdrObj_bankAcnt_rcv');
      glb_sv.checkToast(toast, 'warn', this.props.t('receive_bank_account_must_input'), 'withdrre_rec_bnk');
      return;
    }
    if (this.state.withdrObj.withdr_amt === null || this.state.withdrObj.withdr_amt === '') {
      focusELM('depositObj_deposit_amt');
      glb_sv.checkToast(toast, 'warn', this.props.t('deposit_cash_require'), 'withdrre_deposit_casha');
      return;
    }
    const withdr_amtStr = this.withdrObj['withdr_amt'];
    const cashAvaiable = this.withdrObj['cashAvaiable'];
    let withdr_amt = filterNumber(withdr_amtStr);
    if (withdr_amt === null || withdr_amt === undefined || isNaN(withdr_amt)) { withdr_amt = 0; }
    if (Number(withdr_amt) <= 0) {
      focusELM('withdrObj_withdr_amt');
      glb_sv.checkToast(toast, 'warn', this.props.t('withdraw_amt_not_correct'), 'withdrre_not_amt');
      return;
    };
    if (Number(cashAvaiable) < Number(withdr_amt)) {
      focusELM('withdrObj_withdr_amt');
      toast.warn(this.props.t('withdraw_amt_over_available'));
      glb_sv.checkToast(toast, 'warn', this.props.t('withdraw_amt_over_available'), 'withdrre_not_avail');
      return;
    };
    if (!glb_sv.checkOtp('confirmWithdReq')) {
      if (window.location.pathname.includes('___')) {
        const ermsg = 'notify_user_enter_otp_in_main_screen';
        const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
    };
    this.setState({ cfm_withd_request: true });
  }
  // -- send request to withdraw
  sendReqToWithdraw = (cfmTp) => {
    if (this.reqWithdrawFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_withd_request: false });
      return;
    }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
    //   return;
    // }


    const withdr_amtStr = this.withdrObj['withdr_amt'];
    const withdr_amt = filterNumber(withdr_amtStr);
    const noteInfo = this.withdrObj['note']
    const bankInfo = this.withdrObj['bankAcnt_rcv'];
    this.reqWithdrawFlag = true;
    this.setState({ reqWithdrawFlag: true });
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap reqWithdraw_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.reqWithdraw_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.reqWithdraw_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTxCash';
    svInputPrm.ServiceName = 'ALTxCash_0201_2';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InVal = [this.actn_curr, this.sub_curr, '2', '1', bankInfo['c3'], bankInfo['c5'], withdr_amt + '', '0', noteInfo];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.reqWithdrawFunct_ReqTimeOut = setTimeout(this.solvingwithdraw_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
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

  // -- get cash information
  getCashAvaiableInfo = () => {
    // if (this.getCashAvaibleFlag) { return; }
    // this.getCashAvaibleFlag = true;

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getCashAvaible_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getCashAvaible_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getCashAvaible_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_0201_2';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getCashAvaibleFunct_ReqTimeOut = setTimeout(this.solvingwithdraw_TimeOut,
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
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
  }

  // --- get bank account list
  getBankAcntList = () => {
    if (this.getBankAcntListFlag) { return; }
    this.getBankAcntListFlag = true;

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getBankAcntList_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getBankAcntList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getBankAcntList_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_Common';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['03', this.actn_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getBankAcntListFunct_ReqTimeOut = setTimeout(this.solvingwithdraw_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    // glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
    this.bankAcntTps = [];
    this.bankAcntTpsTmp = [];
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

  validateInput = (e) => {
    const name = e.target.name;
    if (name === 'withdrObj_withdr_amt') {
      if (this.state.withdrObj.withdr_amt === null || this.state.withdrObj.withdr_amt === "") {
        this.setState(prevState => ({
          withdrObj: {
            ...prevState.withdrObj,
            withdr_amt_require: true
          }
        })
        );
      } else {
        this.setState(prevState => ({
          withdrObj: {
            ...prevState.withdrObj,
            withdr_amt_require: false
          }
        })
        );
      }
    } else if (this.state.withdrObj.bankAcnt_rcv === null || this.state.withdrObj.bankAcnt_rcv === "") {
      this.setState(prevState => ({
        withdrObj: {
          ...prevState.withdrObj,
          bankAcnt_rcv_require: true
        }
      })
      );
    } else {
      this.setState(prevState => ({
        withdrObj: {
          ...prevState.withdrObj,
          bankAcnt_rcv_require: false
        }
      })
      );
    }
  }

  modalAfterOpened() {
    const elm = document.getElementById('bt_sendReqToWithdrawOk');
    if (elm) elm.focus();
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;

    if (name === 'withdrObj_withdr_amt' && code === 13) {
      this.openConfirmModalWithdraw();
    }
  }

  handleChangeAccount = ({ value, label }) => {
    // value: 888c000350.00
    // label: 888c000350.00 - Tạ Ngoc My
    this.activeAcnt = value;
    this.withdrObj.acntNo = value;

    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.withdrObj['cashAvaiable'] = 0;
    this.setState(prevState => ({
      withdrObj: {
        ...prevState.withdrObj,
        acntNo: this.withdrObj.acntNo,
        cashAvaiable: this.withdrObj.cashAvaiable,
      }
    }))

    if (!glb_sv.flagProcessPopout) {
      console.log('handleChangeAccount');
      this.getBankAcntList();
      this.getCashAvaiableInfo();
    };
  }

  render() {
    const { t } = this.props
    const cashAvaiable = FormatNumber(this.state.withdrObj.cashAvaiable);
    return (
      <div className='withdraw-regist '>
        <div className="card form-cash-transaction">
          <div className="card-body widget-body">
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('acnt_no')}</label>
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
                  {cashAvaiable}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('bank_account_receive')}<span className="mustInput">*</span></label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <select id="withdrObj_bankAcnt_rcv" value={JSON.stringify(this.state.withdrObj.bankAcnt_rcv)} onChange={this.changBankAcntRcv} onBlur={this.validateInput} name="withdrObj_bankAcnt_rcv" className="form-control form-control-sm no-padding">
                  {this.state.bankAcntTps.map(item =>
                    <option key={item.c3} value={JSON.stringify(item)}>
                      {item.c3 + ' - ' + item.c4 + ' - ' + item.c2}
                    </option>)
                  }
                </select>
              </div>
              {/* {this.state.withdrObj.bankAcnt_rcv_require && <span className="help-block text-danger">{t('receive_bank_account_must_input')}</span>} */}
            </div>

            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('withdraw_amount')}<span className="mustInput">*</span></label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"withdrObj_withdr_amt"}
                  value={this.state.withdrObj.withdr_amt}
                  onChange={this.handleChangePrice}
                  onBlur={this.validateInput}
                  onKeyDown={this.handleKeyPress}
                  classextend={'form-control-sm text-right'}
                />
              </div>
            </div>

            <div className="form-group row" style={{ marginTop: 25 }}>
              <div className='col-sm fullWidthButton'>
                <button className="btn btn-pill btn-sm btn-block pull-right btn-wizard" onClick={this.openConfirmModalWithdraw}>
                  {t('common_button_sumbit')} &nbsp;
                        <i className="fa fa-check" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* <div style={{ paddingBottom: 36, marginTop: 7 }}>
          <button className="btn btn-pill pull-right btn-wizard" onClick={this.openConfirmModalWithdraw}>
            {t('common_button_sumbit')} &nbsp;
                  <i className="fa fa-check" />
          </button>
        </div> */}

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
            activeAcnt={this.state.withdrObj.acntNo}
          />
        </div>

        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_withd_request}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('withdraw_confirm_message')}: {this.state.withdrObj['withdr_amt']} VNĐ?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_sendReqToWithdrawOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.sendReqToWithdraw('Y')}>
                    {this.state.reqWithdrawFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.sendReqToWithdraw('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

export default translate('translations')(WithdrawRegist);