import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import Select, { components } from 'react-select'
import DatePicker from 'react-datepicker'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Input from '../../conponents/basic/input/Input';
import { toast } from 'react-toastify'
import SearchAccount from '../../conponents/search_account/SearchAccount';
import commuChanel from '../../constants/commChanel'
import functionList from '../../constants/functionList'
import { reply_send_req } from '../../utils/send_req';
import AdvanceOrderList from './advance-order-list/advanceOrderList';
import { on_subcribeIndexList, on_unSubStkList } from '../../utils/subcrible_functions'
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { bf_popout } from '../../utils/bf_popout'

const remote = require('electron').remote;

const customStyles = {
    option: base => ({
        ...base,
        height: 26,
        padding: '5px 12px',
    }),
    control: base => ({
        ...base,
        height: 25,
        minHeight: 25,
        border: '0px solid',
        backgroundColor: glb_sv.style[glb_sv.themePage].placeOrder.background_search,
    }),
    menuList: base => ({
        ...base,
        maxHeight: 300,
        width: 400,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        zIndex: 3,
        position: 'fixed',
        backgroundColor: glb_sv.style[glb_sv.themePage].sideBar.background_menuList,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
        fontFamily: 'monospace',
    }),
    menu: base => ({
        ...base,
        width: 400,
    }),
    indicatorSeparator: base => ({
        ...base,
        height: 15,
        marginTop: 6,
        display: 'none',
    }),
    dropdownIndicator: base => ({
        ...base,
        padding: 4,
        marginTop: -3,
        display: 'none',
    }),
    container: base => ({
        ...base,
        zIndex: 300,
    }),
    placeholder: base => ({
        ...base,
        whiteSpace: 'nowrap',
        top: '56%',
        color: glb_sv.style[glb_sv.themePage].sideBar.color_placehoder_search,
    }),
    singleValue: base => ({
        ...base,
        marginLeft: -5,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
        top: '56%',
    }),
    valueContainer: base => ({
        ...base,
        marginTop: -5,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    }),
    input: base => ({
        ...base,
        color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
        paddingTop: 4,
    }),
}

function customFilter(option, searchText) {
    if (option.data.value.toLowerCase().includes(searchText.toLowerCase())) {
        return true
    } else {
        return false
    }
}

const MenuList = props => {
    if (!Array.isArray(props.children)) {
        return <components.MenuList {...props}>{props.children}</components.MenuList>
    }
    const recentList = [],
        restList = []
    props.children.forEach(item => {
        if (
            item.props.value === glb_sv.recentStkList[0] ||
            item.props.value === glb_sv.recentStkList[1] ||
            item.props.value === glb_sv.recentStkList[2] ||
            item.props.value === glb_sv.recentStkList[3] ||
            item.props.value === glb_sv.recentStkList[4] ||
            item.props.value === glb_sv.recentStkList[5] ||
            item.props.value === glb_sv.recentStkList[6] ||
            item.props.value === glb_sv.recentStkList[7] ||
            item.props.value === glb_sv.recentStkList[8] ||
            item.props.value === glb_sv.recentStkList[9]
        ) {
            recentList.push(item)
        } else restList.push(item)
    })
    return (
        <components.MenuList {...props}>
            {recentList}
            {restList}
        </components.MenuList>
    )
}

class AdvanceOrder extends PureComponent {
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

        this.advOrderNull = {
            acntNo: '',
            stkName: null,
            stkName_require: false,
            stkCode: '',
            sb_tp: '1',
            buyPw: 0,
            sellPw: 0,
            seasonTp: '',
            t332: null,
            t333: null,
            t31: null,
            t260: null,
            orderTp: '01',
            qty: '',
            qty_require: false,
            price: '',
            price_require: false,
            effect_dt: new Date(),
            exp_dt: new Date(),
            effect_dtCfm: null,
            exp_dtCfm: null,
        }
        this.state = {
            advOrder: this.advOrderNull,
            bankConn: {
                bankAcnt: null,
                bank_cashAmt: null,
                bank_cashAvail: null,
                tooltipOpen_buying_power: false,
                tooltipOpen_sell_able: false,
                tooltipOpen_CP: false,
            },
            acntItems: [],
            seasonTps: [],
            orderTps: [{ key: '01', name: 'LO' }],
            stkList: glb_sv.mrk_StkList,
            selectedStkName: [],
            getBuyAbleFlag: false,
            refreshFlag: '', // '' or 'fa-spin'
            cfmAdvOrd: false,
            check_double_cfmAdvOrd: false,
            placeAdvOrderFlag: false,
            colorPlace: 'info',
            acntFull: [],
            subNo: [],
            isChangeTheme: true,
            language: this.props.language,
            style: this.props.style,
            themePage: this.props.themePage,
            component: this.component,
            activeAcnt: ''
        }

        if (this.props.node) {
            this.props.node.setEventListener("close", (p) => {
                window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)

                window.ipcRenderer.removeAllListeners(`${commuChanel.mrkInfoEvent}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ACTION_SUCCUSS}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.AFTER_OTP}_${this.component}`)
            })
        }
    }

    advOrder = {}
    mrkObj = {}
    dynamicId
    actn_curr = ''
    sub_curr = ''

    // advOrderForm: FormGroup;
    get_stk_list_sell = []

    // -- place advance order function
    placeAdvOrderFlag = false
    placeAdvOrderFunctNm = 'ADVORDERSCR_001'
    placeAdvOrderFunct_ReqTimeOut
    // -- get buy able function
    getBuyAble_FunctNm = 'ADVORDERSCR_002'
    getBuyAbleFlag = false
    getBuyAbleFunct_ReqTimeOut
    // -- get sell stock able function
    getSellAble_FunctNm = 'ADVORDERSCR_003'
    getSellAbleFlag = false
    getSellAbleFunct_ReqTimeOut

    // -- get bank account list
    bankConYN = false
    bankAcntTps = []
    bankAcntTpsTmp = []
    getBankAcntListFlag = false
    getBankAcntList_FunctNm = 'ADVORDERSCR_007'
    getBankAcntListFunct_ReqTimeOut
    // -- get cash available informations in bank
    getBankCashAmountFlag = false
    getBankCashAmount_FunctNm = 'ADVORDERSCR_008'
    getBankCashAmountFunct_ReqTimeOut
    // -- get daily advance order function
    getDailyAdvOrderFlag = false

    componentWillMount() {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            this.advOrderNull = {
                acntNo: '',
                stkName: null,
                stkName_require: false,
                stkCode: '',
                sb_tp: '1',
                buyPw: 0,
                sellPw: 0,
                seasonTp: '',
                t332: null,
                t333: null,
                t31: null,
                t260: null,
                orderTp: '01',
                qty: '',
                qty_require: false,
                price: '',
                price_require: false,
                effect_dt: new Date(),
                exp_dt: new Date(),
                effect_dtCfm: null,
                exp_dtCfm: null,
            }
            agrs.state.advOrder = this.advOrderNull;
            this.setState(agrs.state)
            this.setState({
                parent_id: agrs.parent_id,
                config: agrs.config,
            })

            change_theme(this.state.themePage)
            change_language(this.state.language, this.props);

            this.loadData();
        });

        // update state after popin
        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            this.advOrderNull = {
                acntNo: '',
                stkName: null,
                stkName_require: false,
                stkCode: '',
                sb_tp: '1',
                buyPw: 0,
                sellPw: 0,
                seasonTp: '',
                t332: null,
                t333: null,
                t31: null,
                t260: null,
                orderTp: '01',
                qty: '',
                qty_require: false,
                price: '',
                price_require: false,
                effect_dt: new Date(),
                exp_dt: new Date(),
                effect_dtCfm: null,
                exp_dtCfm: null,
            }
            agrs.state.advOrder = this.advOrderNull;
            this.setState(agrs.state)

        })
    }

    componentDidMount() {
        this.advOrder = this.advOrderNull
        this.bankConn = this.state.bankConn;

        if (this.props.node) {
            this.loadData();
        }

        this.orderTpListDf = [{ key: '01', name: 'order_Limit' }]

        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, msg) => {
            if (msg.type === glb_sv.ESC_KEY) {
                if (this.state.cfmAdvOrd) this.setState({ cfmAdvOrd: false })
                else if (this.state.check_double_cfmAdvOrd) this.setState({ check_double_cfmAdvOrd: false })
                else {
                    const msg = { type: glb_sv.ACTION_SUCCUSS }
                    glb_sv.commonEvent.next(msg)
                }
            }
        });

        window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
            const functionNm = msg['data'];
            if (functionNm === 'openModalAdvOrd') {
                this.placeOrderFlag = false;
                this.setState({ cfmAdvOrd: true })
            }
        })

        window.ipcRenderer.on(`${commuChanel.mrkInfoEvent}_${this.component}`, (event, msgObject) => {
            const stk = this.advOrder['stkCode']
            if (stk.length !== 7) return
            let t55 = stk.split('_')[1]
            if (msgObject.data.t55 === t55) {
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        t31: msgObject.data.t31,
                    },
                }))
            }
        });

        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            reply_send_req(agrs, this.req_component)
        });

        window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
            bf_popout(this.component, this.props.node, this.state)
        })

        window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
            this.popin_window()
        })

        window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
            window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
        })
        window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
            glb_sv.objShareGlb = agrs.objShareGlb;
        })

        if (this.inputSelect) this.inputSelect.focus()
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        if (this.placeAdvOrderFunct_ReqTimeOut) {
            clearTimeout(this.placeAdvOrderFunct_ReqTimeOut)
        }
        if (this.getBuyAbleFunct_ReqTimeOut) {
            clearTimeout(this.getBuyAbleFunct_ReqTimeOut)
        }
        if (this.getSellAbleFunct_ReqTimeOut) {
            clearTimeout(this.getSellAbleFunct_ReqTimeOut)
        }
        if (this.getBankCashAmountFunct_ReqTimeOut) {
            clearTimeout(this.getBankCashAmountFunct_ReqTimeOut)
        }
        if (this.getBankAcntListFunct_ReqTimeOut) {
            clearTimeout(this.getBankAcntListFunct_ReqTimeOut)
        }
        on_unSubStkList(this.component)
    }

    popin_window = () => {
        const current_window = remote.getCurrentWindow();
        window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
        current_window.close();
    }

    loadData() {
        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
            this.mrk_StkList = args.get('mrk_StkList');
            this.recentStkList = args.get('recentStkList');
            glb_sv.HSX_PRC_LIST = args.get('HSX_PRC_LIST');
            glb_sv.HNX_PRC_LIST = args.get('HNX_PRC_LIST');
            glb_sv.UPC_PRC_LIST = args.get('UPC_PRC_LIST');
            glb_sv.objShareGlb = args.get('objShareGlb');
            this.activeCode = args.get('activeCode');
            this.setState({ stkList: this.mrk_StkList });

            const workDt = glb_sv.objShareGlb['workDate']
            if (workDt != null && workDt.length === 8) {
                const now = new Date(
                    Number(workDt.substr(0, 4)),
                    Number(workDt.substr(4, 2)) - 1,
                    Number(workDt.substr(6, 2))
                )
                let lastDt = new Date(
                    Number(workDt.substr(0, 4)),
                    Number(workDt.substr(4, 2)) - 1,
                    Number(workDt.substr(6, 2))
                )
                lastDt.setDate(lastDt.getDate() + 7)
                this.advOrder['effect_dt'] = now
                this.advOrder['exp_dt'] = lastDt
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        effect_dt: this.advOrder.effect_dt,
                        exp_dt: this.advOrder.exp_dt,
                    },
                }))
            }

            if (this.activeCode === '075' || this.activeCode === '102') {
                this.bankConYN = true
                this.getBankAcntList()
            }
        });
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
            component: this.component,
            value: ['mrk_StkList', 'recentStkList', 'HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST', 'objShareGlb', 'activeCode'],
            sq
        });
    }

    getBuyAbleResultProc = (reqInfoMap, message) => {
        clearTimeout(this.getBuyAbleFunct_ReqTimeOut)
        this.getBuyAbleFlag = false
        this.setState({ refreshFlag: '' })
        if (reqInfoMap.procStat !== 0) {
            return
        }
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
            return
        } else {
            reqInfoMap.procStat = 2
            let jsonBuyAble
            try {
                jsonBuyAble = JSON.parse(message['Data'])
                this.advOrder['buyPw'] = jsonBuyAble[0]['c0']
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        buyPw: this.advOrder.buyPw,
                    },
                }))
            } catch (err) {
                // glb_sv.logMessage(err);
                jsonBuyAble = []
                this.advOrder['buyPw'] = 0
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        buyPw: 0,
                    },
                }))
            }

        }
    }
    getBankAcntListResultProc = (reqInfoMap, message) => {
        clearTimeout(this.getBankAcntListFunct_ReqTimeOut)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            this.getBankAcntListFlag = false
            reqInfoMap.resSucc = false

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

            this.bankAcntTpsTmp = this.bankAcntTpsTmp.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.getBankAcntListFlag = false

                this.bankAcntTps = this.bankAcntTpsTmp
                // -- get balance of first account
                if (this.bankAcntTps.length > 0) {
                    this.bankConn['bankAcnt'] = this.bankAcntTps[0]
                    // -- call function to get cash amount in bank
                    this.getBankCashAmtInfo()
                }
            }
        }
    }
    getBankCashAmountResultProc = (reqInfoMap, message) => {
        clearTimeout(this.getBankCashAmountFunct_ReqTimeOut)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        this.getBankCashAmountFlag = false
        reqInfoMap.procStat = 2
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false)
            }

            return
        } else {
            let jsondata
            try {
                jsondata = JSON.parse(message['Data'])
                this.bankConn['bank_cashAmt'] = jsondata[0]['c0']
                this.bankConn['bank_cashAvail'] = jsondata[0]['c1']
            } catch (err) {
                // glb_sv.logMessage(err);
                this.bankConn['bank_cashAmt'] = 0
                this.bankConn['bank_cashAvail'] = 0
            }

        }
    }
    getSellAbleResultProc = (reqInfoMap, message) => {
        clearTimeout(this.getSellAbleFunct_ReqTimeOut)
        this.getSellAbleFlag = false
        if (reqInfoMap.procStat !== 0) {
            return
        }
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
            return
        } else {
            reqInfoMap.procStat = 2
            let jsonsellAb
            try {
                jsonsellAb = JSON.parse(message['Data'])
                this.advOrder['sellPw'] = jsonsellAb[0]['c3']
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        sellPw: this.advOrder.sellPw,
                    },
                }))
            } catch (err) {
                // glb_sv.logMessage(err);
                this.advOrder['sellPw'] = 0
                reqInfoMap.resSucc = false
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        sellPw: this.advOrder.sellPw,
                    },
                }))
            }


        }
    }
    placeAdvOrderResultProc = (reqInfoMap, message) => {
        clearTimeout(this.placeAdvOrderFunct_ReqTimeOut)
        this.placeAdvOrderFlag = false
        this.setState({ placeAdvOrderFlag: false, check_double_cfmAdvOrd: false })
        if (reqInfoMap.procStat !== 0) {
            return
        }
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            glb_sv.lastAdvOrdInfo['acntNo'] = null
            reqInfoMap.resSucc = false
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', 'advOrder_qty', false)

                this.setState({ cfmAdvOrd: false })
            }
        } else {
            this.setState({ cfmAdvOrd: false })
            this.advOrder['price'] = ''
            this.advOrder['qty'] = ''
            this.advOrder['pass'] = null
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    price: '',
                    qty: '',
                    pass: null,
                },
            }))
            if (this.advOrder['sb_tp'] === '1') {
                this.getBuyAble()
            } else {
                const stk = this.advOrder['stkCode']
                this.getSellAbleStock(stk.substr(4))
            }
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], 'OK', 'success', '')

            const obj = {
                type: glb_sv.ACTION_SUCCUSS,
                data: 'advance-order-list',
            }
            glb_sv.commonEvent.next(obj)
        }


    }

    // --- get bank account list
    getBankAcntList = () => {
        if (this.getBankAcntListFlag) {
            return
        }
        this.getBankAcntListFlag = true

        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getBankAcntList_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getBankAcntListResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()

        svInputPrm.WorkerName = 'ALTqAccount'
        svInputPrm.ServiceName = 'ALTqAccount_Common'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['09', this.actn_curr, this.sub_curr]
        svInputPrm.TotInVal = svInputPrm.InVal.length

        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm
        })
        this.getBankAcntListFunct_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        this.req_component.set(request_seq_comp, reqInfo)

        this.bankAcntTps = []
        this.bankAcntTpsTmp = []
    }

    // --- get bank cash information
    getBankCashAmtInfo = () => {
        if (this.getBankCashAmountFlag) {
            return
        }
        this.getBankCashAmountFlag = true

        const bankAcnt = this.bankConn['bankAcnt']['c0']
        if (bankAcnt === null || bankAcnt === undefined) {
            this.getBankCashAmountFlag = false
            return
        }
        // -- push request to request hashmap
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getBankCashAmount_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getBankCashAmountResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()

        svInputPrm.WorkerName = 'ALTqCashBIDV'
        svInputPrm.ServiceName = 'ALTqCash_0201_6'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['3', this.actn_curr, this.sub_curr, bankAcnt]
        svInputPrm.TotInVal = svInputPrm.InVal.length

        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm
        })
        this.getBankCashAmountFunct_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        this.req_component.set(request_seq_comp, reqInfo)

    }

    handleChangeQty = e => {
        const value = glb_sv.filterNumber(e.target.value)
        this.advOrder.qty = FormatNumber(value)
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                qty: this.advOrder.qty,
            },
        }))
    }
    handleChangeSellBuy = sbTp => {
        this.advOrder.sb_tp = sbTp
        if (sbTp === '1') {
            this.getBuyAble()
            this.setState({ colorPlace: 'info' })
            if (this.inputSelect) this.inputSelect.focus()
            if (document.getElementById('section-advord-sell').classList.contains('active'))
                document.getElementById('section-advord-sell').classList.remove('active')
            if (!document.getElementById('section-advord-buy').classList.contains('active'))
                document.getElementById('section-advord-buy').classList.add('active')
        } else {
            const stkCd = this.advOrder['stkCode']
            if (stkCd !== null && stkCd !== undefined && stkCd.length > 0) {
                this.getSellAbleStock(stkCd.substr(4))
            }
            this.setState({ colorPlace: 'danger' })
            if (this.inputSelect) this.inputSelect.focus()
            if (document.getElementById('section-advord-buy').classList.contains('active'))
                document.getElementById('section-advord-buy').classList.remove('active')
            if (!document.getElementById('section-advord-sell').classList.contains('active'))
                document.getElementById('section-advord-sell').classList.add('active')
        }
        this.advOrder['qty'] = ''
        this.advOrder['price'] = ''
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                sb_tp: this.advOrder.sb_tp,
                qty: this.advOrder.qty,
                price: this.advOrder.price,
            },
        }))
    }

    handleChangeStkName = selected => {
        this.setState({ selectedStkName: selected })
        const value = selected.label
        const stks = selected.value
        const isStk = glb_sv.recentStkList.findIndex(item => item === stks)
        if (isStk < 0) glb_sv.recentStkList.push(stks)
        if (glb_sv.recentStkList.length > 10) glb_sv.recentStkList.shift()
        localStorage.setItem('recentStkList', JSON.stringify(glb_sv.recentStkList))

        if (value != null) {
            this.advOrder['price'] = ''
            this.advOrder['qty'] = ''
            this.advOrder['stkName'] = value
            const pieces = value.split('-')
            if (pieces[1].trim() === 'UPC') {
                pieces[1] = 'HNX'
            }
            if (pieces[1].trim() === 'HOSE') {
                pieces[1] = 'HSX'
            }
            const stkId = pieces[1].trim() + '_' + pieces[0].trim()

            on_unSubStkList(this.component)
            on_subcribeIndexList([pieces[0].trim()], this.component);

            this.advOrder['stkCode'] = stkId
            this.advOrder.seasonTp = ''
            this.mrkObj = glb_sv.getMsgObjectByMsgKey(stkId)
            this.advOrder.t260 = (this.mrkObj.U31 && this.mrkObj.U31) > 0 ? this.mrkObj.U31 : this.mrkObj.t260
            this.advOrder.t31 = this.mrkObj.t31
            this.advOrder.t332 = (this.mrkObj.U29 && this.mrkObj.U29) > 0 ? this.mrkObj.U29 : this.mrkObj.t332
            this.advOrder.t333 = (this.mrkObj.U30 && this.mrkObj.U30) > 0 ? this.mrkObj.U30 : this.mrkObj.t333

            this.changeOrdTP(stkId)
            if (this.advOrder['sb_tp'] === '1') {
                this.getBuyAble()
            } else {
                const stk = stkId
                this.getSellAbleStock(stk.substr(4))
            }
            this.setState({ advOrder: this.advOrder })
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    stkName_require: false,
                },
            }))
            const elm = document.getElementById('advOrder_seasonTp')
            if (elm) elm.focus()
        } else {
            this.advOrder['price'] = ''
            this.advOrder['qty'] = ''
            this.advOrder['stkCode'] = null
            this.advOrder['buyPw'] = 0
            this.advOrder['sellPw'] = 0
            this.orderTps = this.orderTpListDf
            this.advOrder['orderTp'] = '01'
            this.setState({ advOrder: this.advOrder, orderTps: this.orderTps })
        }
    }
    onAcntNoChange = acntNo => {
        const pieces = acntNo.split('.')
        this.actn_curr = pieces[0]
        this.sub_curr = pieces[1].substr(0, 2)
        if (this.advOrder['sb_tp'] === '1') {
            this.getBuyAble()
        } else {
            const stkCd = this.advOrder['stkCode']
            if (stkCd !== null && stkCd !== undefined && stkCd.length > 0) {
                this.getSellAbleStock(stkCd.substr(4))
            }
        }
        this.advOrder['qty'] = ''
        this.advOrder['price'] = ''
        // this.getAdvOrderList();
        // -------------------------
        if (this.bankConYN) {
            this.bankAcntTps = []
            this.bankConn['bankAcnt'] = null
            this.bankConn['bank_cashAmt'] = 0
            this.bankConn['bank_cashAvail'] = 0
            this.getBankAcntList()
        }
        this.setState({ advOrder: this.advOrder })
    }
    setnewPrice = prcTp => {
        if (this.placeAdvOrderFlag) {
            return
        }
        if (this.advOrder.stkCode === null || this.advOrder.stkCode === undefined) {
            return
        }
        if (this.advOrder['orderTp'] !== '01') {
            this.advOrder.price = 0
        } else {
            if (prcTp === 'CE') {
                if (this.mrkObj.U29 === 0 || this.mrkObj.U29 === undefined) {
                    this.advOrder.price = FormatNumber(this.mrkObj['t332'])
                } else this.advOrder.price = FormatNumber(this.mrkObj['U29'])
            } else if (prcTp === 'FL') {
                if (this.mrkObj.U30 === 0 || this.mrkObj.U30 === undefined) {
                    this.advOrder.price = FormatNumber(this.mrkObj['t333'])
                } else this.advOrder.price = FormatNumber(this.mrkObj['U30'])
            } else if (prcTp === 'RF') {
                if (this.mrkObj.U31 === 0 || this.mrkObj.U31 === undefined) {
                    this.advOrder.price = FormatNumber(this.mrkObj['t260'])
                } else this.advOrder.price = FormatNumber(this.mrkObj['U31'])
            } else if (prcTp === 'CR') {
                if (this.mrkObj['t31'] !== null && this.mrkObj['t31'] !== undefined) {
                    this.advOrder.price = FormatNumber(this.mrkObj['t31'])
                } else {
                    this.advOrder.price = 0
                }
            }
        }
        this.setState(
            prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    price: this.advOrder.price,
                    price_require: false,
                },
            }),
            () => {
                const elm = document.getElementById('advOrder_qty')
                if (elm) elm.focus()
            }
        )
    }
    handleChangeTp(key) {
        const elm = document.getElementById(key)
        const allTP = document.getElementsByClassName('advord_tp')
        for (let i = 0; i < allTP.length; i++) {
            if (allTP[i] && allTP[i].classList.contains('active')) allTP[i].classList.remove('active')
        }
        setTimeout(() => {
            if (elm) elm.classList.add('active')
        }, 100)
    }

    handleChangeOrdertp = e => {
        const orderTp = e.target.value
        this.advOrder.orderTp = orderTp
        if (orderTp !== '01') {
            this.advOrder['price'] = ''
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    price: '',
                },
            }))
        }
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                orderTp: this.advOrder.orderTp,
            },
        }))

        e.persist()
        const el = e.target
        if (el) {
            const allTP = document.getElementsByClassName('advord_tp')
            for (let i = 0; i < allTP.length; i++) {
                if (allTP[i].classList.contains('active')) allTP[i].classList.remove('active')
            }
            el.classList.add('active')
            const value = e.target.name
            this.advOrder.orderTp = value
            if (value !== '01') {
                this.advOrder.price = 0
                const iputPrice = document.getElementById('advord_price_formgrp')
                if (iputPrice) iputPrice.style.display = 'none'
                glb_sv.focusELM('advOrder_qty')
            } else {
                const iputPrice = document.getElementById('advord_price_formgrp')
                if (iputPrice) iputPrice.style.display = ''
                setTimeout(() => glb_sv.focusELM('advOrder_price'), 100)
            }
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    orderTp: this.advOrder.orderTp,
                    price: this.advOrder.price,
                },
            }))
        }
    }
    changeOrdTP = stkCdOt => {
        if (stkCdOt === null || stkCdOt.length === 0) {
            this.advOrder['seasonTp'] = ''
            this.orderTps = this.orderTpListDf
            this.advOrder['orderTp'] = '01'
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    seasonTp: '',
                    orderTp: '01',
                },
            }))
            this.setState({ seasonTps: [], orderTps: this.orderTps })
            return
        }
        const sanGd = this.mrkObj['U10']
        if (sanGd === '03') {
            const hnxSeasondTp = [
                {
                    key: '2',
                    name: 'continuity_session_morning',
                },
                {
                    key: '3',
                    name: 'continuity_session_afternoon',
                },
                {
                    key: '4',
                    name: 'ATC_session',
                },
                {
                    key: '5',
                    name: 'priceboard_Close',
                },
            ]
            this.orderTps = this.orderTpListDf
            this.advOrder['orderTp'] = '01'
            this.advOrder['seasonTp'] = ''
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    seasonTp: '',
                    orderTp: '01',
                },
            }))
            this.setState({ seasonTps: hnxSeasondTp, orderTps: this.orderTps })
        } else if (sanGd === '05') {
            const upcOrdTp = [
                {
                    key: '01',
                    name: 'order_Limit',
                },
            ]
            const upcSeasonTp = [
                {
                    key: '2',
                    name: 'continuity_session_morning',
                },
                {
                    key: '3',
                    name: 'continuity_session_afternoon',
                },
            ]
            this.orderTps = upcOrdTp
            this.advOrder['seasonTps'] = upcSeasonTp
            this.advOrder['seasonTp'] = ''
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    seasonTp: '',
                },
            }))
            this.setState({ seasonTps: upcSeasonTp, orderTps: this.orderTps })
        } else if (sanGd === '01') {
            const hoseSeasondTp = [
                {
                    key: '1',
                    name: 'ATO_session',
                },
                {
                    key: '2',
                    name: 'continuity_session_morning',
                },
                {
                    key: '3',
                    name: 'continuity_session_afternoon',
                },
                {
                    key: '4',
                    name: 'ATC_session',
                },
            ]

            this.orderTps = this.orderTpListDf
            this.advOrder['orderTp'] = '01'
            this.advOrder['seasonTps'] = hoseSeasondTp
            this.advOrder['seasonTp'] = ''
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    seasonTp: '',
                    orderTp: '01',
                },
            }))
            this.setState({ seasonTps: hoseSeasondTp, orderTps: this.orderTps })
        } else {
            glb_sv.logMessage('No found data of stkcd: ' + stkCdOt)
        }
    }

    handleChangePrice = e => {
        let value = glb_sv.filterNumber(e.target.value)
        if (e.target.value === '') value = ''
        if (value > 999) {
            this.advOrder.price = FormatNumber(value)
        } else this.advOrder.price = value + ''

        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                price: this.advOrder.price,
            },
        }))
    }
    getMaxVolumeTradding = () => {
        if (
            this.advOrder['stkCode'] === null ||
            this.advOrder['stkCode'] === undefined ||
            this.advOrder['stkCode'] === ''
        ) {
            return
        }
        if (this.advOrder['sb_tp'] === '2') {
            const stk = this.advOrder['stkCode']
            const QtyVal = this.advOrder['sellPw']
            const Sgd = stk.substr(0, 3)
            if (Sgd === 'HNX' || Sgd === 'UPC') {
                if (QtyVal >= 100) {
                    const QtyValLt = Math.floor(QtyVal / 100)
                    this.advOrder['qty'] = FormatNumber(QtyValLt * 100, 0)
                } else {
                    this.advOrder['qty'] = FormatNumber(QtyVal, 0)
                }
            } else {
                if (QtyVal >= 10) {
                    const QtyValLt = Math.floor(QtyVal / 10)
                    this.advOrder['qty'] = FormatNumber(QtyValLt * 10, 0)
                } else {
                    this.advOrder['qty'] = FormatNumber(0, 0)
                }
            }
        }
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                qty: this.advOrder.qty,
            },
        }))
    }
    refeshGetBuySellPW = sbTp => {
        if (sbTp === '1') {
            this.getBuyAble()
        } else {
            const stkCd = this.advOrder['stkCode']
            if (stkCd !== null && stkCd !== undefined && stkCd.length > 0) {
                this.getSellAbleStock(stkCd.substr(4))
            }
        }
    }
    getBuyAble = () => {
        if (this.getBuyAbleFlag) {
            return
        }
        const stkCdInfo = this.advOrder['stkCode']
        if (
            this.actn_curr !== null &&
            this.actn_curr !== undefined &&
            this.actn_curr !== '' &&
            stkCdInfo !== null &&
            stkCdInfo !== undefined &&
            stkCdInfo !== ''
        ) {
            const stkCd = stkCdInfo.substr(4)
            this.getBuyAbleFlag = true

            const request_seq_comp = this.get_rq_seq_comp()
            const reqInfo = new requestInfo()
            reqInfo.reqFunct = this.getBuyAble_FunctNm;
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.getBuyAbleResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm()

            svInputPrm.WorkerName = 'ALTqBuyAble'
            svInputPrm.ServiceName = 'ALTqBuyAble'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'Q'
            svInputPrm.InVal = [this.actn_curr, this.sub_curr, stkCd, '0000']
            svInputPrm.TotInVal = svInputPrm.InVal.length;

            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm
            })
            this.getBuyAbleFunct_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal
            this.req_component.set(request_seq_comp, reqInfo)

            this.advOrder['buyPw'] = 0
            this.setState({ refreshFlag: 'fa-spin' })
        }
    }
    getSellAbleStock = stkCd => {
        if (this.getSellAbleFlag) {
            return
        }
        if (this.actn_curr !== null && this.actn_curr !== undefined && this.actn_curr !== '' && stkCd && stkCd !== '') {
            this.getSellAbleFlag = true

            const request_seq_comp = this.get_rq_seq_comp()
            const reqInfo = new requestInfo()
            reqInfo.reqFunct = this.getSellAble_FunctNm
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.getSellAbleResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm()

            svInputPrm.WorkerName = 'ALTqSellAble'
            svInputPrm.ServiceName = 'ALTqSellAble'
            svInputPrm.ClientSentTime = '0'
            svInputPrm.Operation = 'Q'
            svInputPrm.InVal = ['02', glb_sv.objShareGlb['workDate'], this.actn_curr, this.sub_curr, stkCd]
            svInputPrm.TotInVal = svInputPrm.InVal.length

            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm
            })
            this.sellAbleFunctList_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal
            this.req_component.set(request_seq_comp, reqInfo)

            this.advOrder['sellPw'] = 0
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    sellPw: this.advOrder.sellPw,
                },
            }))
        }
    }
    handleChangeSessontp = e => {
        const sessionId = e.target.value
        this.advOrder.seasonTp = sessionId
        this.advOrder.price = ''
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                seasonTp: sessionId,
                price: '',
            },
        }))
        const stkCd = this.advOrder['stkCode']
        if (stkCd === null || stkCd.length === 0) {
            this.advOrder['orderTp'] = ''
            this.advOrder['seasonTp'] = '01'
            this.orderTps = this.orderTpListDf
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    orderTp: this.advOrder.orderTp,
                    seasonTp: this.advOrder.seasonTp,
                },
            }))
            this.setState({ orderTps: this.orderTps, seasonTps: [] })
            return
        }
        if (sessionId === null || sessionId === '') {
            this.advOrder['orderTp'] = '01'
            this.orderTps = this.orderTpListDf
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    orderTp: this.advOrder.orderTp,
                },
            }))
            this.setState({ orderTps: this.orderTps })
            return
        }

        // tslint:disable-next-line:prefer-const
        let sanGd = this.mrkObj['U10'],
            hoseOrdTp,
            hnxOrdTp,
            upcOrdTp
        if (sanGd === '01') {
            if (sessionId === '1') {
                hoseOrdTp = [
                    {
                        key: '01',
                        name: 'LO',
                    },
                    {
                        key: '03',
                        name: 'ATO',
                    },
                ]
            } else if (sessionId === '2' || sessionId === '3') {
                hoseOrdTp = [
                    {
                        key: '01',
                        name: 'LO',
                    },
                    {
                        key: '02',
                        name: 'MP',
                    },
                ]
            } else if (sessionId === '4') {
                hoseOrdTp = [
                    {
                        key: '01',
                        name: 'LO',
                    },
                    {
                        key: '04',
                        name: 'ATC',
                    },
                ]
            }
            this.advOrder['orderTp'] = '01'
            this.orderTps = hoseOrdTp
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    orderTp: this.advOrder.orderTp,
                },
            }))
            this.setState({ orderTps: this.orderTps }, () => this.handleChangeTp('advord_tp_01'))
        }
        // ---------- San HNX --------------------
        if (sanGd === '03') {
            if (sessionId === '2' || sessionId === '3') {
                hnxOrdTp = [
                    {
                        key: '01',
                        name: 'LO',
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
                ]
            } else if (sessionId === '4') {
                hnxOrdTp = [
                    {
                        key: '01',
                        name: 'LO',
                    },
                    {
                        key: '04',
                        name: 'ATC',
                    },
                ]
            } else if (sessionId === '5') {
                hnxOrdTp = [
                    {
                        key: '15',
                        name: 'PLO',
                    },
                ]
            }
            if (sessionId === '5') {
                this.advOrder['orderTp'] = '15'
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        orderTp: this.advOrder.orderTp,
                    },
                }))
            } else {
                this.advOrder['orderTp'] = '01'
                this.setState(prevState => ({
                    advOrder: {
                        ...prevState.advOrder,
                        orderTp: this.advOrder.orderTp,
                    },
                }))
            }
            this.orderTps = hnxOrdTp
            this.setState({ orderTps: this.orderTps }, () => this.handleChangeTp('advord_tp_01'))
        }
        // ---------- San UPC --------------------
        if (sanGd === '05') {
            if (sessionId === '2' || sessionId === '3') {
                upcOrdTp = [
                    {
                        key: '01',
                        name: 'LO',
                    },
                ]
            }
            this.advOrder['orderTp'] = '01'
            this.orderTps = upcOrdTp
            this.setState(prevState => ({
                advOrder: {
                    ...prevState.advOrder,
                    orderTp: this.advOrder.orderTp,
                },
            }))
            this.setState({ orderTps: this.orderTps }, () => this.handleChangeTp('advord_tp_01'))
        }
    }

    placeAdvOrder = () => {
        if (this.placeAdvOrderFlag) return;
        if (this.actn_curr === null || this.actn_curr.length !== 10) return;

        const stkCd = this.advOrder['stkCode']
        if (stkCd == null || stkCd.length < 3) {
            this.inputSelect.focus()
            glb_sv.checkToast(toast, 'warn', this.props.t('symbol_code_require'), 'advord_symbol')
            return
        }
        const orderTp = this.advOrder['orderTp']
        const seasonTp = this.advOrder['seasonTp']

        if (seasonTp == null || seasonTp === undefined || seasonTp === '') {
            glb_sv.focusELM('advOrder_seasonTp')
            glb_sv.checkToast(toast, 'warn', this.props.t('input_session_type'), 'advord_seasontp')
            return
        }

        if (orderTp == null || orderTp.length !== 2) {
            glb_sv.focusELM('advOrder_ordertp')
            glb_sv.checkToast(toast, 'warn', this.props.t('input_order_tp'), 'advord_ordertp')
            return
        }

        const qtyStr = this.advOrder['qty']
        let qty = glb_sv.filterNumber(qtyStr)
        if (qty === null || qty === '') {
            qty = 0
        }
        if (!qty || isNaN(qty) || qty <= 0) {
            glb_sv.focusELM('advOrder_qty')
            glb_sv.checkToast(toast, 'warn', this.props.t('qty_not_correct'), 'advord_qty')
            return
        }

        const priceStr = this.advOrder['price']
        let price = glb_sv.filterNumber(priceStr)
        if (price === null || price === null) {
            price = 0
        }

        if (orderTp === '01') {
            if (!price || isNaN(price) || price <= 0) {
                glb_sv.focusELM('advOrder_price')
                glb_sv.checkToast(toast, 'warn', this.props.t('price_not_correct'), 'advord_price')
                return
            }
        }

        const effect_dtOld = {
            year: this.state.advOrder['effect_dt'].getFullYear(),
            month: this.state.advOrder['effect_dt'].getMonth() + 1,
            day: this.state.advOrder['effect_dt'].getDate(),
        }
        if (!effect_dtOld) {
            glb_sv.focusELM('advOrder_effect_dt')
            glb_sv.checkToast(toast, 'warn', this.props.t('effect_dt_is_rq'), 'advord_effdt1')
            return
        }
        let day = effect_dtOld['day'] + ''
        let month = effect_dtOld['month'] + ''
        let year = effect_dtOld['year']
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
            glb_sv.focusELM('advOrder_effect_dt')
            glb_sv.checkToast(toast, 'warn', this.props.t('effect_dt_is_rq'), 'advord_effdt2')
            return
        }
        const pad = '00'
        day = pad.substring(0, pad.length - day.length) + day
        month = pad.substring(0, pad.length - month.length) + month
        const effect_dt = year + month + day
        this.advOrder['effect_dtCfm'] = day + '/' + month + '/' + year

        const exp_dtOld = {
            year: this.state.advOrder['exp_dt'].getFullYear(),
            month: this.state.advOrder['exp_dt'].getMonth() + 1,
            day: this.state.advOrder['exp_dt'].getDate(),
        }
        if (exp_dtOld === null || exp_dtOld === undefined || exp_dtOld === '') {
            glb_sv.focusELM('advOrder_exp_dt')
            glb_sv.checkToast(toast, 'warn', this.props.t('exp_dt_is_rq'), 'advord_expdt1')
            return
        }
        day = exp_dtOld['day'] + ''
        month = exp_dtOld['month'] + ''
        year = exp_dtOld['year']
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
            glb_sv.focusELM('advOrder_exp_dt')
            glb_sv.checkToast(toast, 'warn', this.props.t('exp_dt_is_rq'), 'advord_expdt2')
            return
        }

        day = pad.substring(0, pad.length - day.length) + day
        month = pad.substring(0, pad.length - month.length) + month
        const exp_dt = year + month + day
        this.advOrder['exp_dtCfm'] = day + '/' + month + '/' + year

        const workDt = glb_sv.objShareGlb['workDate']
        if (Number(effect_dt) < Number(workDt)) {
            glb_sv.focusELM('advOrder_effect_dt')
            glb_sv.checkToast(
                toast,
                'warn',
                this.props.t('effect_date_cant_over_current_date'),
                'advord_effdt_cant_over_curdt'
            )
            return
        }
        if (Number(exp_dt) < Number(effect_dt)) {
            glb_sv.focusELM('advOrder_exp_dt')
            glb_sv.checkToast(
                toast,
                'warn',
                this.props.t('effect_date_cant_over_expired_date'),
                'advord_effdt_cant_over_expdt'
            )
            return
        }
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                effect_dtCfm: this.advOrder.effect_dtCfm,
                exp_dtCfm: this.advOrder.exp_dtCfm,
            },
        }))
        
        if (!glb_sv.checkOtp('openModalAdvOrd')) {
            if (window.location.pathname.includes('___')) {
                const ermsg = 'notify_user_enter_otp_in_main_screen';
                const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
                glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
            }
            this.placeOrderFlag = false
            return
        }
        
        this.setState({ cfmAdvOrd: true });
    }

    advOrder_confirmOrder = (e, cfmTp) => {
        if (this.placeAdvOrderFlag) return;
        if (cfmTp === 'N') {
            this.setState({ cfmAdvOrd: false })
            return
        }

        if (
            glb_sv.lastAdvOrdInfo['acntNo'] != null &&
            glb_sv.lastAdvOrdInfo['acntNo'] === this.state.advOrder.acntNo &&
            glb_sv.lastAdvOrdInfo['sb_tp'] === this.advOrder['sb_tp'] &&
            glb_sv.lastAdvOrdInfo['stkCode'] === this.advOrder['stkCode'] &&
            glb_sv.lastAdvOrdInfo['orderTp'] === this.advOrder['orderTp'] &&
            glb_sv.lastAdvOrdInfo['seasonTp'] === this.advOrder['seasonTp'] &&
            glb_sv.lastAdvOrdInfo['price'] === this.state.advOrder['price'] &&
            glb_sv.lastAdvOrdInfo['qty'] === this.state.advOrder['qty'] &&
            glb_sv.lastAdvOrdInfo['startDt'] === this.advOrder.effect_dtCfm &&
            glb_sv.lastAdvOrdInfo['endDt'] === this.advOrder.exp_dtCfm
        ) {
            // -- open modal confirm send lệnh
            this.setState({ cfmAdvOrd: false, check_double_cfmAdvOrd: true })
        } else {
            this.sendAdvanceOrder()
        }
    }

    sendAdvanceOrder = () => {
        this.placeAdvOrderFlag = true
        this.setState({ placeAdvOrderFlag: true })
        const stkCd = this.advOrder['stkCode']
        const orderTp = this.advOrder['orderTp']
        const seasonTp = this.advOrder['seasonTp']
        // let password = this.advOrder['pass'];
        const qtyStr = this.advOrder['qty']
        const qty = glb_sv.filterNumber(qtyStr)
        const priceStr = this.advOrder['price']
        let price = glb_sv.filterNumber(priceStr)
        if (price === null) {
            price = 0
        }
        const sellbuy_tp = this.advOrder['sb_tp']

        const effect_dtOld = {
            year: this.advOrder['effect_dt'].getFullYear(),
            month: this.advOrder['effect_dt'].getMonth() + 1,
            day: this.advOrder['effect_dt'].getDate(),
        }
        let day = effect_dtOld['day'] + ''
        let month = effect_dtOld['month'] + ''
        let year = effect_dtOld['year']
        const pad = '00'
        day = pad.substring(0, pad.length - day.length) + day
        month = pad.substring(0, pad.length - month.length) + month
        const effect_dt = year + month + day
        // ---------------------------------
        const exp_dtOld = {
            year: this.advOrder['exp_dt'].getFullYear(),
            month: this.advOrder['exp_dt'].getMonth() + 1,
            day: this.advOrder['exp_dt'].getDate(),
        }
        day = exp_dtOld['day'] + ''
        month = exp_dtOld['month'] + ''
        year = exp_dtOld['year']
        day = pad.substring(0, pad.length - day.length) + day
        month = pad.substring(0, pad.length - month.length) + month
        const exp_dt = year + month + day
        // ---------------------------------

        const acntinfo = this.advOrder.acntNo
        const pieces = acntinfo.split('.')
        const acntNo = pieces[0]
        const subNo = pieces[1]

        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.placeAdvOrderFunctNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.placeAdvOrderResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()

        // const sanGd = stkCd.substr(0, 3);
        svInputPrm.WorkerName = 'ALTxOrder'
        svInputPrm.ServiceName = 'ALTxOrder_0509_1'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'I'
        // svInputPrm.InCrpt = [2];
        svInputPrm.InVal = [
            acntNo,
            subNo,
            '',
            stkCd.substr(4),
            sellbuy_tp,
            qty + '',
            price + '',
            '0000',
            effect_dt,
            exp_dt,
            orderTp,
            seasonTp,
        ];
        svInputPrm.TotInVal = svInputPrm.InVal.length;

        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm
        })
        this.placeAdvOrderFunct_ReqTimeOut = setTimeout(this.solvingadvOrder_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        this.req_component.set(request_seq_comp, reqInfo)

        glb_sv.lastAdvOrdInfo['acntNo'] = this.advOrder.acntNo
        glb_sv.lastAdvOrdInfo['sb_tp'] = this.advOrder['sb_tp']
        glb_sv.lastAdvOrdInfo['stkCode'] = this.advOrder['stkCode']
        glb_sv.lastAdvOrdInfo['orderTp'] = this.advOrder['orderTp']
        glb_sv.lastAdvOrdInfo['seasonTp'] = this.advOrder['seasonTp']
        glb_sv.lastAdvOrdInfo['price'] = this.advOrder['price']
        glb_sv.lastAdvOrdInfo['qty'] = this.advOrder['qty']
        glb_sv.lastAdvOrdInfo['startDt'] = this.advOrder.effect_dtCfm
        glb_sv.lastAdvOrdInfo['endDt'] = this.advOrder.exp_dtCfm
    }

    solvingadvOrder_TimeOut = cltSeq => {
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
        if (reqIfMap.reqFunct === this.getBuyAble_FunctNm) {
            this.getBuyAbleFlag = false
            this.setState({ refreshFlag: '' })
        } else if (reqIfMap.reqFunct === this.getSellAble_FunctNm) {
            this.getSellAbleFlag = false
        } else if (reqIfMap.reqFunct === this.placeAdvOrderFunctNm) {
            this.placeAdvOrderFlag = false
            glb_sv.lastAdvOrdInfo['acntNo'] = null
            this.setState({ placeAdvOrderFlag: false, cfmAdvOrd: false })
        } else if (reqIfMap.reqFunct === this.getBankAcntList_FunctNm) {
            this.getBankAcntListFlag = false
            return
        } else if (reqIfMap.reqFunct === this.getBankCashAmount_FunctNm) {
            this.getBankCashAmountFlag = false
            return
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', 'OK', 'warning', '')
    }
    confirmDoubleAdvOrder = cfm => {
        if (this.placeAdvOrderFlag) {
            return
        }
        if (cfm === 'Y') {
            this.sendAdvanceOrder()
        } else {
            this.setState({ check_double_cfmAdvOrd: false })
            return
        }
    }

    modalAfterOpened = () => {
        setTimeout(() => {
            if (this.state.cfmAdvOrd) {
                const elm = document.getElementById('buttonCfmadvOrderOrder')
                if (elm) elm.focus()
                const elms = document.getElementById('buttonCfmadvOrderOrders')
                if (elms) elms.focus()
            }
            if (this.state.check_double_cfmAdvOrd) {
                const elm = document.getElementById('buttonChkDbadvOrderOrders')
                if (elm) elm.focus()
            }
        }, 200)
    }

    changeColorPrice = () => {
        if (
            this.state.advOrder.t31 &&
            this.state.advOrder.t31 > 0 &&
            this.state.advOrder.t31 > this.state.advOrder.t333 &&
            this.state.advOrder.t31 < this.state.advOrder.t260
        ) {
            return 'price_basic_less'
        }
        if (
            this.state.advOrder.t31 &&
            this.state.advOrder.t31 > 0 &&
            this.state.advOrder.t31 < this.state.advOrder.t332 &&
            this.state.advOrder.t31 > this.state.advOrder.t260
        ) {
            return 'price_basic_over'
        }
        if (
            this.state.advOrder.t31 === null ||
            this.state.advOrder.t31 === undefined ||
            this.state.advOrder.t31 === 0 ||
            this.state.advOrder.t31 === 0.0 ||
            this.state.advOrder.t31 === this.state.advOrder.t260
        ) {
            return 'price_basic_color'
        }
        if (
            this.state.advOrder.t31 &&
            this.state.advOrder.t31 > 0 &&
            this.state.advOrder.t31 === this.state.advOrder.t332
        ) {
            return 'price_ceil_color'
        }
        if (
            this.state.advOrder.t31 &&
            this.state.advOrder.t31 > 0 &&
            this.state.advOrder.t31 === this.state.advOrder.t333
        ) {
            return 'price_floor_color'
        }
    }
    translateOrderTp = () => {
        if (this.state.advOrder.orderTp === '01') {
            return 'order_Limit'
        } else if (this.state.advOrder.orderTp === '02') {
            return 'order_Mp'
        } else if (this.state.advOrder.orderTp === '03') {
            return 'order_ATO'
        } else if (this.state.advOrder.orderTp === '04') {
            return 'order_ATC'
        } else if (this.state.advOrder.orderTp === '06') {
            return 'order_MOK'
        } else if (this.state.advOrder.orderTp === '07') {
            return 'order_MAK'
        } else if (this.state.advOrder.orderTp === '08') {
            return 'order_MTL'
        } else if (this.state.advOrder.orderTp === '15') {
            return 'order_PLO'
        }
    }

    translateOrderTpPrice = () => {
        if (this.state.advOrder.orderTp === '02') {
            return 'MP'
        } else if (this.state.advOrder.orderTp === '03') {
            return 'ATO'
        } else if (this.state.advOrder.orderTp === '04') {
            return 'ATC'
        } else if (this.state.advOrder.orderTp === '06') {
            return 'MOK'
        } else if (this.state.advOrder.orderTp === '07') {
            return 'MAK'
        } else if (this.state.advOrder.orderTp === '08') {
            return 'MTL'
        } else if (this.state.advOrder.orderTp === '15') {
            return 'PLO'
        }
    }

    translateSessionTp = () => {
        if (this.state.advOrder.seasonTp === '1') {
            return 'ATO_session'
        } else if (this.state.advOrder.seasonTp === '2') {
            return 'continuity_session_morning'
        } else if (this.state.advOrder.seasonTp === '3') {
            return 'continuity_session_afternoon'
        } else if (this.state.advOrder.seasonTp === '4') {
            return 'ATC_session'
        } else if (this.state.advOrder.seasonTp === '5') {
            return 'priceboard_Close'
        } else return this.state.advOrder.seasonTp
    }

    handleKeyPress = e => {
        const code = e.keyCode ? e.keyCode : e.which
        const name = e.target.name

        if ((name === 'advOrder_price' || name === 'advOrder_qty') && code === 13) {
            this.placeAdvOrder()
        }
    }

    transCol(length) {
        let _class = 'col-sm-7'
        if (length === 1) _class = 'col-sm-10'
        else if (length === 2) _class = 'col-sm-8'
        return _class
    }

    handleChangeAccount = ({ value, label }) => {
        this.activeAcnt = value;
        this.actn_curr = value.split('.')[0];
        this.sub_curr = value.split('.')[1];
        this.advOrder.acntNo = label;
        this.setState(prevState => ({
            advOrder: {
                ...prevState.advOrder,
                acntNo: label
            },
        }));
        this.onAcntNoChange(value);
        this.setState({ activeAcnt: this.activeAcnt })
    }

    render() {
        const { t } = this.props
        let color_last_price = this.changeColorPrice()
        let nameOrderTp = this.translateOrderTp()
        let nameSessionTp = this.translateSessionTp()
        return (<div className="advance-order">
            <div className="flexbox__row__wrap" style={{ paddingTop: 10 }}>
                <div className="card form-cash-transaction">
                    <div className="card-body widget-body">
                        <div className="page1 pageAdvOrd">
                            <div className="form-group marginBottom5 row no-margin-left no-margin-right">
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
                            <div className="form-group row">
                                <div className="col-sm-12">
                                    <table
                                        className="table-nopadding table"
                                        style={{ marginBottom: 0, fontSize: 14, userSelect: 'none' }}
                                    >
                                        <tbody>
                                            <tr>
                                                <td
                                                    onClick={() => this.handleChangeSellBuy('1')}
                                                    id="section-advord-buy"
                                                    className="text-center buy-attr active"
                                                    style={{ padding: 5 }}
                                                >
                                                    {t('priceboard_buy')}
                                                </td>
                                                <td className="text-center" style={{ width: 1, padding: 1 }}></td>
                                                <td
                                                    onClick={() => this.handleChangeSellBuy('2')}
                                                    id="section-advord-sell"
                                                    className="text-center sell-attr "
                                                    style={{ padding: 5 }}
                                                >
                                                    {t('priceboard_sell')}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="col-sm">
                                    {this.state.isChangeTheme && (
                                        <Select
                                            ref={el => (this.inputSelect = el)}
                                            value={this.state.selectedStkName}
                                            placeholder={'-- ' + t('choose_symbol_trading')}
                                            options={this.state.stkList}
                                            onChange={this.handleChangeStkName}
                                            styles={customStyles}
                                            filterOption={customFilter}
                                            components={{ MenuList }}
                                            theme={theme => ({
                                                ...theme,
                                                color: '',
                                                colors: {
                                                    ...theme.colors,
                                                    text: '',
                                                    primary25:
                                                        glb_sv.style[glb_sv.themePage].sideBar.background_hover_search,
                                                    neutral0: glb_sv.style[glb_sv.themePage].sideBar.background_search,
                                                },
                                            })}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="col-sm-12 minscroll-place-order" style={{ overflow: 'auto' }}>
                                    <table
                                        className="tableOrd table-sm table-nopadding table"
                                        style={{ marginBottom: 0, fontSize: 12 }}
                                    >
                                        <tbody>
                                            <tr style={{ height: 20 }}>
                                                <td>
                                                    <span>CE:&nbsp;</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        onClick={() => this.setnewPrice('CE')}
                                                        className="price_ceil_color text-right cursor_ponter"
                                                    >
                                                        {FormatNumber(this.state.advOrder['t332'], 0, 0)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span>FL:&nbsp;</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        onClick={() => this.setnewPrice('FL')}
                                                        className="price_floor_color text-right no-padding cursor_ponter"
                                                    >
                                                        {FormatNumber(this.state.advOrder['t333'], 0, 0)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span>RF:&nbsp;</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        onClick={() => this.setnewPrice('RF')}
                                                        className="price_basic_color text-right no-padding cursor_ponter"
                                                    >
                                                        {FormatNumber(this.state.advOrder['t260'], 0, 0)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span>CR:&nbsp;</span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span
                                                        onClick={() => this.setnewPrice('CR')}
                                                        className={
                                                            'text-right no-padding cursor_ponter ' + color_last_price
                                                        }
                                                    >
                                                        {FormatNumber(this.state.advOrder['t31'], 0, 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="form-group row">
                                <div className="col-sm-12">
                                    <select
                                        name="advOrder_seasonTp"
                                        id="advOrder_seasonTp"
                                        value={this.state.advOrder.seasonTp}
                                        onChange={this.handleChangeSessontp}
                                        className={'form-control form-control-sm no-padding'}
                                    >
                                        <option value="">-- {t('input_session_type')}</option>
                                        {this.state.seasonTps.map(item => (
                                            <option key={item.key} value={item.key}>
                                                {t(item.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group text-center" style={{ marginLeft: -2 }}>
                                <div
                                    className="btn-group"
                                    role="group"
                                    style={{ visibility: this.state.advOrder.seasonTp !== '' ? 'visible' : 'hidden' }}
                                >
                                    {this.state.orderTps.map((item, index) => (
                                        <button
                                            key={index + 'advord_tp'}
                                            type="button"
                                            className="btn btn-size btn-secondary advord_tp"
                                            name={item.key}
                                            id={'advord_tp_' + item.key}
                                            onClick={this.handleChangeOrdertp}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {this.state.advOrder.sb_tp === '1' && (
                                <div className="form-group row">
                                    <label
                                        className="col-sm-4 control-label text-left"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {t('buying_power')}
                                    </label>
                                    <div className="col-sm-8 input-group input-group-sm">
                                        <span className="form-control form-control-sm text-right disabled ">
                                            {FormatNumber(this.state.advOrder.buyPw, 0, 0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {this.state.advOrder.sb_tp === '2' && (
                                <div className="form-group row">
                                    <label
                                        className="col-sm-4 control-label text-left"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {t('sell_able_quantity')}
                                    </label>
                                    <div className="col-sm-8 input-group input-group-sm">
                                        <span className="form-control form-control-sm text-right disabled ">
                                            {FormatNumber(this.state.advOrder.sellPw, 0, 0)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group row" id="advord_price_formgrp">
                                <label
                                    className="col-sm-4 control-label no-padding-right text-left"
                                    htmlFor="advOrder_price"
                                >
                                    {t('price')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="input-group input-group-sm col-sm-8">
                                    <Input
                                        inputtype={'text'}
                                        name={'advOrder_price'}
                                        value={this.state.advOrder.price}
                                        onChange={this.handleChangePrice}
                                        onKeyDown={this.handleKeyPress}
                                        disabled={this.state.advOrder['orderTp'] !== '01'}
                                        classextend={'form-control-sm text-right'}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label className="col-sm-4 control-label text-left" htmlFor="advOrder_qty">
                                    {t('qty')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="input-group input-group-sm col-sm-8">
                                    <Input
                                        inputtype={'text'}
                                        name={'advOrder_qty'}
                                        value={this.state.advOrder.qty}
                                        onChange={this.handleChangeQty}
                                        onKeyDown={this.handleKeyPress}
                                        classextend={'form-control-sm text-right'}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label className="control-label text-left col-sm-4">
                                    {t('effective_date')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-8">
                                    <DatePicker
                                        id="advOrder_effect_dt"
                                        popperPlacement="top"
                                        scrollableYearDropdown
                                        selected={this.state.advOrder.effect_dt}
                                        dateFormat="dd/MM/yyyy"
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        className="form-control form-control-sm text-right"
                                        onChange={value => {
                                            this.advOrder.effect_dt = value
                                            this.setState(prevState => ({
                                                advOrder: {
                                                    ...prevState.advOrder,
                                                    effect_dt: value,
                                                },
                                            }))
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="control-label text-left col-sm-4">
                                    {t('expired_date')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-8">
                                    <DatePicker
                                        id="advOrder_exp_dt"
                                        popperPlacement="top"
                                        scrollableYearDropdown
                                        dropdownMode="scroll"
                                        selected={this.state.advOrder.exp_dt}
                                        dateFormat="dd/MM/yyyy"
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        className="form-control form-control-sm text-right"
                                        onChange={value => {
                                            this.advOrder.exp_dt = value
                                            this.setState(prevState => ({
                                                advOrder: {
                                                    ...prevState.advOrder,
                                                    exp_dt: value,
                                                },
                                            }))
                                            setTimeout(() => {
                                                glb_sv.focusELM('placeAdvOrder')
                                            }, 100)
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-group row" style={{ marginTop: 18 }}>
                                <div className="col-sm">
                                    <button
                                        type="submit"
                                        onClick={this.placeAdvOrder}
                                        id="placeAdvOrder"
                                        className={'btn btn-sm btn-block btn-' + this.state.colorPlace}
                                    >
                                        {this.state.advOrder.sb_tp === '2' && <span>{t('order_send_sell')}</span>}
                                        {this.state.advOrder.sb_tp === '1' && <span>{t('order_send_buy')}</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* modal xác thực lệnh */}
                <Modal
                    isOpen={this.state.cfmAdvOrd}
                    size={'md modal-notify'}
                    onClosed={this.otpModalClose}
                    onOpened={this.modalAfterOpened}
                >
                    <ModalHeader>
                        {this.state.advOrder.sb_tp === '1' && (
                            <div className="text-center font_header_md">
                                <span>{t('screen_confirm_advOrder_order_buy')}</span>
                            </div>
                        )}
                        {this.state.advOrder.sb_tp === '2' && (
                            <div className="text-center font_header_md">
                                <span>{t('screen_confirm_advOrder_order_sell')}</span>
                            </div>
                        )}
                    </ModalHeader>
                    <ModalBody>
                        <div role="form" className="form-horizontal">
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right text-left nowrap marginAuto"
                                >
                                    {t('acnt_no')}
                                </label>
                                <div className="col-sm-10">
                                    <span className="form-control form-control-sm text-left">
                                        {this.state.advOrder['acntNo']}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-2 control-label no-padding-right text-left nowrap marginAuto">
                                    {t('short_symbol')}
                                </label>
                                <div className="col-sm-10">
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        }}
                                        className="form-control form-control-sm"
                                    >
                                        {this.state.advOrder['stkName']}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right text-left nowrap marginAuto"
                                >
                                    {t('qty')}
                                </label>
                                <div className="col-sm-4">
                                    <span className="form-control form-control-sm text-right">
                                        {this.state.advOrder['qty']}
                                    </span>
                                </div>
                                <label
                                    style={{ textAlign: 'left', paddingLeft: 5 }}
                                    className="col-sm-2 control-label no-padding-right nowrap marginAuto"
                                >
                                    {t('price')}
                                </label>
                                <div className="col-sm-4">
                                    <div className="input-group input-group-sm">
                                        {this.state.advOrder.orderTp === '01' && (
                                            <span className="form-control form-control-sm text-right">
                                                {this.state.advOrder['price']}
                                            </span>
                                        )}
                                        {this.state.advOrder.orderTp !== '01' && (
                                            <span className="form-control form-control-sm text-right">
                                                {t(this.translateOrderTpPrice())}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right text-left nowrap marginAuto"
                                >
                                    {t('order_tp')}
                                </label>
                                <div className="col-sm-4">
                                    <span className="form-control form-control-sm">{t(nameOrderTp)}</span>
                                </div>
                                <label
                                    style={{ textAlign: 'left', paddingLeft: 5 }}
                                    className="col-sm-2 control-label no-padding-right text-left nowrap marginAuto"
                                >
                                    {t('session')}
                                </label>
                                <div className="col-sm-4">
                                    <span className="form-control form-control-sm">{t(nameSessionTp)}</span>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right nowrap marginAuto"
                                >
                                    {t('effective_date')}
                                </label>
                                <div className="col-sm-4">
                                    <span className="form-control form-control-sm">
                                        {this.state.advOrder['effect_dtCfm']}
                                    </span>
                                </div>
                                <label
                                    style={{ textAlign: 'left', paddingLeft: 5 }}
                                    className="col-sm-2 control-label no-padding-right nowrap marginAuto"
                                >
                                    {t('expired_date')}
                                </label>
                                <div className="col-sm-4">
                                    <span className="form-control form-control-sm">
                                        {this.state.advOrder['exp_dtCfm']}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    {this.state.advOrder.sb_tp === '1' && (
                                        <Button
                                            size="sm"
                                            block
                                            id="buttonCfmadvOrderOrder"
                                            autoFocus
                                            color="info"
                                            onClick={e => this.advOrder_confirmOrder(e, 'Y')}
                                        >
                                            {this.state.placeAdvOrderFlag ? (
                                                <span>
                                                    {t('common_processing')}
                                                    <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                                </span>
                                            ) : (
                                                    <span>{t('order_confirm_send')}</span>
                                                )}
                                        </Button>
                                    )}
                                    {this.state.advOrder.sb_tp === '2' && (
                                        <Button
                                            size="sm"
                                            block
                                            id="buttonCfmadvOrderOrders"
                                            autoFocus
                                            color="danger"
                                            onClick={e => this.advOrder_confirmOrder(e, 'Y')}
                                        >
                                            {this.state.placeAdvOrderFlag ? (
                                                <span>
                                                    {t('common_processing')}
                                                    <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                                </span>
                                            ) : (
                                                    <span>{t('order_confirm_send')}</span>
                                                )}
                                        </Button>
                                    )}
                                </div>
                                <div className="col">
                                    <Button
                                        size="sm"
                                        block
                                        color="cancel"
                                        onClick={e => this.advOrder_confirmOrder(e, 'N')}
                                    >
                                        <span>{t('order_confirm_cancel')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

                {/* modal xác thực khi lệnh có các thông tin trùng lặp */}
                <Modal
                    isOpen={this.state.check_double_cfmAdvOrd}
                    size={'sm modal-notify'}
                    // onClosed={}
                    onOpened={this.modalAfterOpened}
                >
                    <ModalHeader>{t('common_notify')}</ModalHeader>
                    <ModalBody>
                        <div role="form" className="form-horizontal">
                            <div className="form-group row">
                                <div className="col-sm-12">
                                    <span>{t('confirm_send_the_same_order')}</span>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button
                                        size="sm"
                                        block
                                        color="danger"
                                        id="buttonChkDbadvOrderOrders"
                                        onClick={e => this.confirmDoubleAdvOrder('Y')}
                                    >
                                        {this.state.placeAdvOrderFlag ? (
                                            <span>
                                                {t('common_processing')}
                                                <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                            </span>
                                        ) : (
                                                <span>{t('common_confirm')}</span>
                                            )}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button
                                        size="sm"
                                        block
                                        color="cancel"
                                        onClick={e => this.confirmDoubleAdvOrder('N')}
                                    >
                                        <span>{t('order_confirm_cancel')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

            </div>
            <AdvanceOrderList
                component={this.component}
                get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                get_rq_seq_comp={this.get_rq_seq_comp}
                req_component={this.req_component}
                style={this.state.style}
                themePage={this.state.themePage}
                language={this.state.language}
                activeAcnt={this.state.activeAcnt}
                active_components={this.props.active_components}
            />
        </div>)
    }
}

export default translate('translations')(AdvanceOrder)
