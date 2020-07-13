import React, { PureComponent } from 'react'
import commuChanel from '../../constants/commChanel'
import { translate } from 'react-i18next';
import { update_value_for_glb_sv } from "../../utils/update_value_for_glb_sv";
import MarketLiquidContainer from './market_liquidity_container'
import {change_theme} from '../../utils/change_theme'
import {change_language} from '../../utils/change_language'
import {bf_popout} from '../../utils/bf_popout'

const remote = require('electron').remote;

class LiquidMarket extends PureComponent {
    constructor(props) {
        super(props)
        // Thêm event đóng tab
        if (this.props.node) {
            this.props.node.setEventListener("close", (p) => {
              window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config)
              window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
              window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
              window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
              window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)
              window.ipcRenderer.removeAllListeners(commuChanel.update_state_af_popout)
              window.ipcRenderer.removeAllListeners(`${this.component}`)
            })
        }
        //Khai báo bắt buộc
        this.request_seq_comp = 0
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.get_rq_seq_comp = () => {
            return ++this.request_seq_comp
        };
        this.req_component = new Map();
        //Khai báo dùng trong layout
        this.dataLiquidMarkettop = {
            '1W': {},
            '1M': {},
            '3M': {},
            '6M': {},
            '1Y': {},
            '3Y': {},
            '5Y': {}
        }
        update_value_for_glb_sv({ component: this.component, key: 'dataLiquidMarkettop', value: this.dataLiquidMarkettop })

        this.state = {
            name: this.props.name,
            themePage: this.props.themePage,
            language: this.props.language,
        }

        this.state_bf_popin_popout = {}
    }

    saveStateBfPopout = (ContainerState) => {
        this.state_bf_popin_popout = {
            ...this.state,
            ...this.state_bf_popin_popout,
            ...ContainerState
        }
        console.log("Container State", this.state_bf_popin_popout);
    }

    componentWillMount() {
        console.log('vào componentWillMount');
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event,agrs) => {
            console.log("Agrs",agrs);
            this.state_bf_popin_popout = {
                ...agrs.state,
                parent_id: agrs.parent_id,
                config: agrs.config,
            }
            this.setState(agrs.state)
            this.setState({
              parent_id: agrs.parent_id,
              config: agrs.config,
            })
            change_theme(this.state.themePage)
            change_language(this.state.language, this.props)
        })
        
        // update state after popin
        window.ipcRenderer.once(`${this.component}`, (event,agrs) => {
          this.state_bf_popin_popout = agrs.state
          this.setState(agrs.state)
        })
     }

    componentDidMount() {
        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            change_theme(agrs)
            this.setState({themePage: agrs})
        })
      
        window.ipcRenderer.on(`${commuChanel.CHANGE_LANG}_${this.component}`, (event, agrs) => {
            change_language(agrs, this.props)
            this.setState({language: agrs})
        })

        window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
            this.popin_window()
        })
      
        window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
            window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
        })
      
        window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
            bf_popout(this.component, this.props.node, this.state_bf_popin_popout)
        })

        // window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
        //     console.log('this.req_component', agrs, this.req_component);
        //     reply_send_req(agrs, this.req_component)

        // })
    }

    popin_window() {
        const current_window = remote.getCurrentWindow();
        window.ipcRenderer.send(commuChanel.popin_window, { state: this.state_bf_popin_popout, component: this.component })
        current_window.close();
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
        // if (this.subcr_ClientReqRcv) this.subcr_ClientReqRcv.unsubscribe();
    }

    render() {
        const { t } = this.props;
        console.log("Liquid Layout");
        
        return (
            <MarketLiquidContainer 
                get_rq_seq_comp={this.get_rq_seq_comp}
                req_component={this.req_component}
                component= {this.component}
                get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                request_seq_comp={this.request_seq_comp}
                saveStateBfPopout={this.saveStateBfPopout}
                state_bf_popin_popout={this.state_bf_popin_popout}
                />
        )
    }
}

export default translate('translations')(LiquidMarket);