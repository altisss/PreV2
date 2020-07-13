import React, { PureComponent } from 'react'
import TableIndexList from '../../conponents/list-index/table-index'
import glb_sv from '../../utils/globalSv/service/global_service'
import socket_sv from '../../utils/globalSv/service/socket_service'
import { Subject } from 'rxjs'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import commuChanel from '../../constants/commChanel'
import { translate } from 'react-i18next'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { bf_popout } from '../../utils/bf_popout'
import { reply_send_req } from '../../utils/send_req'
import { load_stk_list, load_tradview_stk_list } from '../../utils/load_stk_list'
import { getUniqueListBy } from '../../utils/utils_func'
import { inform_broadcast } from '../../utils/broadcast_service'
import TablePriceboard from '../../conponents/table_priceboard/table_priceboard'
import SearchRightInfo from '../../conponents/search_right_info/search_right_info'
import functionList from '../../constants/functionList'
import { getMsgObjectByMsgKey } from '../../utils/get_msg_obj_by_msg_key'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv'
import { on_unSubStkList, on_unsubcribeIndex } from '../../utils/subcrible_functions'
import AddModFav from '../../conponents/add-mod-fav/add_mod_fav'
import PutThroughView from '../../conponents/put-through/put-through'

const remote = require('electron').remote;


class MarketInfor extends PureComponent {
    constructor(props) {
        super(props)
        this.component = this.props.component
        this.req_component = new Map();
        this.popin_window = this.popin_window.bind(this);

        this.request_seq_comp = 0;
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        };
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq

        if (this.props.node) {
            this.props.node.setEventListener("close", (p) => {
                on_unSubStkList(this.component)
                on_unsubcribeIndex([], this.component)
                window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
                window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ACTION_SUCCUSS}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.REFOCUS_SELECT_STK}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.REGET_RECOMMAND}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.UPDATE_GRP_FVL}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.LOGIN_SUCCESS}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.getStockListChangeLang}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.OPEN_MODAL_AddModFav}_${this.component}`)

                // event from table_priceboard
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANG_INDEX}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.STK_FROM_MENU}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.MOVE_STK2FIRST_PRTABLE}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeReconect}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.UPDATE_FVL}_${this.component}`)
                //   window.ipcRenderer.removeAllListeners(`${commuChanel.getStockListChangeLang}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_HEIGHT_PRICEBOARD}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeTradvStock}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.SubMarketInfor}_${this.component}`)

                // event from table_row_priceboard
                window.ipcRenderer.removeAllListeners(`${commuChanel.mrkInfoEvent}_${this.component}`)

                // event from table-index
                window.ipcRenderer.removeAllListeners(`${commuChanel.event_ServerPushIndexChart}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`)

                // event from put-through
                //   window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeReconect}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.event_ClientReqMRKRcv}_${this.component}`)
            })

        }
        this.state = {
            name: this.props.name,
            datalistHose: [],
            datalistHnx: [],
            dataFavorite: [],
            datalistUpc: [],
            fvlNew: '',
            fvl_delete: '',
            show: false,
            stkList: [],
            selectedStkName: null,
            suggest_grp: [],
            dataWatchList: [],
            newsList: [],
            deepNewsList: [],
            refreshFlag: '',
            isChangeTheme: true,

            themePage: this.props.themePage,
            language: this.props.language,
            TablePriceboard: false,
            node: {},
            key: '',

            addfav: false,
            path: null,
            node_key: null,
            isShowPriceboard: true,
            key_put_through: null,
        }



        /*--- declare variable  --------------------*/
        this.subcr_ClientReqRcv = new Subject()
        this.getFlv_FcntNm = 'GETFLV-01'
        this.firstload = true
        this.flagData = false
        this.isShow = true

        this.getRecommStock_FunctNm = 'RECOMMSTK_001'
        this.getRecomm_FunctNm = 'RECOMMSTK_002'
        this.suggest_grp = []
        this.flagDataWL = true

        this.getNewsListFlag = false
        this.getNewsList_FunctNm = 'RECOMMSTK_003'

        this.getDeepNewsList_FunctNm = 'getDeepNewsList_FunctNm'
        this.getDeepNewsListFlag = false
        this.keyGetLastetNews = 1
        this.getSuggestList()
        this.getLastetNews = this.getLastetNews.bind(this)
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'authFlag', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, authFlag) => {
            this.authFlag = authFlag
        })
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
            console.log('update_state_af_popout', this.state)
            
            change_theme(this.state.themePage)
            change_language(this.state.language, this.props)
            // window.ipcRenderer.send(commuChanel.SubMarketInfor, { node: this.state.node, key: this.state.key, component: this.component })
            if(agrs.state.node) {
                console.log('componentWillReceiveProps', this.state.node)
                
                window.ipcRenderer.send(commuChanel.SubMarketInfor, { node: agrs.state.node, key: agrs.state.key, component: this.component })
            }
            else this.getFavlInfo()
        })

        // update state after popin
        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // console.log(agrs.state)
            // this.setState(agrs.state)
            // window.ipcRenderer.send(commuChanel.SubMarketInfor, { node: agrs.state.node, key: agrs.state.key, component: this.component })

        })
    }

    getFavlInfo = () => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'objShareGlb', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, objShareGlb) => {
            //update session for popout component
            glb_sv.objShareGlb = objShareGlb
            let svInputPrm = new serviceInputPrm()
            // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
            // clientSeq = socket_sv.getRqSeq()
            const reqInfo = new requestInfo();
            const request_seq_comp = this.get_rq_seq_comp()
            reqInfo.reqFunct = this.getFlv_FcntNm
            reqInfo.component = this.component
            reqInfo.receiveFunct = this.getFvlResultProc;
            reqInfo.procStat = 0
            reqInfo.reqTime = new Date()
            // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
            svInputPrm.WorkerName = 'ALTqCommon01'
            svInputPrm.ServiceName = 'ALTqCommon01_0820_02'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'Q'
            svInputPrm.InVal = ['3', '', '0']
            svInputPrm.TotInVal = svInputPrm.InVal.length
            console.log("getFavlInfo -> svInputPrm", svInputPrm)
            // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
            // update_value_for_glb_sv({ component: this.component, key: 'FVL_STK_LIST', value: [] })

            this.rightListTemple = [];
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

        // -- request to get favorite list


    }

    getSuggestList = () => {
        // -- request to get suggest list
        this.flagDataWL = false

        const reqInfo = new requestInfo();
        const request_seq_comp = this.get_rq_seq_comp()
        reqInfo.reqFunct = this.getRecomm_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getRecommResultProc;
        reqInfo.procStat = 0
        reqInfo.reqTime = new Date()
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqNews'
        svInputPrm.ServiceName = 'ALTqNews_Suggest'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['01']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.getRecommFunct_ReqTimeOut = setTimeout(this.solvingIndex_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        this.rightListTemple = [];
        this.suggestGrpList = []

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

    solvingIndex_TimeOut = cltSeq => {
        if (cltSeq == null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap == null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        if (reqIfMap.reqFunct === this.getRecommStock_FunctNm) {
            this.getRecommStockFlag = false
        } else if (reqIfMap.reqFunct === this.getRecomm_FunctNm) {
            this.getRecommFlag = false
            this.flagDataWL = true
        } else if (reqIfMap.reqFunct === this.getNewsList_FunctNm) {
            this.getNewsListFlag = false
            this.setState({ refreshFlag: '' })
        } else if (reqIfMap.reqFunct === this.getDeepNewsList_FunctNm) {
            this.getDeepNewsListFlag = false
            this.setState({ refreshFlag: '' })
        }
    }

    componentDidMount() {
        if(this.props.node && glb_sv.authFlag) this.getFavlInfo()

        window.ipcRenderer.on(`${commuChanel.OPEN_MODAL_AddModFav}_${this.component}`, (event, args) => {
            if (args.component === this.component) {
                if (this.state.addfav) this.setState({ addfav: false })
                this.setState({ path: args.path, node_key: args.node_key }, () => {
                    this.setState({ addfav: true })
                })
            }
        })
        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs)
            this.setState({ themePage: agrs })
            this.setState({ isChangeTheme: false }, () => {
                this.setState({ isChangeTheme: true })
            })
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
            change_language(agrs, this.props)
            this.setState({ language: agrs })
            this.getSuggestList()
            if (this.keyGetLastetNews === 1) this.getHotNews()
            if (this.keyGetLastetNews === 2) this.getDeepNewsList()
        })

        window.ipcRenderer.on(`${commuChanel.ACTION_SUCCUSS}_${this.component}`, (event, msg) => {
            if (msg.type === commuChanel.ACTION_SUCCUSS && msg.key === 'update-fav') {
                this.getFavlInfo()
                if (msg.fvlNew) this.setState({ fvlNew: msg.fvlNew })
                if (msg.fvl_delete) this.setState({ fvl_delete: msg.fvl_delete })
            }
        })



        window.ipcRenderer.on(`${commuChanel.REGET_RECOMMAND}_${this.component}`, (event, msg) => {
            this.getSuggestList()
        })

        window.ipcRenderer.on(`${commuChanel.UPDATE_GRP_FVL}_${this.component}`, (event, msg) => {
            console.log(this.component)
            this.getFlvFormatInfo()
        })

        window.ipcRenderer.on(`${commuChanel.GET_NEW_FVL}_${this.component}`, (event, msg) => {
            console.log(this.component)
            this.getFavlInfo()
        })

        window.ipcRenderer.on(`${commuChanel.LOGIN_SUCCESS}_${this.component}`, (event, msg) => {
            const sq = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['localData', 'authFlag'], sq: sq })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const localData = agrs.get('localData')
                this.authFlag = agrs.get('authFlag')
                if (localData.sidebar.isHotNews) this.getHotNews()
                else {
                    this.keyGetLastetNews = 2
                    this.getDeepNewsList()
                }
                this.getSuggestList()
                setTimeout(() => this.getFavlInfo(), 100)
            })

        })

        window.ipcRenderer.on(`${commuChanel.getStockListChangeLang}_${this.component}`, (event, msg) => {
            this.loadStkList()
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
            // console.log('this.req_component', agrs);
            reply_send_req(agrs, this.req_component)
        })

        //handle open put-through
        window.ipcRenderer.on(`${commuChanel.SubMarketInfor}_${this.component}`, (event, agrs) => {
            console.log(agrs)
            if (agrs.node.value === 'put_through_tab') {
                this.setState({ key_put_through: agrs.node.key }, () => {
                    if (this.state.isShowPriceboard) this.setState({ isShowPriceboard: false })
                })
            }
            else {
                if (!(this.state.isShowPriceboard)) this.setState({ isShowPriceboard: true })
            }
        })

        // window.ipcRenderer.on(`tradview_StkList_HSX_${this.component}`, (event, agrs) => {
        //     console.log('tradview_StkList_HSX')
        //     const sq1 = this.get_value_from_glb_sv_seq()
        //     window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['tradview_StkList_HSX', 'tradview_StkList_HNX', 'tradview_StkList_UPC'], sq: sq1 })
        //     window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq1}`, (event, agrs) => {

        //         let tradview_StkList_HSX = agrs.get('tradview_StkList_HSX')
        //         let tradview_StkList_HNX = agrs.get('tradview_StkList_HNX')
        //         let tradview_StkList_UPC = agrs.get('tradview_StkList_UPC')
        //         // console.log(tradview_StkList_HSX.length)
        //         if (tradview_StkList_HSX.length > 1) {

        //             const tradview_StkList_HSX_new = tradview_StkList_HSX
        //             update_value_for_glb_sv({ component: this.component, key: 'tradview_StkList_HSX', value: tradview_StkList_HSX_new })

        //             const tradview_StkList_HNX_new = tradview_StkList_HNX
        //             update_value_for_glb_sv({ component: this.component, key: 'tradview_StkList_HNX', value: tradview_StkList_HNX_new })

        //             const tradview_StkList_UPC_new = tradview_StkList_UPC
        //             update_value_for_glb_sv({ component: this.component, key: 'tradview_StkList_UPC', value: tradview_StkList_UPC_new })
        //             this.setState({
        //                 datalistHose: tradview_StkList_HSX_new,
        //                 datalistHnx: tradview_StkList_HNX_new,
        //                 datalistUpc: tradview_StkList_UPC_new,
        //             })
        //         }
        //     })
        // })

        //fix me
        const interVal = setInterval(() => {
            const sq1 = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['tradview_StkList_HSX', 'tradview_StkList_HNX', 'tradview_StkList_UPC'], sq: sq1 })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq1}`, (event, agrs) => {

                let tradview_StkList_HSX = agrs.get('tradview_StkList_HSX')
                let tradview_StkList_HNX = agrs.get('tradview_StkList_HNX')
                let tradview_StkList_UPC = agrs.get('tradview_StkList_UPC')
                // console.log(tradview_StkList_HSX.length)
                if (tradview_StkList_HSX.length > 4) {

                    const tradview_StkList_HSX_new = tradview_StkList_HSX
                    update_value_for_glb_sv({ component: this.component, key: 'tradview_StkList_HSX', value: tradview_StkList_HSX_new })

                    const tradview_StkList_HNX_new = tradview_StkList_HNX
                    update_value_for_glb_sv({ component: this.component, key: 'tradview_StkList_HNX', value: tradview_StkList_HNX_new })

                    const tradview_StkList_UPC_new = tradview_StkList_UPC
                    update_value_for_glb_sv({ component: this.component, key: 'tradview_StkList_UPC', value: tradview_StkList_UPC_new })
                    this.setState({
                        datalistHose: tradview_StkList_HSX_new,
                        datalistHnx: tradview_StkList_HNX_new,
                        datalistUpc: tradview_StkList_UPC_new,
                    })
                    clearInterval(interVal)
                }

            }, 300)
        })

        //fix me
        const interValShow = setInterval(() => {
            // console.log(this.state.datalistHose.length, this.flagDataWL, glb_sv.finishGetImsg)
            const sq1 = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'finishGetImsg', sq: sq1 })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq1}`, (event, agrs) => {
                if (this.state.datalistHose.length > 4 && this.flagDataWL && agrs) {
                    console.log('tradview_StkList_HSX', this.state.datalistHose)
                    clearInterval(interValShow)
                    this.setState({ show:false }, () => {this.setState({show: true})})
                    update_value_for_glb_sv({ component: this.component, key: 'tradingViewPage', value: true })
                }
            })

        }, 500)


        const sq2 = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq2 })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq2}`, (event, agrs) => {
            if (!agrs.length) {
                load_stk_list(this.req_component, this.get_rq_seq_comp(), this.component)
            }
        })

        this.loadStkList()

        // load_tradview_stk_list(this.req_component, this.get_rq_seq_comp, this.component, this.get_value_from_glb_sv_seq)

    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)

    }

    loadStkList() {
        setTimeout(() => {
            const sq = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                // console.log(agrs)
                const stkList = agrs
                if (agrs.length === 0) this.loadStkList()
                else {
                    this.setState({
                        stkList,
                    })
                }
            })

        }, 1000)
    }

    set_node_key = (node, key) => {
        this.setState({ node: node, key: key })
    }

    findStkOfIndex(element, key) {
        const list = element.data
        if (list === undefined) return null
        const isIndex = list.find(item => item === key)
        if (isIndex) return element
    }

    handleChangeStkName = selected => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'recentStkList', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const stk = selected.value

            const isStk = agrs.findIndex(item => item === stk)
            if (isStk < 0) agrs.push(stk)
            if (agrs.length > 10) agrs.shift()
            localStorage.setItem('recentStkList', JSON.stringify(agrs))
            const msg = { type: commuChanel.STK_FROM_MENU, data: stk, component: this.component }
            // glb_sv.commonEvent.next(msg)
            inform_broadcast(commuChanel.STK_FROM_MENU, msg)
        })


    }

    getFvlResultProc = (reqInfoMap, message) => {
        console.log('getFavlInfo', message)
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['FVL_STK_LIST', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const FVL_STK_LIST = agrs.get('FVL_STK_LIST')
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
            let jsonArr = []
            const strdata = message['Data']
            if (strdata === null || strdata === undefined || strdata.length === 0) {
                return
            }
            try {
                jsonArr = JSON.parse(strdata)
            } catch (error) {
                // this.logMessage('getFvlResultProc Error when parse json the market info: ' + error);
                return
            }
            // glb_sv.FVL_STK_LIST = []
            update_value_for_glb_sv({ component: this.component, key: 'FVL_STK_LIST', value: [] })

            if (Number(message['Result']) === 1 && jsonArr.length > 0) {
                let fvlGroup = []
                try {
                    fvlGroup = jsonArr
                } catch (error) {
                    // this.logMessage('Error when parse json the notify info: ' + error);
                    fvlGroup = []
                }
                console.log('jsonArr',jsonArr)
                if (fvlGroup.length > 0 && fvlGroup[0]['c1'] != null && fvlGroup[0]['c1'] !== '') {
                    for (let i = 0; i < fvlGroup.length; i++) {
                        const fvlObj = {
                            GRP_ID: fvlGroup[i]['c1'],
                            GRP_NM: fvlGroup[i]['c2'],
                            STK_LIST: [],
                            FVL_PRICEBOARD: [],
                        }
                        FVL_STK_LIST.push(fvlObj)
                       
                    }
                }
                // this.setState({dataFavorite: FVL_STK_LIST})
                console.log("jsonArr", this.state.dataFavorite)
            }
            update_value_for_glb_sv({ component: this.component, key: 'FVL_STK_LIST', value: FVL_STK_LIST })
            this.getFlvFormatInfo()
        })



    }

    // handled 
    getRecommResultProc = (reqInfoMap, message) => {
        // console.log(message)
        // console.log(reqInfoMap)
        const cltSeqResult = message.ClientSeq
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getRecommFlag = false
            reqInfoMap.resSucc = false
            this.flagDataWL = true
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                jsondata = []
                this.flagDataWL = true
                this.getRecommFlag = false
                // glb_sv.suggestGrpList = []
                update_value_for_glb_sv({ component: this.component, key: 'suggestGrpList', value: [] })
                return
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            // console.log(reqInfoMap)
            this.suggestGrpList = this.suggestGrpList.concat(jsondata)
            // console.log(this.suggestGrpList)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getRecommFlag = false
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                if (this.suggestGrpList.length > 0) {
                    // glb_sv.suggestGrpList = this.suggestGrpList
                    update_value_for_glb_sv({ component: this.component, key: 'suggestGrpList', value: this.suggestGrpList })

                    const arr = []
                    for (let i = 0; i < this.suggestGrpList.length; i++) {
                        const formObj = {}
                        formObj['key'] = this.suggestGrpList[i]['c0']
                        formObj['value'] = this.suggestGrpList[i]['c2']
                        formObj['rateNum'] = Number(this.suggestGrpList[i]['c4'])
                        formObj['userNum'] = Number(this.suggestGrpList[i]['c5'])
                        formObj['userVoted'] = Number(this.suggestGrpList[i]['c6'])
                        arr.push(formObj)
                    }
                    this.setState({ dataWatchList: arr }, () => (this.flagDataWL = true))
                }
            }
        }
    }

    getNewsListResultProc = (message, reqInfoMap) => {
        clearTimeout(this.getNewsList_ReqTimeOut)
        this.setState({ refreshFlag: '' })
        // if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getNewsListFlag = false
            reqInfoMap.resSucc = false
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                jsondata = []
                this.getNewsListFlag = false
                this.setState({ newsList: [], refreshFlag: '' })
                return
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            this.newsList = this.newsList.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getNewsListFlag = false
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                // if (this.newsList && this.newsList.length > 0) {
                this.setState({ newsList: this.newsList }, () => {
                    setTimeout(() => this.setState({ refreshFlag: '' }), 500)
                })
                // }
            }
        }
    }

    getDeepNewsListResultProc = (message, reqInfoMap) => {
        // if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
        // -- process after get result --
        clearTimeout(this.getDeepNewsList_ReqTimeOut)
        this.setState({ refreshFlag: '' })
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getDeepNewsListFlag = false
            reqInfoMap.resSucc = false
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            return
        } else {
            reqInfoMap.procStat = 1
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
            } catch (err) {
                jsondata = []
                this.getDeepNewsListFlag = false
                this.setState({ deepNewsList: [], refreshFlag: '' })
                return
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            this.deepNewsList = this.deepNewsList.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getDeepNewsListFlag = false
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                // if (this.deepNewsList && this.deepNewsList.length > 0) {
                this.setState({ deepNewsList: [...this.deepNewsList] })
                // }
            }
        }
    }

    getFlvFormatInfo = () => {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['FVL_STK_LIST', 'flv_keyvalue'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            let FVL_STK_LIST = agrs.get('FVL_STK_LIST')
            let flv_keyvalue = agrs.get('flv_keyvalue')

            let i = 0
            // glb_sv.flv_keyvalue = []
            flv_keyvalue = []
            console.log(FVL_STK_LIST, flv_keyvalue)

            update_value_for_glb_sv({ component: this.component, key: 'flv_keyvalue', value: flv_keyvalue })
            for (i = 0; i < FVL_STK_LIST.length; i++) {
                const formObj = {}
                formObj['key'] = FVL_STK_LIST[i]['GRP_ID']
                formObj['value'] = FVL_STK_LIST[i]['GRP_NM']
                const dupObj = flv_keyvalue.find(item => item.key === formObj['key'])
                if (dupObj === undefined) {
                    flv_keyvalue.push(formObj)
                    update_value_for_glb_sv({ component: this.component, key: 'flv_keyvalue', value: flv_keyvalue })
                }
            }
            const dataFavorite = flv_keyvalue
            console.log(dataFavorite)
            this.setState({ dataFavorite })
            if (!this.firstload) return
            this.firstload = false
            if (flv_keyvalue.length > 0) {
                const msg = {
                    type: commuChanel.CHANG_INDEX,
                    value: { type: 'FVL', key: flv_keyvalue[0].key, value: flv_keyvalue[0].value, component: this.component },
                }
                // glb_sv.commonEvent.next(msg)
                inform_broadcast(commuChanel.CHANG_INDEX, msg)
                // glb_sv.indexFocus = 'FVL'
                update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: 'FVL' })
            } else if (this.state.dataWatchList.length > 0) {
                const messObj = {
                    type: commuChanel.CHANG_INDEX,
                    value: { type: 'WL', key: this.state.dataWatchList[0].key, value: this.state.dataWatchList[0].value, component: this.component },
                }
                // glb_sv.commonEvent.next(messObj)
                inform_broadcast(commuChanel.CHANG_INDEX, messObj)
                // glb_sv.indexFocus = 'WL'
                update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: 'WL' })
            } else {
                const messObj = {
                    type: commuChanel.CHANG_INDEX,
                    value: { type: 'IND', key: 'HSXINDEX', value: 'HOSE', component: this.component },
                }
                // glb_sv.commonEvent.next(messObj)
                inform_broadcast(commuChanel.CHANG_INDEX, messObj)
                // glb_sv.indexFocus = 'IND'
                update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: 'IND' })
            }
            this.setState({ show: false }, () => {
                this.flagData = true
                this.setState({ show: true })
            })
            update_value_for_glb_sv({ component: this.component, key: 'flv_keyvalue', value: flv_keyvalue })

        })

    }

    handleShowSidebar = () => {
        this.isShow = !this.isShow
        this.props.isShow(this.isShow)
        const msg = { type: commuChanel.CLOSE_SIDEBAR, component: this.component }
        // glb_sv.commonEvent.next(msg)
        inform_broadcast(commuChanel.CLOSE_SIDEBAR, msg)
    }

    //-- Lấy list hot news
    getHotNews = () => {
        if (this.getNewsListFlag) {
            return
        }
        this.getNewsListFlag = true
        // -- push request to request hashmap
        const reqInfo = new requestInfo();
        const request_seq_comp = this.get_rq_seq_comp()
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getNewsListResultProc;
        reqInfo.reqFunct = this.getNewsList_FunctNm


        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqNews'
        svInputPrm.ServiceName = 'ALTqNews_NewsInfo'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['01', '0']
        this.language = svInputPrm.Lang
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getNewsList_ReqTimeOut = setTimeout(this.solvingIndex_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        this.req_component.set(request_seq_comp, reqInfo)
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        this.newsList = []
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: svInputPrm
        })

    }

    //-- Lấy list deep news
    getDeepNewsList = () => {
        if (this.getDeepNewsListFlag) {
            return
        }
        this.getDeepNewsListFlag = true
        // -- push request to request hashmap
        const reqInfo = new requestInfo()
        const request_seq_comp = this.get_rq_seq_comp()
        reqInfo.reqFunct = this.getDeepNewsList_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getDeepNewsListResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqNews'
        svInputPrm.ServiceName = 'ALTqNews_NewsInfo'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['03', '%']
        this.language = svInputPrm.Lang
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getDeepNewsList_ReqTimeOut = setTimeout(this.solvingIndex_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        this.deepNewsList = []
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

    getLastetNews(key) {
        this.setState({ refreshFlag: 'fa-spin' }, () => {
            if (key === 1) this.getHotNews()
            if (key === 2) this.getDeepNewsList()
            this.keyGetLastetNews = key
        })
    }

    onNodeSelect = (node, key) => {
        this.setState({ TablePriceboard: false }, () => {
            this.setState({ node: node, key: key, TablePriceboard: true })
        })
    }

    close_modal_addfav = (bool) => {

        this.setState({ addfav: bool })
    }

    render() {
        return (
            <>
                <div id="left-side-bar" className='div_left_elm'>
                    <div className="indexClass">

                        <nav className="navbar navbar-expand-sm">
                            <div className="search-box-container" style={{ width: 200, minWidth: 200 }}>
                                    <SearchRightInfo
                                        selectedStkName={this.state.selectedStkName}
                                        stkList={this.state.stkList}
                                        selectedStk={this.handleChangeStkName}
                                        themePage={this.state.themePage}
                                        node={this.props.node ? this.props.node : null}
                                        onNodeSelect={this.onNodeSelect}
                                        component={this.component}
                                        req_component={this.req_component}
                                        get_rq_seq_comp={this.get_rq_seq_comp}
                                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                        isSynce={false}
                                    />
                            </div>
                            <div id="id-index-list" className="index-list">
                                {(this.state.show &&
                                    <TableIndexList
                                        authFlag={this.authFlag}
                                        node={this.props.node ? this.props.node : null}
                                        onNodeSelect={this.onNodeSelect}
                                        component={this.component}
                                        req_component={this.req_component}
                                        get_rq_seq_comp={this.get_rq_seq_comp}
                                        dataWatchList={this.state.dataWatchList}
                                        dataHose={this.state.datalistHose}
                                        dataHnx={this.state.datalistHnx}
                                        dataUpc={this.state.datalistUpc}
                                        dataFvr={this.state.dataFavorite}
                                        fvlNew={this.state.fvlNew}
                                        fvl_delete={this.state.fvl_delete}
                                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                    />
                                )}
                            </div>
                        </nav>
                    </div>

                    {this.state.addfav && <AddModFav
                        close_modal_addfav={this.close_modal_addfav}
                        path={this.state.path}
                        node_key={this.state.node_key}
                        get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
                        component={this.component}
                        get_rq_seq_comp={this.get_rq_seq_comp}
                        req_component={this.req_component}
                    />
                    }

                    <div id="priceboard-chart-div" className="div_right_elm able_resize_width able_resize_height" >
                        <div id="priceboard-div" className="div_right_l_elm able_resize_width able_resize_height">
                            {this.state.isShowPriceboard &&
                                <TablePriceboard
                                    set_node_key={this.set_node_key}
                                    get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                    // node={this.state.node} 
                                    // key={this.state.key}
                                    component={this.component}
                                    req_component={this.req_component}
                                    get_rq_seq_comp={this.get_rq_seq_comp}
                                />
                            }

                            {!this.state.isShowPriceboard &&
                                <PutThroughView keyIndex={this.state.key_put_through}
                                    get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                    component={this.component}
                                    req_component={this.req_component}
                                    get_rq_seq_comp={this.get_rq_seq_comp}
                                />
                            }
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default translate('translations')(MarketInfor)