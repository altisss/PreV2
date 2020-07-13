import React from 'react'
import FgtPassForm from './fgtPassForm'

import { translate } from 'react-i18next';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip } from 'reactstrap';
import Input from "../basic/input/Input";
import { ReactComponent as UserIcon } from '../translate/icon/single-01-glyph-24.svg';
import { ReactComponent as PasswordIcon } from '../translate/icon/lock-glyph-24.svg';
import glb_sv from "../../utils/globalSv/service/global_service";
import socket_sv from "../../utils/globalSv/service/socket_service";
import { toast } from "react-toastify";
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import { Subject } from 'rxjs';
import component from '../../constants/components'
import commuChanel from '../../constants/commChanel'
import { reply_send_req } from '../../utils/send_req'
import { inform_broadcast } from '../../utils/broadcast_service';
import functionList from '../../constants/functionList';
import logoImgPath from '../../conponents/translate/logo/alt_login_logo.png';
import { ReactComponent as IconRegister } from '../../conponents/translate/icon/add-29-glyph-24.svg';
import { ReactComponent as IconAlert } from '../../conponents/translate/icon/error_24px.svg';
import viFlag from '../../conponents/translate/flag/vietnam.png'
import enFlag from '../../conponents/translate/flag/english.png'
import cnFlag from '../../conponents/translate/flag/china.png'
import './index.scss';

class LoginModal extends React.Component {
    constructor(props) {
        super(props);

        this.component = component.LoginModal
        this.req_component = new Map();
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.request_seq_comp = 0;
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        };

        this.state = {
            // -- Login number ----
            inputUser: {
                user_id: "",
                user_id_requite: false,
                password_login: "",
                password_requite: false,
                password_length: false,
                rememOptions: []
            },
            checkOptions: ["login_remember"],
            sendingLoginRq: false,
            // -- Otp number -----
            otpModal: {
                otpNum: "",
                // otpNum_requite: false,
                expTime: 0,
                otpLabel: "OTP"
            },
            otpModalShow: false,
            sendingOtpNum: false,
            gettingOtp: false,
            // -- changpass of first time login ----
            inputChngPass: {
                msgInfo: "",
                cur_password: "",
                new_password: "",
                new_cfm_password: ""
            },
            chgPassModalShow: false,
            sendingChangPassRq: false,
            tooltipOpen: false,
            getOtpMessage: '',
            firstShow: false,
            isShowLoginRem: false,
            otpModalShow_OTP3: false,
            logoImg: logoImgPath,
            flagLang: this.props.flagLang,
            language: this.props.language,
            activePage: true,
            modalLogin: true

        };

    }
    url_public = [];
    domain_public = '';
    /*--- read json file of market info SI message init-----------*/
    file1_stat = false;
    stkList_f1 = [];
    file3_stat = false;
    stkList_f3 = [];
    file5_stat = false;
    stkList_f5 = [];
    /*--- declare variable for login function --------------------*/
    subcr_ClientReqRcv = new Subject();
    login_SendReqFlag = false;
    login_Timeout = {};
    login_FcntNm = 'LOGIN-01';
    login_ResultArr = [];
    gettingOtp_FunctNm = 'LOGIN-0008';

    handleInput = (e) => {
        let value = e.target.value;
        let name = e.target.name;
        this.setState(
            prevState => ({
                inputUser: {
                    ...prevState.inputUser,
                    [name]: value
                }
            })
        );
    }

    handleFormSubmit = (e) => {
        e.preventDefault();
        this.sendRequest2Login(this.state.inputUser);
    }
    componentWillUnmount() {
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
    }

    componentDidMount() {
        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            reply_send_req(agrs, this.req_component)
        })

        this.setState({ inputUser: { user_id: '888c000351', password_login: 'hello1' } }, () => {
            this.sendRequest2Login({ user_id: '888c000351', password_login: 'hello1' })
        });

        window.ipcRenderer.on(`${commuChanel.AFTER_OTP}_${this.component}`, (event, msg) => {
            if (msg.type === commuChanel.AFTER_OTP) {
                this.storeAccountInfo(glb_sv.objShareGlb['userInfo']);
                this.gotoMainPage();
            }
        });
    }

    sendRequest2Login = (values) => {
        if (this.login_SendReqFlag) { return; }
        if (this.state.inputUser.user_id == null ||
            this.state.inputUser.user_id.trim() === "") {
            glb_sv.checkToast(toast, 'warn', this.props.t('common_user_id_is_require'), 'login_user');
            glb_sv.focusELM('user_id');
            return;
        }
        if (this.state.inputUser.password_login == null ||
            this.state.inputUser.password_login.trim() === "") {
            glb_sv.checkToast(toast, 'warn', this.props.t('common_password_is_require'), 'login_psw');
            glb_sv.focusELM('password_login');
            this.setState(
                prevState => ({
                    inputUser: {
                        ...prevState.inputUser,
                        password_login: ''
                    }
                }));
            return;
        }

        if (this.state.inputUser.password_login &&
            this.state.inputUser.password_login.length < 6) {
            glb_sv.checkToast(toast, 'warn', this.props.t('login_pass_length'), 'login_psw');
            glb_sv.focusELM('password_login');
            return;
        }

        const sq = this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeCode', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
            if (args === null || args === undefined) {
                this.login_SendReqFlag = false;
                return;
            }

            this.login_SendReqFlag = true;
            // -- push request to request hashmap
            const reqInfo = new requestInfo();
            const request_seq_comp = this.get_rq_seq_comp()
            reqInfo.reqFunct = this.login_FcntNm;
            reqInfo.component = this.component;
            reqInfo.receiveFunct = this.loginResultProc;
            // -- service info
            let svInputPrm = new serviceInputPrm();
            svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
            svInputPrm.WorkerName = 'ALTxCommon';
            svInputPrm.ServiceName = 'ALTxCommon_Login';
            svInputPrm.ClientSentTime = '0';
            svInputPrm.Operation = 'Q';
            svInputPrm.InCrpt = [1];
            svInputPrm.InVal = [values['user_id'].trim() || '', values['password_login'].trim() || '', '', ''];
            svInputPrm.TotInVal = svInputPrm.InVal.length;
            svInputPrm.AppLoginID = values['user_id'].trim().toLowerCase() || '';
            this.loginId = values['user_id'].trim() || '';

            this.login_Timeout = setTimeout(this.solvingTimeout, functionList.reqTimeout, request_seq_comp)
            reqInfo.inputParam = svInputPrm.InVal;

            this.req_component.set(request_seq_comp, reqInfo)

            this.setState({ sendingLoginRq: true });
            window.ipcRenderer.send(commuChanel.send_req, {
                req_component: {
                    component: reqInfo.component,
                    request_seq_comp: request_seq_comp,
                    channel: socket_sv.key_ClientReq
                },
                svInputPrm: svInputPrm
            })
        })

    }

    loginResultProc = (reqInfoMap, message) => {
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2;
            reqInfoMap.resSucc = false;
            const errmsg = message['Message'];
            this.login_SendReqFlag = false;
            if (message['Code'] === '080065' || message['Code'] === '080004') {
                this.setState({
                    inputChngPass: {
                        msgInfo: errmsg,
                        cur_password: "",
                        new_password: "",
                        new_cfm_password: ""
                    },
                    chgPassModalShow: true
                }, () => setTimeout(() => glb_sv.focusELM('cur_password'), 500));

            } else {
                this.login_SendReqFlag = false
                this.setState({ sendingLoginRq: false })
                glb_sv.openAlertModal("sm", "common_notify", errmsg, "OK", "danger", "password_login", false, '', this.component)
            }
            return;
        } else {
            reqInfoMap.procStat = 1;
            let dataArr = [];
            try {
                let strdata = message['Data'];
                strdata = glb_sv.filterStrBfParse(strdata);
                dataArr = JSON.parse(strdata);
                this.login_ResultArr = this.login_ResultArr.concat(dataArr);
            } catch (error) {
                this.login_ResultArr = [];
                reqInfoMap.procStat = 3;
                this.login_SendReqFlag = false;
                glb_sv.logMessage('loginResultProc error parse data: ' + error);
                return;
            }
            if (Number(message['Packet']) <= 0) {
                glb_sv.objShareGlb['userInfo'] = this.login_ResultArr[0];
                // --------------------
                reqInfoMap.procStat = 2;
                const userId = this.login_ResultArr[0]['c0'];  
                glb_sv.objShareGlb['sessionInfo'] = { 'sessionId': message['TransId'], 'userID': userId.trim().toLowerCase(), 'remOrdPass': false, 'orderPass': null, 'Otp': '' };
                this.userID = this.state.inputUser.user_id;
                this.login_SendReqFlag = false;
                const auThYn = glb_sv.objShareGlb['userInfo']['c22'];
                socket_sv.disConnect(true);
                socket_sv.setNewConnectionMrk(0);
                if (auThYn === 'N') {
                    // -- store acntNo info
                    this.storeAccountInfo(glb_sv.objShareGlb['userInfo']);
                    this.gotoMainPage();
                } else {
                    inform_broadcast(commuChanel.OPEN_OTP, {});
                }
            }
            // store info for relogin
            glb_sv.mrkInfo1 = reqInfoMap.inputParam[0];
            if (this.state.isShowLoginRem) localStorage.setItem('mrkInfo1', glb_sv.mrkInfo1);
            glb_sv.mrkInfo2 = reqInfoMap.inputParam[1];
            inform_broadcast(commuChanel.UPDATE_GRP_FVL, {})

        }
    }

    solvingTimeout = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) return
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) return
        if (reqIfMap.reqFunct === this.login_FcntNm) {
            this.login_SendReqFlag = false
            this.setState({ sendingLoginRq: false })
        } else if (reqIfMap.reqFunct === this.forgotPass_FcntNm) {
        }
        const errmsg = 'common_cant_connect_server'
        glb_sv.openAlertModal("sm", "common_notify", errmsg, "OK", "warning", "", true, '', this.component)
    }

    storeAccountInfo = (userInfo) => {
        const accountInfo = userInfo['c21']
        const array_acnt = accountInfo.split("'|'")
        const js_acntInfo = []
        const js_acntList = []
        const js_acntListAll = []
        const js_sub_acntList = [];
        let acntMain = '',
            acntMainName = ''
        for (let i = 0; i < array_acnt.length; i++) {
            const acntInfo = array_acnt[i]
            if (acntInfo != null && acntInfo.length > 22) {
                const arr_info = acntInfo.split('|')
                if (i === 0) {
                    const ls_acntObjsAll = {
                        id: arr_info[0] + '.%',
                        name: arr_info[0] + '.% - ' + arr_info[2],
                    }
                    js_acntListAll.push(ls_acntObjsAll)
                }
                if (arr_info[4] === 'Y' && arr_info[1] === '00') {
                    acntMain = arr_info[0]
                    acntMainName = arr_info[2]
                }
                const js_acnt = {
                    AcntNo: arr_info[0],
                    SubNo: arr_info[1],
                    AcntNm: arr_info[2],
                    SubNm: arr_info[2],
                    IsOwnAcnt: arr_info[4],
                    BuyOrderYN: arr_info[5],
                    SellOrderYN: arr_info[6],
                    CashWdrYN: arr_info[7],
                    CashTransYN: arr_info[8],
                    StockWdrYN: arr_info[9],
                    StockTransYN: arr_info[10],
                    PIAYN: arr_info[11],
                    MorgtYN: arr_info[12],
                    MarginYN: arr_info[13],
                    RgtExeYN: arr_info[14],
                    BankList: [],
                    TradingKey: arr_info[16],
                    ActStatus: arr_info[17],
                    AcntType: arr_info[18],
                    ActTradType: arr_info[19],
                    Broker: arr_info[20],
                    BrokerBranch: arr_info[21],
                    BrokerAgent: arr_info[22],
                    TradingFee: arr_info[23],
                }
                const js_acntObj = {
                    id: arr_info[0] + '.' + arr_info[1],
                    name: arr_info[0] + '.' + arr_info[1] + ' - ' + arr_info[2],
                }
                const js__sub_acntObj = {
                    'id': arr_info[0] + '.' + arr_info[1],
                    'name': arr_info[1]
                }
                js_acntInfo.push(js_acnt)
                js_acntList.push(js_acntObj)
                js_acntListAll.push(js_acntObj)
                js_sub_acntList.push(js__sub_acntObj)
            }
        }

        glb_sv.objShareGlb['acntNoInfo'] = js_acntInfo
        glb_sv.objShareGlb['acntNoList'] = js_acntList
        glb_sv.objShareGlb['acntNoListAll'] = js_acntListAll
        glb_sv.objShareGlb['sub_acntNoList'] = js_sub_acntList;
        
        // --------------------
        glb_sv.objShareGlb['AcntMain'] = acntMain; // -- chủ tài khoản lưu ký
        glb_sv.objShareGlb['AcntMainNm'] = acntMainName; // -- Tên chủ tài khoản
        glb_sv.objShareGlb['workDate'] = userInfo['c20']; // -- Ngày làm việc
        glb_sv.objShareGlb['brokerId'] = userInfo['c24']; // -- ID nhân viên môi giới
        glb_sv.objShareGlb['brokerNm'] = userInfo['c25']; // -- Tên nhân viên môi giới
        glb_sv.objShareGlb['brokerEmail'] = userInfo['c26']; // -- Email nhân viên môi giới
        glb_sv.objShareGlb['brokerMobile'] = userInfo['c27']; // -- Mobile nhân viên môi giới
        glb_sv.objShareGlb['secCode'] = userInfo['c9'];
        glb_sv.objShareGlb['prdYN'] = userInfo['c31']; // -- User trình chiếu bảng điện hay không
        glb_sv.objShareGlb['verify'] = Number(userInfo['c37']) || 0; // -- verify > 0 => Phải xác thực chứng chỉ số
        glb_sv.objShareGlb['serialnum'] = userInfo['c38']; // -- serialNumber 
        // glb_sv.workDate = userInfo['c29']; // -- workdate
        glb_sv.objShareGlb['isBroker'] = userInfo.c2 === '0' ? true : false;
        glb_sv.isSynceAccount = !glb_sv.objShareGlb['isBroker'];
        glb_sv.authFlag = true;
        this.login_SendReqFlag = false;
        if (typeof (Storage) !== 'undefined') {
            // -- check remember user id
            if (this.state.inputUser.rememOptions && this.state.inputUser.rememOptions.length > 0) {
                localStorage.setItem('userIDwebtrad', this.state.inputUser.user_id);
            } else {
                localStorage.removeItem('userIDwebtrad');
            }
        }
    }
    gotoMainPage = () => {
        const messObj = {
            type: glb_sv.LOGIN_SUCCESS,
            values: "ok",
            component: this.component
        }
        inform_broadcast(commuChanel.LOGIN_SUCCESS, messObj)
        // glb_sv.commonEvent.next(messObj);
    }

    handleChangeLoginRem = () => {
        this.setState({ isShowLoginRem: !this.state.isShowLoginRem });
        localStorage.setItem('isShowLoginRem', this.state.isShowLoginRem ? '0' : '1')
    }

    handleKeyPress = e => {
        // e.preventDefault();
        const code = e.keyCode ? e.keyCode : e.which
        const name = e.target.name
        if (name === 'password_login') {
            if (code === 13) {
                this.sendRequest2Login(this.state.inputUser)
            }
        }
        if (name === 'cur_password' || name === 'new_password' || name === 'new_cfm_password') {
            if (code === 13) this.sendRequest2ChgPass(null, 'Y')
            if (code === 27) this.setState({ chgPassModalShow: false })
        }
        return
    }

    handleChangeLanguage = (e) => {
        const language = e.target.value;
        this.setState({ language });
        if (language === 'VI') {
            this.setState({ flagLang: viFlag });
        } else if (language === 'EN') {
            this.setState({ flagLang: enFlag });
        } else if (language === 'CN') {
            this.setState({ flagLang: cnFlag });
        }
        this.props.handleChangeLanguage(e)

    }

    changPage = () => {
        if (this.login_SendReqFlag || this.forgotPass_SendReqFlag) return
        this.setState(prevState => ({ activePage: !prevState.activePage }))
    }

    toggleModal = () => {
        console.log('this.login_SendReqFlag', this.login_SendReqFlag)
        if (this.login_SendReqFlag) return;
        glb_sv.commonEvent.next({ type: glb_sv.HIDE_MODAL_LOGIN })
    }


    render() {
        const { t } = this.props

        return (
            <React.Fragment>
                <Modal isOpen={this.state.modalLogin} size={'md modal-login'} toggle={this.toggleModal}>
                    <ModalBody>
                        <div className="card-body">
                            <div className="loginbox-title">
                                <img
                                    id="loginLogo"
                                    className="login_log"
                                    src={this.state.logoImg}
                                    alt="altisss logo"
                                    border="0"
                                />
                            </div>
                            <div className="form-group">

                                <div className="input-group">
                                    <div className="input-group input-group-login">
                                        <div className="input-group-prepend">
                                            <span style={{ border: 0 }} className="input-group-text input-group-text-custom loginPrepend">
                                                <img
                                                    src={this.state.flagLang}
                                                    alt=""
                                                    style={{ width: 25, height: 20 }}
                                                />
                                            </span>
                                        </div>
                                        <select
                                            value={this.state.language}
                                            onChange={this.handleChangeLanguage}
                                            className="form-control form-control-sm acntTopDiv"
                                        >
                                            <option value="VI">Tiếng Việt</option>
                                            <option value="EN">English</option>
                                            {(glb_sv.activeCode === '888' ||
                                                glb_sv.activeCode === '102' ||
                                                glb_sv.activeCode === '061') && (
                                                    <option value="CN">简体中文</option>
                                                )}
                                            {(glb_sv.activeCode === '888' ||
                                                glb_sv.activeCode === '102' ||
                                                glb_sv.activeCode === '061') && (
                                                    <option value="ZH">繁體中文</option>
                                                )}
                                            {glb_sv.activeCode === '888' && <option value="KO">한국어</option>}
                                        </select>
                                    </div>
                                </div>

                                {this.state.activePage ? (
                                    <form onSubmit={this.handleFormSubmit}>
                                        <div className="form-group">
                                            <div className="input-group input-group-login">
                                                <div className="input-group-prepend">
                                                    <span style={{ border: 0 }} className="input-group-text input-group-text-custom loginPrepend"><UserIcon /></span>
                                                </div>
                                                <Input
                                                    inputtype={"text"}
                                                    name={"user_id"}
                                                    value={this.state.inputUser.user_id}
                                                    placeholder={this.props.t("login_user_id")}
                                                    onChange={this.handleInput}
                                                    classextend={'input-login'}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="input-group input-group-login">
                                                <div className="input-group-prepend">
                                                    <span style={{ border: 0 }} className="input-group-text input-group-text-custom loginPrepend"><PasswordIcon /></span>
                                                </div>
                                                <Input
                                                    inputtype={"password"}
                                                    name={"password_login"}
                                                    value={this.state.inputUser.password_login}
                                                    placeholder={this.props.t("login_user_password")}
                                                    onChange={this.handleInput}
                                                    autoComplete="new-password"
                                                    classextend={'input-login'}
                                                // onKeyDown={this.handleKeyPress}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 15 }}>
                                            <input
                                                className="styled-checkbox"
                                                id={'login_remember'}
                                                type="checkbox"
                                                checked={this.state.isShowLoginRem}
                                                onChange={this.handleChangeLoginRem}
                                            />
                                            <label htmlFor={'login_remember'}>{t('login_remember')}</label>
                                        </div>
                                        <div className="container">
                                            <div className="row">
                                                <button className="btn btn-wizard btn-block">
                                                    {this.state.sendingLoginRq ? <span><i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>....</span> : <span>{this.props.t('login')}</span>}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                        <FgtPassForm get_value_from_glb_sv_seq={this.props.get_value_from_glb_sv_seq}
                                            component={this.component} req_component={this.req_component} get_rq_seq_comp={this.get_rq_seq_comp}

                                        />
                                    )}

                                <div className="form-group" style={{ marginBottom: 5 }}>
                                    <div className="auth-sep" style={{ marginBottom: 5 }}>
                                        <span
                                            className="cursor_ponter"
                                            onClick={this.changPage}
                                            style={{ color: 'inherit' }}
                                        >
                                            {this.state.activePage ? (
                                                <span>{t('login_forget_password')}</span>
                                            ) : (
                                                    <span>{t('login')}?</span>
                                                )}
                                        </span>
                                    </div>
                                </div>

                                <div className="hr" style={{ marginBottom: 10 }}></div>

                                <div className="row text-center text-button" style={{ display: 'block' }}>
                                    <div className="col">
                                        <div style={{ float: 'left' }}>
                                            <IconAlert />{' '}
                                            <span className="cursor_ponter" onClick={this.openModalRisk}>
                                                {t('risk_disclosure_statement')}
                                            </span>
                                        </div>
                                        <div style={{ float: 'right' }}>
                                            <IconRegister />{' '}
                                            <span className="cursor_ponter" onClick={this.props.open_modal_register}>
                                                {t('common_register_open_account')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
                {/* changpass modal */}
                <Modal isOpen={this.state.chgPassModalShow} size={'sm modal-notify'} onOpened={this.chgPassModalOpen}>
                    <ModalHeader>{this.props.t('common_change_login_pass')}</ModalHeader>
                    <ModalBody>
                        <div className="form-group row">
                            <div className="col-sm-12">
                                <label
                                    className="control-label no-padding-right"
                                    style={{
                                        fontStyle: 'Italic',
                                        marginBottom: 5,
                                        whiteSpace: 'normal',
                                    }}
                                >
                                    {this.state.inputChngPass.msgInfo}
                                </label>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-6 control-label no-padding-right">
                                {this.props.t('login_pass_curr')}
                                <span className="mustInput">*</span>
                            </label>
                            <div className="col-sm-6">
                                <Input
                                    inputtype={'password'}
                                    name={'cur_password'}
                                    value={this.state.inputChngPass.cur_password}
                                    placeholder={''}
                                    onChange={this.handleChgPassInput}
                                    onKeyDown={this.handleKeyPress}
                                    maxLength={'30'}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-6 control-label no-padding-right">
                                {this.props.t('login_pass_new')}
                                <span className="mustInput">*</span>
                            </label>
                            <div className="col-sm-6">
                                <Input
                                    inputtype={'password'}
                                    name={'new_password'}
                                    value={this.state.inputChngPass.new_password}
                                    placeholder={''}
                                    onChange={this.handleChgPassInput}
                                    onKeyDown={this.handleKeyPress}
                                    maxLength={'30'}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-6 control-label no-padding-right">
                                {this.props.t('login_pass_new_cfm')}
                                <span className="mustInput">*</span>
                            </label>
                            <div className="col-sm-6">
                                <Input
                                    inputtype={'password'}
                                    name={'new_cfm_password'}
                                    value={this.state.inputChngPass.new_cfm_password}
                                    placeholder={''}
                                    onChange={this.handleChgPassInput}
                                    onKeyDown={this.handleKeyPress}
                                    maxLength={'30'}
                                />
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
                                        color="wizard"
                                        onClick={e => this.sendRequest2ChgPass(e, 'Y')}
                                    >
                                        {this.state.sendingChangPassRq ? (
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
                                        onClick={e => this.sendRequest2ChgPass(e, 'N')}
                                    >
                                        <span>{t('common_button_not_confirm')}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </Modal>
            </React.Fragment>

        )
    }
}

export default translate('translations')(LoginModal);