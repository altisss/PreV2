import React from 'react'
import commuChanel from '../../constants/commChanel'
import { translate } from 'react-i18next'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import socket_sv from '../../utils/globalSv/service/socket_service'
// import glb_sv from '../../utils/globalSv/service/global_service'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import LeftContent from './left_content'
import RightContent from './right_content'
import { getUniqueListBy } from '../../utils/utils_func'
import functionList from '../../constants/functionList'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv'
import { on_subcribeIndexList, on_unSubStkList } from '../../utils/subcrible_functions'
import { inform_broadcast } from '../../utils/broadcast_service'
import { reply_send_req } from '../../utils/send_req'
// import LayoutHeader from '../../conponents/layout_header'

function MarketLiquidContainer(props) {
    const { component, get_value_from_glb_sv_seq, get_rq_seq_comp, req_component, request_seq_comp } = props
    const { t, saveStateBfPopout, state_bf_popin_popout = {} } = props
    console.log('container', state_bf_popin_popout)

    const [state, setState] = React.useState({
        isShowShare: false,
        isShowHNXShare: true,
        isShowUPCShare: true,
        time_ChartData: '1D',
        index: 'HSX',
        indexNum: '01',
        dataType: 'TV', // KLGD: TV, GTGD: TA
        modal_mean_graph: false,
    })
    const [storeState, setStoreState] = React.useState({
        //State lưu trữ
        dataVOL_LiquidMarket: [],
        dataVAL_LiquidMarket: [],
    })

    const [renderState, setRenderState] = React.useState({
        // Các state dùng hiển thị
        dataCurrentTable: [],
        bubbleStateData: [],
        barStateData: [],
    })

    const getMktInfo_LiquidMarket_FunctNm = 'getMktInfo_LiquidMarket_FunctNm'
    let temp = {}
    let tempData = []

    React.useEffect(() => {
        //Chỉ update state lần đầu render (tương tự ComponentDidMount)
        let i = 0
        if ((state_bf_popin_popout.length !== 0) & (i === 0)) {
            setState({
                ...state,
                ...state_bf_popin_popout,
            })
            i++
        }
    }, [state_bf_popin_popout])

    React.useEffect(() => {
        let tempData = []
        console.log('Gọi useEffect lấy dữ liệu ', req_component)
        //Lấy dữ liệu từ server
        const sq = get_value_from_glb_sv_seq()
        if (state.time_ChartData === '1D') {
            subcribeMrk(state.index)
            console.log('listener')
            window.ipcRenderer.on(`${commuChanel.event_ClientReqMRKRcv}_${component}`, (event, message) => {
                console.log(message)
                let jsondata = []
                try {
                    jsondata = JSON.parse(message.Data)
                } catch (err) {
                    console.error('LiquidMarket parse message', err)
                    return
                }
                tempData = getUniqueListBy(tempData.concat(jsondata), 'StkCd')
                // console.log('LiquidMarket', message.MsgKey, data);
                if (message.Data.length !== 0) {
                    console.log(message)
                    if (state.dataType === 'TV') {
                        if (
                            message.MsgKey === '01|EFF_QTY_UP' ||
                            message.MsgKey === '03|EFF_QTY_UP' ||
                            message.MsgKey === '05|EFF_QTY_UP'
                        ) {
                            setStoreState({ ...storeState, dataVOL_LiquidMarket: tempData })
                        }
                    }
                    if (state.dataType === 'TA') {
                        if (
                            message.MsgKey === '01|EFF_VAL_UP' ||
                            message.MsgKey === '03|EFF_VAL_UP' ||
                            message.MsgKey === '05|EFF_VAL_UP'
                        ) {
                            setStoreState({ ...storeState, dataVAL_LiquidMarket: tempData })
                        }
                    }
                } else {
                    console.log('Socket dữ liệu rỗng')
                    return
                }
            })
        } else {
            window.ipcRenderer.on(`${commuChanel.reply_send_req}_${component}`, (event, agrs) => {
                console.log('this.req_component', agrs, req_component)
                reply_send_req(agrs, req_component)
            })
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
                component: component,
                value: 'dataLiquidMarkettop',
                sq: sq,
            })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`, (event, agrs) => {
                const data = agrs
                if (state.index === 'HSX' && data[state.time_ChartData]) {
                    get_data(data[state.time_ChartData].dataKLGD_HSX, data[state.time_ChartData].dataGTGD_HSX)
                }
                if (state.index === 'HNX' && data[state.time_ChartData]) {
                    get_data(data[state.time_ChartData].dataKLGD_HNX, data[state.time_ChartData].dataGTGD_HNX)
                }
                if (state.index === 'UPC' && data[state.time_ChartData]) {
                    get_data(data[state.time_ChartData].dataKLGD_UPC, data[state.time_ChartData].dataGTGD_UPC)
                }
            })
        }

        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${component}`, (event, message) => {
            if (state.modal_mean_graph) setState({ modal_mean_graph: false })
            else {
                const msg = { type: commuChanel.ACTION_SUCCUSS, component: component }
                // glb_sv.commonEvent.next(msg);
                inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
            }
        })

        //modal mean graph

        return () => {
            unsubcribeMrk(state.index)
            window.ipcRenderer.removeAllListeners(`${commuChanel.event_ClientReqMRKRcv}_${component}`)
            window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${component}`)
            window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${component}`)
        }
    }, [state.indexNum, state.time_ChartData, state.dataType])

    const get_data = (dataKLGD = [], dataGTGD = []) => {
        if (state.dataType === 'TV') {
            if (dataKLGD === null || dataKLGD.length === 0) {
                getMktInfo_MktInfo(state.indexNum, state.time_ChartData, state.dataType)
            } else {
                setStoreState({ ...storeState, dataVOL_LiquidMarket: dataKLGD })
            }
        } else if (state.dataType === 'TA') {
            if (dataGTGD === null || dataGTGD.length === 0) {
                getMktInfo_MktInfo(state.indexNum, state.time_ChartData, state.dataType)
            } else {
                setStoreState({ ...storeState, dataVAL_LiquidMarket: dataGTGD })
            }
        }
    }

    React.useEffect(() => {
        console.log('SetstateRender', state)
        if (state.isShowShare) {
            setRenderState({
                ...renderState,
                dataCurrentTable: storeState.dataVAL_LiquidMarket,
                bubbleStateData: storeState.dataVAL_LiquidMarket,
                barStateData: storeState.dataVAL_LiquidMarket,
            })
        } else {
            setRenderState({
                ...renderState,
                dataCurrentTable: storeState.dataVOL_LiquidMarket,
                bubbleStateData: storeState.dataVOL_LiquidMarket,
                barStateData: storeState.dataVOL_LiquidMarket,
            })
        }
    }, [storeState.dataVAL_LiquidMarket, storeState.dataVOL_LiquidMarket])

    const getMktInfo_MktInfo = (index, time, type) => {
        // -- push request to request hashmap
        let reqInfo = new requestInfo()
        let svInputPrm = new serviceInputPrm()
        const request_seq_comp = get_rq_seq_comp()

        console.log('IN TABLE', { type, reqInfo })
        // -- service info
        reqInfo.reqFunct = getMktInfo_LiquidMarket_FunctNm + type
        reqInfo.component = component
        reqInfo.receiveFunct = handle_getMktInfo_MKLiQuid
        reqInfo.inputParam = svInputPrm.InVal

        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
        svInputPrm.WorkerName = 'ALTqMktInfo01'
        svInputPrm.ServiceName = 'ALTqMktInfo01_MktInfo'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['1', index, time, type, '-1']
        svInputPrm.TotInVal = svInputPrm.InVal.length

        temp['getMktInfo_LiquidMarket_FunctNm' + type] = setTimeout(
            functSolveTimeOut,
            functionList.reqTimeout,
            request_seq_comp
        )

        req_component.set(request_seq_comp, reqInfo)
        console.log(req_component)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq,
            },
            svInputPrm: svInputPrm,
        })
    }

    const handle_getMktInfo_MKLiQuid = (reqInfoMap, message) => {
        console.log('1', { reqInfoMap, message })
        const cltSeqResult = Number(message['ClientSeq'])
        if (cltSeqResult === null || cltSeqResult === undefined || isNaN(cltSeqResult)) {
            return
        }
        if (reqInfoMap === null || reqInfoMap === undefined) {
            return
        }
        let timeResult
        timeResult = new Date()
        reqInfoMap.resTime = timeResult

        clearTimeout(temp['getMktInfo_LiquidMarket_FunctNm' + state.dataType])
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
            return
        }
        if (Number(message['Result']) === 0) {
            reqInfoMap.procStat = 2
            reqInfoMap.resSucc = false
            // if (message['Code'] !== '080128') { glb_sv.openAlertModal('', 'common_InfoMessage', message['Message'], '', 'danger', '', false); }
            // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
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
            tempData = tempData.concat(jsondata)
            if (Number(message['Packet']) <= 0) {
                reqInfoMap.procStat = 2
                // glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
                // console.log('TV', tempData);
                tempData = tempData.map(item => {
                    return {
                        Cap: item.c13,
                        ChgRatio: Number(item.c11) * 100,
                        HighPri: Number(item.c6) * 1000,
                        LowPri: Number(item.c4) * 1000,
                        TradVal: item.c9,
                        TradVol: item.c8,
                        StkCd: item.c3,
                    }
                })
                tempData = getUniqueListBy(tempData, 'StkCd')
                const sq = get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
                    component: component,
                    value: 'dataLiquidMarkettop',
                    sq: sq,
                })
                window.ipcRenderer.once(
                    `${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`,
                    (event, agrs) => {
                        if (state.dataType === 'TV') {
                            setStoreState({ ...storeState, dataVOL_LiquidMarket: tempData })
                            if (agrs[state.time_ChartData] === undefined) return
                            if (state.index === 'HSX') {
                                agrs[state.time_ChartData].dataKLGD_HSX = tempData.slice()
                                update_value_for_glb_sv({
                                    component: component,
                                    key: 'dataLiquidMarkettop',
                                    value: agrs,
                                })
                            }
                            if (state.index === 'HNX') {
                                agrs[state.time_ChartData].dataKLGD_HNX = tempData.slice()
                                update_value_for_glb_sv({
                                    component: component,
                                    key: 'dataLiquidMarkettop',
                                    value: agrs,
                                })
                            }
                            if (state.index === 'UPC') {
                                agrs[state.time_ChartData].dataKLGD_UPC = tempData.slice()
                                update_value_for_glb_sv({
                                    component: component,
                                    key: 'dataLiquidMarkettop',
                                    value: agrs,
                                })
                            }
                        }
                        if (state.dataType === 'TA') {
                            setStoreState({ ...storeState, dataVAL_LiquidMarket: tempData })
                            if (agrs[state.time_ChartData] === undefined) return
                            if (state.index === 'HSX') {
                                agrs[state.time_ChartData].dataGTGD_HSX = tempData.slice()
                                update_value_for_glb_sv({
                                    component: component,
                                    key: 'dataLiquidMarkettop',
                                    value: agrs,
                                })
                            }
                            if (state.index === 'HNX') {
                                agrs[state.time_ChartData].dataGTGD_HNX = tempData.slice()
                                update_value_for_glb_sv({
                                    component: component,
                                    key: 'dataLiquidMarkettop',
                                    value: agrs,
                                })
                            }
                            if (state.index === 'UPC') {
                                agrs[state.time_ChartData].dataGTGD_UPC = tempData.slice()
                                update_value_for_glb_sv({
                                    component: component,
                                    key: 'dataLiquidMarkettop',
                                    value: agrs,
                                })
                            }
                        }
                    }
                )
            }
        }
    }

    const handleChangeIndex = e => {
        const index = e.target.value
        const indexNum = index => {
            if (index === 'HSX') return '01'
            if (index === 'HNX') return '03'
            if (index === 'UPC') return '05'
        }
        setState({
            ...state,
            index: index,
            indexNum: indexNum(index),
        })
        saveStateBfPopout({
            ...state,
            index: index,
            indexNum: indexNum(index),
        })
    }
    const handleChangeTime = time_ChartData => {
        console.log('handleChangeTime')
        setState({
            ...state,
            time_ChartData: time_ChartData,
        })
        saveStateBfPopout({
            ...state,
            time_ChartData: time_ChartData,
        })
    }
    const handleChangeTop = b => {
        console.log('handleChangeTop')
        setState({
            ...state,
            isShowShare: !state.isShowShare,
            dataType: state.isShowShare ? 'TV' : 'TA',
        })
        saveStateBfPopout({
            ...state,
            isShowShare: !state.isShowShare,
            dataType: state.isShowShare ? 'TV' : 'TA',
        })
    }
    const handleShowMeanGraph = () => {
        setState({ modal_mean_graph: !state.modal_mean_graph })
    }
    const functSolveTimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
        const reqIfMap = req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
    }
    const subcribeMrk = key => {
        const reqFunct = 'SUBSCRIBE-LIQUID-' + key + `__${component}`
        const msgObj2 = { Command: 'SUB', F1: key, F2: ['EFF_TOP', key] }
        on_subcribeIndexList([], component, reqFunct, msgObj2)
    }
    const unsubcribeMrk = key => {
        const msgObj2 = { Command: 'UNSUB', F1: key, F2: ['EFF_TOP', key] }
        on_unSubStkList(component, msgObj2)
    }

    return (
        <div className="card over-market" style={{ boxShadow: 'unset', marginBottom: 0, marginTop: 0, minWidth: 1000 }}>
            <div className="card-body " style={{ padding: '10px 15px' }}>
                {/* <LayoutHeader title={t('liquid_market_tab')} /> */}
                <div className="row">
                    <div className="col-md-8 padding5">
                        <LeftContent
                            handleChangeIndex={handleChangeIndex}
                            handleChangeTime={handleChangeTime}
                            handleShowMeanGraph={handleShowMeanGraph}
                            time_ChartData={state.time_ChartData}
                            isShowShare={state.isShowShare}
                            renderState={renderState}
                        />
                    </div>
                    <div className="col-md-4 padding5">
                        <RightContent
                            handleChangeTop={handleChangeTop}
                            isShowShare={state.isShowShare}
                            time_ChartData={state.time_ChartData}
                            renderState={renderState}
                            component={component}
                            get_value_from_glb_sv_seq={get_value_from_glb_sv_seq}
                        />
                    </div>
                </div>

                {/* modal ý nghĩa đồ thị */}
                {/* <Modal
                isOpen={this.state.modal_mean_graph}
                size={"md modal-notify"}
                onOpened={this.modalAfterOpened}>
                <ModalHeader toggle={(e) => this.setState({ modal_mean_graph: false })}>
                    {t('meaning_graph')}
                </ModalHeader>
                <ModalBody>
                    {t('Row_1_mean_graph_liquid')} <br />
                    {t('Row_2_mean_graph_liquid')} <br /><br />
                    {t('Row_last_mean_graph')}
                </ModalBody>
                <ModalFooter>
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <Button size="sm" block
                                    id="btn_okModalMeanGrph"
                                    autoFocus
                                    color="wizard"
                                    onClick={(e) => this.setState({ modal_mean_graph: false })}>
                                    <span>{t('common_Ok')}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModalFooter>
            </Modal> */}
            </div>
        </div>
    )
}

export default translate('translations')(MarketLiquidContainer)
