import React, { Component } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import { toast } from 'react-toastify';
import Select from 'react-select';

import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';

import { focusELM } from '../../utils/focus_elm'
import { filterNumber } from '../../utils/filterNumber'
import HistoryList from '../../conponents/history_table_for_cash_transaction/history/historyList'
import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

const customStyles = {
  option: base => ({
    ...base,
    height: 26,
    padding: '5px 12px'
  }),
  control: base => ({
    ...base,
    height: 25,
    minHeight: 25,
    border: '0px solid',
    backgroundColor: glb_sv.style[glb_sv.themePage].placeOrder.background_search,
  }),
  menuList: base => ({
    ...base,
    maxHeight: 300,
    width: 400,
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    zIndex: 301,
    position: 'fixed',
    backgroundColor: glb_sv.style[glb_sv.themePage].sideBar.background_menuList,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch
  }),
  menu: base => ({
    ...base,
    width: 400
  }),
  indicatorSeparator: base => ({
    ...base,
    height: 15,
    marginTop: 6,
    display: 'none'
  }),
  dropdownIndicator: base => ({
    ...base,
    padding: 4,
    marginTop: -3,
    display: 'none'
  }),
  container: base => ({
    ...base,
    // zIndex: 10
  }),
  placeholder: base => ({
    ...base,
    whiteSpace: 'nowrap',
    top: '56%',
    color: glb_sv.style[glb_sv.themePage].sideBar.color_placehoder_search
  }),
  singleValue: base => ({
    ...base,
    marginLeft: -5,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    top: '56%'
  }),
  valueContainer: base => ({
    ...base,
    marginTop: -5,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch
  }),
  input: base => ({
    ...base,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    paddingTop: 4
  })
};

class DepositInform extends Component {
  constructor(props) {
    super(props)
    //Khai báo cho electron 
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
      })
    }
    //khai báo react
    this.state = {
      depositObj: this.depositObjNull,
      page: 1,
      acntItems: [],
      bankSecList: [],
      bankAcntTps: [],
      cfm_inform_deposit: false,
      reqDepositFlag: false,
      selectedTrnBnk: [],
      selectedBnkRcv: [],
      isChangeTheme: true,

      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style
    }
  }

  depositObjNull = {
    acntNo: '',
    trnBnkacnt: '',
    trnBnk: '',
    trnBnk_require: false,
    bankAcnt_rcv: {},
    bankAcnt_rcv_selected: '',
    bankAcnt_rcv_require: false,
    bankinfo: '',
    deposit_amt: 0,
    deposit_amt_require: false,
    note: ''
  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    // const state = { parent_id: this.state.parent_id, config: this.state.config, name: this.state.name, component: this.state.component }
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }
  // -- inform Deposit
  reqDeposit_FunctNm = 'DEPOSIT_001';
  // -- get cash available informations
  getCashAmount_FunctNm = 'DEPOSIT_002';
  // -- get bank list of security infos
  bankSecList = [];
  bankSecListTmp = [];
  getBankSecListFlag = false;
  getBankSecList_FunctNm = 'DEPOSIT_004';
  getBankSecListFunct_ReqTimeOut;
  // -- get bank account list transfer
  bankAcntTps = [];
  bankAcntTpsTmp = [];
  getBankAcntListFlag = false;
  getBankAcntList_FunctNm = 'DEPOSIT_005';
  getBankAcntListFunct_ReqTimeOut;

  componentWillMount() {
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      this.depositObj = agrs.state.depositObj;
      this.setState(agrs.state,() => this.flagPopOut = false);
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)

    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)
    })
  }

  componentDidMount() {
    this.depositObj = this.state.depositObj;
    const elm = document.getElementById('depositObj_trnBnkacnt');
    if (elm) elm.focus();

    window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
      this.popin_window()
    })

    window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
      window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
    })

    window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
      this.flagPopOut = true;
      bf_popout(this.component, this.props.node, this.state)
    })

    window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
      reply_send_req(agrs, this.req_component)
    })

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_inform_deposit) this.setState({ cfm_inform_deposit: false });
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
      if (msg.data === 'confirmDepositInfo') this.setState({ cfm_inform_deposit: true });
    })

    this.delayLoadData();
  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    if (this.reqDepositFunct_ReqTimeOut) { clearTimeout(this.reqDepositFunct_ReqTimeOut); }
    if (this.getCashAmountFunct_ReqTimeOut) { clearTimeout(this.getCashAmountFunct_ReqTimeOut); }
    if (this.getDepositListFunct_ReqTimeOut) { clearTimeout(this.getDepositListFunct_ReqTimeOut); }
    if (this.getBankSecListFunct_ReqTimeOut) { clearTimeout(this.getBankSecListFunct_ReqTimeOut); }
    if (this.getBankAcntListFunct_ReqTimeOut) { clearTimeout(this.getBankAcntListFunct_ReqTimeOut); }
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
      const activeAcnt = agrs.get('activeAcnt');
      glb_sv.objShareGlb = objShareGlb

      this.acntItems = objShareGlb['acntNoList'];
      let acntStr = '';
      if (
        activeAcnt !== null
        && activeAcnt !== undefined
        && activeAcnt !== ''
        && activeAcnt.substr(11) !== '%'
      ) {
        acntStr = activeAcnt;
      } else {
        acntStr = this.acntItems[0]['id'];
      }
      this.depositObj['acntNo'] = acntStr;
      this.depositObj['bankAcnt_rcv'] = '';
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1].substr(0, 2);
      this.getBankAcntList();
      this.getBankSecurityList();
      this.getcashAmtInfo();
      this.setState({ acntItems: this.acntItems, });
      this.setState(prevState => ({
        depositObj: {
          ...prevState.depositObj,
          acntNo: this.depositObj.acntNo,
          bankAcnt_rcv: this.depositObj.bankAcnt_rcv
        }
      }))
      this.getBankAcntList();
      this.getBankSecurityList();
      this.getcashAmtInfo();
    })
  }

  // --- get bank account list
  getBankAcntList = () => {
    if (this.getBankAcntListFlag) { return; }
    this.getBankAcntListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap 
    const reqInfo = new requestInfo();
    reqInfo.component = this.component;
    reqInfo.reqFunct = this.getBankAcntList_FunctNm;
    reqInfo.receiveFunct = this.getBankAcntList_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    // svInputPrm.ClientSeq = request_seq_comp;
    svInputPrm.WorkerName = 'ALTqAccount';
    svInputPrm.ServiceName = 'ALTqAccount_Common';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['07', '%'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    //socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getBankAcntListFunct_ReqTimeOut = setTimeout(this.solvingDeposit_TimeOut,
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
    this.bankAcntTps = [];
    this.bankAcntTpsTmp = [];
  }
  // --- handle get bank account list
  getBankAcntList_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getBankAcntListFunct_ReqTimeOut);
    const cltSeqResult = reqInfoMap['ClientSeq']
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getBankAcntListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code'], this.component)
      } else {

      }
      this.req_component.set(cltSeqResult, reqInfoMap);
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        jsondata = [];
      }
      this.req_component.set(cltSeqResult, reqInfoMap);
      this.bankAcntTpsTmp = this.bankAcntTpsTmp.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        const bankAcntTps = this.bankAcntTpsTmp.map(item => {
          const label = item.c1;
          const value = item.c0;
          return { label, value }
        });
        reqInfoMap.procStat = 2;
        this.getBankAcntListFlag = false;
        this.req_component.set(cltSeqResult, reqInfoMap);
        this.depositObj['trnBnk'] = '';
        this.setState({ bankAcntTps });
        this.setState(prevState => ({
          depositObj: {
            ...prevState.depositObj,
            trnBnk: ''
          }
        }))
      }
    }
  }
  // --- get bank Security list
  getBankSecurityList = () => {
    if (this.getBankSecListFlag) { return; }
    this.getBankSecListFlag = true;

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getBankSecList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getBankSecList_ResultProc

    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_Common';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['02'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getBankSecListFunct_ReqTimeOut = setTimeout(this.solvingDeposit_TimeOut,
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
    this.bankSecList = [];
    this.bankSecListTmp = [];
  }
  // --- handle get bank Security list
  getBankSecList_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getBankSecListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getBankSecListFlag = false;
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
      this.bankSecListTmp = this.bankSecListTmp.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        const bankSecList = this.bankSecListTmp.map(item => {
          const label = item.c2 + ' - ' + item.c1;
          const value = JSON.stringify(item);
          return { label, value }
        });
        reqInfoMap.procStat = 2;
        this.getBankSecListFlag = false;
        this.depositObj['trnBnk'] = '';
        this.setState({ bankSecList });
        this.setState(prevState => ({
          depositObj: {
            ...prevState.depositObj,
            trnBnk: '',
          }
        }))
      }
    }
  }
  // -- get cash amount information
  getcashAmtInfo = () => {
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getCashAmount_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getCashAmount_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_0201_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    if (this.getCashAmountFunct_ReqTimeOut) clearTimeout(this.getCashAmountFunct_ReqTimeOut)
    this.getCashAmountFunct_ReqTimeOut = setTimeout(this.solvingDeposit_TimeOut,
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
  }
  // -- handle get cash amount information
  getCashAmount_ResultProc = (reqInfoMap, message) => {
    console.log(message)
    clearTimeout(this.getCashAmountFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
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
        this.depositObj['cashAmt'] = jsondata[0]['c4'];
        this.setState(prevState => ({
          depositObj: {
            ...prevState.depositObj,
            cashAmt: this.depositObj['cashAmt'],
          }
        }))
      } catch (err) {
        // glb_sv.logMessage(err);
        this.depositObj['cashAmt'] = 0;
        this.setState(prevState => ({
          depositObj: {
            ...prevState.depositObj,
            cashAmt: 0,
          }
        }))
      }
    }
  }
  // -- send request to Deposit
  sendInformToDeposit = (cfmTp) => {
    if (this.reqDepositFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_inform_deposit: false });
      return;
    }
    // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
    //   const ermsg = 'Can_not_connected_to_server_plz_check_your_network';
    //   glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
    //   return;
    // }

    this.reqDepositFlag = true;
    const deposit_amtStr = this.depositObj['deposit_amt'];
    const bankAcnt_rcv = this.depositObj['bankAcnt_rcv'];

    const deposit_amt = filterNumber(deposit_amtStr);
    const noteInfo = this.depositObj['note']
    const trnBnkacnt = this.depositObj['trnBnkacnt'];
    const trnBnk = this.depositObj['trnBnk'];
    const rcvBankacnt = bankAcnt_rcv['c2'];
    const rcvBnk = bankAcnt_rcv['c0'];
    this.setState({ reqDepositFlag: true });
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.reqDeposit_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.reqDeposit_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxCash';
    svInputPrm.ServiceName = 'ALTxCash_0201_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InVal = [this.actn_curr, this.sub_curr, '2', rcvBankacnt, rcvBnk, trnBnkacnt, trnBnk, deposit_amt + '', noteInfo];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.reqDepositFunct_ReqTimeOut = setTimeout(this.solvingDeposit_TimeOut,
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

  }
  // -- handle send request to Deposit
  reqDeposit_ResultProc = (reqInfoMap, message) => {
    console.log(message, reqInfoMap)
    this.reqDepositFlag = false;
    clearTimeout(this.reqDepositFunct_ReqTimeOut);
    this.setState({ reqDepositFlag: false });
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
        this.setState({ cfm_inform_deposit: false });
      }
    } else {
      this.setState({ cfm_inform_deposit: false });
      this.reset_inputform();
      this.getcashAmtInfo();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)

      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }

  reset_inputform = () => {
    this.depositObj['trnBnkacnt'] = null;
    this.depositObj['trnBnk'] = '';
    this.depositObj['bankAcnt_rcv'] = '';
    this.depositObj['bankinfo'] = null;
    this.depositObj['deposit_amt'] = 0;
    this.depositObj['note'] = null;
    this.setState({ depositObj: this.depositObj });
  }

  handleChangeInput = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    if (name === 'depositObj_trnBnkacnt') {
      this.depositObj.trnBnkacnt = value;
    }

    this.setState(
      prevState => ({
        depositObj: {
          ...prevState.depositObj,
          trnBnkacnt: this.depositObj.trnBnkacnt
        }
      })
    );
  }
  handleChangetrnBnk = (selected) => {
    this.setState({ selectedTrnBnk: selected })
    const value = selected.value;
    this.depositObj['trnBnk'] = value;
    this.setState(
      prevState => ({
        depositObj: {
          ...prevState.depositObj,
          trnBnk: this.depositObj.trnBnk,
        }
      })
    );

    if (this.depositObj_bankAcnt_rcv) this.depositObj_bankAcnt_rcv.focus();
  }
  handleChangeBnkRcv = (selected) => {
    this.setState({ selectedBnkRcv: selected })
    const value = selected.value;
    const valueFix = JSON.parse(value);
    this.depositObj['bankinfo'] = valueFix['c1'];
    this.depositObj.bankAcnt_rcv = valueFix;
    this.setState(
      prevState => ({
        depositObj: {
          ...prevState.depositObj,
          bankinfo: this.depositObj['bankinfo'],
          bankAcnt_rcv: this.depositObj.bankAcnt_rcv
        }
      })
    );
    focusELM('depositObj_deposit_amt');
  }
  handleChangePrice = (e) => {
    const value = filterNumber(e.target.value);
    if (value > 999) { this.depositObj.deposit_amt = FormatNumber(value); }
    else this.depositObj.deposit_amt = value;
    this.setState(prevState => ({
      depositObj: {
        ...prevState.depositObj,
        deposit_amt: this.depositObj.deposit_amt
      }
    }))
  }
  solvingDeposit_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    // glb_sv.setReqInfoMapValue(cltSeq, reqIfMap);
    console.log('solvingDeposit_TimeOut',reqIfMap)
    this.req_component.set(cltSeq, reqIfMap);
    this.setState({ refreshFlag: '' });
    if (reqIfMap.reqFunct === this.getBankAcntList_FunctNm) {
      this.getBankAcntListFlag = false;
    } else if (reqIfMap.reqFunct === this.getCashAmount_FunctNm) {
    } else if (reqIfMap.reqFunct === this.reqDeposit_FunctNm) {
      this.setState({ reqDepositFlag: false });
      this.reqDepositFlag = false;
    } else if (reqIfMap.reqFunct === this.getBankSecList_FunctNm) {
      this.getBankSecListFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', false, '', this.component)
  }

  openConfirmModalDeposit = () => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      const trnBnk = this.depositObj['trnBnk'];
      if (trnBnk === null || trnBnk === undefined || trnBnk.trim().length === 0) {
        if (this.depositObj_trnBnk) this.depositObj_trnBnk.focus();
        glb_sv.checkToast(toast, 'warn', this.props.t('transfer_bank_name_must_input'), 'depost_trnbnk_not_name');
        return;
      };

      if (this.state.depositObj.deposit_amt === null || this.state.depositObj.deposit_amt === '' || this.state.depositObj.deposit_amt === 0) {
        focusELM('depositObj_deposit_amt');
        glb_sv.checkToast(toast, 'warn', this.props.t('deposit_cash_require'), 'deposit_cash_requirea');
        return;
      }

      const deposit_amtStr = this.depositObj['deposit_amt'];
      let deposit_amt = filterNumber(deposit_amtStr);
      if (deposit_amt === null || deposit_amt === undefined || isNaN(deposit_amt)) { deposit_amt = 0; }

      let trnBnkacnt = this.depositObj['trnBnkacnt'];
      if (trnBnkacnt === null || trnBnkacnt === undefined || trnBnkacnt.trim().length === 0) {
        trnBnkacnt = '';
      };

      const bankAcnt_rcv = this.depositObj['bankAcnt_rcv'];
      if (bankAcnt_rcv === null || bankAcnt_rcv === undefined || bankAcnt_rcv === '') {
        if (this.depositObj_bankAcnt_rcv) this.depositObj_bankAcnt_rcv.focus();
        glb_sv.checkToast(toast, 'warn', this.props.t('receive_bank_account_must_input'), 'deposit_recebnk_not_name');
        return;
      };

      if (Number(deposit_amt) <= 0) {
        focusELM('depositObj_deposit_amt');
        glb_sv.checkToast(toast, 'warn', this.props.t('deposit_amount_must_over_zero'), 'deposit_not_zezo');
        return;
      };
      if (!glb_sv.checkOtp('confirmDepositInfo', objShareGlb, this.component)) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
        }
        return;
      };
      this.setState({ cfm_inform_deposit: true });
    })
  }


  modalAfterOpened = () => {
    const elm = document.getElementById('bt_sendInformToDepositOk');
    if (elm) elm.focus();
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'depositObj_deposit_amt') {
      if (code === 13) {
        this.openConfirmModalDeposit();
      }
    }
  }

  handleChangeAccount = ({ value, label }) => {
    this.activeAcnt = value;
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.depositObj.acntNo = value;
    this.depositObj['cashAmt'] = 0;
    this.setState(prevState => ({
      depositObj: {
        ...prevState.depositObj,
        acntNo: this.depositObj.acntNo,
        cashAmt: this.depositObj.cashAmt
      }
    }));
    if (!glb_sv.flagProcessPopout) this.getcashAmtInfo();
  }

  render() {
    const { t } = this.props
    return (
      <div className='deposit-inform ' style={{ paddingTop: 10 }}>
        <div className="card form-cash-transaction">
          <div className="card-body">
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('trans_sub_account')}</label>
              <div className="col-sm-7 no-padding-left">
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
              <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('cash_amount')}
              </label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <span className="form-control form-control-sm text-right">
                  {FormatNumber(this.state.depositObj['cashAmt'], 0, 0)}
                </span>
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('from_bank_acnt')}</label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"depositObj_trnBnkacnt"}
                  value={this.state.depositObj.trnBnkacnt}
                  onChange={this.handleChangeInput}
                  classextend={'form-control-sm'}
                />
              </div>
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('from_bank')}<span className="mustInput">*</span></label>
              <div className='col-sm-7 no-padding-left'>
                {this.state.isChangeTheme && <Select name='depositObj_trnBnk' ref={refCon => this.depositObj_trnBnk = refCon} id='depositObj_trnBnk'
                  value={this.state.selectedTrnBnk} placeholder={'-- ' + t('select_bank_from')}
                  options={this.state.bankAcntTps} onChange={this.handleChangetrnBnk} styles={customStyles}
                  theme={(theme) => ({
                    ...theme,
                    color: '',
                    colors: {
                      ...theme.colors,
                      text: '',
                      primary25: glb_sv.style[glb_sv.themePage].sideBar.background_hover_search,
                      neutral0: glb_sv.style[glb_sv.themePage].sideBar.background_search,
                    }
                  })}
                />}
              </div>

            </div>

            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('bank_account_receive')}<span className="mustInput">*</span></label>
              {this.state.isChangeTheme && <Select name='depositObj_bankAcnt_rcv' ref={refCon => this.depositObj_bankAcnt_rcv = refCon}
                className='col-sm-7 no-padding-left' value={this.state.selectedBnkRcv}
                placeholder={'-- ' + t('select_receive_bank_acnt')}
                options={this.state.bankSecList} onChange={this.handleChangeBnkRcv} styles={customStyles}
                theme={(theme) => ({
                  ...theme,
                  color: '',
                  colors: {
                    ...theme.colors,
                    text: '',
                    primary25: glb_sv.style[this.state.themePage].sideBar.background_hover_search,
                    neutral0: glb_sv.style[this.state.themePage].sideBar.background_search,
                  }
                })}
              />}
            </div>
            <div className="form-group row ">
              <label className="col-sm-5 control-label no-padding-right text-left">{t('deposit_amount')}<span className="mustInput">*</span></label>
              <div className="col-sm-7 no-padding-left input-group input-group-sm">
                <Input
                  inputtype={"text"}
                  name={"depositObj_deposit_amt"}
                  value={this.state.depositObj.deposit_amt}
                  onChange={this.handleChangePrice}
                  onKeyDown={this.handleKeyPress}
                  classextend={'form-control-sm text-right'}
                />
              </div>
            </div>
            <div className="form-group row" style={{ marginTop: 25 }}>
              <div className='col-sm fullWidthButton'>
                <button className="btn btn-pill btn-sm btn-block pull-right btn-wizard" onClick={this.openConfirmModalDeposit}>
                  {t('send_message')} &nbsp;
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
            activeAcnt={this.state.depositObj.acntNo}
          />
        </div>

        {/* modal Xác thực gửi yêu cầu  "."*/}
        <Modal
          isOpen={this.state.cfm_inform_deposit}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpened}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('confirm_send_deposite_inform')} : {this.state.depositObj['acntNo']}, {t('deposit_amount')}: {this.state.depositObj['deposit_amt']}
            VNĐ?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_sendInformToDepositOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.sendInformToDeposit('Y')}>
                    {this.state.reqDepositFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.sendInformToDeposit('N')}>
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

export default translate('translations')(DepositInform);