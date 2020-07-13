import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import _ from "lodash";
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import SearchAccount from '../../conponents/search_account/SearchAccount';


const remote = require('electron').remote;

class AssetMargin extends PureComponent {
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
        //window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)
      })
    }

    this.state = {
      assGuarInf: {},
      accountInfo_acntNo: '',
      isShow: true,
      acntItems: [],
      data: [],
      columns: this.columnsH,
      total_own: {},
      cmrcolorGuar: '',
      cmrcolorPush: '',
      iconDOWN: 'none',
      iconUP: '',
      arrayTitle: [],
      activeTab: '1',
      name: this.props.name,
      language: this.props.language,
      themePage: this.props.themePage,
      style: this.props.style,
    }

  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    // const state = {parent_id: this.state.parent_id, config: this.state.config, name: this.state.name, component: this.state.component}
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  acntItems = [];
  // -- get asset total info
  firstTm = true;
  cmrcolorGuar;
  cmrcolorPush;
  accountInfo = {};
  assGuarInf = {};
  getAssetGuarInfoFlag = false;
  getAssetGuarInfo_FunctNm = 'ASSETMNGERSCR_001';
  // -- get stock list
  stkListTemple = [];
  getStockListFlag = false;
  getStockList_FunctNm = 'ASSETMNGERSCR_002';
  getStockListFunct_ReqTimeOut;
  tableShow = false;

  // lưu flag mỗi khi sort
  flagSortData = {};

  columnsH = [
    { Header: "short_symbol", accessor: "c2", show: true, width: 80, headerClassName: 'text-center', className: 'text-center' },
    { Header: "volume_evaluation", accessor: "c3", show: true, width: 85, headerClassName: 'text-center', className: 'text-right' },
    { Header: "volume_right", accessor: "c4", show: true, width: 80, headerClassName: 'text-center', className: 'text-right' },
    { Header: "price_evaluation", accessor: "c5", show: true, width: 95, headerClassName: 'text-center', className: 'text-right' },
    { Header: "guarantee_asset_ratio", accessor: "c7", show: true, width: 125, headerClassName: 'text-center', className: 'text-right' },
    { Header: "guarantee_asset", accessor: "c11", show: true, width: 125, headerClassName: 'text-center', className: 'text-right' },
    { Header: "push_asset_ratio", accessor: "c14", show: true, width: 105, headerClassName: 'text-center', className: 'text-right' },
    { Header: "guarantee_asset_of_right", accessor: "c13", show: true, width: 155, headerClassName: 'text-center', className: 'text-right' },
    { Header: "push_asset_of_right", accessor: "c17", show: true, width: 165, headerClassName: 'text-center', className: 'text-right' },
    { Header: "guarantee_asset_of_right_cash", accessor: "c19", show: true, width: 170, headerClassName: 'text-center', className: 'text-right' },
    { Header: "push_asset_of_right_cash", accessor: "c21", show: true, width: 170, headerClassName: 'text-center', className: 'text-right' }
  ]

  componentWillMount() {
    const arrayTitle = this.state.columns.map(item => this.transTitle(item));
    this.setState({ arrayTitle: arrayTitle });

    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      // update state after popout window
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })
      change_theme(agrs.state.themePage)
      change_language(agrs.state.language, this.props)
      this.accountInfo_acntNo = agrs.state.accountInfo_acntNo;;
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeAcnt', sq: sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, activeAcnt) => {
        if (activeAcnt !== this.accountInfo_acntNo['acntNo']) {
          this.loadData(activeAcnt);
        }
      })
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      // update state after popin window
      this.setState(agrs.state)
    })



  }

  componentDidMount() {
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeAcnt', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, activeAcnt) => {
      if (this.props.node) this.loadData(activeAcnt)
    })
    // this.subscribeSocket();
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
      if (this.state.isShow) this.modalClose();
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_ACT}_${this.component}`, (event, msg) => {
      const sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeAcnt', sq: sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
        if (agrs !== this.accountInfo_acntNo['acntNo']) this.loadData(agrs);

      })
    })

  }

  componentWillUnmount() {
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    this.request_seq_comp = 0
    if (this.getAssetGuarInfoFunct_ReqTimeOut) { clearTimeout(this.getAssetGuarInfoFunct_ReqTimeOut); }
    if (this.getStockListFunct_ReqTimeOut) { clearTimeout(this.getStockListFunct_ReqTimeOut); }
    if (this.timeout) { clearTimeout(this.timeout); }
  }

  loadData = (activeAcnt) => {

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const objShareGlb = agrs.get('objShareGlb')

      // update session for popout windows
      glb_sv.objShareGlb = objShareGlb

      let i, acntInf = {}, subInf;
      for (i = 0; i < objShareGlb['acntNoList'].length; i++) {
        acntInf = objShareGlb['acntNoList'][i];
        subInf = acntInf['id'].substr(acntInf['id'].length - 2, 2);
        this.acntItems.push(acntInf);
      };
      if (this.acntItems.length > 0) {
        this.accountInfo_acntNo = activeAcnt || this.acntItems[0]['id'];
        this.setState({ accountInfo_acntNo: this.accountInfo_acntNo });
        const pieces = this.accountInfo_acntNo.split('.');
        this.actn_curr = pieces[0];
        this.sub_curr = pieces[1];
        this.getAssetGuarInfo();
        this.getStockInfoList();
      } else {
        this.accountInfo_acntNo = null;
        this.setState({ accountInfo_acntNo: '' });

        this.actn_curr = null;
        this.sub_curr = null;
      }
    })
  }
  // --- get asset guarInfo 
  getAssetGuarInfo = () => {
    if (this.getAssetGuarInfoFlag) { return; }
    this.getAssetGuarInfoFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()

    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getAssetGuarInfo_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getAssetGuarInfo_handleResult

    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    // svInputPrm.ClientSeq = request_seq_comp;
    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_Online_1450_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [this.actn_curr, this.sub_curr];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
    this.getAssetGuarInfoFunct_ReqTimeOut = setTimeout(this.solvingassetManage_TimeOut,
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

    // glb_sv.setReqInfoMapValue(request_seq_comp, reqInfo);
    this.assGuarInf = {};
    this.setState({ assGuarInf: [] });
  }
  // --- get asset guarInfo handle result
  getAssetGuarInfo_handleResult = (reqInfoMap, message) => {
    const cltSeqResult = Number(message['ClientSeq']);
    if (cltSeqResult === null || cltSeqResult === undefined || isNaN(cltSeqResult)) { return; }

    const errmsg = message['Message']
    clearTimeout(this.getAssetGuarInfoFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    this.getAssetGuarInfoFlag = false;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code']); }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
        this.assGuarInf = jsondata[0];
        let colorr;
        if (Number(this.assGuarInf['c2']) >= Number(this.assGuarInf['c4'])) {
          colorr = 'blue';
        } else if ((Number(this.assGuarInf['c5']) < Number(this.assGuarInf['c2'])) && (Number(this.assGuarInf['c2']) < Number(this.assGuarInf['c4']))) {
          colorr = '#f39013';
        } else if ((Number(this.assGuarInf['c6']) < Number(this.assGuarInf['c2'])) && (Number(this.assGuarInf['c2']) <= Number(this.assGuarInf['c5']))) {
          colorr = 'orange';
        } else if (Number(this.assGuarInf['c2']) <= Number(this.assGuarInf['c6'])) {
          colorr = 'red';
        }
        this.cmrcolorGuar = colorr;
        if (Number(this.assGuarInf['c3']) >= Number(this.assGuarInf['c4'])) {
          colorr = 'blue';
        } else if ((Number(this.assGuarInf['c5']) < Number(this.assGuarInf['c3'])) && (Number(this.assGuarInf['c3']) < Number(this.assGuarInf['c4']))) {
          colorr = '#f39013';
        } else if ((Number(this.assGuarInf['c6']) < Number(this.assGuarInf['c3'])) && (Number(this.assGuarInf['c3']) <= Number(this.assGuarInf['c5']))) {
          colorr = 'orange';
        } else if (Number(this.assGuarInf['c3']) <= Number(this.assGuarInf['c6'])) {
          colorr = 'red';
        }

        this.cmrcolorPush = colorr;
        this.setState({ assGuarInf: this.assGuarInf, cmrcolorGuar: this.cmrcolorGuar, cmrcolorPush: this.cmrcolorPush })
      } catch (err) {
        jsondata = [];
      }
    }
  }

  // --- get stock list function
  getStockInfoList = () => {
    if (this.getStockListFlag) { return; }

    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }

    this.getStockListFlag = true;
    // -- call service for place order
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getStockList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getStockList_handleResult

    // -- service info
    let svInputPrm = new serviceInputPrm();

    svInputPrm.WorkerName = 'ALTqLendingMargin';
    svInputPrm.ServiceName = 'ALTqLendingMargin_Online_1480_12';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [this.actn_curr, this.sub_curr ? this.sub_curr : '%'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    this.getAssetGuarInfoFunct_ReqTimeOut = setTimeout(this.solvingassetManage_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;
    this.stkListTemple = [];
    this.setState({ data: [] });
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
  // --- get stock list function handle result
  getStockList_handleResult = (reqInfoMap, message) => {
    const cltSeqResult = Number(message['ClientSeq']);
    if (cltSeqResult === null || cltSeqResult === undefined || isNaN(cltSeqResult)) { return; }
    const errmsg = message['Message'];

    clearTimeout(this.getStockListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getStockListFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code']);
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
      this.stkListTemple = this.stkListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getStockListFlag = false;

        let data = JSON.parse(JSON.stringify(this.stkListTemple));
        data = data.map(item => {
          for (let i = 3; i < 22; i++) {
            item[i] = Number(item[i]);
          }
          return item;
        })

        this.setState({ data });
      }
    }
  }

  refeshClick = (e) => {
    this.getAssetGuarInfo()
  }

  solvingassetManage_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getAssetGuarInfo_FunctNm) {
      this.getAssetGuarInfoFlag = false;
    } else if (reqIfMap.reqFunct === this.getStockList_FunctNm) {
      this.getStockListFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning');
  }

  modalClose = () => {
    this.setState({ isShow: false })
    const obj = {
      type: commuChanel.ACTION_SUCCUSS,
      component: this.component
    }
    inform_broadcast(commuChanel.ACTION_SUCCUSS, obj)
  }

  transTime = (value) => {
    if (String(value).length > 8) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 4);
    return (day + '/' + month + '/' + year);
  }

  transTitle = (item) => {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }

  handleShow = () => {
    if (!this.tableShow) {
      this.tableShow = true;
      this.setState({ iconDOWN: '', iconUP: 'none' });
    } else {
      this.tableShow = false;
      this.setState({ iconDOWN: 'none', iconUP: '' });
    }
  }

  sortTable = (key) => {
    if (this.flagSortData[key]) {
      this.flagSortData[key] = false;
      const sorted = _.orderBy(this.state.data, [key], ['asc']);
      this.setState({ data: sorted });
    } else {
      this.flagSortData[key] = true;
      const sorted = _.orderBy(this.state.data, [key], ['desc']);
      this.setState({ data: sorted });
    }

  }

  handleChangeAccount = ({ value, label }) => {
    this.activeAcnt = value;
    const pieces = value.split('.');
    this.actn_curr = pieces[0];
    this.sub_curr = pieces[1].substr(0, 2);
    if (this.state.activeTab === '1') this.refeshClick();
    else this.getStockInfoList();

  }

  render() {
    const { t } = this.props
    const { assGuarInf } = this.state;

    return (
      <div className="AssetMargin__layout">
        <div className="width-assets">
          <div style={{ maxWidth: 400, marginBottom: 5 }}>
            <SearchAccount
              handleChangeAccount={this.handleChangeAccount}
              component={this.component}
              req_component={this.req_component}
              get_rq_seq_comp={this.get_rq_seq_comp}
              get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
              language={this.props.language}
              themePage={this.props.themePage}
              style={this.props.style}
              isShowSubno={true}
            />
          </div>


          <div className="card asset asset-margin" >
            <div className="card-body" style={{ padding: 0, overflow: 'auto' }}>
              <Nav tabs role="tablist">
                <NavItem >
                  <NavLink className={classnames({ active: this.state.activeTab === '1' })}
                    onClick={
                      () => {
                        this.setState({
                          activeTab: '1'
                        })
                        this.refeshClick()
                      }
                    }>
                    {t('guarantee_asset_information')}
                  </NavLink>
                </NavItem>
                <NavItem className="nav-item">
                  <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                    onClick={() => {
                      this.setState({
                        activeTab: '2'
                      })
                      this.getStockInfoList()
                    }
                    }>
                    {t('push_asset_information')}
                  </NavLink>
                </NavItem>
              </Nav>
              <div className="tab-content top" style={{ height: 'auto', minWidth: 1000, overflowX: 'hidden' }}>
                <div className="tab-pane" style={{ display: this.state.activeTab === '1' ? 'block' : 'none' }} id="assetGuar" aria-expanded="false">
                  <div className="card card-outline-default" style={{ marginBottom: 5, marginTop: 5 }}>
                    <div className="card-body row">

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('cash_assets')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_cash_balance')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c12'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('amount_of_temporary_custody')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c14'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('amount_blockade')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c13'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('other_amount_blockade')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c15'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('cash_sale_available')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c16'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('cash_from_right_waitting')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c17'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right"><strong>{t('total_cash_assets')}</strong>
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c10'])}</span>

                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('stock_assets')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('availability_stock_assets_are_assessed')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c21'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('buying_waitting_stock_assets')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c22'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('buying_waitting_stock_of_right')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c24'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('buying_waitting_match_stock_assets')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c23'])}</span>

                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right"><strong>{t('total_stock_assets_are_assessed')}</strong>
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c19'])}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('sb_debit_info')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_marin_loan')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c32'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_marin_loan_fee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(Number(assGuarInf['c33']) + Number(assGuarInf['c34']) + Number(assGuarInf['c35']) + Number(assGuarInf['c36']))}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('pia_loan_current')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c47'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('pia_loan_fee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c48'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('unsecured_debt')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c42'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('unsecured_fee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(Number(assGuarInf['c43']) + Number(assGuarInf['c44']) + Number(assGuarInf['c45']) + Number(assGuarInf['c46']))}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('depository_fees')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c61'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right"><strong>{t('total_current_loand')}</strong>
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c31'])}</span>

                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('info_total_assets_total_debt')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('total_debt_asset_DB')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c29'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('force_sel_ratio')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c6'], 2, 0)} %</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right"><u><strong>{t('guarantee_asset_total')}</strong></u>
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c50'], 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right"><u><strong>{t('net_assets')}</strong></u>
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c52'], 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="tab-pane" style={{ display: this.state.activeTab === '2' ? 'block' : 'none' }} id="assetPush" aria-expanded="true">
                  <div className="card card-outline-default" style={{ marginBottom: 5, marginTop: 5 }}>
                    <div className="card-body row">

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('cash_assets')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_cash_balance')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c12'], 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('amount_widthdraw')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['60'], 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('Initial_guarantee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c57'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('Guarantee_used')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c58'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('amount_of_temporary_custody')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c14'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('amount_blockade')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c13'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('other_amount_blockade')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c15'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('cash_sale_available')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c16'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('cash_from_right_waitting')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c18'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right" style={{ fontWeight: 'bolder' }}>{t('total_cash_assets')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c11'])}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('stock_assets')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('availability_stock_assets_are_assessed')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c25'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('buying_waitting_stock_assets')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c26'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('buying_waitting_stock_of_right')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c28'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('buying_waitting_match_stock_assets')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c27'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right"><div style={{ fontWeight: 'bolder', display: 'inline-block' }}>{t('total_stock_assets_are_assessed')}</div>
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c20'])}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('sb_debit_info')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_marin_loan')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c32'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_marin_loan_fee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(Number(assGuarInf['c33']) + Number(assGuarInf['c34']) + Number(assGuarInf['c35']) + Number(assGuarInf['c36']), 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('pia_loan_current')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c47'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('pia_loan_fee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c48'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('unsecured_debt')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c42'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('unsecured_fee')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(Number(assGuarInf['c43']) + Number(assGuarInf['c44']) + Number(assGuarInf['c45']) + Number(assGuarInf['c46']))}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('depository_fees')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c61'])}</span>

                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right" style={{ fontWeight: 'bolder' }}>{t('total_current_loand')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c31'], 0, 0)}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="col-3">
                        <div className="form-group row col-12 form-title" style={{ marginLeft: 0 }}>{t('info_total_assets_total_debt')}
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('total_pushed_assets_(EB)')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right" style={{ color: '#008080' }}>{FormatNumber(Number(assGuarInf.c11) + Number(assGuarInf.c20), 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('total_debt_DB')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right" style={{ color: '#ff8000' }}>{FormatNumber(Number(assGuarInf['c29']), 0, 0)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('margin_EE')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right" style={{ color: '#ff0000' }}>{FormatNumber(assGuarInf['c53'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('min_buying_power')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right" style={{ color: '#00c0c0' }}>{FormatNumber(assGuarInf['c54'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('max_buying_power')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right" style={{ color: '#ff00ff' }}>{FormatNumber(assGuarInf['c55'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('max_margin')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c56'])}</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('current_maintenance_ratio')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c2'], 2, 0)} %</span>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-6 control-label no-padding-right">{t('force_sel_ratio')}
                          </label>
                          <div className="col-6">
                            <div className="input-group input-group-sm">
                              <span className="form-control form-control-sm text-right">{FormatNumber(assGuarInf['c6'], 2, 0)} %</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="card asset">
            <div className="card-header card-title" style={{ padding: '10px 0px 0px 10px' }}>
              <span>
                {t('stock_assets_are_assessed')}&nbsp;&nbsp; - {t('acnt_no')}: {this.state.accountInfo_acntNo}
              </span>
              <span className="transition cursor_ponter" onClick={this.handleShow} style={{ display: this.state.iconUP }}>
                <i className="fa fa-chevron-up"></i>
              </span>
              <span className="transition cursor_ponter" onClick={this.handleShow} style={{ display: this.state.iconDOWN }}>
                <i className="fa fa-chevron-down"></i>
              </span>
            </div>
            <div className="card-body" style={{ minHeight: 'auto' }}>
              <div className="table-responsive datatable" style={{ maxHeight: 'calc(18%)', overflow: 'auto', display: this.state.iconUP }}>

                <table className="table_sticky_margin tableNormal table table-sm tablenowrap table-bordered table-striped">
                  <thead className="header">
                    <tr>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c2')}>
                        {t('short_symbol')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c3')}>
                        {t('volume_evaluation')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c22')}>
                        {t('capital_ratio')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c5')}>
                        {t('price_evaluation')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c7')}>
                        {t('guarantee_asset_ratio')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c11')}>
                        {t('guarantee_asset')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c14')}>
                        {t('push_asset_ratio')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c15')}>
                        {t('asset_for_buy_power')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c4')}>
                        {t('volume_right')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c13')}>
                        {t('guarantee_asset_of_right')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c17')}>
                        {t('push_asset_of_right')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c19')}>
                        {t('guarantee_asset_of_right_cash')}
                      </th>
                      <th className="text-center cursor_ponter" onClick={() => this.sortTable('c21')}>
                        {t('push_asset_of_right_cash')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data.map(item => <tr key={_.uniqueId('margin')}>
                      <td className="text-center">
                        {item.c2}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c3)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c22)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c5)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c7)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c11)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c14)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c15)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c4)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c13)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c17)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c19)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item.c21)}
                      </td>
                    </tr>)}
                    {this.state.data && this.state.data.length === 0 && <tr>
                      <td colSpan="13" className="text-center">
                        {t('common_NoDataFound')}
                      </td>
                    </tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default translate('translations')(AssetMargin);