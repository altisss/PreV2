import {Actions, DockLocation, TabSetNode} from '../conponents/flexbox'
import commuChannel from '../constants/commChanel'

function bf_popout(component, node, state) {
  console.log("functionbf_popout -> bf_popout")
  window.ipcRenderer.send(commuChannel.update_state_bf_popout, 
    {
      node: node, 
      state: state, 
      component:component
    })
}

function update_state_bf_popout(model, args) {
    console.log('update_state_bf_popout',model, args)
    model.doAction(Actions.deleteTab(args.node._attributes.id))

    window.ipcRenderer.send(commuChannel.popout, {component: args.component, 
                                        state: args.state, 
                                        key: args.node._attributes.name.key,
                                        parent_id: args.node._parent._attributes.id,
                                        config: args.node._attributes.config})
    
    window.ipcRenderer.send(commuChannel.disable, args.node._attributes.config)
  }

  export {update_state_bf_popout, bf_popout};