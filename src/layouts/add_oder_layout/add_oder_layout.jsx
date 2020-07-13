import React from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../utils/globalSv/service/global_service'
import { reply_send_req } from '../../utils/send_req'
import commuChanel from '../../constants/commChanel'
import socket_sv from '../../utils/globalSv/service/socket_service'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { stkPriceBoard } from '../../utils/globalSv/models/stkPriceBoard'
import FormatNumber from '../../conponents/formatNumber/FormatNumber'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip, UncontrolledTooltip } from 'reactstrap'
// import { CheckPluginValid } from '../../conponents/bkv-sign/CheckPluginValid' // eslint-disable-line
import { toast } from 'react-toastify'
import { bf_popout } from '../../utils/bf_popout'
import AddOrderForm from './add_order_form'
import functionList from '../../constants/functionList'
import { on_subcribeIndexList, on_unSubStkList } from '../../utils/subcrible_functions'
import { inform_broadcast } from '../../utils/broadcast_service'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import BidAskTable from '../../conponents/bid_ask_table/bid_ask_table'
import ChartIntraday from '../../conponents/chart_intraday/chart_intraday';
import TimeVolumePriceMachingTable from '../../conponents/time_volume_price_maching_table/time_volume_price_maching_table'
import OrderList from './order-list/orderList';
import AssetManage from './assets/asset-manage';
import classnames from 'classnames';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';

const remote = require('electron').remote;

class AddOrder extends React.PureComponent {
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

                window.ipcRenderer.removeAllListeners(`${commuChanel.event_NotifyRcv}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.mrkInfoEvent}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeReconect}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ORDER}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.PLACE_ORDER}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.getStockListChangeLang}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ACTION_SUCCUSS}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.AFTER_OTP}_${this.component}`)
            });
            // this.props.node.setEventListener("resize", (p) => {
            //     const all_flexlayout__tab = document.getElementsByClassName('flexlayout__tab');
            //     if (window.location.pathname.includes('___')) {
            //         for (let i = 0; i < all_flexlayout__tab.length; i++) {
            //             all_flexlayout__tab[i].style.height = 'calc(100vh - 20px)';
            //         }
            //     } else {
            //         for (let i = 0; i < all_flexlayout__tab.length; i++) {
            //             all_flexlayout__tab[i].style.height = 'calc(100vh - 108px)';
            //         }
            //     }
            // });
        }

        this.plcOrdNULL = {
            acntNo: '',
            sb_tp: '1',
            pass: '',
            rempass: false,
            stkCode: '',
            stkName: '', // stkSelected.value
            stkCode_sell: '',
            qty: '0',
            orderTp: '01',
            price: '0',
            tradAmount: 0,
            buyPw: 0,
            sellPw: 0,
            maxtrad_qty: 0,
            stkOwn: 0,
            fee_buy: 0,
            temp_pay: 0,
        }
        this.state = {
            plcOrd: this.plcOrdNULL,
            buyPower: {
                c1: 0,
                c2: 0,
                c3: 0,
                c4: 0,
                c5: 0,
                c6: 0,
                c7: 0,
                c8: 0,
                c9: 0,
                c10: 0,
                c11: 0,
                c12: 0,
                c13: 0,
                c14: 0,
                c15: 0,
            },
            getOrderlistFlag: false,
            stkList: [],
            orderTps: [],
            acntItems: [],
            stkSelected: null, // {value, label}
            t31: 0,
            t31_color: '',
            t260: 0,
            t332: 0,
            t333: 0,
            t133_1: 0,
            t133_1_color: '',
            t1331_1: 0,
            t132_1: 0,
            t132_1_color: '',
            t1321_1: 0,
            t3301: 0,
            show: 'block',
            hide: 'block',
            divOrderFlag: false,
            divOrd: { qty1: 0, num1: 0, qty2: 0, num2: 0 },
            tooltipOpen_buysell1: false,
            tooltipOpen_buysell2: false,
            tooltipOpen_buyPw: false,
            tooltipRefesh_buyPw: false,
            tooltipOpen_maxvolumn: false,
            tooltipOpen_search: false,
            tooltipOpen_sellPw: false,
            tooltipOpen_temporary_fee: false,
            tooltipOpen_temporary_settle: false,
            // -- Otp number -----
            otpModal: {
                otpNum: '',
                otpNum_requite: false,
                expTime: 0,
                otpLabel: 'OTP',
            },
            otpModalShow: false,
            sendingOtpNum: false,
            otpModalShow_OTP3: false,
            cfm_try_connect_to_server: false,
            cfm_order_confirm: false,
            cfm_buypower_detail_margin: false,
            cfm_buypower_detail_norm: false,
            cfm_check_double_order: false,
            gettingOtp: false,
            acntFull: [],
            isNews: false,
            newsList: [],
            isChangeTheme: true,
            remOrder: this.actStockCode == '102' ? true : false,
            StockInfoExten: {},
            stkInfoMatching: [],
            name: this.props.name,
            language: this.props.language,
            themePage: this.props.themePage,
            style: this.props.style,
            sellList: [],
            activeTab: '1',
        }
        this.plcOrd = this.plcOrdNULL;
        this.GET_MORE_EPMSG = 'GET_MORE_EPMSG'
        this.orderTpListDf = [{ key: '01', name: 'LO' }];
        this.lastOrdInfo = { 'acntNo': '', 'sb_tp': '1', 'stkCode': '', 'orderTp': '', 'price': '', 'qty': '' };
    }

    // -- declare subscriptions using
    prcBoardFlag = false
    setPriceFlag = false
    // -------------------------------
    StockInfoExten = new stkPriceBoard()
    // -------------------------------
    IDLE_TIMEOUT = 10 // seconds
    idleSecondsTimer = null
    idleSecondsCounter = 0
    doVisualUpdates = true
    timeoutChangePrice = null
    // plcOrdForm: FormGroup;
    buyPower = {}
    get_stk_list_sell = []
    // -- place order function
    placeOrderFunctNm = 'ORDERSCR_001'
    placeOrderFunct_ReqTimeOut
    divOrd = {};
    placeOrderFlag = false;
    // -- get buy able function
    buyAble_FunctNm = 'ORDERSCR_002'
    buyAbleFlag = false
    buyAbleFunct_ReqTimeOut
    temp_fee = 0
    // -- get sell stock list able function
    stk_list_sell = []
    sellAbleList_FunctNm = 'ORDERSCR_003'
    sellAbleFlagList = false
    sellAbleFunctList_ReqTimeOut
    // -- get sell able of an stock function
    sellAble_FunctNm = 'ORDERSCR_004'
    sellAbleFlag = false
    sellAbleFunct_ReqTimeOut
    focusModal = false

    /*--- declare variable for confirm OTP function --------------------*/
    otp_SendReqFlag = false
    otp_Timeout = {}
    otp_Type = ''
    otp_interValExpide = {}
    sendingOtpNumFunctNm = 'REQ_OTP_FUNCT'

    // -- confirm OTP number in case 3
    otpStatus = false // -- false: chưa gửi -> disable otp input + sending button, else ...
    gettingOtp = false
    getOtpMessage = ''
    gettingOtp_FunctNm = 'GET_OTPFUNCT'
    callbackFunct = ''
    otpType3 = false
    modifyTp = ''
    // -- get lasted EP message ---------
    eP_msgkey = ''
    msgkey = ''
    stk_full_nm = '' // code them
    ep_nexSeq = 0
    ep_nexSubSeq = 0
    getNextEPmsg = false
    // --------- chart ----------
    stkT260 = 0
    lengthBf = 0
    finishGet = false
    isShow = false
    disabled = false

    popin_window() {
        const current_window = remote.getCurrentWindow();
        window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
        current_window.close();
    }

    componentWillMount() {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            this.setState(agrs.state)
            this.setState({
                parent_id: agrs.parent_id,
                config: agrs.config,
            })

            change_theme(this.state.themePage)
            change_language(this.state.language, this.props);

            this.loadData();
            this.getDataFrGlb();
        });

        // update state after popin
        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            this.setState(agrs.state)

        })
    }


    componentDidMount() {
        this.subscribePlcOrd()

        window.ipcRenderer.on(`${commuChanel.event_NotifyRcv}_${this.component}`, (event, message) => {
            let notifyTp = message['MsgTp']
            // -- cho IVS if (notifyTp && notifyTp.length >= 4) {
            if (notifyTp && notifyTp.length >= 4 && this.state.show !== 'none') {
                notifyTp = notifyTp.substr(0, 4)
                if (notifyTp === 'CASH' || notifyTp === 'STK_' || notifyTp === 'ORD_' || notifyTp === 'PIA_') {
                    if (this.plcOrd.sb_tp === '1') {
                        this.getBuyAble()
                    } else if (this.plcOrd.sb_tp === '2') {
                        this.getSellAbleList()
                        const stk = this.plcOrd.stkCode
                        if (stk !== null && stk !== undefined && stk !== '') {
                            this.getSellAbleStock(stk.substr(4))
                        }
                    }
                }
            }
        });

        window.ipcRenderer.on(`${commuChanel.mrkInfoEvent}_${this.component}`, (event, msgObject) => {
            const stk = this.plcOrd.stkCode;
            if ((stk && stk.length !== 7) || !stk) return
            const stkPl = stk.split('_')
            if (stkPl && stkPl.length > 1) {
                const t55 = stkPl[1]
                if (msgObject.data.t55 === t55) {
                    this.setState({
                        t260: (msgObject.data.U31 && msgObject.data.U31) > 0 ? msgObject.data.U31 : msgObject.data.t260,
                        t332: (msgObject.data.U29 && msgObject.data.U29) > 0 ? msgObject.data.U29 : msgObject.data.t332,
                        t333: (msgObject.data.U30 && msgObject.data.U30) > 0 ? msgObject.data.U30 : msgObject.data.t333,
                        t31: msgObject.data['t31'],
                        t31_color: msgObject.data['t31_color'],
                        t133_1: msgObject.data['t133_1'],
                        t1331_1: msgObject.data['t1331_1'],
                        t132_1: msgObject.data['t132_1'],
                        t1321_1: msgObject.data['t1321_1'],
                        t132_1_color: msgObject.data['t132_1_color'],
                        t133_1_color: msgObject.data['t133_1_color'],
                        t3301: this.mrkObj['t3301'],
                        StockInfoExten: { ...msgObject.data },
                    })
                    //-- set background color
                    const nodeArr = msgObject.change.split(':')
                    const id = msgObject.data.itemName + 'extRrgtOrdPlc' + nodeArr[0]
                    this.changeBackground(id, Number(nodeArr[1]), Number(nodeArr[2]))
                }
            }
        });

        window.ipcRenderer.on(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`, (event, message) => {
            if (message === this.state.StockInfoExten.itemName) {
                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_chart_Map', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                    const stkInfoMatching = agrs.get(message);
                    console.log("stkInfoMatching", stkInfoMatching)
                    this.setState({ stkInfoMatching })
                })

            }
        })

        window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
            this.popin_window()
        })

        window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
            window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
        })

        window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
            console.log('bf_popout')
            bf_popout(this.component, this.props.node, this.state)
        })

        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            reply_send_req(agrs, this.req_component)
        });

        window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
            const functionNm = msg['data'];
            if (functionNm === 'openModalPlcOrd') {
                this.placeOrderFlag = false;

                this.setState({ cfm_order_confirm: true, placeOrderFlag: false })
            }
        })


        // xet chieu cao cho cac form ben phai
        if (this.props.node) {
            this.loadData();
            this.getDataFrGlb();
        }


        window.ipcRenderer.on(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`, (event, agrs) => {
            const reqInfoMap = agrs['reqInfoMap']
            const sq = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_Map', sq: sq })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrss) => {

                if (reqInfoMap === null || reqInfoMap === undefined) { return; }
                if (reqInfoMap.reqFunct === this.GET_MORE_EPMSG) {
                    clearTimeout(this.GET_MORE_EPMSG_ReqTimeout);
                    const timeResult = new Date();
                    reqInfoMap.resTime = timeResult;
                    reqInfoMap.procStat = 2;
                    this.getNextEPmsg = false;

                    const stkInfoMatching = agrss.get(this.plcOrd.stkCode) || [];
                    this.stkInfoMatching = stkInfoMatching;
                    this.setState({ stkInfoMatching });
                }
            })

        })
        window.ipcRenderer.on(`${commuChanel.reply_send_event_FinishSunbcribeFunct}_${this.component}`, (event, message) => {
            if (this.plcOrd.stkCode) {
                this.getNewValues(this.plcOrd.stkCode)
            }
        });

        window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
            glb_sv.objShareGlb = agrs.objShareGlb;
        })
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        if (this.GET_MORE_EPMSG_ReqTimeout) {
            clearTimeout(this.GET_MORE_EPMSG_ReqTimeout)
        }
        if (this.sub_listStock) this.sub_listStock.unsubscribe()
        if (this.subcr_ClientReqMrkRcv) this.subcr_ClientReqMrkRcv.unsubscribe()
        if (this.mrkInfo) this.mrkInfo.unsubscribe()
        if (this.subcr_ChangeEp) this.subcr_ChangeEp.unsubscribe();
        on_unSubStkList(this.component)
    }

    loadData = () => {
        this.orderTps = this.orderTpListDf
        this.plcOrd['orderTp'] = '01'
        this.plcOrd['sb_tp'] = '1'
        this.onSellBuyTpChange(this.plcOrd.sb_tp)
        this.getBuyAble()
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                orderTp: this.plcOrd.orderTp,
                sb_tp: this.plcOrd.sb_tp,
            },
        }))
        this.setState({ orderTps: this.orderTpListDf }, () => {
            this.handleChangeTp('ord_tp_01')
        })
    }

    subscribePlcOrd = () => {
        window.ipcRenderer.on(`${commuChanel.misTypeReconect}_${this.component}`, (event, msg) => {
            this.setState({ cfm_try_connect_to_server: false })
            this.getLastBImsg()
        });
        window.ipcRenderer.on(`${commuChanel.ORDER}_${this.component}`, (event, msg) => {
            if (this.state.placeOrderFlag) {
                return
            }
            const arrData = msg['data'].split('|')
            this.setState({ show: 'block', hide: 'none' })
            this.setHightForStkExtend()
            if (
                !this.plcOrd.stkCode ||
                this.plcOrd.stkCode.length <= 4 ||
                this.plcOrd.stkCode.substr(4) !== arrData[2]
            ) {
                //-- mã CK mới
                if (arrData[0] != '3') this.plcOrd.sb_tp = arrData[0]
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        sb_tp: this.plcOrd.sb_tp,
                    },
                }))
                this.resetStockInfoExten();

                on_unSubStkList(this.component)
                on_subcribeIndexList([arrData[2]], this.component);

                this.onSellBuyTpChange(this.plcOrd.sb_tp)
                const stkCd = arrData[2]
                let stkID = 'HNX_' + stkCd
                let stkObj = glb_sv.getMsgObjectByMsgKey(stkID)
                if (stkObj === null || stkObj === undefined) {
                    stkID = 'HSX_' + stkCd
                    stkObj = glb_sv.getMsgObjectByMsgKey(stkID)
                }
                if (stkObj === null || stkObj === undefined) {
                    stkID = 'UPC_' + stkCd
                    stkObj = glb_sv.getMsgObjectByMsgKey(stkID)
                }
                if (stkObj !== null && stkObj !== undefined) {
                    // glb_sv.objShareGlb['stkOrd'] = stkObj
                    // this.getNews(stkCd);
                    this.mrkObj = stkObj
                    const sanGd = stkObj['U10'] === '05' ? 'UPC' : stkObj['U10'] === '01' ? 'HOSE' : 'HNX'
                    const textNm = stkObj['t55'] + ' - ' + sanGd + ' - ' + stkObj['U9']
                    this.plcOrd.stkCode = stkID
                    this.plcOrd.stkName = textNm
                    this.setState({
                        stkSelected: { label: textNm, value: stkID },
                        t260: (this.mrkObj.U31 && this.mrkObj.U31) > 0 ? this.mrkObj.U31 : this.mrkObj.t260,
                        t332: (this.mrkObj.U29 && this.mrkObj.U29) > 0 ? this.mrkObj.U29 : this.mrkObj.t332,
                        t333: (this.mrkObj.U30 && this.mrkObj.U30) > 0 ? this.mrkObj.U30 : this.mrkObj.t333,
                        t31: this.mrkObj.t31,
                        t31_color: this.mrkObj['t31_color'],
                        t133_1: this.mrkObj['t133_1'],
                        t1331_1: this.mrkObj['t1331_1'],
                        t132_1: this.mrkObj['t132_1'],
                        t1321_1: this.mrkObj['t1321_1'],
                        t132_1_color: this.mrkObj['t132_1_color'],
                        t133_1_color: this.mrkObj['t133_1_color'],
                        StockInfoExten: { ...this.mrkObj },
                    })
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            stkCode: this.plcOrd.stkCode,
                            stkName: textNm,
                        },
                    }))
                    this.changeOrdTP(stkID)
                    if (Number(arrData[1]) === 777777720000) {
                        this.plcOrd.price = '0'
                        this.plcOrd['orderTp'] = '04'
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                price: this.plcOrd.price,
                                orderTp: this.plcOrd.orderTp,
                            },
                        }))
                    } else if (Number(arrData[1]) === 777777710000) {
                        this.plcOrd.price = '0'
                        this.plcOrd['orderTp'] = '03'
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                price: this.plcOrd.price,
                                orderTp: this.plcOrd.orderTp,
                            },
                        }))
                    } else {
                        this.plcOrd.price = FormatNumber(Number(arrData[1]), 0)
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                price: this.plcOrd.price,
                            },
                        }))
                    }
                    if (this.plcOrd.sb_tp === '1') {
                        this.buyAbleFlag = false
                        this.refeshGetBuySellPW(this.plcOrd.sb_tp)
                    }
                }
            } else {
                //-- mã CK hiện tại
                if (arrData[0] !== this.plcOrd.sb_tp && arrData[0] != '3') {
                    this.onSellBuyTpChange(this.plcOrd.sb_tp)
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            sb_tp: this.plcOrd.sb_tp,
                        },
                    }))
                }
                if (Number(arrData[1]) === 777777720000) {
                    this.plcOrd.price = '0'
                    this.plcOrd['orderTp'] = '04'
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            price: this.plcOrd.price,
                            orderTp: this.plcOrd.orderTp,
                        },
                    }))
                } else if (Number(arrData[1]) === 777777710000) {
                    this.plcOrd.price = '0'
                    this.plcOrd['orderTp'] = '03'
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            price: this.plcOrd.price,
                            orderTp: this.plcOrd.orderTp,
                        },
                    }))
                } else {
                    this.plcOrd.price = FormatNumber(Number(arrData[1]), 0)
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            price: this.plcOrd.price,
                        },
                    }))
                }
                if (this.plcOrd.sb_tp === '1') {
                    this.buyAbleFlag = false
                    this.refeshGetBuySellPW(this.plcOrd.sb_tp)
                }
                setTimeout(() => {
                    if (arrData[1] === 0 || arrData[1] === '0') {
                        document.getElementById(this.component + 'orderPlc_price').focus()
                    } else {
                        document.getElementById(this.component + 'orderPlc_qty').focus()
                    }
                }, 500)
            }

        });

        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, msg) => {
            if (msg.type === this.ESC_KEY) {
                if (this.state.cfm_order_confirm) {
                    this.setState({ cfm_order_confirm: false })
                } else if (this.state.cfm_check_double_order) {
                    this.setState({ cfm_check_double_order: false })
                } else if (this.state.cfm_buypower_detail_margin) {
                    this.setState({ cfm_buypower_detail_margin: false })
                } else if (this.state.cfm_buypower_detail_norm) {
                    this.setState({ cfm_buypower_detail_norm: false })
                } else {
                    this.setState({ show: 'none', hide: 'block' })
                }
            }
        });
        window.ipcRenderer.on(`${commuChanel.getStockListChangeLang}_${this.component}`, (event, msg) => {
            if (this.plcOrd.sb_tp === '2') {
            } else {
                this.getDataFrGlb()
                if (this.state.stkSelected == null) return
                const stkSelected = this.state.stkList.find(item => item.value === this.state.stkSelected.value)
                this.setState({ stkSelected })
            }
        });
    }

    getDataFrGlb() {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
            this.mrk_StkList = args.get('mrk_StkList');
            this.recentStkList = args.get('recentStkList');
            this.HSX_PRC_LIST = args.get('HSX_PRC_LIST');
            this.HNX_PRC_LIST = args.get('HNX_PRC_LIST');
            this.UPC_PRC_LIST = args.get('UPC_PRC_LIST');
            glb_sv.objShareGlb = args.get('objShareGlb');
            this.setState({ stkList: this.mrk_StkList });
        });
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
            component: this.component,
            value: ['mrk_StkList', 'recentStkList', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST', 'objShareGlb'],
            sq
        });
    }

    buyAble_ResultProc = (reqInfoMap, message) => {
        this.buyAbleFlag = false
        if (reqInfoMap.procStat !== 0) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            return
        } else {
            reqInfoMap.procStat = 2
            let jsonBuyAble
            try {
                jsonBuyAble = JSON.parse(message['Data'])
                this.plcOrd['buyPw'] = Number(jsonBuyAble[0]['c0']) + Number(jsonBuyAble[0]['c6'])
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        buyPw: this.plcOrd.buyPw,
                    },
                }))
                this.buyPower = jsonBuyAble[0]
                this.setState({ buyPower: this.buyPower })
                this.temp_fee = jsonBuyAble[0]['c7']
            } catch (err) {
                jsonBuyAble = []
                this.plcOrd['buyPw'] = 0
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        buyPw: this.plcOrd.buyPw,
                    },
                }))
                this.buyPower = {}
                this.setState({ buyPower: this.buyPower })
            }
            this.changePrice();
        }
    }

    sellAbleList_ResultProc = (reqInfoMap, message) => {
        console.log("sellAbleList_ResultProc -> message", message)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.sellAbleFlagList = false
            reqInfoMap.resSucc = false
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            return;
        } else {
            reqInfoMap.procStat = 1
            let jsonSellAble
            try {
                if (message['Data'] == null || message['Data'] === undefined || message['Data'] === '') {
                    jsonSellAble = []
                } else {
                    jsonSellAble = JSON.parse(glb_sv.filterStrBfParse(message['Data']))
                }
            } catch (err) {
                console.log(err)
                jsonSellAble = []
            }

            if (jsonSellAble.length > 0) {
                for (let i = 0; i < jsonSellAble.length; i++) {
                    const sanGd =
                        jsonSellAble[i]['c12'] === '05'
                            ? 'UPC\xa0\xa0\xa0\xa0'
                            : jsonSellAble[i]['c12'] === '01'
                                ? 'HOSE\xa0\xa0\xa0'
                                : 'HNX\xa0\xa0\xa0\xa0'
                    let stock_nm = jsonSellAble[i]['c0'] + '\xa0'
                    for (let y = stock_nm.length; y < 8; y++) {
                        stock_nm += '\xa0'
                    }
                    const label = stock_nm + ' ' + sanGd + ' ' + FormatNumber(Number(jsonSellAble[i]['c3']), 0, 0)
                    const sanGd_text =
                        jsonSellAble[i]['c12'] === '05' ? 'UPC' : jsonSellAble[i]['c12'] === '01' ? 'HOSE' : 'HNX'
                    const text = jsonSellAble[i]['c0'] + ' - ' + sanGd_text + ' - ' + jsonSellAble[i]['c1']
                    const value =
                        (jsonSellAble[i]['c12'] === '05' ? 'UPC_' : jsonSellAble[i]['c12'] === '01' ? 'HSX_' : 'HNX_') +
                        jsonSellAble[i]['c0']
                    const obj = { label, value: value, text }
                    this.get_stk_list_sell.push(obj)
                }
            }
            if (Number(message['Packet']) <= 0) {
                this.sellAbleFlagList = false
                reqInfoMap.procStat = 2

                this.setState({ stkList: this.get_stk_list_sell, sellList: jsonSellAble })
                if (this.state.stkSelected == null) {
                    this.resetStockInfoExten()
                    return
                }
                const stkSelected = this.get_stk_list_sell.find(item => item.value == this.state.stkSelected.value)
                if (stkSelected) {
                    //-- lay sl so huu + kl tối đa
                    this.setState({ stkSelected: stkSelected })
                    this.getSellAbleStock(stkSelected.value.substr(4))
                } else {
                    this.plcOrd.stkCode = null
                    this.setState({ stkSelected: null })
                    this.resetStockInfoExten()
                }
            }
        }
    }

    sellAble_ResultProc = (reqInfoMap, message) => {
        console.log("sellAble_ResultProc -> reqInfoMap, message", reqInfoMap, message)
        this.sellAbleFlag = false
        if (reqInfoMap.procStat !== 0) {
            return
        }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, '', this.component)
            return
        } else {
            reqInfoMap.procStat = 2
            let jsonsellAb
            try {
                jsonsellAb = JSON.parse(message['Data'])
                this.plcOrd['sellPw'] = jsonsellAb[0]['c3']
                this.plcOrd.stkOwn = jsonsellAb[0]['c2']
                this.plcOrd['maxtrad_qty'] = jsonsellAb[0]['c3']
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        sellPw: this.plcOrd.sellPw,
                        maxtrad_qty: this.plcOrd.maxtrad_qty,
                        stkOwn: this.plcOrd.stkOwn,
                    },
                }))
            } catch (err) {
                this.plcOrd['sellPw'] = 0
                this.plcOrd.stkOwn = 0
                this.plcOrd['maxtrad_qty'] = 0
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        sellPw: this.plcOrd.sellPw,
                        maxtrad_qty: this.plcOrd.maxtrad_qty,
                        stkOwn: 0,
                    },
                }))
                reqInfoMap.resSucc = false
            }

        }
    }

    placeOrder_ResultProc = (reqInfoMap, message) => {
        console.log("placeOrder_ResultProc -> message", message)
        this.placeOrderFlag = false
        this.setState({ placeOrderFlag: false, cfm_check_double_order: false })

        // -- process after get result --
        if (Number(message['Result']) === 0) {
            this.lastOrdInfo['acntNo'] = null
            reqInfoMap.resSucc = false;
            reqInfoMap.procStat = 2;
            if (message['Code'] !== '080128') {
                this.focusModal = false
                glb_sv.openAlertModal(
                    '',
                    'common_InfoMessage',
                    message['Message'],
                    '',
                    'danger',
                    'orderPlc_price',
                    false,
                    ''
                )
                this.setState({ cfm_order_confirm: false });
                if (message['Message'].includes('VI050169')) {
                    glb_sv.focusELM(this.component + 'orderPlc_qty')
                }
            } else {
                this.lastOrdInfo['acntNo'] = '';
            }
        } else {
            const stks = this.state.stkSelected.value
            const isStk = this.recentStkList.findIndex(item => item === stks)
            if (isStk < 0) this.recentStkList.push(stks)
            if (this.recentStkList.length > 10) this.recentStkList.shift()
            localStorage.setItem('recentStkList', JSON.stringify(this.recentStkList))
            this.setState({ cfm_order_confirm: false })
            if (!this.state.remOrder) {
                this.plcOrd.price = ''
                this.plcOrd.qty = ''
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        price: this.plcOrd.price,
                        qty: this.plcOrd.qty,
                    },
                }))
            }
            const obj = {
                type: this.ACTION_SUCCUSS,
                data: 'order-list',
            }
            inform_broadcast(commuChanel.ACTION_SUCCUSS, obj);

            if (this.plcOrd.sb_tp === '1') {
                setTimeout(() => {
                    this.getBuyAble()
                }, 500)
            } else {
                const stk = this.plcOrd.stkCode
                setTimeout(() => {
                    this.getSellAbleStock(stk.substr(4))
                }, 500)
            }
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success', '', false, '')
        }

    }

    getLastBImsg = () => {
        // -- send request to get lastest of "BI" msg market
        const clientSeq = socket_sv.getRqSeq()
        const msgObj = { ClientSeq: clientSeq, Command: 'LAST_MSG', F1: 'BI' }
        socket_sv.send2Sv(socket_sv.key_ClientReqMRK, JSON.stringify(msgObj))
    }

    refeshGetBuySellPW = sbTp => {
        const stk = this.plcOrd.stkCode
        if (sbTp === '1') {
            this.getBuyAble()
        } else {
            if (stk !== null && stk !== undefined && stk !== '') {
                this.getSellAbleStock(stk.substr(4))
            }
        }
    }

    openModal_buypowerDetail = () => {
        if (this.buyPower['c14'] === 'Y' || this.buyPower['c14'] === 'Z') {
            this.setState({ cfm_buypower_detail_margin: true })
        } else {
            this.setState({ cfm_buypower_detail_norm: true })
        }
    }

    getMaxVolumeTradding = () => {
        if (this.plcOrd.stkCode === null || this.plcOrd.stkCode === undefined || this.plcOrd.stkCode === '') {
            return
        }
        if (this.plcOrd.sb_tp === '2') {
            const stk = this.plcOrd.stkCode
            const QtyVal = this.plcOrd.sellPw
            const Sgd = stk.substr(0, 3)
            if (Sgd === 'HNX' || Sgd === 'UPC') {
                if (QtyVal >= 100) {
                    const QtyValLt = Math.floor(QtyVal / 100)
                    this.plcOrd.qty = FormatNumber(QtyValLt * 100)
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            qty: this.plcOrd.qty,
                        },
                    }))
                } else {
                    this.plcOrd.qty = FormatNumber(QtyVal)
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            qty: this.plcOrd.qty,
                        },
                    }))
                }
            } else {
                if (QtyVal >= 10) {
                    const QtyValLt = Math.floor(QtyVal / 10)
                    this.plcOrd.qty = FormatNumber(QtyValLt * 10)
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            qty: this.plcOrd.qty,
                        },
                    }))
                } else {
                    this.plcOrd.qty = 0
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            qty: this.plcOrd.qty,
                        },
                    }))
                }
            }
        } else {
            let price
            // let buyPw = this.plcOrd.buyPw - Number(this.buyPower["c6"]);
            const buyPw = this.plcOrd.buyPw
            if (this.plcOrd['orderTp'] !== '01') {
                price = this.mrkObj['t332'] + ''
            } else {
                price = this.plcOrd.price
            }
            if (
                price === '' ||
                price === undefined ||
                price.length === 0 ||
                buyPw === null ||
                buyPw === undefined ||
                buyPw === 0
            ) {
                this.plcOrd.qty = ''
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        qty: this.plcOrd.qty,
                    },
                }))
            } else {
                const priceVal = glb_sv.filterNumber(price)
                if (priceVal === null || priceVal === undefined || priceVal <= 0) {
                    this.plcOrd.qty = ''
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            qty: this.plcOrd.qty,
                        },
                    }))
                    return
                }
                // let QtyVal = buyPw / priceVal;
                const QtyVal = this.calc_max_buyqty(priceVal, buyPw, this.temp_fee || 0)
                const stk = this.plcOrd.stkCode
                const Sgd = stk.substr(0, 3)
                if (Sgd === 'HNX' || Sgd === 'UPC') {
                    if (QtyVal >= 100) {
                        const QtyValLt = Math.floor(QtyVal / 100)
                        this.plcOrd.qty = FormatNumber(QtyValLt * 100)
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                qty: this.plcOrd.qty,
                            },
                        }))
                    } else {
                        this.plcOrd.qty = FormatNumber(Math.floor(QtyVal))
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                qty: this.plcOrd.qty,
                            },
                        }))
                    }
                } else {
                    if (QtyVal >= 10) {
                        const QtyValLt = Math.floor(QtyVal / 10)
                        this.plcOrd.qty = FormatNumber(QtyValLt * 10)
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                qty: this.plcOrd.qty,
                            },
                        }))
                    } else {
                        this.plcOrd.qty = 0
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                qty: this.plcOrd.qty,
                            },
                        }))
                    }
                }
            }
        }
        document.getElementById(this.component + 'orderPlc_price').focus()
    }

    placeOrder = () => {
        if (this.state.placeOrderFlag || this.placeOrderFlag || this.state.cfm_order_confirm) {
            return
        }
        this.placeOrderFlag = true
        const acntinfo = this.activeAcnt
        if (acntinfo == null || acntinfo.length !== 13) {
            this.placeOrderFlag = false
            return
        }
        const pieces = acntinfo.split('.')
        const acntNo = pieces[0]
        const subNo = pieces[1]
        if (acntNo == null || acntNo.length !== 10 || subNo == null || subNo.length !== 2) {
            this.placeOrderFlag = false
            return
        }
        const qtyStr = this.plcOrd.qty
        let qty = glb_sv.filterNumber(qtyStr)
        if (qty === null) {
            qty = 0
        }
        if (qty === undefined || isNaN(qty) || qty <= 0) {
            glb_sv.focusELM('orderPlc_qty')
            glb_sv.checkToast(toast, 'warn', this.props.t('qty_not_correct'), 'plcord_qty_err')
            this.placeOrderFlag = false
            return
        }
        const priceStr = this.plcOrd.price
        let price = glb_sv.filterNumber(priceStr)
        if (price == null) {
            price = 0
        }
        const sellbuy_tp = this.plcOrd.sb_tp
        const orderTp = this.plcOrd.orderTp

        let stkCd
        stkCd = this.plcOrd.stkCode
        if (stkCd == null || stkCd.length < 3) {
            this.placeOrderFlag = false
            this.setState({ placeOrderFlag: false })
            glb_sv.focusELM('stkAutocompleteOdr')
            glb_sv.checkToast(toast, 'warn', this.props.t('symbol_code_require'), 'plcord_symbol_err')
            this.placeOrderFlag = false
            return
        }
        if (orderTp === '01') {
            if (price === null || price === undefined || isNaN(price) || price <= 0) {
                this.placeOrderFlag = false
                this.setState({ placeOrderFlag: false })
                glb_sv.focusELM('orderPlc_qty')
                glb_sv.checkToast(toast, 'warn', this.props.t('price_not_correct'), 'plcord_price_err')
                this.placeOrderFlag = false
                return
            }
        }

        if (orderTp === '01') {
            this.plcOrd.tradAmount = price * qty
            this.plcOrd.fee_buy = Math.ceil(((this.temp_fee || 0) * this.plcOrd.tradAmount) / 100)
            this.plcOrd.temp_pay = this.plcOrd.fee_buy + this.plcOrd.tradAmount
        } else {
            this.plcOrd.tradAmount = this.mrkObj['t332'] * qty
        }
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                tradAmount: this.plcOrd.tradAmount,
                fee_buy: this.plcOrd.fee_buy,
                temp_pay: this.plcOrd.temp_pay,
            },
        }))
        if (sellbuy_tp === '1') {
            if (orderTp !== '01') {
                price = this.mrkObj['t332']
            }
        }
        // -- check for divide order
        this.setState({ divOrderFlag: false })
        const sanGd = (stkCd = stkCd.substr(0, 3))
        if (sanGd === 'HSX' && Number(qty) > 500000) {
            this.divOrd = {}
            this.divOrd['qty1'] = 500000
            this.divOrd['num1'] = Math.floor(Number(qty) / 500000)
            this.divOrd['qty2'] = Number(qty) % 500000
            this.divOrd['num2'] = 1
            this.setState({ divOrderFlag: true, divOrd: this.divOrd })
        }

        this.focusModal = true;
        if (!glb_sv.checkOtp('openModalPlcOrd')) {
            if (window.location.pathname.includes('___')) {
                const ermsg = 'notify_user_enter_otp_in_main_screen';
                const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
                glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
            }
            this.placeOrderFlag = false
            return
        }
        this.placeOrderFlag = false;

        this.setState({ cfm_order_confirm: true, placeOrderFlag: false })
    }

    // -- confirm place order ---
    confirmOrder = (cfmTp) => {
        if (this.state.placeOrderFlag || this.placeOrderFlag) {
            return
        }
        this.placeOrderFlag = true
        this.setState({ placeOrderFlag: true })
        if (cfmTp === 'N') {
            this.placeOrderFlag = false
            this.setState({ cfm_order_confirm: false, placeOrderFlag: false })
            return
        }

        if (
            this.lastOrdInfo['acntNo'] != null &&
            this.lastOrdInfo['acntNo'] === this.activeAcnt &&
            this.lastOrdInfo['sb_tp'] === this.plcOrd.sb_tp &&
            this.lastOrdInfo['stkCode'] === this.plcOrd.stkCode &&
            this.lastOrdInfo['orderTp'] === this.plcOrd.orderTp &&
            this.lastOrdInfo['price'] === this.plcOrd.price &&
            this.lastOrdInfo['qty'] === this.plcOrd.qty
        ) {
            // -- open modal confirm send lệnh
            this.focusModal = true
            this.placeOrderFlag = false
            this.setState({ cfm_order_confirm: false, cfm_check_double_order: true, placeOrderFlag: false })
        } else {
            this.sendOrder()
        }
    }

    sendOrder = () => {
        this.svInputPrmGlb = {}
        const acntinfo = this.activeAcnt
        const pieces = acntinfo.split('.')
        const acntNo = pieces[0]
        const subNo = pieces[1]
        const qtyStr = this.plcOrd.qty
        let qty = glb_sv.filterNumber(qtyStr)
        if (qty == null) {
            qty = 0
        }
        const priceStr = this.plcOrd.price
        let price = glb_sv.filterNumber(priceStr)
        if (price == null) {
            price = 0
        }
        const sellbuy_tp = this.plcOrd.sb_tp
        const orderTp = this.plcOrd.orderTp
        const stkCd = this.plcOrd.stkCode;

        // -- service info
        this.svInputPrm = null;
        this.svInputPrm = new serviceInputPrm();

        const sanGd = stkCd.substr(0, 3)
        if (sanGd === 'HSX' && qty > 500000) {
            this.svInputPrm.WorkerName = 'ALTxVipOrder01'
            this.svInputPrm.ServiceName = 'ALTxVipOrder01_SplitOrder'
        } else {
            if (sellbuy_tp === '1') {
                this.svInputPrm.WorkerName = 'ALTxBuyOrder'
                this.svInputPrm.ServiceName = 'ALTxBuyOrder_0501'
            } else {
                this.svInputPrm.WorkerName = 'ALTxSellOrder'
                this.svInputPrm.ServiceName = 'ALTxSellOrder_0501'
            }
        }
        this.svInputPrm.ClientSentTime = '0'
        this.svInputPrm.Operation = 'I'
        this.svInputPrm.InCrpt = []
        this.svInputPrm.InVal = [acntNo, subNo, '', stkCd.substr(4), sellbuy_tp, qty + '', price + '', '0000', orderTp, '0']
        this.svInputPrm.TotInVal = this.svInputPrm.InVal.length

        if (glb_sv.objShareGlb['verify'] > 0) {
            // CheckPluginValid(this.CheckPluginResult);
            // this.makeOrder(0, '');
            // if (this.configInfo['third_sign'] === 'vntic') {
            //     this.VnTicSignXml()
            //     this.controlSignTimeout = setTimeout(() => {
            //         this.timeoutSign()
            //     }, 30 * 1000)
            // } else {
            //     //-- bkv
            //     CheckPluginValid(this.CheckPluginResult)
            // }
            this.makeOrder(0, '')
        } else {
            this.makeOrder(0, '')
        }
    }

    makeOrder = (actNum, signStr) => {
        // -- push request to request hashmap
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.placeOrderFunctNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.placeOrder_ResultProc

        // -- service info
        if (actNum > 0) {
            this.svInputPrm.InVal[2] = signStr
        } else {
            this.svInputPrm.InVal[2] = ''
        }
        this.placeOrderFunct_ReqTimeOut = setTimeout(this.solvingPlcOrd_TimeOut,
            functionList.reqTimeout, request_seq_comp);
        reqInfo.inputParam = this.svInputPrm.InVal;
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm: this.svInputPrm
        })

        this.lastOrdInfo['acntNo'] = this.activeAcnt
        this.lastOrdInfo['sb_tp'] = this.plcOrd.sb_tp
        this.lastOrdInfo['stkCode'] = this.plcOrd.stkCode
        this.lastOrdInfo['orderTp'] = this.plcOrd.orderTp
        this.lastOrdInfo['price'] = this.plcOrd.price
        this.lastOrdInfo['qty'] = this.plcOrd.qty
    }

    /* -- Lưu trình xử lý lệnh sẽ như sau:
  Nếu tk ko đăng ký chứng chỉ số -> Xử lý như hiện tại
  Có đăng ký chứng chỉ số -> Gọi hàm check plugin:CheckPluginValid
  nếu lỗi -> thông báo, dừng. Ngược lại gọi hàm  SignBase64XML() để thực hiện ký
  trong function callback: SignXMlCallback -> Nếu nhậ kq thành công
  -> Gọi lại hàm Gửi lệnh với chuỗi mã hóa, ngược lại thông báo lỗi 
  */

    SignXMlCallback = data => {
        // tslint:disable-next-line:radix
        // const iRet = parseInt(data);
        const decodedata = window.base64.decode(data)
        const iRet = Number(decodedata)
        let dataRet,
            result = false
        switch (iRet) {
            case 0:
                dataRet = 'Không có quyền sử dụng chức năng này'
                break
            case 2:
                dataRet = 'Ký lỗi: Dữ liệu đã được ký'
                break
            case 3:
                dataRet = 'Không tìm thấy chứng thư số'
                break
            case 4:
                dataRet = 'Dữ liệu đầu vào không đúng định dạng'
                break
            case 5:
                dataRet = 'Có lỗi trong quá trình ký'
                break
            case 6:
                dataRet = 'Có lỗi trong quá trình lưu chữ ký'
                break
            case 13:
                dataRet = 'Người dùng hủy bỏ'
                break
            default:
                dataRet = data
                const resultSplit = dataRet.split('*')
                if (resultSplit[0].length > 0) {
                    if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
                        this.makeOrderMod(1, resultSplit[0])
                    } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
                        this.makeOrderCanl(1, resultSplit[0])
                    } else {
                        this.makeOrder(1, resultSplit[0])
                    }
                }
                result = true
                break
        }

        if (!result) {
            // -- báo lỗi ở các case trên
            const ermsg = 'Lỗi khi thực hiện xác thực chứng chỉ số: ' + dataRet
            glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', false, '', this.component)
            if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
                this.orderModFlag = false
            } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
                this.orderCanclFlag = false
                this.setState({ orderCanclFlag: false })
            } else {
                this.placeOrderFlag = false
                this.setState({ placeOrderFlag: false })
            }
        }
    }

    // CheckPluginResult = data => {
    //     let ermsg = '',
    //         result = false
    //     switch (data) {
    //         case '0':
    //             ermsg = 'Lỗi khi thực hiện xác thực chứng chỉ số: Plugin chưa được cài đặt!'
    //             glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning')
    //             this.placeOrderFlag = false
    //             this.setState({ placeOrderFlag: false })
    //             break
    //         case '1':
    //             this.SignBase64XML()
    //             result = true
    //             break
    //         default:
    //             ermsg = 'Lỗi khi thực hiện xác thực chứng chỉ số: Hãy kiểm tra Plugin của bạn!'
    //             glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning')
    //             this.placeOrderFlag = false
    //             this.setState({ placeOrderFlag: false })
    //             break
    //     }
    //     if (!result) {
    //         if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
    //             this.orderModFlag = false
    //             this.setState({ orderModFlag: false })
    //         } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
    //             this.orderCanclFlag = false
    //             this.setState({ orderCanclFlag: false })
    //         } else {
    //             this.placeOrderFlag = false
    //             this.setState({ placeOrderFlag: false })
    //         }
    //     }
    // }

    // SignBase64XML = () => {
    //     if (this.svInputPrmGlb === undefined || this.svInputPrmGlb === null) {
    //         return
    //     }
    //     this.svInputPrmGlb['InVal'].push(this.svInputPrmGlb.ServiceName)
    //     const xmlIn = '<data>' + JSON.stringify(this.svInputPrmGlb['InVal']) + '</data>'
    //     // console.log(xmlIn)
    //     const serialNumber = this.objShareInfo['serialnum']
    //     // const serialNumber = '540367fae100baa7945094721b9884d7'; // '61f49c2cd095dd88441575d177f06993';
    //     // console.log(serialNumber)
    //     this.svInputPrmGlb['InVal'].pop()
    //     SignXML(window.base64.encode(xmlIn), serialNumber, this.SignXMlCallback)
    // }

    // VnTicSignXml = () => {
    //     tokensigning
    //         .checkTokenSigning()
    //         .then(data => {
    //             var obj = JSON.parse(data)
    //             if (obj.code === 1) {
    //                 this.logMessage('data of checkTokenSigning')
    //                 this.logMessage(data)
    //                 this.logMessage('serialnumber')
    //                 this.logMessage(this.objShareInfo['serialnum'])
    //                 var serial = this.objShareInfo['serialnum'].toUpperCase()
    //                 tokensigning.selectCertificate({ serial }).then(data => {
    //                     this.logMessage('Kết quả lấy thông tin certificate')
    //                     var obj = JSON.parse(data)
    //                     if (obj.code === 1) {
    //                         var objCert = JSON.parse(obj.data)
    //                         this.logMessage('dữ liệu sau khi lấy Certificate info')
    //                         this.logMessage(objCert.serial)
    //                         this.logMessage('other_info')
    //                         this.logMessage(obj.data)
    //                         //-- thực hiện ký ------------------
    //                         this.svInputPrmGlb['InVal'].push(this.svInputPrmGlb.ServiceName)
    //                         const xmlIn = '<data>' + JSON.stringify(this.svInputPrmGlb['InVal']) + '</data>'
    //                         this.svInputPrmGlb['InVal'].pop()
    //                         const datainfo = base64.encode(xmlIn)
    //                         tokensigning
    //                             .signXml(datainfo, { serial })
    //                             .then(data => {
    //                                 this.logMessage('Ký hoàn thành')
    //                                 this.logMessage(data.length)
    //                                 this.logMessage(data)
    //                                 const dataEndc = JSON.parse(data)
    //                                 if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
    //                                     this.makeOrderMod(1, dataEndc['data'])
    //                                 } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
    //                                     this.makeOrderCanl(1, dataEndc['data'], null)
    //                                 } else {
    //                                     this.logMessage('Data content')
    //                                     this.logMessage(dataEndc['data'])
    //                                     this.makeOrder(1, dataEndc['data'])
    //                                 }
    //                                 clearTimeout(this.controlSignTimeout)
    //                             })
    //                             .catch(e => {
    //                                 this.errorClearFlag()
    //                                 glb_sv.openAlertModal(
    //                                     '',
    //                                     'common_InfoMessage',
    //                                     this.props.t('error_authen_vntic'),
    //                                     '',
    //                                     'warning'
    //                                 )
    //                                 this.placeOrderFlag = false
    //                                 this.setState({ placeOrderFlag: false })
    //                                 this.logMessage('Error')
    //                                 this.logMessage(e)
    //                             })
    //                     } else if (obj.code === 0) {
    //                         this.errorClearFlag()
    //                         this.logMessage('Người dùng hủy bỏ')
    //                         return
    //                     } else {
    //                         this.errorClearFlag()
    //                         glb_sv.openAlertModal(
    //                             '',
    //                             'common_InfoMessage',
    //                             'Không tìm thấy chứng thư xác thực',
    //                             '',
    //                             'warning'
    //                         )
    //                         this.logMessage('Không tìm được chứng thư')
    //                         return
    //                     }
    //                 })
    //             } else {
    //                 this.errorClearFlag()
    //                 glb_sv.openAlertModal('', 'common_InfoMessage', 'License đã hết hiệu lực!', '', 'warning')
    //                 this.logMessage('License invalid')
    //                 this.logMessage('License invalid')
    //                 return
    //             }
    //         })
    //         .catch(e => {
    //             this.errorClearFlag()
    //             glb_sv.openAlertModal('', 'common_InfoMessage', this.props.t('error_authen_vntic'), '', 'warning')
    //             this.placeOrderFlag = false
    //             this.setState({ placeOrderFlag: false })
    //             this.logMessage('Exception')
    //             this.logMessage(e)
    //             return
    //         })
    // }

    timeoutSign = () => {
        if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
            this.orderModFlag = false
        } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
            this.orderCanclFlag = false
            this.setState({ orderCanclFlag: false })
        } else {
            this.placeOrderFlag = false
            this.setState({ placeOrderFlag: false })
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'Đã hết thời gian thực hiện xác nhận lệnh!', '', 'warning', '', '', '', this.component)
    }

    errorClearFlag = () => {
        clearTimeout(this.controlSignTimeout)
        if (this.svInputPrmGlb.ServiceName === 'ALTxChangeOrder_0501') {
            this.orderModFlag = false
        } else if (this.svInputPrmGlb.ServiceName === 'ALTxCancelOrder_0501') {
            this.setState({ orderCanclFlag: false, cancMultiFlag: false })
        } else {
            this.placeOrderFlag = false
            this.setState({ placeOrderFlag: false })
        }
    }

    changeOrdTP = stkCdOt => {
        if (stkCdOt == null || stkCdOt.length === 0) {
            this.setState({ orderTps: this.orderTpListDf })
            this.plcOrd['orderTp'] = '01'
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    orderTp: '01',
                },
            }))
            const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
            if (iputPrice) iputPrice.style.display = 'flex'
            this.handleChangeTp('ord_tp_01')
            return
        }
        const item = glb_sv.getMsgObjectByMsgKey(stkCdOt)
        if (item === null || item === undefined) {
            this.setState({ orderTps: this.orderTpListDf })
            this.plcOrd['orderTp'] = '01'
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    orderTp: '01',
                },
            }))
            const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
            if (iputPrice) iputPrice.style.display = 'flex'
            this.handleChangeTp('ord_tp_01')
            return
        }
        // tslint:disable-next-line:prefer-const
        let sanGd = item['U10'],
            hnxOrdTp = [],
            upcOrdTp = [],
            hsxOrdTp = []
        if (sanGd === '03') {
            hnxOrdTp = [
                {
                    key: '01',
                    name: 'LO',
                },
                {
                    key: '04',
                    name: 'ATC',
                },
                {
                    key: '06',
                    name: 'MOK',
                },
                {
                    key: '07',
                    name: 'MAK',
                },
                {
                    key: '08',
                    name: 'MTL',
                },
                {
                    key: '15',
                    name: 'PLO',
                },
            ]
            this.setState({ orderTps: hnxOrdTp }, () => {
                this.handleChangeTp('ord_tp_01')
            })
        } else if (sanGd === '05') {
            upcOrdTp = [
                {
                    key: '01',
                    name: 'LO',
                },
            ]
            this.setState({ orderTps: upcOrdTp }, () => {
                this.handleChangeTp('ord_tp_01')
            })
        } else if (sanGd === '01') {
            hsxOrdTp = [
                {
                    key: '01',
                    name: 'LO',
                },
                {
                    key: '02',
                    name: 'MP',
                },
                {
                    key: '03',
                    name: 'ATO',
                },
                {
                    key: '04',
                    name: 'ATC',
                },
            ]
            this.setState({ orderTps: hsxOrdTp }, () => {
                this.handleChangeTp('ord_tp_01')
            })
        } else {
            this.logMessage('No found data of stkcd: ' + stkCdOt)
        }
        this.plcOrd.orderTp = '01'
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                orderTp: '01',
            },
        }))
        const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
        if (iputPrice) iputPrice.style.display = 'flex';
        glb_sv.focusELM('orderPlc_qty')
    }

    solvingPlcOrd_TimeOut = cltSeq => {
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
        console.log('solvingPlcOrd_TimeOut', reqIfMap.reqFunct);
        if (reqIfMap.reqFunct === this.buyAble_FunctNm) {
            this.buyAbleFlag = false
        } else if (reqIfMap.reqFunct === this.sellAbleList_FunctNm) {
            this.sellAbleFlagList = false
        }
        if (reqIfMap.reqFunct === this.GET_MORE_EPMSG) {
            this.getNextEPmsg = false;
        } else if (reqIfMap.reqFunct === this.sellAble_FunctNm) {
            this.sellAbleFlag = false;
        } else if (reqIfMap.reqFunct === this.placeOrderFunctNm) {
            this.focusModal = false
            this.lastOrdInfo = {};
            this.placeOrderFlag = false
            this.setState({ cfm_order_confirm: false, placeOrderFlag: false, cfm_check_double_order: false })
            // glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning', '', true, '', this.component);
        }
    }

    openOrderList = () => {
        const obj = {
            type: this.ACTION_SUCCUSS,
            data: 'order-list',
        }
        this.commonEvent.next(obj)
    }

    onClickSellBuyChange = (e, value) => {
        e.preventDefault();
        if (this.plcOrd.sb_tp == value) return
        setTimeout(() => {
            this.resetStockInfoExten()
            this.onSellBuyTpChange(value)
        }, 100)
    }

    onSellBuyTpChange = value => {
        if (!document.getElementById(this.component + 'placeOrderButton')) {
            setTimeout(() => {
                this.onSellBuyTpChange(value);
            }, 100);
            return;
        }
        if (this.setPriceFlag) {
            this.setPriceFlag = false
            return
        }
        this.resetPlcOrderForm();
        this.plcOrd.sb_tp = value
        if (value == '2') {
            this.getSellAbleList()
            this.plcOrd['maxtrad_qty'] = 0
            document.getElementById(this.component + 'placeOrderButton').classList.remove('btn-info')
            document.getElementById(this.component + 'placeOrderButton').classList.add('btn-danger')
            if (document.getElementById(this.component + 'section-ord-buy').classList.contains('active'))
                document.getElementById(this.component + 'section-ord-buy').classList.remove('active')
            if (!document.getElementById(this.component + 'section-ord-sell').classList.contains('active'))
                document.getElementById(this.component + 'section-ord-sell').classList.add('active')
        } else {
            this.getBuyAble()
            this.setState({ stkList: this.mrk_StkList })
            document.getElementById(this.component + 'placeOrderButton').classList.remove('btn-danger')
            document.getElementById(this.component + 'placeOrderButton').classList.add('btn-info')
            if (document.getElementById(this.component + 'section-ord-sell').classList.contains('active'))
                document.getElementById(this.component + 'section-ord-sell').classList.remove('active')
            if (!document.getElementById(this.component + 'section-ord-buy').classList.contains('active'))
                document.getElementById(this.component + 'section-ord-buy').classList.add('active')
        }
        this.plcOrd['orderTp'] = '01'
        this.setState({ plcOrd: this.plcOrd }, () => {
            this.handleChangeTp('ord_tp_01')
        })
    }

    selectedStk = selected => {
        const value = selected.text || selected.label
        const stks = selected.value
        const isStk = this.recentStkList.findIndex(item => item === stks)
        if (isStk < 0) this.recentStkList.push(stks)
        if (this.recentStkList.length > 10) this.recentStkList.shift()
        localStorage.setItem('recentStkList', JSON.stringify(this.recentStkList))
        this.setState({ stkSelected: selected });
        inform_broadcast(`${commuChanel.RESET_CHART_INTRADAY}`);
        if (value !== null && value !== undefined && value.length > 0) {
            this.plcOrd.price = ''
            this.plcOrd.qty = ''
            this.plcOrd['maxtrad_qty'] = 0
            this.plcOrd.stkName = value
            const pieces = value.split('-')
            if (pieces[1].trim() === 'UPC') {
                pieces[1] = 'HNX'
            }
            if (pieces[1].trim() === 'HOSE') {
                pieces[1] = 'HSX'
            }
            const stk = pieces[1].trim() + '_' + pieces[0].trim()
            this.plcOrd.stkCode = stk
            this.changeOrdTP(stk)
            const stkMsgObj = glb_sv.getMsgObjectByMsgKey(stk);
            on_unSubStkList(this.component)
            on_subcribeIndexList([pieces[0].trim()], this.component);
            if (stkMsgObj === null || stkMsgObj === undefined) {
                this.mrkObj = new stkPriceBoard()
            } else {
                this.mrkObj = glb_sv.getMsgObjectByMsgKey(stk)
            }
            update_value_for_glb_sv({ component: this.component, key: ['objShareGlb', 'stkAtc'], value: this.mrkObj })
            update_value_for_glb_sv({ component: this.component, key: 'actStockCode', value: this.mrkObj['t55'] })
            this.setState({
                t260: (this.mrkObj.U31 && this.mrkObj.U31) > 0 ? this.mrkObj.U31 : this.mrkObj.t260,
                t332: (this.mrkObj.U29 && this.mrkObj.U29) > 0 ? this.mrkObj.U29 : this.mrkObj.t332,
                t333: (this.mrkObj.U30 && this.mrkObj.U30) > 0 ? this.mrkObj.U30 : this.mrkObj.t333,
                t31: this.mrkObj['t31'],
                t31_color: this.mrkObj['t31_color'],
                t133_1: this.mrkObj['t133_1'],
                t1331_1: this.mrkObj['t1331_1'],
                t132_1: this.mrkObj['t132_1'],
                t1321_1: this.mrkObj['t1321_1'],
                t132_1_color: this.mrkObj['t132_1_color'],
                t133_1_color: this.mrkObj['t133_1_color'],
                StockInfoExten: { ...this.mrkObj },
            });

            if (this.plcOrd.sb_tp === '1') {
                this.getBuyAble()
            } else {
                this.getSellAbleStock(stk.substr(4))
            }
        }
        this.setState({ plcOrd: this.plcOrd }, () => {
            this.handleChangeTp('ord_tp_01')
        })
        if (this.activeCode === '028') {
            glb_sv.focusELM('orderPlc_qty')
        } else {
            glb_sv.focusELM('orderPlc_price')
        }
    }

    onChangeOrderTp = e => {
        e.persist()
        const el = e.target
        if (el) {
            const allTP = document.getElementsByClassName(this.component + 'ord_tp')
            for (let i = 0; i < allTP.length; i++) {
                if (allTP[i].classList.contains('active')) allTP[i].classList.remove('active')
            }
            el.classList.add('active')
            const value = e.target.name
            this.plcOrd.orderTp = value
            if (value !== '01') {
                this.plcOrd.price = 0
                const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
                if (iputPrice) iputPrice.style.display = 'none'
                if (this.activeCode === '028') {
                    glb_sv.focusELM('orderPlc_qty')
                } else {
                    glb_sv.focusELM('orderPlc_price')
                }
            } else {
                const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
                if (iputPrice) iputPrice.style.display = 'flex'
                if (this.activeCode === '028') {
                    glb_sv.focusELM('orderPlc_qty')
                } else {
                    glb_sv.focusELM('orderPlc_price')
                }
            }
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    orderTp: this.plcOrd.orderTp,
                    price: this.plcOrd.price,
                },
            }))
            this.changePrice()
        }
    }

    handleChangeTp = (key) => {
        const elm = document.getElementById(this.component + key)
        const allTP = document.getElementsByClassName(this.component + 'ord_tp')
        for (let i = 0; i < allTP.length; i++) {
            if (allTP[i] && allTP[i].classList.contains('active')) allTP[i].classList.remove('active')
        }
        setTimeout(() => {
            if (elm) elm.classList.add('active')
        }, 100)
    }

    setPrice = e => {
        this.setPriceFlag = true
        const data = e.currentTarget.dataset
        if (data === undefined) return
        for (let temp in data) {
            if (data.hasOwnProperty(temp)) {
                this.setnewPrice(data[temp])
            }
        }
    }

    setnewPrice = prcTp => {
        if (this.state.placeOrderFlag) {
            return
        }
        if (this.plcOrd.stkCode === '' || this.plcOrd.stkCode === null || this.plcOrd.stkCode === undefined) {
            return
        }
        if (
            (prcTp === 't132_1' && this.mrkObj['t132_1'] == 777777710000) ||
            (prcTp === 't133_1' && this.mrkObj['t133_1'] == 777777710000)
        ) {
            this.setChangeOrderTp('03')
            return
        } else if (
            (prcTp === 't132_1' && this.mrkObj['t132_1'] == 777777720000) ||
            (prcTp === 't133_1' && this.mrkObj['t133_1'] == 777777720000)
        ) {
            this.setChangeOrderTp('04')
            return
        }

        if (this.plcOrd['orderTp'] !== '01') {
            this.plcOrd.price = 0
        } else {
            if (prcTp === 'CE' && this.mrkObj) {
                this.plcOrd.price = FormatNumber(this.mrkObj['t332'])
            } else if (prcTp === 'FL' && this.mrkObj) {
                this.plcOrd.price = FormatNumber(this.mrkObj['t333'])
            } else if (prcTp === 'RF' && this.mrkObj) {
                this.plcOrd.price = FormatNumber(this.mrkObj['t260'])
            } else if (prcTp === 't132_1' && this.mrkObj) {
                this.plcOrd.price = FormatNumber(this.mrkObj['t132_1'])
            } else if (prcTp === 't133_1' && this.mrkObj) {
                this.plcOrd.price = FormatNumber(this.mrkObj['t133_1'])
            } else if (prcTp === 'CR' && this.mrkObj) {
                if (this.mrkObj) {
                    this.plcOrd.price = FormatNumber(this.mrkObj['t31'])
                } else {
                    this.plcOrd.price = 0
                }
            } else {
                this.plcOrd.price = FormatNumber(prcTp)
            }
        }

        document.getElementById(this.component + 'orderPlc_qty').focus()
        this.changePrice()
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                price: this.plcOrd.price,
            },
        }))
    }

    setChangeOrderTp = TpName => {
        if (TpName) {
            const allTP = document.getElementsByClassName(this.component + 'ord_tp')
            const el = document.getElementById(this.component + 'ord_tp_' + TpName)
            for (let i = 0; i < allTP.length; i++) {
                if (allTP[i].classList.contains('active')) allTP[i].classList.remove('active')
            }
            if (el) el.classList.add('active')
            this.plcOrd.orderTp = TpName
            if (TpName !== '01') {
                this.plcOrd.price = 0
                const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
                if (iputPrice) iputPrice.style.display = 'none'
                if (this.activeCode === '028') {
                    glb_sv.focusELM('orderPlc_qty')
                } else {
                    glb_sv.focusELM('orderPlc_price')
                }
            } else {
                const iputPrice = document.getElementById(this.component + 'orderPlc_price_formgrp')
                if (iputPrice) iputPrice.style.display = 'flex';
                if (this.activeCode === '028') {
                    glb_sv.focusELM('orderPlc_qty')
                } else {
                    glb_sv.focusELM('orderPlc_price')
                }
            }
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    orderTp: this.plcOrd.orderTp,
                    price: this.plcOrd.price,
                },
            }))
            this.changePrice()
        }
    }

    resetPlcOrderForm = () => {
        this.plcOrd.stkName = ''
        this.plcOrd.stkCode = ''
        this.plcOrd.buyPw = 0
        this.plcOrd.sellPw = 0
        this.mrkObj = new stkPriceBoard()
        this.plcOrd.price = ''
        this.plcOrd.qty = ''
        this.plcOrd.stkOwn = 0
        this.orderTps = this.orderTpListDf
        this.plcOrd['orderTp'] = '01'
        this.plcOrd['maxtrad_qty'] = 0
        this.setState(
            {
                plcOrd: this.plcOrd,
                stkSelected: null,
                stkList: [],
                t31: 0,
                t31_color: '',
                t260: 0,
                t332: 0,
                t333: 0,
                t1321_1: 0,
                t132_1: 0,
                t1331_1: 0,
                t133_1: 0,
                t132_1_color: '',
                t133_1_color: '',
                t3301: 0,
                newsList: [],
            },
            () => {
                this.handleChangeTp('ord_tp_01')
            }
        )
    }

    resetStockInfoExten = () => {
        inform_broadcast(commuChanel.RESET_CHART_INTRADAY)
        this.setState({ StockInfoExten: {}, stkInfoMatching: [] })
    }

    getSellAbleList = () => {
        if (this.sellAbleFlagList) {
            return
        }
        if (this.activeAcnt !== null && this.activeAcnt !== undefined) {
            this.sellAbleFlagList = true
            const pieces = this.activeAcnt.split('.')
            const acntNo = pieces[0]
            const subNo = pieces[1]

            // -- push request to request hashmap
            const request_seq_comp = this.get_rq_seq_comp();
            const reqInfo = new requestInfo()
            reqInfo.reqFunct = this.sellAbleList_FunctNm
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.sellAbleList_ResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm();

            svInputPrm.WorkerName = 'ALTqSellAble'
            svInputPrm.ServiceName = 'ALTqSellAble'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'Q'
            svInputPrm.InVal = ['02', glb_sv.objShareGlb['workDate'], acntNo, subNo, '%']
            svInputPrm.TotInVal = svInputPrm.InVal.length

            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm
            })
            this.sellAbleFunctList_ReqTimeOut = setTimeout(this.solvingPlcOrd_TimeOut, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal
            this.req_component.set(request_seq_comp, reqInfo)
            this.setState({ stkList: [], sellList: [] })
            this.get_stk_list_sell = []
        }
    }

    getBuyAble = () => {
        if (this.buyAbleFlag) {
            return
        }
        const acntInfo = this.activeAcnt
        const stkCdInfo = this.plcOrd.stkCode
        if (acntInfo !== null && acntInfo !== undefined) {
            let stkCd = ''
            if (stkCdInfo !== null && stkCdInfo !== undefined && stkCdInfo !== '') {
                stkCd = stkCdInfo.substr(4)
            } else {
                stkCd = null
            }
            this.buyAbleFlag = true
            const pieces = acntInfo.split('.')
            const acntNo = pieces[0]
            const subNo = pieces[1];

            const request_seq_comp = this.get_rq_seq_comp();

            // -- push request to request hashmap
            const reqInfo = new requestInfo()
            reqInfo.reqFunct = this.buyAble_FunctNm
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.buyAble_ResultProc
            // -- service info
            let svInputPrm = new serviceInputPrm();

            svInputPrm.WorkerName = 'ALTqBuyAble'
            svInputPrm.ServiceName = 'ALTqBuyAble'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'Q'
            svInputPrm.InVal = [acntNo, subNo, stkCd, '0000']
            svInputPrm.TotInVal = svInputPrm.InVal.length
            this.buyAbleFunct_ReqTimeOut = setTimeout(this.solvingPlcOrd_TimeOut, functionList.reqTimeout, request_seq_comp)
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

            this.plcOrd.buyPw = 0
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    buyPw: 0,
                },
            }))
        }
    }

    getSellAbleStock = stkCd => {
        if (this.sellAbleFlag) {
            return
        }
        const acntInfo = this.activeAcnt
        if (acntInfo !== null && acntInfo !== undefined && stkCd !== null && stkCd !== undefined && stkCd !== '') {
            this.sellAbleFlag = true
            const pieces = acntInfo.split('.')
            const acntNo = pieces[0]
            const subNo = pieces[1]

            const request_seq_comp = this.get_rq_seq_comp();

            // -- push request to request hashmap
            const reqInfo = new requestInfo()
            reqInfo.reqFunct = this.sellAble_FunctNm;
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.sellAble_ResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm();

            svInputPrm.WorkerName = 'ALTqSellAble'
            svInputPrm.ServiceName = 'ALTqSellAble'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'Q'
            svInputPrm.InVal = ['02', glb_sv.objShareGlb['workDate'], acntNo, subNo, stkCd]
            svInputPrm.TotInVal = svInputPrm.InVal.length
            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm: svInputPrm
            })
            this.sellAbleFunctList_ReqTimeOut = setTimeout(this.solvingPlcOrd_TimeOut, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal
            this.req_component.set(request_seq_comp, reqInfo)
            this.plcOrd.sellPw = 0
            this.plcOrd.stkOwn = 0
            this.plcOrd.maxtrad_qty = 0
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    sellPw: 0,
                    stkOwn: 0,
                    maxtrad_qty: 0,
                },
            }))
        }
    }

    changePrice = () => {
        if (this.plcOrd.sb_tp === '1') {
            let price
            const buyPw = this.plcOrd.buyPw
            if (this.plcOrd['orderTp'] !== '01') {
                price = this.mrkObj['t332'] + ''
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        price: this.plcOrd.price,
                    },
                }))
            } else {
                price = this.plcOrd.price
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        price: this.plcOrd.price,
                    },
                }))
            }

            if (
                price === '' ||
                price === undefined ||
                price.length === '' ||
                buyPw === null ||
                buyPw === undefined ||
                buyPw === 0
            ) {
                this.plcOrd['maxtrad_qty'] = 0
                this.setState(prevState => ({
                    plcOrd: {
                        ...prevState.plcOrd,
                        maxtrad_qty: this.plcOrd.maxtrad_qty,
                    },
                }))
            } else {
                const priceVal = glb_sv.filterNumber(price)
                if (priceVal == null || priceVal === undefined || priceVal <= 0) {
                    this.plcOrd['maxtrad_qty'] = 0
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            maxtrad_qty: this.plcOrd.maxtrad_qty,
                        },
                    }))
                    return
                }
                const QtyVal = this.calc_max_buyqty(priceVal, buyPw, this.temp_fee || 0)
                const stk = this.plcOrd.stkCode
                const Sgd = stk.substr(0, 3)
                if (Sgd === 'HNX' || Sgd === 'UPC') {
                    this.plcOrd['maxtrad_qty'] = Math.floor(QtyVal)
                    this.setState(prevState => ({
                        plcOrd: {
                            ...prevState.plcOrd,
                            maxtrad_qty: this.plcOrd.maxtrad_qty,
                        },
                    }))
                } else {
                    if (QtyVal >= 10) {
                        const QtyValLt = Math.floor(QtyVal / 10)
                        this.plcOrd['maxtrad_qty'] = QtyValLt * 10
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                maxtrad_qty: this.plcOrd.maxtrad_qty,
                            },
                        }))
                    } else {
                        this.plcOrd['maxtrad_qty'] = 0
                        this.setState(prevState => ({
                            plcOrd: {
                                ...prevState.plcOrd,
                                maxtrad_qty: this.plcOrd.maxtrad_qty,
                            },
                        }))
                    }
                }
            }
        }
    }

    confirmDoubleOrder = actTp => {
        if (this.placeOrderFlag) {
            return
        }
        this.placeOrderFlag = true
        if (actTp === 'Y') {
            this.setState({ placeOrderFlag: true })
            this.sendOrder()
        } else {
            this.placeOrderFlag = false
            this.setState({ placeOrderFlag: false, cfm_check_double_order: false })
            return
        }
    }

    calc_max_buyqty = (price, buypw, fee_rto) => {
        return buypw / (price + (fee_rto / 100) * price)
    }

    handleChangePrice = e => {
        e.preventDefault()
        this.plcOrd.price = FormatNumber(Number(e.target.value.replace(/\D/g, ''))) || ''
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                price: this.plcOrd.price,
            },
        }))
        if (this.timeoutChangePrice) clearTimeout(this.timeoutChangePrice)
        this.timeoutChangePrice = setTimeout(() => {
            this.changePrice()
        }, 500)
    }

    handleChangeQty = e => {
        e.preventDefault()
        this.plcOrd.qty = FormatNumber(Number(e.target.value.replace(/\D/g, ''))) || ''
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                qty: this.plcOrd.qty,
            },
        }))
    }

    modalAfterOpened = () => {
        if (this.state.cfm_buypower_detail_margin) {
            setTimeout(() => document.getElementById(this.component + 'button_modal_buy_pwmargin').focus(), 300)
        }
        if (this.state.cfm_buypower_detail_norm) {
            setTimeout(() => document.getElementById(this.component + 'bt_sendMsgmrgCfmOk').focus(), 300)
        }
        if (this.state.cfm_check_double_order) {
            setTimeout(() => document.getElementById(this.component + 'buttonCfmDoubleOrderOk').focus(), 300)
        }
        if (this.state.cfm_order_confirm) {
            setTimeout(() => document.getElementById(this.component + 'buttonCfmOrder').focus(), 300)
        }
    }

    translateOrderTp = () => {
        if (this.state.plcOrd.orderTp === '01') {
            return 'order_Limit'
        } else if (this.state.plcOrd.orderTp === '02') {
            return 'order_Mp'
        } else if (this.state.plcOrd.orderTp === '03') {
            return 'order_ATO'
        } else if (this.state.plcOrd.orderTp === '04') {
            return 'order_ATC'
        } else if (this.state.plcOrd.orderTp === '06') {
            return 'order_MOK'
        } else if (this.state.plcOrd.orderTp === '07') {
            return 'order_MAK'
        } else if (this.state.plcOrd.orderTp === '08') {
            return 'order_MTL'
        } else if (this.state.plcOrd.orderTp === '15') {
            return 'order_PLO'
        }
    }

    translateOrderTpPrice = () => {
        if (this.state.plcOrd.orderTp === '02') {
            return 'MP'
        } else if (this.state.plcOrd.orderTp === '03') {
            return 'ATO'
        } else if (this.state.plcOrd.orderTp === '04') {
            return 'ATC'
        } else if (this.state.plcOrd.orderTp === '06') {
            return 'MOK'
        } else if (this.state.plcOrd.orderTp === '07') {
            return 'MAK'
        } else if (this.state.plcOrd.orderTp === '08') {
            return 'MTL'
        } else if (this.state.plcOrd.orderTp === '15') {
            return 'PLO'
        }
    }

    translateSessionTp = () => {
        if (this.state.plcOrd.seasonTp === '01') {
            return 'ATO_session'
        } else if (this.state.plcOrd.seasonTp === '02') {
            return 'continuity_session_morning'
        } else if (this.state.plcOrd.seasonTp === '03') {
            return 'continuity_session_afternoon'
        } else if (this.state.plcOrd.seasonTp === '04') {
            return 'ATC_session'
        } else if (this.state.plcOrd.seasonTp === '05') {
            return 'priceboard_Close'
        }
    }

    modalAfterOpened_buypower_detail_margin = () => {
        const elm = document.getElementById(this.component + 'button_modal_buy_pwmargin')
        if (elm) setTimeout(() => elm.focus(), 300)
    }

    toggle = (key) => {
        if (key === 1) {
            this.setState({
                tooltipOpen_buysell1: !this.state.tooltipOpen_buysell1,
            })
        } else if (key === 2) {
            this.setState({
                tooltipOpen_buysell2: !this.state.tooltipOpen_buysell2,
            })
        } else if (key === 3) {
            this.setState({
                tooltipOpen_buyPw: !this.state.tooltipOpen_buyPw,
            })
        } else if (key === 4) {
            this.setState({
                tooltipOpen_sellPw: !this.state.tooltipOpen_sellPw,
            })
        } else if (key === 5) {
            this.setState({
                tooltipOpen_search: !this.state.tooltipOpen_search,
            })
        } else if (key === 6) {
            this.setState({
                tooltipOpen_maxvolumn: !this.state.tooltipOpen_maxvolumn,
            })
        } else if (key === 7) {

        } else if (key === 8) {
            this.setState({
                tooltipOpen_temporary_settle: !this.state.tooltipOpen_temporary_settle,
            })
        } else if (key === 9) {
            this.setState({
                tooltipRefesh_buyPw: !this.state.tooltipRefesh_buyPw,
            })
        }
    }

    handleKeyPress = e => {
        const code = e.keyCode ? e.keyCode : e.which
        if (code !== 13) return
        const name = e.target.name

        if (name === 'qty' || name === 'price') {
            this.placeOrder()
        }
    }

    tongleRememberOrder = () => {
        this.setState({ remOrder: !this.state.remOrder })
    }

    transTimeNews(time) {
        if (time === undefined) return ''
        if (time && time.length < 14) return time
        else {
            const day = time.substr(6, 2)
            const month = time.substr(4, 2)
            const year = time.substr(0, 4)
            const hh = time.substr(8, 2)
            const mm = time.substr(10, 2)
            const ss = time.substr(12, 2)
            return day + '/' + month + '/' + year + ' ' + hh + ':' + mm + ':' + ss
        }
    }

    openModalNews = (e, item) => {
        e.preventDefault()
        const msg = { type: this.OPEN_MODAL_NEWS, link: item.c3 }
        this.commonEvent.next(msg)
    }

    changeColorPrice = value => {
        let color = ''
        if (value > 0 && value > this.state.StockInfoExten.t333 && value < this.state.StockInfoExten.t260)
            color = 'price_basic_less'
        if (value > 0 && value < this.state.StockInfoExten.t332 && value > this.state.StockInfoExten.t260)
            color = 'price_basic_over'
        if (value === 0 || value === this.state.StockInfoExten.t260) color = 'price_basic_color'
        if (value > 0 && value === this.state.StockInfoExten.t332) color = 'price_ceil_color'
        if (value > 0 && value === this.state.StockInfoExten.t333) color = 'price_floor_color'
        return color
    }

    setHightForStkExtend = () => {
        // xet chieu cao cho cac form ben phai
        // const extenAbove = (60 * 454) / 100 - 5
        const extenUnder = (40 * 454) / 100 - 7
        // document.getElementById(this.component + 'order_exten_above').style.height = extenAbove + 44 + 'px'
        // document.getElementById(this.component + 'table_orderTableExtend').style.height = extenAbove + 44 + 'px'
        // document.getElementById(this.component + 'div_order_stkInfoMatching').style.maxHeight = extenAbove + 44 + 'px'
        // document.getElementById(this.component + 'div_order_stkInfoAskBid').style.height = extenAbove + 44 + 'px'
        document.getElementById(this.component + 'order_exten_under').style.height = extenUnder + 'px'
    }

    changeBackground = (id, oldValue, newValue) => {
        const elemm = document.getElementById(this.component + id)
        if (elemm === null || elemm === undefined) {
            return
        }
        if (newValue < oldValue) {
            if (elemm.classList.contains('bk_blue')) {
                elemm.classList.remove('bk_blue')
            }
            if (!elemm.classList.contains('bk_red')) {
                elemm.classList.add('bk_red')
            }
            setTimeout(() => {
                if (elemm.classList.contains('bk_red')) {
                    elemm.classList.remove('bk_red')
                }
            }, 500)
            return
        } else if (newValue > oldValue) {
            if (elemm.classList.contains('bk_red')) {
                elemm.classList.remove('bk_red')
            }
            if (!elemm.classList.contains('bk_blue')) {
                elemm.classList.add('bk_blue')
            }
            setTimeout(() => {
                if (elemm.classList.contains('bk_blue')) {
                    elemm.classList.remove('bk_blue')
                }
            }, 500)
            return
        }
    }

    countPercentofArray(arr) {
        const percentArray = []
        if (arr === undefined || arr === []) return []
        arr.forEach(item => {
            if (percentArray.find(temp => temp === item.c2)) {
                return
            } else {
                percentArray.push(item.c2)
            }
        })
        const result = [[this.props.t('price'), this.props.t('qty')]]
        percentArray.sort().forEach(item => {
            let total = 0
            arr.forEach(temp => {
                if (temp.c2 === item) total = temp.c1 + total
            })
            result.push([FormatNumber(item, 0, 0), total])
        })
        return result
    }

    getNewValues = (value) => {
        console.log("getNewValues -> value", value)
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['autionMatch_timePriceSumVol_Map', 'stkInfoTradviewMap', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            glb_sv.HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            glb_sv.HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            glb_sv.UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
            const autionMatch_timePriceSumVol_Map = agrs.get('autionMatch_timePriceSumVol_Map')

            const msgObj = glb_sv.getMsgObjectByMsgKey(value);

            if (msgObj !== null && msgObj !== undefined) {
                this.StockInfoExten = msgObj;
            } else {
                this.StockInfoExten = new stkPriceBoard();
            }
            this.setState({ StockInfoExten: { ...this.StockInfoExten } });
            let curLength = 0;
            this.stkInfoMatching = autionMatch_timePriceSumVol_Map.get(value) === undefined ? [] : autionMatch_timePriceSumVol_Map.get(value);
            console.log("stkInfoMatching", this.stkInfoMatching)
            this.setState({ stkInfoMatching: this.stkInfoMatching });
            if (this.stkInfoMatching === null || this.stkInfoMatching === undefined || this.stkInfoMatching.length === 0) {
                this.ep_nexSeq = 99999999;
                this.ep_nexSubSeq = 0;
                curLength = 10000;
            } else if (this.stkInfoMatching.length > 0 && this.stkInfoMatching.length < 10000) {
                this.ep_nexSeq = this.stkInfoMatching[this.stkInfoMatching.length - 1]['c3'] - 1;
                this.ep_nexSubSeq = this.stkInfoMatching[this.stkInfoMatching.length - 1]['c4'];
                curLength = 10000 - this.stkInfoMatching.length;
            } else {
                curLength = this.stkInfoMatching.length + 1;
            }
            if (curLength <= 10000) { this.getMore_EpMsg(this.ep_nexSeq, this.ep_nexSubSeq, curLength); }
        })

    }

    getMore_EpMsg = (nexSeq, nexSubSeq, numberRow) => {
        if (this.getNextEPmsg) { return; }
        this.getNextEPmsg = true;
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap --
        const reqInfo = new requestInfo();
        reqInfo.reqFunct = this.GET_MORE_EPMSG
        reqInfo.procStat = 0;
        reqInfo.reqTime = new Date();
        reqInfo.component = this.component;
        reqInfo.receiveFunct = ''
        this.req_component.set(request_seq_comp, reqInfo);
        const stk = this.plcOrd.stkCode.split('_');
        const F1 = stk[0] + '|EP|' + stk[1];
        const msgObj = { 'Command': 'RESEND', F1, 'F2': nexSeq, 'F3': nexSubSeq, 'F4': numberRow };
        this.GET_MORE_EPMSG_ReqTimeout = setTimeout(this.solvingPlcOrd_TimeOut, glb_sv.getTimeoutNum(2), request_seq_comp);
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReqMRK,
                reqFunct: reqInfo.reqFunct,
                msgObj: msgObj
            },
            svInputPrm: {}
        })
    }

    getPriceOrder = (sbTp, price, stk) => {
        if (sbTp === 'priceboard_sell') sbTp = '2'
        else if (sbTp === 'priceboard_buy') sbTp = '1'
        if (Number(price) <= this.state.t333) price = this.state.t333
        else if (Number(price) >= this.state.t332) price = this.state.t332
        //----------------------------------
        if (this.state.placeOrderFlag) {
            return
        }
        // const arrData = msg['data'].split('|');
        const old_sb_tp = this.plcOrd.sb_tp
        if (sbTp === '1') {
            // -- mua
            this.plcOrd.sb_tp = '1'
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    sb_tp: this.plcOrd.sb_tp,
                },
            }))
        } else if (sbTp === '2') {
            // -- ban
            this.plcOrd.sb_tp = '2'
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    sb_tp: this.plcOrd.sb_tp,
                },
            }))
        }
        // this.state.stkSelected
        if (old_sb_tp !== this.plcOrd.sb_tp) this.onSellBuyTpChange(this.plcOrd.sb_tp)
        this.changeOrdTP(this.plcOrd.stkCode)
        if (Number(price) === 777777720000) {
            this.plcOrd.price = '0'
            this.plcOrd['orderTp'] = '04'
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    price: this.plcOrd.price,
                    orderTp: this.plcOrd.orderTp,
                },
            }))
        } else if (Number(price) === 777777710000) {
            this.plcOrd.price = '0'
            this.plcOrd['orderTp'] = '03'
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    price: this.plcOrd.price,
                    orderTp: this.plcOrd.orderTp,
                },
            }))
        } else {
            this.plcOrd.price = FormatNumber(Number(price), 0)
            this.setState(prevState => ({
                plcOrd: {
                    ...prevState.plcOrd,
                    price: this.plcOrd.price,
                },
            }))
        }
        if (this.plcOrd.sb_tp === '1') {
            this.buyAbleFlag = false
            this.refeshGetBuySellPW(this.plcOrd.sb_tp)
        }

        this.setState({ show: 'block', hide: 'none' })
        setTimeout(() => {
            if (price === 0 || price === '0') {
                document.getElementById(this.component + 'orderPlc_price').focus()
            } else {
                document.getElementById(this.component + 'orderPlc_qty').focus()
            }
        }, 500)
    }

    refeshSellAble = () => {
        if (this.plcOrd.sb_tp === '2') {
            this.getSellAbleList()
            const stk = this.plcOrd.stkCode
            if (stk !== null && stk !== undefined && stk !== '') {
                this.getSellAbleStock(stk.substr(4))
            }
        }
    }

    handleChangeAccount = ({ value, label }) => {
        this.activeAcnt = value;
        this.plcOrd.acntNo = label;
        this.refeshGetBuySellPW(this.plcOrd.sb_tp)
        this.resetPlcOrderForm()
        this.resetStockInfoExten()
        if (this.plcOrd.sb_tp === '2') {
            this.getSellAbleList()
        } else {
            this.getBuyAble()
            this.setState({ stkList: this.mrk_StkList })
        }
        this.setState(prevState => ({
            plcOrd: {
                ...prevState.plcOrd,
                acntNo: label
            },
        }));

    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab + ''
            });
        }
    }

    render() {
        const { t } = this.props
        const nameOrderTp = this.translateOrderTp()
        const { StockInfoExten } = this.state;
        return (<div style={{ overflow: 'auto', height: '100%' }}>
            <div
                name="placeorderForm"
                id="div_parent_orderForm"
                className="orderForm div_place_order"
            >
                <div
                    id="orderForm"
                    style={{
                        position: 'relative',
                        display: 'flex',
                        width: '100%'
                    }}
                >
                    <div className="no-padding flex width-place-order" style={{ position: 'relative', overflow: 'hidden' }}>
                        <AddOrderForm
                            {...this.props}
                            state={this.state}
                            component={this.component}
                            get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                            get_rq_seq_comp={this.get_rq_seq_comp}
                            req_component={this.req_component}
                            setnewPrice={this.setnewPrice}
                            handleKeyPress={this.handleKeyPress}
                            toggle={this.toggle}
                            getBuyAble={this.getBuyAble}
                            placeOrder={this.placeOrder}
                            setHightForStkExtend={this.setHightForStkExtend}
                            plcOrd={this.state.plcOrd}
                            getSellAbleStock={this.getSellAbleStock}
                            resetStockInfoExten={this.resetStockInfoExten}
                            style={this.state.style}
                            themePage={this.state.themePage}
                            language={this.state.language}
                            nameOrderTp={nameOrderTp}
                            orderTps={this.state.orderTps}
                            handleChangeAccount={this.handleChangeAccount}
                            onClickSellBuyChange={this.onClickSellBuyChange}
                            selectedStk={this.selectedStk}
                            onChangeOrderTp={this.onChangeOrderTp}
                            handleChangeQty={this.handleChangeQty}
                            handleChangePrice={this.handleChangePrice}
                            getMaxVolumeTradding={this.getMaxVolumeTradding}
                        />
                    </div>

                    <div className="padding5 flex-2" style={{ minWidth: 430 }}>
                        <div className="card" style={{ height: '100%' }}>
                            <div className="card-body">
                                <div style={{ maxHeight: 210, overflow: 'hidden', overflowY: 'auto' }}>
                                    {this.state.plcOrd.sb_tp === '1' && (this.state.buyPower['c14'] === 'Y' || this.state.buyPower['c14'] === 'Z' ? <>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('buying_power_frm')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.plcOrd['buyPw'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('the_property_is_assessed_for_purchasing_power')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c8'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('total_debt_accounted_for_in_purchasing_power')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c10'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('minimum_maintenance_ratio')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c9'] * 100, 0, 0)}&nbsp;%
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('ratio_of_asset_valuation')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c11'] * 100, 0, 0)}&nbsp;%
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('current_capital_contribution_ratio')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c15'] * 100, 0, 0)}&nbsp;%
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('ratio_of_the_customer_rating')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {this.state.buyPower['c12'] * 100}&nbsp;%
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('limit_room_margin')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c13'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('cash_available_mrg')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c1'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('total_cash_blocked_amount')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c4'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                {t('total_cash_detained_amount')}
                                            </label>
                                            <div className="col-5">
                                                <div className="input-group input-group-sm">
                                                    <span className="form-control form-control-sm text-right">
                                                        {FormatNumber(this.state.buyPower['c5'], 0, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <>
                                            <div className="form-group row">
                                                <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                    {t('buying_power_frm')}
                                                </label>
                                                <div className="col-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {FormatNumber(this.state.plcOrd.buyPw, 0, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                    {t('total_cash_can_withdrawn')}
                                                </label>
                                                <div className="col-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {FormatNumber(this.state.buyPower['c1'], 0, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                    {t('total_pia_can_be_used')}
                                                </label>
                                                <div className="col-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right ">
                                                            {FormatNumber(this.state.buyPower['c2'], 0, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                    {t('total_vitual_deposite_be_used')}
                                                </label>
                                                <div className="col-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {FormatNumber(this.state.buyPower['c3'], 0, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                    {t('total_cash_blocked_amount')}
                                                </label>
                                                <div className="col-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {FormatNumber(this.state.buyPower['c4'], 0, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group row">
                                                <label className="col-7 control-label no-padding-right text-left marginAuto">
                                                    {t('total_cash_detained_amount')}
                                                </label>
                                                <div className="col-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="form-control form-control-sm text-right">
                                                            {FormatNumber(this.state.buyPower['c5'], 0, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                        </>)}
                                    {this.state.plcOrd.sb_tp === '2' && <>
                                        <div className="table-responsive" id={this.component + "div_order_stkInfoMatching"} style={{ overflow: 'hidden', overflowY: 'auto' }}>
                                            <table className="tableStockInfo table_sticky table_priceboard_small table-bordered table-striped table_stk_info table-fix-width">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center">
                                                            {t('short_symbol')}
                                                        </th>
                                                        <th className="text-center">
                                                            {t('sell_able_quantity')}
                                                        </th>
                                                        <th className="text-center">
                                                            {t('qty_custody')}
                                                        </th>
                                                        <th className="text-center">
                                                            {t('qty_owner')}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.sellList.map(item =>
                                                        <tr key={item.c0}>
                                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>{item.c0}</td>
                                                            <td className="text-right cursor_ponter" style={{ verticalAlign: 'middle' }}>
                                                                {FormatNumber(item.c3, 0, 0)}</td>
                                                            <td className={"text-right cursor_ponter "} style={{ verticalAlign: 'middle' }}>
                                                                {FormatNumber(item.c8, 0, 1)}</td>
                                                            <td className={"text-right "} style={{ verticalAlign: 'middle' }}>
                                                                {FormatNumber(item.c2, 0, 1)}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                    </>}
                                </div>
                                <div className="seperator"></div>
                                <div id={this.component + "order_exten_under"} style={{ paddingTop: 8 }}>
                                    <div
                                        className="card-body widget-body"
                                        style={{ padding: 0, height: '100%', position: 'relative', overflow: 'hidden' }}
                                    >
                                        <ChartIntraday
                                            t={t}
                                            themePage={this.state.themePage}
                                            language={this.state.language}
                                            component={this.component}
                                            get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                            itemName={StockInfoExten.itemName}
                                            req_component={this.req_component}
                                            t260={StockInfoExten.t260}
                                            t333={StockInfoExten.t333}
                                            t332={StockInfoExten.t332}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex-3" style={{ minWidth: 500 }}>
                        <div
                            className="card"
                            style={{ display: this.state.show, marginTop: 'unset', marginBottom: 0 }}
                        >
                            <div className="card-body widget-body no-padding" style={{ position: 'relative', height: '100%', backgroundColor: 'var(--main__background__color)', padding: 0 }}>
                                <div
                                    className="row no-margin-left no-margin-right"
                                    id={this.component + "order_exten_above"}
                                    style={{ position: 'relative', overflow: 'hidden' }}
                                >
                                    <div className="col no-padding-left no-padding-right">
                                        <BidAskTable
                                            get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                            component={this.component}
                                            setnewPrice={this.setnewPrice}
                                            StockInfoExten={StockInfoExten} />
                                    </div>
                                    <div className="seperator_col"></div>
                                    <div className="col no-padding-right no-padding-left">
                                        <TimeVolumePriceMachingTable
                                            get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                            component={this.component}
                                            stkInfoMatching={this.state.stkInfoMatching}
                                            setnewPrice={this.setnewPrice}
                                            StockInfoExten={StockInfoExten} />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* modal xác thực khi lệnh có các thông tin trùng lặp */}
                <Modal
                    isOpen={this.state.cfm_check_double_order}
                    size={'sm modal-notify'}
                    onClosed={this.modalModalClose}
                    onOpened={this.modalAfterOpened}
                >
                    <ModalHeader
                        // toggle={(e) => this.confirmDoubleOrder('N')}
                        style={{ padding: '10px 15px' }}
                    >
                        {t('order_confirm')}
                    </ModalHeader>
                    <ModalBody>
                        <div className="form-group row">
                            <div className="col-12">
                                <span>{t('confirm_send_the_same_order')}</span>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col mb-2 ">
                                    <Button
                                        size="sm"
                                        block
                                        id={this.component + "buttonCfmDoubleOrderOk"}
                                        autoFocus
                                        color="wizard"
                                        onClick={e => this.confirmDoubleOrder('Y')}
                                    >
                                        {this.state.placeOrderFlag ? (
                                            <span>
                                                {t('common_processing')}
                                                <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                            </span>
                                        ) : (
                                                <span>{t('order_confirm_send')}</span>
                                            )}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button size="sm" block color="cancel" onClick={e => this.confirmDoubleOrder('N')}>
                                        <span>{t('order_confirm_cancel')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

                {/* modal xac thuc dat lenh */}
                <Modal
                    isOpen={this.state.cfm_order_confirm}
                    size={'md modal-notify'}
                    onClosed={this.modalModalClose}
                    onOpened={this.modalAfterOpened}
                >
                    <ModalHeader
                        style={{ padding: '10px 15px' }}
                    >
                        {this.state.plcOrd.sb_tp !== '2' && (
                            <div className="col-12">
                                <div className="text-center msgInfo font_header">
                                    <span>{t('screen_confirm_order_buy')}</span>
                                </div>
                            </div>
                        )}
                        {this.state.plcOrd.sb_tp !== '1' && (
                            <div className="col-12">
                                <div className="text-center msgInfo font_header">
                                    <span>{t('screen_confirm_order_sell')}</span>
                                </div>
                            </div>
                        )}
                    </ModalHeader>
                    <ModalBody>

                        <div className="form-group row">
                            <label className="col-2 marginAuto control-label no-padding-right text-left">
                                {t('acnt_no_short')}
                            </label>
                            <div className="col-10">
                                <span className="form-control form-control-sm">{this.state.plcOrd.acntNo}</span>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 marginAuto control-label no-padding-right text-left">
                                {t('short_symbol')}
                            </label>
                            <div className="col-10">
                                <span
                                    className="form-control form-control-sm text-append nowrap"
                                    style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                    {this.state.plcOrd.stkName}
                                </span>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 marginAuto control-label no-padding-right text-left">
                                {t('short_volume')}
                            </label>
                            <div className="col-4">
                                <span className="form-control form-control-sm text-right">{this.state.plcOrd.qty}</span>
                            </div>
                            <label className="col-2 marginAuto control-label no-padding-right text-left">
                                {t('order_tp')}
                            </label>
                            <div className="col-4">
                                <span className="form-control form-control-sm" style={{ whiteSpace: 'nowrap' }}>
                                    {t(nameOrderTp)}
                                </span>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 marginAuto control-label no-padding-right">{t('price')}</label>
                            <div className="col-4">
                                <div className="input-group input-group-sm">
                                    {this.state.plcOrd.orderTp === '01' && (
                                        <span className="form-control form-control-sm text-right">
                                            {this.state.plcOrd['price']}
                                        </span>
                                    )}
                                    {this.state.plcOrd.orderTp !== '01' && (
                                        <span className="form-control form-control-sm text-right">
                                            {t(this.translateOrderTpPrice())}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <label className="col-2 marginAuto control-label no-padding-right">
                                {t('tradding_value')}
                            </label>
                            <div className="col-4">
                                <div className="input-group input-group-sm">
                                    <span className="form-control form-control-sm text-right">
                                        {FormatNumber(this.state.plcOrd.tradAmount, 0, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {this.state.plcOrd['sb_tp'] === '1' && (
                            <div className="form-group row">
                                <label className="col-2 marginAuto control-label no-padding-right">
                                    {t('temporary_fee')}
                                </label>
                                <div className="col-4">
                                    <div className="input-group input-group-sm">
                                        <span
                                            className="form-control form-control-sm text-right"
                                            id="tooltip_temporary_fee"
                                        >
                                            {FormatNumber(this.state.plcOrd.fee_buy, 0, 0)}
                                        </span>
                                        <UncontrolledTooltip placement="top" target="tooltip_temporary_fee">
                                            {t('temporary_fee_tooltip')}
                                        </UncontrolledTooltip>
                                    </div>
                                </div>
                                <label className="col-2 marginAuto control-label no-padding-right">
                                    {t('temporary_settle_value')}
                                </label>
                                <div className="col-4">
                                    <div className="input-group input-group-sm">
                                        <span
                                            className="form-control form-control-sm text-right"
                                            id="tooltip_temporary_settle"
                                        >
                                            {FormatNumber(
                                                this.state.plcOrd.fee_buy + this.state.plcOrd.tradAmount,
                                                0,
                                                0
                                            )}
                                        </span>

                                        <UncontrolledTooltip placement="top" target="tooltip_temporary_settle">
                                            {t('temporary_settle_value_tooltip')}
                                        </UncontrolledTooltip>
                                    </div>
                                </div>
                            </div>
                        )}

                        {this.state.divOrderFlag && (
                            <div className="form-group row">
                                <div className="col-12" style={{ fontWeight: 600 }}>
                                    {t('system_will_divide_your_order_as_below')}
                                </div>
                            </div>
                        )}
                        {this.state.divOrderFlag && (
                            <table className="table table-sm table-striped table-bordered dataTable no-footer">
                                <thead>
                                    <tr>
                                        <th className="text-center" style={{ width: '10%' }}>
                                            {t('common_index')}
                                        </th>
                                        <th className="text-center">{t('price')}</th>
                                        <th className="text-center">{t('qty')}</th>
                                        <th className="text-center" style={{ width: '25%' }}>
                                            {t('order_number_amt')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-center">1</td>
                                        <td className="text-right">
                                            <span>{this.state.plcOrd['price']}</span>
                                        </td>
                                        <td className="text-right">
                                            <span>{FormatNumber(this.state.divOrd['qty1'], 0, 0)}</span>
                                        </td>
                                        <td className="text-right">{this.state.divOrd['num1']}</td>
                                    </tr>
                                    {this.state.divOrd['qty2'] !== 0 && (
                                        <tr>
                                            <td className="text-center">2</td>
                                            <td className="text-right">{this.state.plcOrd['price']}</td>
                                            <td className="text-right">
                                                {FormatNumber(this.state.divOrd['qty2'], 0, 0)}
                                            </td>
                                            <td className="text-right">{this.state.divOrd['num2']}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                        {this.state.divOrderFlag && (
                            <div className="row">
                                <div className="col-12" style={{ fontStyle: 'italic' }}>
                                    <p>
                                        {t('customer_notice')}
                                        <br /> {t('customer_notice_divorder_1')}
                                        <br /> {t('customer_notice_divorder_2')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button
                                        size="sm"
                                        block
                                        id={this.component + "buttonCfmOrder"}
                                        autoFocus
                                        color={this.state.plcOrd.sb_tp === '1' ? 'info' : 'danger'}
                                        onClick={e => this.confirmOrder('Y')}
                                    >
                                        {this.state.placeOrderFlag ? (
                                            <span>
                                                {t('common_processing')}
                                                <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                            </span>
                                        ) : (
                                                <span>{t('order_confirm_send')}</span>
                                            )}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button size="sm" block color="cancel" onClick={e => this.confirmOrder('N')}>
                                        <span>{t('order_confirm_cancel')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

            </div>

            <Nav tabs role="tablist" style={{ marginTop: 10 }}>
                <NavItem>
                    <NavLink className={classnames({ active: this.state.activeTab === '1' })}
                        onClick={() => { this.toggleTab(1) }}>{t('order_list_daily_short')}
                    </NavLink>
                </NavItem>
                <NavItem >
                    <NavLink className={classnames({ active: this.state.activeTab === '2' })}
                        onClick={() => { this.toggleTab(2) }}>{t('sb_assetsMng')}
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent id='divBottom' style={{ padding: '3px 5px 0 5px' }} className="panel-body" activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                    <OrderList
                        component={this.component}
                        active_components={this.props.active_components}
                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                        get_rq_seq_comp={this.get_rq_seq_comp}
                        req_component={this.req_component}
                        style={this.state.style}
                        themePage={this.state.themePage}
                        language={this.state.language}
                    />
                </TabPane>
                <TabPane tabId="2">
                    <AssetManage
                        component={this.component}
                        active_components={this.props.active_components}
                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                        get_rq_seq_comp={this.get_rq_seq_comp}
                        req_component={this.req_component}
                        style={this.state.style}
                        themePage={this.state.themePage}
                        activeAcnt={this.activeAcnt}
                        language={this.state.language} />
                </TabPane >
            </TabContent>


        </div>)
    }
}

export default translate('translations')(AddOrder);    