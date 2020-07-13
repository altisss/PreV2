import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SelectBasic from "../../conponents/basic/selectBasic/SelectBasic";
import ReactTable from "react-table";
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';

import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel';
import { filterNumber } from '../../utils/filterNumber'
import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

class OddLotOrder extends PureComponent {
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
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.AFTER_OTP}_${this.component}`)
      })
    }
    this.state = {
      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
      oddlot: {
        acntNo: '',
        stkCd: null,
        price: '',
        qty: '',
        pCode: ''
      },
      cnlOddLot: {
        shl: '',
        stkCd: '',
        qty: '',
        price: '',
      },
      dataSell: [],
      dataCancel: [],
      columns: this.columnsSell,
      oddlotStk_acntNo: '',
      acntItems: [],
      cfm_sellOddLot_confirm: false,
      selected: null,
      list_sell: 'btn-bg-link',
      list_cancel: '',
      cnlOddLotOrderFlag: false,
      cfm_canclOddLot_confirm: false,
      refreshFlag: '',
      activeTab: '1',
    }
  }

  // oddlotOrdForm: FormGroup;
  oddlotStk = {};
  orderTps = [];
  acntItems = [];
  // -- get odd lot stock list
  oddlotStkListDataTable = [];
  oddlotStkListTemple = [];
  getoddlotStklistFlag = false;
  getoddlotStklist_FunctNm = 'ODDLOTORDERSCR_001';

  // -- send odd lot order
  oddlot = {};
  cfmSendOddlotOrder_FunctNm = 'ODDLOTORDERSCR_003';
  dataFlag = false;
  oddlot_qty = 0;

  // -- get odd lot order list
  oddlotOrdListDataTable = [];
  oddlotOrdListTemple = [];
  getoddlotOrdlistFlag = false;
  getoddlotOrdlist_FunctNm = 'ODDLOTORDERSCR_002';

  cnlOddLotOrderFlag = false;
  cnlOddLotOrder_FunctNm = 'ODDLOTORDERSCR_004';

  columnSell = [
    {
      Header: "#", width: 44, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <button type="button" onClick={() => this.pushInfo(props.original)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_sell')}</button>
    },
    { Header: "short_symbol", accessor: "c0", width: 70, headerClassName: 'text-center', className: 'text-center' },
    { Header: "oddlot_qty", accessor: "c9", width: 185, headerClassName: 'text-center', className: 'text-right' },
    { Header: "own_qty", accessor: "c3", width: 100, headerClassName: 'text-center', className: 'text-right' },
    { Header: "quantity_available", accessor: "c4", width: 125, headerClassName: 'text-center', className: 'text-right' },
    { Header: "price_type", accessor: "c6", width: 105, headerClassName: 'text-center', className: 'text-right' },
    { Header: "ratio_percent", accessor: "c5", width: 100, headerClassName: 'text-center', className: 'text-right' },
    { Header: "price", accessor: "c8", width: 84, headerClassName: 'text-center', className: 'text-right' },
    { Header: "price_of_sec_buy", accessor: "c7", width: 130, headerClassName: 'text-center', className: 'text-right' }
  ];

  columnCancel = [
    {
      Header: "#", width: 44, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <button disabled={props.original.c5 !== '3'} type="button" onClick={() => this.cancelOrdOddLot(props.original)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Cancel')}</button>
    },
    { Header: "order_number", accessor: "c0", width: 75, headerClassName: 'text-center', className: 'text-right' },
    { Header: "register_sell_time", accessor: "c1", width: 170, headerClassName: 'text-center', className: 'text-center' },
    { Header: "short_symbol", accessor: "c2", width: 100, headerClassName: 'text-center', className: 'text-center' },
    { Header: "odd_lot_qty", accessor: "c3", width: 92, headerClassName: 'text-right', className: 'text-right' },
    { Header: "price", accessor: "c4", width: 76, headerClassName: 'text-center', className: 'text-right' },
    { Header: "order_status", accessor: "c7", width: 130, headerClassName: 'text-center', className: 'text-' },
  ];

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

      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      this.loadData();
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)

    })

  }

  componentDidMount() {

    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_sellOddLot_confirm) this.setState({ cfm_sellOddLot_confirm: false });
      else if (this.state.cfm_canclOddLot_confirm) this.setState({ cfm_canclOddLot_confirm: false });
      else {
        const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
        inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      }
    })
    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'openSellOrdOddLot') this.setState({ cfm_sellOddLot_confirm: true });
      if (msg.data === 'openCancelOrdOddLot') this.setState({ cfm_canclOddLot_confirm: true });
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
    window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
      glb_sv.objShareGlb = agrs.objShareGlb;
    });

    this.delayLoadData();

  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    if (this.getoddlotStklistFunct_ReqTimeOut) { clearTimeout(this.getoddlotStklistFunct_ReqTimeOut); }
    if (this.cfmSendOddlotOrderFunct_ReqTimeOut) { clearTimeout(this.cfmSendOddlotOrderFunct_ReqTimeOut); }

    if (this.getoddlotOrdlistFunct_ReqTimeOut) { clearTimeout(this.getoddlotOrdlistFunct_ReqTimeOut); }
    if (this.cnlOddLotOrderFunct_ReqTimeOut) { clearTimeout(this.cnlOddLotOrderFunct_ReqTimeOut); }
  }

  delayLoadData() {
    if (this.props.active_components && this.props.active_components.some(e => e === this.component)) {
      this.loadData();
    } else {
      setTimeout(() => {
        this.loadData();
      }, 100);
    }
  }

  loadData() {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'activeAcnt'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      glb_sv.objShareGlb = args.get('objShareGlb')
      const activeAcnt = args.get('activeAcnt')

      this.acntItems = glb_sv.objShareGlb['acntNoList'];
      let acntStr = '';
      if (activeAcnt !== null && activeAcnt !== undefined && activeAcnt !== '' &&
        activeAcnt.substr(11) !== '%') {
        acntStr = activeAcnt;
      } else {
        acntStr = glb_sv.objShareGlb['acntNoList'][0]['id'];
      }
      this.oddlotStk['acntNo'] = acntStr;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];

      this.getoddlotStkList();
      this.getoddlotOrdList();
      this.setState({ acntItems: this.acntItems, });
      this.setState(prevState => ({
        oddlot: {
          ...prevState.oddlot,
          acntNo: this.oddlot.acntNo
        }
      }))
    })

  }



  handle_getoddlotStkList = (reqInfoMap, message) => {
    clearTimeout(this.getoddlotStklistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getoddlotStklistFlag = false;
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
        // glb_sv.logMessage(err);
        jsondata = [];
      }
      this.oddlotStkListTemple = this.oddlotStkListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getoddlotStklistFlag = false;
        this.oddlotStkListDataTable = this.oddlotStkListTemple;
        this.dataFlag = false;
        this.setState({ dataSell: this.oddlotStkListDataTable });
      }
    }
  }

  // --- get stock odd lot list function
  getoddlotStkList = () => {
    if (this.getoddlotStklistFlag) { return; }

    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getoddlotStklistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_getoddlotStkList
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getoddlotStklist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getoddlotStkList
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqStock';
    svInputPrm.ServiceName = 'ALTqStock_StockQuantity';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['03', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    console.log("getoddlotStkList -> svInputPrm", svInputPrm)

    this.getoddlotStklistFunct_ReqTimeOut = setTimeout(this.solvingoddlotOrd_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.oddlotStkListTemple = [];
    this.setState({ dataSell: [] });
    this.req_component.set(request_seq_comp, reqInfo)
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    });
    
  }

  sellOddLot = () => {
    if (this.oddlot_qty === 0) { return; }
    if (!glb_sv.checkOtp('openSellOrdOddLot')) {
      if (window.location.pathname.includes('___')) {
        const ermsg = 'notify_user_enter_otp_in_main_screen';
        const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
    };
    this.setState({ cfm_sellOddLot_confirm: true });
  }

  handle_cfrmSendOddlotOrder = (reqInfoMap, message) => {
    clearTimeout(this.cfmSendOddlotOrderFunct_ReqTimeOut);
    this.setState({ cfmSendOddlotOrderFlag: false });
    this.cfmSendOddlotOrderFlag = false;
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code'], this.component)

      }
    } else {
      this.setState({ cfm_sellOddLot_confirm: false });
      this.getoddlotStkList();
      this.getoddlotOrdList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)

      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'hitory-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }

  cfrmSendOddlotOrder = (cfmTp) => {
    if (this.cfmSendOddlotOrderFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_sellOddLot_confirm: false });
      return;
    }

    this.cfmSendOddlotOrderFlag = true;
    this.setState({ cfmSendOddlotOrderFlag: true });
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_cfrmSendOddlotOrder
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cfmSendOddlotOrder_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_cfrmSendOddlotOrder
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxOrder';
    svInputPrm.ServiceName = 'ALTxOrder_0507_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';

    svInputPrm.InVal = ['2', this.actn_curr, this.sub_curr, '', this.oddlot['stkCd'], '2',
      this.oddlot['qty'] + '', this.oddlot['price'] + '', '0000'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    // console.log(JSON.stringify(svInputPrm));
    this.cfmSendOddlotOrderFunct_ReqTimeOut = setTimeout(this.solvingoddlotOrd_TimeOut,
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

  handle_getoddlotOrdList = (reqInfoMap, message) => {
    clearTimeout(this.getoddlotOrdlistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getoddlotOrdlistFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
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
      this.oddlotOrdListTemple = this.oddlotOrdListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getoddlotOrdlistFlag = false;
        this.dataFlag = false;
        this.setState({ dataCancel: this.oddlotOrdListTemple });
      }
    }
  }

  // --- get odd lot order list function
  getoddlotOrdList = () => {
    if (this.getoddlotOrdlistFlag) { return; }

    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getoddlotOrdlistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_getoddlotOrdList
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getoddlotOrdlist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_getoddlotOrdList
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqOrder';
    svInputPrm.ServiceName = 'ALTqOrder_0507_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['2', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    console.log("getoddlotOrdList -> svInputPrm", svInputPrm)

    this.getoddlotOrdlistFunct_ReqTimeOut = setTimeout(this.solvingoddlotOrd_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.oddlotOrdListTemple = [];
    this.setState({ dataCancel: [] });
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

  cancelOrdOddLot = (item) => {
    if (item.c5 !== '3') { return; }
    this.cnlOddLot = {};
    this.cnlOddLot['pCode'] = '';
    this.cnlOddLot['shl'] = item['c0'];
    this.cnlOddLot['stkCd'] = item['c2'];
    this.cnlOddLot['qty'] = FormatNumber(item['c3']);
    this.cnlOddLot['price'] = FormatNumber(item['c4']);
    this.setState({ cnlOddLot: this.cnlOddLot });

    if (!glb_sv.checkOtp('openCancelOrdOddLot')) {
      if (window.location.pathname.includes('___')) {
        const ermsg = 'notify_user_enter_otp_in_main_screen';
        const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
        glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
    };

    this.setState({ cfm_canclOddLot_confirm: true });
  }

  handle_sendCancelOrdOddlotCfm = (reqInfoMap, message) => {
    clearTimeout(this.cnlOddLotOrderFunct_ReqTimeOut);
    this.setState({ cnlOddLotOrderFlag: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', 'cnlOddLot_pCode', false, '', this.component)
        this.setState({ cfm_canclOddLot_confirm: false });
      }
    } else {
      this.setState({ cfm_canclOddLot_confirm: false });
      this.getoddlotStkList();
      this.getoddlotOrdList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)
    }
  }

  sendCancelOrdOddlotCfm = (cfmTp) => {
    if (this.state.cnlOddLotOrderFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_canclOddLot_confirm: false });
      return;
    }
    const password = this.cnlOddLot['pCode'];
    if (password == null || password.length === 0) {
      const ermsg = 'phone_code_require';
      glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', '', '', false, 'cnlOddLot_pCode', this.component)
      return;
    }

    this.setState({ cnlOddLotOrderFlag: true });
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap handle_sendCancelOrdOddlotCfm
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cnlOddLotOrder_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.handle_sendCancelOrdOddlotCfm
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxOrder';
    svInputPrm.ServiceName = 'ALTxOrder_0507_2';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InCrpt = [3];
    svInputPrm.InVal = [this.cnlOddLot['shl'], this.actn_curr, this.sub_curr, password];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.cnlOddLotOrderFunct_ReqTimeOut = setTimeout(this.solvingoddlotOrd_TimeOut,
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

  solvingoddlotOrd_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(cltSeq)) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    this.setState({ refreshFlag: '' });
    if (reqIfMap.reqFunct === this.getoddlotStklist_FunctNm) {
      this.getoddlotStklistFlag = false;
    } else if (reqIfMap.reqFunct === this.cfmSendOddlotOrder_FunctNm) {
      this.setState({ cfmSendOddlotOrderFlag: false });
      this.cfmSendOddlotOrderFlag = false;
    } else if (reqIfMap.reqFunct === this.getoddlotOrdlist_FunctNm) {
      this.getoddlotOrdlistFlag = false;
    } else if (reqIfMap.reqFunct === this.cnlOddLotOrder_FunctNm) {
      this.setState({ cnlOddLotOrderFlag: false });
    }
    console.log('solvingoddlotOrd_TimeOut',reqIfMap.reqFunct)
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', '', '', false, '', this.component)

  }

  handleInputpCode = (e) => {
    const value = e.target.value;
    this.cnlOddLot['pCode'] = value;
    this.setState(prevState => ({
      cnlOddLot: {
        ...prevState.cnlOddLot,
        pCode: value
      }
    }));
  }

  modalAfterOpened = (key) => {
    if (key === 'sell') {
      const elm = document.getElementById('bt_cfrmSendOddlotOrderOk');
      if (elm) elm.focus();
    } else if (key === 'cancel') {
      const elm = document.getElementById('cnlOddLot_pCode');
      if (elm) elm.focus();
    }
  }
  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, minWidth: item.width };
  }
  transData(item) {
    if (this.dataFlag) {
      return {
        c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
        c9: item.c9
      }
    }
    item.c9 = FormatNumber(item.c9);
    item.c3 = FormatNumber(item.c3);
    item.c4 = FormatNumber(item.c4);
    item.c8 = FormatNumber(item.c8);
    item.c7 = FormatNumber(item.c7);
    this.dataFlag = true;
    return {
      c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
      c9: item.c9
    }
  }
  transTime = (value) => {
    if (value === '' || value == null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 2);
    return (day + ':' + month + ':' + year);
  }

  convertDataCancel(item) {
    if (this.dataFlag) {
      return {
        c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
        c9: item.c9
      }
    }
    item.c1 = this.transTime(item.c1);
    if (Number(item.c3) > 999) {
      item.c3 = FormatNumber(item.c3);
    }
    if (Number(item.c4) > 999) {
      item.c4 = FormatNumber(item.c4);
    }

    item.c7 = item.c5 + '. ' + item.c6;

    this.dataFlag = true;
    return {
      c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
      c9: item.c9
    }
  }

  pushInfo(data) {
    let oddlot = { ...this.state.oddlot };
    oddlot.stkCd = data.c0;
    oddlot.price = filterNumber(data.c7);
    oddlot.qty = filterNumber(data.c4) % 10;
    this.oddlot = oddlot;
    this.oddlot_qty = filterNumber(data.c9);
    if (data.c9 !== 0) {
      this.setState({
        // selected: rowInfo.index,
        oddlot: oddlot
      });
      this.sellOddLot();
    }
  }

  handleShowSellList = () => {
    this.setState({ list_sell: 'btn-bg-link', list_cancel: '' });
  }
  handleShowCancelList = () => {
    this.setState({ list_sell: '', list_cancel: 'btn-bg-link' });
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'pCode' && code === 13) {
      this.sendCancelOrdOddlotCfm('Y');
    } else if (name === 'pCode' && code === 27) {
      this.sendCancelOrdOddlotCfm('N');
    }
  }

  getNewInformation = () => {
    this.setState({ refreshFlag: 'fa-spin' });
    this.getoddlotStkList();
    this.getoddlotOrdList();
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab + ''
      });
    }
    if (tab === 1) this.getoddlotStkList();
    else this.getoddlotOrdList();
    this.setState({ getList: tab });
  }

  handleChangeAccount = ({ value, label }) => {
    if (value !== this.oddlotStk.acntNo) this.delayLoadData();
  }

  render() {
    const { t } = this.props;
    return (
      <div className='oddlot-order'>
        <div className="card">
          <div className="card-body widget-body">
            <div className="col-5 flex no-padding">
              <SearchAccount
                handleChangeAccount={this.handleChangeAccount}
                component={this.component}
                req_component={this.req_component}
                get_rq_seq_comp={this.get_rq_seq_comp}
                get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                language={this.state.language}
                themePage={this.state.themePage}
                style={this.state.style}
                isShowSubno={true}
              />
            </div>
            <Nav tabs role="tablist">
              <NavItem>
                <NavLink className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => this.toggle(1)}>{t('stock_list_can_sell_oddlot')}
                </NavLink>
              </NavItem>
              <NavItem >
                <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => this.toggle(2)}>{t('oddlot_order_list')}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent id='divBottom' style={{'display': 'flex' }} className="panel-body" activeTab={this.state.activeTab}>
              <TabPane tabId="1" >
                <ReactTable
                  data={this.state.dataSell.map(item => this.transData(item))}
                  columns={this.columnSell.map(item => this.transTitle(item))}
                  pageSize={this.state.dataSell.length < 10 ? 10 : this.state.dataSell.length}
                  showPagination={false}
                  style={{
                    height: 285,
                    top: 5,
                    maxWidth: 943
                  }}
                  NoDataComponent={() => {
                    return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
                  }}
                  className="-striped -highlight"
                />
              </TabPane>
              <TabPane tabId="2">
                <ReactTable
                  data={this.state.dataCancel.map(item => this.convertDataCancel(item))}
                  columns={this.columnCancel.map(item => this.transTitle(item))}
                  pageSize={this.state.dataCancel.length < 10 ? 10 : this.state.dataCancel.length}
                  showPagination={false}
                  style={{
                    height: 285,
                    top: 5,
                    maxWidth: 687
                  }}
                  NoDataComponent={() => {
                    return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
                  }}
                  className="-striped -highlight"
                />
              </TabPane >
            </TabContent>
          </div>
        </div>


        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_sellOddLot_confirm}
          size={"sm modal-notify"}
          // onClosed={this.modalModalClose}
          onOpened={() => this.modalAfterOpened('sell')}>
          <ModalHeader>
            {t('confirm_sell_oddlot')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <label className="col-sm-3 marginAuto control-label no-padding-right text-left">{t('short_acnt_no')}</label>
              <div className="col-sm-9">
                <SelectBasic
                  inputtype={"text"}
                  name={"acntNo"}
                  value={this.state.oddlot.acntNo}
                  options={this.state.acntItems}
                  classextend={'form-control-sm'}
                  disabled={true}
                />
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 control-label no-padding-right marginAuto">{t('short_symbol')}</label>
              <div className="col-sm-9">
                <strong className="form-control form-control-sm text-center" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{this.state.oddlot['stkCd']}</strong>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 control-label no-padding-right text-left marginAuto">{t('qty')}</label>
              <div className="col-sm-3 input-group input-group-sm no-padding-right">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.oddlot.qty, 0, 0)}</span>
              </div>
              <label className="col-sm-2 control-label no-padding-right marginAuto" style={{ marginLeft: '8.333333%' }}>{t('price')}</label>
              <div className="col-sm-3 no-padding-left">
                <div className="input-group input-group-sm">
                  <span className="form-control form-control-sm text-right">{FormatNumber(this.state.oddlot.price, 0, 0)}</span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_cfrmSendOddlotOrderOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfrmSendOddlotOrder('Y')}>
                    {this.state.cfmSendOddlotOrderFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfrmSendOddlotOrder('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* modal hủy lệnh */}
        <Modal
          isOpen={this.state.cfm_canclOddLot_confirm}
          size={"md modal-notify"}
          // onClosed={this.modalModalClose}
          onOpened={() => this.modalAfterOpened('cancel')}>
          <ModalHeader>
            {t('confirm_cancel_oddlot')}
          </ModalHeader>
          <ModalBody>

            <div className="form-group row">
              <label className="col-sm-3 marginAuto control-label no-padding-right text-left">{t('sub_account')}</label>
              <div className="col-sm-9">
                <SelectBasic
                  inputtype={"text"}
                  name={"acntNo"}
                  value={this.state.oddlot.acntNo}
                  options={this.state.acntItems}
                  classextend={'form-control-sm'}
                  disabled={true}
                />
              </div>
            </div>

            <div className="form-group row">
              <label className="col-sm-3 control-label no-padding-right text-left marginAuto">{t('order_number')}</label>
              <div className="col-sm-9 input-group input-group-sm">
                <span className="form-control form-control-sm text-center">{this.state.cnlOddLot['shl']} </span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 control-label no-padding-right text-left marginAuto">{t('short_symbol')}</label>
              <div className="col-sm-3 input-group input-group-sm">
                <strong className="form-control form-control-sm text-center" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{this.state.cnlOddLot['stkCd']}</strong>
              </div>
              <label className="col-sm-3 control-label no-padding-right text-left marginAuto">{t('qty')}</label>
              <div className="col-sm-3 input-group input-group-sm">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.cnlOddLot['qty'])}</span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-3 control-label no-padding-right text-left marginAuto">{t('price')}</label>
              <div className="col-sm-3">
                <div className="input-group input-group-sm">
                  <span className="form-control form-control-sm text-right">{this.state.cnlOddLot['price']}</span>
                </div>
              </div>
              <label className="mustInput col-sm-3 control-label no-padding-right text-left marginAuto">{t('phone_code')}</label>
              <div className="col-sm-3">
                <input onKeyDown={this.handleKeyPress} type="password" id="cnlOddLot_pCode" name="pCode" onChange={this.handleInputpCode} className="form-control form-control-sm" maxLength={6} autoComplete="new-password" />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_cfrmSendOddlotOrderOk"
                    color="wizard"
                    onClick={(e) => this.sendCancelOrdOddlotCfm('Y')}>
                    {this.state.cnlOddLotOrderFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.sendCancelOrdOddlotCfm('N')}>
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

export default translate('translations')(OddLotOrder);