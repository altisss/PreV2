import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import socket_sv from '../../utils/globalSv/service/socket_service'
import glb_sv from '../../utils/globalSv/service/global_service'
import { requestInfo } from '../../utils/globalSv/models/requestInfo'
import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme'
import { change_language } from '../../utils/change_language'
import { bf_popout } from '../../utils/bf_popout'
import { reply_send_req } from '../../utils/send_req'
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm'
import FormatNumber from '../../conponents/formatNumber/FormatNumber'
import { inform_broadcast } from '../../utils/broadcast_service'
import { CSVLink } from 'react-csv'
import { UncontrolledTooltip } from 'reactstrap'
import { ReactComponent as IconExcel } from '../../conponents/translate/icon/excel.svg'
import functionList from '../../constants/functionList'
import PerfectScrollbar from 'react-perfect-scrollbar'

const remote = require('electron').remote

class AdvertisOrder extends PureComponent {
    constructor(props) {
        super(props)
        // Khai báo bắt buộc trong layout chính
        this.request_seq_comp = 0
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        }
        this.popin_window = this.popin_window.bind(this)
        this.req_component = new Map()

        // event dóng tab
        if (this.props.node) {
            this.props.node.setEventListener('close', p => {
                window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
                window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.ESC_KEY}_${this.component}`)
            })
        }
        // Khai báo data layout
        this.state = {
            name: this.props.name,
            data: [],
            columns: this.columnsH,
            dataCSV: [],
            tooltipOpen_csv: false,

            themePage: this.props.themePage,
            language: this.props.language,
        }
    }

    advtOrdListTemple = []
    getadvtOrderlistFlag = false
    getadvtOrderlist_FunctNm = 'ADVTODERSCR_001'

    columnsH = [
        {
            Header: 'No.',
            accessor: 'c00',
            show: true,
            // width: 55,
            headerClassName: 'text-center',
            className: 'text-center',
        },
        {
            Header: 'time',
            accessor: 'c0',
            show: true,
            // width: 82,
            headerClassName: 'text-center',
            className: 'text-center',
            Cell: cellInfo => <>{this.transTime(cellInfo.original['c0'])}</>,
        },
        {
            Header: 'common_securities_code',
            accessor: 'c1',
            show: true,
            // width: 115,
            headerClassName: 'text-center',
            className: 'text-center',
        },
        {
            Header: 'common_exchanges',
            accessor: 'c15',
            show: true,
            // width: 81,
            headerClassName: 'text-center',
            className: 'text-center',
        },
        {
            Header: 'short_symbol',
            accessor: 'c2',
            show: true,
            // width: 75,
            headerClassName: 'text-center',
            className: 'text-center',
        },
        // { Header: "symbol", accessor: "c14", show: true, width: 330, headerClassName: 'text-center', className: 'text-left' },
        {
            Header: 'sell_buy_tp',
            accessor: 'c3',
            show: true,
            // width: 86,
            headerClassName: 'text-center',
            className: 'text-center',
            Cell: cellInfo => (
                <span className={cellInfo.original['c3'] === '2' ? 'sellColor' : 'buyColor'}>
                    {cellInfo.original['c3'] === '1' ? this.props.t('buy_order') : this.props.t('sell_order')}
                </span>
            ),
        },
        {
            Header: 'qty',
            accessor: 'c4',
            show: true,
            // width: 100,
            headerClassName: 'text-center',
            className: 'text-right',
            Cell: cellInfo => <>{FormatNumber(cellInfo.original['c4'])}</>,
        },
        {
            Header: 'price',
            accessor: 'c5',
            show: true,
            // width: 72,
            headerClassName: 'text-center',
            className: 'text-right',
            Cell: cellInfo => <>{FormatNumber(cellInfo.original['c5'])}</>,
        },
        {
            Header: 'contact_info',
            accessor: 'c6',
            show: true,
            headerClassName: 'text-center',
            className: 'text-center',
        },
    ]
    headersCSV = [
        { label: this.props.t('place_order_time'), key: 'c0' },
        { label: this.props.t('common_securities_code'), key: 'c1' },
        { label: this.props.t('common_exchanges'), key: 'c2' },
        { label: this.props.t('symbol'), key: 'c3' },
        { label: this.props.t('symbol_name'), key: 'c4' },
        { label: this.props.t('sell_buy_tp'), key: 'c5' },
        { label: this.props.t('qty'), key: 'c6' },
        { label: this.props.t('price'), key: 'c7' },
        { label: this.props.t('contact_info'), key: 'c8' },
    ]
    transDataCSV(arr) {
        const data = arr.map(item => {
            let data = {},
                c0 = item.c0
            if (c0.length >= 6) {
                c0 = c0.substr(0, 2) + ':' + c0.substr(2, 2) + ':' + c0.substr(4)
            }
            data.c0 = c0
            data.c1 = "'" + item.c1
            data.c2 = item.c15
            data.c3 = item.c2
            data.c4 = item.c14
            data.c5 = item.c3 === '1' ? this.props.t('buy_order') : this.props.t('sell_order')
            data.c6 = item.c4
            data.c7 = item.c5
            data.c8 = ' ' + item.c6
            return data
        })
        this.setState({ dataCSV: data })
    }

    componentWillMount() {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            // update state after popout window
            this.setState(agrs.state)
            this.setState({
                parent_id: agrs.parent_id,
                config: agrs.config,
            })
            change_theme(this.state.themePage)
            change_language(this.state.language, this.props)
        })

        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // update state after popin window
            this.setState(agrs.state)
        })
    }

    popin_window() {
        const current_window = remote.getCurrentWindow()
        window.ipcRenderer.send(commuChanel.popin_window, { state: this.state, component: this.component })
        current_window.close()
    }

    componentDidMount() {
        this.getadvtOrderList()
        const modal = document.querySelector('.flexlayout__tab')
        modal.classList.add('width_table')

        window.ipcRenderer.on(`${commuChanel.ESC_KEY}_${this.component}`, (event, message) => {
            const msg = { type: commuChanel.ACTION_SUCCUSS, component: this.component }
            inform_broadcast(commuChanel.ACTION_SUCCUSS, msg)
        })
        //
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
            reply_send_req(agrs, this.req_component)
        })
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    }

    handle_getMktInfo_MKInfo = (reqInfoMap, message) => {
        if (message != null) {
            clearTimeout(this.getadvtOrderlistFunct_ReqTimeOut)
            if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
                return
            }
            // -- process after get result --
            const errmsg = message['Message']
            if (Number(message['Result']) === 0) {
                reqInfoMap.procStat = 2
                this.getadvtOrderlistFlag = false
                reqInfoMap.resSucc = false
                if (message['Code'] !== '080128') {
                    glb_sv.openAlertModal(
                        '',
                        'common_InfoMessage',
                        errmsg,
                        '',
                        'danger',
                        '',
                        false,
                        ' ',
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
                    jsondata = []
                }
                this.advtOrdListTemple = this.advtOrdListTemple.concat(jsondata)
                if (Number(message['Packet']) <= 0) {
                    reqInfoMap.procStat = 2
                    this.getadvtOrderlistFlag = false
                    if (this.advtOrdListTemple !== [] && this.advtOrdListTemple.length > 0) {
                        this.advtOrdListTemple = this.advtOrdListTemple.map((item, index) => {
                            item.c00 = index + 1
                            return item
                        })
                        this.transDataCSV(JSON.parse(JSON.stringify(this.advtOrdListTemple)))
                    }
                    this.setState({ data: this.advtOrdListTemple })
                }
            }
        }
    }

    solvingadvtOrder_TimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
        this.req_component.set(cltSeq, reqIfMap)
        if (reqIfMap.reqFunct === this.getadvtOrderlist_FunctNm) {
            this.getadvtOrderlistFlag = false
        }
        glb_sv.openAlertModal(
            '',
            'common_InfoMessage',
            'common_cant_connect_server',
            '',
            '',
            null,
            null,
            null,
            this.component
        )
    }

    // --- get orderlist function
    getadvtOrderList = () => {
        // -- call service for place order
        const request_seq_comp = this.get_rq_seq_comp()

        let reqInfo = new requestInfo()
        let svInputPrm = new serviceInputPrm()
        reqInfo.reqFunct = this.getadvtOrderlist_FunctNm
        reqInfo.component = this.component
        reqInfo.receiveFunct = this.handle_getMktInfo_MKInfo
        reqInfo.inputParam = svInputPrm.InVal

        svInputPrm.WorkerName = 'ALTqOrderCommon'
        svInputPrm.ServiceName = 'ALTqOrderCommon_0508_1'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['TODAY']
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getadvtOrderlistFunct_ReqTimeOut = setTimeout(
            this.solvingadvtOrder_TimeOut,
            functionList.reqTimeout,
            request_seq_comp
        )
        this.req_component.set(request_seq_comp, reqInfo)
        window.ipcRenderer.send(commuChanel.send_req, {
            req_component: {
                component: reqInfo.component,
                request_seq_comp: request_seq_comp,
                channel: socket_sv.key_ClientReq,
            },
            svInputPrm: svInputPrm,
        })
        this.advtOrdListTemple = []
    }

    getNewInformation = () => {
        this.getadvtOrderList()
    }

    transTime = value => {
        if (value.length < 5) return value
        else return value.substr(0, 2) + ':' + value.substr(2, 2) + ':' + value.substr(4, 2)
    }

    transTitle(item) {
        return {
            Header: this.props.t(item.Header),
            accessor: item.accessor,
            show: item.show,
            headerClassName: item.headerClassName,
            className: item.className,
            Cell: item.Cell,
            width: item.width,
        }
    }

    toggle = () => {
        this.setState({
            tooltipOpen_csv: !this.state.tooltipOpen_csv,
        })
    }

    render() {
        const { t } = this.props
        return (
            <div className="card" style={{ height: '100%' }}>
                <div className="card-body" style={{ padding: '10px 15px' }}>
                    <div className="row">
                        <div className="col-sm-12">
                            <PerfectScrollbar>
                                <div
                                    className="card-body widget-body"
                                    style={{ padding: '0', position: 'relative', maxHeight: 'calc(100vh - 150px)' }}
                                >
                                    <table className="tableNormal table_sticky table table-sm tablenowrap table-bordered table-striped">
                                        <thead className="header">
                                            <tr>
                                                {this.columnsH.map((thcell, index) => (
                                                    <th
                                                        style={{ width: thcell.width }}
                                                        className="text-center"
                                                        key={index}
                                                    >
                                                        {t(`${thcell.Header}`)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.data.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                        {index + 1}
                                                    </td>
                                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                        {item.c0}
                                                    </td>
                                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                        {item.c1}
                                                    </td>
                                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                        {item.c15}
                                                    </td>
                                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                        {item.c2}
                                                    </td>
                                                    <td className="text-left" style={{ verticalAlign: 'middle' }}>
                                                        <span
                                                            className={item.c3 === '2' ? 'sellColor' : 'buyColor'}
                                                        >
                                                            {item.c3 === '1' ? t('buy_order') : t('sell_order')}
                                                        </span>
                                                    </td>
                                                    <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                                        {FormatNumber(item.c4, 2, 0)}
                                                    </td>
                                                    <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                                        {FormatNumber(item.c5, 2, 0)}
                                                    </td>
                                                    <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                        {item.c6}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </PerfectScrollbar>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default translate('translations')(AdvertisOrder)
