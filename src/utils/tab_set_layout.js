import React from 'react'
import commuChanel from '../constants/commChanel'
import { Actions, TabSetNode } from '../conponents/flexbox'

function get_tab_set_id(idMap, parent_id) {
  let tab_set_id = ''
  let old_parent_id = ''
  let list_tab_set_ids = []
  Object.values(idMap).map((key, _) => {
    if (key instanceof TabSetNode) {
      list_tab_set_ids.push(key.getId())
      tab_set_id = key.getId()
      if (tab_set_id === parent_id) old_parent_id = tab_set_id
    }
  })
  if (old_parent_id) tab_set_id = old_parent_id
  else tab_set_id = list_tab_set_ids[0]
  return tab_set_id
}

function add_tab_to_tabset(layout, tab_set_id, args, t) {
  console.log(args)
  const onpopout = (component) => {
    console.log(component)
    window.ipcRenderer.send(commuChanel.bf_popout, component)
  }
  layout.addTabToTabSet(tab_set_id, {
    component: args.component,
    name: <span key={args.state.name}>{t(`${args.state.name}`)} &nbsp; <i onMouseDown={onpopout.bind(this, args.component)} className="fa fa-rocket" aria-hidden="true"></i></span>,
    config: args.state.config,
    enableRename: false,
  });
}

function active_tab_or_layout(model, component) {
  const tabsets = model.toJson().layout.children
  console.log(tabsets, component)
  var active_tab = null
  for (let i = 0; i < tabsets.length; i++) {
    const tabs = tabsets[i].children
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      if (tab.component === component) {
        active_tab = tab
        break;
      }
    }
    if (active_tab) {
      model.doAction(Actions.selectTab(active_tab.id))
      break;
    }
  }
}


export { get_tab_set_id, add_tab_to_tabset, active_tab_or_layout };