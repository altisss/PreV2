import React from 'react';
import glb_sv from '../../utils/globalSv/service/global_service'
import commuChanel from '../../constants/commChanel';
import LightChart from '../light-chart';
import uniqBy from 'lodash/uniqBy';

class ChartIntraday extends React.PureComponent {
    constructor(props) {
        super(props);
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.req_component = this.props.req_component

        this.GET_MORE_EPMSG = 'GET_MORE_EPMSG'
        this.state = {
            dataStock_line: [],
            dataStock_volume: []
        }
    }


    componentDidMount() {
        window.ipcRenderer.on(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`, (event, message) => {
            if (message === this.props.itemName) {
                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_chart_Map', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                    const dataChart = agrs.get(this.props.itemName);
                    const stkInfoMatchingChart = dataChart ? [...dataChart] : [];
                    if (stkInfoMatchingChart && stkInfoMatchingChart.length === 0) {
                        this.setState({ dataStock_line: 'no_data' });
                        return;
                    }
                    stkInfoMatchingChart.forEach(item => {
                        if (item[3] !== 'Ref') {
                            item[3] = this.props.t260;
                        }
                    });
                    stkInfoMatchingChart.shift();
                    this.convert2LightChartIntraday(stkInfoMatchingChart);
                })

            }
        })

        window.ipcRenderer.on(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`, (event, agrs) => {
            const reqInfoMap = agrs['reqInfoMap']
            if (reqInfoMap === null || reqInfoMap === undefined) { return; }
            if (reqInfoMap.reqFunct === this.GET_MORE_EPMSG) {

                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_chart_Map', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {

                    const dataChart = agrs.get(this.props.itemName);
                    let stkInfoMatchingChart = dataChart ? [...dataChart] : [];

                    if (stkInfoMatchingChart && stkInfoMatchingChart.length === 0) {
                        this.setState({ dataStock_line: 'no_data' });
                        return;
                    }
                    stkInfoMatchingChart.forEach(item => {
                        if (item[3] !== 'Ref') {
                            item[3] = this.props.t260;
                        }
                    });
                    stkInfoMatchingChart.shift()
                    this.convert2LightChartIntraday(stkInfoMatchingChart);
                })


            }
        })
        window.ipcRenderer.on(`${commuChanel.RESET_CHART_INTRADAY}_${this.component}`, (event, agrs) => {
            console.log(`${commuChanel.RESET_CHART_INTRADAY}_${this.component}`)
            this.setState({ dataStock_line: [], dataStock_volume: [] })
        })
    }

    componentWillReceiveProps(newProps) {
        if (newProps.t332 !== this.props.t332) {
        }
    }

    convert2LightChartIntraday = (data) => {
        const dataStock_line = [];
        const dataStock_volume = [];
        for (let index = 0; index < data.length; index++) {
          const timeStamp = glb_sv.dateToChartTimeMinute(new Date(data[index][0]));
          dataStock_line.push({ value: data[index][1], time: timeStamp });
          dataStock_volume.push({
            value: data[index][2],
            time: timeStamp,
            color: 'rgba(0, 150, 136, 0.5)'
          });
        }
        this.setState({ dataStock_line: uniqBy(dataStock_line, 'time')
        , dataStock_volume: dataStock_volume });
    }

    render() {
        if (this.state.dataStock_line === 'no_data') {
            return <div>{this.props.t('common_NoDataFound')}</div>
        }
        if (this.state.dataStock_line.length === 0) {
            return <div></div>
        }
        return (
            <LightChart 
                language={this.props.language}
                themePage={this.props.themePage}
                DATA_LINE={this.state.dataStock_line}
                DATA_VOLUME={this.state.dataStock_volume}
                component={this.component}
                width={this.props.width || 405}
                height={this.props.height || 193}
            />
        );
    }
}
export default ChartIntraday;
