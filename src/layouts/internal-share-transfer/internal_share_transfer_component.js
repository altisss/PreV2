import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import socket_sv from '../../utils/globalSv/service/socket_service'
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import FormatNumber from '../../conponents/formatNumber/FormatNumber';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import SelectBasic from "../../conponents/basic/selectBasic/SelectBasic";
import { toast } from "react-toastify";
import SearchRightInfo from '../../conponents/search_right_info/search_right_info'
import functionList from '../../constants/functionList';
import commuChanel from '../../constants/commChanel';
import SearchAccount from '../../conponents/search_account/SearchAccount';
import InternalShareTransferHistoryComponent from './internal_share_transfer_history'
import { inform_broadcast } from '../../utils/broadcast_service';
import { reply_send_req } from '../../utils/send_req';
import { change_theme } from '../../utils/change_theme';
import { change_language } from '../../utils/change_language';
import { bf_popout } from '../../utils/bf_popout'

const remote = require('electron').remote;

class InternalShareTransferComponent extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            transstockObj: {
                acntNo: '',
                acntNoRcv: '',
                stkName: null,
                stkName_require: false,
                trans_amt: '',
                trans_amt_require: false,
                stockAvaiable: null,
            },
            selectedStk: [],
            transstockFlag: false,
            stkList: [],
            acntItems: [],
            acntItemsRcv: [],
            refreshFlag: '',
            isChangeTheme: true,
            name: this.props.name,
            language: this.props.language,
            themePage: this.props.themePage,
            style: this.props.style,
            activeAcnt: ''
        }
        if (this.props.node) {
            this.props.node.setEventListener("close", (p) => {
                window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
                window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.misTypeSuccsOtp}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.AFTER_OTP}_${this.component}`)
            })
        }
        this.request_seq_comp = 0
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        };
        this.popin_window = this.popin_window.bind(this)
        this.req_component = new Map();
    }

    // -- transfer function
    transstock_FunctNm = 'TRANSSTOCK_001';
    // -- get stock available list informations
    getstockAvaibleFlag = false;
    getstockAvaible_FunctNm = 'TRANSSTOCK_002';
    // -- get stock available list informations
    getstransAvaibleFlag = false;
    getstransAvaible_FunctNm = 'TRANSSTOCK_003';

    componentWillMount() {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            // update state after popout window
            this.setState(agrs.state)
            change_theme(agrs.state.themePage)
            change_language(agrs.state.language, this.props)
            this.delayLoadData();
        })

        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // update state after popin window
            this.setState(agrs.state)
        });

    }

    componentDidMount() {
        this.transstockObj = this.state.transstockObj;
        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, msg) => {
            if (this.state.cfm_trans_stock) this.setState({ cfm_trans_stock: false });
        });

        window.ipcRenderer.on(`${commuChanel.misTypeSuccsOtp}_${this.component}`, (event, msg) => {
            if (msg.data === 'confirmStockTransfer') this.setState({ cfm_trans_stock: true });
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs)
            this.setState({ themePage: agrs })
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
            change_language(agrs, this.props)
            this.setState({ language: agrs })
        })

        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            reply_send_req(agrs, this.req_component)
        });

        window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
            window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
        })

        window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
            bf_popout(this.component, this.props.node, this.state)
        })
        window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, agrs) => {
            glb_sv.objShareGlb = agrs.objShareGlb;
        })

        this.delayLoadData();
    }

    componentWillUnmount() {
        if (this.transstockFunct_ReqTimeOut) { clearTimeout(this.transstockFunct_ReqTimeOut); }
        if (this.getstockAvaibleFunct_ReqTimeOut) { clearTimeout(this.getstockAvaibleFunct_ReqTimeOut); }
        if (this.getstransAvaibleFunct_ReqTimeOut) { clearTimeout(this.getstransAvaibleFunct_ReqTimeOut); }
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
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
            this.activeAcnt = args.get('activeAcnt');
            glb_sv.objShareGlb = args.get('objShareGlb');

            this.acntItems = glb_sv.objShareGlb['acntNoList'];
            let acntStr = '';
            if (this.activeAcnt !== null && this.activeAcnt !== undefined && this.activeAcnt !== '' &&
                this.activeAcnt.substr(11) !== '%') {
                acntStr = this.activeAcnt;
            } else {
                acntStr = this.acntItems[0]['id'];
            }
            this.transstockObj['acntNo'] = acntStr;
            this.getRcvSubno(acntStr);
            this.transstockObj['bankAcnt_rcv'] = '';
            const pieacnt = acntStr.split('.');
            this.actn_curr = pieacnt[0];
            this.sub_curr = pieacnt[1].substr(0, 2);
            this.transstockObj['stockAvaiable'] = 0;
            this.transstockObj['stk_cd'] = null;
            this.transstockObj.stkName = null;
            this.getstockAvaiableListInfo();
            this.setState({ activeAcnt: this.activeAcnt })
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    acntNo: this.transstockObj.acntNo,
                    bankAcnt_rcv: this.transstockObj.bankAcnt_rcv,
                    stockAvaiable: this.transstockObj.stockAvaiable,
                    stk_cd: this.transstockObj.stk_cd,
                    stkName: null,
                    selectedStk: [],
                }
            }));
        });
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
            component: this.component,
            value: ['objShareGlb', 'activeAcnt'],
            sq
        });
    }

    popin_window() {
        const current_window = remote.getCurrentWindow();
        window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
        current_window.close();
    }

    getstockAvaible_ResultProc = (reqInfoMap, message, cltSeqResult) => {
        clearTimeout(this.getstockAvaibleFunct_ReqTimeOut);
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) { return; }
        this.getstockAvaibleFlag = false;
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code']); }
            return;
        } else {
            reqInfoMap.procStat = 1;
            let jsonSellAble;
            try {
                jsonSellAble = JSON.parse(message['Data']);
            } catch (err) {
                // glb_sv.logMessage(err);
                jsonSellAble = [];
            }
            if (jsonSellAble.length > 0) {
                for (let i = 0; i < jsonSellAble.length; i++) {
                    const sanGd = jsonSellAble[i]['c12'] === '05' ? 'UPC' : (jsonSellAble[i]['c12'] === '01' ? 'HOSE' : 'HNX');
                    const obj = { value: jsonSellAble[i]['c0'], label: jsonSellAble[i]['c0'] + ' - ' + sanGd + ' - ' + jsonSellAble[i]['c1'] }
                    this.stk_list_tmp.push(obj);
                }
            }
            this.stkListAvailable = jsonSellAble;
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2;
                this.getstockAvaibleFlag = false;
                this.stkList = this.stk_list_tmp;
                this.setState({ stkList: this.stkList });
            }
        }
    }

    getstransAvaible_ResultProc = (reqInfoMap, message, cltSeqResult) => {
        clearTimeout(this.getstransAvaibleFunct_ReqTimeOut);

        this.getstransAvaibleFlag = false;
        if (reqInfoMap.procStat !== 0) { return; }
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false, message['Code']); }
            return;
        } else {
            reqInfoMap.procStat = 2;
            let jsonsellAb;
            try {
                jsonsellAb = JSON.parse(message['Data']);
                this.transstockObj['stockAvaiable'] = jsonsellAb[0]['c6'];
                this.setState(prevState => ({
                    transstockObj: {
                        ...prevState.transstockObj,
                        stockAvaiable: this.transstockObj.stockAvaiable,
                    }
                }))
            } catch (err) {
                console.log("getstransAvaible_ResultProc -> err", err, message)
                this.setState(prevState => ({
                    transstockObj: {
                        ...prevState.transstockObj,
                        stockAvaiable: 0,
                    }
                }));
                this.transstockObj['stockAvaiable'] = 0;
                reqInfoMap.resSucc = false;
            }
        }
    }

    transstock_ResultProc = (reqInfoMap, message, cltSeqResult) => {
        clearTimeout(this.transstockFunct_ReqTimeOut);
        this.transstockFlag = false;
        this.setState({ transstockFlag: false });
        if (reqInfoMap.procStat !== 0) { return; }
        reqInfoMap.procStat = 2;
        // -- process after get result --
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false;
            if (message['Code'] !== '080128') {
                glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false);
                this.setState({ cfm_trans_stock: false });
            }
        } else {
            this.setState({ cfm_trans_stock: false });
            this.resetSelectStk();
            this.transstockObj['note'] = null;
            this.transstockObj['trans_amt'] = 0;
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    note: this.transstockObj.note,
                    trans_amt: this.transstockObj.trans_amt,
                }
            }))
            console.log('getstockAvaiableListInfo 302')
            this.getstockAvaiableListInfo();
            glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'success');

            const obj = {
                type: glb_sv.ACTION_SUCCUSS,
                data: 'history-list'
            }
            inform_broadcast(commuChanel.ACTION_SUCCUSS, obj);
        }
    }

    openConfirmSendTransstock = () => {
        if (this.state.transstockObj.stkName === null || this.state.transstockObj.stkName === '') {
            // if (this.selectContainer) this.selectContainer.focus();
            glb_sv.checkToast(toast, 'warn', this.props.t('symbol_code_require'), 'stkTrans_symbol');
            return;
        }
        if (this.state.transstockObj.trans_amt === null || this.state.transstockObj.trans_amt === '') {

            const elm = document.getElementById('transstockObj_trans_amt');
            if (elm) elm.focus();
            glb_sv.checkToast(toast, 'warn', this.props.t('transfer_amount_require'), 'stkTrans_amount');
            return;
        }


        const stkCd = this.transstockObj['stk_cd'];
        if (stkCd === null || stkCd === undefined || stkCd.trim().length === 0) {
            const ermsg = 'choose_symbol_trading';
            // if (this.selectContainer) this.selectContainer.focus();
            glb_sv.checkToast(toast, 'warn', this.props.t(ermsg), 'stkTrans_symbola');
            return;
        };

        const acntNoRcv = this.transstockObj['acntNoRcv'];
        if (acntNoRcv === null || acntNoRcv === undefined || acntNoRcv.length <= 10) {
            const ermsg = 'choose_receiv_subacnt';
            glb_sv.focusELM('transstockObj_acntNoRcv');
            glb_sv.checkToast(toast, 'warn', this.props.t(ermsg), 'stkTrans_rec_sub');
            return;
        }

        const trans_amtStr = this.transstockObj['trans_amt'];
        const stockAvaiable = this.transstockObj['stockAvaiable'];
        let trans_amt = glb_sv.filterNumber(trans_amtStr);
        if (trans_amt === null || trans_amt === undefined || isNaN(trans_amt)) { trans_amt = 0; }
        if (Number(trans_amt) <= 0) {
            const ermsg = 'transfer_quantity_must_over_zero';
            const elm = document.getElementById('transstockObj_trans_amt');
            if (elm) elm.focus();
            glb_sv.checkToast(toast, 'warn', this.props.t(ermsg), 'stkTrans_qty_not_zezo');
            return;
        };
        if (Number(stockAvaiable) < Number(trans_amt)) {
            const ermsg = 'transfer_quantity_over_available';
            const elm = document.getElementById('transstockObj_trans_amt');
            if (elm) elm.focus();
            glb_sv.checkToast(toast, 'warn', this.props.t(ermsg), 'stkTrans_qty_not_avail');
            return;
        };

        if (!glb_sv.checkOtp('confirmStockTransfer')) {
            if (window.location.pathname.includes('___')) {
                const ermsg = 'notify_user_enter_otp_in_main_screen';
                const goToMainScreen = () => window.ipcRenderer.send('open_main_window');
                glb_sv.openAlertModal('', 'common_InfoMessage', ermsg, '', 'warning', '', true, '', this.component, goToMainScreen);
            }
            return;
        };
        this.setState({ cfm_trans_stock: true });
    }

    // -- send request to withdraw
    sendTransferstockConfirm = (cfmTp) => {
        if (this.transstockFlag) { return; }
        if (cfmTp === 'N') {
            this.setState({ cfm_trans_stock: false });
            return;
        }
        const trans_amtStr = this.transstockObj['trans_amt'];
        const trans_amt = glb_sv.filterNumber(trans_amtStr);
        const noteInfo = this.transstockObj['note']
        const acntNoRcv = this.transstockObj['acntNoRcv'];
        const pieces_to = acntNoRcv.split('.');
        // const acntNo_to = pieces_to[0];
        const subNo_to = pieces_to[1];
        const stkCd = this.transstockObj['stk_cd'];
        this.transstockFlag = true;
        this.setState({ transstockFlag: true });
        // -- call service for place order
        // -- push request to request hashmap
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo();
        reqInfo.reqFunct = this.transstock_FunctNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.transstock_ResultProc
        // -- service info
        let svInputPrm = new serviceInputPrm();
        svInputPrm.WorkerName = 'ALTxStock';
        svInputPrm.ServiceName = 'ALTxStock_0302_6';
        svInputPrm.ClientSentTime = '0';
        svInputPrm.Operation = 'I';
        const workDate = glb_sv.objShareGlb['workDate'];

        svInputPrm.InVal = [this.actn_curr, this.sub_curr, stkCd, subNo_to, trans_amt + '', '0', '0', '0', workDate, noteInfo];
        svInputPrm.TotInVal = svInputPrm.InVal.length;

        this.transstockFunct_ReqTimeOut = setTimeout(this.solvingTransstock_TimeOut,
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

    solvingTransstock_TimeOut = (cltSeq) => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) { return; }
        const reqIfMap = this.req_component.get(cltSeq);
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) { return; }
        const timeResult = new Date();
        reqIfMap.resTime = timeResult;
        reqIfMap.procStat = 4;

        this.req_component.set(cltSeq, reqIfMap);

        this.setState({ refreshFlag: '' });
        if (reqIfMap.reqFunct === this.getstockAvaible_FunctNm) {
            this.getstockAvaibleFlag = false;
        } else if (reqIfMap.reqFunct === this.transstock_FunctNm) {
            this.setState({ transstockFlag: false });
            this.transstockFlag = false;
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    note: this.transstockObj.note,
                    trans_amt: this.transstockObj.trans_amt,
                }
            }))
        }
        glb_sv.openAlertModal('', 'common_InfoMessage', 'common_cant_connect_server', '', 'warning');
    }

    getRcvSubno = (acntinfo) => {
        const rcvAcntList = [];
        if (!acntinfo) return;
        if (!this.acntItems) return;
        for (let i = 0; i < this.acntItems.length; i++) {
            if (this.acntItems[i]['id'].substr(0, 10) === acntinfo.substr(0, 10) && this.acntItems[i]['id'] !== acntinfo) {
                rcvAcntList.push(this.acntItems[i]);
            }
        }
        this.acntItemsRcv = rcvAcntList;
        this.setState({ acntItemsRcv: rcvAcntList });
        if (this.acntItemsRcv.length > 0) {
            this.transstockObj['acntNoRcv'] = this.acntItemsRcv[0]['id'];
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    acntNoRcv: this.transstockObj.acntNoRcv,
                }
            }))
        } else {
            this.transstockObj['acntNoRcv'] = '';
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    acntNoRcv: this.transstockObj.acntNoRcv,
                }
            }))
        }
    }

    // -- get stock information
    getstockAvaiableListInfo = () => {
        if (this.getstockAvaibleFlag) { return; }
        if (!glb_sv.objShareGlb || !glb_sv.objShareGlb['workDate']) return;
        this.getstockAvaibleFlag = true;

        // -- call service for place order
        // -- push request to request hashmap
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo();
        reqInfo.reqFunct = this.getstockAvaible_FunctNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.getstockAvaible_ResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm();
        svInputPrm.WorkerName = 'ALTqStock';
        svInputPrm.ServiceName = 'ALTqStock_StockQuantity';
        svInputPrm.ClientSentTime = '0';
        svInputPrm.Operation = 'Q';
        svInputPrm.InVal = ['02', glb_sv.objShareGlb['workDate'], this.actn_curr, this.sub_curr, '%'];
        svInputPrm.TotInVal = svInputPrm.InVal.length;
        console.log("getstockAvaiableListInfo -> svInputPrm", svInputPrm)

        this.stk_list_tmp = [];
        this.stkList = [];

        this.getstockAvaibleFunct_ReqTimeOut = setTimeout(this.solvingTransstock_TimeOut,
            functionList.reqTimeout, request_seq_comp);
        reqInfo.inputParam = svInputPrm.InVal;
        this.cfmOrdListTemple = [];
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

    getTransAbleStock = (stkCd) => {
        if (this.getstransAvaibleFlag) { return; }
        if (stkCd !== null && stkCd !== undefined && stkCd !== '') {

            this.getstransAvaibleFlag = true;
            // -- push request to request hashmap
            const request_seq_comp = this.get_rq_seq_comp()
            const reqInfo = new requestInfo();
            reqInfo.reqFunct = this.getstransAvaible_FunctNm;
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.getstransAvaible_ResultProc;

            // -- service info
            let svInputPrm = new serviceInputPrm();
            svInputPrm.WorkerName = 'ALTqStock';
            svInputPrm.ServiceName = 'ALTqStock_0302_6';
            svInputPrm.ClientSentTime = '0';
            svInputPrm.Operation = 'Q';
            svInputPrm.InVal = ['1', this.actn_curr, this.sub_curr, stkCd];
            svInputPrm.TotInVal = svInputPrm.InVal.length;

            this.getstransAvaibleFunct_ReqTimeOut = setTimeout(this.solvingTransstock_TimeOut,
                functionList.reqTimeout, request_seq_comp);
            reqInfo.inputParam = svInputPrm.InVal;
            this.cfmOrdListTemple = [];
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
    }

    changAcntNo = (e, key) => {
        const acntNo = e.target.value;
        if (key === 1) {
            this.activeAcnt = acntNo;
            const pieces = acntNo.split('.');
            this.actn_curr = pieces[0];
            this.sub_curr = pieces[1].substr(0, 2);
            this.resetSelectStk();
            this.getRcvSubno(acntNo);
            console.log('getstockAvaiableListInfo 566')
            this.getstockAvaiableListInfo();
            this.transstockObj.acntNo = acntNo;
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    acntNo: this.transstockObj.acntNo,
                    cashAvaiable: this.transstockObj.cashAvaiable
                }
            }))
        } else {
            this.transstockObj.acntNoRcv = acntNo;
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    acntNoRcv: this.transstockObj.acntNoRcv,
                }
            }))
        }
    }

    resetSelectStk() {
        this.transstockObj['stockAvaiable'] = 0;
        this.transstockObj['stkName'] = null;
        this.transstockObj['stk_cd'] = null;
        this.setState(prevState => ({
            transstockObj: {
                ...prevState.transstockObj,
                stockAvaiable: 0,
                stkName: null,
                stk_cd: null
            }
        }))
        this.setState({ selectedStk: null })
    }

    handleChangeStkName = (selected) => {
        this.setState({ selectedStk: selected });
        const stks = selected.value;
        const isStk = glb_sv.recentStkList.findIndex(item => item === stks);
        if (isStk < 0) glb_sv.recentStkList.push(stks);
        if (glb_sv.recentStkList.length > 10) glb_sv.recentStkList.shift();
        localStorage.setItem('recentStkList', JSON.stringify(glb_sv.recentStkList));

        const value = selected.label;

        this.transstockObj['stkName'] = value;
        const pieces = value.split('-');
        const stk = pieces[0].trim();
        this.transstockObj['stk_cd'] = stk;
        this.getTransAbleStock(stk);
        // const stockAvaiable = this.stkListAvailable.find(e => e.c0 === stk).c3;
        // this.transstockObj['stockAvaiable'] = stockAvaiable;
        this.setState(prevState => ({
            transstockObj: {
                ...prevState.transstockObj,
                // stockAvaiable,
                stkName: this.transstockObj.stkName,
                stk_cd: stk
            }
        }))
        const elm = document.getElementById('transstockObj_trans_amt');
        if (elm) elm.focus();
    }

    validateInputStk = () => {
        setTimeout(() => {
            if (this.state.transstockObj.stkName == null) {
                this.setState(prevState => ({
                    transstockObj: {
                        ...prevState.transstockObj,
                        stkName_require: true
                    }
                })
                );
            } else {
                this.setState(prevState => ({
                    transstockObj: {
                        ...prevState.transstockObj,
                        stkName_require: false
                    }
                })
                );
            }
        }, 300);
    }

    handleChangetrans_amt = (e) => {
        // event.persist();
        const value = glb_sv.filterNumber(e.target.value);
        if (value > 999) { this.transstockObj.trans_amt = FormatNumber(value); }
        else this.transstockObj.trans_amt = value;
        this.setState(prevState => ({
            transstockObj: {
                ...prevState.transstockObj,
                trans_amt: this.transstockObj.trans_amt
            }
        }))
    }

    validateInput = (e) => {
        if (this.state.transstockObj.trans_amt == null || this.state.transstockObj.trans_amt === "") {
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    trans_amt_require: true
                }
            })
            );
        } else {
            this.setState(prevState => ({
                transstockObj: {
                    ...prevState.transstockObj,
                    trans_amt_require: false
                }
            })
            );
        }
    }

    modalAfterOpened = () => {
        const elm = document.getElementById('bt_sendTransstockOk');
        if (elm) elm.focus();
    }
    handleKeyPress = (e) => {
        const code = (e.keyCode ? e.keyCode : e.which);
        const name = e.target.name;

        if (name === 'transstockObj_trans_amt' && code === 13) {
            this.openConfirmSendTransstock();
        }

    }

    handleChangeAccount = ({ value, label }) => {
        this.activeAcnt = value;
        const pieces = value.split('.');
        this.actn_curr = pieces[0];
        this.sub_curr = pieces[1].substr(0, 2);
        this.resetSelectStk();
        this.getRcvSubno(value);
        this.getstockAvaiableListInfo();
        this.transstockObj.value = value;
        this.setState({ activeAcnt: this.activeAcnt })
        this.setState(prevState => ({
            transstockObj: {
                ...prevState.transstockObj,
                value: this.transstockObj.value,
                cashAvaiable: this.transstockObj.cashAvaiable
            }
        }))
    }

    render() {
        const { t } = this.props
        return (
            <div className='stock-transfer'>
                <div className="card form-cash-transaction" style={{ marginTop: 10 }}>
                    <div className="card-body widget-body">
                        <div className="form-group row ">
                            <label className="col-sm-5 control-label no-padding-right text-left">{t('trans_sub_account')}</label>
                            <div className='col-sm-7'>
                                <SearchAccount
                                    handleChangeAccount={this.handleChangeAccount}
                                    component={this.component}
                                    req_component={this.req_component}
                                    get_rq_seq_comp={this.get_rq_seq_comp}
                                    get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                    language={this.props.language}
                                    themePage={this.props.themePage}
                                    style={this.props.style}
                                    isShowDetail={true}
                                />
                            </div>
                        </div>

                        <div className="form-group row ">
                            <label className="col-sm-5 control-label no-padding-right text-left">{t('receive_sub_account')}</label>
                            <div className='col-sm-7'>
                                <SelectBasic
                                    inputtype={"text"}
                                    name={"transstockObj_acntNoRcv"}
                                    value={this.state.transstockObj.acntNoRcv}
                                    options={this.state.acntItemsRcv}
                                    onChange={(e) => this.changAcntNo(e, 2)}
                                    classextend={'form-control-sm'}
                                />
                            </div>
                        </div>
                        <div className="form-group row ">
                            <label className="col-sm-5 control-label no-padding-right text-left">{t('symbol')}<span className="mustInput">*</span></label>
                            <div className='col-sm-7'>
                                <div className="search-box" id="selectStk">
                                    <SearchRightInfo
                                        selectedStkName={this.state.selectedStk}
                                        stkList={this.state.stkList}
                                        selectedStk={this.handleChangeStkName}
                                        themePage={this.state.themePage}
                                        node={this.props.node ? this.props.node : null}
                                        component={this.component}
                                        req_component={this.req_component}
                                        get_rq_seq_comp={this.get_rq_seq_comp}
                                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                                        isSynce={false}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group row ">
                            <label className="col-sm-5 col-sm control-label no-padding-right text-left">{t('stock_available')}
                            </label>
                            <div className="col-sm-7 input-group input-group-sm">
                                <span className="form-control form-control-sm text-right">
                                    {FormatNumber(this.state.transstockObj['stockAvaiable'], 0, 0)}
                                </span>
                            </div>
                        </div>

                        <div className="form-group row ">
                            <label className="col-sm-5 control-label no-padding-right text-left">{t('transfer_quantity')}<span className="mustInput">*</span></label>
                            <div className="col-sm-7 input-group input-group-sm">
                                <Input
                                    inputtype={"text"}
                                    name={"transstockObj_trans_amt"}
                                    value={this.state.transstockObj.trans_amt}
                                    onChange={this.handleChangetrans_amt}
                                    onKeyDown={this.handleKeyPress}
                                    classextend={'form-control-sm text-right'}
                                />
                            </div>

                        </div>
                        <div className="form-group row" style={{ marginTop: 25 }}>
                            <div className='col-sm fullWidthButton'>
                                <button className="btn btn-pill btn-sm btn-block pull-right btn-wizard" onClick={this.openConfirmSendTransstock}>
                                    {t('common_button_sumbit')} &nbsp;
                        <i className="fa fa-check" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id="divBottom"
                    className="panel-body"
                >
                    <InternalShareTransferHistoryComponent
                        isRefresh={this.state.isHistoryRefresh}
                        t={t}
                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                        component={this.component}
                        req_component={this.req_component}
                        get_rq_seq_comp={this.get_rq_seq_comp}
                        style={this.state.style}
                        themePage={this.state.themePage}
                        language={this.state.language}
                        activeAcnt={this.state.activeAcnt}
                        active_components={this.props.active_components}
                    />
                </div>


                {/* modal Xác thực gửi yêu cầu */}
                <Modal
                    isOpen={this.state.cfm_trans_stock}
                    size={"sm modal-notify"}
                    onClosed={this.modalModalClose}
                    onOpened={this.modalAfterOpened}>
                    <ModalHeader>
                        {t('confirm_transfer_stock_message')}
                    </ModalHeader>
                    <ModalBody>
                        {t('from_sub_account')}: {this.state.transstockObj['acntNo']} {t('to_sub_account')}: {this.state.transstockObj['acntNoRcv']}
                        <br />{t('transfer_quantity')}: {this.state.transstockObj['trans_amt']} CP?
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button size="sm" block
                                        id="bt_sendTransstockOk"
                                        autoFocus
                                        color="wizard"
                                        onClick={(e) => this.sendTransferstockConfirm('Y')}>
                                        {this.state.transstockFlag ? <span>{t('common_processing')}<i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i></span> : <span>{t('common_Ok')}</span>}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button size="sm" block
                                        color="cancel"
                                        onClick={(e) => this.sendTransferstockConfirm('N')}>
                                        <span>{t('common_No')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>
            </div >
        )
    }
}

export default translate('translations')(InternalShareTransferComponent);