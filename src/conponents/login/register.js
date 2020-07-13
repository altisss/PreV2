import React from 'react'
import glb_sv from "../../utils/globalSv/service/global_service";
import socket_sv from "../../utils/globalSv/service/socket_service";
import { toast } from "react-toastify";
import {requestInfo} from '../../utils/globalSv/models/requestInfo'
import {serviceInputPrm} from '../../utils/globalSv/models/serviceInputPrm'
import commuChanel  from '../../constants/commChanel'
import component  from '../../constants/components'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip} from 'reactstrap';
import { translate } from 'react-i18next';
import DatePicker from 'react-datepicker'
import {reply_send_req} from '../../utils/send_req'
import functionList from '../../constants/functionList';

class RegisterModal extends React.Component {
    constructor(props) {
        super(props);
        
        this.component = component.RegisterModal
        this.req_component = new Map();
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.request_seq_comp = 0;
        this.get_rq_seq_comp = () => {
        return ++this.request_seq_comp
        };

        this.state = {
            letterList: [],
            nationList: [],
            modal_register: false,
            licenseRegDate: new Date(),
            birthdate: new Date('1990', '00', '01'),
        }

        this.regOpAcount_FcntNm = 'LOGIN-0003'
        this.regOpAcountFlag = false
        this.openAcount = {}

         // -- get kind of letters info
        this.getKindLetter_FcntNm = 'LOGIN-0005'
        this.letterList = []
        this.letterListTmp = []

        // -- get nations list
        this.getNations_FcntNm = 'LOGIN-0004'
        this.nationList = []
        this.nationListTmp = []
        
        this.licenseRegDate = new Date()
        this.birthdate = new Date('1990', '00', '01')

        this.sexTps = [
            { sexCd: 'M', sexNm: 'common_male' },
            { sexCd: 'F', sexNm: 'common_female' },
            { sexCd: 'O', sexNm: 'common_other' },
        ]
        this.addrPrios = [
            { addrPrioCd: '1', addrPrioNm: 'common_contact_address' },
            { addrPrioCd: '2', addrPrioNm: 'common_resident_address' },
        ]
        this.phonePrios = [
            { phonePrioCd: '1', phonePrioNm: 'common_mobilephone' },
            { phonePrioCd: '2', phonePrioNm: 'common_home_phone' },
        ]
    }
    
    componentDidMount() {
        this.getLetterList()
        this.getNationsList()
        this.setState({ modal_register: true, comp_nm: glb_sv.configInfo.comp_nm }, () => {
            const obJB2 = document.getElementById('navbarLogoRgAct')
            if (obJB2) {
                obJB2.setAttribute('src', glb_sv.configInfo['loginLogo'])
            }
        })

        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            console.log('this.req_component', JSON.stringify(this.req_component));
            reply_send_req(agrs, this.req_component)
        })
    }

    componentWillUnmount(){
        window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
    }

    handle_getNationsList = (reqInfoMap, message) => {
        clearTimeout(this.getNations_ReqTimeout)
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
        } else {
            reqInfoMap.procStat = 1
            try {
                let strdata = message['Data']
                strdata = glb_sv.filterStrBfParse(strdata)
                const dataArr = JSON.parse(strdata)
                if (!!dataArr) this.nationListTmp = this.nationListTmp.concat(dataArr)
            } catch (error) {
                this.nationListTmp = []
                reqInfoMap.procStat = 3
                glb_sv.logMessage('getNations_FcntNm error parse data: ' + error)
            }
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.nationList = this.nationListTmp
                if (this.nationList.length > 0) {
                    this.openAcount['country'] = '234'
                    this.setState({ nationList: this.nationList }, () => {
                        const openAcount_country = document.getElementById('openAcount_country')
                        openAcount_country.value = '234'
                    })
                }
            }
        }
        // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    }

    getNationsList = () => {
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_getNationsList
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getNations_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_getNationsList;
        // glb_sv.setReqInfoMapValue(clientSeq, reqInfo)
        // -- service info
        let svInputPrm = new serviceInputPrm()
        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm)
        svInputPrm.WorkerName = 'ALTqAccount'
        svInputPrm.ServiceName = 'ALTqAccount_Common'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['04', '%']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.nationList = []
        this.nationListTmp = []
        // this.getNations_ReqTimeout = setTimeout(this.functSolveTimeOut,
        // 	glb_sv.reqTimeout, clientSeq);
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component:{
              component: reqInfo.component, 
              request_seq_comp: request_seq_comp,
              channel: socket_sv.key_ClientReq
            }, 
            svInputPrm:svInputPrm
          })
    }

    handleSubmitResgister = (e, actp) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        for (let entry of formData.entries()) {
            this.openAcount[entry[0]] = entry[1]
        }
        this.registerOpenAccount()
    }

    handleResetResgister = () => {
        const openAcc = document.getElementById('openAcc')
        if (openAcc) openAcc.reset()
        const openAcount_country = document.getElementById('openAcount_country')
        openAcount_country.value = '234'
        this.openAcount = {}
        this.openAcount['country'] = '234'
        this.openAcount['licenseTp'] = this.letterList[0]['c0']
        this.licenseRegDate = new Date()
        this.birthdate = new Date('1990', '00', '01')
        this.setState({ licenseRegDate: this.licenseRegDate, birthdate: this.birthdate })
        glb_sv.focusELM('openAcount_custname')
        return
    }

    handle_getLetterList= (reqInfoMap, message) => {
        clearTimeout(this.getKindLetter_ReqTimeout)
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
        } else {
            reqInfoMap.procStat = 1
            try {
                let strdata = message['Data']
                strdata = glb_sv.filterStrBfParse(strdata)
                const dataArr = JSON.parse(strdata)
                if (!!dataArr) this.letterListTmp = this.letterListTmp.concat(dataArr)
            } catch (error) {
                this.letterListTmp = []
                reqInfoMap.procStat = 3
                glb_sv.logMessage('getKindLetter_FcntNm error parse data: ' + error)
            }
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                this.letterList = this.letterListTmp
                if (this.letterList.length > 0) {
                    this.setState({ letterList: this.letterList })
                    this.openAcount['licenseTp'] = this.letterList[0]['c0']
                }
            }
        }
        // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap)
    }

    getLetterList = () => {
        const request_seq_comp = this.get_rq_seq_comp()
        // -- push request to request hashmap handle_getLetterList
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getKindLetter_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_getLetterList;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTqAccount'
        svInputPrm.ServiceName = 'ALTqAccount_Common'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['15', 'id_tp', '%']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm))
        this.letterList = []
        this.letterListTmp = []
        // this.getKindLetter_ReqTimeout = setTimeout(this.functSolveTimeOut,
        // 	glb_sv.reqTimeout, clientSeq);
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component:{
              component: reqInfo.component, 
              request_seq_comp: request_seq_comp,
              channel: socket_sv.key_ClientReq
            }, 
            svInputPrm:svInputPrm
          })
    }

    handle_registerOpenAccount = (reqInfoMap, message) => {
        clearTimeout(this.regOpAcount_ReqTimeout)
        this.regOpAcountFlag = false
        reqInfoMap.procStat = 2
        if (Number(message['Result']) === 0) {
            reqInfoMap.resSucc = false
            const errmsg = message['Message']
            glb_sv.openAlertModal("", "common_InfoMessage", errmsg, "", "danger", "openAcount_custname", '', '', this.component)
        } else {
            this.setState({ modal_register: false })
            glb_sv.openAlertModal("", "common_InfoMessage", message['Message'], "", "success", "", '', '', this.component)
        }
    }

    registerOpenAccount = acTp => {
        if (this.regOpAcountFlag) {
            return
        }

        let custname = this.openAcount['custname']
        if (custname == null || custname === undefined || custname.trim().length === 0) {
            const ermsg = 'common_plz_input_full_name'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_custname')
            return
        }
        custname = custname.trim()
        const sexTp = this.openAcount['sexTp']
        if (
            sexTp == null ||
            sexTp === undefined ||
            sexTp.trim().length === 0 ||
            sexTp === '-- ' + this.props.t('common_select_your_gender')
        ) {
            toast.warn(this.props.t('common_choose_your_sex'))
            glb_sv.focusELM('openAcount_sexTp')
            return
        }
        let birthdate
        
        const birthdateDtOld = this.birthdate
        if (birthdateDtOld == null || birthdateDtOld === undefined) {
            const ermsg = 'common_plz_input_your_birthday'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_birthdate')
            return
        }

        let year = birthdateDtOld.getFullYear()
        let day = birthdateDtOld.getDate()
        let month = birthdateDtOld.getMonth() + 1
        if (
            day == null ||
            day === undefined ||
            day === '' ||
            month == null ||
            month === undefined ||
            month === '' ||
            year == null ||
            year === undefined ||
            year === ''
        ) {
            const ermsg = 'common_plz_input_your_birthday'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_birthdate')
            return
        }

        const datecur = new Date()
        const yearcur = datecur.getFullYear()
        if (Number(year) > Number(yearcur) - 18) {
            const ermsg = 'common_under_18_years_can_not_open_account'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_birthdate')
            return
        }
        day = glb_sv.addZero(day, 2)
        month = glb_sv.addZero(month, 2)
        birthdate = year + month + day

        const birthPlace = this.openAcount['birthPlace']
        if (birthPlace == null || birthPlace === undefined) {
            const ermsg = 'common_plz_input_your_place_of_birth'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_birthPlace')
            return
        }
        const licenseTp = this.openAcount['licenseTp']
        if (licenseTp == null || licenseTp === undefined || licenseTp.trim().length === 0) {
            const ermsg = 'common_plz_choose_your_certificates_type'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_licenseTp')
            return
        }
        const country = this.openAcount['country']
        if (country == null || country === undefined || country.trim().length === 0) {
            const ermsg = 'common_choose_your_nation'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_country')
            return
        }
        const licenseNumber = this.openAcount['licenseNumber']
        if (licenseNumber == null || licenseNumber === undefined || licenseNumber.trim().length === 0) {
            const ermsg = 'common_plz_input_your_certificates_no'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_licenseNumber')
            return
        }

        let licenseRegDate
        
        const licenseRegDateDtOld = this.licenseRegDate
        if (licenseRegDateDtOld == null || licenseRegDateDtOld === undefined) {
            const ermsg = 'common_plz_input_register_date_of_certificates'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_licenseRegDate')
            return
        }
        year = licenseRegDateDtOld.getFullYear()
        day = licenseRegDateDtOld.getDate()
        month = licenseRegDateDtOld.getMonth() + 1
        if (
            day == null ||
            day === undefined ||
            day === '' ||
            month == null ||
            month === undefined ||
            month === '' ||
            year == null ||
            year === undefined ||
            year === ''
        ) {
            const ermsg = 'common_plz_input_register_date_of_certificates'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_licenseRegDate')
            return
        }
        day = glb_sv.addZero(day, 2)
        month = glb_sv.addZero(month, 2)
        licenseRegDate = year + month + day

        const licenRegPlace = this.openAcount['licenRegPlace']
        if (licenRegPlace == null || licenRegPlace === undefined || licenRegPlace.trim().length === 0) {
            const ermsg = 'common_plz_input_register_place_of_certificates'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_licenRegPlace')
            return
        }
        let jobTp = this.openAcount['jobTp']
        if (jobTp == null || jobTp === undefined || jobTp.trim().length === 0) {
            jobTp = ''
        }
        const addressHome = this.openAcount['addressHome']
        if (addressHome == null || addressHome === undefined || addressHome.trim().length === 0) {
            const ermsg = 'common_plz_input_your_home_address'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_addressHome')
            return
        }
        let addressOffice = this.openAcount['addressOffice']
        if (addressOffice == null || addressOffice === undefined || addressOffice.trim().length === 0) {
            addressOffice = ''
        }
        let homePhone = this.openAcount['homePhone']
        if (homePhone == null || homePhone === undefined || homePhone.trim().length === 0) {
            homePhone = ''
        }
        const mobile = this.openAcount['mobile']
        if (mobile == null || mobile === undefined || mobile.trim().length === 0) {
            const ermsg = 'common_plz_input_your_mobile_number'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_mobile')
            return
        }
        let inv_code = this.openAcount['inv_code']
        if (!!inv_code && inv_code.trim().length !== 6) {
            const ermsg = 'your_invite_code_must_6_character'
            toast.warn(this.props.t(ermsg))
            glb_sv.focusELM('openAcount_inv_code')
            return
        }

        let faxNumber = this.openAcount['faxNumber']
        if (faxNumber == null || faxNumber === undefined || faxNumber.trim().length === 0) {
            faxNumber = ''
        }
        let email = this.openAcount['email']
        if (email == null || email === undefined || email.trim().length === 0) {
            email = ''
        }

        let addrPrio = this.openAcount['addrPrio']
        if (addrPrio == null || addrPrio === undefined || addrPrio.trim().length === 0) {
            addrPrio = ''
        }
        let phonePrio = this.openAcount['phonePrio']
        if (phonePrio == null || phonePrio === undefined || phonePrio.trim().length === 0) {
            phonePrio = ''
        }
        let compNm = this.openAcount['compNm']
        if (compNm == null || compNm === undefined || compNm.trim().length === 0) {
            compNm = ''
        }
        let taxCode = this.openAcount['taxCode']
        if (taxCode == null || taxCode === undefined || taxCode.trim().length === 0) {
            taxCode = ''
        }

        const request_seq_comp = this.get_rq_seq_comp()
        if (!!inv_code) inv_code.toUpperCase()
        // -- push request to request hashmap handle_registerOpenAccount
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.regOpAcount_FcntNm
        reqInfo.component = this.component;
        reqInfo.receiveFunct = this.handle_registerOpenAccount;
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTxAccount'
        // svInputPrm.ServiceName = 'ALTxAccount_0101_1';
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'I'
        // if (glb_sv.activeCode === '888' || glb_sv.activeCode === '102') {
        svInputPrm.ServiceName = 'ALTxAccount_0101_1_online'
        svInputPrm.InVal = [
            custname,
            sexTp,
            birthdate,
            birthPlace,
            country,
            licenseNumber,
            licenseTp,
            licenseRegDate,
            licenRegPlace,
            addressHome,
            addressOffice,
            homePhone,
            mobile,
            faxNumber,
            email,
            addrPrio,
            phonePrio,
            jobTp,
            compNm,
            taxCode,
            'N',
            '',
            '',
            '',
            inv_code,
        ]
        svInputPrm.TotInVal = svInputPrm.InVal.length
        svInputPrm.AppLoginID = 'OTS-WEB';
        this.regOpAcount_ReqTimeout = setTimeout(this.functSolveTimeOut, functionList.reqTimeout, request_seq_comp)
        
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component:{
              component: reqInfo.component, 
              request_seq_comp: request_seq_comp,
              channel: socket_sv.key_ClientReq
            }, 
            svInputPrm:svInputPrm
          })
    
    }

    functSolveTimeOut = cltSeq => {
        if (cltSeq == null || cltSeq === undefined || Number(cltSeq) === NaN) {
            return
        }
        const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq)
        if (reqIfMap == null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        if (reqIfMap.reqFunct === this.regOpAcount_FcntNm) {
            this.regOpAcountFlag = false
            glb_sv.openAlertModal("", "common_InfoMessage", 'common_cant_connect_server', "", "", "", '', '', this.component)
        }
        glb_sv.setReqInfoMapValue(cltSeq, reqIfMap)
    }

    //-- Add new date for inputting manual
    handleDateChange = (actTp, value) => {
        if (actTp === 1) {
            this.licenseRegDate = value
            this.setState({ licenseRegDate: value })
        } else {
            this.birthdate = value
            this.setState({ birthdate: value })
        }
    }

    toggle = () => {
        glb_sv.commonEvent.next({ type: glb_sv.HIDE_MODAL_LOGIN })
    }

    render() {
        const {t} = this.props
        return (
            <Modal isOpen={this.state.modal_register} size={'lg  modal-notify'} toggle={this.toggle}>
                <form onSubmit={this.handleSubmitResgister} id="openAcc">
                    <ModalHeader toggle={e => this.props.close_modal_register() }>
                        <img
                            id="navbarLogoRgAct"
                            src=""
                            alt=""
                            style={{ height: 30, marginRight: 10 }}
                            className="hidden-sm-down"
                        ></img>
                        {this.props.t('common_register_open_account_online')}
                        {' ' + this.state.comp_nm}
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_custname"
                                >
                                    {t('common_full_name')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_custname"
                                        className="form-control form-control-sm"
                                        maxLength={200}
                                        name="custname"
                                        autoComplete="off"
                                    />
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_sexTp"
                                >
                                    {t('common_your_sex')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <select
                                        id="openAcount_sexTp"
                                        className="form-control form-control-sm"
                                        name="sexTp"
                                    >
                                        <option>-- {t('common_select_your_gender')}</option>
                                        {this.sexTps.map(item => (
                                            <option key={item.sexCd} value={item.sexCd}>
                                                {t(item.sexNm)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_birthdate"
                                >
                                    {t('common_birthday')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <DatePicker
                                        id="openAcount_birthdate"
                                        popperPlacement="bottom"
                                        scrollableYearDropdown
                                        selected={this.state.birthdate}
                                        dateFormat="dd/MM/yyyy"
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        className="form-control form-control-sm"
                                        onChange={value => this.handleDateChange(2, value)}
                                    />
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_birthPlace"
                                >
                                    {t('common_place_of_birth')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_birthPlace"
                                        className="form-control form-control-sm"
                                        name="birthPlace"
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_licenseTp"
                                >
                                    {t('common_certificates_type')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <select
                                        id="openAcount_licenseTp"
                                        className="form-control form-control-sm"
                                        name="licenseTp"
                                    >
                                        {this.state.letterList.map(item => (
                                            <option key={item.c0} value={item.c0}>
                                                {item.c1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_country"
                                >
                                    {t('common_nation')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <select
                                        id="openAcount_country"
                                        name="country"
                                        className="form-control form-control-sm"
                                    >
                                        {this.state.nationList.map(item => (
                                            <option key={item.c0} value={item.c0}>
                                                {item.c1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_licenseNumber"
                                >
                                    {t('common_certificates_no')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_licenseNumber"
                                        className="form-control form-control-sm"
                                        name="licenseNumber"
                                        maxLength={20}
                                        autoComplete="off"
                                    />
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_licenseRegDate"
                                >
                                    {t('common_register_date')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <DatePicker
                                        id="openAcount_licenseRegDate"
                                        popperPlacement="bottom"
                                        scrollableYearDropdown
                                        selected={this.state.licenseRegDate}
                                        dateFormat="dd/MM/yyyy"
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        className="form-control form-control-sm"
                                        onChange={value => this.handleDateChange(1, value)}
                                    />
                                    {/* </div> */}
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_licenRegPlace"
                                >
                                    {t('common_register_place')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_licenRegPlace"
                                        className="form-control form-control-sm"
                                        name="licenRegPlace"
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_jobTp"
                                >
                                    {t('common_job')}
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_jobTp"
                                        className="form-control form-control-sm"
                                        name="jobTp"
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_addressHome"
                                >
                                    {t('common_contact_address')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-10">
                                    <input
                                        type="text"
                                        id="openAcount_addressHome"
                                        className="form-control form-control-sm"
                                        name="addressHome"
                                        maxLength={200}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_addressOffice"
                                >
                                    {t('common_resident_address')}
                                </label>
                                <div className="col-sm-10">
                                    <input
                                        type="text"
                                        id="openAcount_addressOffice"
                                        className="form-control form-control-sm"
                                        name="addressOffice"
                                        maxLength={200}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_homePhone"
                                >
                                    {t('common_home_phone')}
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_homePhone"
                                        className="form-control form-control-sm"
                                        name="homePhone"
                                        maxLength={15}
                                        autoComplete="off"
                                    />
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_mobile"
                                >
                                    {t('common_mobilephone')}
                                    <span className="mustInput">*</span>
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_mobile"
                                        className="form-control form-control-sm"
                                        name="mobile"
                                        maxLength={15}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                {(glb_sv.activeCode == '102' || glb_sv.activeCode == '888') && (
                                    <>
                                        <label
                                            style={{ textAlign: 'left' }}
                                            className="col-sm-2 control-label no-padding-right marginAuto"
                                            htmlFor="openAcount_faxNumber"
                                        >
                                            {t('referral_ID')}
                                        </label>
                                        <div className="col-sm-4">
                                            <input
                                                style={{
                                                    textTransform: 'uppercase',
                                                    backgroundColor: '#FFA500',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                }}
                                                type="text"
                                                id="openAcount_inv_code"
                                                className="form-control form-control-sm"
                                                name="inv_code"
                                                maxLength={6}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </>
                                )}
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_email"
                                >
                                    {t('email')}
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_email"
                                        className="form-control form-control-sm"
                                        name="email"
                                        maxLength={50}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_addrPrio"
                                >
                                    {t('common_priority_address')}
                                </label>
                                <div className="col-sm-4">
                                    <select
                                        id="openAcount_addrPrio"
                                        className="form-control form-control-sm"
                                        name="addrPrio"
                                    >
                                        {this.addrPrios.map(item => (
                                            <option key={item.addrPrioCd} value={item.addrPrioCd}>
                                                {t(item.addrPrioNm)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_phonePrio"
                                >
                                    {t('common_priority_phone')}
                                </label>
                                <div className="col-sm-4">
                                    <select
                                        id="openAcount_phonePrio"
                                        className="form-control form-control-sm"
                                        name="phonePrio"
                                    >
                                        {this.phonePrios.map(item => (
                                            <option key={item.phonePrioCd} value={item.phonePrioCd}>
                                                {t(item.phonePrioNm)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_compNm"
                                >
                                    {t('common_office_name')}
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_compNm"
                                        className="form-control form-control-sm"
                                        name="compNm"
                                        maxLength={100}
                                        autoComplete="off"
                                    />
                                </div>
                                <label
                                    style={{ textAlign: 'left' }}
                                    className="col-sm-2 control-label no-padding-right marginAuto"
                                    htmlFor="openAcount_taxCode"
                                >
                                    {t('common_tax_number')}
                                </label>
                                <div className="col-sm-4">
                                    <input
                                        type="text"
                                        id="openAcount_taxCode"
                                        className="form-control form-control-sm"
                                        name="taxCode"
                                        maxLength={20}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="container">
                            <div className="row">
                                <div className="col-2">
                                    <Button size="sm" block color="wizard" onSubmit={this.handleSubmitResgister}>
                                        {this.state.sendingChangPassRq ? (
                                            <span>
                                                <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i>....
                                            </span>
                                        ) : (
                                            <span>{this.props.t('common_register_info')}</span>
                                        )}
                                    </Button>
                                </div>
                                <div className="col-2">
                                    <Button
                                        size="sm"
                                        block
                                        color="cancel"
                                        onClick={e => this.handleResetResgister('N')}
                                    >
                                        <span>{t('common_remove_for_input_again')}</span>
                                    </Button>
                                </div>
                                <div className="col-8 text-right">
                                    <label className="text-button">{t('common_input_request')}</label>
                                </div>
                            </div>
                        </div>
                    </ModalFooter>
                </form>
            </Modal>
        )
    }

}
        

export default translate('translations')(RegisterModal);