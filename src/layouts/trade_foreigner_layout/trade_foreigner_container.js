import React from 'react'
import commuChanel from '../../constants/commChanel'
import { translate } from 'react-i18next'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import socket_sv from '../../utils/globalSv/service/socket_service'
import glb_sv from '../../utils/globalSv/service/global_service'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import LeftContent from './left_content'
import RightContent from './right_content'
import { getUniqueListBy } from '../../utils/utils_func'
import functionList from '../../constants/functionList'
import { on_subcribeIndexList, on_unSubStkList } from '../../utils/subcrible_functions'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv'
import { reply_send_req } from '../../utils/send_req'
import LayoutHeader from '../../conponents/layout_header'

function MarketLiquidContainer(props) {
    const { component, get_value_from_glb_sv_seq, get_rq_seq_comp, req_component, request_seq_comp } = props
    const { t } = props
    const [state, setState] = React.useState({
        isShowShare: false,
        isShowHNXShare: true,
        isShowUPCShare: true,
        time_ChartData: '1D',
        index: 'HSX',
        indexNum: '01',
        dataType: 'FV', // KLGD: FV, GTGD: FA
        heightTable: 515,
        modal_mean_graph: false,
    })
    const [storeState, setStoreState] = React.useState({
        //State lưu trữ
        dataVAL_RoomMarket: [],
        dataVOL_RoomMarket: [],
    })

    const [renderState, setRenderState] = React.useState({
        // Các state dùng hiển thị
        dataCurrentTable: [],
        bubbleStateData: [],
        barStateData: [],
    })

    const getMktInfo_ForeMarket_FunctNm = 'getMktInfo_ForeMarket_FunctNm'

    let temp = {}
    let tempData = []

    React.useEffect(() => {
        let tempData = []
        console.log('Gọi useEffect lấy dữ liệu ')
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
                    console.error('Foreigner err parse message', err)
                    return
                }
                tempData = getUniqueListBy(tempData.concat(jsondata), 'StkCd')
                // console.log('LiquidMarket', message.MsgKey, data);
                if (message.Data.length !== 0) {
                    // console.log(JSON.parse(message.Data));
                    if (state.dataType === 'FV') {
                        if (
                            message.MsgKey === '01|FRG_QTY_UP' ||
                            message.MsgKey === '03|FRG_QTY_UP' ||
                            message.MsgKey === '05|FRG_QTY_UP'
                        ) {
                            setStoreState({ ...storeState, dataVOL_RoomMarket: tempData })
                        }
                    }
                    if (state.dataType === 'FA') {
                        if (
                            message.MsgKey === '01|FRG_VAL_UP' ||
                            message.MsgKey === '03|FRG_VAL_UP' ||
                            message.MsgKey === '05|FRG_VAL_UP'
                        ) {
                            setStoreState({ ...storeState, dataVAL_RoomMarket: tempData })
                        }
                    }
                } else {
                    console.log('Socket dữ liệu rỗng')
                    return
                }
            })
        } else {
            window.ipcRenderer.on(`${commuChanel.reply_send_req}_${component}`, (event, agrs) => {
                reply_send_req(agrs, req_component)
            })
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
                component: component,
                value: 'dataRoomMarkettop',
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

        return () => {
            unsubcribeMrk(state.index)
            window.ipcRenderer.removeAllListeners(`${commuChanel.event_ClientReqMRKRcv}_${component}`)
            window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${component}`)
        }
    }, [state.indexNum, state.time_ChartData, state.dataType])

    const get_data = (dataKLGD = [], dataGTGD = []) => {
        if (state.dataType === 'FV') {
            if (dataKLGD === null || dataKLGD.length === 0) {
                getMktInfo_MktInfo(state.indexNum, state.time_ChartData, state.dataType)
            } else {
                setStoreState({ ...storeState, dataVOL_RoomMarket: dataKLGD })
            }
        } else if (state.dataType === 'FA') {
            if (dataGTGD === null || dataGTGD.length === 0) {
                getMktInfo_MktInfo(state.indexNum, state.time_ChartData, state.dataType)
            } else {
                setStoreState({ ...storeState, dataVAL_RoomMarket: dataGTGD })
            }
        }
    }

    React.useEffect(() => {
        if (state.dataType === 'FA') {
            setRenderState({
                ...renderState,
                dataCurrentTable: storeState.dataVAL_RoomMarket,
                bubbleStateData: storeState.dataVAL_RoomMarket,
                barStateData: storeState.dataVAL_RoomMarket,
            })
        } else {
            setRenderState({
                ...renderState,
                dataCurrentTable: storeState.dataVOL_RoomMarket,
                bubbleStateData: storeState.dataVOL_RoomMarket,
                barStateData: storeState.dataVOL_RoomMarket,
            })
        }
    }, [storeState.dataVAL_RoomMarket, storeState.dataVOL_RoomMarket])

    const getMktInfo_MktInfo = (index, time, type) => {
        // -- push request to request hashmap
        let reqInfo = new requestInfo()
        let svInputPrm = new serviceInputPrm()
        const request_seq_comp = get_rq_seq_comp()
        // -- service info
        reqInfo.reqFunct = getMktInfo_ForeMarket_FunctNm + type
        reqInfo.component = component
        reqInfo.receiveFunct = handle_getMktInfo_MKRoom
        reqInfo.inputParam = svInputPrm.InVal

        // svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
        svInputPrm.WorkerName = 'ALTqMktInfo01'
        svInputPrm.ServiceName = 'ALTqMktInfo01_MktInfo'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['1', index, time, type, '-1']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        // socket_sv.send2Sv(socket _sv.key_ClientReq, JSON.stringify(svInputPrm));

        temp['getMktInfo_MktInfo_ReqTimeOut' + type] = setTimeout(
            functSolveTimeOut,
            functionList.reqTimeout,
            request_seq_comp
        )

        req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq,
            },
            svInputPrm: svInputPrm,
        })
    }

    const handle_getMktInfo_MKRoom = (reqInfoMap, message) => {
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

        clearTimeout(temp['getMktInfo_MktInfo_ReqTimeOut' + state.dataType])
        if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
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
                    '',
                    this.component
                )
            }
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
                reqInfoMap.procStat = 2
                //glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
                tempData = tempData.map(item => {
                    return {
                        Cap: item.c13,
                        ChgRatio: Number(item.c11) * 100,
                        HighPri: item.c6,
                        LowPri: item.c4,
                        TradVal: item.c9,
                        TradVol: item.c8,
                        StkCd: item.c3,
                        FBV: item.c14,
                        FSV: item.c15,
                        FBA: item.c16,
                        FSA: item.c17,
                    }
                })
                tempData.sort(compareListQty)
                tempData = getUniqueListBy(tempData, 'StkCd')

                const sq = get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {
                    component: component,
                    value: 'dataRoomMarkettop',
                    sq: sq,
                })
                window.ipcRenderer.once(
                    `${commuChanel.reply_get_value_from_glb_sv}_${component}_${sq}`,
                    (event, agrs) => {
                        if (state.dataType === 'FV') {
                            setStoreState({ ...storeState, dataVOL_RoomMarket: tempData })
                            if (agrs[state.time_ChartData] === undefined) return
                            if (state.index === 'HSX') {
                                agrs[state.time_ChartData].dataKLGD_HSX = tempData.slice()
                                update_value_for_glb_sv({ component: component, key: 'dataRoomMarkettop', value: agrs })
                            }
                            if (state.index === 'HNX') {
                                agrs[state.time_ChartData].dataKLGD_HNX = tempData.slice()
                                update_value_for_glb_sv({ component: component, key: 'dataRoomMarkettop', value: agrs })
                            }
                            if (state.index === 'UPC') {
                                agrs[state.time_ChartData].dataKLGD_UPC = tempData.slice()
                                update_value_for_glb_sv({ component: component, key: 'dataRoomMarkettop', value: agrs })
                            }
                        }
                        if (state.dataType === 'FA') {
                            setStoreState({ ...storeState, dataVAL_RoomMarket: tempData })
                            if (agrs[state.time_ChartData] === undefined) return
                            if (state.index === 'HSX') {
                                agrs[state.time_ChartData].dataGTGD_HSX = tempData.slice()
                                update_value_for_glb_sv({ component: component, key: 'dataRoomMarkettop', value: agrs })
                            }
                            if (state.index === 'HNX') {
                                agrs[state.time_ChartData].dataGTGD_HNX = tempData.slice()
                                update_value_for_glb_sv({ component: component, key: 'dataRoomMarkettop', value: agrs })
                            }
                            if (state.index === 'UPC') {
                                agrs[state.time_ChartData].dataGTGD_UPC = tempData.slice()
                                update_value_for_glb_sv({ component: component, key: 'dataRoomMarkettop', value: agrs })
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
    }
    const handleChangeTime = time_ChartData => {
        setState({
            ...state,
            time_ChartData: time_ChartData,
        })
    }
    const handleChangeTop = () => {
        setState({
            ...state,
            isShowShare: !state.isShowShare,
            dataType: state.isShowShare ? 'FV' : 'FA',
        })
    }
    const handleShowMeanGraph = () => {
        setState({ ...state, modal_mean_graph: !state.modal_mean_graph })
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
        const reqFunct = 'SUBSCRIBE-ROOM-' + key + `__${component}`
        const msgObj2 = { Command: 'SUB', F1: key, F2: ['FRG_TOP', key] }
        on_subcribeIndexList([], component, reqFunct, msgObj2)
    }

    const unsubcribeMrk = key => {
        const msgObj2 = { Command: 'UNSUB', F1: key, F2: ['FRG_TOP', key] }
        on_unSubStkList(component, msgObj2)
    }

    const compareListQty = (a, b) => {
        if (Number(a.FBV) - Number(a.FSV) < Number(b.FBV) - Number(b.FSV)) {
            return 1
        }
        if (Number(a.FBV) - Number(a.FSV) > Number(b.FBV) - Number(b.FSV)) {
            return -1
        }
        return 0
    }

    return (
        <div className="card over-market" style={{ boxShadow: 'unset', marginBottom: 0, minWidth: 1000 }}>
            <div className="card-body" style={{ padding: '10px 15px' }}>
                {/* <LayoutHeader title={t('trade_foreigner_tab')} /> */}
                <div className="row">
                    <div className="col-md-7 padding5">
                        <LeftContent
                            t={t}
                            handleChangeIndex={handleChangeIndex}
                            handleChangeTime={handleChangeTime}
                            handleShowMeanGraph={handleShowMeanGraph}
                            time_ChartData={state.time_ChartData}
                            isShowShare={state.isShowShare}
                            renderState={renderState}
                        />
                    </div>

                    <div className="col-md-5 padding5">
                        <RightContent
                            t={t}
                            handleChangeTop={handleChangeTop}
                            isShowShare={state.isShowShare}
                            time_ChartData={state.time_ChartData}
                            renderState={renderState}
                            heightTable={state.heightTable}
                            component={component}
                            get_value_from_glb_sv_seq={get_value_from_glb_sv_seq}
                        />
                    </div>
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
    )
}

export default translate('translations')(MarketLiquidContainer)
