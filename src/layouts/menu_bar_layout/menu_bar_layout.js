import React from 'react'
import components from '../../constants/components'
import { translate } from 'react-i18next'
import MenubarChildUp from './menu_bar_child_up/menu_bar_child_up'
import IndexInfo from '../over_view_market_layout/chart_overview_market_layout/index_info'
import { load_tradview_stk_list } from '../../utils/load_stk_list'
import glb_sv from '../../utils/globalSv/service/global_service'
import commChanel from '../../constants/commChanel'
import { load_stk_list } from '../../utils/load_stk_list'
import { change_theme } from '../../utils/change_theme'
import { inform_broadcast } from '../../utils/broadcast_service'
import Image from '../../conponents/basic/image/image'
import AHrefBlank from '../../conponents/basic/a_href_blank/a_href_blank'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap';
import Input from "../../conponents/basic/input/Input";
import commuChanel from '../../constants/commChanel'
import socket_sv from "../../utils/globalSv/service/socket_service";
import functionList from '../../constants/functionList';
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import { reply_send_req } from '../../utils/send_req'

class MenuBarLayout extends React.PureComponent {
    constructor(props) {
        super(props);
        this.component = components.MenuBarLayout
        this.req_component = new Map();

        this.request_seq_comp = 0;
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        };


        // this.props.i18n.changeLanguage(language.toLowerCase());
        this.state = {
            indexs: [],
            show: true,
            stkList: [],
            themePage: glb_sv.themePage,

            tooltipOpen: false,
            otpModalShow: false,
            sendingOtpNum: false,
            gettingOtp: false,
            otpModal: {
                otpNum: "",
                // otpNum_requite: false,
                expTime: 0,
                otpLabel: "OTP"
            },
            otpModalShow_OTP3: false,
        };
        // -- update notify
    }
    gettingOtp_FunctNm = 'GET_OTPFUNCT'

    componentWillMount() {
        this.props.active_components.push(components.MenubarChildUp,
            components.MenubarChildDown,
            components.LoginModal,
            components.MenuBarLayout,
            components.RegisterModal,
            components.change_order,
            components.change_login,
        )
    }

    loadStkList() {
        setTimeout(() => {
            const sq = this.props.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq })
            window.ipcRenderer.once(`${commChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
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

    componentDidMount() {

        window.ipcRenderer.on(`${commChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs)
            // glb_sv.themePage = agrs
            this.setState({ themePage: agrs })
        })

        const interValShow = setInterval(() => {
            if (glb_sv.configInfo.menuConfig) {
                // const index_all = []
                var index_all = glb_sv.arrHSX.concat(glb_sv.arrHNX)
                load_tradview_stk_list(this.req_component, this.get_rq_seq_comp, this.component, this.props.get_value_from_glb_sv_seq, index_all)
                // this.setState({show: false}, () => 
                // {
                //   console.log(glb_sv.arrHSX)
                //   this.setState({indexs: glb_sv.arrHSX, show: true})
                // })
                const sq2 = this.props.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commChanel.get_value_from_glb_sv, { component: this.component, value: 'mrk_StkList', sq: sq2 })
                window.ipcRenderer.once(`${commChanel.reply_get_value_from_glb_sv}_${this.component}_${sq2}`, (event, agrs) => {
                    if (!agrs.length) {
                        load_stk_list(this.req_component, this.get_rq_seq_comp(), this.component)
                    }
                })
                clearInterval(interValShow)
            }

        }, 500)

        window.ipcRenderer.on(`${commChanel.UPDATE_GRP_FVL}_${this.component}`, (event, msg) => {
            this.getFlvFormatInfo()
        })
        this.loadStkList()

        window.ipcRenderer.on(`${commChanel.misTypeGetOtp}_${this.component}`, (event, msg) => {

            this.callbackFunct = msg['data']
            this.component_send_otp = msg['component']

            if (
                glb_sv.objShareGlb['userInfo']['c34'] === undefined ||
                Number(glb_sv.objShareGlb['userInfo']['c34']) !== 3
            ) {
                this.getOtpNumber3()
            } else {
                inform_broadcast('gottenOtp', { component: this.component_send_otp })
                this.openOtpNumberManual()
                setTimeout(() => { }, 300)
            }
        })

        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            reply_send_req(agrs, this.req_component)
        })

        window.ipcRenderer.on(`${commuChanel.OPEN_OTP}_${this.component}`, (event, msg) => {
            console.log("OPEN_OTP", commuChanel.OPEN_OTP)
            this.openModalOTP();
        });

        window.ipcRenderer.on(`${commuChanel.CLOSE_MODAL_OTP}_${this.component}`, (event, message) => {
            inform_broadcast(commuChanel.AFTER_OTP, {
              type: commuChanel.AFTER_OTP,
              objShareGlb: glb_sv.objShareGlb
            })
            this.setState({ otpModalShow: false, otpModalShow_OTP3: false });
        });

        this.commonEvent = glb_sv.commonEvent.subscribe(msg => {
            if (msg.type === commuChanel.CLOSE_MODAL_OTP) {
                this.setState({ otpModalShow_OTP3: false, otpModalShow: false })
            }
        })
    }

    componentWillUnmount() {
        if (this.commonEvent) this.commonEvent.unsubscribe();
        window.ipcRenderer.removeAllListeners(`${commChanel.UPDATE_GRP_FVL}_${this.component}`)
        window.ipcRenderer.removeAllListeners(`${commChanel.CHANGE_THEME}_${this.component}`)
    }

    openOtpNumberManual = () => {
        this.setState({ otpModalShow_OTP3: true }, () => {
            setTimeout(() => {
                const elm = document.getElementById('button3getOtpNumber')
                if (elm) elm.focus()
            }, 100)
        })
        this.setState(prevState => ({
            otpModal: {
                ...prevState.otpModal,
                otpNum: '',
                expTime: 0,
                otpLabel: 'OTP',
            },
        }))
    }

    getFlvFormatInfo = () => {
        const sq = this.props.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commChanel.get_value_from_glb_sv, { component: this.component, value: ['FVL_STK_LIST', 'flv_keyvalue'], sq: sq })
        window.ipcRenderer.once(`${commChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            let FVL_STK_LIST = agrs.get('FVL_STK_LIST')
            let flv_keyvalue = agrs.get('flv_keyvalue')

            let i = 0
            flv_keyvalue = []

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

            if (!this.firstload) return
            this.firstload = false
            if (flv_keyvalue.length > 0) {
                update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: 'FVL' })
            } else if (this.state.dataWatchList.length > 0) {
                update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: 'WL' })
            } else {
                update_value_for_glb_sv({ component: this.component, key: 'indexFocus', value: 'IND' })
            }

            update_value_for_glb_sv({ component: this.component, key: 'flv_keyvalue', value: flv_keyvalue })

        })
    }

    handleChangeStkName = selected => {
        const sq = this.props.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commChanel.get_value_from_glb_sv, { component: this.component, value: 'recentStkList', sq: sq })
        window.ipcRenderer.once(`${commChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const stk = selected.value

            const isStk = agrs.findIndex(item => item === stk)
            if (isStk < 0) agrs.push(stk)
            if (agrs.length > 10) agrs.shift()
            localStorage.setItem('recentStkList', JSON.stringify(agrs))
            const msg = { type: commChanel.STK_FROM_MENU, data: stk, component: this.component }
            // glb_sv.commonEvent.next(msg)
            inform_broadcast(commChanel.STK_FROM_MENU, msg)
        })


    }


    open_OVERVIEW_MARKET_TAB_layout = () => {
        window.ipcRenderer.send('xem list_indexs_chart')
        window.ipcRenderer.send(commChanel.open_OVERVIEW_MARKET_TAB_layout, { routerLink: components.OVERVIEW_MARKET_TAB })
    }

    on_mouse_over = () => {
        document.getElementById('header__marquee').stop();
    }

    on_mouse_out = () => {
        document.getElementById('header__marquee').start();
    }

    // Lấy mã OTP mới khi hết thời gian
    getOtpNumber3 = () => {
        if (this.state.gettingOtp) {
            return
        }
        this.setState({ gettingOtp: true })
        // -- push request to request hashmap gettingOtpResultProc
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.gettingOtp_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.gettingOtp3_ResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_OTP_General'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'I'
        svInputPrm.InVal = [glb_sv.objShareGlb['sessionInfo']['userID'].toLowerCase().trim()]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        svInputPrm.AppLoginID = glb_sv.objShareGlb['sessionInfo']['userID'].toLowerCase().trim()
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        reqInfo.inputParam = svInputPrm.InVal
        this.gettingOtpFunct_ReqTimeOut = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
        this.setState({ firstShow: true })
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

    gettingOtp3_ResultProc = (reqInfoMap, message) => {
        this.setState({ gettingOtp: false })
        console.log(message)
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            const errmsg = message['Message']
            glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', '', false, '', this.component)

            inform_broadcast('gottenOtp', { message: errmsg, component: this.component_send_otp })
            return
        } else {
            let dataInfo
            inform_broadcast('gottenOtp', { message, component: this.component_send_otp })
            try {
                let expTimeOtp, reqOtpMessage
                this.setState({ otpModalShow_OTP3: true })
                dataInfo = JSON.parse(message['Data'])
                reqOtpMessage = 'OTP'
                expTimeOtp = Number(dataInfo[0]['c0']) || 60
                if (Number(glb_sv.objShareGlb['userInfo']['c34']) === 2) {
                    if (glb_sv.activeCode === '102') {
                        reqOtpMessage = 'OTP ' + dataInfo[0]['c2']
                    } else {
                        reqOtpMessage = 'OTP ' + dataInfo[0]['c3'] + dataInfo[0]['c2']
                    }
                }
                this.setState({ getOtpMessage: message['Message'] })
                this.setState(prevState => ({
                    otpModal: {
                        ...prevState.otpModal,
                        otpNum: '',
                        expTime: expTimeOtp,
                        otpLabel: reqOtpMessage,
                    },
                }))
                if (this.otp_interValExpide) {
                    clearInterval(this.otp_interValExpide)
                }
                this.otp_interValExpideFunct()
                setTimeout(() => {
                    const elm = document.getElementById('otpNum3')
                    if (elm) elm.focus()
                }, 300)
            } catch (err) {
                // // console.log('Lỗi parse json: ' + err)
            }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
        }
    }

    otp_interValExpideFunct = () => {
        this.otp_interValExpide = setInterval(() => {
            if (this.state.otpModal.expTime > 0) {
                this.setState(prevState => ({
                    otpModal: {
                        ...prevState.otpModal,
                        expTime: --prevState.otpModal.expTime,
                    },
                }))
            } else {
                clearInterval(this.otp_interValExpide)
            }
        }, 1000)
    }

    otpModalClose = () => {
        // console.log('vao otpModalClose');
    }

    otpModalOpen = (expTime, msgLabel) => {
        this.setState(prevState => ({
            otpModal: {
                ...prevState.otpModal,
                otpNum: '',
                expTime: expTime,
                otpLabel: msgLabel,
            },
            otpModalShow: true,
        }))
    }

    otpAfterOpened = () => {
        this.setState(prevState => ({
            otpModal: {
                ...prevState.otpModal,
                otpNum_requite: false,
            },
        }))
        if (this.state.otpModalShow) {
            const elm = document.getElementById('otpNumOrder')
            if (elm) elm.focus()
        }
        if (this.state.otpModalShow_OTP3) {
            const elm = document.getElementById('otpNum3')
            if (elm) elm.focus()
        }
    }

    /* ----------------- otp form --------------- */
    handleOtpInput = e => {
        let value = e.target.value
        this.setState(prevState => ({
            otpModal: {
                ...prevState.otpModal,
                otpNum: value,
            },
        }))

        if (value && value.length === 6) {
            this.otpNum = value
            this.sendOtpFunct()
        }
    }

    // otp verify account loggin 
    sendOtpFunct = () => {
        if (this.otp_SendReqFlag) return
        if (this.otpNum == null || this.otpNum.trim() === '') {
            const elm = document.getElementById('otpNum')
            if (elm) elm.focus()
            return
        }
        // -- push request to request hashmap otpProcResult
        this.otp_SendReqFlag = true
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.otp_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.otpProcResult
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_OTP_verify'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'U'
        svInputPrm.InCrpt = [0]
        svInputPrm.InVal = [this.otpNum + '']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        reqInfo.inputParam = svInputPrm.InVal
        this.otp_Timeout = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
        this.setState({ sendingOtpNum: true })
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


    Autologin = () => {
        if (this.login_SendReqFlag) {
            return
        }
        this.login_SendReqFlag = true;
        // -- push request to request hashmap
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.login_FcntNm;
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.login_FcntNm_result;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        if (svInputPrm['Otp'] === '') {
            svInputPrm['Otp'] = 'NONE'
        }
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_Login'

        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InCrpt = [1]
        svInputPrm.InVal = [glb_sv.mrkInfo1, glb_sv.mrkInfo2, '', window.navigator.userAgent]
        svInputPrm.TotInVal = 4;

        this.login_ReqTimeout = setTimeout(this.solvingTimeout,
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

    login_FcntNm_result = (reqInfoMap, message) => {
        clearTimeout(this.login_ReqTimeout)
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        this.login_SendReqFlag = false
        reqInfoMap.resTime = new Date()
        reqInfoMap.procStat = 2
        this.setState({ cfm_try_connect_to_server: false })
        if (Number(message['Result']) === 0) {
            glb_sv.authFlag = false
            const ls_msg = 'Your_network_not_good_now_For_safly_reason_Please_try_to_login_again'
            glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', '', '', message['Code'])
            return
        } else {
            let strdata = message['Data']
            strdata = glb_sv.filterStrBfParse(strdata)
            const dataArr = JSON.parse(strdata)
            const userInfo = dataArr[0]
            glb_sv.disconTime = null
            if (glb_sv.objShareGlb.workDate !== userInfo['c29']) {
                glb_sv.authFlag = false
                const ls_msg = 'Your_network_not_good_now_For_safly_reason_Please_try_to_login_again'
                glb_sv.openAlertModal('', 'common_InfoMessage', ls_msg, '', '', '', '', message['Code'])
                return
            }
            const messageEnt = {}
            messageEnt['type'] = glb_sv.misTypeReconect
            messageEnt['data'] = null;
            inform_broadcast(commuChanel.misTypeReconect, messageEnt);
        }
        return
    }

    handleModalClose = () => {
        this.setState({ modalShow: false })
        // if (!glb_sv.authFlag) window.location.reload(true);
        if (this.code) this.closedModalMsgSys(this.code)
    }
    afterModalOpen = () => {
        setTimeout(() => {
            glb_sv.focusELM('alertBtnId');
        }, 100);
    }

    afterModalClose = () => {
        if (this.state.modalAftClsFocus) {
            const elme = document.getElementById(this.state.modalAftClsFocus)
            if (elme) {
                setTimeout(() => {
                    elme.focus()
                })
            }
        }
        if (this.code) this.closedModalMsgSys(this.code)
        this.setState({ login: false })
    }

    closedModalMsgSys(code) {
        if (
            code === 'EXPIRE' ||
            code === 'XXXXXX' ||
            code === 'XXXXX2' ||
            code === 'XXXXX5' ||
            code === 'XXXXX6' ||
            code === 'XXXXX7' ||
            code === 'XXXX10' ||
            code === 'XXXXX0' ||
            code === 'XXXX12' ||
            code === '080066' ||
            code === '080063'
        ) {
            if (window.location.href.includes('___')) window.close();
            else {
                localStorage.removeItem('lngUser');
                window.location.reload(true);
            }
        }

    }

    openModalOTP = () => {
        // -- open OTP form
        this.otpNumber = null
        this.otp_Type = glb_sv.objShareGlb['userInfo']['c34']
        let reqOtpMessage = '',
            expTimeOtp
        if (this.otp_Type && Number(this.otp_Type) === 3) {
            reqOtpMessage = 'OTP'
            expTimeOtp = 0
            this.setState({ otpModalShow_OTP3: true })
        } else {
            if (this.otp_Type === undefined || Number(this.otp_Type) === 1) {
                reqOtpMessage = 'OTP'
            } else if (Number(this.otp_Type) === 2) {
                reqOtpMessage =
                    'OTP ' + glb_sv.objShareGlb['userInfo']['c36'] + glb_sv.objShareGlb['userInfo']['c35']
            }

            this.setState({ otpModalShow: true })
            expTimeOtp = Number(glb_sv.objShareGlb['userInfo']['c32']) || 60
        }

        this.otpModalOpen(expTimeOtp, reqOtpMessage)
        if (this.otp_interValExpide) {
            clearInterval(this.otp_interValExpide)
        }
        this.otp_interValExpideFunct()
    }

    otpModalOpen = (expTime, msgLabel) => {
        this.setState(prevState => ({
            otpModal: {
                ...prevState.otpModal,
                otpNum: '',
                expTime: expTime,
                otpLabel: msgLabel,
            },
        }))
    }

    otp_interValExpideFunct = () => {
        this.otp_interValExpide = setInterval(() => {
            if (this.state.otpModal.expTime > 0) {
                this.setState(prevState => ({
                    otpModal: {
                        ...prevState.otpModal,
                        expTime: --prevState.otpModal.expTime,
                    },
                }))
            } else {
                this.setState({ gettingOtp: false })
                clearInterval(this.otp_interValExpide)
            }
        }, 1000)
    }

    otpModalClick = (msgTp) => {
        if (this.otp_SendReqFlag) return;
        if (msgTp === 'N') {
            inform_broadcast(commuChanel.AFTER_OTP, {
                type: commuChanel.AFTER_OTP,
                objShareGlb: glb_sv.objShareGlb
            })
            this.setState({ otpModalShow: false, otpModalShow_OTP3: false })
        } else if (msgTp === 'Y') {
            this.sendOtpFunct()
        }
    }

    sendOtpFunct = () => {
        if (this.otp_SendReqFlag) return
        if (this.otpNum == null || this.otpNum.trim() === '') {
            const elm = document.getElementById('otpNum')
            if (elm) elm.focus()
            return
        }
        // -- push request to request hashmap
        this.otp_SendReqFlag = true;
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.otp_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.otpProcResult;
        // -- service info
        let svInputPrm = new serviceInputPrm();
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_OTP_verify'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'U'
        svInputPrm.InCrpt = [0]
        svInputPrm.InVal = [this.otpNum + ''];
        svInputPrm.TotInVal = svInputPrm.InVal.length
        svInputPrm.AppLoginID = glb_sv.objShareGlb['sessionInfo']['userID'].toLowerCase().trim()

        this.otp_Timeout = setTimeout(this.solvingTimeout,
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


        this.setState({ sendingOtpNum: true })
    }

    otpProcResult = (reqInfoMap, message) => {
        clearTimeout(this.otp_Timeout)
        this.setState({ sendingOtpNum: false })
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        this.otp_SendReqFlag = false
        this.setState({ sendingOtpNum: false })
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            this.otpNumber = null
            const errmsg = message['Message']
            if (message['Code'] === '080009' || message['Code'] === '080005') {
                this.setState(prevState => ({
                    otpModalShow: false,
                    otpModal: {
                        otpNum: '',
                        // otpNum_requite: false,
                        expTime: 0,
                        otpLabel: 'OTP',
                    },
                }))
                glb_sv.authFlag = false
            }
            reqInfoMap.resSucc = false
            glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'danger', 'otpNum',false)
        } else {
            this.setState({ otpModalShow: false, otpModalShow_OTP3: false });
            glb_sv.objShareGlb['sessionInfo']['Otp'] = reqInfoMap.inputParam[0];
            inform_broadcast(commuChanel.AFTER_OTP, {
                type: commuChanel.AFTER_OTP,
                objShareGlb: glb_sv.objShareGlb
            });

            const msg = { type: commuChanel.misTypeSuccsOtp, data: this.callbackFunct, component: this.component, component_send_otp: this.component_send_otp }
            inform_broadcast(commuChanel.misTypeSuccsOtp, msg)
        }
    }

    solvingTimeout = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return
        if (reqIfMap.reqFunct === this.otp_FcntNm) {
            this.otp_SendReqFlag = false
            this.setState({ sendingOtpNum: false })
        } else if (reqIfMap.reqFunct === this.gettingOtp_FunctNm) {
            this.setState({ gettingOtp: false })
        } else if (reqIfMap.reqFunct === this.login_FcntNm) {
            this.login_SendReqFlag = false
            this.Autologin()
            return
        }
        const errmsg = 'common_cant_connect_server'
        glb_sv.openAlertModal('sm', 'common_notify', errmsg, 'OK', 'warning', '', true)
    }

    handleOtpInput = e => {
        const value = e.target.value
        this.setState(prevState => ({
            otpModal: {
                ...prevState.otpModal,
                otpNum: value,
            },
        }))
        this.otpNum = value
        if (value && value.length === 6) {
            this.sendOtpFunct()
        }
    }

    otpAfterOpened = () => {
        const elm = document.getElementById('otpNum')
        if (elm) elm.focus()
        const elmm = document.getElementById('buttongetOtpNumber')
        if (elmm) elmm.focus()
    }

    handleKeyPress = e => {
        const code = e.keyCode ? e.keyCode : e.which
        const name = e.target.name
        console.log("handleKeyPress", name,code)
        if (name === 'otpNum' || name === 'otpNum3') {
            if (code === 13 && this.otpNum && this.otpNum.length > 3) {
                if (this.otp_SendReqFlag) return
                this.sendOtpFunct()
            }
            if (code === 27) {
                if (this.otp_SendReqFlag) return
                this.otpModalClick('N')
            }
        }
        if (name === 'buttongetOtpNumber') this.otpModalClick(null, 'N')
        return
    }

    // Lấy mã OTP mới khi hết thời gian
    getOtpNumber = () => {
        console.log("getOtpNumber -> getOtpNumber")
        if (this.state.gettingOtp) {
            return
        }
        this.setState({ gettingOtp: true })
        // -- push request to request hashmap
        const request_seq_comp = this.get_rq_seq_comp()
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.gettingOtp_FunctNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.gettingOtpResultProc;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTxCommon'
        svInputPrm.ServiceName = 'ALTxCommon_OTP_General'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'I'
        svInputPrm.InVal = [glb_sv.objShareGlb['sessionInfo']['userID'].toLowerCase().trim()]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        svInputPrm.AppLoginID = glb_sv.objShareGlb['sessionInfo']['userID'].toLowerCase().trim()

        this.gettingOtpFunct_ReqTimeOut = setTimeout(this.solvingTimeout,
            functionList.reqTimeout, request_seq_comp);
        reqInfo.inputParam = svInputPrm.InVal;
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq
            },
            svInputPrm
        })

        this.setState({ firstShow: true })
    }

    gettingOtpResultProc = (reqInfoMap, message) => {
        console.log("gettingOtpResultProc -> message", message)
        clearTimeout(this.gettingOtpFunct_ReqTimeOut);
        let timeResult = new Date()
        reqInfoMap.resTime = timeResult
        reqInfoMap.procStat = 2
        const cltSeqResult = Number(message['ClientSeq'])
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            this.otpStatus = false
            const errmsg = message['Message']
            glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
            glb_sv.openAlertModal('', 'common_InfoMessage', errmsg, '', 'danger', 'otpNum3')
        } else {
            let dataInfo
            try {
                this.setState({ otpModalShow_OTP3: true })
                dataInfo = JSON.parse(message['Data'])
                this.otpStatus = true
                const expTimeOtp = Number(dataInfo[0]['c0']) || 60
                const reqOtpMessage = 'OTP'
                this.setState({ getOtpMessage: message['Message'] })
                this.otpModalOpen(expTimeOtp, reqOtpMessage)
                if (this.otp_interValExpide) {
                    clearInterval(this.otp_interValExpide)
                }
                this.otp_interValExpideFunct()

                setTimeout(() => {
                    const elm = document.getElementById('otpNum3')
                    if (elm) elm.focus()
                }, 300);
            } catch (err) {
                console.log('Lỗi parse json: ' + err)
            }
        }
    }

    render() {
        const { t } = this.props;
        return (
            <>
                <section id="header__section">
                    <div className="header__logo">
                        <AHrefBlank href={glb_sv.configInfo['navbarLogoLink']} rel="noopener noreferrer">
                            <Image idImage="navbarLogoPriceBoard" altImage="Altisss" logo_url={this.state.logoImg} className="header__logo--img"> </Image>
                        </AHrefBlank>
                    </div>
                    <MenubarChildUp get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq} >
                        <div className='card-body header__marquee'>
                            <div className='col-sm-12' >
                                <marquee className='notifi-maque-wrap' onClick={this.open_OVERVIEW_MARKET_TAB_layout} id='header__marquee' onMouseOver={this.on_mouse_over} onMouseOut={this.on_mouse_out}>
                                    <div className='chart-overview-market'>
                                        <div className="card-img-top">
                                            <IndexInfo keyIndex={"VN_INDEX"} t={t} component={this.component} get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq} />
                                            <IndexInfo keyIndex={"HNX_INDEX"} t={t} component={this.component} get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq} />
                                            <IndexInfo keyIndex={"UPCOM_INDEX"} t={t} component={this.component} get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq} />
                                            {
                                                glb_sv.arrHSX.map((key, index) => {
                                                    const key_index = key.split('|')[2]
                                                    return <IndexInfo key={`marquee__HSX__${index}`} keyIndex={key_index} t={t} component={this.component} get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq} />
                                                })
                                            }
                                            {
                                                glb_sv.arrHNX.map((key, index) => {
                                                    const key_index = key.split('|')[2]
                                                    return <IndexInfo key={`marquee__HNX__${index}`} keyIndex={key_index} t={t} component={this.component} get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq} />
                                                })
                                            }
                                        </div>
                                    </div>
                                </marquee>
                            </div>
                        </div>
                    </MenubarChildUp>
                </section>


                {/* send OTP modal */}
                <Modal
                    isOpen={this.state.otpModalShow}
                    size={'sm modal-notify'}
                    onClosed={this.otpModalClose}
                    onOpened={this.otpAfterOpened}
                    id='modalOTP'
                >
                    <ModalHeader>{this.props.t('common_confirm_OTP')}</ModalHeader>
                    <ModalBody>
                        <div className="form-group row" style={{ marginBottom: 0 }}>
                            <label className="col-sm-3 control-label marginAuto nowrap">
                                {this.state.otpModal.otpLabel}
                            </label>
                            <div className="col-sm-9">
                                <div className="input-group">
                                    <Input
                                        inputtype={'text'}
                                        name={'otpNum'}
                                        value={this.state.otpModal.otpNum}
                                        placeholder={this.props.t('common_input_otp')}
                                        onChange={this.handleOtpInput}
                                        onKeyDown={this.handleKeyPress}
                                        disabled={this.state.otpModal.expTime === 0}
                                        classextend="input-modal-otp"
                                    />
                                    <div className="input-group-append">
                                        <span
                                            className="input-group-text input-group-text-custom"
                                            style={{ paddingLeft: 15, paddingRight: 15 }}
                                        >
                                            {this.state.otpModal.expTime + ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* {this.state.otpModal.otpNum_requite && <span className="help-block text-danger col-sm-12">{this.props.t('common_not_yet_confirm_otp_number')}</span>} */}
                            {this.state.otpModal.expTime === 0 && (
                                <span className="help-block text-danger col-sm-12">
                                    {this.props.t('common_otp_expire_time')}
                                </span>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <Button
                                        size="sm"
                                        block
                                        color="wizard"
                                        disabled={
                                            this.state.otpModal.expTime <= 0 || this.state.otpModal.otpNum.length < 4
                                        }
                                        onClick={e => this.otpModalClick('Y')}
                                    >
                                        {this.state.sendingOtpNum ? (
                                            <span>
                                                <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>
                                                ....
                                  </span>
                                        ) : (
                                                <span>{this.props.t('common_confirm')}</span>
                                            )}
                                    </Button>
                                </div>
                                <div className="col">
                                    <Button
                                        size="sm"
                                        block
                                        color="cancel"
                                        className="fixButton"
                                        onClick={e => this.otpModalClick('N')}
                                    >
                                        <span id="Tooltip" title={this.props.t('common_dismiss_otp')}>
                                            {this.props.t('common_button_not_confirm')}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>

                {/* send OTP3 modal manual */}
                <Modal
                    isOpen={this.state.otpModalShow_OTP3}
                    size={'sm modal-notify'}
                    onClosed={this.otpModalClose}
                    id="modalOTP3"
                    onOpened={this.otpAfterOpened}
                >
                    <ModalHeader>{this.props.t('common_confirm_OTP')}</ModalHeader>
                    <ModalBody>
                        <div className="form-group row" style={{ marginLeft: 0, marginRight: 0 }}>
                            <label className="col-sm-3 no-padding-left control-label marginAuto nowrap">
                                {this.state.otpModal.otpLabel}
                            </label>
                            <div className="col-sm-9 no-padding-right">
                                <div className="input-group">
                                    <Input
                                        inputtype={'text'}
                                        name={'otpNum3'}
                                        value={this.state.otpModal.otpNum}
                                        placeholder={this.props.t('common_input_otp')}
                                        onChange={this.handleOtpInput}
                                        onKeyDown={this.handleKeyPress}
                                        classextend="form-control-sm"
                                        disabled={this.state.otpModal.expTime === 0}
                                        classextend="input-modal-otp"
                                    />
                                    <div className="input-group-append">
                                        <span
                                            className="input-group-text"
                                            style={{ paddingLeft: 15, paddingRight: 15 }}
                                        >
                                            {this.state.otpModal.expTime + ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {this.state.otpModal.otpNum_requite && (
                                <span className="help-block text-danger col-sm-12">
                                    {this.props.t('common_not_yet_confirm_otp_number')}
                                </span>
                            )}
                        </div>
                        {this.state.otpModal.expTime !== 0 && (
                            <div className="form-group" style={{ marginTop: 7, marginBottom: 4 }}>
                                <div className="col-sm-12 no-padding">
                                    <span className="control-label no-padding-right otp-message">
                                        {this.state.getOtpMessage}
                                    </span>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                {this.state.otpModal.expTime < 1 && (
                                    <div className="col">
                                        <Button
                                            size="sm"
                                            block
                                            color="wizard"
                                            id="button3getOtpNumber"
                                            onClick={e => this.getOtpNumber3()}
                                        >
                                            {this.state.gettingOtp ? (
                                                <span>
                                                    <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>....
                                        </span>
                                            ) : (
                                                    <span>{this.props.t('Lấy mã OTP')}</span>
                                                )}
                                        </Button>
                                    </div>
                                )}
                                {this.state.otpModal.expTime > 1 && (
                                    <div className="col">
                                        <Button
                                            size="sm"
                                            block
                                            color="wizard"
                                            disabled={
                                                this.state.otpModal.expTime <= 0 ||
                                                this.state.otpModal.otpNum.length < 4
                                            }
                                            onClick={e => this.otpModalClick('Y')}
                                        >
                                            {this.state.sendingOtpNum ? (
                                                <span>
                                                    <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>....
                                        </span>
                                            ) : (
                                                    <span>{this.props.t('common_confirm')}</span>
                                                )}
                                        </Button>
                                    </div>
                                )}
                                <div className="col">
                                    <Button size="sm" block color="cancel" onClick={e => this.otpModalClick('N')}>
                                        <span id="Tooltip" title={this.props.t('common_dismiss_otp')}>
                                            {this.props.t('common_button_not_confirm')}
                                        </span>
                                        <Tooltip
                                            placement="top"
                                            isOpen={this.state.tooltipOpen}
                                            target="Tooltip"
                                            toggle={this.toggle}
                                        >
                                            {this.props.t('common_dismiss_otp')}
                                        </Tooltip>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}
export default translate('translations')(MenuBarLayout);    
