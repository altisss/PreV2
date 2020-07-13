import * as React from 'react';
import glb_sv from '../../utils/globalSv/service/global_service';

export default class TVChartContainer extends React.PureComponent {
    constructor(props) {
        super(props)
        this.req_component = new Map();
        this.request_seq_comp = 0;
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        };

        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    }
    
    componentDidMount() {
        const bc = new BroadcastChannel('test_channel');
        bc.onmessage = function(message){
           console.log('TVChartContainer',message.data);
        };

        // setTimeout(() => {
        //     const elm = document.getElementById(this.component + 'iframe').contentWindow.document.getElementById('tv_chart_container');
        //     elm.style.minHeight = 'unset';
        //     elm.style.height = 'calc(100vh - 0px)'
        // }, 5000);
    }

    render() {
        const lang = glb_sv.get_language()

        return <div id='tv_chart_container' style={{height: 'calc(100% - 1px)'}} >
            <iframe id={this.component + 'iframe'} frameBorder="0" src={`http://dev.altisss.vn/tradingview?stk=AAA&lang=${lang}`} height="100%" width="100%"></iframe>
        </div>
    }
}