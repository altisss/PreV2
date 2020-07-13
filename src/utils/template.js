import React from 'react'
import { translate } from 'react-i18next';
import glb_sv from './globalSv/service/global_service';
import socket_sv from './globalSv/service/socket_service';
import { requestInfo } from './globalSv/models/requestInfo';
import { serviceInputPrm } from './globalSv/models/serviceInputPrm';
import { change_theme } from './change_theme';
import { change_language } from './change_language';
import commuChanel from '../constants/commChanel'
import {bf_popout} from './bf_popout'
import {reply_send_req} from './send_req'
import { translate } from 'react-i18next'
import TablePriceboard from '../conponents/table_priceboard/table_priceboard'
import {inform_broadcast} from './broadcast_service'


const remote = require('electron').remote;

class Template extends React.Component {
    constructor(props) {
      super(props)
      this.request_seq_comp = 0
      this.component = this.props.component
      this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
      this.get_rq_seq_comp = () => {
        return ++this.request_seq_comp
      };
      this.popin_window = this.popin_window.bind(this)
      this.req_component = new Map();
      if (this.props.node) {
        this.props.node.setEventListener("close", (p) => {
          window.ipcRenderer.send(commuChanel.enable, this.props.node._attributes.config) 
          window.ipcRenderer.removeAllListeners(`${commuChanel.bf_popout}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.reply_send_req}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_THEME}_${this.component}`)
          window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_LANG}_${this.component}`)

          //clear listener here
          window.ipcRenderer.removeAllListeners(`${commuChanel.CHANG_INDEX}_${this.component}`)
        })
      }

      this.state = {
        name: this.props.name,
        themePage: this.props.themePage,
        language: this.props.language,
      }
    }

    popin_window() {
        const current_window = remote.getCurrentWindow();
        window.ipcRenderer.send(commuChanel.popin_window, {state: this.state, component: this.component})
        current_window.close();
    }

    componentWillMount() {
        // update state after popout.
        window.ipcRenderer.once(commuChanel.update_state_af_popout, (event,agrs) => {
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
            console.log(agrs.state)
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

        // handle data before popin 
        window.ipcRenderer.once(`${commuChanel.bf_popin_window}_${this.component}`, (event, agrs) => {
            this.popin_window()
        })

        window.ipcRenderer.once(commuChanel.popin_window, (event, agrs) => {
            window.ipcRenderer.send(commuChanel.disable, agrs.state.config)
        })
        
        // handle data before popout
        window.ipcRenderer.once(`${commuChanel.bf_popout}_${this.component}`, (event, agrs) => {
            bf_popout(this.component, this.props.node, this.state)
        })
        
        // every request from this component to server will be received and handle here.
        window.ipcRenderer.on(`${commuChanel.reply_send_req}_${this.component}`, (event, agrs) => {
            reply_send_req(agrs, this.req_component)
        })

        this.receive_broadcast()
    }

    componentWillUnmount() {
        this.props.active_components.splice(this.props.active_components.indexOf(this.component), 1)
    }

    get_list_values_from_glb_sv = () => {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['HSX_PRC_LIST', 'HNX_PRC_LIST', 'UPC_PRC_LIST'], sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs.get('HSX_PRC_LIST')
            const HNX_PRC_LIST = agrs.get('HNX_PRC_LIST')
            const UPC_PRC_LIST = agrs.get('UPC_PRC_LIST')
        })
    }

    get_value_from_glb_sv = () => {
        const sq= this.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'HSX_PRC_LIST', sq:sq})
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
            const HSX_PRC_LIST = agrs
        })
    }

    send_broadcast = () => {
        const msg = {
            type: commuChanel.CHANG_INDEX,
            value: {},
            component: this.component,
            /// ...
          };
        inform_broadcast(commuChanel.CHANG_INDEX, msg)
    }

    receive_broadcast = () => {
        window.ipcRenderer.on(`${commuChanel.CHANG_INDEX}_${this.component}`, (event, msg) => {
            // do somethings
        })
        // create every listener on componentDidMount.
    }

    send_request_to_server = () => {
        if (this.getNewsListFlag) {
            return
        }
        this.getNewsListFlag = true
        // -- push request to request hashmap
        const reqInfo = new requestInfo();
        const request_seq_comp = this.get_rq_seq_comp()
        reqInfo.component = this.component; // component for App.js realizes that which component will be received message from server
        reqInfo.receiveFunct = this.handle_send_request_to_server; // function is called back after receive message from server.
        reqInfo.reqFunct = this.getNewsList_FunctNm
        // -- service info
        let svInputPrm = new serviceInputPrm()
        svInputPrm.WorkerName = 'ALTqNews'
        svInputPrm.ServiceName = 'ALTqNews_NewsInfo'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        svInputPrm.InVal = ['01', '0']
        this.language = svInputPrm.Lang
        svInputPrm.TotInVal = svInputPrm.InVal.length
        this.getNewsList_ReqTimeOut = setTimeout(this.solvingIndex_TimeOut, functionList.reqTimeout, request_seq_comp)
        reqInfo.inputParam = svInputPrm.InVal
        this.newsList = []

        // send request to App.js and then App.js will send this req to server
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

    handle_send_request_to_server = (message, reqInfoMap) => {
        // do some things
    }

    render() {
        const { t } = this.props
        return (
            <div id="priceboard-chart-div" style={{height: '90%'}} className="div_right_elm able_resize_width able_resize_height" >
                <div id="priceboard-div" className="div_right_l_elm able_resize_width able_resize_height">
                    {/* parent component needs to shared some prioritie parts with child as below:
                        get_value_from_glb_sv_seq, 
                        component,
                        req_component,
                        get_rq_seq_comp
                          */}
                    <TablePriceboard
                        get_value_from_glb_sv_seq={this.get_value_from_glb_sv_seq}
                        component={this.component}
                        req_component={this.req_component}
                        get_rq_seq_comp={this.get_rq_seq_comp}
                    />
                </div>
            </div>
        )
    }
}

export default translate('translations')(Template)