import React from 'react';
import glb_sv from "../../../utils/globalSv/service/global_service";
import commuChanel from '../../../constants/commChanel'
import LightChart from '../../../conponents/light-chart';
import uniqBy from 'lodash/uniqBy';

class ChartView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            dataStock_line: [],
            dataStock_volume: []
        }
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq

        
    }


    chartType = 'ComboChart';
    
    line_ChartData = [];
    objShareInfoIndex = [];

    componentDidMount() {
        
        const key = this.props.keyIndex;

        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['VN_INDEX', 'HNX_INDEX', 'UPCOM_INDEX', 'themePage', 'style'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const VN_INDEX = agrs.get('VN_INDEX')
            const HNX_INDEX = agrs.get('HNX_INDEX')
            const UPCOM_INDEX = agrs.get('UPCOM_INDEX')
            const themePage = agrs.get('themePage')
            const style = agrs.get('style')
            if (key === 'VN_INDEX') {
                this.objShareInfoIndex = VN_INDEX;
                // if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                //     if (this.objShareInfoIndex['indexArr'].length === 1) {
                //         this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, VN_INDEX['ref']]);
                //     }
                //     if (this.objShareInfoIndex['indexArr'].length > 2) {
                //         this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                //     }
                //     const line_ChartOptions = this.line_ChartOptions(themePage, style)
                //     this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions:  line_ChartOptions}) ;
                // } else {
                //     this.objShareInfoIndex['indexArr'] = [['Time', 'VNI', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, VN_INDEX['ref']]];
                //     const line_ChartOptions = this.line_ChartOptions(themePage, style)
                //     this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions })
                // }
                // console.log(this.objShareInfoIndex)
                this.convert2LightChartIntraday([...this.objShareInfoIndex['indexArr']]);

            } else if (key === 'HNX_INDEX') {
                this.objShareInfoIndex = HNX_INDEX;
                // if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                //     this.objShareInfoIndex['indexArr'] = this.objShareInfoIndex['indexArr'];
                //     if (this.objShareInfoIndex['indexArr'].length === 1) {
                //         this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, HNX_INDEX['ref']]);
                //     }
                //     if (this.objShareInfoIndex['indexArr'].length > 2) {
                //         this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                //     }
                //     const line_ChartOptions = this.line_ChartOptions(themePage, style)
                //     // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions };
                //     this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions })
                // } else {
                //     this.objShareInfoIndex['indexArr'] = [['Time', 'HNX', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, HNX_INDEX['ref']]];
                //     const line_ChartOptions = this.line_ChartOptions(themePage, style)
                //     // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                //     this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                // }
                this.convert2LightChartIntraday([...this.objShareInfoIndex['indexArr']]);
            } else if (key === 'UPCOM_INDEX') {
                this.objShareInfoIndex = UPCOM_INDEX;
                // if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                //     this.objShareInfoIndex['indexArr'] = this.objShareInfoIndex['indexArr'];
                //     if (this.objShareInfoIndex['indexArr'].length === 1) {
                //         this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, UPCOM_INDEX['ref']]);
                //     }
                //     if (this.objShareInfoIndex['indexArr'].length > 2) {
                //         this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                //     }
                //     const line_ChartOptions = this.line_ChartOptions(themePage, style)
                //     // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                //     this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                // } else {
                //     this.objShareInfoIndex['indexArr'] = [['Time', 'UPCOM', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, UPCOM_INDEX['ref']]];
                //     const line_ChartOptions = this.line_ChartOptions(themePage, style)
                //     // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                //     this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                // }
                this.convert2LightChartIntraday([...this.objShareInfoIndex['indexArr']]);
            }
        })

        window.ipcRenderer.on(`${commuChanel.event_ServerPushIndexChart}_${this.component}`, (event, message) => {
            // console.log(message, this.props.keyIndex)
            if (message === this.props.keyIndex) {
                const sq= this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: message, sq:sq})
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                    this.objShareInfoIndex = agrs
                    if (
                        this.objShareInfoIndex['indexArr'] &&
                        this.objShareInfoIndex['indexArr'].length > 0
                    ) {
                        if (this.state.line_ChartData.length !== (this.objShareInfoIndex['indexArr'].length + 1)) {
                            // this.line_ChartData = [...this.objShareInfoIndex['indexArr']];
                            // this.setState({ line_ChartData: this.line_ChartData });
                            this.convert2LightChartIntraday([...this.objShareInfoIndex['indexArr']]);
                        }
                    }
                })
                
            }
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            const sq= this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['themePage', 'style'], sq:sq})
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const themePage = agrs.get('themePage')
                const style = agrs.get('style')
                
            })
            
        })


        this.timeout = setTimeout(() => {
            this.line_ChartData = JSON.parse(JSON.stringify(this.objShareInfoIndex['indexArr']));
            this.setState({ line_ChartData: this.line_ChartData  });
            // console.log('error loi setstate',this)
        },3000);

    }

    componentWillUnmount() {
        if (this.timeout) clearTimeout(this.timeout);
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
        console.log('convert2LightChartIntraday',dataStock_line, data)
        this.setState({ dataStock_line: uniqBy(dataStock_line, 'time')
        , dataStock_volume: dataStock_volume });
    }

    render() {

        if (this.state.dataStock_line.length === 0) {
            return <div></div>
        }
        return (
                <div className="clearfix indexChart">
                    <LightChart 
                        language={''}
                        DATA_LINE={this.state.dataStock_line}
                        DATA_VOLUME={this.state.dataStock_volume}
                        component={this.component}
                        keyIndex={this.props.keyIndex}
                        width={439}
                        height={120}
                    />
                </div>
        );
    }
}
export default ChartView;
