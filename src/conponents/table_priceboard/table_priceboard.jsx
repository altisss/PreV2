import React from 'react'
import { translate } from 'react-i18next'
import TableRowPriceboard from './table_row_priceboard'
import socket_sv from '../../utils/globalSv/service/socket_service'
import glb_sv from '../../utils/globalSv/service/global_service'
import OptionTable from '../optionTable/OptionTable'
import title_priceboard from './titlePriceBoard.json'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import orderBy from 'lodash/orderBy'
import { Subject } from 'rxjs'
import Popover from 'react-tiny-popover'
import { inform_broadcast, inform_stkTradEvent_broadcast } from '../../utils/broadcast_service'
import commuChanel from '../../constants/commChanel'
import functionList from '../../constants/functionList'
import { on_subcribeIndexList, on_subcribeIndexAll, on_subcribeListCont, on_subcribeOneStkFVLt, on_unSubcribeFVL, on_unSubStkList } from '../../utils/subcrible_functions'
import { hide_title, show_title } from '../../utils/hide_show_title'
import { filter_str_bf_parse } from '../../utils/filter_str_before_parse'
import { update_stock_to_Fvl } from '../../utils/update_stock_to_Fvl'
import { getMsgObjectByMsgKey } from '../../utils/get_msg_obj_by_msg_key'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv'

class TablePriceboard extends React.PureComponent {
    constructor(props) {
        super(props)
        this.clientSeq = 0
        this.noColBid = 6
        this.noColOffer = 6
        this.noColPrice = 4
        this.widthBid = 328
        this.widthOffer = 328
        this.widthPrice = 203

        this.handleColumnChange = this.handleColumnChange.bind(this)
        this.removeStkFromFvl = this.removeStkFromFvl.bind(this)
        this.handleChangeFocusRow = this.handleChangeFocusRow.bind(this)
        this.firstload = true
        // lấy config bảng điện từ local ? fail lấy từ json title_priceboard
        this.status = {}
        const data = localStorage.getItem('configPriceboard')
        if (data && JSON.parse(data)) {
            this.title_priceboard = JSON.parse(data)
        } else this.title_priceboard = title_priceboard
        const statusF = localStorage.getItem('configPriceboard_status')
        if (statusF && JSON.parse(statusF)) {
            this.status = JSON.parse(statusF)
        } else {
            this.status.showRatio = true
            this.status.changRoom = true
        }

        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeCode', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            this.setState({ active_code: agrs })
        })
        this.state = {
            active_code: glb_sv.activeCode,
            datasource: [],
            isLoading: false,
            indexName: null,
            widthBid: 328,
            widthOffer: 328,
            widthPrice: 203,
            colorOdd: '',
            colorEven: '',
            type: '',
            stkSelected: '',
            stkName: '',
            stkList: [],
            selected: '',
            cfm_load_data: false,
            showRatio: this.status.showRatio,
            changRoom: this.status.changRoom,
            title_priceboard: this.title_priceboard,
            forceUpdate: 0,
            isWL: false,
            isPopoverOpenMenu: false,

            themePage: 'dark-theme',
            language: '',
            // sub_component: component.SubMarketInfor,
            config_node: {},
            // node : this.props.node,
            // key : this.props.key

        }



        // this.props.req_component = new Map();
        // this.popin_window = this.popin_window.bind(this);
        // this.request_seq_comp = 0;
        // this.props.get_rq_seq_comp = () => {
        // return ++this.request_seq_comp
        // };
    }


    /*--- declare variable for get Stock list function --------------------*/
    indexCodeAct = ''
    subcr_ClientReqRcv = new Subject()
    subcr_ClientReqMrkRcv = new Subject()
    subcr_commonEvent = new Subject()
    getStock_SendReqFlag = false
    getStock_Timeout = {}
    getStock_FcntNm = functionList.GETSTOCK_01
    getStock_ResultArr = []
    stockList = []
    subcrible_FcnNm = functionList.SUBSCRIBE_INDEX + this.component
    // subcrible_cont_FcnNm = 'SUBSCRIBE-CONT-INDEX'; subcribeIndexList(this.props.req_component, this.props.get_rq_seq_comp, this.component, this.stockList)
    unsubcrible_FcnNm = functionList.UNSUBSCRIBE_INDEX
    sendStk2TradView = true

    // -- add a stock to favorite
    addStk2Fvl_functNm = functionList.ADD_STK2FVL
    addStk2FvlFlag = false
    addStk2Fvl_Stk = ''
    current_FvlId = -1
    // -- remove a stock to favorite
    removeStkFlag = false
    removeStkFvl_functNm = functionList.REMOVE_STKFVL
    removeStkFvl_Stk = ''

    mrkIndex = ''
    flagSort = {}
    curentIndexObj = {}

    getRecommStockFlag = false
    getRecommStock_FunctNm = functionList.RECOMMSTK_001


    componentDidMount() {
        // console.log(this.props.node, this.props.key)

        window.ipcRenderer.on(`${commuChanel.CHANG_INDEX}_${this.component}`, (event, msg) => {
            console.log(msg, this.component, this.indexCodeAct !== msg.value.key)
            if (msg.component === this.component) {
                // glb_sv.index_priceboard = msg.value
                update_value_for_glb_sv({ component: this.component, key: 'index_priceboard', value: msg.value })
                this.isWL = false
                this.curentIndexObj = msg.value
                if (msg.value.type === 'IND') {
                    if (msg.value.key === 'HNXINDEX' || msg.value.key === 'UPCINDEX' || msg.value.key === 'HSXINDEX') {
                        if (msg.value.key === this.mrkIndex) return
                        this.setState({ isWL: false })
                        this.scrollTable.scrollTop = 0
                        this.firstload = true
                        this.mrkIndex = msg.value.key
                        this.indexCodeAct = msg.value.key
                        // this.unSubStkList()
                        // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                        on_unSubStkList(this.component)
                        let stkList = []
                        if (msg.value.key === 'HNXINDEX') {
                            // console.log('ádasdasdsadasdadadasdasdas')
                            // console.log(glb_sv.HNX_PRC_LIST)
                            const sq = this.get_value_from_glb_sv_seq()
                            this.handle_get_value_from_glv_sv(stkList, msg, sq)
                            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'HNX_PRC_LIST', sq: sq })

                            // this.subrList = this.sortDataSource(glb_sv.HNX_PRC_LIST)
                        } else if (msg.value.key === 'UPCINDEX') {
                            const sq = this.get_value_from_glb_sv_seq()
                            this.handle_get_value_from_glv_sv(stkList, msg, sq)
                            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'UPC_PRC_LIST', sq: sq })

                            // this.subrList = this.sortDataSource(glb_sv.UPC_PRC_LIST)
                        } else if (msg.value.key === 'HSXINDEX') {
                            const sq = this.get_value_from_glb_sv_seq()
                            // this.handle_get_value_from_glv_sv(stkList, msg, sq)
                            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'HSX_PRC_LIST', sq: sq })
                            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                                this.subrList = this.sortDataSource(agrs)
                                console.log(this.subrList.length)
                                for (let i = 0; i < 40; i++) {
                                    if (!!this.subrList && this.subrList[i] && !!this.subrList[i]['t55'])
                                        stkList.push(this.subrList[i].t55)
                                }
                                this.stockList = stkList
                                this.firstload = false
                                on_subcribeIndexList(stkList, this.component)
                                // this.subcribeIndexList(stkList)
                                this.setState({
                                    datasource: [],
                                    type: msg.value.type,
                                    isLoading: true,
                                })
                                this.recursive()
                                this.flagSort = []
                                return
                            })
                            // this.subrList = this.sortDataSource(glb_sv.HSX_PRC_LIST)
                        }
                        return
                    } else if (msg.value.key === 'CW' && this.indexCodeAct !== msg.value.key) {
                        this.setState({ isWL: false })
                        this.scrollTable.scrollTop = 0
                        this.mrkIndex = 'CW'
                        // this.unSubStkList()
                        // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                        on_unSubStkList(this.component)
                        this.indexCodeAct = msg.value.key
                        this.setState({ datasource: [], isLoading: true, type: msg.value.type })
                        this.flagSort = []
                        this.stockList = []
                        this.subrList = []
                        this.getCoverWarrList()
                    } else if (msg.value.key && this.indexCodeAct !== msg.value.key) {
                        // console.log('cccccccccccccccccccccccccccccccccccc')
                        this.setState({ isWL: false })
                        this.scrollTable.scrollTop = 0
                        this.mrkIndex = 'IND-DIF'
                        // this.unSubStkList()
                        // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                        on_unSubStkList(this.component)
                        this.indexCodeAct = msg.value.key
                        this.setState({ datasource: [], isLoading: true, type: msg.value.type })
                        this.getStockList(msg.value.key, this.props.get_rq_seq_comp())
                        this.flagSort = []
                        this.subrList = []
                        this.stockList = []
                    }
                } else if (msg.value.type === 'FVL') {
                    if (msg.value.key && this.indexCodeAct !== msg.value.key) {
                        this.setState({ isWL: false })
                        this.scrollTable.scrollTop = 0
                        this.mrkIndex = ''
                        // this.unSubStkList()
                        // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                        on_unSubStkList(this.component)
                        this.indexCodeAct = msg.value.key
                        this.current_FvlId = msg.value.key
                        this.setState({ datasource: [], isLoading: true, type: msg.value.type })
                        this.flagSort = []
                        this.stockList = []
                        this.subrList = []
                        this.getStockOfFlv(msg.value.key)
                    }
                } else if (msg.value.type === 'WL') {
                    // console.log(this.indexCodeAct)
                    if (msg.value.key && this.indexCodeAct !== msg.value.key) {
                        this.isWL = true
                        this.scrollTable.scrollTop = 0
                        this.mrkIndex = ''
                        // this.unSubStkList()
                        // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                        on_unSubStkList(this.component)
                        this.indexCodeAct = msg.value.key
                        this.current_FvlId = msg.value.key
                        this.setState({ datasource: [], isLoading: true, type: msg.value.type, isWL: true })
                        this.flagSort = []
                        this.stockList = []
                        this.subrList = []
                        // console.log(msg.value.key)
                        this.getStockOfWL(msg.value.key)
                    }
                }
            }

        })

        window.ipcRenderer.on(`${commuChanel.STK_FROM_MENU}_${this.component}`, (event, msg) => {
            const sq = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
                const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
                const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
                const stk = msg.data
                console.log(msg, agrs, this.state.type, 'STK_FROM_MENU')
                if (this.state.type === 'FVL') {
                    this.addStk2FVL(stk)
                    setTimeout(() => this.handleSearchText(stk), 400)
                } else {
                    const data = this.state.datasource.find(item => item.t55 === stk)
                    if (data) {
                        this.setState({ selected: stk })
                        this.sendStkTradView(data)
                        this.handleSearchText(stk)
                    } else {
                        let data,
                            stkCd = 'HNX_' + stk
                        // let mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
                        let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                        console.log(mrkObj, 'mrkObj')

                        if (mrkObj != null && mrkObj !== undefined) {
                            data = mrkObj
                        }
                        stkCd = 'HSX_' + stk
                        // mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
                        mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                        if (mrkObj != null && mrkObj !== undefined) {
                            data = mrkObj
                        }
                        stkCd = 'UPC_' + stk
                        // mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
                        mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                        if (mrkObj != null && mrkObj !== undefined) {
                            data = mrkObj
                        }

                        if (data == null) return

                        const msg = { type: commuChanel.STOCK_INFO_TAB, value: data, component: this.component }
                        // glb_sv.commonEvent.next(msg)
                        inform_broadcast(commuChanel.STOCK_INFO_TAB, msg)

                        const msg1 = { type: commuChanel.misTypeChgStock, value: data, component: this.component }
                        setTimeout(() => inform_broadcast(commuChanel.misTypeChgStock, msg1), 500)
                        this.sendStkTradView(stk)
                    }
                }

            })
        })

        window.ipcRenderer.on(`${commuChanel.MOVE_STK2FIRST_PRTABLE}_${this.component}`, (event, msg) => {
            this.moveStk2FirsPri(msg.value)
        })

        window.ipcRenderer.on(`${commuChanel.misTypeReconect}_${this.component}`, (event, msg) => {
            if (this.state.type === 'FVL') {
                this.getStockOfFlv(this.indexCodeAct)
            } else if (this.state.type === 'WL') {
                this.getStockOfWL(this.indexCodeAct)
            } else if (this.indexCodeAct === 'CW') {
                this.getCoverWarrList()
            } else if (
                this.indexCodeAct === 'HNXINDEX' ||
                this.indexCodeAct === 'UPCINDEX' ||
                this.indexCodeAct === 'HSXINDEX'
            ) {
                this.firstload = true
                // this.subcribeIndexAll(this.indexCodeAct)
                // subcribeIndexAll(this.props.req_component, this.props.get_rq_seq_comp, this.component,this.indexCodeAct)
                on_subcribeIndexAll(this.indexCodeAct, this.component)
            } else {
                if (this.indexCodeAct === undefined || this.indexCodeAct === '') return
                this.getStockList(this.indexCodeAct, this.props.get_rq_seq_comp())
            }
        })

        window.ipcRenderer.on(`${commuChanel.UPDATE_FVL}_${this.component}`, (event, msg) => {
            if (this.state.type === 'FVL' && this.current_FvlId === msg.GRP_ID) {
                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'FVL_STK_LIST', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                    const obj = agrs.find(item => item.GRP_ID === msg.GRP_ID)
                    if (obj) {
                        const datasource = this.getUnique(obj.FVL_PRICEBOARD, 't55')
                        this.setState({ datasource, forceUpdate: this.state.forceUpdate + 1 })
                    }
                })


            }
        })

        window.ipcRenderer.on(`${commuChanel.getStockListChangeLang}_${this.component}`, (event, msg) => {
            if (this.isWL) {
                this.scrollTable.scrollTop = 0
                // this.unSubStkList()
                // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                on_unSubStkList(this.component)
                this.setState({ datasource: [], isLoading: true })
                this.flagSort = []
                this.stockList = []
                this.subrList = []
                this.getStockOfWL(this.current_FvlId)
            } else {
                this.setState({ datasource: this.subrList, forceUpdate: this.state.forceUpdate + 1 })
            }
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_HEIGHT_PRICEBOARD}_${this.component}`, (event, msg) => {
            this.functNewSubscr()
        })

        window.ipcRenderer.on(`${commuChanel.stkTradEvent}_${commuChanel.misTypeTradvStock}_${this.component}`, (event, msg) => {
            const item = JSON.parse(msg)
            if (item['data'] !== null && item['data'] !== undefined) {
                if (item['data']['t55']) {
                    const curStk = item['data']['t55']
                    const isStkofdatasource = this.state.datasource.findIndex(item => item.t55 === curStk)
                    // if (isStkofdatasource >= 0 && this.state.selected !== item['data']['t55']) {
                    //     this.handleChangeFocusRow(item['data']['t55'])
                    //     this.handleSearchText(item['data']['t55'])
                    // }
                }
            }
        })

        window.ipcRenderer.on(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`, (event, agrs) => {
            console.log('reply_send_event_FinishSunbcribeFunct', this.component, agrs)
            const message = agrs
            if (message === (functionList.SUBSCRIBE_INDEX)) {
                if (this.stockList.length > 0) {
                    if (
                        this.mrkIndex !== 'HNXINDEX' &&
                        this.mrkIndex !== 'UPCINDEX' &&
                        this.mrkIndex !== 'CW' &&
                        this.mrkIndex !== 'HSXINDEX'
                    ) {
                        if (this.isWL) {
                            this.getMsgObjectStkWL(this.stkListRec)
                        } else this.getMsgObjectStk(this.stockList)
                    } else {
                        if (this.firstload && this.mrkIndex !== 'CW') {
                            // this.unSubStkList()
                            // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                            on_unSubStkList(this.component)
                            on_subcribeIndexList(this.stockList, this.component)
                            this.firstload = false
                            return
                        }
                        update_value_for_glb_sv({ component: this.component, key: 'firsTimeLoad', value: true })
                        // glb_sv.firsTimeLoad = true
                        const data = this.subrList[0]
                        const msg = { type: commuChanel.misTypeTradvStock, data: data, component: this.component }
                        // glb_sv.stkTradEvent.next(JSON.stringify(msg))
                        inform_stkTradEvent_broadcast(commuChanel.misTypeTradvStock, JSON.stringify(msg))
                        if (this.mrkIndex === 'CW') this.setState({ isLoading: false })
                    }
                }
            } else
                if (message === functionList.SUBSCRIBE_INDEX_SCROLL) {
                    setTimeout(() => (update_value_for_glb_sv({ component: this.component, key: 'firsTimeLoad', value: true })), 1000)
                }
        })

        window.ipcRenderer.on(`${commuChanel.SubMarketInfor}_${this.component}`, (event, agrs) => {
            console.log('onNodeSelect', agrs)
            // this.props.set_node_key(agrs.node, agrs.key)
            this.load_data(agrs.node, agrs.key)
        })


        this.setOptionTable()

        // nhận message từ tradingview khi đổi mã
        // this.subcr_stkTradView = glb_sv.stkTradEvent.subscribe(msg => {
        //     const item = JSON.parse(msg)
        //     if (item.type === commuChanel.misTypeTradvStock) {
        //         if (item['data'] !== null && item['data'] !== undefined) {
        //             if (item['data']['t55']) {
        //                 const curStk = item['data']['t55']
        //                 const isStkofdatasource = this.state.datasource.findIndex(item => item.t55 === curStk)
        //                 if (isStkofdatasource >= 0 && this.state.selected !== item['data']['t55']) {
        //                     this.handleChangeFocusRow(item['data']['t55'])
        //                     this.handleSearchText(item['data']['t55'])
        //                 }
        //             }
        //         }
        //     }
        // })

        this.divTable = document.getElementById('table_price')
        this.elvTableHead = document.getElementById('table_head')

        this.myListener = function (event) {
            if (this.timeoutResize) clearTimeout(this.timeoutResize)
            this.timeoutResize = setTimeout(() => {
                this.functNewSubscr()
            }, 400)
        }
        this.myListenerResize = this.myListener.bind(this)
        window.addEventListener('resize', this.myListenerResize)

        // const node = this.props.node
        // const key = this.props.key
        this.load_data({}, '')
        // }
    }

    handle_get_value_from_glv_sv = (stkList, msg, sq) => {
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            this.subrList = this.sortDataSource(agrs)
            console.log(this.subrList.length)
            for (let i = 0; i < 40; i++) {
                if (!!this.subrList && this.subrList[i] && !!this.subrList[i]['t55'])
                    stkList.push(this.subrList[i].t55)
            }
            this.stockList = stkList
            this.firstload = false
            on_subcribeIndexList(stkList, this.component)
            // this.subcribeIndexList(stkList)
            this.setState({
                datasource: [],
                type: msg.value.type,
                isLoading: true,
            })
            this.recursive()
            this.flagSort = []
            return
        })
    }

    load_data = (node, key) => {

        if(!node) return;

        if (node.type === 'folder') {
            if (node.typeIndex === undefined) return;
            this.focusRowFunct(node.key + node.typeIndex, node);
            // glb_sv.indexFocus = key;
            update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: key })
            this.sendIndex(node);
        } else {

            this.focusRowFunct(node.key + node.typeIndex, node);
            // glb_sv.indexFocus = key;
            update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: key })
            this.sendIndex(node);
        }
    }

    focusRowFunct(key, data) {
        const allRow = document.getElementsByClassName('index-sidebar');
        for (let i = 0; i < allRow.length; i++) {
            if (allRow[i]) {
                // allRow[i].style.background = '';
                if (allRow[i].classList.contains('active')) allRow[i].classList.remove('active');
            }
        }
        const focusRow = document.getElementById(key);
        if (focusRow) {
            // focusRow.style.background = glb_sv.style[glb_sv.themePage].sideBar.background_focusrow;
            if (!focusRow.classList.contains('active')) focusRow.classList.add('active');
            this.isSelect = data;
        }
    }

    sendIndex(node, msgstr) {
        console.log('onNodeSelect', node, msgstr)
        const type = (node.typeIndex === 'HSX' || node.typeIndex === 'HNX' || node.typeIndex === 'UPC') ? 'IND' : node.typeIndex;
        const msg = {
            type: commuChanel.CHANG_INDEX,
            value: { type, key: node.key, value: node.value },
            change: msgstr,
            component: this.component
        };
        inform_broadcast(commuChanel.CHANG_INDEX, msg)

        // glb_sv.commonEvent.next(msg);
    }

    componentWillUnmount() {
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANG_INDEX}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.STK_FROM_MENU}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.MOVE_STK2FIRST_PRTABLE}_${this.component}`)
        // window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeReconect}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.UPDATE_FVL}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.getStockListChangeLang}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_HEIGHT_PRICEBOARD}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeTradvStock}_${this.component}`)
        // window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`)
        // window.ipcRenderer.removeAllListeners(`${commuChanel.SubMarketInfor}_${this.component}`)

        window.removeEventListener('resize', this.myListenerResize)
        // window.removeEventListener('onScroll', this.handleScroll)
        // window.removeEventListener('scroll', this.handleScroll, true);
        // const list = ReactDOM.findDOMNode(this.refs.list)
        // list.removeEventListener('scroll', this.handleScroll, true);
    }

    getUnique(arr, comp) {
        const unique = arr
            .map(e => e[comp])
            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)
            // eliminate the dead keys & store unique objects
            .filter(e => arr[e])
            .map(e => arr[e])

        return unique
    }

    handleScroll = _this => {
        // console.log('vô scroll')
        // console.log(_this,this.scrollTableTop, _this.mrkIndex, _this.functNewSubscr)

        if (_this.mrkIndex === '') return
        if (_this.scrollTable === 'undefined') return
        if (this.scrollTableTop === _this.scrollTable.scrollTop) return
        if (
            _this.mrkIndex === 'HNXINDEX' ||
            _this.mrkIndex === 'UPCINDEX' ||
            _this.mrkIndex === 'HSXINDEX' ||
            _this.mrkIndex === 'IND-DIF'
        ) {
            _this.functNewSubscr()
            this.scrollTableTop = _this.scrollTable.scrollTop
        }
    }

    setOptionTable() {
        if (this.title_priceboard !== null && this.title_priceboard !== undefined) {
            this.title_priceboard.forEach(item => {
                if (item.value === false) {
                    // glb_sv.hideTitle(item.key)
                    hide_title(item.key)
                    if (
                        item.key === 'c4pb' ||
                        item.key === 'c5pb' ||
                        item.key === 'c6pb' ||
                        item.key === 'c7pb' ||
                        item.key === 'c8pb' ||
                        item.key === 'c9pb'
                    ) {
                        this.noColBid = this.noColBid - 1
                        this.widthBid = this.widthBid - 54
                    }
                    if (
                        item.key === 'c13pb' ||
                        item.key === 'c14pb' ||
                        item.key === 'c15pb' ||
                        item.key === 'c16pb' ||
                        item.key === 'c17pb' ||
                        item.key === 'c18pb'
                    ) {
                        this.noColOffer = this.noColOffer - 1
                        this.widthOffer = this.widthOffer - 54
                    }
                    if (item.key === 'c19pb' || item.key === 'c20pb' || item.key === 'c21pb' || item.key === 'c22pb') {
                        this.noColPrice = this.noColPrice - 1
                        this.widthPrice = this.widthPrice - 50
                    }
                }
            })

            this.setState({ widthBid: this.widthBid, widthOffer: this.widthOffer, widthPrice: this.widthPrice })
            if (this.noColBid > 0) {
                const elemms = document.querySelectorAll('.bidpb')
                for (let i = 0; i < elemms.length; i++) {
                    const current = elemms[i]
                    current.colSpan = String(this.noColBid)
                }
                show_title('bidpb')
            } else {
                hide_title('bidpb')
            }
            if (this.noColOffer > 0) {
                const elemms = document.querySelectorAll('.offerpb')
                for (let i = 0; i < elemms.length; i++) {
                    const current = elemms[i]
                    current.colSpan = String(this.noColOffer)
                }
                show_title('offerpb')
            } else {
                hide_title('offerpb')
            }
            if (this.noColPrice > 0) {
                const elemms = document.getElementsByClassName('pricepb')
                for (let i = 0; i < elemms.length; i++) {
                    const current = elemms[i]
                    current.colSpan = String(this.noColPrice)
                }
                show_title('pricepb')
            } else {
                hide_title('pricepb')
            }
        }
    }

    sendStkTradView(data) {
        if (this.timeoutstk2TradView) clearTimeout(this.timeoutstk2TradView)
        if (data !== null && data !== undefined) {
            const msg = { type: commuChanel.misTypeTradvStock, data: data, component: this.component }
            this.timeoutstk2TradView = setTimeout(() => inform_stkTradEvent_broadcast(commuChanel.misTypeTradvStock, JSON.stringify(msg)), 400)
        }
    }

    getStockList = (indexCode, request_seq_comp) => {
        console.log(indexCode, this.state.active_code, (!socket_sv.getSocketStat(socket_sv.key_ClientReq)))
        if (this.getStock_SendReqFlag) {
            return
        }
        this.getStock_SendReqFlag = true
        if (this.state.active_code === null || this.state.active_code === undefined) {
            this.getStock_SendReqFlag = false
            return
        }
        const reqInfo = new requestInfo();
        // const request_seq_comp = this.props.get_rq_seq_comp()
        reqInfo.reqFunct = this.getStock_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getStockResult;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqStock01'
        svInputPrm.ServiceName = 'ALTqStock01_0301_2'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['2', indexCode.trim()]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getStock_Timeout = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)

        this.getStock_ResultArr = []
        this.stockList = []
        reqInfo.inputParam = svInputPrm.InVal;

        this.props.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm

        })
    }

    getStockResult = (reqInfoMap, message) => {
        console.log("getStockResult -> message", message)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            const errmsg = message['Message']
            this.getStock_SendReqFlag = false
            glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'danger', 'password', false, '', this.component)
            return
        } else {
            reqInfoMap.procStat = 1
            let dataArr = []
            try {
                let strdata = message['Data']
                // strdata = glb_sv.filterStrBfParse(strdata)
                strdata = filter_str_bf_parse(strdata)
                dataArr = JSON.parse(strdata)
                this.getStock_ResultArr = this.getStock_ResultArr.concat(dataArr)
            } catch (error) {
                this.getStock_ResultArr = []
                reqInfoMap.procStat = 3
                this.getStock_SendReqFlag = false
                this.setState({ datasource: [], isLoading: false })
                return
            }
            if (Number(message['Packet']) <= 0) {
                this.stockList = []
                if (this.getStock_ResultArr.length > 0) {
                    let i = 0
                    for (i = 0; i < this.getStock_ResultArr.length; i++) {
                        this.stockList.push(this.getStock_ResultArr[i]['c0'])
                    }
                    on_subcribeIndexList(this.stockList, this.component)
                }
                reqInfoMap.procStat = 2
                this.getStock_SendReqFlag = false
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                // this.props.req_component.set(cltSeqResult, reqInfoMap)
            }
        }
    }

    getStockListFVL = (groupId) => {
        if (this.getStock_SendReqFlag) {
            return
        }
        this.getStock_SendReqFlag = true
        if (this.state.active_code === null || this.state.active_code === undefined) {
            this.getStock_SendReqFlag = false
            return
        }
        const reqInfo = new requestInfo();
        const request_seq_comp = this.props.get_rq_seq_comp()
        reqInfo.reqFunct = this.getStock_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getStockListFVLResult;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqCommon01'
        svInputPrm.ServiceName = 'ALTqCommon01_0820_02'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['4', groupId]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getStock_Timeout = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)

        this.getStock_ResultArr = []
        this.stockList = []
        reqInfo.inputParam = svInputPrm.InVal;

        this.props.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm

        })
    }

    getStockListFVLResult = (reqInfoMap, message) => {
        clearTimeout(this.getStock_Timeout)
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            const errmsg = message['Message']
            this.getStock_SendReqFlag = false
            glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'danger', 'password', false, '', this.component)
            return
        } else {
            reqInfoMap.procStat = 1
            let dataArr = []
            try {
                let strdata = message['Data']
                // strdata = glb_sv.filterStrBfParse(strdata)
                strdata = filter_str_bf_parse(strdata)
                dataArr = JSON.parse(strdata)
                this.getStock_ResultArr = this.getStock_ResultArr.concat(dataArr)
                console.log('getStockListFVLResult',reqInfoMap, message, this.getStock_ResultArr)
            } catch (error) {
                this.getStock_ResultArr = []
                reqInfoMap.procStat = 3
                this.getStock_SendReqFlag = false
                this.setState({ datasource: [], isLoading: false })
                return
            }
            if (Number(message['Packet']) <= 0) {
                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'FVL_STK_LIST', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, FVL_STK_LIST) => {
                    this.stockList = []
                    if (this.getStock_ResultArr.length > 0) {
                        let i = 0
                        for (i = 0; i < this.getStock_ResultArr.length; i++) {
                            this.stockList.push(this.getStock_ResultArr[i]['c3'])
                        }
                        on_subcribeIndexList(this.stockList, this.component)
                        FVL_STK_LIST.find(x => x.GRP_ID === reqInfoMap.inputParam[1])['STK_LIST'] = this.stockList
                        console.log('getStockListFVLResult',FVL_STK_LIST)
                        update_value_for_glb_sv({component: this.component, key: 'FVL_STK_LIST', value: FVL_STK_LIST})
                    }
                    reqInfoMap.procStat = 2
                    this.getStock_SendReqFlag = false
                })
                
                
            }
        }
    }


    getStockOfFlv = fvlKey => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'FVL_STK_LIST', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const formObj = agrs.find(x => x.GRP_ID === fvlKey)
            console.log('onNodeSelect', agrs)
            
            if (formObj) {
                console.log('formObj', formObj)
                this.stockList = formObj['STK_LIST']
                // if (this.stockList.length > 0) {
                //     on_subcribeIndexList(this.stockList, this.component)
                // } else {
                //     this.getStockListFVL(fvlKey)
                // }
                this.getStockListFVL(fvlKey)
                on_subcribeIndexList(this.stockList, this.component)

            }
        })
    }

    getStockOfWL = key => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'suggestGrpList', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const formObj = agrs.find(x => x.c0 === key)
            if (formObj) {
                this.getStockListWL(key)
            } else {
                this.setState({ isLoading: false })
                const msg = { type: commuChanel.misTypeTradvStock, data: { t55: null }, component: this.component }
                if (msg.data && this.sendStk2TradView) {
                    setTimeout(() => inform_stkTradEvent_broadcast(commuChanel.misTypeTradvStock, JSON.stringify(msg)), 0)
                    this.sendStk2TradView = false
                }
            }
        })


    }

    getStockListWL = recomCode => {
        this.stkListRec = []

        // if (this.getRecommStockFlag) { return; }
        const reqInfo = new requestInfo();
        const request_seq_comp = this.props.get_rq_seq_comp()
        reqInfo.reqFunct = this.getRecommStock_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getRecommStock_functNmResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqNews'
        svInputPrm.ServiceName = 'ALTqNews_Suggest'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['02', recomCode]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getRecommStockFunct_ReqTimeOut = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        this.props.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })

    }

    getMsgObjectStk = (stkList = []) => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            console.log(agrs)
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
            let stkObjInfo = [],
                m = 0
            for (m = 0; m < stkList.length; m++) {
                let stkCd = 'HNX_' + stkList[m]
                // let mrkObj = glb_sv.getMsgObjectByMsgKey(stkCd)
                let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (mrkObj != null && mrkObj !== undefined) {
                    if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                        mrkObj.tTG = mrkObj.t31 ? mrkObj.t31 - mrkObj.t260 : 0
                        mrkObj['order'] = m
                        mrkObj['orderBol'] = false
                        stkObjInfo.push(mrkObj)
                    }
                    continue
                }
                stkCd = 'HSX_' + stkList[m]
                mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (mrkObj != null && mrkObj !== undefined) {
                    if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                        mrkObj.tTG = mrkObj.t31 ? mrkObj.t31 - mrkObj.t260 : 0
                        mrkObj['order'] = m
                        mrkObj['orderBol'] = false
                        stkObjInfo.push(mrkObj)
                    }
                    continue
                }
                stkCd = 'UPC_' + stkList[m]
                mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (mrkObj != null && mrkObj !== undefined) {
                    if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                        mrkObj.tTG = mrkObj.t31 ? mrkObj.t31 - mrkObj.t260 : 0
                        mrkObj['order'] = m
                        mrkObj['orderBol'] = false
                        stkObjInfo.push(mrkObj)
                    }
                    continue
                }
            }
            const msg = { type: commuChanel.misTypeTradvStock, data: stkObjInfo[0], component: this.component }
            inform_stkTradEvent_broadcast(commuChanel.misTypeTradvStock, JSON.stringify(msg))
            this.subrList = stkObjInfo
            //-- add new for sort ---------
            stkObjInfo = this.sortDataSource(stkObjInfo)
            console.log(stkObjInfo)
            //-- add new for sort ---------
            this.setState({ datasource: stkObjInfo, isLoading: false, selected: stkObjInfo[0].t55 }, () => {
                // glb_sv.firsTimeLoad = true
                update_value_for_glb_sv({ component: this.component, key: 'firsTimeLoad', value: true })
                // this.unSubStkList()
                // unSubStkList(this.props.req_component, this.props.get_rq_seq_comp, this.component)
                on_unSubStkList(this.component)
                this.functNewSubscr()
            })
        })
    }

    getMsgObjectStkWL(stkList) {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
            const stkObjInfo = []
            for (let m = 0; m < stkList.length; m++) {
                let stkCd = 'HNX_' + stkList[m]['c2']
                let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (mrkObj != null && mrkObj !== undefined) {
                    if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                        mrkObj.Price = Number(stkList[m]['c5'])
                        mrkObj.Type = stkList[m]['c4'] === '1' ? 'priceboard_buy' : 'priceboard_sell'
                        mrkObj.Link = stkList[m]['c9']
                        mrkObj['order'] = stkObjInfo.length
                        mrkObj['orderBol'] = false
                        stkObjInfo.push(mrkObj)
                    }
                    continue
                }
                stkCd = 'HSX_' + stkList[m]['c2']
                mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (mrkObj != null && mrkObj !== undefined) {
                    if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                        mrkObj.Price = Number(stkList[m]['c5'])
                        mrkObj.Type = stkList[m]['c4'] === '1' ? 'priceboard_buy' : 'priceboard_sell'
                        mrkObj.Link = stkList[m]['c9']
                        mrkObj['order'] = stkObjInfo.length
                        mrkObj['orderBol'] = false
                        stkObjInfo.push(mrkObj)
                    }
                    continue
                }
                stkCd = 'UPC_' + stkList[m]['c2']
                mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
                if (mrkObj != null && mrkObj !== undefined) {
                    if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                        mrkObj.Price = Number(stkList[m]['c5'])
                        mrkObj.Type = stkList[m]['c4'] === '1' ? 'priceboard_buy' : 'priceboard_sell'
                        mrkObj.Link = stkList[m]['c9']
                        mrkObj['order'] = stkObjInfo.length
                        mrkObj['orderBol'] = false
                        stkObjInfo.push(mrkObj)
                    }
                    continue
                }
            }

            const msg = { type: commuChanel.misTypeTradvStock, data: stkObjInfo[0], component: this.component }
            inform_stkTradEvent_broadcast(commuChanel.misTypeTradvStock, JSON.stringify(msg))
            this.subrList = stkObjInfo
            if (stkObjInfo && stkObjInfo.length > 0) {
                //-- add new for sort ---------
                let stkObjInfo2 = this.sortDataSource(stkObjInfo)
                //-- add new for sort ---------
                this.setState({ datasource: stkObjInfo2, isLoading: false, selected: stkObjInfo[0].t55 }, () => {
                    // glb_sv.firsTimeLoad = true
                    update_value_for_glb_sv({ component: this.component, key: 'firsTimeLoad', value: true })
                })
            }
        })
    }

    getDataOneStk = stkOne => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
            let stkObjInfo = [...this.state.datasource]
            let stkCd = 'HNX_' + stkOne
            let mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                    mrkObj['order'] = stkObjInfo.length
                    mrkObj['orderBol'] = false
                    stkObjInfo.push(mrkObj)
                }
            }
            stkCd = 'HSX_' + stkOne
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                    mrkObj['order'] = stkObjInfo.length
                    mrkObj['orderBol'] = false
                    stkObjInfo.push(mrkObj)
                }
            }
            stkCd = 'UPC_' + stkOne
            mrkObj = getMsgObjectByMsgKey(stkCd, HSX_PRC_LIST, HNX_PRC_LIST, UPC_PRC_LIST)
            if (mrkObj != null && mrkObj !== undefined) {
                if (JSON.stringify(stkObjInfo).indexOf(mrkObj['U8'].trim()) < 0) {
                    mrkObj['order'] = stkObjInfo.length
                    mrkObj['orderBol'] = false
                    stkObjInfo.push(mrkObj)
                }
            }
            this.sendStkTradView(mrkObj)
            //-- add new for sort ---------
            stkObjInfo = this.sortDataSource(stkObjInfo)
            //-- add new for sort ---------
            this.setState({ datasource: stkObjInfo, isLoading: false })
            setTimeout(() => {
                this.setState({ selected: stkOne })
                const data = this.state.datasource.find(item => item.t55 === stkOne)
                this.sendStkTradView(data)
                const msg = { type: commuChanel.REFOCUS_SELECT_STK }
                // glb_sv.commonEvent.next(msg)
                inform_broadcast(commuChanel.REFOCUS_SELECT_STK, null)
            }, 500)
        })
    }

    solvingTimeout = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return
        const reqIfMap = this.props.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return
        this.setState({ isLoading: false })
        if (reqIfMap.reqFunct === this.getStock_FcntNm) {
            this.getStock_SendReqFlag = false
        }
        if (reqIfMap.reqFunct === this.getRecommStock_FunctNm) {
            this.getRecommStockFlag = false
        }
        const errmsg = 'common_cant_connect_server'
        glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'warning', '', '', '', this.component)
    }

    functNewSubscr = () => {
        if (this.delayTimeOut) clearTimeout(this.delayTimeOut)
        // glb_sv.firsTimeLoad = false
        update_value_for_glb_sv({ component: this.component, key: 'firsTimeLoad', value: false })
        this.delayTimeOut = setTimeout(() => {
            this.scrolling = false
            const subrList = this.getSubcrList()
            on_unSubStkList(this.component)
            on_subcribeListCont(subrList, this.component);
        }, 100)
    }

    getSubcrList = () => {
        const elvTableH = this.divTable.offsetHeight
        const elvTableHeadH = this.elvTableHead.offsetHeight
        const elvTableFootH = 0
        if (this.subrList === undefined || this.subrList.length === 0) return []
        const rowHeight = (elvTableH - elvTableHeadH - elvTableFootH) / this.subrList.length
        if (rowHeight >= 25) {
            this.rowHeight = rowHeight
        } else this.rowHeight = 21
        const viewHeight = this.scrollTable.offsetHeight
        // const viewHeight = 100;
        const rowinView = Math.ceil((viewHeight - elvTableHeadH) / this.rowHeight)
        if (rowinView <= 0) {
            return []
        }
        const startStk = Math.floor(this.scrollTable.scrollTop / this.rowHeight)
        const endStk = startStk + (rowinView - 1)
        this.startRow = startStk - 5 < 0 ? 0 : startStk - 5
        // this.startRow = startStk;
        this.endRow = endStk + 5 > this.subrList.length - 1 ? this.subrList.length - 1 : endStk + 5
        // this.endRow = endStk;
        let i = 0
        const stkList = []
        for (i = 0; i <= this.endRow - this.startRow; i++) {
            stkList.push(this.subrList[this.startRow + i].t55)
        }
        return stkList
    }


    // update khi thêm, xóa cột khi chọn trong optiontable
    handleColumnChange(name, key, value) {
        // update lại value của this.title_priceboard
        this.title_priceboard.forEach(item => {
            if (item.key === key) item.value = value
        })
        // lưu config priceboard trên local
        localStorage.setItem('configPriceboard', JSON.stringify(this.title_priceboard))
        this.setState({ title_priceboard: this.title_priceboard, forceUpdate: this.state.forceUpdate + 1 })

        if (value === true) {
            show_title(key)
            if (
                key === 'c4pb' ||
                key === 'c5pb' ||
                key === 'c6pb' ||
                key === 'c7pb' ||
                key === 'c8pb' ||
                key === 'c9pb'
            ) {
                this.noColBid = this.noColBid + 1
                this.widthBid = this.widthBid + 54
            }
            if (
                key === 'c13pb' ||
                key === 'c14pb' ||
                key === 'c15pb' ||
                key === 'c16pb' ||
                key === 'c17pb' ||
                key === 'c18pb'
            ) {
                this.noColOffer = this.noColOffer + 1
                this.widthOffer = this.widthOffer + 54
            }
            if (key === 'c19pb' || key === 'c20pb' || key === 'c21pb' || key === 'c22pb') {
                this.noColPrice = this.noColPrice + 1
                this.widthPrice = this.widthPrice + 50
            }
        }
        if (value === false) {
            hide_title(key)
            if (
                key === 'c4pb' ||
                key === 'c5pb' ||
                key === 'c6pb' ||
                key === 'c7pb' ||
                key === 'c8pb' ||
                key === 'c9pb'
            ) {
                this.noColBid = this.noColBid - 1
                this.widthBid = this.widthBid - 54
            }
            if (
                key === 'c13pb' ||
                key === 'c14pb' ||
                key === 'c15pb' ||
                key === 'c16pb' ||
                key === 'c17pb' ||
                key === 'c18pb'
            ) {
                this.noColOffer = this.noColOffer - 1
                this.widthOffer = this.widthOffer - 54
            }
            if (key === 'c19pb' || key === 'c20pb' || key === 'c21pb' || key === 'c22pb') {
                this.noColPrice = this.noColPrice - 1
                this.widthPrice = this.widthPrice - 50
            }
        }
        this.setState({ widthBid: this.widthBid, widthOffer: this.widthOffer, widthPrice: this.widthPrice })
        if (this.noColBid > 0) {
            const elemms = document.querySelectorAll('.bidpb')
            for (let i = 0; i < elemms.length; i++) {
                const current = elemms[i]
                current.colSpan = String(this.noColBid)
            }
            show_title('bidpb')
        } else {
            hide_title('bidpb')
        }
        if (this.noColOffer > 0) {
            const elemms = document.querySelectorAll('.offerpb')
            for (let i = 0; i < elemms.length; i++) {
                const current = elemms[i]
                current.colSpan = String(this.noColOffer)
            }
            show_title('offerpb')
        } else {
            hide_title('offerpb')
        }
        if (this.noColPrice > 0) {
            const elemms = document.getElementsByClassName('pricepb')
            for (let i = 0; i < elemms.length; i++) {
                const current = elemms[i]
                current.colSpan = String(this.noColPrice)
            }
            show_title('pricepb')
        } else {
            hide_title('pricepb')
        }
    }

    handleSearchText = value => {
        this.searchText = value
        if (this.searchText && this.searchText.length > 2) {
            const searchNb = this.state.datasource.findIndex(
                o => o.t55.substr(0, this.searchText.length) === this.searchText.toUpperCase()
            )
            if (searchNb >= 0) {
                const elvTableH = this.divTable.offsetHeight
                const elvTableHeadH = document.getElementById('table_head').offsetHeight
                const rowHeight = (elvTableH - elvTableHeadH) / this.state.datasource.length
                if (rowHeight >= 25) {
                    this.rowHeight = rowHeight
                } else this.rowHeight = 21
                if (this.scrollTable == null) return
                this.scrollTable.scrollTop = searchNb * this.rowHeight
                this.searchText = ''
            }
        }
    }

    // subcr và result process xử lý thêm/xóa mã ck FVL
    addStk2Fvl_functNmResultProc = (reqInfoMap, message) => {
        this.addStk2FvlFlag = false
        if (reqInfoMap.procStat !== 0) {
            return
        }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, this.component)
            }
            return
        } else {
            reqInfoMap.procStat = 2
            // -- update to favorite list --
            update_stock_to_Fvl(0, Number(reqInfoMap.inputParam[1]), reqInfoMap.inputParam[2], this.component, this.get_value_from_glb_sv_seq)
            this.getDataOneStk(this.addStk2Fvl_Stk)
        }
    }

    removeStkFvl_functNmResultProc = (reqInfoMap, message) => {
        this.removeStkFlag = false
        if (reqInfoMap.procStat !== 0) {
            return
        }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            }
            return
        } else {
            reqInfoMap.procStat = 2;
            const arrOne = []
            arrOne.push(this.removeStkFvl_Stk)
            on_unSubcribeFVL(arrOne, this.component)

            let stkListFvl = this.state.datasource.filter(item => item.t55 !== this.removeStkFvl_Stk)
            stkListFvl = this.sortDataSource(stkListFvl)
            this.setState({ datasource: stkListFvl })
            update_stock_to_Fvl(1, Number(reqInfoMap.inputParam[1]), reqInfoMap.inputParam[2], this.component, this.get_value_from_glb_sv_seq)
        }
    }

    getRecommStock_functNmResultProc = (reqInfoMap, message) => {
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getRecommStockFlag = false
            reqInfoMap.resSucc = false
            this.setState({ isLoading: false })
            return
        } else {
            reqInfoMap.procStat = 1
            this.getRecommStockFlag = false
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                jsondata = []
                this.setState({ isLoading: false })
                return
            }

            this.stkListRec = this.stkListRec.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getRecommStockFlag = false
                if (this.stkListRec.length > 0) {
                    let i = 0
                    this.stockList = []
                    for (i = 0; i < this.stkListRec.length; i++) {
                        this.stockList.push(this.stkListRec[i]['c2']) //-- lấy danh sách mã CK
                    }
                    on_subcribeIndexList(this.stockList, this.component)
                }
            }
        }
    }

    solvingFvl_TimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq)
        const reqIfMap = this.props.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        if (reqIfMap.reqFunct === this.addStk2Fvl_functNm) {
            this.addStk2FvlFlag = false
        } else if (reqIfMap.reqFunct === this.removeStkFvl_functNm) {
            this.removeStkFlag = false
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', '', '', this.component)
    }

    removeStkFromFvl(stkCd) {
        this.removeStkFvl_Stk = stkCd
        if (this.state.selected === stkCd && this.state.datasource[0]) {
            const mrkObj = this.state.datasource[0]
            this.sendStkTradView(mrkObj)
            this.setState({ selected: this.state.datasource[0].t55 })
        }
        if (this.removeStkFlag) {
            return
        }
        if (this.current_FvlId === null || this.current_FvlId === undefined || this.current_FvlId === -1) {
            return
        }
        if (this.removeStkFvl_Stk != null && this.removeStkFvl_Stk !== undefined && this.removeStkFvl_Stk !== '') {
            this.removeStkFlag = true

            const request_seq_comp = this.props.get_rq_seq_comp()
            const reqInfo = new requestInfo()
            reqInfo.reqFunct = this.removeStkFvl_functNm
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.removeStkFvl_functNmResultProc;

            // -- service info
            let svInputPrm = new serviceInputPrm()
            svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
            svInputPrm.WorkerName = 'ALTxCommon01'
            svInputPrm.ServiceName = 'ALTxCommon01_0820'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'D'
            svInputPrm.InVal = ['FAV_ITEM_REMOVE', this.current_FvlId + '', this.removeStkFvl_Stk]
            svInputPrm.TotInVal = svInputPrm.InVal.length

            // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
            this.addNewFvl_ReqTimeOut = setTimeout(this.solvingFvl_TimeOut, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal
            // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
            reqInfo.inputParam = svInputPrm.InVal;

            this.props.req_component.set(request_seq_comp, reqInfo)
            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm: svInputPrm
            })

        }
    }

    // kiểm tra xem stk có sẵn trong datasource ko => true thì set selected và gửi tradingview
    // false = > thì thêm gọi service thêm mã CK vào DMQT,set selected và gửi tradingview
    addStk2FVL = stk => {
        this.addStk2Fvl_Stk = stk
        if (this.addStk2FvlFlag) {
            return
        }
        if (this.state.datasource.find(item => item.t55 === stk)) {
            this.setState({ selected: stk })
            const data = this.state.datasource.find(item => item.t55 === stk)
            this.sendStkTradView(data)
        } else if (
            this.addStk2Fvl_Stk != null &&
            this.addStk2Fvl_Stk !== undefined &&
            this.addStk2Fvl_Stk.trim().length > 0
        ) {
            // this.setState({ stkSelected: selected });
            // this.subcribeOneStkFVL(this.addStk2Fvl_Stk)
            // subcribeOneStkFVL(this.props.req_component, this.props.get_rq_seq_comp, this.component, this.addStk2Fvl_Stk)
            on_subcribeOneStkFVLt(this.addStk2Fvl_Stk, this.component)
            this.addNewStk2FvlAfterSubcribe()
        } else {
            this.addStk2Fvl_Stk = null
        }
        inform_broadcast(commuChanel.GET_NEW_FVL, {})
    }

    addNewStk2FvlAfterSubcribe = () => {
        if (this.addStk2FvlFlag) {
            return
        }
        if (this.addStk2Fvl_Stk != null && this.addStk2Fvl_Stk !== undefined && this.addStk2Fvl_Stk.trim().length > 0) {
            // -- push request to request hashmap 
            const reqInfo = new requestInfo();
            const request_seq_comp = this.props.get_rq_seq_comp()
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.addStk2Fvl_functNmResultProc;
            reqInfo.reqFunct = this.addStk2Fvl_functNm
            // -- service info
            let svInputPrm = new serviceInputPrm()
            svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
            svInputPrm.WorkerName = 'ALTxCommon01'
            svInputPrm.ServiceName = 'ALTxCommon01_0820'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'I'
            svInputPrm.InVal = ['FAV_ITEM_ADD', this.current_FvlId + '', this.addStk2Fvl_Stk]
            svInputPrm.TotInVal = svInputPrm.InVal.length

            this.addNewFvl_ReqTimeOut = setTimeout(this.solvingFvl_TimeOut, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal
            reqInfo.inputParam = svInputPrm.InVal;

            this.props.req_component.set(request_seq_comp, reqInfo)
            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm: svInputPrm
            })
        }
    }

    sortTable = key => {
        if (this.mrkIndex === 'HNXINDEX' || this.mrkIndex === 'HNXUPCOMINDEX') return
        let sorted
        if (this.flagSort[key]) {
            this.flagSort[key] = false
            sorted = orderBy(this.subrList, [key], ['asc'])
            this.setState({ datasource: sorted })
        } else {
            this.flagSort[key] = true
            sorted = orderBy(this.subrList, [key], ['desc'])
            this.setState({ datasource: sorted })
        }
    }

    handleShowRoom = () => {
        this.setState({ changRoom: !this.state.changRoom })
        this.status.changRoom = !this.status.changRoom
        localStorage.setItem('configPriceboard_status', JSON.stringify(this.status))
    }
    handelShowRatio = () => {
        this.setState({ showRatio: !this.state.showRatio })
        this.status.showRatio = !this.status.showRatio
        localStorage.setItem('configPriceboard_status', JSON.stringify(this.status))
    }

    handleChangeFocusRow(stk) {
        if (this.state.selected !== stk) this.setState({ selected: stk })
    }

    recursive = () => {
        setTimeout(() => {
            let hasMore = this.state.datasource.length + 1 < this.subrList.length
            this.setState((prev, props) => ({
                datasource: this.subrList.slice(0, prev.datasource.length + 100),
            }))
            if (hasMore) this.recursive()
            else this.setState({ isLoading: false })
        }, 0)
    }

    getCoverWarrList = () => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'HSX_PRC_LIST', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, HSX_PRC_LIST) => {
            // console.log(HSX_PRC_LIST)
            if (HSX_PRC_LIST.length === 0) {
                this.setState({ datasource: [], isLoading: false })
                return
            }
            let j = 0
            // out memory crash
            for (let i = 0; i < HSX_PRC_LIST.length; i++) {
                if (HSX_PRC_LIST[i] && HSX_PRC_LIST[i]['t167'] === 'CW') {
                    const mrkObj = HSX_PRC_LIST[i]
                    mrkObj.tTG = mrkObj.t31 ? mrkObj.t31 - mrkObj.t260 : 0
                    mrkObj['order'] = j++
                    mrkObj['orderBol'] = false
                    this.subrList.push(mrkObj)
                    this.stockList.push(HSX_PRC_LIST[i]['t55'])
                }
            }
            // this.subrList.sort((a, b) => (a.t55 > b.t55) ? 1 : ((b.t55 > a.t55) ? -1 : 0));
            this.subrList = this.sortDataSource(this.subrList)
            this.setState({ datasource: this.subrList, selected: this.subrList[0] })
            if (this.stockList.length > 0) {
                on_subcribeIndexList(this.stockList, this.component)
            }
        })

    }

    transLang = text => {
        return this.props.t(text)
    }

    //-- sẽ nghe event doublick của row -> sort lại theo vị trí của mã CK hiện tại
    moveStk2FirsPri = stk => {
        const index = this.state.datasource.findIndex(o => o.t55 === stk)
        if (index < 0) return
        if (!this.state.datasource[index].orderBol) {
            for (let i = 0; i < this.state.datasource.length; i++) {
                if (this.state.datasource[i].order < this.state.datasource[index].order)
                    this.state.datasource[i].order = this.state.datasource[i].order + 1
            }
            this.state.datasource[index].order = 0
            this.state.datasource[index].orderBol = true
        } else {
            this.state.datasource[index].orderBol = false
            for (let i = index; i < this.state.datasource.length; i++) {
                if (this.state.datasource[i + 1].orderBol === true) {
                    this.state.datasource[i + 1].order = this.state.datasource[i + 1].order - 1
                } else {
                    this.state.datasource[index].order = this.state.datasource[i + 1].order
                    break
                }
            }
        }
        const sorted = orderBy(this.state.datasource, ['order'], ['asc'])
        this.setState({ datasource: sorted })
        let tempData = []
        //-- Lưu local store mảng ưu tiên
        tempData = sorted.filter(x => x.orderBol == true)
        if (tempData.length > 0) {
            const newArr = tempData.map(x => ({ t55: x.t55, order: x.order }))
            localStorage.setItem(this.curentIndexObj.type + '|' + this.curentIndexObj.key, JSON.stringify(newArr))
        } else {
            localStorage.removeItem(this.curentIndexObj.type + '|' + this.curentIndexObj.key)
        }
        // {"type":"WL","key":"173","value":"A-Solution KN2"} => DM khuyến nghị
        // {"type":"FVL","key":2944,"value":"Financial"} => DM quan tâm
        // {"type":"IND","key":"VN30","value":"VN30"} => Chỉ số index
    }
    //-- sắp xếp lại mảng theo dữ liệu lưu trong localstore
    sortDataSource = data => {
        const datasource = localStorage.getItem(this.curentIndexObj.type + '|' + this.curentIndexObj.key)
        if (!datasource || data.length == 0) return data
        let sortData = []
        try {
            sortData = JSON.parse(datasource)
        } catch (error) {
            return data
        }
        if (!sortData || sortData.length == 0) return data
        let array1 = [],
            array2 = []
        for (let i = 0; i < data.length; i++) {
            const find = sortData.find(x => x.t55 === data[i].t55)
            if (find) {
                data[i].order = find.order
                data[i].orderBol = true
                array1.push(data[i])
            } else {
                data[i].order = 9999999999
                data[i].orderBol = false
                array2.push(data[i])
            }
        }
        const array11 = orderBy(array1, ['order'], ['asc'])
        for (let j = 0; j < array11.length; j++) {
            array11[j].order = j
        }
        for (let k = 0; k < array2.length; k++) {
            array2[k].order = array1.length + k
        }
        return array11.concat(array2)
    }

    render() {
        const { t } = this.props
        const cursorSort = this.mrkIndex === 'HNXINDEX' || this.mrkIndex === 'HNXUPCOMINDEX' ? '' : 'cursor_ponter'
        return (
            <>
                <div
                    ref={el => (this.scrollTable = el)}
                    onScroll={(e) => this.handleScroll(this)}
                    id="divPriceBoard"
                    className="divPriceBoard"
                >
                    <Popover
                        isOpen={this.state.isPopoverOpenMenu}
                        position={'top'}
                        onClickOutside={() => this.setState({ isPopoverOpenMenu: false })}
                        content={({ position, targetRect, popoverRect }) => (
                            <div className="popover-search">
                                <OptionTable
                                    t={this.transLang}
                                    columnInfo={this.state.title_priceboard}
                                    onColumnChange={this.handleColumnChange}
                                />
                            </div>
                        )}
                    >
                        <span
                            className="left5"
                            style={{ position: 'absolute', zIndex: 99, marginTop: 11 }}
                            onClick={() => this.setState({ isPopoverOpenMenu: !this.state.isPopoverOpenMenu })}
                        >
                            <i className="fa fa-list-ul colorOption"></i>
                        </span>
                    </Popover>

                    <table
                        id="table_price"
                        className="table_priceboardTH table_priceboard table_priceboard_content table-sm optiontable"
                    >
                        <thead id="table_head">
                            <tr>
                                <th width="63" rowSpan="2" className=" text-center td_stkcd " style={{ width: 90 }}>
                                    <span style={{ marginLeft: 18 }}>{t('short_symbol')}</span>
                                </th>

                                {/* Thông tin khuyến nghị */}
                                {this.state.isWL && (
                                    <th colSpan="2" className="text-center th_rec" style={{ width: 161 }}>
                                        {t('recommendations')}
                                    </th>
                                )}
                                <th rowSpan="2" width="50" className=" text-center  td_price c2pb">
                                    {t('floor')}
                                </th>
                                <th rowSpan="2" width="50" className=" text-center  td_price c1pb">
                                    {t('reference')}
                                </th>
                                <th rowSpan="2" width="50" className=" text-center  td_price c3pb">
                                    {t('ceiling')}
                                </th>

                                <th colSpan="6" className="text-center bidpb" style={{ width: this.state.widthBid }}>
                                    {t('priceboard_bid')}
                                </th>
                                <th colSpan="3" className="text-center " style={{ width: 164 }}>
                                    {t('priceboard_matching')}
                                </th>
                                <th
                                    colSpan="6"
                                    className="text-center offerpb"
                                    style={{ width: this.state.widthOffer }}
                                >
                                    {t('priceboard_offer')}
                                </th>

                                {this.state.title_priceboard[16].value && (
                                    <th
                                        width="63"
                                        rowSpan="2"
                                        className={' text-center c26pb ' + cursorSort}
                                        onClick={() => this.sortTable('t387')}
                                    >
                                        {t('sum_trading_qty_short')}
                                    </th>
                                )}

                                <th
                                    colSpan="4"
                                    className="text-center  pricepb"
                                    style={{ width: this.state.widthPrice }}
                                >
                                    {t('priceboard_price')}
                                </th>

                                <th colSpan="2" width="134" className="text-center c23pb">
                                    {t('priceboard_foreign')}
                                </th>
                            </tr>
                            <tr>
                                {this.state.isWL && (
                                    <th width="50" className="text-center th_price_wl">
                                        {t('priceboard_price')}
                                    </th>
                                )}
                                {this.state.isWL && (
                                    <th width="60" className="text-center th_type_wl">
                                        {t('sell_buy_tp')}
                                    </th>
                                )}

                                <th width="50" className=" text-center td_price c4pb">
                                    {t('priceboard_price3')}
                                </th>
                                <th width="56" className=" text-center td_volumn c5pb">
                                    {t('priceboard_vol3')}
                                </th>
                                <th width="50" className=" text-center td_price c6pb">
                                    {t('priceboard_price2')}
                                </th>
                                <th width="56" className=" text-center td_volumn c7pb">
                                    {t('priceboard_vol2')}
                                </th>
                                <th width="50" className=" text-center td_price c8pb">
                                    {t('priceboard_price1')}
                                </th>
                                <th width="56" className=" text-center td_volumn c9pb">
                                    {t('priceboard_vol1')}
                                </th>

                                <th width="50" className=" text-center td_price c10pb">
                                    <span className="chngTG" style={{ marginLeft: 3 }}>
                                        <i
                                            onClick={this.handelShowRatio}
                                            className="cursor_ponter fa fa-caret-left"
                                        ></i>
                                        <span className={'' + cursorSort} onClick={() => this.sortTable('tTG')}>
                                            &nbsp; + /- &nbsp;
                                            </span>
                                        <i
                                            onClick={this.handelShowRatio}
                                            className="cursor_ponter fa fa-caret-right"
                                        ></i>
                                    </span>
                                </th>
                                <th width="50" className=" text-center td_price c11pb">
                                    {t('priceboard_price')}
                                </th>
                                <th width="56" className=" text-center td_volumn  c12pb">
                                    {t('volume_evaluation')}
                                </th>

                                <th width="50" className=" text-center td_price c13pb">
                                    {t('priceboard_price1')}
                                </th>
                                <th width="56" className=" text-center td_volumn c14pb">
                                    {t('priceboard_vol1')}
                                </th>
                                <th width="50" className=" text-center td_price c15pb">
                                    {t('priceboard_price2')}
                                </th>
                                <th width="56" className=" text-center td_volumn c16pb">
                                    {t('priceboard_vol2')}
                                </th>
                                <th width="50" className=" text-center td_price c17pb">
                                    {t('priceboard_price3')}
                                </th>
                                <th width="56" className=" text-center td_volumn c18pb">
                                    {t('priceboard_vol3')}
                                </th>

                                <th width="50" className=" text-center  td_price c19pb">
                                    {t('priceboard_open')}
                                </th>
                                <th width="50" className=" text-center  td_price c20pb">
                                    {t('priceboard_avg')}
                                </th>
                                <th width="50" className=" text-center  td_price c21pb">
                                    {t('priceboard_low')}
                                </th>
                                <th width="50" className=" text-center  td_price c22pb">
                                    {t('priceboard_hight')}
                                </th>

                                {!this.state.changRoom && (
                                    <th width="134" colSpan="2" className="ndtnRoom text-center  c23pb">
                                        <i onClick={this.handleShowRoom} className="cursor_ponter fa fa-caret-left">
                                            &nbsp;&nbsp;&nbsp;
                                            </i>
                                        <span> Room </span>
                                        <span>&nbsp;&nbsp;&nbsp;</span>
                                        <i
                                            onClick={this.handleShowRoom}
                                            className="cursor_ponter fa fa-caret-right"
                                        ></i>
                                    </th>
                                )}
                                {this.state.changRoom && (
                                    <th width="67" className="ndtnBuy text-center td_volumn  c23pb">
                                        <i onClick={this.handleShowRoom} className="cursor_ponter fa fa-caret-left"></i>{' '}
                                        {t('priceboard_buy')}
                                    </th>
                                )}
                                {this.state.changRoom && (
                                    <th width="67" className="ndtnBuy text-center td_volumn  c23pb">
                                        {t('priceboard_sell')}{' '}
                                        <i
                                            onClick={this.handleShowRoom}
                                            className="cursor_ponter fa fa-caret-right"
                                        ></i>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody style={{ visibility: this.state.isLoading ? 'hidden' : '' }}>
                            {this.state.datasource.map(item => (
                                <ViewRow
                                    t={t}
                                    key={item.t55}
                                    item={item}
                                    type={this.state.type}
                                    removeStkFromFvl={this.removeStkFromFvl}
                                    showRatio={this.state.showRatio}
                                    forceUpdate={this.state.forceUpdate}
                                    changRoom={this.state.changRoom}
                                    selected={this.state.selected}
                                    handleChangeFocusRow={this.handleChangeFocusRow}
                                    title_priceboard={this.state.title_priceboard}
                                    component={this.component}
                                    req_component={this.props.req_component}
                                    get_rq_seq_comp={this.props.get_rq_seq_comp}
                                    get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div
                    className={!this.state.isLoading ? 'hidden' : 'loading'}
                    style={{ position: 'absolute', top: '20%', left: '50%' }}
                >
                    <i className="fa fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
                    {t('loading_main_page')}
                </div>
            </>
        )
    }
}

const ViewRow = React.memo(
    ({
        t,
        item,
        type,
        removeStkFromFvl,
        showRatio,
        changRoom,
        selected,
        handleChangeFocusRow,
        title_priceboard,
        component,
        req_component,
        get_rq_seq_comp,
        get_value_from_glb_sv_seq,
        forceUpdate,
    }) => {
        return (
            <TableRowPriceboard
                t={t}
                row={item}
                type={type}
                removeStkFromFvl={removeStkFromFvl}
                showRatio={showRatio}
                changRoom={changRoom}
                selected={selected}
                handleChangeFocusRow={handleChangeFocusRow}
                title_priceboard={title_priceboard}
                component={component}
                req_component={req_component}
                get_rq_seq_comp={get_rq_seq_comp}
                get_value_from_glb_sv_seq={get_value_from_glb_sv_seq}
            />
        )
    },
    (prevProps, nextProps) => {
        const result =
            JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item) &&
            prevProps.type === nextProps.type &&
            prevProps.showRatio === nextProps.showRatio &&
            prevProps.changRoom === nextProps.changRoom &&
            prevProps.selected === nextProps.selected &&
            prevProps.forceUpdate === nextProps.forceUpdate
        return result
    }
)

export default translate('translations')(TablePriceboard)
