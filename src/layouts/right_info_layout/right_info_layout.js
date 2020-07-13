import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import socket_sv from '../../utils/globalSv/service/socket_service'
import glb_sv from '../../utils/globalSv/service/global_service';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { CSVLink } from "react-csv";
import { Tooltip } from 'reactstrap';
import uniqueId from "lodash/uniqueId";
import { ReactComponent as IconExcel } from "../../conponents/translate/icon/excel.svg";
import component from '../../constants/components'
import commuChanel from '../../constants/commChanel'
import functionList from '../../constants/functionList'
import { bf_popout } from '../../utils/bf_popout'
import { reply_send_req } from '../../utils/send_req'
import Table from '../../conponents/table/table'
import SearchRightInfo from '../../conponents/search_right_info/search_right_info'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { load_stk_list } from '../../utils/load_stk_list'

const remote = require('electron').remote;


class RightInfo extends React.PureComponent {
  constructor(props) {
    super(props)
    if (this.props.node) {
      this.props.node.setEventListener("close", (p) => {
        window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
        window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}`)
      })

    }
    this.state = {
      name: this.props.name,
      display_popin: 'none',
      parent_id: '',
      config: '',
      right_stkCode: '',      // obj rgtinfo
      right_rightTp: '',      // obj rgtinfo
      rightTps: [],
      selectedStkName: [],
      getrightlistFlag: false,
      data: [],
      columns: this.columnsH,
      stkList: [],
      dataCSV: [],
      tooltipOpen_csv: false,
      isChangeTheme: true,


      themePage: this.props.themePage,
      language: this.props.language,
    }
    this.component = this.props.component
    this.req_component = new Map();
    this.popin_window = this.popin_window.bind(this);

    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.request_seq_comp = 0;
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.right = {};
    // -- get order list on day
    this.rightListTemple = [];
    this.getrightList_FunctNm = functionList.RIGHTSCR_001;
    // -- get righttype list
    this.rightTps = [];
    this.rightTmp = [];
    this.getrighttypeListFlag = false;
    this.getrighttypeList_FunctNm = functionList.RIGHTSCR_002;
    this.dataFlag = false;

    this.flagSortData = {};
  }
  getrighttypeListFunct_ReqTimeOut
  getrightListFunct_ReqTimeOut

  headersCSV = [
    { label: this.props.t('right_code'), key: "c0" },
    { label: this.props.t('symbol'), key: "c1" },
    { label: this.props.t('last_regist_date'), key: "c2" },
    { label: this.props.t('right_type'), key: "c3" },
    { label: this.props.t('symbol_after_change'), key: "c4" },
    { label: this.props.t('price_for_sell'), key: "c5" },
    { label: this.props.t('divide_ratio'), key: "c6" },
    { label: this.props.t('action_ratio'), key: "c8" },
    { label: this.props.t('liquidation_money_ratio'), key: "c10" },
    { label: this.props.t('tax_ratio_of_symbol'), key: "c12" },
    { label: this.props.t('tax_ratio_of_money'), key: "c13" },
    { label: this.props.t('date_start_register'), key: "c15" },
    { label: this.props.t('date_close_register'), key: "c16" },
    { label: this.props.t('date_start_transfer'), key: "c17" },
    { label: this.props.t('date_close_transfer'), key: "c18" },
    { label: this.props.t('price_of_odd_lot'), key: "c19" },
    { label: this.props.t('date_account_increase_symbol'), key: "c21" },
    { label: this.props.t('date_account_decrease_symbol'), key: "c22" },
    { label: this.props.t('date_trading'), key: "c23" },
    { label: this.props.t('date_settlement_money'), key: "c24" },
    { label: this.props.t('date_settlement_transfer'), key: "c25" },
    { label: this.props.t('date_trading_not_right'), key: "c29" },
    { label: this.props.t('statut_solved_right'), key: "c30" },
    { label: this.props.t('date_right_expire'), key: "c32" },
    { label: this.props.t('common_note'), key: "c31" }
  ];
  transDataCSV(arr) {
    const data = arr.map(item => {
      item.c2 = this.transDate(item.c2);
      item.c15 = this.transDate(item.c15);
      item.c16 = this.transDate(item.c16);
      item.c17 = this.transDate(item.c17);
      item.c18 = this.transDate(item.c18);
      item.c21 = this.transDate(item.c21);
      item.c22 = this.transDate(item.c22);
      item.c23 = this.transDate(item.c23);
      item.c24 = this.transDate(item.c24);
      item.c25 = this.transDate(item.c25);
      item.c29 = this.transDate(item.c29);
      item.c32 = this.transDate(item.c32);
      item.c3 = item.c3 + '. ' + item.c33;
      item.c6 = item.c6 + ':' + item.c7;
      item.c8 = item.c8 + ':' + item.c9;
      item.c30 = item.c30 + '. ' + item.c34;

      return item;
    });
    this.setState({ dataCSV: data });
  }

  popin_window() {
    const current_window = remote.getCurrentWindow();
    window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
    current_window.close();
  }

  componentWillMount() {

    console.log('vào componentWillMount');
    window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
      this.setState(agrs.state)
      this.setState({
        parent_id: agrs.parent_id,
        config: agrs.config,
      })

      this.getrighttypeListFlag = false;
      this.getrighttypeList()

      change_theme(this.state.themePage)
      change_language(this.state.language, this.props)
    })

    window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
      this.setState(agrs.state)
      // this.getrighttypeList()
      console.log(agrs.state)
    })

  }

  componentDidMount() {
    console.log('vào componentDidMount');
    window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
      change_theme(agrs)
      // glb_sv.themePage = agrs
      this.setState({ themePage: agrs })
    })

    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
      change_language(agrs, this.props)
      // glb_sv.language = agrs
      this.setState({ language: agrs })
      this.getrighttypeList()
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
      console.log('this.req_component', JSON.stringify(this.req_component));
      reply_send_req(agrs, this.req_component)
    })

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      if (!agrs.length) {
        load_stk_list(this.req_component, this.get_rq_seq_comp(), this.component)
      }
      this.loadData(agrs)

      setTimeout(() => {
        if (this.selectFocus) {
          this.selectFocus.focus();
        }
      }, 200)
    })


  }

  componentWillUnmount() {
    console.log('vào componentWillUnmount');
    this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    // if (this.subcr_ClientReqRcv) { this.subcr_ClientReqRcv.unsubscribe(); }
    if (this.getrightListFunct_ReqTimeOut) { clearTimeout(this.getrightListFunct_ReqTimeOut); }
    if (this.getrighttypeListFunct_ReqTimeOut) { clearTimeout(this.getrighttypeListFunct_ReqTimeOut); }
    // const elemm = document.querySelector('.wizard-modal');
    // elemm.classList.remove('width_table');
    // if (this.subcr_keypress) this.subcr_keypress.unsubscribe();
  }

  loadData(mrk_StkList) {
    this.stkList = mrk_StkList;
    this.right['stkCode'] = this.state.right_stkCode;
    this.right['rightTp'] = '%';
    this.setState({ stkList: this.stkList, right_stkCode: this.right['stkCode'], right_rightTp: '%' })
    this.getrighttypeList();

  }

  solvingright_TimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    if (reqIfMap.reqFunct === this.getrightList_FunctNm) {
      this.setState({ getrightlistFlag: false })
    } else if (reqIfMap.reqFunct === this.getrighttypeList_FunctNm) {
      this.getrighttypeListFlag = false;
    }
    glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', this.component)
  }

  getrightList = (rightTp) => {
    if (this.state.getrightlistFlag) { return; }
    if (this.right['stkCode'] === null || this.right['stkCode'] === undefined || this.right['stkCode'] === '') {
      this.right['stkCode'] = this.state.right_stkCode
    }

    if (this.right['stkCode'] === null || this.right['stkCode'] === undefined || this.right['stkCode'] === '') { return; }
    if (rightTp === null || rightTp === '') { rightTp = '%'; }
    this.setState({ getrightlistFlag: true })
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()
    reqInfo.reqFunct = this.getrightList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getRightListResultProc;

    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqRights01';
    svInputPrm.ServiceName = 'ALTqRights01_OnlineRightsInfo_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = [this.right['stkCode'], rightTp];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    delete svInputPrm['AprSeq'];
    delete svInputPrm['LoginAgnc'];
    delete svInputPrm['LoginBrch'];
    delete svInputPrm['MakerDt'];
    this.getrightListFunct_ReqTimeOut = setTimeout(this.solvingright_TimeOut,
      functionList.reqTimeout, request_seq_comp);
    reqInfo.inputParam = svInputPrm.InVal;

    this.req_component.set(request_seq_comp, reqInfo)
    this.rightListTemple = [];
    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: svInputPrm
    })
  }

  getRightListResultProc = (reqInfoMap, message) => {

    clearTimeout(this.getrightListFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.setState({ getrightlistFlag: false })
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

      this.rightListTemple = this.rightListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.setState({ getrightlistFlag: false })
        let rightList = JSON.parse(JSON.stringify(this.rightListTemple));


        if (this.rightListTemple !== [] && this.rightListTemple.length > 0) {
          rightList.map((item, index) => {
            item.c00 = index + 1;
            item.c2 = this.transDate(item.c2);
            item.c3 = item.c3 + '. ' + item.c33;
            item.c5 = FormatNumber(item.c5);
            item.c6 = FormatNumber(item.c6) + ' : ' + FormatNumber(item.c7);
            delete item['c7'];
            item.c8 = FormatNumber(item.c8) + ' : ' + FormatNumber(item.c9);
            delete item['c9'];
            delete item['c11'];
            delete item['c14'];
            delete item['c20'];
            delete item['c26']; delete item['c27']; delete item['c28'];
            item.c10 = FormatNumber(item.c10);
            item.c12 = FormatNumber(item.c12);
            item.c13 = FormatNumber(item.c13);
            item.c15 = this.transDate(item.c15);
            item.c16 = this.transDate(item.c16);
            item.c17 = this.transDate(item.c17);
            item.c18 = this.transDate(item.c18);
            item.c19 = FormatNumber(item.c19);
            item.c21 = this.transDate(item.c21);
            item.c22 = this.transDate(item.c22);
            item.c23 = this.transDate(item.c23);
            item.c24 = this.transDate(item.c24);
            item.c25 = this.transDate(item.c25);
            item.c29 = this.transDate(item.c29);
            item.c30 = item.c30 + '. ' + item.c34;
            delete item['c33'];
            delete item['c34'];
            delete item['c00'];
            const tpm = item.c31
            item.c31 = this.transDate(item.c32);
            item.c32 = tpm
          });
          this.transDataCSV(JSON.parse(JSON.stringify(this.rightListTemple)));
        }

        this.setState({ data: rightList });

      }
    }

  }

  getrighttypeList = () => {
    if (this.getrighttypeListFlag) { return; }
    this.getrighttypeListFlag = true;

    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    const request_seq_comp = this.get_rq_seq_comp()
    reqInfo.reqFunct = this.getrighttypeList_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getRightTypeListResultProc
    // -- service info
    let svInputPrm = new serviceInputPrm();
    // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
    svInputPrm.WorkerName = 'ALTqRights';
    svInputPrm.ServiceName = 'ALTqRights_Common';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['02', 'rgt_tp', '%'];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    this.getrighttypeListFunct_ReqTimeOut = setTimeout(this.solvingright_TimeOut,
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

  getRightTypeListResultProc = (reqInfoMap, message) => {
    let timeResult;
    // timeSend = reqInfoMap.reqTime;
    timeResult = new Date();
    const errmsg = message['Message'];
    const cltSeqResult = Number(message['ClientSeq']);
    reqInfoMap.resTime = timeResult;
    if (reqInfoMap.reqFunct === this.getrighttypeList_FunctNm) {
      clearTimeout(this.getrighttypeListFunct_ReqTimeOut);
      if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
      // -- process after get result --
      if (Number(message['Result']) === 0) {
        reqInfoMap.procStat = 2;
        this.getrighttypeListFlag = false;
        reqInfoMap.resSucc = false;
        if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code'], this.component); }
        return;
      } else {
        reqInfoMap.procStat = 1;
        let jsondata;
        try {
          jsondata = JSON.parse(message['Data']);
        } catch (err) {
          jsondata = [];
        }
        this.rightTmp = this.rightTmp.concat(jsondata);
        if (Number(message['Packet']) <= 0) {
          reqInfoMap.procStat = 2;
          this.getrighttypeListFlag = false;
          this.setState({ rightTps: this.rightTmp })
        }
      }
    }
    this.rightTmp = []

  }


  changrightTp = (e) => {
    const value = e.target.value;
    this.right.rightTp = value;
    this.setState({ right_rightTp: value })
    this.getrightList(value);
  }

  selectedStk = (selected) => {
    console.log(selected)
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'recentStkList', sq: sq })
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
      const stks = selected.value;
      const isStk = agrs.findIndex(item => item === stks);
      if (isStk < 0) agrs.push(stks);
      if (agrs.length > 10) agrs.shift();
      localStorage.setItem('recentStkList', JSON.stringify(agrs));

      this.setState({ selectedStkName: selected })
      if (selected) {
        const value = selected.label;
        this.stkName = value;
        const pieces = value.split('-');
        if (pieces[1].trim() === 'UPC') { pieces[1] = 'HNX'; }
        if (pieces[1].trim() === 'HOSE') { pieces[1] = 'HSX'; }
        // const stkId = pieces[1].trim() + '_' + pieces[0].trim();
        this.right['stkCode'] = pieces[0].trim();
        this.setState({ right_stkCode: this.right['stkCode'] });
        this.getrightList(this.right['rightTp']);
      }
    })

  }

  goToRgtBuy(stkCd) {
    this.props.history.push("/main-app/right-forbuy?stk=" + stkCd);
  }

  transDate = (value) => {
    if (value.length < 5) return value;
    else return value.substr(0, 2) + '/' + value.substr(2, 2) + '/' + value.substr(4, 4);
  }

  toggle = () => {
    this.setState({
      tooltipOpen_csv: !this.state.tooltipOpen_csv
    });
  }

  render() {
    const { t } = this.props;
    return (
          <div className="right-info card">
            <div className="card-body widget-body" style={{ height: 'inherit', marginTop: 10 }}>
              <div className="form-group row no-margin-left no-margin-right">

                <div className="search-box-container" style={{ width: 200, marginRight: 10 }}>
                  <SearchRightInfo
                    name='advOrder_stkName'
                    className='col-sm-4 no-padding-left'
                    selectedStkName={this.state.selectedStkName}
                    stkList={this.state.stkList}
                    selectedStk={this.selectedStk}
                    node={this.props.node ? this.props.node : null}
                    themePage={this.state.themePage}
                    req_component={this.req_component}
                    get_rq_seq_comp={this.get_rq_seq_comp}
                    get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                    component={this.component} />
                </div>

                <select id='right_stkAutocomplete' className='col-sm-3 form-control' value={this.state.right_rightTp} placeholder={'-- ' + t('choose_symbol_trading')} onChange={this.changrightTp}>
                  {this.state.rightTps.map(item =>
                    <option key={uniqueId(item.c0)} value={item.c0}>
                      {t(item.c1)}
                    </option>)}
                  <option value="%">-- {t('common_all_right')}</option>
                </select>
                <div className='col-sm-1'>
                  <CSVLink filename={t('rgtInfo_title') + '.csv'} data={this.state.dataCSV} headers={this.headersCSV} target="_blank" id='Tooltip_csv_rgtinfo'><IconExcel style={{ width: 28, height: 28 }} /></CSVLink>
                  <Tooltip placement="top" isOpen={this.state.tooltipOpen_csv} target="Tooltip_csv_rgtinfo" toggle={this.toggle}>
                    {t('common_ExportExcel')}
                  </Tooltip>
                </div>
              </div>

              <div className="form-group row  no-margin-left no-margin-right">
                <Table data={this.state.data}></Table>
              </div>
            </div>
          </div>
    )
  }
}

export default translate('translations')(RightInfo);
