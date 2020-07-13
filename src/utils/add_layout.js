import React from 'react'
import commuChanel from '../constants/commChanel'

function on_add_layout(layout, component, name, config, model, active_components, t) {
    if (!("index1" in config) && !("index2" in config)) {
        if (!active_components.includes(component)) active_components.push(component)
        else {
            window.ipcRenderer.send(commuChanel.active_tab, component)
            return;
        }
    }
    else active_components.push(component)

    const onpopout = (component) => {
        window.ipcRenderer.send(commuChanel.bf_popout, component)
    }

    const name_multilang = t(`${name}`)
    const esc_to_exit = t(`esc_to_exit`)
    const move_to_place = t(`move_to_place`)

    if (component.includes('common_index_chart_info')) {
        layout.addTabWithDragAndDropIndirect(t(`<b>${name_multilang}</b> <br> ${move_to_place} <br> ${esc_to_exit} `), {
            component: component,
            name: <span key={name}>{t(`${name}`)} &nbsp;</span>,
            config: config,
            enableRename: false
        }, null);
        return
    }

    if (layout.tabIds.length === 0) {
        layout.addTabToTabSet(`#${model._nextId}`, {
            component: component,
            name: <span key={name}> {t(`${name}`)} &nbsp; <i onMouseDown={onpopout.bind(this, component)} className="fa fa-rocket" aria-hidden="true"></i></span>,
            config: config,
            enableRename: false
        });
    }
    else {
        layout.addTabWithDragAndDropIndirect(t(`<b>${name_multilang}</b> <br> ${move_to_place} <br> ${esc_to_exit}`), {
            component: component,
            name: <span key={name}>{t(`${name}`)} &nbsp; <i onMouseDown={onpopout.bind(this, component)} className="fa fa-rocket" aria-hidden="true"></i></span>,
            config: config,
            enableRename: false
        }, null);
    }
}

export { on_add_layout };