import React from 'react';

import glb_sv from '../../../utils/globalSv/service/global_service'
import commuChanel from '../../../constants/commChanel'
import socket_sv from '../../../utils/globalSv/service/socket_service'
import { requestInfo } from '../../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../../utils/globalSv/models/serviceInputPrm';
import { translate } from 'react-i18next'
import OptionTable from '../../../conponents/optionTable/OptionTable';
import columnInfoHis from './columnInfoHis.json';
import { CSVLink } from "react-csv";
import FormatNumber from '../../../conponents/formatNumber/FormatNumber'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip } from 'reactstrap';
import sum from "lodash/sum";
import map from "lodash/map";
// import { CheckPluginValid } from '../../../../bkv-sign/CheckPluginValid'; // eslint-disable-line
// import base64 from '../../../../bkv-sign/base64';
// import SignXML from '../../../../bkv-sign/XML';
import Popover from 'react-tiny-popover';
import TimeSelect from '../../../conponents/table-option/time-select';
import Status from '../../../conponents/table-option/status';
import TypeBuySell from '../../../conponents/table-option/type-buysell';
import { ReactComponent as Reload } from '../../../conponents/translate/icon/reload-glyph-24.svg';
import { ReactComponent as IconExcel } from '../../../conponents/translate/icon/excel.svg';
import { ReactComponent as IconBullet } from '../../../conponents/translate/icon/bullet-list-70-glyph-24.svg';
import { ReactComponent as IconZoom } from '../../../conponents/translate/icon/magnifier-zoom-in-glyph-24.svg';
import filter from 'lodash/filter';
import DatePicker from 'react-datepicker';
import TableData from '../../../conponents/table-option/table-data';
import functionList from '../../../constants/functionList'
import { toast } from 'react-toastify';
import { reply_send_req } from '../../../utils/send_req'

class OrderList extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      columns: this.columnsH,
      columnInfo: columnInfoHis,
      heightScroll: 145,
      from_date: new Date(),
      to_date: new Date(),
      extendAdvance: false,
      styleTop: 'hidden', styleBot: '15px',
      acntItems: [],
      histOrder: {
        acntNo: '',
        start_dt: null,
        end_dt: null
      },
      orderMod: {
        hieuL: null,
        hieuLG: null,
        price: null,
        qtyNotMth: null,
        stkCd: null,
        priceMod: null,
        qtyMod: null,
        orderTp: null,
        sellbuyTp: null,
      },
      cfm_order_mod: false,
      cfm_order_cal_confirm: false,
      cfm_order_mod_confirm: false,
      cfm_historderList_detail: false,
      gethistOrderlistDetailFlag: false,
      histOrdListDetailDataTable: [],
      ordListDataTableDetailMatch: [],
      cfm_orderHist_detailMatch: false,
      sumtable: {
        c3: 0,
        c5: 0
      },
      arrayExcel: [],
      tooltipOpen_csv: false,
      ButtonCancAll: '',
      cancMultiFlag: false,
      cfm_multi_order_cal_confirm: false,
      confirmArrCancelOrd: [],
      cfm_order_cal_result_multi: false,
      resultMsgArr: [],
      isPopoverOpenSelect: false,
      isPopoverOpenMenu: false,
      forceUpdate: 0,
      refreshFlag: '',
      headersCSV: [
        { label: this.props.t('common_index'), key: "c00" },
        { label: this.props.t('place_order_date'), key: "c19" },
        { label: this.props.t('time'), key: "c1" },
        { label: this.props.t('order_number'), key: "c13" },
        { label: this.props.t('origin_order_number'), key: "c0" },
        { label: this.props.t('short_symbol'), key: "c4" },
        { label: this.props.t('sell_buy_tp'), key: "c2" },
        { label: this.props.t('order_tp'), key: "c3" },
        { label: this.props.t('price_plc'), key: "c6" },
        { label: this.props.t('qty_wait_match'), key: "c7" },
        { label: this.props.t('sum_match_qty'), key: "c8" },
        { label: this.props.t('avg_match_price'), key: "c9" },
        { label: this.props.t('sum_match_value'), key: "c10" },
        { label: this.props.t('order_status'), key: "c14" }
      ],
      stkCdQuery: '',
      orderCanclFlag: false,
      sendcanlAdvOrderCfmFlag: false,
      filterWaitMatch: false,
      filterMatched: false,
      countWaitMatch: 0,
      countMatched: 0,
      nsi_start_dt: new Date(),
      nsi_end_dt: new Date(),
    };
    this.handleColumnChange = this.handleColumnChange.bind(this);
    this.handleAdvanceExtend = this.handleAdvanceExtend.bind(this);
    this.arrayExcel = [];
    this.timeQuery = '0D';
    this.status = 'all';
    this.typetp = 'all';
    this.stkCdQuery = '';

    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.get_rq_seq_comp = this.props.get_rq_seq_comp
    this.req_component = this.props.req_component
  }
  columnInfo = columnInfoHis;
  // -- modify order function
  orderModFlag = false;
  orderMod_FunctNm = 'ORDERSCR_008';
  orderModFunct_ReqTimeOut;
  // -- cancel order function
  orderCancl = {};
  orderCanclFlag = false;
  orderCancl_FunctNm = 'ORDERSCR_009';
  orderCanclFunct_ReqTimeOut;

  // -- get order list on day`
  gethistOrderlistFlag = false;
  histOrdListDataTable = [];
  histOrdListTemple = [];
  gethistOrderlist_FunctNm = 'HISTORDERSCR_001';
  gethistOrderlistFunct_ReqTimeOut;
  isShowDatepicker = true;
  nsi_start_dt = new Date();
  nsi_end_dt = new Date();
  // -- get order list on day
  histOrdListDetailDataTable = [];
  histOrdListDetailTemple = [];
  gethistOrderlistDetailFlag = false;
  gethistOrderlistDetail_FunctNm = 'HISTORDERSCR_002';
  gethistOrderlistDetailFunct_ReqTimeOut;
  // -- get matching order list detail follow original order number
  ordListDataTableDetailMatch = [];
  ordListTempleDetailMatch = [];
  getOrderlistDetailMatchFlag = false;
  getOrderlistDetailMatch_FunctNm = 'HISTORDERSCR_003';
  getOrderlistFunctDetailMatch_ReqTimeOut;

  extendAdvance = false
  sumtable = {};
  cancelMultiOrderList = [];
  resultMsgArr = [];
  columnsH = [
    {
      Header: props => <div className="custom-control custom-checkbox" style={{ marginLeft: 8 }}>
        <input type="checkbox" className="custom-control-input" id="checkCancAll" disabled={this.state.data.length === 0}
          onChange={this.onCheckchangeAll}
        />
        <label className="custom-control-label" htmlFor="checkCancAll">
          <span className="text-hide">choose</span>
        </label>
      </div>, show: true, sortable: false, headerClassName: 'text-center', className: 'text-center', width: 40,
      Cell: props => <div className="custom-control custom-checkbox" style={{ marginLeft: 8 }}>
        <input disabled={Number(props.original.c7) === 0 || props.original.c19 !== this.formatDt(this.workDate)} type="checkbox"
          className="custom-control-input" id={'his-ord-' + props.original.c13}
          // (change)="item.check = !item.check; onCheckchange(item, $event.target.checked)"
          onChange={() => this.onCheckchange(props.original)}
        />
        <label className="custom-control-label" htmlFor={'his-ord-' + props.original.c13}>
          <span className="text-hide">choose</span>
        </label>
      </div>
    },
    {
      Header: this.props.t("action"), sortable: false, show: true, headerClassName: 'text-center div_center', className: 'text-center nowrap', width: 155, Cell: props => <span className='action-pagin'>
        <button disabled={Number(props.original.c7) === 0 || props.original.c19 !== this.formatDt(this.workDate)} onClick={() => this.openModifyOrder('MOD', props.original)} type="button" style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Modify')}</button> |
        <button disabled={Number(props.original.c7) === 0 || props.original.c19 !== this.formatDt(this.workDate)} onClick={() => this.openModifyOrder('CAL', props.original)} type="button" style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Cancel')}</button> |
        <button type="button" onClick={() => {
          this.openOrderHistDetail(props.original.c19, props.original.c0);
          if (Number(props.original.c8) > 0) this.openMatchOrderHistDetail(props.original.c19, props.original.c0)
        }} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Detail')}</button>
      </span>
    },
    {
      Header: this.props.t("place_order_date"), accessor: "c19", show: true, headerClassName: 'text-center', className: 'text-center', width: 110,
      Cell: props => <span>{this.transDate(props.original.c19)}</span>
    },
    {
      Header: this.props.t("time"), accessor: "c1", show: true, headerClassName: 'text-center', className: 'text-center', width: 70,
      Cell: props => <span>{this.transTime(props.original.c1)}</span>
    },
    { Header: this.props.t("order_number"), accessor: "c13", show: true, headerClassName: 'text-center', className: 'text-right', width: 80 },
    {
      Header: this.props.t("origin_order_number"), accessor: "c0", show: true, headerClassName: 'text-center', className: 'text-right', width: 127,
      Cell: props => <span style={{ padding: '0 2px' }}>{props.original['c0']}</span>
    },
    {
      Header: this.props.t("order_status"), accessor: "c11", show: true, headerClassName: 'text-center', className: 'text-left', width: 125,
      Cell: props => <span>{this.props.t(this.transOrderStatus(props.original.c11))}</span>
    },
    { Header: this.props.t("short_symbol"), accessor: "c4", show: true, headerClassName: 'text-center', className: 'text-center', width: 70 },
    {
      Header: this.props.t("sell_buy_tp"), accessor: "c24", show: true, headerClassName: 'text-center', className: 'text-left', width: 82,
      Cell: props => <span className={props.original['c2'] === '2' ? 'sellColor' : 'buyColor'}>{props.original['c24']}</span>
    },
    {
      Header: this.props.t("order"), accessor: "c3", show: true, headerClassName: 'text-center', className: 'text-left', width: 140,
      Cell: props => <span>{this.props.t(this.translateOrderTp(props.original.c3))}</span>
    },
    {
      Header: this.props.t("price_plc"), accessor: "c6", show: true, headerClassName: 'text-center', className: 'text-right', width: 70,
      Cell: props => <span>{this.props.t(this.transOrdPrice(props.original.c3)) === '' ? FormatNumber(props.original.c6) : this.props.t(this.transOrdPrice(props.original.c3))}</span>
    },
    {
      Header: this.props.t("qty_wait_match"), accessor: "c7", show: true, headerClassName: 'text-center', className: 'text-right', width: 85,
      Cell: props => <span>{this.formatNO(props.original.c7)}</span>
    },
    {
      Header: this.props.t("sum_match_qty"), accessor: "c8", show: true, headerClassName: 'text-center', className: 'text-right', width: 130,
      Cell: props => <span>{this.formatNO(props.original.c8)}</span>
    },
    {
      Header: this.props.t("avg_match_price"), accessor: "c9", show: true, headerClassName: 'text-center', className: 'text-right', width: 105,
      Cell: props => <span>{this.formatNO(props.original.c9)}</span>
    },
    {
      Header: this.props.t("sum_match_value"), accessor: "c10", show: true, headerClassName: 'text-center', className: 'text-right', width: 116,
      Cell: props => <span>{this.formatNO(props.original.c10)}</span>
    },
    { Header: this.props.t("order_tp"), accessor: "c21", show: true, width: 80 },
    { Header: this.props.t("exchanges_order_number"), accessor: "c12", show: true, width: 135 },
    { Header: this.props.t("common_chanel"), accessor: "c23", show: true, width: 150 },
    { Header: this.props.t("person_place_order"), accessor: "c25", show: true, width: 110 }];

  headersCSV = [
    { label: this.props.t('common_index'), key: "c00" },
    { label: this.props.t('place_order_date'), key: "c19" },
    { label: this.props.t('time'), key: "c1" },
    { label: this.props.t('order_number'), key: "c13" },
    { label: this.props.t('origin_order_number'), key: "c0" },
    { label: this.props.t('short_symbol'), key: "c4" },
    { label: this.props.t('sell_buy_tp'), key: "c2" },
    { label: this.props.t('order_tp'), key: "c3" },
    { label: this.props.t('price_plc'), key: "c6" },
    { label: this.props.t('qty_wait_match'), key: "c7" },
    { label: this.props.t('sum_match_qty'), key: "c8" },
    { label: this.props.t('avg_match_price'), key: "c9" },
    { label: this.props.t('sum_match_value'), key: "c10" },
    { label: this.props.t('order_status'), key: "c14" }
  ];

  formatDt(value) {
    const day = value.substr(6, 2);
    const month = value.substr(4, 2);
    const year = value.substr(0, 4);
    return (day + '' + month + '' + year);
  }

  componentDidMount() {
    this.histOrder = this.state.histOrder;
    this.orderMod = this.state.orderMod;

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      this.objShareGlb = args.get('objShareGlb');
      this.localData = args.get('localData');

      if (glb_sv.localData.columnsOrdLst) {
        this.columnInfo = glb_sv.localData.columnsOrdLst;
        this.setState({ columnInfo: this.columnInfo });
        // esline
        this.columnInfo.map(item => {
          if (item.value === false) {
            const key = item.key.split('_')[0];
            const updateColumn = this.columnsH.find(o => o.accessor === key);
            updateColumn.show = false;
          }
        });
      } else if (this.state.columnInfo) {
        this.state.columnInfo.forEach(item => {
          const key = item.key.split('_')[0];
          if (item.value === false) {
            const updateColumn = this.columnsH.find(o => o.accessor === key);
            updateColumn.show = false;
          }
        })
      }

      const workDt = glb_sv.objShareGlb['workDate'];
      let todayDt = new Date();
      if (workDt) todayDt = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)));
      if (glb_sv.activeCode === '028' || glb_sv.activeCode === '061' || glb_sv.activeCode === '888') {
        this.setState({ columns: [...this.columnsH], nsi_start_dt: todayDt, nsi_end_dt: todayDt });
        this.nsi_start_dt = todayDt;
        this.nsi_end_dt = todayDt;
      } else {
        this.setState({ columns: [...this.columnsH] });
      }
    });
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'localData'], sq: sq });

    window.ipcRenderer.on(`${commuChanel.event_NotifyRcv}_${this.component}`, (event, message) => {
      if (message['MsgTp'] === 'ORD_NEW' || message['MsgTp'] === 'ORD_REJ' ||
        message['MsgTp'] === 'ORD_MTH' || message['MsgTp'] === 'ORD_CNL' ||
        message['MsgTp'] === 'ORD_MOD' || message['MsgTp'] === 'ORD_ADV' ||
        message['MsgTp'] === 'ORD_REJ8' || message['MsgTp'] === 'MSS_ORD_OK' || message['MsgTp'] === 'MSS_ORD_ERR') {
        this.gethistOrderList();
      }
    });

    window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
      if (msg.data === 'openModalModifyNormalOrder') {
        if (this.modTp === 'MOD') {
          this.setState({ cfm_order_mod: true });
        } else {
          this.setState({ cfm_order_cal_confirm: true });
        }
      }
      if (msg.data === 'openMultiModifyOrder') {
        this.openMultiModifyOrder();
      }
    });

    window.ipcRenderer.on(`${commuChanel.ACTION_SUCCUSS}_${this.component}`, (event, msg) => {
      if (msg.data === 'order-list') {
        const elm = document.getElementById('checkCancAll');
        if (elm) elm.checked = false;
        this.cancelMultiOrderList = [];
        this.setState({ ButtonCancAll: '' });
        this.ButtonCancAll.disabled = true;
        setTimeout(() =>
          this.gethistOrderList()
          , 1500);
      }
    });
    window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, msg) => {
      const columns = [
        {
          Header: props => <div className="custom-control custom-checkbox" style={{ marginLeft: 8 }}>
            <input type="checkbox" className="custom-control-input" id="checkCancAll"
              onChange={this.onCheckchangeAll}
            />
            <label className="custom-control-label" htmlFor="checkCancAll">
              <span className="text-hide">choose</span>
            </label>
          </div>, show: true, sortable: false, headerClassName: 'text-center', className: 'text-center', width: 60,
          Cell: props => <div className="custom-control custom-checkbox" style={{ marginLeft: 8 }}>
            <input disabled={props.original.c7 === 0 || props.original.c19 !== this.formatDt(this.workDate)} type="checkbox"
              className="custom-control-input" id={'his-ord-' + props.original.c13}
              // (change)="item.check = !item.check; onCheckchange(item, $event.target.checked)"
              onChange={() => this.onCheckchange(props.original)}
            />
            <label className="custom-control-label" htmlFor={'his-ord-' + props.original.c13}>
              <span className="text-hide">choose</span>
            </label>
          </div>
        },
        {
          Header: this.props.t("action"), sortable: false, show: true, headerClassName: 'text-center', className: 'text-center nowrap', width: 155, Cell: props => <span className='action-pagin'>
            <button disabled={props.original.c7 === 0 || props.original.c19 !== this.formatDt(this.workDate)} onClick={() => this.openModifyOrder('MOD', props.original)} type="button" style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Modify')}</button> |
            <button disabled={props.original.c7 === 0 || props.original.c19 !== this.formatDt(this.workDate)} onClick={() => this.openModifyOrder('CAL', props.original)} type="button" style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Cancel')}</button> |
            <button type="button" onClick={() => {
              this.openOrderHistDetail(props.original.c19, props.original.c0);
              if (Number(props.original.c8) > 0) this.openMatchOrderHistDetail(props.original.c19, props.original.c0)
            }} style={{ padding: '0 2px' }} className="btn btn-sm btn-link">{this.props.t('common_Detail')}</button>
          </span>
        },
        {
          Header: this.props.t("place_order_date"), accessor: "c19", show: true, headerClassName: 'text-center', className: 'text-center', width: 110,
          Cell: props => <span>{this.transDate(props.original.c19)}</span>
        },
        {
          Header: this.props.t("time"), accessor: "c1", show: true, headerClassName: 'text-center', className: 'text-center', width: 70,
          Cell: props => <span>{this.transTime(props.original.c1)}</span>
        },
        { Header: this.props.t("order_number"), accessor: "c13", show: true, headerClassName: 'text-center', className: 'text-right', width: 80 },
        {
          Header: this.props.t("origin_order_number"), accessor: "c0", show: true, headerClassName: 'text-center', className: 'text-right', width: 127,
          Cell: props => <span
            // onClick={() => this.openMatchOrderHistDetail(props.original.c19, props.original.c0)} className="btn-link cursor_ponter"
            style={{ padding: '0 2px' }}>{props.original['c0']}</span>
        },
        {
          Header: this.props.t("order_status"), accessor: "c11", show: true, headerClassName: 'text-center', className: 'text-left', width: 125,
          Cell: props => <span>{this.props.t(this.transOrderStatus(props.original.c11))}</span>
        },
        { Header: this.props.t("short_symbol"), accessor: "c4", show: true, headerClassName: 'text-center', className: 'text-center', width: 70 },
        {
          Header: this.props.t("sell_buy_tp"), accessor: "c24", show: true, headerClassName: 'text-center', className: 'text-left', width: 82,
          Cell: props => <span className={props.original['c2'] === '2' ? 'sellColor' : 'buyColor'}>{props.original['c24']}</span>
        },
        {
          Header: this.props.t("order"), accessor: "c3", show: true, headerClassName: 'text-center', className: 'text-left', width: 140,
          Cell: props => <span>{this.props.t(this.translateOrderTp(props.original.c3))}</span>
        },
        {
          Header: this.props.t("price_plc"), accessor: "c6", show: true, headerClassName: 'text-center', className: 'text-right', width: 70,
          Cell: props => <span>{this.props.t(this.transOrdPrice(props.original.c3)) === '' ? FormatNumber(props.original.c6) : this.props.t(this.transOrdPrice(props.original.c3))}</span>
        },
        {
          Header: this.props.t("qty_wait_match"), accessor: "c7", show: true, headerClassName: 'text-center', className: 'text-right', width: 85,
          Cell: props => <span>{this.formatNO(props.original.c7)}</span>
        },
        {
          Header: this.props.t("sum_match_qty"), accessor: "c8", show: true, headerClassName: 'text-center', className: 'text-right', width: 130,
          Cell: props => <span>{this.formatNO(props.original.c8)}</span>
        },
        {
          Header: this.props.t("avg_match_price"), accessor: "c9", show: true, headerClassName: 'text-center', className: 'text-right', width: 105,
          Cell: props => <span>{this.formatNO(props.original.c9)}</span>
        },
        {
          Header: this.props.t("sum_match_value"), accessor: "c10", show: true, headerClassName: 'text-center', className: 'text-right', width: 116,
          Cell: props => <span>{this.formatNO(props.original.c10)}</span>
        },
        { Header: this.props.t("order_tp"), accessor: "c21", show: true, width: 80 },
        { Header: this.props.t("exchanges_order_number"), accessor: "c12", show: true, width: 135 },
        { Header: this.props.t("common_chanel"), accessor: "c23", show: true, width: 150 },
        { Header: this.props.t("person_place_order"), accessor: "c25", show: true, width: 110 }];
      columns.forEach(item => {
        this.columnsH.forEach(temp => {
          if (item.accessor && item.accessor === temp.accessor) item.show = temp.show;
        })
      });
      this.columnsH = columns;
      this.setState({ columns });
      this.gethistOrderList();
    });

    this.loadData();
  }

  componentWillUnmount() {
    if (this.subcr_ClientReqRcv) { this.subcr_ClientReqRcv.unsubscribe(); }
    if (this.notifySvOrderBook) { this.notifySvOrderBook.unsubscribe(); }
    if (this.getOrderlistFunct_ReqTimeOut) { clearTimeout(this.getOrderlistFunct_ReqTimeOut); }
    if (this.getOrderlistFunctDetail_ReqTimeOut) { clearTimeout(this.getOrderlistFunctDetail_ReqTimeOut); }
    if (this.getOrderlistFunctDetailMatch_ReqTimeOut) { clearTimeout(this.getOrderlistFunctDetailMatch_ReqTimeOut); }
    if (this.orderModFunct_ReqTimeOut) { clearTimeout(this.orderModFunct_ReqTimeOut); }
    if (this.orderCanclFunct_ReqTimeOut) { clearTimeout(this.orderCanclFunct_ReqTimeOut); }
  }

  loadData() {

    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      this.objShareGlb = args.get('objShareGlb');
      this.activeAcnt = args.get('activeAcnt');


      this.workDate = this.objShareGlb['workDate'];

      if (this.workDate != null && this.workDate.length === 8) {
        this.workDateObj = new Date(Number(this.workDate.substr(0, 4)), Number(this.workDate.substr(4, 2)) - 1, Number(this.workDate.substr(6, 2)));
        // this.setState({ from_date: now, to_date: now });
      } else this.workDateObj = new Date();
      this.acntItems = this.objShareGlb['acntNoList'];
      let acntStr = '';
      if (this.activeAcnt && this.activeAcnt !== '' &&
        this.activeAcnt.substr(11) !== '%') {
        acntStr = this.activeAcnt;
      } else {
        acntStr = this.objShareGlb['acntNoList'][0]['id'];
      }
      this.histOrder['acntNo'] = acntStr;
      this.acntNo = acntStr;
      const pieacnt = acntStr.split('.');
      this.actn_curr = pieacnt[0];
      this.sub_curr = pieacnt[1];
      this.setState({ acntItems: this.acntItems });
      this.setState(prevState => ({
        histOrder: {
          ...prevState.histOrder,
          acntNo: this.histOrder['acntNo']
        }
      }))
      this.gethistOrderList();
    });
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'activeAcnt'], sq: sq });


  }

  orderMod_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.orderModFunct_ReqTimeOut);
    this.orderModFlag = false;
    this.setState({ sendcanlAdvOrderCfmFlag: false });
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      this.setState({ cfm_order_mod_confirm: false })
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false); }
    } else {
      this.setState({ cfm_order_mod: false, cfm_order_mod_confirm: false })
      setTimeout(() => { this.gethistOrderList(); }, 2000);
      glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success');
    }
  }
  orderCancl_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.orderCanclFunct_ReqTimeOut);
    this.orderCanclFlag = false;
    this.setState({ orderCanclFlag: false })
    if (reqInfoMap.procStat !== 0) { return; }
    reqInfoMap.procStat = 2;

    if (Number(message['Result']) === 0) {
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') {
        if (this.cancMultiFlag) {
          let orderInfo = reqInfoMap.othersInfo;
          const caclOrdTxt = this.props.t('info_cal_ord');
          const sellTxt = this.props.t('priceboard_sell');
          const buyTxt = this.props.t('priceboard_buy');
          const failTxt = this.props.t('cancel_failure');
          const succTxt = this.props.t('cancel_success');
          const soHLTxt = this.props.t('order_number');
          const stkCd = this.props.t('hint_stock_search');
          let item = caclOrdTxt + ' ' + (orderInfo['sellbuyTp'] == 1 ? buyTxt : sellTxt) +
            ' ' + failTxt + ' ' + soHLTxt + ' ' + orderInfo['hieuL'] + ', ' +
            stkCd + ' ' + orderInfo['stkCd'] + ': ' + message['Message'];
          this.resultMsgArr.push(item);
        } else {
          glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false);
        }
      }
    } else {
      if (this.cancMultiFlag) {
        let orderInfo = reqInfoMap.othersInfo;
        const caclOrdTxt = this.props.t('info_cal_ord');
        const sellTxt = this.props.t('priceboard_sell');
        const buyTxt = this.props.t('priceboard_buy');
        const failTxt = this.props.t('cancel_failure');
        const succTxt = this.props.t('cancel_success');
        const soHLTxt = this.props.t('order_number');
        const stkCd = this.props.t('hint_stock_search');

        let item = caclOrdTxt + ' ' + (orderInfo['sellbuyTp'] == 1 ? buyTxt : sellTxt) +
          ' ' + succTxt + ' ' + soHLTxt + ' ' + orderInfo['hieuL'] + ', ' +
          stkCd + ' ' + orderInfo['stkCd'] + ': ' + message['Message'];
        this.resultMsgArr.push(item);
      } else {
        this.setState({ cfm_order_cal_confirm: false });
        const elm = document.getElementById('checkCancAll');
        elm.checked = false;
        this.cancelMultiOrderList = [];
        this.setState({ ButtonCancAll: '' });
        this.ButtonCancAll.disabled = true;
        window.setTimeout(() => this.gethistOrderList(), 800);
        glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success');
      }
    }

    if (this.resultMsgArr && this.cancelMultiOrderList && this.resultMsgArr.length === this.cancelMultiOrderList.length && this.resultMsgArr.length > 0) {
      this.cancMultiFlag = false;
      this.setState({ resultMsgArr: this.resultMsgArr, cancMultiFlag: false, cfm_multi_order_cal_confirm: false, cfm_order_cal_result_multi: true });
      const elm = document.getElementById('checkCancAll');
      elm.checked = false;
      this.cancelMultiOrderList = [];
      this.setState({ ButtonCancAll: '' });
      this.ButtonCancAll.disabled = true;
      window.setTimeout(() => { this.gethistOrderList(); }, 800);
    }
  }
  gethistOrderlist_ResultProc = (reqInfoMap, message) => {
    console.log("gethistOrderlist_ResultProc -> message", message)
    clearTimeout(this.gethistOrderlistFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.gethistOrderlistFlag = false;
      this.setState({ refreshFlag: '' });
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false); }
      return;
    } else {
      reqInfoMap.procStat = 1;
      let jsondata;
      try {
        jsondata = JSON.parse(message['Data']);
      } catch (err) {
        glb_sv.logMessage('gethistOrderlist_ResultProc' + err);
        jsondata = [];
      }
      this.histOrdListTemple = this.histOrdListTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.filterData();
      }
    }
  }
  gethistOrderlistDetail_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.gethistOrderlistDetailFunct_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.setState({ gethistOrderlistDetailFlag: false });
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false); }
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
      this.histOrdListDetailTemple = this.histOrdListDetailTemple.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.gethistOrderlistDetailFlag = false;
        this.setState({ histOrdListDetailDataTable: this.histOrdListDetailTemple, cfm_historderList_detail: true, gethistOrderlistDetailFlag: false })
      }
    }
  }
  getOrderlistDetailMatch_ResultProc = (reqInfoMap, message) => {
    clearTimeout(this.getOrderlistFunctDetailMatch_ReqTimeOut);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
    // -- process after get result --
    if (Number(message['Result']) === 0) {
      reqInfoMap.procStat = 2;
      this.getOrderlistDetailMatchFlag = false;
      reqInfoMap.resSucc = false;
      if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false); }
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
      this.ordListTempleDetailMatch = this.ordListTempleDetailMatch.concat(jsondata);
      if (Number(message['Packet']) <= 0) {
        reqInfoMap.procStat = 2;
        this.getOrderlistDetailMatchFlag = false;
        if (this.ordListTempleDetailMatch.length > 0) {
          this.sumtable.c3 = FormatNumber(sum(map(this.ordListTempleDetailMatch, d => Number(d.c3))));
          this.sumtable.c5 = FormatNumber(sum(map(this.ordListTempleDetailMatch, d => Number(d.c5))));
          this.setState({ sumtable: this.sumtable })
        }
        this.setState({
          ordListDataTableDetailMatch: this.ordListTempleDetailMatch,
          // cfm_orderHist_detailMatch: true
        });
      }
    }
  }

  solvingTimeOut = (cltSeq) => {
    if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
    const reqIfMap = this.req_component.get(cltSeq);
    if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
    const timeResult = new Date();
    reqIfMap.resTime = timeResult;
    reqIfMap.procStat = 4;
    this.req_component.set(cltSeq, reqIfMap);
    console.log('solvingTimeOut',reqIfMap.reqFunct)
    if (reqIfMap.reqFunct === this.gethistOrderlist_FunctNm) {
      this.setState({ refreshFlag: '' });
      this.gethistOrderlistFlag = false;
    } else if (reqIfMap.reqFunct === this.gethistOrderlistDetail_FunctNm) {
      this.setState({ gethistOrderlistDetailFlag: false });
    } else if (reqIfMap.reqFunct === this.getOrderlistDetailMatch_FunctNm) {
      this.getOrderlistDetailMatchFlag = false;
    } else if (reqIfMap.reqFunct === this.orderMod_FunctNm) {
      this.orderModFlag = false;
      this.setState({ cfm_order_mod_confirm: false, sendcanlAdvOrderCfmFlag: false, cfm_order_mod: false })
    } else if (reqIfMap.reqFunct === this.orderCancl_FunctNm) {
      this.orderCanclFlag = false;
      this.cancMultiFlag = false;
      this.setState({ cancMultiFlag: false, orderCanclFlag: false, cfm_order_cal_confirm: false, cfm_order_cal_result_multi: false, cfm_multi_order_cal_confirm: false });
    }
    // glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning');
  }

  // --- get orderlist function
  gethistOrderList = () => {
    console.log("gethistOrderList -> gethistOrderList")
    if (this.gethistOrderlistFlag) { return; }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) {
      this.setState({ refreshFlag: '' });
      return;
    }
    let from_date;
    if (this.timeQuery === '0D') {
      from_date = new Date(this.workDateObj.getTime());
    } else {
      from_date = new Date(this.workDateObj.getTime());
      from_date.setDate(from_date.getDate() - parseInt(this.timeQuery));
    }

    if (glb_sv.activeCode !== '028' && glb_sv.activeCode !== '061' && glb_sv.activeCode !== '888') {
      this.histOrder['start_dt'] = { year: from_date.getFullYear(), month: from_date.getMonth() + 1, day: from_date.getDate() };
    } else {
      this.histOrder['start_dt'] = { year: this.nsi_start_dt.getFullYear(), month: this.nsi_start_dt.getMonth() + 1, day: this.nsi_start_dt.getDate() };
    }
    const start_dtOld = this.histOrder['start_dt'];
    let day = start_dtOld['day'] + '';
    let month = start_dtOld['month'] + '';
    let year = start_dtOld['year'];

    const pad = '00'
    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const start_dt = year + month + day;
    if (glb_sv.activeCode !== '028' && glb_sv.activeCode !== '061' && glb_sv.activeCode !== '888') {
      this.histOrder['end_dt'] = { year: this.workDateObj.getFullYear(), month: this.workDateObj.getMonth() + 1, day: this.workDateObj.getDate() };
    } else {
      this.histOrder['end_dt'] = { year: this.nsi_end_dt.getFullYear(), month: this.nsi_end_dt.getMonth() + 1, day: this.nsi_end_dt.getDate() };
    }
    const end_dtOld = this.histOrder['end_dt'];

    day = end_dtOld['day'] + '';
    month = end_dtOld['month'] + '';
    year = end_dtOld['year'];

    day = pad.substring(0, pad.length - day.length) + day;
    month = pad.substring(0, pad.length - month.length) + month;
    const end_dt = year + month + day;

    this.gethistOrderlistFlag = true;
    // -- push request to request hashmap
    const request_seq_comp = this.get_rq_seq_comp()
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.gethistOrderlist_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.gethistOrderlist_ResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();

    svInputPrm.WorkerName = 'ALTqOrder02';
    svInputPrm.ServiceName = 'ALTqOrder02_0501_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['4', 'HOME', start_dt, end_dt, this.actn_curr, this.sub_curr, "1"];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm
    })
    this.sellAbleFunctList_ReqTimeOut = setTimeout(this.solvingTimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = svInputPrm.InVal
    this.req_component.set(request_seq_comp, reqInfo)

    this.histOrdListTemple = [];
    this.totalCancelList = 0;
    this.setState({ data: [], refreshFlag: 'fa-spin' });
  }

  openOrderHistDetail = (orderDt, orderNo) => {
    if (this.state.gethistOrderlistDetailFlag) { return; }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }
    this.setState({ gethistOrderlistDetailFlag: true });
    const orderDtOrd = orderDt.substr(4, 4) + orderDt.substr(2, 2) + orderDt.substr(0, 2);

    const request_seq_comp = this.get_rq_seq_comp()
    // -- push request to request hashmap
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.gethistOrderlistDetail_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.gethistOrderlistDetail_ResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqOrder02';
    svInputPrm.ServiceName = 'ALTqOrder02_0501_1';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', 'HOME', this.actn_curr, this.sub_curr, orderNo + '', orderDtOrd, "1"];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm
    })
    this.gethistOrderlistDetailFunct_ReqTimeOut = setTimeout(this.solvingTimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = svInputPrm.InVal
    this.req_component.set(request_seq_comp, reqInfo)


    this.histOrdListDetailTemple = [];
  }

  // --- get matching order list detail function
  openMatchOrderHistDetail = (orderDt, orderNo) => {
    if (this.getOrderlistDetailMatchFlag) { return; }
    if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }
    this.getOrderlistDetailMatchFlag = true;
    const orderDtOrd = orderDt.substr(4, 4) + orderDt.substr(2, 2) + orderDt.substr(0, 2);
    // -- push request to request hashmap
    const request_seq_comp = this.get_rq_seq_comp();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.getOrderlistDetailMatch_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.getOrderlistDetailMatch_ResultProc;
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTqOrder02';
    svInputPrm.ServiceName = 'ALTqOrder02_0501_2';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'Q';
    svInputPrm.InVal = ['1', 'HOME', this.actn_curr, this.sub_curr, orderNo + '', orderDtOrd, "1"];
    svInputPrm.TotInVal = svInputPrm.InVal.length;

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm
    })
    this.getOrderlistFunctDetailMatch_ReqTimeOut = setTimeout(this.solvingTimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = svInputPrm.InVal;
    this.req_component.set(request_seq_comp, reqInfo);

    this.ordListTempleDetailMatch = [];
  }

  openModifyOrder = (modTp, value) => {

    if (Number(value['c7']) === 0) { return; }
    const workDt = this.workDate.substr(6, 2) + this.workDate.substr(4, 2) + this.workDate.substr(0, 4);
    if (this.workDate != null && this.workDate.length === 8 && workDt === value.c19) {
      this.orderMod['hieuL'] = value['c13'];
      this.orderMod['hieuLG'] = value['c0'];
      this.orderMod['price'] = value['c6'];
      this.orderMod['qtyNotMth'] = value['c7'];
      this.orderMod['stkCd'] = glb_sv.getStkfull(value.c4)
      this.orderMod['priceMod'] = FormatNumber(value['c6'], 0);
      this.orderMod['qtyMod'] = FormatNumber(value['c7'], 0);
      this.orderMod['orderTp'] = value['c3'];
      this.orderMod['sellbuyTp'] = value['c24'];
      this.setState({ orderMod: this.orderMod });
      this.modTp = modTp;
      if (!glb_sv.checkOtp('openModalModifyNormalOrder')) return;

      if (modTp === 'MOD') {
        this.setState({ cfm_order_mod: true });
      } else {
        this.cancMultiFlag = false;
        this.setState({ cfm_order_cal_confirm: true });
      }
    }
  };

  confirmModOrder = cfmTp => {
    if (cfmTp === 'N') {
      this.setState({ cfm_order_mod: false })
      return;
    } else {
      const priceModStr = this.orderMod['priceMod'];
      const qtyModStr = this.orderMod['qtyMod'];
      // const orderNoMod = this.orderMod['hieuL'];
      const qtyModBf = this.orderMod['qtyNotMth'];
      const priceModBf = this.orderMod['price'];
      // let passwordMod = this.orderMod["pCode"];
      const orderTpMod = this.orderMod['orderTp'];

      let priceMod = glb_sv.filterNumber(priceModStr);
      let qtyMod = glb_sv.filterNumber(qtyModStr);

      if (priceMod === 0 || priceMod === null || priceMod === undefined) {
        priceMod = 0;
      }
      if (qtyMod === 0 || qtyMod === null || qtyMod === undefined) { qtyMod = 0; }

      if (orderTpMod === '01') {
        if (isNaN(priceMod) || priceMod <= 0) {
          glb_sv.openAlertModal(
            '',
            'common_InfoMessage',
            'price_not_correct',
            '',
            'warning',
            'orderMod_priceMod'
          );
          return;
        }
      } else {
        if (
          isNaN(priceMod) ||
          (priceMod !== 0 && priceMod !== 0.0 && priceMod !== '0')
        ) {
          glb_sv.openAlertModal(
            '',
            'common_InfoMessage',
            'price_wrong_with_order_type',
            '',
            'warning',
            'orderMod_priceMod'
          );
          this.orderMod['priceMod'] = 0;
          this.setState(prevState => ({
            orderMod: {
              ...prevState.orderMod,
              priceMod: 0
            }
          }))
          return;
        }
      }
      if (isNaN(qtyMod) || qtyMod <= 0) {
        glb_sv.openAlertModal(
          '',
          'common_InfoMessage',
          'qty_not_correct',
          '',
          'warning',
          'orderMod_qtyMod'
        );
        return;
      }
      if (qtyModBf === qtyMod && priceModBf === priceMod) {
        glb_sv.openAlertModal(
          '',
          'common_InfoMessage',
          'common_no_info_change',
          '',
          'warning',
          'orderMod_priceMod'
        );
        return;
      }
      this.setState({ cfm_order_mod_confirm: true });
    }
  };

  msgBoxModifyCfm = cfmTp => {
    if (this.orderModFlag === true) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_order_mod_confirm: false });
      return;
    }
    this.orderModFlag = true;
    this.svInputPrmGlb = {};
    const acntinfo = this.acntNo;
    const pieces = acntinfo.split('.');
    const acntNo = pieces[0];
    const subNo = pieces[1];
    const priceModStr = this.orderMod['priceMod'];
    const qtyModStr = this.orderMod['qtyMod'];
    const orderNoMod = this.orderMod['hieuL'];
    const priceMod = glb_sv.filterNumber(priceModStr);
    const qtyMod = glb_sv.filterNumber(qtyModStr);

    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxChangeOrder';
    svInputPrm.ServiceName = 'ALTxChangeOrder_0501';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InCrpt = [];
    svInputPrm.InVal = [orderNoMod + '', acntNo, subNo, '', qtyMod + '', priceMod + '', "1"];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    this.svInputPrmGlb = svInputPrm;
    if (glb_sv.objShareGlb['verify'] > 0) {
      // tslint:disable-next-line:max-line-length       
      // CheckPluginValid(this.CheckPluginResult);
      // if (glb_sv.configInfo['third_sign'] === 'vntic') {
      //   this.VnTicSignXml();
      //   this.controlSignTimeout = setTimeout(() => {
      //     this.timeoutSign();
      //   }, 30 * 1000);
      // } else { //-- bkv
      //   CheckPluginValid(this.CheckPluginResult);
      // }
      this.makeOrderMod(0, '');
    } else {
      this.makeOrderMod(0, '');
    }
  };

  // SignXMlCallback = (data) => {
  //   // tslint:disable-next-line:radix
  //   // const iRet = parseInt(data);
  //   const decodedata = window.base64.decode(data);
  //   const iRet = Number(decodedata);
  //   let dataRet, result = false;
  //   switch (iRet) {
  //     case 0:
  //       dataRet = 'Không có quyền sử dụng chức năng này';
  //       // console.log('Không có quyền sử dụng chức năng này');
  //       break;
  //     // case 1:
  //     //   console.log('Ký thành công');
  //     //   break;
  //     case 2:
  //       dataRet = 'Ký lỗi: Dữ liệu đã được ký';
  //       // console.log('Ký lỗi: Dữ liệu đã được ký');
  //       break;
  //     case 3:
  //       dataRet = 'Không tìm thấy chứng thư số';
  //       // console.log('Không tìm thấy chứng thư số');
  //       break;
  //     case 4:
  //       dataRet = 'Dữ liệu đầu vào không đúng định dạng';
  //       // console.log('Dữ liệu đầu vào không đúng định dạng');
  //       break;
  //     case 5:
  //       dataRet = 'Có lỗi trong quá trình ký';
  //       // console.log('Có lỗi trong quá trình ký');
  //       break;
  //     case 6:
  //       dataRet = 'Có lỗi trong quá trình lưu chữ ký';
  //       // console.log('Có lỗi trong quá trình lưu chữ ký');
  //       break;
  //     case 13:
  //       dataRet = 'Người dùng hủy bỏ';
  //       // console.log('Người dùng hủy bỏ không nhập pin');
  //       break;
  //     default:
  //       dataRet = data;
  //       const resultSplit = dataRet.split('*');
  //       if (resultSplit[0].length > 0) {
  //         if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
  //           this.makeOrderMod(1, resultSplit[0]);
  //         } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
  //           this.makeOrderCanl(1, resultSplit[0]);
  //         } else {
  //           this.makeOrder(1, resultSplit[0]);
  //         }
  //       }
  //       result = true;
  //       break;
  //   }

  //   if (!result) {
  //     // -- báo lỗi ở các case trên 
  //     const ermsg = 'Lỗi khi thực hiện xác thực chứng chỉ số: ' + dataRet;
  //     glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
  //     if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
  //       this.orderModFlag = false;
  //     } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
  //       this.orderCanclFlag = false;
  //     } else {
  //       this.placeOrderFlag = false;
  //     }
  //   }

  // }

  // CheckPluginResult = (data) => {
  //   let ermsg = '', result = false;
  //   switch (data) {
  //     case '0':
  //       // console.log('Plugin chưa được cài đặt!');
  //       ermsg = 'Lỗi khi thực hiện xác thực chứng chỉ số: Plugin chưa được cài đặt!';
  //       glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
  //       this.setState({ placeOrderFlag: false });
  //       break;
  //     case '1':
  //       this.SignBase64XML();
  //       result = true;
  //       break;
  //     default:
  //       // console.log('Có lỗi trong việc xác thực Plugin!');
  //       ermsg = 'Lỗi khi thực hiện xác thực chứng chỉ số: Hãy kiểm tra Plugin của bạn!';
  //       glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning');
  //       this.placeOrderFlag = false;
  //       this.setState({ placeOrderFlag: false });
  //       break;
  //   }
  //   if (!result) {
  //     if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
  //       this.orderModFlag = false;
  //       this.setState({ orderModFlag: false });
  //     } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
  //       this.orderCanclFlag = false;
  //       this.setState({ orderCanclFlag: false });
  //     } else {
  //       this.placeOrderFlag = false;
  //       this.setState({ placeOrderFlag: false });
  //     }
  //   }
  // }

  // SignBase64XML = () => {
  //   if (this.svInputPrmGlb === undefined || this.svInputPrmGlb === null) { return; }
  //   this.svInputPrmGlb['InVal'].push(this.svInputPrmGlb.ServiceName);
  //   const xmlIn = '<data>' + JSON.stringify(this.svInputPrmGlb['InVal']) + '</data>';
  //   // console.log(xmlIn);
  //   const serialNumber = this.objShareInfo['serialnum'];
  //   // const serialNumber = '540367fae100baa7945094721b9884d7'; // '61f49c2cd095dd88441575d177f06993';
  //   // console.log(serialNumber);
  //   this.svInputPrmGlb['InVal'].pop();
  //   SignXML(window.base64.encode(xmlIn), serialNumber, this.SignXMlCallback);
  // }

  // VnTicSignXml = () => {
  //   // actTp = 0 -> đặt lệnh mua/bán, = 1 -> Sửa lệnh, 2 -> hủy lệnh
  //   tokensigning.checkTokenSigning().then((data) => {
  //     var obj = JSON.parse(data);
  //     if (obj.code === 1) {
  //       glb_sv.logMessage('data of checkTokenSigning');
  //       glb_sv.logMessage(data);
  //       glb_sv.logMessage('serialnumber');
  //       glb_sv.logMessage(this.objShareInfo['serialnum']);
  //       var serial = this.objShareInfo['serialnum'].toUpperCase();
  //       tokensigning.selectCertificate({ serial }).then((data) => {
  //         glb_sv.logMessage("Kết quả lấy thông tin certificate");
  //         var obj = JSON.parse(data);
  //         if (obj.code === 1) {
  //           var objCert = JSON.parse(obj.data);
  //           glb_sv.logMessage('dữ liệu sau khi lấy Certificate info');
  //           glb_sv.logMessage(objCert.serial);
  //           glb_sv.logMessage("other_info");
  //           glb_sv.logMessage(obj.data);
  //           //-- thực hiện ký ------------------
  //           this.svInputPrmGlb['InVal'].push(this.svInputPrmGlb.ServiceName);
  //           const xmlIn = '<data>' + JSON.stringify(this.svInputPrmGlb['InVal']) + '</data>';
  //           this.svInputPrmGlb['InVal'].pop();
  //           const datainfo = base64.encode(xmlIn);
  //           tokensigning.signXml(datainfo, { serial }).then((data) => {
  //             glb_sv.logMessage("Ký hoàn thành");
  //             glb_sv.logMessage(data.length);
  //             glb_sv.logMessage(data);
  //             const dataEndc = JSON.parse(data);
  //             if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
  //               this.makeOrderMod(1, dataEndc['data']);
  //             } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
  //               this.makeOrderCanl(1, dataEndc['data'], null);
  //             } else {
  //               glb_sv.logMessage("Data content");
  //               glb_sv.logMessage(dataEndc['data']);
  //               this.makeOrder(1, dataEndc['data']);
  //             }
  //             clearTimeout(this.controlSignTimeout);
  //           }).catch((e) => {
  //             this.errorClearFlag();
  //             glb_sv.openAlertModal(
  //               '',
  //               'common_InfoMessage',
  //               'Đã xảy ra lỗi khi thực hiện xác thực chữ ký điện tử',
  //               '',
  //               'warning'
  //             );
  //             glb_sv.logMessage("Error");
  //             glb_sv.logMessage(e);
  //           });
  //         }
  //         else if (obj.code === 0) {
  //           this.errorClearFlag();
  //           glb_sv.logMessage("Người dùng hủy bỏ");
  //           return;
  //         }
  //         else {
  //           this.errorClearFlag();
  //           glb_sv.openAlertModal(
  //             '',
  //             'common_InfoMessage',
  //             'Không tìm thấy chứng thư xác thực',
  //             '',
  //             'warning'
  //           );
  //           glb_sv.logMessage("Không tìm được chứng thư");
  //           return;
  //         }
  //       })
  //     } else {
  //       this.errorClearFlag();
  //       glb_sv.openAlertModal(
  //         '',
  //         'common_InfoMessage',
  //         'License đã hết hiệu lực!',
  //         '',
  //         'warning'
  //       );
  //       glb_sv.logMessage("License invalid");
  //       glb_sv.logMessage("License invalid");
  //       return;
  //     }
  //   }).catch((e) => {
  //     this.errorClearFlag();
  //     glb_sv.openAlertModal(
  //       '',
  //       'common_InfoMessage',
  //       'Đã xảy ra lỗi khi thực hiện xác thực chữ ký điện tử',
  //       '',
  //       'warning'
  //     );
  //     glb_sv.logMessage("Exception");
  //     glb_sv.logMessage(e);
  //     return;
  //   });
  // };

  // timeoutSign = () => {
  //   if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
  //     this.orderModFlag = false;
  //   } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
  //     this.orderCanclFlag = false;
  //   } else {
  //     this.placeOrderFlag = false;
  //   }
  //   glb_sv.openAlertModal(
  //     '',
  //     'common_InfoMessage',
  //     'Đã hết thời gian thực hiện xác nhận lệnh!',
  //     '',
  //     'warning'
  //   );
  // };

  errorClearFlag = () => {
    clearTimeout(this.controlSignTimeout)
    if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
      this.orderModFlag = false;
    } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
      this.orderCanclFlag = false;
      this.cancMultiFlag = false;
    } else {
      this.placeOrderFlag = false;
    }
  };

  makeOrderMod = (actNum, signStr) => {
    const request_seq_comp = this.get_rq_seq_comp();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.orderMod_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.orderMod_ResultProc;

    // -- service info    
    if (actNum > 0) {
      this.svInputPrmGlb.InVal[3] = signStr;
    } else {
      this.svInputPrmGlb.InVal[3] = '';
    }
    this.setState({ sendcanlAdvOrderCfmFlag: true });

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: this.svInputPrmGlb
    })
    this.orderModFunct_ReqTimeOut = setTimeout(this.solvingTimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = this.svInputPrmGlb.InVal;
    this.req_component.set(request_seq_comp, reqInfo);
  }

  confirmCalOrder = cfmTp => {
    if (this.orderCanclFlag === true && this.cancMultiFlag === false) { return; }
    if (cfmTp === 'N') {
      this.setState({ cfm_order_cal_confirm: false });
      return;
    }
    this.orderCanclFlag = true;
    this.svInputPrmGlb = {};
    const acntinfo = this.acntNo;
    const pieces = acntinfo.split('.');
    const acntNo = pieces[0];
    const subNo = pieces[1];
    const orderNoMod = this.orderMod['hieuL'];
    // -- service info
    let svInputPrm = new serviceInputPrm();
    svInputPrm.WorkerName = 'ALTxCancelOrder';
    svInputPrm.ServiceName = 'ALTxCancelOrder_0501';
    svInputPrm.ClientSentTime = '0';
    svInputPrm.Operation = 'I';
    svInputPrm.InCrpt = [];
    svInputPrm.InVal = [orderNoMod + '', acntNo, subNo, '', "1"];
    svInputPrm.TotInVal = svInputPrm.InVal.length;
    this.svInputPrmGlb = svInputPrm;
    if (glb_sv.objShareGlb['verify'] > 0) {

      // if (glb_sv.configInfo['third_sign'] === 'vntic') {
      //   this.VnTicSignXml();
      //   this.controlSignTimeout = setTimeout(() => {
      //     this.timeoutSign();
      //   }, 30 * 1000);
      // } else { //-- bkv
      //   CheckPluginValid(this.CheckPluginResult);
      // }
    } else {
      const orderMod = { ...this.orderMod }
      this.makeOrderCanl(0, '', orderMod);
    }
  };

  makeOrderCanl = (actNum, signStr, orderMod) => {
    // -- push request to request hashmap
    const request_seq_comp = this.get_rq_seq_comp();
    const reqInfo = new requestInfo();
    reqInfo.reqFunct = this.orderCancl_FunctNm;
    reqInfo.component = this.component;
    reqInfo.receiveFunct = this.orderCancl_ResultProc;
    // -- service info    
    if (actNum > 0) {
      this.svInputPrmGlb.InVal[3] = signStr;
    } else {
      this.svInputPrmGlb.InVal[3] = '';
    }
    this.setState({ orderCanclFlag: true });

    window.ipcRenderer.send(commuChanel.send_req, {
      req_component: {
        component: reqInfo.component,
        request_seq_comp: request_seq_comp,
        channel: socket_sv.key_ClientReq
      },
      svInputPrm: this.svInputPrmGlb
    })
    this.orderCanclFunct_ReqTimeOut = setTimeout(this.solvingTimeOut, functionList.reqTimeout, request_seq_comp)
    reqInfo.inputParam = this.svInputPrmGlb.InVal;
    reqInfo.othersInfo = orderMod;
    this.req_component.set(request_seq_comp, reqInfo);
  }

  handleColumnChange(name, key, value) {
    const id = key.split('_')[0];
    const updateColumn = this.columnsH.find(o => o.accessor === id);
    if (updateColumn) updateColumn.show = value;
    this.setState({
      columns: [...this.columnsH]
    });

    const updateColumnInfo = this.columnInfo.find(o => o.key === key);
    if (updateColumnInfo) updateColumnInfo.value = value;
    glb_sv.localData.columnsOrdLst = this.columnInfo;
    if (typeof (Storage) !== 'undefined') {
      localStorage.setItem('stateMainPage', JSON.stringify(glb_sv.localData));
    }
  }

  handleDateChange = (actTp, value) => {
    if (actTp === 1) {
      this.nsi_start_dt = value;
      this.setState({ nsi_start_dt: value }, this.gethistOrderList());
    } else {
      this.nsi_end_dt = value;
      this.setState({ nsi_end_dt: value }, this.gethistOrderList());
    }
  }

  handleAdvanceExtend() {
    // if (this.extendAdvance === false) {
    //   this.setState({ styleTop: 'visible', styleBot: '-30px' });
    // } else {
    //   this.setState({ styleTop: 'hidden', styleBot: '-130px' });
    // }
    // this.extendAdvance = !this.extendAdvance;
  }

  refeshData = () => {
    const elm = document.getElementById('checkCancAll');
    elm.checked = false;
    this.cancelMultiOrderList = [];
    this.setState({ ButtonCancAll: '' });
    this.ButtonCancAll.disabled = true;
    this.gethistOrderList();
  }

  onOpenedModalcanclModOrd = (key) => {
    if (key === 'mod') {
      const elm = document.getElementById('orderMod_priceMod');
      elm.selectionStart = 0;
      elm.selectionEnd = elm.value.length;
      if (elm) elm.focus();
    } if (key === 'mod_cfm') {
      const elm = document.getElementById('bt_msgBoxModifyCfmOk');
      if (elm) elm.focus();
    } else if (key === 'hist') {
      const elm = document.getElementById('historderList_detail');
      if (elm) elm.focus();
    } else if (key === 'histMatch') {
      const elm = document.getElementById('modal_orderHist_detailMatch');
      if (elm) elm.focus();
    } else if (key === 'mul_cal') {
      const elm = document.getElementById('buttonCfmMultiCalOrder');
      if (elm) elm.focus();
    } else {
      const elm = document.getElementById('buttonCfmCalOrder');
      if (elm) elm.focus();
    }
  }

  importExcelData = (data) => {
    this.arrayExcel = data.map((item, index) => {
      item.c00 = index + 1;
      item.c19 = this.transDate(item.c19);
      item.c1 = this.transTime(item.c1);
      item.c2 = (item.c2 === '1') ? this.props.t('buy_order') : this.props.t('buy_order');
      item.c3 = this.props.t(this.translateOrderTp(item.c3));
      item.c14 = this.props.t(this.transOrderStatus(item.c14));
      return item;
    });
  };

  onChangeOrderMod = (e, key) => {
    const value = glb_sv.filterNumber(e.target.value);
    const valueFix = FormatNumber(value);
    if (key === 'price') {
      this.orderMod.priceMod = valueFix;
      this.setState(prevState => ({
        orderMod: {
          ...prevState.orderMod,
          priceMod: valueFix
        }
      }))
    } else {
      this.orderMod.qtyMod = valueFix;
      this.setState(prevState => ({
        orderMod: {
          ...prevState.orderMod,
          qtyMod: valueFix
        }
      }))
    }
  }

  translateOrderTp = (value) => {
    if (value === '01') {
      return 'order_Limit'
    } else if (value === '02') {
      return 'order_Mp'
    } else if (value === '03') {
      return 'order_ATO'
    } else if (value === '04') {
      return 'order_ATC'
    } else if (value === '05') {
      return 'order_PT'
    } else if (value === '06') {
      return 'order_MOK'
    } else if (value === '07') {
      return 'order_MAK'
    } else if (value === '08') {
      return 'order_MTL'
    } else if (value === '15') {
      return 'order_PLO'
    }
  }
  translateSessionTp = (value) => {
    if (value === '1') {
      return 'ATO_session'
    } else if (value === '2') {
      return 'continuity_session_morning'
    } else if (value === '3') {
      return 'continuity_session_afternoon'
    } else if (value === '4') {
      return 'ATC_session'
    } else if (value === '5') {
      return 'priceboard_Close'
    }
  }
  transOrderStatus = (value) => {
    if (value === '0') return 'in_core';
    else if (value === '1') return 'send_to_exchange';
    else if (value === '3') return 'wait_to_match';
    else if (value === '4') return 'match_all';
    else if (value === '5') return 'match_a_pieces';
    else if (value === '6') return 'wait_to_cancel_cfm';
    else if (value === '7') return 'confirm_cancel';
    else if (value === '8') return 'confirm_stop_order';
    else if (value === '9') return 'confirm_ice_order';
    else if (value === 'X') return 'reject';
  }
  transOrdPrice = (value) => {
    if (value === '01' || value === '05') return '';
    else if (value === '02') return 'price_Mp';
    else if (value === '03') return 'price_ATO';
    else if (value === '04') return 'price_ATC';
    else if (value === '06') return 'price_MOK';
    else if (value === '07') return 'price_MAK';
    else if (value === '08') return 'price_MTL';
    else if (value === '15') return 'price_PLO';
  }
  transDate = (value) => {
    if (value === '' || value == null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 4);
    return (day + '/' + month + '/' + year);
  }
  transDTime = (value) => {
    if (value === '' || value == null) return value;
    const day = value.substr(8, 2);
    const month = value.substr(10, 2);
    const year = value.substr(12, 2);
    return (day + ':' + month + ':' + year);
  }
  transTime = (value) => {
    if (value === '' || value == null) return value;
    const day = value.substr(0, 2);
    const month = value.substr(2, 2);
    const year = value.substr(4, 2);
    return (day + ':' + month + ':' + year);
  }

  transTitle(item) {
    return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
  }

  formatNO = (value) => {
    if (value > 999) return FormatNumber(value);
    else return value;
  }

  handleKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which);
    const name = e.target.name;
    if (name === 'priceMod') {
      if (code === 13) {
        this.confirmModOrder('Y');
      }
      if (code === 27) {
        this.confirmModOrder('N');
      }
    }
    if (name === 'qtyMod') {
      if (code === 13) {
        this.confirmModOrder('Y');
      }
      if (code === 27) {
        this.confirmModOrder('N');
      }
    }
    if (name === 'buttonCfmCalOrder') {
      if (code === 27) {
        this.confirmCalOrder('N');
      }
    }
    if (name === 'bt_msgBoxModifyCfmOk') {
      if (code === 27) {
        this.msgBoxModifyCfm('N');
      }
    }
    if (this.state.cfm_orderHist_detailMatch) {
      if (code === 27) {
        this.setState({ cfm_orderHist_detailMatch: false });
      }
    }
    if (this.state.cfm_historderList_detail && code === 27) {
      this.setState({ cfm_historderList_detail: false });
    }

  }

  calHeight() {
    let heightTable = this.state.data.length <= 5 ? (this.state.data.length === 0 ? 31 + 36 : (this.state.data.length * 31 + 36)) : ((this.state.data.length * 31 + 36) > this.state.heightScroll ? this.state.heightScroll : (this.state.data.length * 31 + 36));

    if (heightTable > this.state.heightScroll) {
      return (this.state.heightScroll - 29) <= 67 ? 67 : (this.state.heightScroll - 29);
    }
    else if (heightTable === this.state.heightScroll) return heightTable - 30;
    else return heightTable;
  }

  onCheckchangeAll = () => {
    if (this.state.data.length === 0) return;
    const checkCancAll = document.getElementById('checkCancAll');
    const checkAll = checkCancAll ? checkCancAll.checked : false;
    if (checkAll) {
      this.cancelMultiOrderList = [];
      this.state.data.forEach(item => {
        if (Number(item.c7) === 0 || item.c19 !== this.formatDt(this.workDate)) return;
        const elm = document.getElementById('his-ord-' + item.c13);
        if (elm) elm.checked = true;
        this.cancelMultiOrderList.push(item);
      });
      if (this.cancelMultiOrderList.length > 0) this.setState({ ButtonCancAll: 'btn-wizard' });
      this.ButtonCancAll.disabled = false;
      if (this.cancelMultiOrderList.length === 0) {
        if (checkCancAll) {
          this.ButtonCancAll.disabled = true;
          checkCancAll.checked = false;
          checkCancAll.disabled = true;
        }
      }
    } else {
      this.cancelMultiOrderList = [];
      this.state.data.forEach(item => {
        if (Number(item.c7) === 0 || item.c19 !== this.formatDt(this.workDate)) return;
        const elm = document.getElementById('his-ord-' + item.c13);
        if (elm) elm.checked = false;
      });
      this.setState({ ButtonCancAll: '' });
      this.ButtonCancAll.disabled = true;
    }
  }
  onCheckchange(item) {
    if (item['c7'] === undefined || Number(item['c7']) === 0) return;
    const elm = document.getElementById('his-ord-' + item.c13);
    if (elm.checked) {
      this.cancelMultiOrderList.push(item);
      if (this.totalCancelList === this.cancelMultiOrderList.length) {
        const elmm = document.getElementById('checkCancAll');
        if (elmm) elmm.checked = true;
      }
      this.setState({ ButtonCancAll: 'btn-wizard' });
      this.ButtonCancAll.disabled = false;
    } else {
      const index = this.cancelMultiOrderList.findIndex(temp => temp.c13 === item.c13);
      if (index >= 0) {
        this.cancelMultiOrderList.splice(index, 1);
        if (this.totalCancelList > this.cancelMultiOrderList.length) {
          const elmm = document.getElementById('checkCancAll');
          if (elmm) elmm.checked = false;
        }
        if (this.cancelMultiOrderList.length === 0) {
          this.ButtonCancAll.disabled = true;
          this.setState({ ButtonCancAll: '' });
        }
      }
    }
  }
  cancelMultiOrder = () => {
    this.confirmArr = [];
    this.resultMsgArr = [];
    const orderCheckNum = this.cancelMultiOrderList.length;
    if (orderCheckNum === 1) {
      this.openModifyOrder('CAL', this.cancelMultiOrderList[0]);
      return;
    }

    if (orderCheckNum > 20) {
      glb_sv.checkToast(toast, 'warn', this.props.t('you_are_only_allowed_to_cancel_up_to_20_orders'), 'cnlMul_max_20');
      return;
    }
    // this.orderCheckRcvNum = 0;
    if (orderCheckNum > 0) {
      let i = 0, find = 0;
      for (i = 0; i < orderCheckNum; i++) {
        // call cancel this order
        if (this.cancelMultiOrderList[i]['c7'] == 0) continue;
        let itemMsg = {};
        const caclOrdTxt = this.props.t('common_Cancel');
        const sellTxt = this.props.t('priceboard_sell');
        const buyTxt = this.props.t('priceboard_buy');
        const soHLTxt = this.props.t('order_number');
        const stkCd = this.props.t('hint_stock_search');
        itemMsg['msgCfm'] = caclOrdTxt + ' ' +
          (this.cancelMultiOrderList[i]['c2'] == '2' ? sellTxt : buyTxt) +
          ' ' + soHLTxt + ': ' + this.cancelMultiOrderList[i]['c13'] + ', ' + stkCd +
          ' ' + this.cancelMultiOrderList[i]['c4'];
        this.confirmArr.push(itemMsg);
        find = i;
      }
      if (this.orderCheckNum === 1) {
        this.openModifyOrder('CAL', this.cancelMultiOrderList[find]);
      } else {
        if (!glb_sv.checkOtp('openMultiModifyOrder')) return;
        this.openMultiModifyOrder();

      }
    }
  }

  openMultiModifyOrder() {
    this.setState({ confirmArrCancelOrd: this.confirmArr, cfm_multi_order_cal_confirm: true });
  }

  cancelMultiOrderCfm = (acntTp) => {
    if (this.cancMultiFlag) return;
    if (acntTp === 'N') {
      this.setState({ cfm_multi_order_cal_confirm: false });
      return;
    }
    const orderCheckNum = this.cancelMultiOrderList.length;
    this.orderCheckRcvNum = 0;
    if (orderCheckNum == 0) return;
    this.cancMultiFlag = true;
    this.setState({ cancMultiFlag: true, resultMsgArr: [] })
    let i = 0;
    for (i = 0; i < this.cancelMultiOrderList.length; i++) {
      if (this.cancelMultiOrderList[i]['c7'] == 0) continue;
      this.orderMod['hieuL'] = this.cancelMultiOrderList[i]['c13'];
      this.orderMod['hieuLG'] = this.cancelMultiOrderList[i]['c0'];
      this.orderMod['price'] = this.cancelMultiOrderList[i]['c6'];
      this.orderMod['qtyNotMth'] = this.cancelMultiOrderList[i]['c7'];
      this.orderMod['stkCd'] = this.cancelMultiOrderList[i]['c4'];
      this.orderMod['orderTp'] = this.cancelMultiOrderList[i]['c3'];
      this.orderMod['sellbuyTp'] = this.cancelMultiOrderList[i]['c2'];
      this.modTp = 'CAL';
      this.confirmCalOrder('Y');
    }
  }

  handleSelectTime = (timeQuery) => {
    if (timeQuery !== this.timeQuery) {
      glb_sv.localData.bottom_tab = 'order-list';
      this.timeQuery = timeQuery;
      this.gethistOrderList()
    }
  }

  handleSelectStatus = (status) => {
    if (status !== this.status) {
      this.status = status;
      glb_sv.localData.bottom_tab = 'order-list';
      this.setState({ filterWaitMatch: status === '3', filterMatched: status === '45' });
      if (this.histOrdListTemple.length === 0) return;
      this.filterData();
    }
  }

  handleSelectTypeBuysell = (typetp) => {
    if (typetp !== this.typetp) {
      this.typetp = typetp;
      if (this.histOrdListTemple.length === 0) return;
      this.filterData();
    }
  }

  handleSelectStkcd = (e) => {
    const stkCdQuery = e.target.value;
    this.stkCdQuery = stkCdQuery.toUpperCase();
    this.setState({ stkCdQuery: this.stkCdQuery });
    if (this.timeOutFilter) clearTimeout(this.timeOutFilter);
    this.timeOutFilter = setTimeout(() => this.filterData(), 100);
  }

  tongleFilterWaitMatch = (actTp) => {
    if (actTp === 1) {
      if (!this.state.filterWaitMatch) {
        this.handleSelectStatus('3');
      } else {
        this.handleSelectStatus('all');
      }
      this.setState({ filterWaitMatch: !this.state.filterWaitMatch, filterMatched: false });
    } else if (actTp === 2) {
      if (!this.state.filterMatched) {
        this.handleSelectStatus('45');
      } else {
        this.handleSelectStatus('all');
      }
      this.setState({ filterMatched: !this.state.filterMatched, filterWaitMatch: false });
    }
  }

  filterData() {
    let data, tempData = [], tempData2 = [];
    if (this.histOrdListTemple) {
      Object.assign(tempData, this.histOrdListTemple);
      Object.assign(tempData2, this.histOrdListTemple);
      const countWaitMatch = tempData.filter(item => item.c11 === '3').length;
      const countMatched = tempData.filter(item => (item.c11 === '4' || item.c11 === '5')).length;
      this.setState({ countWaitMatch, countMatched });
    }

    if (this.status === '3') data = this.histOrdListTemple.filter(item => item.c11 === '3')
    else if (this.status === '45') data = this.histOrdListTemple.filter(item => item.c11 === '4' || item.c11 === '5')
    else if (this.status === 'wait') data = this.histOrdListTemple.filter(item => item.c11 === '0')
    else if (this.status === 'all') data = Object.assign([], this.histOrdListTemple);

    if (this.typetp === 'sell') data = data.filter(item => item.c2 === '2')
    else if (this.typetp === 'buy') data = data.filter(item => item.c2 === '1')

    if (this.stkCdQuery !== '') {
      const stkCdQuery = this.stkCdQuery;
      data = filter(data, function (s) { return s.c4.indexOf(stkCdQuery) !== -1; })
    }
    this.setState({ data, refreshFlag: '' }, () => {
      this.gethistOrderlistFlag = false;
      const excelData = JSON.parse(JSON.stringify(data));
      this.importExcelData(excelData);
    });

    if (data !== []) {
      data.forEach(item => {
        if (Number(item.c7) !== 0 && item.c19 === this.formatDt(this.workDate)) {
          this.totalCancelList++;
        }
      })
    };
  }

  afterPopOverRender() {
    const { timeQuery, status, typetp } = this;
    setTimeout(() => {
      const elmInput = document.getElementById(timeQuery + '-option-time-orderlist');
      if (elmInput) elmInput.checked = true;
      const elmStatus = document.getElementById(status + '-option-status-orderlist');
      if (elmStatus) elmStatus.checked = true;
      const elmType = document.getElementById(typetp + '-option-type-orderlist');
      if (elmType) elmType.checked = true;
      else this.afterPopOverRender();
    }, 100);
  }

  changeTtt = () => {
    this.setState({ isOpenTooltip: true })
  }

  render() {
    const { t } = this.props;

    return (
      <div className='orderlist'>

        <div className='content-bot tableOrd'>
          <div className='icon-advance'>

            <Popover
              isOpen={this.state.isPopoverOpenMenu}
              position={'top'}
              onClickOutside={() => this.setState({ isPopoverOpenMenu: false })}
              content={({ position, targetRect, popoverRect }) => (
                <div className='popover-search'>
                  <OptionTable t={t} columnInfo={this.state.columnInfo} onColumnChange={this.handleColumnChange} />
                </div>
              )}
            >
              <span id='Tooltip_ordlist_option' className='left5' onClick={() => this.setState({ isPopoverOpenMenu: !this.state.isPopoverOpenMenu })}>
                <IconBullet />
              </span>
            </Popover>
            <UncontrolledTooltip delay={100} placement="top" target="Tooltip_ordlist_option" className='tooltip-custom'>
              {t('common_option_hide_column')}
            </UncontrolledTooltip>

            <CSVLink filename={t('order_list_history') + '.csv'} data={this.arrayExcel} headers={this.headersCSV} target="_blank" style={{ color: 'inherit' }}>
              <span className=" left5" id="Tooltip_csv" style={{ padding: 0, marginTop: 3 }}><IconExcel /></span>
            </CSVLink>
            <UncontrolledTooltip delay={100} placement="top" target="Tooltip_csv" className='tooltip-custom'>
              {t('common_ExportExcel')}
            </UncontrolledTooltip>

            <Popover
              isOpen={this.state.isPopoverOpenSelect}
              position={'top'}
              onClickOutside={() => this.setState({ isPopoverOpenSelect: false })}
              content={({ position, targetRect, popoverRect }) => (
                <div className='popover-search'>
                  {(glb_sv.activeCode === '028' || glb_sv.activeCode === '061' || glb_sv.activeCode === '888') && <>
                    <span className="m-b-20">{t('time')}</span>
                    <div className='row padding-top-5'>
                      <div className='col'>
                        <div className="no-padding input-group input-group-sm nsi_filter_dt">
                          <DatePicker id='orderBook_start_dt' popperPlacement='bottom' scrollableYearDropdown selected={this.state.nsi_start_dt} dateFormat="dd/MM/yyyy"
                            peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-center"
                            onChange={value => this.handleDateChange(1, value)} />
                        </div>
                      </div>
                    </div>
                    <div className='row padding-top-5 m-b-10'>
                      <div className='col'>
                        <div className="no-padding input-group input-group-sm nsi_filter_dt">
                          <DatePicker id='orderBook_end_dt' popperPlacement='bottom' scrollableYearDropdown selected={this.state.nsi_end_dt} dateFormat="dd/MM/yyyy"
                            peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-center"
                            onChange={value => this.handleDateChange(2, value)} />
                        </div>
                      </div>
                    </div></>}

                  {glb_sv.activeCode !== '028' && glb_sv.activeCode !== '061' && glb_sv.activeCode !== '888' && <div className='row padding-bottom-5'>
                    <div className='col popover-pagin' >
                      <TimeSelect handleSelectTime={this.handleSelectTime} t={t} nameInput='time-orderlist' />
                    </div>
                  </div>}
                  <div className='hr'></div>
                  <div className='row padding-top-5 padding-bottom-5'>
                    <div className='col'>
                      <Status handleSelectStatus={this.handleSelectStatus} t={t} nameInput='status-orderlist' />
                    </div>
                  </div>
                  <div className='hr'></div>
                  <div className='row padding-top-5 padding-bottom-5'>
                    <div className='col'>
                      <TypeBuySell handleSelectTypeBuysell={this.handleSelectTypeBuysell} t={t} nameInput='type-orderlist' />
                    </div>
                  </div>
                  <div className='hr'></div>
                  <div className='row padding-top-5 m-b-10'>
                    <div className='col'>
                      <span>{t('choose_symbol')}</span>
                      <div className="col no-padding input-group input-group-sm m-t-10">
                        <input className="form-control form-control-sm text-left" type='text' onChange={this.handleSelectStkcd} value={this.state.stkCdQuery}></input>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            >
              <span id='Tooltip_ordlist_time' data-tut='reactour__bottom_orderlist_search' className='left5' onClick={() => this.setState({ isPopoverOpenSelect: !this.state.isPopoverOpenSelect }, () => this.afterPopOverRender())}>
                <IconZoom />
              </span>
            </Popover>
            <UncontrolledTooltip delay={100} placement="top" target="Tooltip_ordlist_time" className='tooltip-custom'>
              {t('common_button_sumbit_select')}
            </UncontrolledTooltip>

            <span id='Tooltip_ordlist_Refresh' onClick={() => this.refeshData()} style={{ padding: 0, marginLeft: 5, color: 'inherit' }}
              className={'btn btn-link undecoration cursor_ponter ' + this.state.refreshFlag}><Reload /></span>
            <UncontrolledTooltip delay={100} placement="top" target="Tooltip_ordlist_Refresh" className='tooltip-custom'>
              {t('Refresh')}
            </UncontrolledTooltip>

            <button id="ButtonCancAll" ref={el => this.ButtonCancAll = el}
              className={"btn btn-xm btn-rounded " + this.state.ButtonCancAll} onClick={this.cancelMultiOrder}
              style={{ padding: '0 5px', fontWeight: 'bold', marginLeft: 8, width: 150 }}>
              {this.props.t('cancel_multiple_orders')}
            </button>

            <span className="checkbox_plcord">
              <input
                className="styled-checkbox"
                id={'store_order_ckbox'}
                type="checkbox"
                checked={this.state.filterWaitMatch}
                onChange={() => this.tongleFilterWaitMatch(1)}
              />
              <label className="checkbox-filter-order" htmlFor={'store_order_ckbox'} style={{ paddingTop: 'unset', fontWeight: 'normal', paddingRight: 5, color: '#9e9db6' }}>{t('wait_to_match')}</label>
            </span>
            <span style={{ color: '#9e9db6' }}>({this.state.countWaitMatch})</span>

            <span className="checkbox_plcord" >
              <input
                className="styled-checkbox"
                id={'store_order_ckbox2'}
                type="checkbox"
                checked={this.state.filterMatched}
                onChange={() => this.tongleFilterWaitMatch(2)}
              />
              <label className="checkbox-filter-order" htmlFor={'store_order_ckbox2'} style={{ paddingTop: 'unset', fontWeight: 'normal', paddingRight: 5, color: '#9e9db6' }}>{t('hist_ord_dt_matched')}</label>
            </span>
            <span style={{ color: '#9e9db6' }}>({this.state.countMatched})</span>
          </div>
          <TableData data={this.state.data} columns={this.state.columns} t={t} />
          <br />
        </div>

        {/* modal chinh sua lenh */}
        <Modal
          isOpen={this.state.cfm_order_mod}
          size={"md modal-notify"}
          onOpened={() => this.onOpenedModalcanclModOrd('mod')}
        >
          <ModalHeader>
            {t('info_mod_ord_cfm')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <label className="col-3 control-label no-padding-right marginAuto">{t('short_symbol')}</label>
              <div className="col-9">
                <span className="form-control form-control-sm text-center" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <strong>{this.state.orderMod['stkCd']}</strong>
                </span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-3 control-label no-padding-right marginAuto">{t('order_number')}</label>
              <div className="col-3">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['hieuL'], 0, 1)}</span>
              </div>
              <label className="col-3 control-label no-padding-right marginAuto">{t('origin_order_number')}</label>
              <div className="col-3">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['hieuLG'], 0, 1)}</span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-3 control-label no-padding-right marginAuto">{t('price_plc')}</label>
              <div className="col-3">
                <div className="input-group input-group-sm">
                  <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['price'], 0, 1)}</span>
                </div>
              </div>
              <label className="col-3 control-label no-padding-right marginAuto">{t('qty_wait_match')}</label>
              <div className="col-3">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['qtyNotMth'], 0, 1)}</span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-3 control-label no-padding-right marginAuto">{t('price_plc_mod')}
                <span className="mustInput">*</span>
              </label>
              <div className="col-3">
                <div className="input-group input-group-sm">
                  <input disabled={this.state.orderMod['orderTp'] !== '01'} onKeyDown={this.handleKeyPress} type="text" id="orderMod_priceMod" name="priceMod" onChange={(e) => this.onChangeOrderMod(e, 'price')}
                    value={this.state.orderMod['priceMod']} className="form-control form-control-sm text-right" autoComplete='false'
                  />
                </div>
              </div>
              <label className="col-3 control-label no-padding-right marginAuto">{t('qty_wait_match_mod')}
                <span className="mustInput">*</span>
              </label>
              <div className="col-3">
                <input type="text" id="orderMod_qtyMod" name="qtyMod" onKeyDown={this.handleKeyPress} value={this.state.orderMod['qtyMod']} onChange={(e) => this.onChangeOrderMod(e, 'qty')} className="form-control form-control-sm text-right"
                  autoComplete='false' />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    color="wizard"
                    onClick={(e) => this.confirmModOrder('Y')}>
                    <span>{t('confirm_mod')}</span>
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.confirmModOrder('N')}>
                    <span>{t('order_cancel')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* modal xác nhận chinh sua lenh */}
        <Modal
          isOpen={this.state.cfm_order_mod_confirm}
          size={"sm modal-notify"}
          // onClosed={}
          onOpened={() => this.onOpenedModalcanclModOrd('mod_cfm')}
        >
          <ModalHeader>
            {t('common_notify')}
          </ModalHeader>
          <ModalBody>
            {t('order_confirm_modify')} ?
              <br /> - {t('order_number')}: {this.state.orderMod['hieuL']}
            <br /> - {t('price_mod')}: {this.state.orderMod['priceMod']} VND
            <br /> - {t('qty_mod')}: {this.state.orderMod['qtyMod']}
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    color="wizard"
                    id='bt_msgBoxModifyCfmOk'
                    name='bt_msgBoxModifyCfmOk'
                    onKeyDown={this.handleKeyPress}
                    onClick={(e) => this.msgBoxModifyCfm('Y')}>
                    {this.state.sendcanlAdvOrderCfmFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.msgBoxModifyCfm('N')}>
                    <span>{t('common_No')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* modal huy lenh */}
        <Modal
          isOpen={this.state.cfm_order_cal_confirm}
          size={"md modal-notify"}
          onOpened={() => this.onOpenedModalcanclModOrd('cal')}
        >
          <ModalHeader>
            {t('info_cal_ord_cfm')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <label className="col-2 control-label no-padding-right marginAuto">{t('short_symbol')}</label>
              <div className="col-10">
                <span className="form-control form-control-sm text-center text-append" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <strong>{this.state.orderMod['stkCd']}</strong>
                </span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-2 control-label no-padding-right marginAuto">{t('order_number')}</label>
              <div className="col-3">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['hieuL'], 0, 1)}</span>
              </div>
              <label className="col-3 control-label no-padding-right marginAuto" style={{ marginLeft: '8.333333%' }}>{t('origin_order_number')}</label>
              <div className="col-3">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['hieuLG'], 0, 1)}</span>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-2 control-label no-padding-right marginAuto">{t('price_plc')}</label>
              <div className="col-3">
                <div className="input-group input-group-sm">
                  <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['price'], 0, 1)}</span>
                </div>
              </div>
              <label className="col-3 control-label no-padding-right marginAuto" style={{ marginLeft: '8.333333%' }}>{t('qty_wait_match')}</label>
              <div className="col-3">
                <span className="form-control form-control-sm text-right">{FormatNumber(this.state.orderMod['qtyNotMth'], 0, 1)}</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    color="wizard"
                    id='buttonCfmCalOrder'
                    name='buttonCfmCalOrder'
                    onKeyDown={this.handleKeyPress}
                    onClick={(e) => this.confirmCalOrder('Y')}>
                    {this.state.orderCanclFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('confirm_cal')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.confirmCalOrder('N')}>
                    <span>{t('order_cancel')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* modal huy nhieu lenh */}
        <Modal
          isOpen={this.state.cfm_multi_order_cal_confirm}
          size={"md modal-notify"}
          onOpened={() => this.onOpenedModalcanclModOrd('mul_cal')}
        >
          <ModalHeader>
            {t('info_cal_ord_cfm')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <label className="col-12 control-label no-padding-right marginAuto">{t('you_cancel_these_orders')}:</label>
            </div>
            <div className="form-group row">
              {this.state.confirmArrCancelOrd.map((item, index) =>
                <label key={'confirmArrCancelOrd' + index} className="col-12 control-label no-padding-right marginAuto text-left" style={{ marginLeft: 20 }}>
                  {item.msgCfm}
                </label>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    color="wizard"
                    id='buttonCfmMultiCalOrder'
                    name='buttonCfmMultiCalOrder'
                    onKeyDown={this.handleKeyPress}
                    onClick={(e) => this.cancelMultiOrderCfm('Y')}>
                    {this.state.cancMultiFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('confirm_cal')}</span>}
                  </Button>
                </div>
                <div className="col">
                  <Button size="sm" block
                    color="cancel"
                    onClick={(e) => this.cancelMultiOrderCfm('N')}>
                    <span>{t('order_cancel')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>

        {/* modal thong bao ket qua huy nhieu lenh */}
        <Modal
          isOpen={this.state.cfm_order_cal_result_multi}
          size={"md modal-notify"}
          onOpened={() => glb_sv.focusELM('buttonCfmMultiResultCalOrder')}
        >
          <ModalHeader>
            {t('bulk_cancellation_results')}
          </ModalHeader>
          <ModalBody>
            <div className="form-group row">
              <div className="col-12">
                <div className="darkgrayBg text-center msgInfo font_header" style={{ padding: 5 }}>
                  <span>{t('report_the_cancellation_result_in_bulk')}</span>
                </div>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-12 control-label no-padding-right marginAuto">{t('you_cancel_these_orders')}:</label>
            </div>
            <div className="form-group row">
              {this.state.resultMsgArr.map((item, index) =>
                <label key={'resultMsgArr' + index} className="col-12 control-label no-padding-right marginAuto text-left"
                  style={{ marginLeft: 20, whiteSpace: 'normal' }}>
                  {item}
                </label>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="container">
              <div className="row">
                <div className="col">
                  <Button size="sm" block
                    id='buttonCfmMultiResultCalOrder'
                    color="wizard"
                    onClick={(e) => this.setState({ cfm_order_cal_result_multi: false })}>
                    <span>{t('common_Close')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </Modal>


        {/* Chi tiết lệnh chi tiết */}
        <Modal
          isOpen={this.state.cfm_historderList_detail}
          size={"xl modal-notify"}
          onKeyDown={this.handleKeyPress}
          id='historderList_detail'
          tabIndex='0'
          onOpened={() => this.onOpenedModalcanclModOrd('hist')}
        >
          <ModalHeader toggle={(e) => this.setState({ cfm_historderList_detail: false })}>
            {t('origin_order_list_detail')}
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive datatable" style={{ height: 365, overflow: 'auto' }}>
              <table className="tableNormal table-sm tablenowrap table-bordered table-striped" style={{ width: '100%' }}>
                <thead className="header">
                  <tr>
                    <th className="text-center">
                      {/* {t('common_index')} */}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('time')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('order_number')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('exchanges_order_number')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('order_status')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('short_symbol')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('sell_buy_tp')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('order')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('price_plc')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('priceboard_matching_price')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('qty_wait_match')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('hist_ord_dt_match_volume')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('common_chanel')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('person_place_order')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('common_note')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.histOrdListDetailDataTable.map((item, index) =>
                    <tr key={index} className={"clickable " + this.state.ordListDataTableDetailMatch.length > 0 ? 'cursor_ponter' : ''} data-toggle="collapse" data-target="#group-of-rows-1" aria-expanded="false" aria-controls="group-of-rows-1">
                      {this.state.ordListDataTableDetailMatch.length > 0 ? <td className="text-center">
                        {/* {index + 1} */}
                        {this.state.ordListDataTableDetailMatch.length > 0 ? <i className="fa fa-plus" aria-hidden="true"></i> : ''}
                      </td> : <td></td>}
                      <td className="text-center">
                        {this.transTime(item['c1'])}
                      </td>
                      <td className="text-right">
                        {item['c0']}
                      </td>
                      <td></td>
                      <td>
                        <span>{t(this.transOrderStatus(item['c9']))}</span>
                      </td>
                      <td className="text-center">
                        {item['c4']}
                      </td>
                      <td className={item['c2'] === '2' ? 'sellColor' : 'buyColor'}>
                        {item['c19']}
                      </td>
                      <td>
                        {t(this.translateOrderTp(item['c3']))}
                      </td>
                      <td className="text-right">
                        {t(this.transOrdPrice(item.c3)) === '' ? FormatNumber(item.c6) : t(this.transOrdPrice(item.c3))}
                      </td>
                      <td></td>
                      <td className="text-right">
                        {FormatNumber(item['c7'], 0, 0)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item['c8'], 0, 0)}
                      </td>
                      <td>
                        {item['c20']}
                      </td>
                      <td>
                        {item['c15']}
                      </td>
                      <td>
                        {item['c16']}
                      </td>
                    </tr>
                  )}
                  {(this.state.histOrdListDetailDataTable.length === 0 || this.state.histOrdListDetailDataTable === undefined) && <tr>
                    <td colspan="14" className="text-center">
                      {t('common_NoDataFound')}!
                    </td>
                  </tr>}
                </tbody>
                <tbody id="group-of-rows-1" className="collapse">
                  {this.state.ordListDataTableDetailMatch.map((item, index) =>
                    <tr key={index}>
                      <td className="text-center">
                        {index + 1}
                      </td>
                      <td className="text-center">
                        {item['c1']}
                      </td>
                      <td></td>
                      <td>
                        <span>{item['c0']}</span>
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="text-right">
                        {FormatNumber(item['c4'], 0, 0)}
                      </td>
                      <td></td>
                      <td className="text-right">
                        {FormatNumber(item['c3'], 0, 0)}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ModalBody>
        </Modal>

        {/* Chi tiết lệnh theo số hiệu lệnh gốc */}
        <Modal
          isOpen={this.state.cfm_orderHist_detailMatch}
          size={"xl modal-notify"}
          id='modal_orderHist_detailMatch'
          onKeyDown={this.handleKeyPress}
          tabIndex='0'
          onOpened={() => this.onOpenedModalcanclModOrd('histMatch')}
        >
          <ModalHeader toggle={(e) => this.setState({ cfm_orderHist_detailMatch: false })}>
            {t('order_list_daily_detail')}
          </ModalHeader>
          <ModalBody>
            <div className="table-responsive datatable" style={{ height: 365, overflow: 'auto' }}>
              <table className="tableNormal table-sm tablenowrap table-bordered table-striped" style={{ width: '100%' }}>
                <thead className="header">
                  <tr>
                    <th className="text-center">{t('common_index')}</th>
                    <th className="text-center cursor_ponter">
                      {t('time')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('order_number')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('exchanges_order_number')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('short_symbol')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('priceboard_matching_price')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('priceboard_matching_quantity')}
                    </th>
                    <th className="text-center cursor_ponter">
                      {t('match_values')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.ordListDataTableDetailMatch.map((item, index) =>
                    <tr key={index}>
                      <td className="text-center">
                        {index + 1}
                      </td>
                      <td className="text-center">
                        {item['c1']}
                      </td>
                      <td className="text-right">
                        {item['c6']}
                      </td>
                      <td>
                        <span>{item['c0']}</span>
                      </td>
                      <td className="text-center">
                        {item['c2']}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item['c4'], 0, 0)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item['c3'], 0, 0)}
                      </td>
                      <td className="text-right">
                        {FormatNumber(item['c5'], 0, 0)}
                      </td>
                    </tr>
                  )}
                  {(this.state.ordListDataTableDetailMatch.length === 0 || this.state.ordListDataTableDetailMatch === undefined) && <tr>
                    <td colspan="8" className="text-center">
                      {t('common_NoDataFound')}!
                  </td>
                  </tr>}
                </tbody>
                <tfoot>
                  {(this.state.ordListDataTableDetailMatch.length > 0 && this.state.ordListDataTableDetailMatch !== undefined) && <tr className="row-for-sum">
                    <td colspan="6" className="text-center">{t('common_total')}</td>
                    <td className="text-right">{this.state.sumtable.c3}</td>
                    <td className="text-right">{this.state.sumtable.c5}</td>
                  </tr>}
                </tfoot>
              </table>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default translate('translations')(OrderList);    