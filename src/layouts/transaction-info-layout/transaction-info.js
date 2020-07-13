/* eslint-disable */
import React from 'react';
// import ReactDOM from 'react-dom';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';

import OptionTable from '../../conponents/optionTable/OptionTable';
import ReactTable from "react-table";
import { CSVLink } from "react-csv";
import { UncontrolledTooltip } from 'reactstrap';
import Popover from 'react-tiny-popover';
// import TimeSelect from '../div_bottom_elm/childs/time-select';
// import TypeSelect from '../div_bottom_elm/childs/type-select';
import { ReactComponent as Reload } from '../../conponents/translate/icon/reload-glyph-24.svg';
import { ReactComponent as IconExcel } from '../../conponents/translate/icon/excel.svg';
import { ReactComponent as IconBullet } from '../../conponents/translate/icon/bullet-list-70-glyph-24.svg';
// import { ReactComponent as IconZoom } from '../translate/icon/magnifier-zoom-in-glyph-24.svg';
import { translate } from 'react-i18next';
import DatePicker from 'react-datepicker';
import './index.scss';

import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import { inform_broadcast } from '../../utils/broadcast_service';
import SearchAccount from '../../conponents/search_account/SearchAccount';
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import functionList from '../../constants/functionList';


const remote = require('electron').remote;

class TransactionInfo extends React.Component {

    constructor(props) {
        super(props);

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
                //window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_ACT}_${this.component}`)
            })
        }

        this.state = {
            data: [],
            columns: this.columnsH,
            columnInfo: this.columnInfo,
            titleTable: '',
            heightScroll: 145,
            // from_date: new Date(),
            // to_date: new Date(),
            // styleTop: 'hidden',
            styleBot: '15px',
            transaction: {
                start_dt: null,
                end_dt: null,
                acntNo: '',
                transTp: '%'
            },
            gettransactionlistFlag: false,
            acntItems: [],
            arrayExcel: [],
            count: 0,
            isPopoverOpenSelect: false,
            isPopoverOpenMenu: false,
            refreshFlag: '',
            timeManual: true,
            nsi_start_dt: new Date(),
            nsi_end_dt: new Date(),
            tranStatus: '%',
            name: this.props.name,
            language: this.props.language,
            themePage: this.props.themePage,
            style: this.props.style,
        };
        this.handleColumnChange = this.handleColumnChange.bind(this);
        this.timeQuery = '1D';
    }

    popin_window() {
        const current_window = remote.getCurrentWindow();
        // const state = {parent_id: this.state.parent_id, config: this.state.config, name: this.state.name, component: this.state.component}
        window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
        current_window.close();
    }



    columnsH = [
        {
            Header: this.props.t("time"), accessor: "c0", show: true, headerClassName: 'text-center', className: 'text-center nowrap', width: 105,
            Cell: cellInfo => <span>{this.transDate(cellInfo.original.c0)}</span>
        },
        { Header: this.props.t("acnt_no"), accessor: "c2", show: true, width: 105, headerClassName: 'text-center', className: 'text-center' },
        { Header: this.props.t("sub_account"), accessor: "c3", show: true, width: 85, headerClassName: 'text-center', className: 'text-center' },

        { Header: this.props.t("transaction_type"), accessor: "c12", show: true, width: 315, headerClassName: 'text-' },
        {
            Header: this.props.t("short_symbol"), accessor: "c4", show: true, width: 70, headerClassName: 'text-center', className: 'text-center',
            Cell: cellInfo => <>{cellInfo.original.c4 === '' || cellInfo.original.c4 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c4}</span>}</>
        },
        {
            Header: "+/-", accessor: "c5", show: true, width: 35, headerClassName: 'text-center', className: 'text-center',
            Cell: cellInfo => <>{cellInfo.original.c5 === '' || cellInfo.original.c5 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c5}</span>}</>
        },
        {
            Header: this.props.t("qty"), accessor: "c6", show: true, width: 85, headerClassName: 'text-center', className: 'text-right',
            Cell: cellInfo => <span>{FormatNumber(cellInfo.original.c6, 0, 0)}</span>
        },
        {
            Header: this.props.t("common_values"), accessor: "c7", show: true, width: 85, headerClassName: 'text-center', className: 'text-right',
            Cell: cellInfo => <span>{FormatNumber(cellInfo.original.c7, 0, 0)}</span>
        },
        {
            Header: this.props.t("common_note"), accessor: "c8", show: true, width: 410, headerClassName: 'text-center', className: 'text-',
            Cell: cellInfo => <>{cellInfo.original.c8 === '' || cellInfo.original.c8 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c8}</span>}</>
        },
        { Header: this.props.t("common_chanel"), accessor: "c9", show: true, width: 200, headerClassName: 'text-center', className: 'text-' },
        { Header: this.props.t("common_work_user"), accessor: "c10", show: true, width: 131, headerClassName: 'text-center', className: 'text-left' },
        {
            Header: this.props.t("common_work_time"), accessor: "c11", show: true, width: 165, headerClassName: 'text-center', className: 'text-center',
            Cell: cellInfo => <span>{this.transDate(cellInfo.original.c11) + ' ' + this.transTime(cellInfo.original.c11)}</span>
        },
    ]

    columnInfo = [
        { key: "c0_hist", value: true, disable: false, name: "transaction_date" },
        { key: "c2_hist", value: false, disable: false, name: "acnt_no" },
        { key: "c3_hist", value: true, disable: false, name: "sub_account" },
        { key: "c12_hist", value: true, disable: false, name: "transaction_type" },
        { key: "c4_hist", value: true, disable: false, name: "short_symbol" },
        { key: "c5_hist", value: true, disable: false, name: "+/-" },
        { key: "c6_hist", value: true, disable: false, name: "qty" },
        { key: "c7_hist", value: true, disable: false, name: "common_values" },
        { key: "c8_hist", value: true, disable: false, name: "common_note" },
        { key: "c9_hist", value: false, disable: false, name: "common_chanel" },
        { key: "c10_hist", value: false, disable: false, name: "common_work_user" },
        { key: "c11_hist", value: true, disable: false, name: "common_work_time" }
    ]

    // -- get order list on day
    transListTemple = [];
    gettransList_FunctNm = 'TOP_TRANSACSCR_001';
    gettransListFunct_ReqTimeOut;
    nsi_start_dt = new Date();
    nsi_end_dt = new Date();
    // -- get transtype list
    transTps = [];
    transTmp = [];
    gettranstypeListFlag = false;
    gettranstypeList_FunctNm = 'TOP_TRANSACSCR_002';
    gettranstypeListFunct_ReqTimeOut;


    componentWillMount() {
        const arrayTitle = this.state.columns.map(item => this.transTitle(item));
        this.setState({ arrayTitle: arrayTitle });
    
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
          // update state after popout window
            agrs.state.nsi_start_dt = new Date(agrs.state.nsi_start_dt)
            agrs.state.nsi_end_dt = new Date(agrs.state.nsi_end_dt)

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
            agrs.state.nsi_start_dt = new Date(agrs.state.nsi_start_dt)
            agrs.state.nsi_end_dt = new Date(agrs.state.nsi_end_dt)
            this.setState(agrs.state)
        })
    
    
    
      }

    componentDidMount() {
        this.transaction = this.state.transaction;
        this.workDateObj = new Date()
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['objShareGlb', 'localData'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const objShareGlb = agrs.get('objShareGlb')
            const localData = agrs.get('localData')

            //-- add date for inputting manual
            const workDt = objShareGlb['workDate'];
            let firstDt = new Date();
            let todayDt = new Date();
            if (workDt)  {
                firstDt = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, 1);
                todayDt = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)));
            }
            this.setState({ nsi_start_dt: firstDt, nsi_end_dt: todayDt });
            this.nsi_start_dt = firstDt;
            this.nsi_end_dt = todayDt;
            //-- end to add for inputting manual
            if (this.props.node) this.loadData()

            if (localData.columnsHis) {
                this.columnInfo = localData.columnsHis;
                this.setState({ columnInfo: this.columnInfo });
                this.columnInfo.map(item => {
                    if (item.value === false) {
                        const key = item.key.split('_')[0];
                        const updateColumn = this.columnsH.find(o => o.accessor === key);
                        updateColumn.show = false;
                    }
                });
            } else if (this.state.columnInfo) {
                this.state.columnInfo.map(item => {
                    if (item.value === false) {
                        const key = item.key.split('_')[0];
                        const updateColumn = this.columnsH.find(o => o.accessor === key);
                        updateColumn.show = false;
                    }
                }
                )
            }
            this.setState({ columns: [...this.columnsH] });

            window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, agrs) => {
                const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
                inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
            })

            window.ipcRenderer.on(`${commuChanel.ACTION_SUCCUSS}_${this.component}`, (event, msg) => {
                if (msg.data === 'history-list') {
                    setTimeout(() =>
                        this.gettransList()
                        , 1000);
                }
            })

            window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, msg) => {
                change_language(agrs, this.props)
                // glb_sv.language = agrs
                this.setState({ language: agrs })
                const columns = [
                    {
                        Header: this.props.t("time"), accessor: "c0", show: true, headerClassName: 'text-center', className: 'text-center nowrap', width: 105,
                        Cell: cellInfo => <span>{this.transDate(cellInfo.original.c0)}</span>
                    },
                    { Header: this.props.t("acnt_no"), accessor: "c2", show: true, width: 105, headerClassName: 'text-center', className: 'text-center' },
                    { Header: this.props.t("sub_account"), accessor: "c3", show: true, width: 85, headerClassName: 'text-center', className: 'text-center' },

                    { Header: this.props.t("transaction_type"), accessor: "c12", show: true, width: 315, headerClassName: 'text-' },
                    {
                        Header: this.props.t("short_symbol"), accessor: "c4", show: true, width: 70, headerClassName: 'text-center', className: 'text-center',
                        Cell: cellInfo => <>{cellInfo.original.c4 === '' || cellInfo.original.c4 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c4}</span>}</>
                    },
                    {
                        Header: "+/-", accessor: "c5", show: true, width: 35, headerClassName: 'text-center', className: 'text-center',
                        Cell: cellInfo => <>{cellInfo.original.c5 === '' || cellInfo.original.c5 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c5}</span>}</>
                    },
                    {
                        Header: this.props.t("qty"), accessor: "c6", show: true, width: 85, headerClassName: 'text-center', className: 'text-right',
                        Cell: cellInfo => <span>{FormatNumber(cellInfo.original.c6, 0, 0)}</span>
                    },
                    {
                        Header: this.props.t("common_values"), accessor: "c7", show: true, width: 85, headerClassName: 'text-center', className: 'text-right',
                        Cell: cellInfo => <span>{FormatNumber(cellInfo.original.c7, 0, 0)}</span>
                    },
                    {
                        Header: this.props.t("common_note"), accessor: "c8", show: true, width: 410, headerClassName: 'text-center', className: 'text-',
                        Cell: cellInfo => <>{cellInfo.original.c8 === '' || cellInfo.original.c8 === ' ' ? <span>&nbsp;</span> : <span>{cellInfo.original.c8}</span>}</>
                    },
                    { Header: this.props.t("common_chanel"), accessor: "c9", show: true, width: 200, headerClassName: 'text-center', className: 'text-' },
                    { Header: this.props.t("common_work_user"), accessor: "c10", show: true, width: 131, headerClassName: 'text-center', className: 'text-left' },
                    {
                        Header: this.props.t("common_work_time"), accessor: "c11", show: true, width: 165, headerClassName: 'text-center', className: 'text-center',
                        Cell: cellInfo => <span>{this.transDate(cellInfo.original.c11) + ' ' + this.transTime(cellInfo.original.c11)}</span>
                    },
                ];

                columns.forEach(item => {
                    this.columnsH.forEach(temp => {
                        if (item.accessor && item.accessor === temp.accessor) item.show = temp.show;
                    })
                })
                this.columnsH = columns;
                this.setState({ columns });
            })

            window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
                change_theme(agrs)
                // glb_sv.themePage = agrs
                this.setState({ themePage: agrs })
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
            
        })
        
       
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        if (this.gettransListFunct_ReqTimeOut) { clearTimeout(this.gettransListFunct_ReqTimeOut); }
        if (this.gettranstypeListFunct_ReqTimeOut) { clearTimeout(this.gettranstypeListFunct_ReqTimeOut); }
        
    }

    loadData() {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const objShareGlb = agrs.get('objShareGlb')
            const activeAcnt = agrs.get('activeAcnt')

            const workDt = objShareGlb['workDate'];
            if (workDt != null && workDt.length === 8) {
                this.workDateObj = new Date(Number(workDt.substr(0, 4)), Number(workDt.substr(4, 2)) - 1, Number(workDt.substr(6, 2)));
            } else this.workDateObj = new Date();
            this.acntItems = objShareGlb['acntNoListAll'];
            this.setState({
                acntItems: this.acntItems
            })
            let acntStr = '';
            if (activeAcnt && activeAcnt !== '') {
                acntStr = activeAcnt;
            } else {
                acntStr = this.acntItems[0]['id'];
            }
            this.transaction['acntNo'] = acntStr;
            this.transaction['transTp'] = '%';
            this.setState(prevState => ({
                transaction: {
                    ...prevState.transaction,
                    transTp: this.transaction['transTp'],
                    acntNo: this.transaction['acntNo']
                }
            }))
            const pieacnt = acntStr.split('.');
            this.actn_curr = pieacnt[0];
            this.sub_curr = pieacnt[1];
            this.gettransList();
        })
        
    }

    changTransTp = (e) => {
        const value = e.target.value;
        this.transaction['transTp'] = value;
        this.setState(prevState => ({
            transaction: {
                ...prevState.transaction,
                transTp: this.transaction['transTp']
            }
        }))
    }

    solvingtransaction_TimeOut = (cltSeq) => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
        const reqIfMap = this.req_component.get(cltSeq);
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
        const timeResult = new Date();
        reqIfMap.resTime = timeResult;
        reqIfMap.procStat = 4;
        this.req_component.set(cltSeq, reqIfMap);
        if (reqIfMap.reqFunct === this.gettransList_FunctNm) {
            this.setState({ gettransactionlistFlag: false, refreshFlag: '' });
        } else if (reqIfMap.reqFunct === this.gettranstypeList_FunctNm) {
            this.gettranstypeListFlag = false;
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning');
    }

    gettransList = () => {
        if (this.state.gettransactionlistFlag) { return; }
       
        if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) { return; }
        const from_date = new Date(this.workDateObj.getTime());
        from_date.setDate(from_date.getDate() - parseInt(this.timeQuery));

        if (!this.state.timeManual) {
            this.transaction['start_dt'] = { year: from_date.getFullYear(), month: from_date.getMonth() + 1, day: from_date.getDate() };
        } else {
            this.transaction['start_dt'] = { year: this.nsi_start_dt.getFullYear(), month: this.nsi_start_dt.getMonth() + 1, day: this.nsi_start_dt.getDate() };
        }

        // this.transaction['start_dt'] = { year: from_date.getFullYear(), month: from_date.getMonth() + 1, day: from_date.getDate() };
        const start_dtOld = this.transaction['start_dt'];
        let day = start_dtOld['day'] + '';
        let month = start_dtOld['month'] + '';
        let year = start_dtOld['year'];

        const pad = '00';
        day = pad.substring(0, pad.length - day.length) + day;
        month = pad.substring(0, pad.length - month.length) + month;
        const start_dt = year + month + day;

        if (!this.state.timeManual) {
            this.transaction['end_dt'] = { year: this.workDateObj.getFullYear(), month: this.workDateObj.getMonth() + 1, day: this.workDateObj.getDate() };
        } else {
            this.transaction['end_dt'] = { year: this.nsi_end_dt.getFullYear(), month: this.nsi_end_dt.getMonth() + 1, day: this.nsi_end_dt.getDate() };
        }
        // this.transaction['end_dt'] = { year: this.workDateObj.getFullYear(), month: this.workDateObj.getMonth() + 1, day: this.workDateObj.getDate() };
        const end_dtOld = this.transaction['end_dt'];
        day = end_dtOld['day'] + '';
        month = end_dtOld['month'] + '';
        year = end_dtOld['year'];

        day = pad.substring(0, pad.length - day.length) + day;
        month = pad.substring(0, pad.length - month.length) + month;
        const end_dt = year + month + day;

        let transTp = this.transaction['transTp'];
        if (transTp == null || transTp === '') { transTp = '%'; }
        this.setState({ gettransactionlistFlag: true })
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_gettransList
        const reqInfo = new requestInfo();
        reqInfo.reqFunct = this.gettransList_FunctNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_gettransList
        // -- service info
        let svInputPrm = new serviceInputPrm();
        svInputPrm.WorkerName = 'ALTqTransaction';
        svInputPrm.ServiceName = 'ALTqTransaction_OnlineTrans_1';
        svInputPrm.ClientSentTime = '0';
        svInputPrm.Operation = 'Q';
        svInputPrm.InVal = [start_dt, end_dt, this.actn_curr, this.sub_curr, transTp];
        svInputPrm.TotInVal = svInputPrm.InVal.length;
        this.gettransListFunct_ReqTimeOut = setTimeout(this.solvingtransaction_TimeOut,
            functionList.reqTimeout, request_seq_comp);
        reqInfo.inputParam = svInputPrm.InVal;
        this.transListTemple = [];
        this.setState({ data: [], refreshFlag: 'fa-spin' });
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

    handle_gettransList = (reqInfoMap, message) => {
        clearTimeout(this.gettransListFunct_ReqTimeOut);
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            this.setState({ gettransactionlistFlag: false })
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code']); }
            this.setState({ refreshFlag: '' });
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
            this.setState({ gettransactionlistFlag: false, refreshFlag: '' })
            this.transListTemple = this.transListTemple.concat(jsondata);

            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2;
                this.arrayExcel = JSON.parse(JSON.stringify(this.transListTemple));
                this.arrayExcel.map(item => {
                    item.c3 = '\'' + item.c3;
                    item.c0 = this.transDate(item.c0);
                    item.c11 = this.transDate(item.c11) + ' ' + this.transTime(item.c11);
                });
                if (this.transListTemple !== []) {
                    this.transListTemple = this.transListTemple.map(item => {
                        item.c6 = Number(item.c6);
                        item.c7 = Number(item.c7);
                        return item;
                    });
                }
                this.setState({ data: [...this.transListTemple], arrayExcel: this.arrayExcel });
            }
        }
    }

    handle_gettranstypeList = (reqInfoMap, message) => {
        clearTimeout(this.gettranstypeListFunct_ReqTimeOut);
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            this.gettranstypeListFlag = false;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, message['Code']); }
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
            this.transTmp = this.transTmp.concat(jsondata);
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2;
                this.gettranstypeListFlag = false;
                this.transTps = this.transTmp;
            }
        }
    }

    gettranstypeList = () => {
        if (this.gettranstypeListFlag) { return; }
        this.gettranstypeListFlag = true;

        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_gettranstypeList
        const reqInfo = new requestInfo();
        reqInfo.reqFunct = this.gettranstypeList_FunctNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_gettranstypeList
        // -- service info
        let svInputPrm = new serviceInputPrm();
        svInputPrm.WorkerName = 'ALTqTransaction';
        svInputPrm.ServiceName = 'ALTqTransaction_Common';
        svInputPrm.ClientSentTime = '0';
        svInputPrm.Operation = 'Q';
        svInputPrm.InVal = ['02', 'trs_tp', '%'];
        svInputPrm.TotInVal = svInputPrm.InVal.length;
        socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
        this.gettranstypeListFunct_ReqTimeOut = setTimeout(this.solvingtransaction_TimeOut,
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

    updateTable = () => {
        const timeout = setInterval(() => {
            if (this.state.columnInfo) {
                this.state.columnInfo.map(item => {
                    if (item.value === false) {
                        const updateColumn = this.columnsH.find(o => o.accessor === item.name);
                        if (updateColumn) updateColumn.show = false;
                    }
                })
                clearInterval(timeout);
                this.setState({ columns: this.columnsH });
            }
        }, 100);
    }

    handleColumnChange(name, key, value) {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'localData', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, localData) => {
            const id = key.split('_')[0];
            const updateColumn = this.columnsH.find(o => o.accessor === id);
            if (updateColumn) updateColumn.show = value;
            this.setState({
                columns: [...this.columnsH]
            });
    
            const updateColumnInfo = this.columnInfo.find(o => o.key === key);
            if (updateColumnInfo) updateColumnInfo.value = value;
            // glb_sv.localData.columnsHis = this.columnInfo;
            update_value_for_glb_sv( {component: component, key: ['localData', 'columnsHis'], value: this.columnInfo})
            if (typeof (Storage) !== 'undefined') {
                localStorage.setItem('stateMainPage', JSON.stringify(localData));
            }
        })
        
    }

    refeshData = () => {
        // console.log('refeshData');
        this.gettransList();
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
    transDate = (value) => {
        if (value === '' || value == null) return value;
        const day = value.substr(0, 2);
        const month = value.substr(2, 2);
        const year = value.substr(4, 4);
        return (day + '/' + month + '/' + year);
    }
    transTime = (value) => {
        if (value === '' || value == null) return value;
        const day = value.substr(8, 2);
        const month = value.substr(10, 2);
        const year = value.substr(12, 2);
        return (day + ':' + month + ':' + year);
    }

    transTitle(item) {
        return { Header: this.props.t(item.Header), accessor: item.accessor, show: item.show, headerClassName: item.headerClassName, className: item.className, Cell: item.Cell, width: item.width };
    }
    headersCSV = [
        { label: this.props.t('acnt_no'), key: "c2" },
        { label: this.props.t('sub_account'), key: "c3" },
        { label: this.props.t('transaction_date'), key: "c0" },
        { label: this.props.t('transaction_type'), key: "c12" },
        { label: this.props.t('symbol'), key: "c4" },
        { label: this.props.t('+/-'), key: "c5" },
        { label: this.props.t('qty'), key: "c6" },
        { label: this.props.t('common_values'), key: "c7" },
        { label: this.props.t('common_note'), key: "c8" },
        { label: this.props.t('common_chanel'), key: "c9" },
        { label: this.props.t('common_work_user'), key: "c10" },
        { label: this.props.t('common_work_time'), key: "c11" }
    ];
    


    afterPopOverRender() {
        if (this.state.timeManual) {
        this.openFilterNew();
        } else {
        this.openFilterOld();
        }
    }

    openFilterOld() {
        const timeQuery = this.timeQuery;
        const typeQuery = this.transaction['transTp'];
        setTimeout(() => {
            const elmInputTime = document.getElementById(timeQuery + '-option-time-transactioninfo');
            const elmInputType = document.getElementById(typeQuery + '-option-type-transactioninfo');
            if (elmInputTime && elmInputType) {
                elmInputTime.checked = true;
                elmInputType.checked = true;
            } else this.afterPopOverRender();
        }, 100);
    }

    openFilterNew() {
        const typeQuery = this.transaction['transTp'];
        setTimeout(() => {
            const elmInputType = document.getElementById(typeQuery + '-option-type-transactioninfo');
            if (elmInputType) {
                elmInputType.checked = true;
            } else this.afterPopOverRender();
        }, 100);
    }

    handleSelectTime = (timeQuery) => {
        if (timeQuery !== this.timeQuery) {
            this.timeQuery = timeQuery;
            update_value_for_glb_sv( {component: component, key: ['localData', 'bottom_tab'], value: 'history-list'})
            this.gettransList();
        }
    }
    handleSelectType = (type) => {
        if (type !== this.transaction['transTp']) {

            update_value_for_glb_sv( {component: component, key: ['localData', 'bottom_tab'], value: 'history-list'})
            this.transaction['transTp'] = type;
            this.gettransList();
        }
    }

    //-- Add new date for inputting manual
    handleDateChange = (actTp, value) => {
        if (actTp === 1) {
            this.nsi_start_dt = value;
            this.setState({nsi_start_dt: value});
        } else {
            this.nsi_end_dt = value;
            this.setState({nsi_end_dt: value});
        }

        setTimeout(() => {
            this.gettransList()
        }, 1000);
    }
    handleOptionChange = (changeEvent) => {
        this.setState({tranStatus: changeEvent.target.value})
        this.transaction['transTp'] = changeEvent.target.value
        this.gettransList()
    }

    handleChangeAccount = ({value, label}) => {
        // value: 888c000350.00
        // label: 888c000350.00 - Tạ Ngoc My
        this.activeAcnt = value; 
        const pieces = value.split('.');
        this.actn_curr = pieces[0];
        this.sub_curr = pieces[1].substr(0, 2);
        this.gettransList()
        
      }

    render() {
        // const styleButton = { display: 'inline-block', width: 25 };
        const { t } = this.props;
        // const height = this.calHeight();
        return (
            <div className='TransactionInfo__layout'>
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
                <div className="card">
                    <div className="card-body" style={{padding: 5}}>
                        <div className='content-bot tableOrd'>
                            <div id='icon_transactioninfo' className='icon-advance'>
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
                                    <span id='Tooltip_hislist_option' className='left5' onClick={() => this.setState({ isPopoverOpenMenu: !this.state.isPopoverOpenMenu }, () => this.afterPopOverRender())}>
                                        <span className="colorOption"><IconBullet /></span>
                                    </span>
                                </Popover>
                                <UncontrolledTooltip placement="top" target="Tooltip_hislist_option" className='tooltip-custom'>
                                    {t('common_option_hide_column')}
                                </UncontrolledTooltip>

                                <CSVLink filename={t('transaction_list') + '.csv'} data={this.state.arrayExcel} headers={this.headersCSV} target="_blank" style={{ color: 'inherit' }}>
                                    <span id='Tooltip_history_csv' className="left5" placement="top" style={{ padding: 0, marginTop: 3 }}><IconExcel /></span>
                                </CSVLink>
                                <UncontrolledTooltip placement="top" target="Tooltip_history_csv" className='tooltip-custom'>
                                    {t('common_ExportExcel')}
                                </UncontrolledTooltip>

                                {/* <Popover
                                    isOpen={this.state.isPopoverOpenSelect}
                                    position={'top'}
                                    onClickOutside={() => this.setState({ isPopoverOpenSelect: false })}
                                    content={({ position, targetRect, popoverRect }) => (
                                        <div className='popover-search'>
                                            {!this.state.timeManual && <div className='row padding-bottom-15'>
                                                <div className='col popover-pagin'>
                                                    <TimeSelect handleSelectTime={this.handleSelectTime} t={t} nameInput='time-transactioninfo' />
                                                </div>
                                            </div>}
                                            <div className='row padding-top-15'>
                                                <div className='col'>
                                                    <TypeSelect name='history-list' handleSelectType={this.handleSelectType} t={t} nameInput='type-transactioninfo' />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                >
                                    <span id='Tooltip_hislist_time' className='left5' onClick={() => this.setState({ isPopoverOpenSelect: !this.state.isPopoverOpenSelect }, () => this.afterPopOverRender())}>
                                        <IconZoom />
                                    </span>
                                </Popover>
                                <UncontrolledTooltip placement="top" target="Tooltip_hislist_time" className='tooltip-custom'>
                                    {t('common_button_sumbit_select')}
                                </UncontrolledTooltip> */}

                                {/* set select time over out */}
                                {this.state.timeManual && <>
                                <div className="mr-2 ml-2" style={{display: "inline-block", position: "relative"}}>
                                    <input type="radio" id='choose_choose_all_kind' name='choose_all_kind'
                                        value={'%'} checked={this.state.tranStatus == '%'} onChange={this.handleOptionChange} />
                                    <label htmlFor='choose_choose_all_kind'>{t('choose_all_kind')}</label>
                                    <div className="check"></div>
                                </div>
                                <div className="mr-2 ml-2" style={{display: "inline-block", position: "relative"}}>
                                    <input type="radio" id='choose_transaction_stock' name='transaction_stock' 
                                        value={'1'} checked={this.state.tranStatus == '1'} onChange={this.handleOptionChange} />
                                    <label htmlFor='choose_transaction_stock'>{t('transaction_stock')}</label>
                                    <div className="check"></div>
                                </div>
                                <div className="mr-2 ml-2" style={{display: "inline-block", position: "relative"}}>
                                    <input type="radio" id='choose_transaction_cash' name='transaction_cash'
                                        value={'2'} checked={this.state.tranStatus == '2'} onChange={this.handleOptionChange} />
                                    <label htmlFor='choose_transaction_cash'>{t('transaction_cash')}</label>
                                    <div className="check"></div>
                                </div>
                                <div className="mr-2 ml-2" style={{width: "120px", display: "inline-block", position: "relative"}}>
                                    <DatePicker id='transaction_start_dt' popperPlacement='bottom' scrollableYearDropdown selected={this.state.nsi_start_dt} dateFormat="dd/MM/yyyy"
                                    peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-center"
                                    onChange={value => this.handleDateChange(1, value)} />
                                </div>
                                <div className="mr-2 ml-2" style={{width: "120px", display: "inline-block", position: "relative"}}>
                                    <DatePicker id='transaction_end_dt' popperPlacement='bottom' scrollableYearDropdown selected={this.state.nsi_end_dt} dateFormat="dd/MM/yyyy"
                                    peekNextMonth showMonthDropdown showYearDropdown className="form-control form-control-sm text-center"
                                    onChange={value => this.handleDateChange(2, value)} />
                                </div>
                                </>}

                                <span id='Tooltip_hislist_Refresh' onClick={() => this.refeshData()} style={{ padding: 0, marginLeft: 5, color: 'inherit' }}
                                    className={'btn btn-link undecoration cursor_ponter ' + this.state.refreshFlag}><Reload /></span>
                                <UncontrolledTooltip placement="top" target="Tooltip_hislist_Refresh" className='tooltip-custom'>
                                    {t('Refresh')}
                                </UncontrolledTooltip>
                            </div>
                            <ReactTable
                                data={this.state.data}
                                columns={this.state.columns}
                                pageSize={this.state.data.length < 15 ? 15 : this.state.data.length}
                                showPagination={false}
                                style={{
                                  height: 400,
                                  top: 5,
                                }}
                                NoDataComponent={() => {
                                    return <div className="rt-noData hideClass">{this.props.t('common_NoDataFound')}</div>
                                }}
                                className="-striped -highlight"
                            />
                            <br />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default translate('translations')(TransactionInfo);