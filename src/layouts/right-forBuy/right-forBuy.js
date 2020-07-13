import React from 'react'
import { translate } from 'react-i18next';
import ReactTable from "react-table";
// import { columnsRightForBuy } from './columnsRightForBuy';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import SelectBasic from "../../conponents/basic/selectBasic/SelectBasic";
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv'
import { filterNumber } from '../../utils/filterNumber'
import SearchAccount from '../../conponents/search_account/SearchAccount';

const remote = require('electron').remote;

class RightForBuy extends React.Component {
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
      })
    }

    this.rghtForBuy = {
      acntNo: '',
      stkCd: null,
      rgtNo: null,
      ownQty: null,
      rgtQtyBf: null,
      buyAbleQty: null,
      waitQty: null,
      avaiCash: null,
      avaQty: null,
      rgtQty: '',
      rgtQty_require: false,
      mrkPrice: null,
      values: null,
      note: '',
      item: null,
      rgt_require: false
    };
    this.state = {
      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
      data: [],
      columns: this.columnsData,
      columnsCancel: this.columnsCancel,
      heightScroll: '235px',
      selected: null,
      rghtForBuy: this.rghtForBuy,
      cfmSendRightForBuyFlag: false,
      cfm_rghtforbuy_request: false,
      histRgtFBuyListDataTable: [],
      list_data: 'btn-bg-link',
      list_cancel: '',
      cfm_regitRgt_cancl_confirm: false,
      cancelRightForBuyFlag: false,
      canclRgtForBuy: {},
      refreshFlag1: '',
      refreshFlag2: '',
      activeTab: '1',
    };
  }

  acntItems = [];
  // -- get current right for buy list
  rghtForBuyListDataTable = [];
  rghtForBuyListTemple = [];
  getrghtForBuylistFlag = false;
  getrghtForBuylist_FunctNm = 'RIGHTFORBUY_001';
  getrghtForBuylistFunct_ReqTimeOut;
  // -- send rigister right for buy
  cfmSendRightForBuy_FunctNm = 'RIGHTFORBUY_003';
  cfmSendRightForBuyFunct_ReqTimeOut;
  // -- get cash avaiable info for repay
  getCashAvaibleFlag = false;
  getCashAvaible_FunctNm = 'RIGHTFORBUY_006';
  getCashAvaibleFunct_ReqTimeOut;
  // -- get total value right of an account
  getTotalRightForBuyFlag = false;
  getTotalRightForBuy_FunctNm = 'RIGHTFORBUY_007';
  getTotallRightForBuyFunct_ReqTimeOut;
  // -- cancel a margin contract
  canclRgtForBuy = {};
  cancelRightForBuyFlag = false;
  cancelRightForBuy_FunctNm = 'RIGHTFORBUY_004';

  // -- get history rigister of right for buy
  histRgtFBuyListDataTable = [];
  histRgtFBuyListTemple = [];
  gethistRgtFBuyListFlag = false;
  gethistRgtFBuyList_FunctNm = 'RIGHTFORBUY_005';


  dataFlag = false;

  columnsData = [
    {
      Header: "#", accessor: "c00", width: 63, show: true, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <button type="button" onClick={() => this.chooseRightForBuy(props.original)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('register_right_for_buy')}</button>
    },
    { Header: "common_index", accessor: "c00", width: 40, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "sub_account", accessor: "c5", width: 95, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "right_number", accessor: "c0", width: 130, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "short_symbol", accessor: "c1", width: 70, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "last_date_register", accessor: "c2", width: 120, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "right_price", accessor: "c7", width: 85, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "own_qty", accessor: "c8", width: 110, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "right_quantity_available", accessor: "c9", width: 170, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "registered_quantity", accessor: "c10", width: 128, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "quantity_already_transfer", accessor: "c12", width: 175, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "able_registered_quantity", accessor: "c13", width: 103, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "quantity_waite_approve", accessor: "c11", width: 160, show: true, headerClassName: 'text-center', className: 'text-right' },
  ];

  columnsCancel = [
    {
      Header: "#", accessor: "c00", width: 63, show: true, headerClassName: 'text-center', className: 'text-center',
      Cell: props => <button disabled={props.original.c15 !== 'N'} type="button" onClick={() => this.openModalcanclRgtForBuyCtr(props.original)} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Cancel')}</button>
    },
    { Header: "common_index", accessor: "c00", width: 40, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "working_date", accessor: "c0", width: 113, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "acnt_no", accessor: "c6", width: 91, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "sub_account", accessor: "c7", width: 96, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "right_number", accessor: "c2", width: 130, show: true, headerClassName: 'text-center', className: 'text-' },
    { Header: "short_symbol", accessor: "c3", width: 65, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "last_date_register", accessor: "c4", width: 115, show: true, headerClassName: 'text-center', className: 'text-center' },
    { Header: "rgtbuy_input_quantity", accessor: "c9", width: 120, show: true, headerClassName: 'text-center', className: 'text-right' },
    { Header: "rgtbuy_registered_value", accessor: "c10", width: 120, show: true, headerClassName: 'text-center', className: 'text-right' },
    {
      Header: "common_note", accessor: "c11", width: 175, show: true, headerClassName: 'text-center', className: 'text-',
      Cell: cellInfo => <>{cellInfo.original.c11 === '' || cellInfo.original.c11 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c11}</span>}</>
    },
    {
      Header: "approve_status", width: 120, show: true, headerClassName: 'text-center', className: 'text-',
      Cell: props => <>{props.original.c15}. {props.original.c22}</>
    },
    {
      Header: "approve_staff", accessor: "c16", width: 120, show: true, headerClassName: 'text-center', className: 'text-',
      Cell: cellInfo => <>{cellInfo.original.c16 === '' || cellInfo.original.c16 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c16}</span>}</>
    },
    { Header: "approve_time", accessor: "c17", width: 132, show: true, headerClassName: 'text-center', className: 'text-center' },
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
      this.resetRgtForBuyInfo();
      this.delayLoadData();
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)
      this.resetRgtForBuyInfo();

    })

  }



  componentDidMount() {
    window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
      if (this.state.cfm_rghtforbuy_request) this.setState({ cfm_rghtforbuy_request: false });
      else {
        const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
        inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
      }
    })

    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      const functionNm = msg['data'];
      if (functionNm === 'confirmRightForBuy') {
        this.setState({ cfm_rghtforbuy_request: true });
      } else if (functionNm === 'canclRgtForBuyCtr') {
        this.setState({ cfm_regitRgt_cancl_confirm: true });
      }
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      this.setState({ themePage: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
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
    if (this.getrghtForBuylistFunct_ReqTimeOut) { clearTimeout(this.getrghtForBuylistFunct_ReqTimeOut); }
    if (this.cfmSendRightForBuyFunct_ReqTimeOut) { clearTimeout(this.cfmSendRightForBuyFunct_ReqTimeOut); }
    if (this.cancelRightForBuyFunct_ReqTimeOut) { clearTimeout(this.cancelRightForBuyFunct_ReqTimeOut); }
    if (this.gethistRgtFBuyLisFunct_ReqTimeOut) { clearTimeout(this.gethistRgtFBuyLisFunct_ReqTimeOut); }
    if (this.getCashAvaibleFunct_ReqTimeOut) { clearTimeout(this.getCashAvaibleFunct_ReqTimeOut); }
    if (this.getTotallRightForBuyFunct_ReqTimeOut) { clearTimeout(this.getTotallRightForBuyFunct_ReqTimeOut); }
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
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'activeCode', 'activeAcnt'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      glb_sv.objShareGlb = args.get('objShareGlb')
      const activeAcnt = args.get('activeAcnt')

      const acntStr = activeAcnt;
      this.rghtForBuy['acntNo'] = acntStr;
      this.rghtForBuy['avaiCash'] = 0;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];

      this.getrghtForBuyList();
      this.gethistRgtForBuyList();
      this.setState({ acntItems: this.acntItems });
      this.setState(prevState => ({
        rghtForBuy: {
          ...prevState.rghtForBuy,
          acntNo: this.rghtForBuy.acntNo,
          avablAmt: this.rghtForBuy.avablAmt,
        }
      }))

    })

  }


  getrghtForBuylist_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getrghtForBuylistFunct_ReqTimeOut);
    this.setState({ refreshFlag1: '' });
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getrghtForBuylistFlag = false;
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
        jsondata = [];
      }
      this.rghtForBuyListTemple = this.rghtForBuyListTemple.concat(
        jsondata
      );
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getrghtForBuylistFlag = false;
        this.dataFlag = false;
        this.setState({ data: this.rghtForBuyListTemple });
      }
    }
  }
  cfmSendRightForBuy_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.cfmSendRightForBuyFunct_ReqTimeOut);
    this.cfmSendRightForBuyFlag = false;
    this.setState({ cfmSendRightForBuyFlag: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
        this.setState({ cfm_rghtforbuy_request: false });
      }
    } else {
      this.setState({ cfm_rghtforbuy_request: false });
      this.resetRgtForBuyInfo();
      this.getrghtForBuyList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)


      const obj = {
        type: commuChanel.ACTION_SUCCUSS,
        data: 'history-list',
        component: this.component
      }
      inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
    }
  }

  getTotalRightForBuy_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getTotallRightForBuyFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    this.getTotalRightForBuyFlag = false;
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)

      }
      return;
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        this.rghtForBuy['stkCd'] = jsondata[0]['c1'];
        this.rghtForBuy['rgtNo'] = jsondata[0]['c0'];
        this.rghtForBuy['ownQty'] = jsondata[0]['c7'];
        this.rghtForBuy['rgtQtyBf'] = jsondata[0]['c9'];
        this.rghtForBuy['avaQty'] = jsondata[0]['c12'];
        this.rghtForBuy['avaiCash'] = jsondata[0]['c13'];
        this.rghtForBuy['waitQty'] = jsondata[0]['c10'];
        this.rghtForBuy['buyAbleQty'] = jsondata[0]['c8'];
        this.rghtForBuy['mrkPrice'] = jsondata[0]['c6'];
        this.rghtForBuy['values'] = 0;
        this.rghtForBuy['item'] = jsondata[0];
        this.setState({ rghtForBuy: this.rghtForBuy });
        this.forceUpdate();
        const elm = document.getElementById('rghtForBuy_rgtQty');
        if (elm) elm.focus();
      } catch (err) {
        // glb_sv.logMessage(err);
        console.log('lỗi parse', err);
      }
    }
  }
  getCashAvaible_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getCashAvaibleFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    this.getCashAvaibleFlag = false;
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)

      }
      return;
    } else {
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        this.rghtForBuy['avaiCash'] = jsondata[0]['c5'];
        this.setState(prevState => ({
          rghtForBuy: {
            ...prevState.rghtForBuy,
            avaiCash: this.rghtForBuy.avaiCash
          }
        }))
      } catch (err) {
        // glb_sv.logMessage(err);
        this.rghtForBuy['avaiCash'] = 0;
        this.setState(prevState => ({
          rghtForBuy: {
            ...prevState.rghtForBuy,
            avaiCash: 0
          }
        }))
      }
    }
  }
  gethistRgtFBuyList_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.gethistRgtFBuyLisFunct_ReqTimeOut);
    this.setState({ refreshFlag2: '' });
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.gethistRgtFBuyListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', '', '', false, '', this.component)

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
      this.histRgtFBuyListTemple = this.histRgtFBuyListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        // console.log(this.histRgtFBuyListTemple);
        reqInfoMap.procStat = 2;
        this.gethistRgtFBuyListFlag = false;
        const data = this.histRgtFBuyListTemple.map((item, index) => {
          item.c00 = index + 1;
          item.c0 = this.transDate(item.c0);
          item.c4 = this.transDate(item.c4);

          item.c9 = FormatNumber(item.c9);
          item.c10 = FormatNumber(item.c10);
          item.c17 = this.timeFull(item.c17);
          return item;
        });
        // console.log(data);
        this.setState({ histRgtFBuyListDataTable: data });
      }
    }
  }
  cancelRightForBuy_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.cancelRightForBuyFunct_ReqTimeOut);
    this.cancelRightForBuyFlag = false;
    this.setState({ cancelRightForBuyFlag: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    this.setState({ cfm_regitRgt_cancl_confirm: false });
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)

      }
    } else {
      this.resetRgtForBuyInfo();
      this.getrghtForBuyList();
      this.gethistRgtForBuyList();
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '', this.component)

    }
  }

  solvingMrgFunct_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
      return;
    }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getrghtForBuylist_FunctNm) {
      this.getrghtForBuylistFlag = false;
      this.setState({ refreshFlag1: '' });
    } else if (reqIfMap.reqFunct === this.cfmSendRightForBuy_FunctNm) {
      this.setState({ cfmSendRightForBuyFlag: false });
      this.cfmSendRightForBuyFlag = false;
    } if (reqIfMap.reqFunct === this.getCashAvaible_FunctNm) {
      this.getCashAvaibleFlag = false;
    } else if (reqIfMap.reqFunct === this.getTotalRightForBuy_FunctNm) {
      this.getTotalRightForBuyFlag = false;
    } else if (reqIfMap.reqFunct === this.cancelRightForBuy_FunctNm) {
      this.setState({ cancelRightForBuyFlag: false });
      this.cancelRightForBuyFlag = false;
    } else if (reqIfMap.reqFunct === this.gethistRgtFBuyList_FunctNm) {
      this.gethistRgtFBuyListFlag = false;
      this.setState({ refreshFlag2: '' });
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', false, '', this.component)

  };

  getNewInformation = (key) => {
    if (key === 1) {
      this.getrghtForBuyList();
      this.setState({ refreshFlag1: 'fa-spin' });
    }
    if (key === 2) {
      this.gethistRgtForBuyList();
      this.setState({ refreshFlag2: 'fa-spin' });
    }
  }

  // --- get history Margin contract
  gethistRgtForBuyList = () => {
    if (this.gethistRgtFBuyListFlag) { return; }

    if (
      this.actn_curr === null ||
      this.actn_curr === undefined ||
      this.actn_curr.length === 0
    ) {
      return;
    }

    this.gethistRgtFBuyListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap gethistRgtFBuyList_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.gethistRgtFBuyList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.gethistRgtFBuyList_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqRights';
    svInputPrm.ServiceName = 'ALTqRights_0403_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['3', '%', this.actn_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;


    this.gethistRgtFBuyLisFunct_ReqTimeOut = setTimeout(
      this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
    reqInfo.inputParam = svInputPrm.InVal;
    this.histRgtFBuyListTemple = [];
    this.setState({ histRgtFBuyListDataTable: [] });
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

  getrghtForBuyList = () => {
    if (this.getrghtForBuylistFlag) { return; }

    if (
      this.actn_curr === null ||
      this.actn_curr === undefined ||
      this.actn_curr.length === 0
    ) {
      return;
    }

    this.getrghtForBuylistFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getrghtForBuylist_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getrghtForBuylist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getrghtForBuylist_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqRights';
    svInputPrm.ServiceName = 'ALTqRights_0403_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['2', '%', this.actn_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getrghtForBuylistFunct_ReqTimeOut = setTimeout(
      this.solvingMrgFunct_TimeOut,
      functionList.reqTimeout,
      request_seq_comp
    );
    reqInfo.inputParam = svInputPrm.InVal;
    this.rghtForBuyListTemple = [];
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

  openModalConfirmRightForBuy = () => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      const rgtQtyStr = this.rghtForBuy['rgtQty'];
      let rgtQty = filterNumber(rgtQtyStr);
      if (rgtQty === null || rgtQty === undefined || isNaN(rgtQty)) { rgtQty = 0; }
      if (Number(rgtQty) <= 0) {
        const ermsg = this.props.t('rgtbuy_input_quantity_not_correct');
        glb_sv.checkToast(toast, 'warn', ermsg, 'right_forbuy_rgtQty');
        return;
      }

      let avaQty = filterNumber(this.rghtForBuy['avaQty']);
      if (avaQty === null || avaQty === undefined || isNaN(avaQty)) { avaQty = 0; }
      if (Number(avaQty) < Number(rgtQty)) {
        const ermsg = this.props.t('qty_avail_not_enough');
        glb_sv.checkToast(toast, 'warn', ermsg, 'rghtForBuy_rgtQty');
        return;
      }

      let mrkPrice = this.rghtForBuy['mrkPrice'];
      if (mrkPrice === null || mrkPrice === undefined || isNaN(mrkPrice)) {
        mrkPrice = 0;
      }
      let avaiCash = this.rghtForBuy['avaiCash'];
      if (avaiCash === null || avaiCash === undefined || isNaN(avaiCash)) {
        avaiCash = 0;
      }

      if (!glb_sv.checkOtp('confirmRightForBuy')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
      };
      this.setState({ cfm_rghtforbuy_request: true });
    })

  };

  cfrmSendRightForBuy = cfmTp => {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeCode', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, activeCode) => {
      if (this.cfmSendRightForBuyFlag) { return; }
      if (cfmTp === 'N') {
        this.setState({ cfm_rghtforbuy_request: false });
        return;
      }
      const rgtQtyStr = this.rghtForBuy['rgtQty'];
      const noteInfo = this.rghtForBuy['note'];
      const rgtQty = filterNumber(rgtQtyStr);

      this.cfmSendRightForBuyFlag = true;
      this.setState({ cfmSendRightForBuyFlag: true });
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap cfmSendRightForBuy_ResultProc
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.cfmSendRightForBuy_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.cfmSendRightForBuy_ResultProc
      // -- service info
      let svInputPrm = new serviceInputPrm();
      if (((activeCode === '082' || activeCode === '075') && this.rghtForBuy['item']['c18'].toUpperCase() === 'Y') ||
        this.rghtForBuy['item']['c22'] === 'Y') {
        svInputPrm.WorkerName = 'ALTxRightsBIDV';
        svInputPrm.ServiceName = 'ALTxRights_0403_1';
      } else {
        svInputPrm.WorkerName = 'ALTxRights';
        svInputPrm.ServiceName = 'ALTxRights_0403_1';
      }
      // os_bank_link_yn
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'I';
      svInputPrm.InVal = [
        this.rghtForBuy['rgtNo'],
        this.actn_curr,
        rgtQty + '',
        noteInfo,
        this.sub_curr
      ];
      svInputPrm.TotInVal = svInputPrm.InVal.length;

      this.cfmSendRightForBuyFunct_ReqTimeOut = setTimeout(
        this.solvingMrgFunct_TimeOut,
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
    })

  };

  chooseRightForBuy(item) {
    // this.resetRgtForBuyInfo();

    if (this.state.cfmSendRightForBuyFlag || this.getTotalRightForBuyFlag) { return; }

    if (
      this.actn_curr === null ||
      this.actn_curr === undefined ||
      this.actn_curr.length === 0
    ) {
      return;
    }
    if (item['c0'] === null || item['c0'] === undefined || item['c0'].length === 0) {
      return;
    }

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'activeCode'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')
      const activeCode = agrs.get('activeCode')

      //-- Kiểm tra nếu không được ủy quyền đăng ký mua PHT thì báo lỗi
      const acntObj = objShareGlb['acntNoInfo'].find(x => x.AcntNo === this.actn_curr &&
        x.SubNo === this.sub_curr);
      if (acntObj && acntObj.IsOwnAcnt && acntObj.IsOwnAcnt === 'N') {
        if (acntObj.RgtExeYN === 'N') {
          const ermsg = 'you_not_allow_do_this_function';
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', '', '', this.component)

          return;
        }
      }


      // -- check sec code HBS & BETA follow old rule
      if (activeCode !== '082' && activeCode !== '075') {
        // --      
        this.rghtForBuy['acntNo'] = item['c4'] + '.' + item['c5'];
        this.rghtForBuy['stkCd'] = item['c1'];
        this.rghtForBuy['rgtNo'] = item['c0'];
        this.rghtForBuy['ownQty'] = item['c8']; // -- sl sở hữu
        this.rghtForBuy['rgtQtyBf'] = item['c10']; // -- số lương đăng ký mua trước đó
        this.rghtForBuy['avaQty'] = item['c13']; // -- số lượng có thể đăng ký
        this.rghtForBuy['avaiCash'] = item['c18']; // -- số tiền khả dụng
        this.rghtForBuy['waitQty'] = item['c11']; // -- số lượng chờ approve
        this.rghtForBuy['buyAbleQty'] = item['c9']; // -- số lượng được đăng ký mua
        this.rghtForBuy['mrkPrice'] = item['c7']; // -- giá quyền
        this.rghtForBuy['values'] = 0;

        this.rghtForBuy['item'] = item;
        this.setState({ rghtForBuy: this.rghtForBuy });

        // document.getElementById('rghtForBuy_rgtQty').focus();
        // console.log(JSON.stringify(item));
        this.actn_curr = item['c4'];
        this.sub_curr = item['c5'];

        return;
      }


      // this.resetRgtForBuyInfo();

      this.getTotalRightForBuyFlag = true;
      // -- call service for place order
      const request_seq_comp = this.get_rq_seq_comp()
      // -- push request to request hashmap getTotalRightForBuy_ResultProc
      const reqInfo = new requestInfo();
      reqInfo.reqFunct = this.getTotalRightForBuy_FunctNm;
      reqInfo.component = this.component;
      reqInfo.receiveFunct = this.getTotalRightForBuy_ResultProc
      // -- service info
      let svInputPrm = new serviceInputPrm();
      svInputPrm.WorkerName = 'ALTqRights';
      svInputPrm.ServiceName = 'ALTqRights_0403_1';
      svInputPrm.ClientSentTime = '0';
      svInputPrm.Operation = 'Q';
      svInputPrm.InVal = ['1', item['c0'], this.actn_curr];
      svInputPrm.TotInVal = svInputPrm.InVal.length;

      this.getTotallRightForBuyFunct_ReqTimeOut = setTimeout(
        this.solvingMrgFunct_TimeOut,
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

    })


  }

  openModalcanclRgtForBuyCtr = (item) => {
    if (item['c15'] !== 'N') { return; }
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
      //-- Kiểm tra nếu không được ủy quyền đăng ký mua PHT thì báo lỗi
      const acntObj = objShareGlb['acntNoInfo'].find(x => x.AcntNo === this.actn_curr &&
        x.SubNo === this.sub_curr);
      if (acntObj && acntObj.IsOwnAcnt && acntObj.IsOwnAcnt === 'N') {
        if (acntObj.RgtExeYN === 'N') {
          const ermsg = 'you_not_allow_do_this_function';
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', '', '', this.component)
          return;
        }
      }

      this.canclRgtForBuy['rgtNo'] = item['c2'];
      this.canclRgtForBuy['stkCd'] = item['c3'];
      this.canclRgtForBuy['rgtQty'] = item['c9'];
      this.canclRgtForBuy['Seq'] = item['c1'];
      this.canclRgtForBuy['appSeq'] = item['c20'];
      this.canclRgtForBuy['aprDt'] = item['c19'];
      this.canclRgtForBuy['wkDt'] = item['c0'];
      this.setState({ canclRgtForBuy: this.canclRgtForBuy });
      if (!glb_sv.checkOtp('canclRgtForBuyCtr')) {
        if (window.location.pathname.includes('___')) {
          const ermsg = 'notify_user_enter_otp_in_main_screen';
          const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
          glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
      }
      return;
      };
      this.setState({ cfm_regitRgt_cancl_confirm: true });
    })

  };

  cfmcancelRgtForBuy = cfmTp => {
    if (this.cancelRightForBuyFlag) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_regitRgt_cancl_confirm: false });
      return;
    }

    this.cancelRightForBuyFlag = true;
    this.setState({ cancelRightForBuyFlag: true });
    const Seq = this.canclRgtForBuy['Seq'];
    const aprSeq = this.canclRgtForBuy['appSeq'];
    let aprDt = this.canclRgtForBuy['aprDt'];
    let wkDt = this.canclRgtForBuy['wkDt'];
    if (wkDt != null && wkDt.length > 0) {
      const piceArr = wkDt.split("/");
      if (piceArr && piceArr.length === 3) wkDt = piceArr[2] + piceArr[1] + piceArr[0];
    }
    if (aprDt != null && aprDt.length > 0) {
      aprDt =
        aprDt.substring(4, 8) + aprDt.substring(2, 4) + aprDt.substring(0, 2);
    }

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap cancelRightForBuy_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.cancelRightForBuy_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.cancelRightForBuy_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxRights';
    svInputPrm.ServiceName = 'ALTxRights_0403_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'D';
    svInputPrm.AprStat = 'D';
    svInputPrm.AprSeq = aprSeq;
    svInputPrm.MakerDt = aprDt;
    svInputPrm.InVal = [wkDt, Seq + ''];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.cancelRightForBuyFunct_ReqTimeOut = setTimeout(
      this.solvingMrgFunct_TimeOut,
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

  resetRgtForBuyInfo = () => {
    this.rghtForBuy['stkCd'] = null;
    this.rghtForBuy['rgtNo'] = null;
    this.rghtForBuy['ownQty'] = 0;
    this.rghtForBuy['rgtQtyBf'] = 0;
    this.rghtForBuy['avaQty'] = 0;
    this.rghtForBuy['waitQty'] = 0;
    this.rghtForBuy['buyAbleQty'] = 0;
    this.rghtForBuy['mrkPrice'] = 0;
    this.rghtForBuy['statRgt'] = null;
    this.rghtForBuy['rgtQty'] = null;
    this.rghtForBuy['note'] = null;
    this.rghtForBuy['values'] = 0;
    this.setState({ rghtForBuy: this.rghtForBuy })
  };

  // -- get cash information
  getCashAvaiableInfo = () => {
    if (this.getCashAvaibleFlag) { return; }
    this.getCashAvaibleFlag = true;

    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap getCashAvaible_ResultProc
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getCashAvaible_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getCashAvaible_ResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqCash';
    svInputPrm.ServiceName = 'ALTqCash_0201_3';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getCashAvaibleFunct_ReqTimeOut = setTimeout(
      this.solvingMrgFunct_TimeOut,
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
  }

  changAcntNo = (e) => {
    const value = e.target.value;
    this.rghtForBuy.acntNo = value;
    update_value_for_glb_sv({ component: this.component, key: 'activeAcnt', value: value })
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    this.setState(prevState => ({
      rghtForBuy: {
        ...prevState.rghtForBuy,
        acntNo: this.rghtForBuy.acntNo,
      }
    }))
    this.resetRgtForBuyInfo();
    this.getrghtForBuyList();
  }

  handleChangeQty = (e) => {
    const value = filterNumber(e.target.value);
    // if (value > 999) { this.rghtForBuy.rgtQty = FormatNumber(value); }
    // else this.rghtForBuy.rgtQty = value;
    this.rghtForBuy.rgtQty = FormatNumber(value);
    const numb = filterNumber(this.rghtForBuy.rgtQty);
    const mrkPrice = filterNumber(this.rghtForBuy['mrkPrice']);
    if (isNaN(numb) === false) {
      this.rghtForBuy['values'] = mrkPrice * numb;
    } else {
      this.rghtForBuy['values'] = 0;
    }
    this.setState(prevState => ({
      rghtForBuy: {
        ...prevState.rghtForBuy,
        rgtQty: this.rghtForBuy.rgtQty,
        values: this.rghtForBuy.values
      }
    }))
  }

  handleChangeNote = (e) => {
    const value = e.target.value;
    this.rghtForBuy['note'] = (value ? value.trim() : ' ');
    this.setState(prevState => ({
      rghtForBuy: {
        ...prevState.rghtForBuy,
        note: value
      }
    }))
  }

  modalAfterOpenedData = () => {
    const elm = document.getElementById('bt_sendMsgmrgCfmOk');
    if (elm) elm.focus();
  }
  modalAfterOpenedCancel = () => {
    const elmm = document.getElementById('bt_msgBoxCanclRgtCfmOk');
    if (elmm) elmm.focus();
  }

  transDate = (value) => {
    if (value.length < 5) return value;
    else return value.substr(0, 2) + '/' + value.substr(2, 2) + '/' + value.substr(4, 4)
  }
  timeFull = (value) => {
    if (value.length < 14) return value;
    else return value.substr(0, 2) + '/' + value.substr(2, 2) + '/' + value.substr(4, 4) + ' ' + value.substr(8, 2) + ':' + value.substr(10, 2) + ':' + value.substr(12, 2)
  }

  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }
  transData(item, index) {
    item.c00 = index + 1;
    if (this.dataFlag) {
      return {
        c00: item.c00, c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
        c9: item.c9, c10: item.c10, c11: item.c11, c12: item.c12, c13: item.c13
      }
    }

    item.c2 = this.transDate(item.c2);
    item.c7 = FormatNumber(item.c7);
    item.c8 = FormatNumber(item.c8);
    item.c9 = FormatNumber(item.c9);
    item.c10 = FormatNumber(item.c10);
    item.c11 = FormatNumber(item.c11);
    item.c12 = FormatNumber(item.c12);
    item.c13 = FormatNumber(item.c13);

    return {
      c00: item.c00, c0: item.c0, c1: item.c1, c2: item.c2, c3: item.c3, c4: item.c4, c5: item.c5, c6: item.c6, c7: item.c7, c8: item.c8,
      c9: item.c9, c10: item.c10, c11: item.c11, c12: item.c12, c13: item.c13
    }
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'rghtForBuy_rgtQty') {
      if (code === 13) {
        this.openModalConfirmRightForBuy();
      }
    } else if (name === 'note' && code === 13) this.openModalConfirmRightForBuy();
  }

  handleShowDataList = () => {
    this.setState({ list_data: 'btn-bg-link', list_cancel: '' });
  }

  handleShowCancelList = () => {
    this.setState({ list_data: '', list_cancel: 'btn-bg-link' });
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab + ''
      });
    }
    this.getNewInformation(tab);
    this.setState({ getList: tab });
  }

  handleChangeAccount = ({ value, label }) => {
    const acntStr = value;
    this.rghtForBuy['acntNo'] = acntStr;
    this.rghtForBuy['avaiCash'] = 0;
    const pieacnt = acntStr.split('.');
    this.actn_curr = pieacnt[0];
    this.sub_curr = pieacnt[1];
    if (!glb_sv.flagProcessPopout) {
      this.getrghtForBuyList();
      this.gethistRgtForBuyList();
      this.setState(prevState => ({
        rghtForBuy: {
          ...prevState.rghtForBuy,
          acntNo: this.rghtForBuy.acntNo,
        }
      }))
    };


  }

  render() {
    const arrayTitle = this.columnsData.map(item => this.transTitle(item));
    const arrayTitleCancel = this.columnsCancel.map(item => this.transTitle(item));
    const data = this.state.data.map((item, index) => this.transData(item, index));
    this.dataFlag = true;
    const { t } = this.props
    const values = FormatNumber(this.state.rghtForBuy.values);
    return (
      <div className='right-forbuy'>

        <div className="card form-cash-transaction" style={{ marginTop: 10 }}>
          <div className="card-body">
            <div className='page1'>
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
                  isShowSubno={false}
                />
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('symbol')}</label>
                <div className='col-sm-7 no-padding-left input-group input-group-sm'>
                  <span name="stkName" className="form-control form-control-sm text-right">
                    {this.state.rghtForBuy.stkCd}
                  </span>
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('right_number')}</label>
                <div className='col-sm-7 no-padding-left input-group input-group-sm'>
                  <span name="rightNo" className="form-control form-control-sm text-right">
                    {this.state.rghtForBuy.rgtNo}
                  </span>
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('able_registered_quantity')}</label>
                <div className='col-sm-7 no-padding-left input-group input-group-sm'>
                  <span name='able_registered_quantity' className="form-control form-control-sm text-right">
                    {this.state.rghtForBuy.avaQty}
                  </span>
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('rgtbuy_input_quantity')}
                  <span className="mustInput">*</span>
                </label>
                <div className="col-sm-7 no-padding-left input-group input-group-sm">
                  <Input
                    inputtype={"text"}
                    name={"rghtForBuy_rgtQty"}
                    value={this.state.rghtForBuy.rgtQty}
                    onChange={this.handleChangeQty}
                    onKeyDown={this.handleKeyPress}
                    classextend={'form-control-sm text-right'}
                  />
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('right_price')}</label>
                <div className="col-sm-7 no-padding-left input-group input-group-sm">
                  <span className="form-control form-control-sm text-right">
                    {FormatNumber(this.state.rghtForBuy.mrkPrice)}
                  </span>
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('right_buy_values')}</label>
                <div className="col-sm-7 no-padding-left input-group input-group-sm">
                  <span className="form-control form-control-sm text-right">
                    {values}
                  </span>
                </div>
              </div>
              <div className="form-group row ">
                <label className="col-sm-5 control-label no-padding-right text-left">{t('common_note')}</label>
                <div className="col-sm-7 no-padding-left input-group input-group-sm">
                  <input
                    value={this.state.rghtForBuy.note}
                    onChange={this.handleChangeNote}
                    onKeyDown={this.handleKeyPress}
                    type='text'
                    name="note"
                    className="form-control form-control-sm text-left">
                  </input>
                </div>
              </div>

              <div className="form-group row" style={{ marginTop: 25 }}>
                <div className='col-sm fullWidthButton'>
                  <button id='buttonRgtBuy' className="btn btn-pill pull-right btn-wizard" onClick={this.openModalConfirmRightForBuy}>
                    {t('common_send_info')} &nbsp;<i className="fa fa-check" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
        <div className='page2' >
          <Nav tabs role="tablist">
            <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '1' })}
                onClick={() => { this.toggle(1) }}>{t('right_for_buy_list')}
              </NavLink>
            </NavItem>
            <NavItem >
              <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                onClick={() => { this.toggle(2) }}>{t('right_forbuy_history_list')}
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent id='divBottom' style={{ padding: '3px 5px 0 5px' }} className="panel-body" activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <ReactTable
                data={data}
                columns={arrayTitle}
                pageSize={this.state.data.length < 10 ? 10 : this.state.data.length}
                showPagination={false}
                style={{
                  height: 285,
                  marginTop: 5
                }}

                NoDataComponent={() => {
                  return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
                }}
                className="-striped -highlight"
              />
            </TabPane>
            <TabPane tabId="2">
              <ReactTable
                data={this.state.histRgtFBuyListDataTable}
                columns={arrayTitleCancel}
                pageSize={this.state.histRgtFBuyListDataTable.length < 10 ? 10 : this.state.histRgtFBuyListDataTable.length}
                showPagination={false}
                style={{
                  height: 285,
                  marginTop: 5
                }}

                NoDataComponent={() => {
                  return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
                }}
                className="-striped -highlight"
              />
            </TabPane >
          </TabContent>

        </div>



        {/* modal Xác thực gửi yêu cầu */}
        <Modal
          isOpen={this.state.cfm_rghtforbuy_request}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpenedData}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('right_forbuy_confirm_message')}:
                <br /> {t('right_number')}: {this.state.rghtForBuy['rgtNo']}
            <br /> {t('short_symbol')}: {this.state.rghtForBuy['stkCd']}
            <br /> {t('rgtbuy_input_quantity')}: {this.state.rghtForBuy['rgtQty']}?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_sendMsgmrgCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfrmSendRightForBuy('Y')}>
                    {this.state.cfmSendRightForBuyFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfrmSendRightForBuy('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* Modal hủy đăng ký mua PHT */}
        <Modal
          isOpen={this.state.cfm_regitRgt_cancl_confirm}
          size={"sm modal-notify"}
          onClosed={this.modalModalClose}
          onOpened={this.modalAfterOpenedCancel}>
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('cancel_right_forbuy')}:
                <br /> {t('right_number')}: {this.state.canclRgtForBuy['rgtNo']}
            <br /> {t('short_symbol')}: {this.state.canclRgtForBuy['stkCd']}
            <br /> {t('rgtbuy_input_quantity')}: {this.state.canclRgtForBuy['rgtQty']}?
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id="bt_msgBoxCanclRgtCfmOk"
                    autoFocus
                    color="wizard"
                    onClick={(e) => this.cfmcancelRgtForBuy('Y')}>
                    {this.state.cancelRightForBuyFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cfmcancelRgtForBuy('N')}>
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

export default translate('translations')(RightForBuy);