import React, { PureComponent } from 'react'
import { translate } from 'react-i18next'
import commuChanel from '../../constants/commChanel'
import { change_theme } from '../../utils/change_theme'
import { change_language } from '../../utils/change_language'
import { reply_send_req } from '../../utils/send_req'
import { bf_popout } from '../../utils/bf_popout'
import PerfectScrollbar from 'react-perfect-scrollbar'
import uniqueId from 'lodash/uniqueId'
import FormatNumber from '../../conponents/formatNumber/FormatNumber'

import { Bubble, Pie } from 'react-chartjs-2'
import 'chartjs-plugin-datalabels'

import { max } from 'lodash'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { on_subcribeIndexList, on_unSubStkList } from '../../utils/subcrible_functions'
// import LayoutHeader from '../../conponents/layout_header'

// import dataTemp from './data.json';
const remote = require('electron').remote

class OwnForgeinerTab extends PureComponent {
    constructor(props) {
        super(props)
        this.request_seq_comp = 0
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        }
        this.popin_window = this.popin_window.bind(this)
        this.req_component = new Map()
        if (this.props.node) {
            this.props.node.setEventListener('close', p => {
                window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
                window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
                window.ipcRenderer.removeAllListeners(`${commuChanel.event_ClientReqMRKRcv}_${this.component}`)
            })
        }
        //Khai báo bắt buộc

        //Khai báo dùng trong layout
        this.state = {
            name: this.props.name,
            isShowShare: true,
            isShowHNXShare: true,
            isShowUPCShare: true,
            time_ChartData: '1D',
            index: 'HSX',
            dataBubble: { datasets: [], labels: [] },
            dataPieStk: { datasets: [], labels: [] },
            data: [],
            qtyPieHsx: { datasets: [], labels: [] },
            valuePieHsx: { datasets: [], labels: [] },
            modal_mean_graph: false,
            activeTab_top: '1',
            activeTab_bot: '4',
            stkcd: '',

            language: this.props.language,
            themePage: this.props.themePage,
            style: this.props.style,
        }
        this.index = 'HSX'
        this.optionsBubble = {
            // dataLabels: {
            //   enabled: true,
            //   formatter: function (val, opt) {
            //     return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
            //   },
            // },
            dataLabels: {
                enabled: false,
                // textAnchor: 'start',
                style: {
                    colors: ['#fff'],
                },
                formatter: 'asd',
            },

            fill: {
                opacity: 1,
                colors: ['red', '#E91E63', '#9C27B0'],
            },
            xaxis: {
                // tickAmount: 15,
                type: 'category',
                colors: ['#d0cece'],
                labels: {
                    show: false,
                },
                // categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
                //   'United States', 'China', 'India'
                // ],
            },
            yaxis: {
                colors: '#d0cece',
                title: {
                    text: 'GTGD (Tỷ)',
                },
            },
            theme: {
                mode: 'dark',
            },
            legend: {
                show: false,
            },
            tooltip: {
                x: {
                    show: false,
                    title: {
                        formatter: seriesName => seriesName,
                    },
                },
                y: {
                    // show: true,
                    title: 'GTGD: ',
                },
                z: {
                    // show: false,
                    title: 'Vốn hóa: ',
                },
            },
        }
        this.dataGTGD = []
        this.dataKLGD = []
        this.type = 'ST'

        this.data_ST = []
        this.data_BO = []
        this.data_CW = []
        this.data_MF = []
        this.data_EF = []
    }

    componentWillMount() {
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event, agrs) => {
            // update state after popout window
            // this.setState(agrs.state)
            this.setState({
                parent_id: agrs.parent_id,
                config: agrs.config,
            })
            this.subcribeMrk(this.state.index)
            change_theme(this.state.themePage)
            // change_language(this.state.language, this.props)
        })

        window.ipcRenderer.once(`${this.component}`, (event, agrs) => {
            // update state after popin window
            this.setState(agrs.state)
        })
        // if (this.subcr_ClientReqRcv) this.subcr_ClientReqRcv.unsubscribe();
    }

    componentDidMount() {
        // --- Start Test ------------
        // const data = dataTemp;
        // data.forEach(item => item.TRR = (item.TR - item.R) / item.Listed);
        // data.sort(this.compareList);
        // this.data_ST = data.filter(item => item.ST === 'ST');
        // this.data_BO = data.filter(item => item.ST === 'BO');
        // this.data_CW = data.filter(item => item.ST === 'CW');
        // this.data_MF = data.filter(item => item.ST === 'MF');
        // this.data_EF = data.filter(item => item.ST === 'EF');
        // this.handleChangeType();
        // ---End Test ------------
        if (this.props.node) this.subcribeMrk(this.state.index)

        window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
            this.popin_window()
        })

        window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
            window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
        })

        window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
            bf_popout(this.component, this.props.node, undefined)
        })

        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            console.log('this.req_component', JSON.stringify(this.req_component))
            reply_send_req(agrs, this.req_component)
        })

        window.ipcRenderer.on(`${commuChanel.event_ClientReqMRKRcv}_${this.component}`, (event, message) => {
            let data = []
            try {
                data = JSON.parse(message.Data)
            } catch (err) {
                console.error('room own parse message', err)
                return
            }
            // console.log(message.Data);
            // this.total_qty_foreiger = 0;
            // this.total_value_foreiger = 0;
            // this.total_qty_hsx = 0;
            // this.total_value_hsx = 0;
            data.forEach(item => (item.TRR = (item.TR - item.R) / item.Listed))
            data.sort(this.compareList)
            this.data_ST = data.filter(item => item.ST === 'ST')
            this.data_BO = data.filter(item => item.ST === 'BO')
            this.data_CW = data.filter(item => item.ST === 'CW')
            this.data_MF = data.filter(item => item.ST === 'MF')
            this.data_EF = data.filter(item => item.ST === 'EF')
            if (message.MsgKey === '01|FRG_MKT_SHARE') {
                this.handleChangeType()
            }
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs)
            // glb_sv.themePage = agrs
            this.setState({ themePage: agrs })
            this.handleChangeType()
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
            change_language(agrs, this.props)
            // glb_sv.language = agrs
            this.setState({ language: agrs })
        })
    }

    popin_window() {
        const current_window = remote.getCurrentWindow()
        const state = {
            parent_id: this.state.parent_id,
            config: this.state.config,
            name: this.state.name,
            component: this.state.component,
        }
        window.ipcRenderer.send(commuChanel.popin_window, { state: state, component: this.component })
        current_window.close()
    }

    functSolveTimeOut = cltSeq => {
        if (cltSeq === null || cltSeq === undefined || isNaN(Number(cltSeq))) {
            return
        }
        // const reqIfMap = glb_sv.getReqInfoMapValue(cltSeq);
        const reqIfMap = this.req_component.get(cltSeq)
        if (reqIfMap === null || reqIfMap === undefined || reqIfMap.procStat !== 0) {
            return
        }
        const timeResult = new Date()
        reqIfMap.resTime = timeResult
        reqIfMap.procStat = 4
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        // if (this.subcr_ClientReqRcv) this.subcr_ClientReqRcv.unsubscribe();
        this.unsubcribeMrk(this.state.index)
    }

    subcribeMrk = key => {
        const msgObj2 = { Command: 'SUB', F1: 'HSX', F2: ['FRG_MKT_SHARE', 'HSX'] }
        const reqFunct = 'SUBSCRIBE-OWN-FORE'
        on_subcribeIndexList([], this.component, reqFunct, msgObj2)
        // on_subcribeMrk(this.component, reqFunct, msgObj2)
    }

    unsubcribeMrk = key => {
        // const reqFunct = 'SUBSCRIBE-OWN-FORE'
        const msgObj2 = { Command: 'UNSUB', F1: 'HSX', F2: ['FRG_MKT_SHARE', 'HSX'] }
        // on_unsubcribeMrk(this.component, reqFunct, msgObj2)
        on_unSubStkList(this.component, msgObj2)
        // console.log(stkList);
    }

    getMax(arr) {
        let len = arr.length,
            max = -Infinity
        while (len--) {
            if (arr[len][4] > max) {
                max = arr[len]
            }
        }
        return max
    }

    getColor(data, themePage, style) {
        // console.log(data);
        if (typeof data === 'string') return style[themePage].price_basic_color
        const value = Number(data.ChgRt)
        if (value < 0) {
            return style[themePage].price_basic_less
        }
        if (value === 0) {
            return style[themePage].price_basic_color
        }
        if (value > 0) {
            return style[themePage].price_basic_over
        }
    }

    compareList(a, b) {
        if (Number(a.TRR) < Number(b.TRR)) {
            return 1
        }
        if (Number(a.TRR) > Number(b.TRR)) {
            return -1
        }
        return 0
    }

    setWidthBar() {
        const elm = document.getElementsByClassName('chartjs-render-monitor')
        if (elm && elm[0]) {
            setTimeout(() => (elm[0].style.height = '376px'), 500)
        }
    }

    delayChangeTime(data_temp, changeStk) {
        const themePage = this.state.themePage
        const style = this.state.style
        const data = data_temp.slice()

        data.forEach(item => {
            this.total_qty_foreiger += item.TR - item.R
            this.total_qty_hsx += item.Listed
            this.total_value_foreiger += (item.TR - item.R) * item.CR
            this.total_value_hsx += item.Listed * item.CR
        })
        const ratioTotalQtyForeiger = (this.total_qty_foreiger / this.total_qty_hsx) * 100
        const ratioTotalValueForeiger = (this.total_value_foreiger / this.total_value_hsx) * 100
        // console.log(this.total_qty_foreiger,this.total_qty_hsx,this.total_value_foreiger,this.total_value_hsx);
        const objValuesOverZero = data.map(item => {
            return Number(item.Cap)
        })
        const maxValue = max(objValuesOverZero)

        const range = [15, 50]
        const datasets = data.map((item, index) => {
            return {
                label: item.StkCd,
                data: [
                    {
                        x: index + 1,
                        y: Number(item.Cap),
                        r: this.scaleRadius(Number(item.Cap), maxValue, range),
                    },
                ],
                backgroundColor: this.getColor(item, themePage, style),
            }
        })
        const dataBubble = {
            label: [''],
            datasets,
        }
        let stkcd
        if (this.state.stkcd === '' || changeStk === true) {
            stkcd = data[0].StkCd
            this.setState({ stkcd })
        } else stkcd = this.state.stkcd

        const dataStk = data.find(item => item.StkCd === stkcd)
        const datasetsPie = [
            {
                fill: true,
                backgroundColor: [
                    style[themePage].ownForeginer.colorDomestic,
                    style[themePage].ownForeginer.colorForeigner,
                ],
                data: [Number(FormatNumber(100 - dataStk.TRR * 100, 2)), Number(FormatNumber(dataStk.TRR * 100, 2))],
                label: [this.props.t('domestic'), this.props.t('foreign')],
                borderColor: ['black', 'black'],
                borderWidth: [0, 0],
            },
        ]
        const dataPieStk = {
            label: [this.props.t('domestic'), this.props.t('foreign')],
            datasets: datasetsPie,
        }

        const qtyPieHsx = {
            label: [this.props.t('domestic'), this.props.t('foreign')],
            datasets: [
                {
                    fill: true,
                    backgroundColor: [
                        style[themePage].ownForeginer.colorDomestic,
                        style[themePage].ownForeginer.colorForeigner,
                    ],
                    data: [
                        Number(FormatNumber(100 - ratioTotalQtyForeiger, 2)),
                        Number(FormatNumber(ratioTotalQtyForeiger, 2)),
                    ],
                    label: [this.props.t('domestic'), this.props.t('foreign')],
                    borderColor: ['black', 'black'],
                    borderWidth: [0, 0],
                },
            ],
        }
        const valuePieHsx = {
            label: [this.props.t('domestic'), this.props.t('foreign')],
            datasets: [
                {
                    fill: true,
                    backgroundColor: [
                        style[themePage].ownForeginer.colorDomestic,
                        style[themePage].ownForeginer.colorForeigner,
                    ],
                    data: [
                        Number(FormatNumber(100 - ratioTotalValueForeiger, 2)),
                        Number(FormatNumber(ratioTotalValueForeiger, 2)),
                    ],
                    label: [this.props.t('domestic'), this.props.t('foreign')],
                    borderColor: ['black', 'black'],
                    borderWidth: [0, 0],
                },
            ],
        }
        // console.log(this.type,qtyPieHsx,valuePieHsx);
        this.setState({ dataBubble, dataPieStk, qtyPieHsx, valuePieHsx })
    }

    handleShowMeanGraph = () => {
        this.setState({ modal_mean_graph: true })
    }

    modalAfterOpened = () => {
        const elm = document.getElementById('btn_okModalMeanGrph')
        if (elm) elm.focus()
    }

    toggle(key, tab) {
        if (tab === 'top') {
            this.setState({ activeTab_top: key + '' })
        } else {
            this.setState({ activeTab_bot: key + '' })
        }
    }

    handleChangeType = e => {
        const type = e ? e.target.value : this.type
        let changeStk = false
        if (e) changeStk = true
        this.type = type
        this.total_qty_foreiger = 0
        this.total_qty_hsx = 0
        this.total_value_foreiger = 0
        this.total_value_hsx = 0
        if (type === 'ST') {
            this.setState({ data: this.data_ST })

            this.delayChangeTime(this.data_ST, changeStk)
        }
        if (type === 'BO') {
            this.setState({ data: this.data_BO })
            this.delayChangeTime(this.data_BO, changeStk)
        }
        if (type === 'CW') {
            this.setState({ data: this.data_CW })
            this.delayChangeTime(this.data_CW, changeStk)
        }
        if (type === 'MF') {
            this.setState({ data: this.data_MF })
            this.delayChangeTime(this.data_MF, changeStk)
        }
        if (type === 'EF') {
            this.setState({ data: this.data_EF })
            this.delayChangeTime(this.data_EF, changeStk)
        }
    }

    scaleRadius(value, maxValue, range) {
        const tl = (value / maxValue) * range[1]
        if (tl >= range[0]) return tl
        else return range[0]
    }

    optionsPieChart(title) {
        const style = this.state.style
        const themePage = this.state.themePage
        return {
            // responsive: true,
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: title,
                position: 'top',
                fontSize: 20,
                fontColor: style[themePage].ownForeginer.colorTitle,
            },
            plugins: {
                datalabels: {
                    color: style[themePage].ownForeginer.colordatalabels,
                    font: {
                        size: 10,
                    },
                    formatter: function(value, context) {
                        if (value === 0) return ''
                        return context.dataset.label[context.dataIndex] + ': ' + value + '%'
                    },
                    padding: 10,
                },
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    title: function(tooltipItem, data) {},
                    label: function(tooltipItem, data) {},
                    afterLabel: function(tooltipItem, data) {},
                },
            },
            aspectRatio: false,
        }
    }

    handleChangeStk(stkcd) {
        if (this.timeoutChangeStk) clearTimeout(this.timeoutChangeStk)
        this.timeoutChangeStk = setTimeout(() => {
            const data = this.state.data.slice()
            const dataStk = data.find(item => item.StkCd === stkcd)
            const datasetsPie = [
                {
                    fill: true,
                    backgroundColor: [
                        this.state.style[this.state.themePage].ownForeginer.colorDomestic,
                        this.state.style[this.state.themePage].ownForeginer.colorForeigner,
                    ],
                    data: [
                        Number(FormatNumber(100 - dataStk.TRR * 100, 2)),
                        Number(FormatNumber(dataStk.TRR * 100, 2)),
                    ],
                    label: [this.props.t('domestic'), this.props.t('foreign')],
                    borderColor: ['black', 'black'],
                    borderWidth: [0, 0],
                },
            ]
            const dataPieStk = {
                label: [this.props.t('domestic'), this.props.t('foreign')],
                datasets: datasetsPie,
            }
            this.setState({ dataPieStk, stkcd })
        }, 100)
    }

    render() {
        const { t } = this.props
        return (
            <div className="card over-market" style={{ boxShadow: 'unset', marginBottom: 0, minWidth: 1000 }}>
                <div className="card-body" style={{ padding: '10px 15px' }}>
                    {/* <LayoutHeader title={t('own_foreiger_tab')} /> */}
                    <div className="row">
                        <div className="col-md-6 padding5">
                            <Tabs>
                                <TabList>
                                    <Tab>{t('map_foregin')}</Tab>
                                    <Tab>{t('map_cap')}</Tab>
                                </TabList>
                                <TabPanel>
                                    <div className="row">
                                        <Pie
                                            data={this.state.dataPieStk}
                                            height={(window.innerHeight - 220) / 2}
                                            options={this.optionsPieChart(t('ratio_hold_fore') + this.state.stkcd)}
                                        />
                                    </div>
                                    <div className="row">
                                        <Tabs style={{ width: '100%', padding: '0 16px' }}>
                                            <TabList>
                                                <Tab>{t('qty_own_fore')}</Tab>
                                                <Tab>{t('value_own_fore')}</Tab>
                                            </TabList>
                                            <TabPanel>
                                                <Pie
                                                    data={this.state.qtyPieHsx}
                                                    height={(window.innerHeight - 260) / 2}
                                                    options={this.optionsPieChart(t('qty_own_fore_hsx'))}
                                                />
                                            </TabPanel>
                                            <TabPanel>
                                                <Pie
                                                    data={this.state.valuePieHsx}
                                                    height={(window.innerHeight - 260) / 2}
                                                    options={this.optionsPieChart(t('value_own_fore_hsx'))}
                                                />
                                            </TabPanel>
                                        </Tabs>
                                    </div>
                                </TabPanel>

                                <TabPanel>
                                    <Bubble
                                        data={this.state.dataBubble}
                                        height={window.innerHeight - 220}
                                        options={{
                                            responsive: true,
                                            legend: {
                                                display: false,
                                            },
                                            plugins: {
                                                datalabels: {
                                                    color: 'gray',
                                                    font: {
                                                        size: 9,
                                                    },
                                                    formatter: function(value, context) {
                                                        return context.dataset.label
                                                    },
                                                },
                                            },
                                            maintainAspectRatio: false,
                                            scales: {
                                                yAxes: [
                                                    {
                                                        ticks: {
                                                            // Include a dollar sign in the ticks
                                                            callback: function(value, index, values) {
                                                                return FormatNumber(value)
                                                            },
                                                            mirror: true,
                                                        },
                                                        scaleLabel: {
                                                            display: true,
                                                            labelString:
                                                                t('market_cap') + ' (' + t('billion') + ') VND',
                                                            fontSize: 15,
                                                            fontColor: '#d0cece',
                                                            fontStyle: 'italic',
                                                        },
                                                    },
                                                ],
                                                xAxes: [
                                                    {
                                                        display: false,
                                                        ticks: {
                                                            min: -2,
                                                            max: this.state.dataBubble.datasets.length + 2,
                                                        },
                                                    },
                                                ],
                                            },
                                            tooltips: {
                                                callbacks: {
                                                    title: function(tooltipItem, data) {
                                                        const index = tooltipItem[0].datasetIndex
                                                        return (
                                                            data.datasets[index].label +
                                                            ': ' +
                                                            FormatNumber(data.datasets[index].data[0].y, 2, 0) +
                                                            ' (' +
                                                            t('billion') +
                                                            ') VND'
                                                        )
                                                    },
                                                    label: function(tooltipItem, data) {},
                                                    afterLabel: function(tooltipItem, data) {},
                                                },
                                                backgroundColor: 'gray',
                                                titleFontSize: 13,
                                                titleFontColor: 'whitesmoke',
                                                bodyFontColor: 'gray',
                                                bodyFontSize: 12,
                                                displayColors: false,
                                            },
                                            aspectRatio: false,
                                        }}
                                    />
                                </TabPanel>
                            </Tabs>
                        </div>
                        <div className="col-md-6 padding5">
                            <div style={{ marginBottom: 5 }}>
                                <label>{t('common_exchanges')}</label>&nbsp;
                                <select disabled className="form-control-custom" onChange={this.handleChangeIndex}>
                                    <option value="HSX">VNI</option>
                                    <option value="HNX">HNX</option>
                                    <option value="UPC">UPCOM</option>
                                </select>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <label className="sellColor">{t('type_stock')}</label>&nbsp;
                                <select className="form-control-custom cursor_ponter" onChange={this.handleChangeType}>
                                    <option value="ST">ST. {t('stock')}</option>
                                    <option value="BO">BO. {t('bonds')}</option>
                                    <option value="CW">CW. {t('covered_warrant')}</option>
                                    <option value="MF">MF. {t('fund_certifi')}</option>
                                    <option value="EF">EF. ETF</option>
                                </select>
                            </div>
                            <div
                                className="card stockInfoExtent"
                                style={{ boxShadow: 'unset', marginBottom: 0, marginTop: -8 }}
                            >
                                <PerfectScrollbar>
                                    <div
                                        className="card-body widget-body"
                                        style={{
                                            padding: '0',
                                            position: 'relative',
                                            maxHeight: 'calc(100vh - 200px)',
                                        }}
                                    >
                                        <table className="tableNormal table_sticky table table-sm table-sm-market tablenowrap table-bordered table-striped">
                                            <thead className="header">
                                                <tr>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        {t('short_symbol')}
                                                    </th>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        +/-
                                                    </th>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        {t('vol_fore_owned')}
                                                    </th>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        {t('ratio_hold')}
                                                    </th>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        {t('total_foreign_room')}
                                                    </th>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        {t('qty_circulate')}
                                                    </th>
                                                    <th style={{ verticalAlign: 'middle' }} className="text-center">
                                                        {t('market_cap')} ({t('billion')})
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.data.map(item => (
                                                    <tr
                                                        className="room-own-row"
                                                        key={uniqueId('dataDetails')}
                                                        onClick={() => this.handleChangeStk(item.StkCd)}
                                                        style={{
                                                            backgroundColor:
                                                                item.StkCd === this.state.stkcd
                                                                    ? this.state.style[this.state.themePage].priceboard
                                                                          .background_focusrow
                                                                    : '',
                                                        }}
                                                    >
                                                        <td
                                                            className={
                                                                'text-center ' +
                                                                (Number(item.ChgRt) > 0
                                                                    ? 'price_basic_over'
                                                                    : Number(item.ChgRt) < 0
                                                                    ? 'price_basic_less'
                                                                    : 'price_basic_color')
                                                            }
                                                        >
                                                            {item.StkCd}
                                                        </td>
                                                        <td
                                                            className={
                                                                'text-right ' +
                                                                (Number(item.ChgRt) > 0
                                                                    ? 'price_basic_over'
                                                                    : Number(item.ChgRt) < 0
                                                                    ? 'price_basic_less'
                                                                    : 'price_basic_color')
                                                            }
                                                        >
                                                            {FormatNumber(Number(item.ChgRt), 2, 0)}%
                                                        </td>
                                                        <td className={'text-right '}>
                                                            {FormatNumber((item.TR - item.R) / 1000, 2, 0)}
                                                        </td>
                                                        <td className={'text-right '}>
                                                            {FormatNumber(Math.round(10000 * item.TRR) / 100, 2, 0)} %
                                                        </td>
                                                        <td className="text-right">
                                                            {FormatNumber(Number(item.R), 0, 0)}
                                                        </td>
                                                        <td className="text-right">{FormatNumber(item.TR, 0, 0)}</td>
                                                        <td className="text-right">
                                                            {FormatNumber(Number(item.Cap), 2, 0)}
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
            </div>
        )
    }
}

export default translate('translations')(OwnForgeinerTab)
