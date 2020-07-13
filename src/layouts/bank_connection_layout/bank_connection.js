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
import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { checkToast } from '../../utils/check_toast'
import { focusELM } from '../../utils/focus_elm'
import { filterNumber } from '../../utils/filterNumber';
import HistoryList from '../../conponents/history_table_for_cash_transaction/history/historyList'
import { TabPane } from 'reactstrap'
import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

class BankConnection extends PureComponent {
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
      bankProcFlag: false,
      cfm_inform_bankcon_confirm: false,
      cancelTransaction: {},
      bankConn: {
        proc_amt_require: false,
      },
      bankAcntTps: [],
      acntItems: [],
      refreshFlag: '', // '' or 'fa-spin'

      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style
    }
  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  // BankCon Form;
  bankConn = {};
  acntItems = [];
  // -- Process function
  phone_code = '';
  confirm_msg = '';
  bankProcFlag = false;
  bankProc_FunctNm = 'BANKCON_001';
  // -- get cash available informations in security
  getCashAmountFlag = false;
  getCashAmount_FunctNm = 'BANKCON_002';
  // -- get cash available informations in bank
  getBankCashAmountFlag = false;
  getBankCashAmount_FunctNm = 'BANKCON_003';
  // -- get transaction list on day

  bankTransListDataTable = [];
  bankTransListTemple = [];
  getbankTransListFlag = false;
  getbankTransList_FunctNm = 'BANKCON_004';
  // -- get bank account list
  bankAcntTps = [];
  bankAcntTpsTmp = [];
  getBankAcntListFlag = false;
  getBankAcntList_FunctNm = 'BANKCON_005';
  // -- cancel request to withdraw from sec to bank
  cancelTransaction = {};
  cancelTransactionFlag = false;
  cancelBankCon_FunctNm = 'BANKCON_006';

  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      // console.log(agrs.state)
      this.bankConn = agrs.state.bankConn
      // this.bankConn['acntNo'] = agrs.state.bankConn['acntNo']
      // this.bankConn['cashAmt'] = agrs.state.bankConn['cashAmt']
      // this.bankConn['cashAvail'] = agrs.state.bankConn['cashAvail']
      // this.bankConn['connectStatus'] = agrs.state.bankConn['connectStatus']
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      this.setState(agrs.state)
    })
  }

  componentDidMount() {
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
      reply_send_req(agrs, this.req_component)
    })

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_inform_bankcon_confirm) this.setState({ cfm_inform_bankcon_confirm: false });
      // else {
      //   const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
      //   inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      // }
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      this.setState({ themePage: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      this.setState({ language: agrs })
    })
    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      glb_sv.objShareGlb = agrs.objShareGlb;
    })
    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'sendConffirmToProcess') this.setState({ cfm_inform_bankcon_confirm: true });
    })

    this.loadData();
  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    this.request_seq_comp = 0
    if (this.getbankTransListFunct_ReqTimeOut) { clearTimeout(this.getbankTransListFunct_ReqTimeOut); }
    if (this.getBankAcntListFunct_ReqTimeOut) { clearTimeout(this.getBankAcntListFunct_ReqTimeOut); }
    if (this.getCashAmountFunct_ReqTimeOut) { clearTimeout(this.getCashAmountFunct_ReqTimeOut); }
    if (this.bankProcFunct_ReqTimeOut) { clearTimeout(this.bankProcFunct_ReqTimeOut); }
    if (this.cancelTransactionFunct_ReqTimeOut) { clearTimeout(this.cancelTransactionFunct_ReqTimeOut); }
  }

  loadData() {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')
      const activeAcnt = agrs.get('activeAcnt');
      glb_sv.objShareGlb = objShareGlb;

      this.acntItems = objShareGlb['acntNoList'];
      let acntStr = '';
      if (activeAcnt &&
        activeAcnt.substr(11) !== '%') {
        acntStr = activeAcnt;
      } else {
        acntStr = this.acntItems[0]['id'];
      }
      this.bankConn['acntNo'] = acntStr;
      this.bankConn['bankAcnt'] = '';
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];
      this.bankConn['actionTp'] = '1';
      this.bankConn['bank_cashAvail'] = 0;
      this.getcashAmtInfo();
      this.getBankAcntList();
      this.getTransactionList();
      this.setState({ acntItems: this.acntItems, })
      this.setState(prevState => ({
        bankConn: {
          ...prevState.bankConn,
          acntNo: this.bankConn.acntNo,
          bankAcnt: this.bankConn.bankAcnt,
          actionTp: this.bankConn.actionTp,
          bank_cashAvail: this.bankConn.bank_cashAvail,
        }
      }));
    })

  }

  getbankTransListResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getbankTransListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getbankTransListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', null, null, null, this.component)
      }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        // glb_sv.logMessage(err);
        jsondata = [];
      }
      this.bankTransListTemple = this.bankTransListTemple.concat(
        jsondata
      );
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getbankTransListFlag = false;
        this.bankTransListDataTable = this.bankTransListTemple;
      }
    }
  }
  getBankAcntListResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getBankAcntListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getBankAcntListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', null, null, null, this.component)
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
        this.getBankAcntListFlag = false;
        this.bankAcntTps = this.bankAcntTpsTmp;
        this.setState({ bankAcntTps: this.bankAcntTps })
        if (this.bankAcntTps.length > 0) {
          this.bankConn['bankAcnt'] = this.bankAcntTps[0];
          this.setState(prevState => ({
            bankConn: {
              ...prevState.bankConn,
              bankAcnt: this.bankConn.bankAcnt,
            }
          }));
          this.getBankCashAmtInfo();
        }
      }
    }
  }
  getBankCashAmountResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getCashAmountFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    this.getBankCashAmountFlag = false;
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', null, null, null, this.component)
      }
      return;
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        this.bankConn['bank_cashAmt'] = jsondata[0]['c0'];
        this.bankConn['bank_cashAvail'] = jsondata[0]['c1'];
        this.setState(prevState => ({
          bankConn: {
            ...prevState.bankConn,
            bank_cashAmt: this.bankConn.bank_cashAmt,
            bank_cashAvail: this.bankConn.bank_cashAvail,
          }
        }));
      } catch (err) {
        this.bankConn['bank_cashAmt'] = 0;
        this.bankConn['bank_cashAvail'] = 0;
        this.setState(prevState => ({
          bankConn: {
            ...prevState.bankConn,
            bank_cashAmt: this.bankConn.bank_cashAmt,
            bank_cashAvail: this.bankConn.bank_cashAvail,
          }
        }));
      }
    }
  }
  getCashAmountResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getCashAmountFunct_ReqTimeOut);
    this.getCashAmountFlag = false;
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', null, null, null, this.component)
      }
      return;
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        this.bankConn['cashAmt'] = jsondata[0]['c3'];
        this.bankConn['cashAvail'] = jsondata[0]['c4'];
        this.bankConn['connectStatus'] = jsondata[0]['c5'];
        this.setState(prevState => ({
          bankConn: {
            ...prevState.bankConn,
            cashAmt: this.bankConn.cashAmt,
            cashAvail: this.bankConn.cashAvail,
            connectStatus: this.bankConn.connectStatus,
          }
        }));

      } catch (err) {
        this.bankConn['cashAmt'] = 0;
        this.bankConn['cashAvail'] = 0;
        this.bankConn['connectStatus'] = null;
        this.bankConn['connectStatus'] = 'N';
        this.setState(prevState => ({
          bankConn: {
            ...prevState.bankConn,
            cashAmt: this.bankConn.cashAmt,
            cashAvail: this.bankConn.cashAvail,
            connectStatus: this.bankConn.connectStatus,
          }
        }));
      }
    }
  }
  bankProcResultProc = (reqInfoMap, message) => {
    this.bankProcFlag = false;
    // console.log(message)
    clearTimeout(this.bankProcFunct_ReqTimeOut);
    // this.bankProcFlag = false;
    this.setState({ bankProcFlag: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', null, null, null, this.component)
        this.setState({ cfm_inform_bankcon_confirm: false });
      }
      return;
    } else {
      this.setState({ cfm_inform_bankcon_confirm: false });
      this.bankConn['proc_amt'] = 0;
      this.setState(prevState => ({
        bankConn: {
          ...prevState.bankConn,
          proc_amt: this.bankConn.proc_amt,
        }
      }));
      this.getcashAmtInfo();
      this.getBankCashAmtInfo();
      this.getTransactionList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', null, null, null, this.component)
    };
  }
  cancelBankConResultProc = (reqInfoMap, message) => {
    clearTimeout(this.cancelTransactionFunct_ReqTimeOut);
    this.cancelTransactionFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', null, null, null, this.component)
        this.setState({ cfm_bankcon_cancl_confirm: false });
      }
      return;
    } else {
      this.setState({ cfm_bankcon_cancl_confirm: false });
      this.getcashAmtInfo();
      this.getTransactionList();

      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', null, null, null, this.component)
    };
  }
  onAcntChange = (e) => {
    const acntNo = e.target.value;
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {

      let activeAcnt = args.get('activeAcnt')
      const objShareGlb = args.get('objShareGlb')

      // update session for popout window
      glb_sv.objShareGlb = objShareGlb

      activeAcnt = acntNo;
      update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: activeAcnt })
      this.bankConn.acntNo = acntNo;
      this.setState(prevState => ({
        bankConn: {
          ...prevState.bankConn,
          acntNo: this.bankConn.acntNo
        }
      }))
      const pieces = acntNo.split('.');
      this.actn_curr = pieces[0];
      this.sub_curr = pieces[1];
      // this.bankTransListDataTable = [];
      this.reset_inputform();
      this.getcashAmtInfo();
      this.getBankAcntList();
      this.getTransactionList();
    })

  }

  changBankAcntRcv = () => {
    this.getBankCashAmtInfo();
  };

  solvingBankcon_TimeOut = (cltSeq) => {
    const reqIfMap = this.req_component.get(cltSeq)
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
      return;
    }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.setState({ refreshFlag: '' });
    console.log('solvingBankcon_TimeOut',reqIfMap.reqFunct)
    if (reqIfMap.reqFunct === this.getBankAcntList_FunctNm) {
      this.getBankAcntListFlag = false;
    } else if (reqIfMap.reqFunct === this.getCashAmount_FunctNm) {
      this.getCashAmountFlag = false;
    } else if (reqIfMap.reqFunct === this.getbankTransList_FunctNm) {
      this.getbankTransListFlag = false;
    } else if (reqIfMap.reqFunct === this.bankProc_FunctNm) {
      this.bankProcFlag = false;
      this.setState({ bankProcFlag: false });
    } else if (reqIfMap.reqFunct === this.cancelBankCon_FunctNm) {
      this.cancelTransactionFlag = false;
    } else if (reqIfMap.reqFunct === this.getBankCashAmount_FunctNm) {
      this.getBankCashAmountFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', null, null, null, this.component)
  };

  openConfirmModalProc = () => {

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      if (this.bankConn['connectStatus'] === 'N') { return; }
      const bankcon_amtStr = this.bankConn['proc_amt'];
      let bankcon_amt = filterNumber(bankcon_amtStr);
      if (bankcon_amt === null || bankcon_amt === undefined || isNaN(bankcon_amt)) {
        bankcon_amt = 0;
      }
      const bankList = this.bankConn['bankAcnt'];
      if (bankList === null || bankList === undefined) {

        focusELM('bankConn_bankAcnt');
        checkToast(toast, 'warn', this.props.t('can_not_get_bank_account_information'), 'bnkcnt_not_info');
        return;
      }

      // const bankCd = bankList['c0'];
      // const bankAcnt = bankList['c2'];

      if (Number(bankcon_amt) <= 0) {

        focusELM('bankConn_proc_amt');
        checkToast(toast, 'warn', this.props.t('bank_transaction_amount_must_bigger_zero'), 'bnkcnt_not_zezo');
        return;
      }

      // -- So sánh số tiền giao dịch với số khả dụng --
      let bank_cashAvail = this.bankConn['bank_cashAvail'];
      // const cashAvail = this.bankConn['cashAvail'];
      if (bank_cashAvail === null || bank_cashAvail === undefined) {
        bank_cashAvail = 0;
      }

      this.phone_code = null;

      if (!glb_sv.checkOtp('sendConffirmToProcess')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
        }
        return;
      };
      this.setState({ cfm_inform_bankcon_confirm: true });
    })
  };

  sendConffirmToProcess = cfmTp => {
    if (this.bankProcFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_inform_bankcon_confirm: false });
      return;
    }

    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '');
    //   return;
    // }
    const bankcon_amtStr = this.bankConn['proc_amt'];
    const bankcon_amt = filterNumber(bankcon_amtStr);
    const bankList = this.bankConn['bankAcnt'];
    const bankCd = bankList['c0'];
    const bankAcnt = bankList['c2'];

    this.bankProcFlag = true;
    this.setState({ bankProcFlag: true });
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap bankProcResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.bankProc_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.bankProcResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.TimeOut = 30;
    svInputPrm.WorkerName = 'ALTxCashBIDV';
    svInputPrm.ServiceName = 'ALTxCash_0201_6';
    svInputPrm.ClientSentTime = '0';

    if (this.bankConn['actionTp'] === '1') {
      svInputPrm.Operation = 'I';
    } else {
      svInputPrm.Operation = 'U';
    }
    svInputPrm.InVal = [
      this.actn_curr,
      this.sub_curr,
      bankAcnt,
      bankCd,
      bankcon_amt + '',
      '',
      ''
    ];
    // svInputPrm.InCrpt = [6];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    this.bankProcFunct_ReqTimeOut = setTimeout(
      this.solvingBankcon_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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
  };
  // --- get orderlist function
  getTransactionList = () => {
    if (this.getbankTransListFlag) { return; }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '');
    //   return;
    // }
    if (
      this.actn_curr === null ||
      this.actn_curr === undefined ||
      this.actn_curr.length === 0
    ) {
      return;
    }

    this.getbankTransListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getbankTransListResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getbankTransList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getbankTransListResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCashBIDV';
    svInputPrm.ServiceName = 'ALTqCash_0201_6';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['2', this.actn_curr, '%'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getbankTransListFunct_ReqTimeOut = setTimeout(
      this.solvingBankcon_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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
    this.bankTransListTemple = [];
    this.bankTransListDataTable = [];
  };
  openConfirmCancelModalProcess = (index, item) => {
    if (item.c15 !== 'N') { return; }
    this.cancelTransaction['index'] = index + 1;
    this.cancelTransaction['amount'] = item['c8'];
    this.cancelTransaction['trasnTp'] = item['c2'];
    this.cancelTransaction['item'] = item;
    this.setState({ cancelTransaction: this.cancelTransaction })
    this.setState({ cfm_bankcon_cancl_confirm: true });
  };

  cancelTransactionInfoCfrm = cfmTp => {
    if (this.cancelTransactionFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_bankcon_cancl_confirm: false });
      return;
    }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '');
    //   return;
    // }

    let datels = this.cancelTransaction['item']['c0'],
      aprDt = this.cancelTransaction['item']['c18'];
    const aprSeq = this.cancelTransaction['item']['c19'];
    datels =
      datels.substring(4, 8) + datels.substring(2, 4) + datels.substring(0, 2);
    if (aprDt != null && aprDt.length > 0) {
      aprDt =
        aprDt.substring(4, 8) + aprDt.substring(2, 4) + aprDt.substring(0, 2);
    }

    this.cancelTransactionFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap cancelBankConResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cancelBankCon_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.cancelBankConResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTxCashBIDV';
    svInputPrm.ServiceName = 'ALTxCash_0201_6';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'D';
    svInputPrm.AprSeq = aprSeq;
    svInputPrm.MakerDt = aprDt;
    svInputPrm.AprStat = 'D';
    svInputPrm.InVal = [datels, this.cancelTransaction['item']['c1']];
    svInputPrm.TotInVal = svInputPrm.InVal.length;


    this.cancelTransactionFunct_ReqTimeOut = setTimeout(
      this.solvingBankcon_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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
  };

  onSelectionChange = (actTp) => {
    this.bankConn['actionTp'] = actTp;
    this.setState(prevState => ({
      bankConn: {
        ...prevState.bankConn,
        actionTp: this.bankConn.actionTp,
      }
    }))
  }
  // -- get cash information
  getcashAmtInfo = () => {
    if (this.getCashAmountFlag) { return; }
    this.getCashAmountFlag = true;

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getCashAmountResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getCashAmount_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getCashAmountResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.TimeOut = 30;
    svInputPrm.WorkerName = 'ALTqCashBIDV';
    svInputPrm.ServiceName = 'ALTqCash_0201_6';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    // console.log(this.actn_curr, this.sub_curr)
    svInputPrm.InVal = ['1', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getCashAmountFunct_ReqTimeOut = setTimeout(
      this.solvingBankcon_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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

  };

  // --- get bank account list
  getBankAcntList = () => {
    if (this.getBankAcntListFlag) { return; }
    this.getBankAcntListFlag = true;
    const request_seq_comp = this.get_rq_seq_comp()
    // -- call service for place order
    // -- push request to request hashmap getBankAcntListResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getBankAcntList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getBankAcntListResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    // svInputPrm.ClientSeq = clientSeq;
    svInputPrm.WorkerName = 'ALTqAccount';
    svInputPrm.ServiceName = 'ALTqAccount_Common';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['09', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // socket_sv.send2Sv(
    //   socket_sv.key_ClientReq,
    //   JSON.stringify(svInputPrm)
    // );
    this.getBankAcntListFunct_ReqTimeOut = setTimeout(
      this.solvingBankcon_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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
    this.bankAcntTps = [];
    this.bankAcntTpsTmp = [];
  };

  // --- get bank cash information
  getBankCashAmtInfo = () => {
    if (this.getBankCashAmountFlag) { return; }
    this.getBankCashAmountFlag = true;

    const bankAcnt = this.bankConn['bankAcnt']['c0'];
    if (bankAcnt === null || bankAcnt === undefined) {
      this.getBankCashAmountFlag = false;
      return;
    }
    const request_seq_comp = this.get_rq_seq_comp()
    // -- call service for place order
    // -- push request to request hashmap getBankCashAmountResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getBankCashAmount_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getBankCashAmountResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqCashBIDV';
    svInputPrm.ServiceName = 'ALTqCash_0201_6';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['3', this.actn_curr, this.sub_curr, bankAcnt];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getBankCashAmountFunct_ReqTimeOut = setTimeout(
      this.solvingBankcon_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
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
  };

  reset_inputform = () => {
    this.bankConn['connectStatus'] = 'N';
    this.bankConn['cashAmt'] = 0;
    this.bankConn['cashAvail'] = 0;
    this.bankAcntTps = [];
    this.bankConn['bankAcnt'] = null;
    this.bankConn['bank_cashAmt'] = 0;
    this.bankConn['bank_cashAvail'] = 0;
    this.bankConn['proc_amt'] = 0;
    this.setState({ bankConn: this.bankConn, bankAcntTps: [] });
  };

  handleChangeTransferAmount = (e) => {
    const value = filterNumber(e.target.value);
    this.bankConn.proc_amt = FormatNumber(value);
    this.setState(prevState => ({
      bankConn: {
        ...prevState.bankConn,
        proc_amt: this.bankConn.proc_amt,
      }
    }));
  }

  modalAfterOpened = () => {
    const elm = document.getElementById('bt_openPhonecodeOk');
    if (elm) elm.focus();
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'bankConn_proc_amt' && code === 13) {
      this.openConfirmModalProc();
    }
  }

  handleChangeAccount = ({ value, label }) => {
    // value: 888c000350.00
    // label: 888c000350.00 - Tạ Ngoc My
    this.activeAcnt = value;
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.bankConn.acntNo = value;
    this.setState(prevState => ({
      bankConn: {
        ...prevState.bankConn,
        acntNo: this.bankConn.acntNo
      }
    }));
    this.reset_inputform();
    this.getcashAmtInfo();
    this.getBankAcntList();
    this.getTransactionList();
  }

  render() {
    const { t } = this.props
    const cashAmt = this.state.bankConn['cashAmt']
    const cashAvail = this.state.bankConn['cashAvail']
    return (
      <div className='bank-connection' style={{ paddingTop: 10 }}>
        <div className="card form-cash-transaction">
          <div className="card-body widget-body">
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('acnt_no')}
              </label>
              <div className='col-sm-7'>

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
                  disabledAct={this.state.bankConn['connectStatus'] === 'N'}
                />
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('connection_status')}</label>
              <div className='col-sm-7'>
                <select value={this.state.bankConn['connectStatus']} disabled="disabled" name="connectStatus" className="form-control form-control-sm disabled">
                  <option value="Y">{t('connecting')}</option>
                  <option value="N">{t('disconnect')}</option>
                </select>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('cash_amount')}</label>
              <div className="col-sm-7 input-group input-group-sm">
                <span className="form-control form-control-sm text-right">{FormatNumber(cashAmt)}</span>

              </div>
            </div>

            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('sec_cash_available')}</label>
              <div className="col-sm-7 input-group input-group-sm">
                <span className="form-control form-control-sm text-right">{FormatNumber(cashAvail)}</span>

              </div>
            </div>

            <div className="form-group " style={{ borderBottom: '1.2px dashed #008b8b' }}></div>

            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('bank_account')}
              </label>
              <div className='col-sm-7'>
                <select name='bankConn_bankAcnt' disabled={this.state.bankConn['connectStatus'] === 'N'} className='form-control form-control-sm' id='bankConn_bankAcnt'
                  value={this.state.bankConn['bankAcnt']} onChange={this.changBankAcntRcv}>
                  {this.state.bankAcntTps.map(item =>
                    <option key={item} value={item}>{item.c4}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('cash_amount')}</label>
              <div className="col-sm-7 input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.bankConn['bank_cashAmt'])}
                </span>
              </div>
            </div>

            <div className="form-group row ">
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('bank_cash_available')}</label>
              <div className="col-sm-7 input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.bankConn['bank_cashAvail'])}
                </span>
              </div>
            </div>

            <div className="form-group " style={{ borderBottom: '1.2px dashed #008b8b' }}></div>

            <div className="form-group row ">
              <label className="col-sm-3 col-sm control-label no-padding-right text-left" style={{ whiteSpace: 'nowrap' }}>{t('bank_transaction_type')}</label>
              <div className="col-sm-9">
                <table className='popover-search'>
                  <tbody>
                    <tr>
                      <td>
                        <input type="radio" id="radio1" name="radio" checked={this.state.bankConn['actionTp'] === '1'} onChange={() => this.onSelectionChange('1')} />
                        <label htmlFor="radio1" style={{ fontSize: 12 }}>{t('deposit_to_stock_account')}</label>
                        <div className="check"></div>
                      </td>
                      <td>
                        <input id="radioDefault" name="radio" type="radio" checked={this.state.bankConn['actionTp'] === '2'} onChange={() => this.onSelectionChange('2')} />
                        <label htmlFor="radioDefault" style={{ fontSize: 12 }}>{t('withdraw_to_bank_account')}</label>
                        <div className="check"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('transfer_amount')}<span className="mustInput">*</span></label>
              <div className="col-sm-7 input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"bankConn_proc_amt"}
                  disabled={this.state.bankConn['connectStatus'] === 'N'}
                  value={this.state.bankConn['proc_amt']}
                  onChange={this.handleChangeTransferAmount}
                  onKeyDown={this.handleKeyPress}
                  classextend={'form-control-sm text-right'}
                  autoComplete="off"
                />
              </div>
              {/* {this.state.bankConn.proc_amt_require && <span className="help-block text-danger">{t('transfer_amount_bankcon_require')}</span>} */}
            </div>
            <div className="form-group row" style={{ marginTop: 25 }}>
              <div className='col-sm '>
                <button disabled={this.state.bankConn['connectStatus'] === 'N'} className="btn btn-pill btn-block btn-wizard" id='transaction_orderButton' onClick={this.openConfirmModalProc}>
                  {t('common_confirm')} &nbsp;
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
              activeAcnt={this.state.bankConn.acntNo}
            />
        </div>

        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_inform_bankcon_confirm}
          size={"md modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label"> {t('bank_transaction_type')}</label>
              <div className="col-sm-9">
                <select disabled value={this.state.bankConn['actionTp']} name="actionTp" className="form-control form-control-sm">
                  <option value={1}>{t('deposit_to_stock_account')}</option>
                  <option value={2}>{t('withdraw_to_bank_account')}</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label"> {t('acnt_no')}</label>
              <div className="col-sm-9">
                <SelectBasic
                  inputtype={"text"}
                  name={"bankConn_acntNo_cfm"}
                  disabled
                  value={this.state.bankConn['acntNo']}
                  options={this.state.acntItems}
                  classextend={'form-control-sm'}
                />
              </div>
            </div>
            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label"> {t('bank_account')}</label>
              <div className="col-sm-9">
                <select name='bankAcnt' disabled className='form-control form-control-sm' id='bankConn_bankAcnt_cfm'
                  value={this.state.bankConn['bankAcnt']}>
                  {this.state.bankAcntTps.map(item =>
                    <option key={item} value={item}>{item.c4}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label style={{ textAlign: 'left' }} className="col-sm-3 control-label"> {t('bank_transaction_amount')}
              </label>
              <div className="col-sm-9">
                <div className="input-group input-group-sm">
                  <span disabled id="bankConn_proc_amt_cfm" name="proc_amt" style={{ backgroundColor: '#e9ecef' }} className="form-control form-control-sm text-right" autoComplete="off">{FormatNumber(this.state.bankConn['proc_amt'])}</span>
                </div>
              </div>
            </div>

          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_openPhonecodeOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.sendConffirmToProcess('Y')}>
                    {this.state.bankProcFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_confirm')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.sendConffirmToProcess('N')}>
                    <span>{t('common_Cancel')}</span>
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

export default translate('translations')(BankConnection);