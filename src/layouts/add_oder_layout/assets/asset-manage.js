import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../../utils/globalSv/service/global_service';
import socket_sv from '../../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../../conponents/formatNumber/FormatNumber';

import { Modal, ModalHeader, ModalBody, Tooltip } from 'reactstrap'
import DATA from './data.json'
import _ from 'lodash'
import { CSVLink } from 'react-csv'
import { ReactComponent as IconExcel } from '../../../conponents/translate/icon/excel.svg';
import commuChanel from '../../../constants/commChanel'
import { change_theme } from '../../../utils/change_theme';
import { change_language } from '../../../utils/change_language';
import { reply_send_req } from '../../../utils/send_req'
import { bf_popout } from '../../../utils/bf_popout'
import { inform_broadcast } from '../../../utils/broadcast_service';

const remote = require('electron').remote;

class AssetManage extends PureComponent {
    constructor(props) {
        super(props)
        this.get_rq_seq_comp = this.props.get_rq_seq_comp
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = this.props.get_rq_seq_comp
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
            })
        }

        this.state = {
            asInf: {},
            assetInfo_acntNo: '',
            isShow: true,
            acntItems: [],
            from_date: new Date(),
            to_date: new Date(),
            selectedStkName: null,
            stkList: [],
            stkName: '',
            data_own: DATA,
            data_invest: DATA,
            columns_own: this.columns_own,
            columns_invest: this.columns_invest,
            activeCode: glb_sv.activeCode,
            total_own: {
                c16: 0,
                c18: 0,
                c19: 0,
            },
            total_invest: {
                c5: 0,
                c7: 0,
                c8: 0,
                c9: 0,
                c11: 0,
                c21: 0,
                c22: 0,
                c15: 0,
                c18: 0,
                c19: 0,
                c20: 0,
            },
            iconUP: '',
            iconDOWN: 'none',
            tooltipOpen_csv1: false,
            tooltipOpen_csv2: false,
            tooltipOpen_portfolio_info: false,
            dataExcel_own: [],
            dataExcel_invest: [],
            portfolioDetailDataTable: [],
            sumtable: {},
            isChangeTheme: true,
            subChoose: true,
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

    asInf = {}
    getassetTotalInfoFlag = false
    getassetTotalInfo_FunctNm = 'ASSETMNGERSCR_001'

    // -- get stock list
    assetStockInfoListTemple = []
    getassetStockInfoListFlag = false
    getassetStockInfoList_FunctNm = 'ASSETMNGERSCR_002'

    // -- get Invest Portfolio
    queryPortfo = {}
    portfolioListTemple = []
    getPortfolioListFlag = false
    getPortfolioList_FunctNm = 'ASSETMNGERSCR_003'
    // -- get Invest Portfolio detail
    portfolioDetailTemple = []
    getPortfolioDetailFlag = false
    getPortfolioDetail_FunctNm = 'ASSETMNGERSCR_004'
    getPortfolioDetailFunct_ReqTimeOut
    total_own = {}
    total_invest = {}
    tableShow = false
    dataExcel = []
    title_own = [
        'acnt_no',
        'sub_account',
        'short_symbol',
        'own_qty',
        'quantity_trading',
        'quantity_wait_trading',
        'quantity_in_custody',
        'quantity_blockade',
        this.props.t('common_sell') + ' - T0',
        this.props.t('common_sell') + ' - T1',
        this.props.t('common_sell') + ' - T2',
        this.props.t('common_buy') + ' - T0',
        this.props.t('common_buy') + ' - T1',
        this.props.t('common_buy') + ' - T2',
        'quantity_right_wait_settlement',
        'market_price',
        'market_value',
        'buy_average_price',
        'buy_average_value',
        'profit_loss_value',
        'profit_loss_ratio',
    ]
    title_invest = [
        'calculator_date',
        'sub_account',
        'short_symbol',
        'buy_average_price',
        'buy_average_value',
        'profit_loss_ratio',
        'profit_loss_value',
        'own_qty',
        'increase_quantity',
        'value_of_capital',
        'decrease_quantity',
        'value_of_cash_right',
        'quantity_of_stock_right',
        'accumulated_capital_value_excluding_rights',
        'value_of_stock_right',
        'quantity_of_current_stock',
        'market_price',
        'market_value',
        'previous_transaction_date',
        'selling_value_on_the_property_value',
        'profit_loss_value_sell_on_day',
        'profit_loss_value_buy_on_day',
        'total_profit_loss_value_on_day',
    ]

    flagSortOwn = {}
    flagSortInvest = {}

    componentWillMount() {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            // update state after popout window

            agrs.state.from_date = new Date(agrs.state.from_date)
            agrs.state.to_date = new Date(agrs.state.to_date)

            this.setState(agrs.state)
            this.setState({
                parent_id: agrs.parent_id,
                config: agrs.config,
            })
            change_theme(agrs.state.themePage)
            change_language(agrs.state.language, this.props)
            this.assetInfo_acntNo = agrs.state.assetInfo_acntNo

        })

        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // update state after popin window
            agrs.state.from_date = new Date(agrs.state.from_date)
            agrs.state.to_date = new Date(agrs.state.to_date)
            this.setState(agrs.state)

        })
    }

    componentDidMount() {
        this.assetInfo_acntNo = this.state.assetInfo_acntNo;
        this.loadData();

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
            if (this.state.cfm_portfolio_detail) this.setState({ cfm_portfolio_detail: false });
            else {
                const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component };
                // glb_sv.commonEvent.next(msg);
                inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
            }
        })

        window.ipcRenderer.on(`${commuChanel.getStockListChangeLang}_${this.component}`, (event, msg) => {
            const sq = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, mrk_StkList) => {
                this.setState({ stkList: mrk_StkList })

            })
        })

        // this.fixLeftSticky(1)
        // this.fixLeftSticky(2)
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.activeAcnt !== this.props.activeAcnt) {
            this.activeAcnt = newProps.activeAcnt;
            const pieces = newProps.activeAcnt.split('.');
            this.actn_curr = pieces[0];
            this.sub_curr = pieces[1].substr(0, 2);
            this.refeshClick();
        }
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)

        this.request_seq_comp = 0
        // if (this.subcr_ClientReqRcv) {
        //     this.subcr_ClientReqRcv.unsubscribe()
        // }
        if (this.getassetTotalInfoFunct_ReqTimeOut) {
            clearTimeout(this.getassetTotalInfoFunct_ReqTimeOut)
        }
        if (this.getassetStockInfoListFunct_ReqTimeOut) {
            clearTimeout(this.getassetStockInfoListFunct_ReqTimeOut)
        }
        if (this.getPortfolioListFunct_ReqTimeOut) {
            clearTimeout(this.getPortfolioListFunct_ReqTimeOut)
        }
        if (this.getPortfolioDetailFunct_ReqTimeOut) {
            clearTimeout(this.getPortfolioDetailFunct_ReqTimeOut)
        }
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    }

    loadData() {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['activeAcnt', 'objShareGlb', 'mrk_StkList'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const objShareGlb = agrs.get('objShareGlb')
            const mrk_StkList = agrs.get('mrk_StkList')
            const activeAcnt = agrs.get('activeAcnt')
            this.setState({ stkList: mrk_StkList })
            // update session for popout windows
            glb_sv.objShareGlb = objShareGlb

            this.acntItems = objShareGlb['acntNoListAll']
            let acntStr = ''
            if (activeAcnt !== null && activeAcnt !== undefined && activeAcnt !== '' &&
                activeAcnt.substr(11) !== '%') {
                acntStr = activeAcnt
            } else {
                const acntMain = objShareGlb['AcntMain'] + '.00'
                const arrAct = this.acntItems.filter(item => {
                    return item['id'] === acntMain
                })
                acntStr = arrAct[0]['id']
            }
            this.assetInfo_acntNo = acntStr
            this.setState({ assetInfo_acntNo: acntStr })
            const pieacnt = acntStr.split('.')
            this.actn_curr = pieacnt[0]
            this.sub_curr = pieacnt[1]

            const workDt = objShareGlb['workDate']
            if (workDt != null && workDt.length === 8) {
                const now = new Date(
                    Number(workDt.substr(0, 4)),
                    Number(workDt.substr(4, 2)) - 1,
                    Number(workDt.substr(6, 2))
                )
                this.setState({ from_date: now, to_date: now })
            }
            // this.stk_list = mrkInfo['mrk_StkList'];
            this.stkList = mrk_StkList
            this.getassetStockInfoList()
            this.getassetTotalInfo()
            this.getPortfolioList()

        })
    }

    getassetStockInfoList = () => {
        if (this.getassetStockInfoListFlag) {
            return
        }
        if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) {
            return
        }

        this.getassetStockInfoListFlag = true
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getassetStockInfoList_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getassetStockInfoList_ResultProc
        // -- service info
        let svInputPrm = new serviceInputPrm();
        svInputPrm.WorkerName = 'ALTqAsset'
        svInputPrm.ServiceName = 'ALTqAsset_1801_1'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['02', this.actn_curr, this.state.subChoose ? this.sub_curr : '%']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getassetStockInfoListFunct_ReqTimeOut = setTimeout(
            this.solvingassetManage_TimeOut,
            glb_sv.reqTimeout,
            request_seq_comp
        )
        reqInfo.inputParam = svInputPrm.InVal

        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })
        this.assetStockInfoListTemple = []
        this.setState({ data_own: [], total_own: {} })
    }
    // --- get stock list function resolve results
    getassetStockInfoList_ResultProc = (reqInfoMap, message) => {
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getassetStockInfoListFlag = false
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal(
                    '',
                    'common_InfoMessage',
                    message['Message'],
                    '',
                    'danger',
                    '',
                    false,
                    message['Code']
                )
            }
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                jsondata = []
            }

            this.assetStockInfoListTemple = this.assetStockInfoListTemple.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getassetStockInfoListFlag = false
                const total_own = {}
                if (
                    this.assetStockInfoListTemple.length > 0 &&
                    this.assetStockInfoListTemple !== undefined &&
                    this.assetStockInfoListTemple !== null
                ) {
                    total_own.c16 = FormatNumber(_.sum(_.map(this.assetStockInfoListTemple, d => Number(d.c16))))
                    total_own.c18 = FormatNumber(_.sum(_.map(this.assetStockInfoListTemple, d => Number(d.c18))))
                    total_own.c18Nf = _.sum(_.map(this.assetStockInfoListTemple, d => Number(d.c18)))
                    total_own.c19 = _.sum(_.map(this.assetStockInfoListTemple, d => Number(d.c19)))
                    this.dataExcel = JSON.parse(JSON.stringify(this.assetStockInfoListTemple))
                    this.dataExcel.map(item => {
                        item.c1 = "'" + item.c1
                    })
                    this.setState({ total_own, dataExcel_own: this.dataExcel })
                    this.assetStockInfoListTemple = this.assetStockInfoListTemple.map((item, index) => {
                        item.c00 = index + 1
                        for (let i = 3; i < 21; i++) {
                            item['c' + i] = Number(item['c' + i])
                        }
                        return item
                    })
                }
                this.setState(
                    { data_own: JSON.parse(JSON.stringify(this.assetStockInfoListTemple)) },
                    // this.fixLeftSticky(1)
                )
            }
        }
    }
    ///////////////////////////////////////////////////////////
    // --- get asset total info
    getassetTotalInfo = () => {
        if (this.getassetTotalInfoFlag) {
            return
        }
        this.getassetTotalInfoFlag = true
        // -- call service for place order
        // const clientSeq = socket_sv.getRqSeq()
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getassetTotalInfo_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getassetTotalInfo_ResultProc

        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqAsset'
        svInputPrm.ServiceName = 'ALTqAsset_1801_1'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['01', this.actn_curr, this.state.subChoose ? this.sub_curr : '%']
        // svInputPrm.InVal = ['01', this.actn_curr, this.sub_curr]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getassetTotalInfoFunct_ReqTimeOut = setTimeout(
            this.solvingassetManage_TimeOut,
            glb_sv.reqTimeout,
            request_seq_comp
        )
        reqInfo.inputParam = svInputPrm.InVal
        this.req_component.set(request_seq_comp, reqInfo)

        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })
    }
    // --- get asset total info handle results
    getassetTotalInfo_ResultProc = (reqInfoMap, message) => {
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        this.getassetTotalInfoFlag = false
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal(
                    '',
                    'common_InfoMessage',
                    message['Message'],
                    '',
                    'danger',
                    '',
                    false,
                    message['Code']
                )
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
                this.asInf = jsondata[0]

                this.setState({ asInf: this.asInf })
            } catch (err) {
                // glb_sv.logMessage(err);
                jsondata = []
            }
        }
    }
    //////////////////////////////////////////////////////////////
    // --- get Portfolio list
    getPortfolioList = () => {
        if (this.getPortfolioListFlag) {
            return
        }
        // if (!socket_sv.getSocketStat(socket_sv.key_ClientReq)) {
        //     const ermsg = 'Can_not_connected_to_server_plz_check_your_network'
        //     glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning')
        //     return
        // }
        if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) {
            return
        }

        this.queryPortfo['start_dt'] = {
            year: this.state.from_date.getFullYear(),
            month: this.state.from_date.getMonth() + 1,
            day: this.state.from_date.getDate(),
        }
        const start_dtOld = this.queryPortfo['start_dt']
        if (start_dtOld === null || start_dtOld === undefined || start_dtOld === '') {
            const ermsg = 'common_plz_input_from_date'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'queryPortfo_start_dt')
            return
        }
        let day = start_dtOld['day'] + ''
        let month = start_dtOld['month'] + ''
        let year = start_dtOld['year']
        if (
            day === null ||
            day === undefined ||
            day === '' ||
            month === null ||
            month === undefined ||
            month === '' ||
            year === null ||
            year === undefined ||
            year === ''
        ) {
            const ermsg = 'common_plz_input_from_date'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'queryPortfo_start_dt')
            return
        }

        const pad = '00'
        day = pad.substring(0, pad.length - day.length) + day
        month = pad.substring(0, pad.length - month.length) + month
        const start_dt = year + month + day

        this.queryPortfo['end_dt'] = {
            year: this.state.to_date.getFullYear(),
            month: this.state.to_date.getMonth() + 1,
            day: this.state.to_date.getDate(),
        }
        const end_dtOld = this.queryPortfo['end_dt']
        if (end_dtOld === null || end_dtOld === undefined || end_dtOld === '') {
            const ermsg = 'common_plz_input_to_date'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'queryPortfo_end_dt')
            return
        }
        day = end_dtOld['day'] + ''
        month = end_dtOld['month'] + ''
        year = end_dtOld['year']
        if (
            day === null ||
            day === undefined ||
            day === '' ||
            month === null ||
            month === undefined ||
            month === '' ||
            year === null ||
            year === undefined ||
            year === ''
        ) {
            const ermsg = 'common_plz_input_to_date'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'queryPortfo_end_dt')
            return
        }

        day = pad.substring(0, pad.length - day.length) + day
        month = pad.substring(0, pad.length - month.length) + month
        const end_dt = year + month + day

        if (Number(end_dt) < Number(start_dt)) {
            const ermsg = 'common_start_dt_cant_over_end_dt'
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', 'queryPortfo_end_dt')
            return
        }
        let acnt_stat = this.queryPortfo['action_stat']
        if (acnt_stat === null || acnt_stat === undefined || acnt_stat === '') {
            acnt_stat = '%'
        }
        let stkCd = this.queryPortfo['stkCd']
        if (stkCd === null || stkCd === undefined) {
            stkCd = '%'
        } else {
            stkCd = stkCd.substr(4)
        }
        this.getPortfolioListFlag = true
        this.setState({ getPortfolioListFlag: true })
        // const clientSeq = socket_sv.getRqSeq()
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getPortfolioList_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getPortfolioList_ResultProc

        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqAsset'
        svInputPrm.ServiceName = 'ALTqAsset_1801_2'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['1', start_dt, end_dt, this.actn_curr, this.state.subChoose ? this.sub_curr : '%', stkCd]
        // svInputPrm.InVal = ['1', start_dt, end_dt, this.actn_curr, this.sub_curr, stkCd]
        svInputPrm.TotInVal = svInputPrm.InVal.length

        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getPortfolioListFunct_ReqTimeOut = setTimeout(
            this.solvingassetManage_TimeOut,
            glb_sv.reqTimeout,
            request_seq_comp
        )
        reqInfo.inputParam = svInputPrm.InVal
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })

        this.portfolioListTemple = []
        this.setState({ data_invest: [] })
    }
    // --- get Portfolio list handle results
    getPortfolioList_ResultProc = (reqInfoMap, message) => {
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getPortfolioListFlag = false
            this.setState({ getPortfolioListFlag: false })
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal(
                    '',
                    'common_InfoMessage',
                    message['Message'],
                    '',
                    'danger',
                    '',
                    false,
                    message['Code']
                )
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                // glb_sv.logMessage(err);
                jsondata = []
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            this.portfolioListTemple = this.portfolioListTemple.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getPortfolioListFlag = false
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                const total_invest = {}
                if (
                    this.portfolioListTemple.length > 0 &&
                    this.portfolioListTemple !== undefined &&
                    this.portfolioListTemple !== null
                ) {
                    total_invest.c5 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c5)))
                    total_invest.c7 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c7)))
                    total_invest.c8 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c8)))
                    total_invest.c9 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c9)))
                    total_invest.c11 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c11)))
                    total_invest.c14 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c14)))
                    total_invest.c15 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c15)))
                    total_invest.c18 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c18)))
                    total_invest.c19 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c19)))
                    total_invest.c20 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c20)))
                    total_invest.c21 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c21)))
                    total_invest.c22 = _.sum(_.map(this.portfolioListTemple, d => Number(d.c22)))
                    this.dataExcel = JSON.parse(JSON.stringify(this.portfolioListTemple))
                    this.dataExcel.map(item => {
                        item.c0 = item.c0.substr(0, 2) + '/' + item.c0.substr(2, 2) + '/' + item.c0.substr(4)
                        item.c2 = "'" + item.c2
                        item.c23 = item.c23 + ' %'
                    })
                    this.setState({ total_invest: { ...total_invest }, dataExcel_invest: this.dataExcel })
                } else {
                    total_invest.c5 = 0
                    total_invest.c7 = 0
                    total_invest.c8 = 0
                    total_invest.c9 = 0
                    total_invest.c11 = 0
                    total_invest.c14 = 0
                    total_invest.c15 = 0
                    total_invest.c18 = 0
                    total_invest.c19 = 0
                    total_invest.c20 = 0
                    total_invest.c21 = 0
                    total_invest.c22 = 0
                    this.dataExcel = []
                    this.setState({ total_invest: total_invest, dataExcel_invest: this.dataExcel })
                }
                this.portfolioListTemple = this.portfolioListTemple.map(item => {
                    item.c23 = item.c23.slice(0, 1) === '.' ? Number('0' + item.c23) : Number(item.c23)
                    for (let i = 4; i < 23; i++) {
                        item['c' + i] = Number(item['c' + i])
                    }
                    return item
                })

                this.setState({
                    getPortfolioListFlag: false,
                    data_invest: JSON.parse(JSON.stringify(this.portfolioListTemple)),
                })
                // this.fixLeftSticky(2)
            }
        }
    }
    /////////////////////////////////////////////////////////////
    // --- get PortfolioDetail 
    openInvestDeatailModal = item => {
        if (this.getPortfolioDetailFlag) {
            return
        }
        if (item === null || item === undefined) {
            return
        }

        this.setState({ cfm_portfolio_detail: true })
        if (this.actn_curr === null || this.actn_curr === undefined || this.actn_curr.length === 0) {
            return
        }

        let procDt = item['c0'],
            stkCd = item['c3'],
            acnt_no = item['c1'],
            sub_no = item['c2']
        procDt = procDt.substr(4, 4) + procDt.substr(2, 2) + procDt.substr(0, 2)

        this.getPortfolioDetailFlag = true
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getPortfolioDetail_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getPortfolioDetail_ResultProc

        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTqAsset'
        svInputPrm.ServiceName = 'ALTqAsset_1801_2'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['2', procDt, acnt_no, sub_no, stkCd]
        svInputPrm.TotInVal = svInputPrm.InVal.length

        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getPortfolioDetailFunct_ReqTimeOut = setTimeout(
            this.solvingassetManage_TimeOut,
            glb_sv.reqTimeout,
            request_seq_comp
        )
        reqInfo.inputParam = svInputPrm.InVal

        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        this.portfolioDetailTemple = []
    }
    // --- get PortfolioDetail handle result
    getPortfolioDetail_ResultProc = (reqInfoMap, message) => {
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getPortfolioDetailFlag = false
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal(
                    '',
                    'common_InfoMessage',
                    message['Message'],
                    '',
                    'danger',
                    '',
                    false,
                    message['Code']
                )
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                // glb_sv.logMessage(err);
                jsondata = []
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            this.portfolioDetailTemple = this.portfolioDetailTemple.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                const sum_table = {}
                sum_table.c7 = FormatNumber(_.sum(_.map(this.portfolioDetailTemple, d => Number(d.c7))), 0, 0)
                sum_table.c8 = FormatNumber(_.sum(_.map(this.portfolioDetailTemple, d => Number(d.c8))), 0, 0)
                sum_table.c9 = FormatNumber(_.sum(_.map(this.portfolioDetailTemple, d => Number(d.c9))), 0, 0)
                sum_table.c10 = FormatNumber(_.sum(_.map(this.portfolioDetailTemple, d => Number(d.c10))), 0, 0)
                sum_table.c11 = FormatNumber(_.sum(_.map(this.portfolioDetailTemple, d => Number(d.c11))), 0, 0)
                reqInfoMap.procStat = 2
                this.getPortfolioDetailFlag = false
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                this.setState({ portfolioDetailDataTable: this.portfolioDetailTemple, sumtable: sum_table })
            }
        }
    }
    ///////////////////////////////////////////////////////////////////

    refeshClick = () => {
        this.getassetTotalInfo()
        this.getassetStockInfoList()
    }

    solvingassetManage_TimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        const reqIfMap = this.req_component.get(cltSeq);
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        this.req_component.set(cltSeq, reqIfMap);
        console.log('solvingassetManage_TimeOut', reqIfMap.reqFunct)
        if (reqIfMap.reqFunct === this.getassetStockInfoList_FunctNm) {
            this.getassetStockInfoListFlag = false
        } else if (reqIfMap.reqFunct === this.getassetTotalInfo_FunctNm) {
            this.getassetTotalInfoFlag = false
        } else if (reqIfMap.reqFunct === this.getPortfolioList_FunctNm) {
            this.getPortfolioListFlag = false
            this.setState({ getPortfolioListFlag: false })
        } else if (reqIfMap.reqFunct === this.getPortfolioDetailFunct_ReqTimeOut) {
            this.getPortfolioDetailFlag = false
        }
        // glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning')
    }

    selectedStk = selected => {
        const value = selected.label
        const stks = selected.value
        const isStk = glb_sv.recentStkList.findIndex(item => item === stks)
        if (isStk < 0) glb_sv.recentStkList.push(stks)
        if (glb_sv.recentStkList.length > 10) glb_sv.recentStkList.shift()
        localStorage.setItem('recentStkList', JSON.stringify(glb_sv.recentStkList))

        this.setState({ selectedStkName: selected })
        if (value != null) {
            this.stkName = value
            const pieces = value.split('-')
            if (pieces[1].trim() === 'UPC') {
                pieces[1] = 'HNX'
            }
            if (pieces[1].trim() === 'HOSE') {
                pieces[1] = 'HSX'
            }
            const stkId = pieces[1].trim() + '_' + pieces[0].trim()
            this.queryPortfo['stkCd'] = stkId
        }
    }

    getPriceOrder = (sbTp, price, stk_cd) => {
        const message = {}
        message['type'] = 'ORDER'
        message['data'] = sbTp + '|' + price + '|' + stk_cd
        glb_sv.commonEvent.next(message);
    }

    transNO = (value, key) => {
        if (key === 1) {
            for (var item in value) {
                value[item] = this.transNO(value[item])
            }
            return value
        } else return FormatNumber(value)
    }

    transTime = value => {
        if (String(value).length > 8) return value
        const day = value.substr(0, 2)
        const month = value.substr(2, 2)
        const year = value.substr(4, 4)
        return day + '/' + month + '/' + year
    }

    toggle = (key) => {
        if (key === 1) {
            this.setState({
                tooltipOpen_portfolio_info: !this.state.tooltipOpen_portfolio_info,
            })
        } else if (key === 2) {
            this.setState({
                tooltipOpen_csv1: !this.state.tooltipOpen_csv1,
            })
        } else if (key === 3) {
            this.setState({
                tooltipOpen_csv2: !this.state.tooltipOpen_csv2,
            })
        }
    }

    headersCSV_own = [
        { label: this.props.t('acnt_no'), key: 'c0' },
        { label: this.props.t('sub_account'), key: 'c1' },
        { label: this.props.t('symbol'), key: 'c2' },
        { label: this.props.t('own_qty'), key: 'c3' },
        { label: this.props.t('quantity_trading'), key: 'c4' },
        { label: this.props.t('quantity_wait_trading'), key: 'c5' },
        { label: this.props.t('quantity_in_custody'), key: 'c6' },
        { label: this.props.t('quantity_blockade'), key: 'c7' },
        { label: this.props.t('common_sell') + ' - T0', key: 'c8' },
        { label: this.props.t('common_sell') + ' - T1', key: 'c9' },
        { label: this.props.t('common_sell') + ' - T2', key: 'c10' },
        { label: this.props.t('common_buy') + ' - T0', key: 'c11' },
        { label: this.props.t('common_buy') + ' - T1', key: 'c12' },
        { label: this.props.t('common_buy') + ' - T2', key: 'c13' },
        { label: this.props.t('quantity_right_wait_settlement'), key: 'c14' },
        { label: this.props.t('market_price'), key: 'c15' },
        { label: this.props.t('market_value'), key: 'c16' },
        { label: this.props.t('buy_average_price'), key: 'c17' },
        { label: this.props.t('buy_average_value'), key: 'c18' },
        { label: this.props.t('profit_loss_ratio'), key: 'c20' },
        { label: this.props.t('profit_loss_value'), key: 'c19' },
    ]

    headersCSV_invest = [
        { label: this.props.t('transaction_date'), key: 'c0' },
        { label: this.props.t('acnt_no'), key: 'c1' },
        { label: this.props.t('sub_account'), key: 'c2' },
        { label: this.props.t('symbol'), key: 'c3' },
        { label: this.props.t('own_qty'), key: 'c4' },
        { label: this.props.t('increase_quantity'), key: 'c5' },
        { label: this.props.t('value_of_capital'), key: 'c6' },
        { label: this.props.t('decrease_quantity'), key: 'c7' },
        { label: this.props.t('value_of_cash_right'), key: 'c8' },
        { label: this.props.t('quantity_of_stock_right'), key: 'c9' },
        { label: this.props.t('accumulated_capital_value_excluding_rights'), key: 'c10' },
        { label: this.props.t('value_of_stock_right'), key: 'c11' },
        { label: this.props.t('quantity_of_current_stock'), key: 'c12' },
        { label: this.props.t('market_price'), key: 'c13' },
        { label: this.props.t('market_value'), key: 'c14' },
        { label: this.props.t('profit_loss_value'), key: 'c15' },
        { label: this.props.t('previous_transaction_date'), key: 'c16' },
        { label: this.props.t('selling_value_on_the_property_value'), key: 'c17' },
        { label: this.props.t('profit_loss_value_sell_on_day'), key: 'c18' },
        { label: this.props.t('profit_loss_value_buy_on_day'), key: 'c19' },
        { label: this.props.t('total_profit_loss_value_on_day'), key: 'c20' },
        { label: this.props.t('buy_average_price'), key: 'c21' },
        { label: this.props.t('buy_average_value'), key: 'c22' },
        { label: this.props.t('profit_loss_ratio'), key: 'c23' },
    ]

    handleFocus = e => {
        setTimeout(() => {
            const elm = document.getElementById('dateAstMng1')
            if (elm) elm.focus()
        })
    }

    getColumnWidth = (rows, accessor, headerText) => {
        const maxWidth = 1000
        const magicSpacing = 6
        const cellLength = Math.max(...rows.map(row => (`${row[accessor]}` || '').length), headerText.length)
        // console.log(headerText,Math.min(maxWidth, cellLength * magicSpacing));
        return Math.min(maxWidth, cellLength * magicSpacing + 25)
    }

    sortTable = (key, table) => {
        if (table === 'own') {
            if (this.flagSortOwn[key]) {
                this.flagSortOwn[key] = false
                const sorted = _.orderBy(this.state.data_own, [key], ['asc'])
                this.setState({ data_own: sorted })
            } else {
                this.flagSortOwn[key] = true
                const sorted = _.orderBy(this.state.data_own, [key], ['desc'])
                this.setState({ data_own: sorted })
            }
        } else if (table === 'invest') {
            if (this.flagSortInvest[key]) {
                this.flagSortInvest[key] = false
                const sorted = _.orderBy(this.state.data_invest, [key], ['asc'])
                this.setState({ data_invest: sorted })
            } else {
                this.flagSortInvest[key] = true
                const sorted = _.orderBy(this.state.data_invest, [key], ['desc'])
                this.setState({ data_invest: sorted })
            }
        }
    }

    fixLeftSticky = (actTp) => {
        if (actTp === 1) {
            const col1 = document.getElementById('headerCol1')
            if (!col1) {
                return
            }
            const value = Math.floor(col1.offsetWidth) - 1
            let css =
                '.table_sticky_own tbody td:nth-child(2),.table_sticky_own thead tr:first-child th:nth-child(2) { left: ' +
                value +
                'px}'
            let style = document.createElement('style')

            if (style.styleSheet) {
                style.styleSheet.cssText = css
            } else {
                style.appendChild(document.createTextNode(css))
            }
            document.getElementsByTagName('head')[0].appendChild(style)
        } else {
            const col1 = document.getElementById('fix-first-col')
            if (!col1) {
                return
            }
            const value = Math.floor(col1.offsetWidth) - 1
            let css =
                '.table_sticky_invest thead tr:first-child th:nth-child(2), .table_sticky_invest tbody td:nth-child(2) { left: ' +
                value +
                'px}'
            let style = document.createElement('style')

            if (style.styleSheet) {
                style.styleSheet.cssText = css
            } else {
                style.appendChild(document.createTextNode(css))
            }
            document.getElementsByTagName('head')[0].appendChild(style)
        }
    }

    render() {
        const { t } = this.props
        const asInf = this.transNO(this.state.asInf, 1)
        return (
            <div className="AssetManage__layout">
                <div className="width-assets">
                    <div className="card asset asset-margin">
                        <div className="card-body flex" style={{ padding: 0, overflow: 'auto' }}>

                            <div className="card card-outline-default" style={{ minWidth: 1165 }}>
                                <div className="card-body" style={{ borderBottom: 0, paddingBottom: 0 }}>
                                    <div className="form-horizontal row" noValidate>
                                        <div className="col-3">
                                            <div
                                                className="form-group row col-12 form-title"
                                                style={{ marginLeft: 0 }}
                                            >
                                                {t('monetary_assets')}
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('cash_info')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c2']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('cash_in_custody')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c3']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('cash_blockade')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c4']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('guarantee_cash')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c6']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('guarantee_cash_use')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c7']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {glb_sv.activeCode != '028' && (
                                                <div className="form-group row">
                                                    <label className="col-6 control-label no-padding-right">
                                                        {t('cash_right_wait')}
                                                    </label>
                                                    <div className="col-6">
                                                        <div className="input-group input-group-sm">
                                                            <span className="form-control form-control-sm text-right">
                                                                {asInf['c9']}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('cash_available')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c5']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('cash_sale_available')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c8']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-3">
                                            <div
                                                className="form-group row col-12 form-title"
                                                style={{ marginLeft: 0 }}
                                            >
                                                {t('stock_assets')}
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('market_value')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c10']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('right_value')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c11']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-3">
                                            <div
                                                className="form-group row col-12 form-title"
                                                style={{ marginLeft: 0 }}
                                            >
                                                {t('sb_debit_info')}
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('pia_loan_current')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c18']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('pia_loan_fee')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c19']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('margin_debt')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c16']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    {t('margin_debt_fee')}
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c17']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-3">
                                            <div
                                                className="form-group row col-12 form-title"
                                                style={{ marginLeft: 0 }}
                                            >
                                                {t('info_total_assets_total_debt')}
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    <u>
                                                        <strong>{t('total_assets')}</strong>
                                                    </u>
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c23']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-6 control-label no-padding-right">
                                                    <u>
                                                        <strong>{t('really_assets')}</strong>
                                                    </u>
                                                </label>
                                                <div className="col-6">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {asInf['c24']}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table danh sách CK sở hữu */}
                            <div className="card card-outline-default" style={{ marginBottom: 0 }}>
                                <div className="card-body" style={{ borderTop: 0 }}>
                                    <div className="card-title" style={{ minWidth: 400 }}>
                                        {t('stock_ownership_details')} - {t('acnt_no')}:{' '}
                                        {this.state.assetInfo_acntNo.substr(0, 10)}
                                        <button
                                            className="btn btn-sm btn-link undecoration excel_button_blue"
                                            style={{ marginLeft: 5 }}
                                        >
                                            <CSVLink
                                                filename={t('stock_ownership_details') + '.csv'}
                                                data={this.state.dataExcel_own}
                                                headers={this.headersCSV_own}
                                                target="_blank"
                                            >
                                                <span id="Tooltip_csv1" style={{ padding: 0, marginBottom: 5 }}>
                                                    <IconExcel />
                                                </span>
                                            </CSVLink>
                                        </button>
                                        <Tooltip
                                            placement="top"
                                            isOpen={this.state.tooltipOpen_csv1}
                                            target="Tooltip_csv1"
                                            toggle={() => this.toggle(2)}
                                        >
                                            {t('common_ExportExcel')}
                                        </Tooltip>{' '}
                                    </div>
                                    <div
                                        className="table-responsive datatable"
                                        style={{ display: this.state.iconUP }}
                                    >
                                        <table className="table_sticky_own tableNormal table table-sm tablenowrap table-bordered table-striped">
                                            <thead className="header">
                                                <tr>
                                                    <th
                                                        id="headerCol1"
                                                        rowSpan={2}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center"
                                                    >
                                                        {t('sub_account')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c2', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('short_symbol')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c3', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('own_qty')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c4', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('quantity_trading')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c5', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('quantity_wait_trading')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c6', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('quantity_in_custody')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c7', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('quantity_blockade')}
                                                    </th>
                                                    <th
                                                        colSpan={3}
                                                        style={{ whiteSpace: 'nowrap' }}
                                                        className="text-center"
                                                    >
                                                        {t('quantity_sale_wait_settlement')}
                                                    </th>
                                                    <th
                                                        colSpan={3}
                                                        style={{ whiteSpace: 'nowrap' }}
                                                        className="text-center"
                                                    >
                                                        {t('quantity_buy_wait_settlement')}
                                                    </th>
                                                    {glb_sv.activeCode != '028' && (
                                                        <th
                                                            rowSpan={2}
                                                            onClick={() => this.sortTable('c14', 'own')}
                                                            style={{ verticalAlign: 'middle' }}
                                                            className="text-center cursor_ponter"
                                                        >
                                                            {t('quantity_right_wait_settlement')}
                                                        </th>
                                                    )}
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c15', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('market_price')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c16', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('market_value')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c17', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('buy_average_price')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c18', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('buy_average_value')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c20', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('profit_loss_ratio')}
                                                    </th>
                                                    <th
                                                        rowSpan={2}
                                                        onClick={() => this.sortTable('c19', 'own')}
                                                        style={{ verticalAlign: 'middle' }}
                                                        className="text-center cursor_ponter"
                                                    >
                                                        {t('profit_loss_value')}
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th
                                                        className="text-center cursor_ponter"
                                                        onClick={() => this.sortTable('c8', 'own')}
                                                    >
                                                        T0
                                                            </th>
                                                    <th
                                                        className="text-center cursor_ponter"
                                                        onClick={() => this.sortTable('c9', 'own')}
                                                    >
                                                        T1
                                                            </th>
                                                    <th
                                                        className="text-center cursor_ponter"
                                                        onClick={() => this.sortTable('c10', 'own')}
                                                    >
                                                        T2
                                                            </th>
                                                    <th
                                                        className="text-center cursor_ponter"
                                                        onClick={() => this.sortTable('c11', 'own')}
                                                    >
                                                        T0
                                                            </th>
                                                    <th
                                                        className="text-center cursor_ponter"
                                                        onClick={() => this.sortTable('c12', 'own')}
                                                    >
                                                        T1
                                                            </th>
                                                    <th
                                                        className="text-center cursor_ponter"
                                                        onClick={() => this.sortTable('c13', 'own')}
                                                    >
                                                        T2
                                                            </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.data_own.map(item => (
                                                    <tr key={_.uniqueId('dataOwn')}>
                                                        <td className="text-center fix">{item['c1']}</td>
                                                        <td
                                                            className="text-center cursor_ponter fix"
                                                            onDoubleClick={() =>
                                                                this.getPriceOrder('2', 0, item['c2'])
                                                            }
                                                            title={t('priceboard_doublcik_to_sell_this_stk')}
                                                        >
                                                            <span
                                                                className={
                                                                    Number(item.c19) < 0
                                                                        ? 'price_basic_less'
                                                                        : Number(item.c19) > 0
                                                                            ? 'price_basic_over'
                                                                            : ''
                                                                }
                                                            >
                                                                {item['c2']}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">{FormatNumber(item['c3'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c4'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c5'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c6'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c7'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c8'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c9'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c10'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c11'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c12'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c13'])}</td>
                                                        {glb_sv.activeCode != '028' && (
                                                            <td className="text-right">
                                                                {FormatNumber(item['c14'])}
                                                            </td>
                                                        )}
                                                        <td className="text-right">{FormatNumber(item['c15'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c16'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c17'])}</td>
                                                        <td className="text-right">{FormatNumber(item['c18'])}</td>
                                                        <td
                                                            className={
                                                                'text-right ' +
                                                                (Number(item.c20) > 0
                                                                    ? 'price_basic_over'
                                                                    : Number(item.c20) < 0
                                                                        ? 'price_basic_less'
                                                                        : '')
                                                            }
                                                        >
                                                            {Number(item['c20']) > 0 &&
                                                                Number(item['c20']) !== 0 && (
                                                                    <i className="fa fa-arrow-up" />
                                                                )}
                                                            {Number(item['c20']) < 0 &&
                                                                Number(item['c20']) !== 0 && (
                                                                    <i className="fa fa-arrow-down" />
                                                                )}{' '}
                                                            {Number(item['c20']) < 0
                                                                ? item['c20'] * -1
                                                                : item['c20']}{' '}
                                                            %
                                                                </td>
                                                        <td
                                                            className={
                                                                'text-right ' +
                                                                (Number(item.c19) > 0
                                                                    ? 'price_basic_over'
                                                                    : Number(item.c19) < 0
                                                                        ? 'price_basic_less'
                                                                        : '')
                                                            }
                                                        >
                                                            {Number(item['c19']) > 0 &&
                                                                Number(item['c19']) !== 0 && (
                                                                    <i className="fa fa-arrow-up" />
                                                                )}
                                                            {Number(item['c19']) < 0 &&
                                                                Number(item['c19']) !== 0 && (
                                                                    <i className="fa fa-arrow-down" />
                                                                )}{' '}
                                                            {Number(item['c19']) < 0
                                                                ? FormatNumber(item['c19'] * -1)
                                                                : FormatNumber(item['c19'])}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {this.state.data_own.length === 0 && (
                                                    <tr>
                                                        <td colSpan="21" className="text-center">
                                                            {t('common_NoDataFound')}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                {this.state.total_own.c16 && (
                                                    <tr className="row-for-sum">
                                                        <td
                                                            colSpan={glb_sv.activeCode == '028' ? 14 : 15}
                                                            className="text-center"
                                                        >
                                                            {t('common_total')}
                                                        </td>
                                                        <td className="text-right">
                                                            {FormatNumber(this.state.total_own.c16, 0, 0)}
                                                        </td>
                                                        <td className="text-right" />
                                                        <td className="text-right">
                                                            {FormatNumber(this.state.total_own.c18Nf, 0, 0)}
                                                        </td>
                                                        {/* <td className="text-right" /> */}
                                                        <td className="text-right">
                                                            <div
                                                                className={
                                                                    Number(this.state.total_own.c19) < 0
                                                                        ? 'price_basic_less'
                                                                        : Number(this.state.total_own.c19) > 0
                                                                            ? 'price_basic_over'
                                                                            : ''
                                                                }
                                                            >
                                                                {this.state.total_own.c19 > 0 && (
                                                                    <i className="fa fa-arrow-up" />
                                                                )}
                                                                {this.state.total_own.c19 < 0 && (
                                                                    <i className="fa fa-arrow-down" />
                                                                )}{' '}
                                                                {Number(this.state.total_own.c18Nf) == 0
                                                                    ? 0
                                                                    : Math.round(
                                                                        (Math.abs(
                                                                            Number(this.state.total_own.c19)
                                                                        ) /
                                                                            Number(this.state.total_own.c18Nf)) *
                                                                        100 *
                                                                        1000
                                                                    ) / 1000}{' '}
                                                                %
                                                                    </div>
                                                        </td>
                                                        {/* <td className={"text-right " + (Number(this.state.total_own.c19) > 0 ? 'price_basic_over' : (Number(this.state.total_own.c19) < 0 ? 'price_basic_less' : ''))}>{FormatNumber(this.state.total_own.c19, 0, 0)}</td> */}
                                                        <td className="text-right">
                                                            <div
                                                                className={
                                                                    Number(this.state.total_own.c19) < 0
                                                                        ? 'price_basic_less'
                                                                        : Number(this.state.total_own.c19) > 0
                                                                            ? 'price_basic_over'
                                                                            : ''
                                                                }
                                                            >
                                                                {Number(this.state.total_own.c19) > 0 && (
                                                                    <i className="fa fa-arrow-up" />
                                                                )}
                                                                {Number(this.state.total_own.c19) < 0 && (
                                                                    <i className="fa fa-arrow-down" />
                                                                )}{' '}
                                                                {FormatNumber(
                                                                    Math.abs(this.state.total_own.c19),
                                                                    0,
                                                                    0
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                {/* Chi tiết lệnh theo số hiệu lệnh gốc */}
                <Modal isOpen={this.state.cfm_portfolio_detail} size={'lg modal-notify'}>
                    <ModalHeader toggle={e => this.setState({ cfm_portfolio_detail: false })}>
                        {t('portfolio_info_detail')} - {this.state.assetInfo_acntNo}
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive datatable">
                            <table className="tableNormal table-sm tablenowrap table-bordered table-striped">
                                <thead className="header">
                                    <tr>
                                        <th className="text-center">{t('calculator_date')}</th>
                                        <th className="text-center cursor_ponter">{t('common_index')}</th>
                                        <th className="text-center cursor_ponter">{t('action_type')}</th>
                                        <th className="text-center cursor_ponter">{t('acnt_no')}</th>
                                        <th className="text-center cursor_ponter">{t('sub_account')}</th>
                                        <th className="text-center cursor_ponter">{t('short_symbol')}</th>
                                        <th className="text-center cursor_ponter">{t('price_cal_profit_loss')}</th>
                                        <th className="text-center cursor_ponter">{t('increase_quantity')}</th>
                                        <th className="text-center cursor_ponter">{t('decrease_quantity')}</th>
                                        <th className="text-center cursor_ponter">{t('value_of_capital_on_day')}</th>
                                        <th className="text-center cursor_ponter">
                                            {t('value_of_accumulated_capital_on_day')}
                                        </th>
                                        <th className="text-center cursor_ponter">{t('cash_from_right')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.portfolioDetailDataTable.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{this.transTime(item['c0'])}</td>
                                            <td className="text-center">{item['c1']}</td>
                                            <td>{item['c2']}</td>
                                            <td class="text-center">{item['c3']}</td>
                                            <td className="text-center">{item['c4']}</td>
                                            <td className="text-right">{item['c5']}</td>
                                            <td className="text-right">{FormatNumber(item['c6'], 0, 0)}</td>
                                            <td className="text-right">{FormatNumber(item['c7'], 0, 0)}</td>
                                            <td className="text-right">{FormatNumber(item['c8'], 0, 0)}</td>
                                            <td className="text-right">{FormatNumber(item['c9'], 0, 0)}</td>
                                            <td className="text-right">{FormatNumber(item['c10'], 0, 0)}</td>
                                            <td className="text-right">{FormatNumber(item['c11'], 0, 0)}</td>
                                        </tr>
                                    ))}
                                    {(this.state.portfolioDetailDataTable.length === 0 ||
                                        this.state.portfolioDetailDataTable === undefined) && (
                                            <tr>
                                                <td colspan="12" className="text-center">
                                                    {t('common_NoDataFound')}!
                                            </td>
                                            </tr>
                                        )}
                                </tbody>
                                <tfoot>
                                    {this.state.portfolioDetailDataTable.length > 0 &&
                                        this.state.portfolioDetailDataTable !== undefined && (
                                            <tr className="row-for-sum">
                                                <td colspan="7" className="text-center">
                                                    {t('common_total')}
                                                </td>
                                                <td className="text-right">{this.state.sumtable.c7}</td>
                                                <td className="text-right">{this.state.sumtable.c8}</td>
                                                <td className="text-right">{this.state.sumtable.c9}</td>
                                                <td className="text-right">{this.state.sumtable.c10}</td>
                                                <td className="text-right">{this.state.sumtable.c11}</td>
                                            </tr>
                                        )}
                                </tfoot>
                            </table>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}

export default translate('translations')(AssetManage)
