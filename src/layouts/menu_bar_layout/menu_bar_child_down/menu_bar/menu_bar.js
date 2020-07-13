import React from 'react';
import glb_sv from '../../../../utils/globalSv/service/global_service'
import { translate } from 'react-i18next';
import uniqueId from "lodash/uniqueId";
import commuChannel from '../../../../constants/commChanel'
import { inform_broadcast } from '../../../../utils/broadcast_service'
import { change_theme } from '../../../../utils/change_theme'
import ChangeFontSizeSlider from '../../../../conponents/change_fontsize_slider';

import ws01 from '../../../../utils/config_layout/ws01.json'
import ws02 from '../../../../utils/config_layout/ws02.json'
import ws03 from '../../../../utils/config_layout/ws03.json'
import ws04 from '../../../../utils/config_layout/ws04.json'


class Menubar extends React.Component {
  constructor(props) {
    super(props);
    this.interValShow = ''
    this.component = this.props.component
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
    this.state = {
      dataMenu: [],
      sb_priceboard: glb_sv.localData.sidebar.isShow === 1 ? true : false,
      chart_tab: glb_sv.localData.chart.isShow === 1 ? true : false,
      check_box_act: false,
      check_box_stk: false
    }
    this.req_component = new Map();

    this.request_seq_comp = 0;
    this.get_rq_seq_comp = () => {
      return ++this.request_seq_comp
    };
    this.count_market_infor = 0
    this.count_add_order = 0

    this.handler_menu_button = this.handler_menu_button.bind(this);

  };

  static defaultProps = {
    menu: {},
    themePage: '',
  }




  // getData(interValShow) {
  //   if (glb_sv.configInfo.menuConfig) {
  //     const menu = glb_sv.configInfo.menuConfig.map(menubar => {
  //       const newSubMenu = menubar.subMenu.map(sub_menu => ({ ...sub_menu }));
  //       return { ...menubar, subMenu: newSubMenu };
  //     })
  //     menu[4].subMenu[menu[4].subMenu.length + 1] = { title: 'divider-top' }
  //     menu[4].subMenu[menu[4].subMenu.length + 2] = { title: 'tunning_font_side' }
  //     menu[5] = { title: 'screen_tab', routerLink: "", icon: "fa fa-star", subMenu: [{ title: 'sb_priceboard', routerLink: 'sb_priceboard', disable: false }] }
  //     menu[6] = { title: 'add_order', routerLink: "", icon: "fa fa-shopping-cart", subMenu: [{ title: 'add_order', routerLink: 'add_order', disable: false }] }
  //     this.setState({
  //       dataMenu: menu,
  //       themePage: glb_sv.themePage
  //     })
  //     clearInterval(interValShow)
  //   }
  // }

  getData(interValShow) {
    if (glb_sv.configInfo.menuConfig) {
      const menu = glb_sv.configInfo.menuConfig.map(menubar => {
        const newSubMenu = menubar.subMenu.map(sub_menu => ({ ...sub_menu }));
        return { ...menubar, subMenu: newSubMenu };
      })
      menu[0].subMenu.unshift({ title: 'divider-top' })
      menu[0].subMenu.unshift({ title: 'common_index_chart_info', routerLink: 'common_index_chart_info', disable: false })

      menu[0].subMenu.unshift({ title: 'sb_priceboard', routerLink: 'sb_priceboard', disable: false })
      menu[0].subMenu.splice(10, 1)

      menu[4].subMenu[menu[4].subMenu.length + 1] = { title: 'divider-top' }
      menu[4].subMenu[menu[4].subMenu.length + 1] = { title: 'tunning_font_side' }
      menu[4].subMenu[menu[4].subMenu.length + 1] = { title: 'check_box_act' }
      menu[4].subMenu[menu[4].subMenu.length + 1] = { title: 'check_box_stk' }


      // menu[5] = { title: 'screen_tab', routerLink: "", icon: "fa fa-star", subMenu: [{ title: 'sb_priceboard', routerLink: 'sb_priceboard', disable: false }] }
      menu[5] = { title: 'add_order', routerLink: "", icon: "fa fa-shopping-cart", subMenu: [{ title: 'add_order', routerLink: 'add_order', disable: false }] }
      menu[6] = { title: 'workspace', routerLink: '', icon: "fa fa-heart", subMenu: [{ title: 'Không gian 01', routerLink: '', disable: false, type: "workspace" }, { title: 'Không gian 02', routerLink: '', disable: false, type: "workspace" }, { title: 'Không gian 03', routerLink: '', disable: false, type: "workspace" }, { title: 'Không gian 04', routerLink: '', disable: false, type: "workspace" }] }
      this.setState({
        dataMenu: menu,
        themePage: glb_sv.themePage
      })
      clearInterval(interValShow)
      console.log("menu", menu)
    }
  }

  componentDidMount() {
    const interValShow = setInterval(() => {
      this.getData(interValShow)
    }, 500)

    window.ipcRenderer.on(commuChannel.PLACE_ORDER + '_MenuBarLayout', (event, args) => {
      console.log('BackgroundMessage', args, this.props.active_components)
      for (let i = 0; i < this.props.active_components.length; i++) {
        if (this.props.active_components[i].includes('add_order')) {
          window.ipcRenderer.send(commuChannel.active_tab, this.props.active_components[i])
          return;
        }
      }
      const menu = this.state.dataMenu[5].subMenu[0]
      this.handler_menu_button(menu, 0, 0)
      // window.ipcRenderer.send('PLACE_ORDER', this.active_component)
    })

    window.ipcRenderer.on(commuChannel.enable, (event, args) => {
      if ('index1' && 'index2' in args) {
        // const menu = this.state.dataMenu
        // menu[args.index1].subMenu[args.index2].disable = false
        // this.setState({ dataMenu: menu })
      }
    })

    window.ipcRenderer.on(commuChannel.open_OVERVIEW_MARKET_TAB_layout, (event, args) => {
      const menu = this.state.dataMenu[0].subMenu[3]

      this.handler_menu_button(menu, 0, 0)
      // console.log(this.state.menu)
    })

    // window.ipcRenderer.on(commuChannel.disable, (event, args) => {
    //   if ('index1' && 'index2' in args) {
    //     const menu = this.state.dataMenu
    //     menu[args.index1].subMenu[args.index2].disable = true
    //     this.setState({ dataMenu: menu })
    //   }
    // })


    window.ipcRenderer.on(commuChannel.LOGIN_SUCCESS + '_MenuBarLayout', (e, agrs) => {
      this.setState({ check_box_act: glb_sv.isSynceAccount, check_box_stk: glb_sv.isSynceStk })
      if (glb_sv.objShareGlb['isBroker']) {
        const change_login = document.getElementById('change-login-menu')
        change_login.parentElement.style.display = 'none'

        const change_order = document.getElementById('change-order-menu')
        change_order.parentElement.style.display = 'none'
      }
    })

  }


  handler_menu_button(sub, index1, index2) {
    const themes = ['light-theme', 'dark-theme', 'light-theme-china', 'dark-theme-china']
    const workspace = [ ws01, ws02, ws03, ws04 ]
    if (themes.includes(sub.routerLink)) {
      if (this.state.themePage !== sub.routerLink) {
        this.setState({ themePage: sub.routerLink })
        glb_sv.themePage = sub.routerLink
        localStorage.setItem('themePage', glb_sv.themePage);
        change_theme(sub.routerLink)
        inform_broadcast(commuChannel.CHANGE_THEME, sub.routerLink)
        return;
      }
    } else if (sub.type === 'workspace') {
        this.props.onChangeWorkspace(workspace[index2])
    } else {

      const component = sub.routerLink + this.count_add_order
      this.props.onAddLayout(component, sub.title, { component, config: { index1, index2 } })
      this.count_add_order++

      return;
    }

  }

  openPlaceOrder = (item) => {
    const sub = { title: 'add_order', routerLink: 'add_order', disable: false };
    if (item.title === 'add_order') {
      const component = sub.routerLink + this.count_add_order
      this.props.onAddLayout(component, sub.title, { component, config: { index1: 6, index2: 0 } })
      this.count_add_order++
    } else return;
  }

  check_box_stk = () => {
    const { t } = this.props
    return <span className="checkbox_menu" >
      <input
        className="styled-checkbox"
        id={'check_box_stk'}
        type="checkbox"
        checked={this.state.check_box_stk}
        onChange={this.changeCheckBoxStk}
      />
      <label className="checkbox-filter-order" htmlFor={'check_box_stk'} style={{ paddingTop: 'unset', fontWeight: 'normal', paddingRight: 5, color: '#9E9DB6' }}>{t('synce_stk_all_screen')}</label>
    </span>
  }

  check_box_act = () => {
    const { t } = this.props
    return <span className="checkbox_menu" >
      <input
        className="styled-checkbox"
        id={'check_box_act'}
        type="checkbox"
        checked={this.state.check_box_act}
        onChange={this.changeCheckBoxAct}
      />
      <label className="checkbox-filter-order" htmlFor={'check_box_act'} style={{ paddingTop: 'unset', fontWeight: 'normal', paddingRight: 5, color: '#9E9DB6' }}>{t('synce_act_all_screen')}</label>
    </span>
  }

  changeCheckBoxAct = () => {
    if (glb_sv.isSynceAccount) {
      this.setState({ check_box_act: false });
      glb_sv.isSynceAccount = false
      inform_broadcast(commuChannel.FLAG_SYNCE_ACCOUNT, { isSynceAccount: glb_sv.isSynceAccount, activeAcnt: glb_sv.activeAcnt, objShareGlb: glb_sv.objShareGlb });
    } else {
      this.setState({ check_box_act: true })
      glb_sv.isSynceAccount = true
      inform_broadcast(commuChannel.FLAG_SYNCE_ACCOUNT, { isSynceAccount: glb_sv.isSynceAccount, activeAcnt: glb_sv.activeAcnt, objShareGlb: glb_sv.objShareGlb });

    }
  }

  changeCheckBoxStk = () => {
    if (glb_sv.isSynceStk) {
      this.setState({ check_box_stk: false });
      glb_sv.isSynceStk = false
      inform_broadcast(commuChannel.FLAG_SYNCE_STK, { isSynceStk: glb_sv.isSynceStk, activeStk: glb_sv.activeStk });
    } else {
      this.setState({ check_box_stk: true });
      glb_sv.isSynceStk = true
      inform_broadcast(commuChannel.FLAG_SYNCE_STK, { isSynceStk: glb_sv.isSynceStk, activeStk: glb_sv.activeStk });
    }
  }

  render() {
    return (
      this.state.dataMenu.map((item, index_1) =>
        <li key={`menu__item__${index_1}`} className="dropdown" onClick={() => this.openPlaceOrder(item)}>
          <a className="" data-tut={"reactour__menu_" + item.title} data-toggle="tooltip" title={this.props.t(item.title)}>
            <i className={item.icon}>&nbsp;</i>
          </a>
          {item.title === 'add_order' ? null : <ul className="dropdown-menu">
            <menu-tree className="dropdown-menu">
              <li className="menu-item-element menu-item-title">
                <span className="menu-item-title">{this.props.t(item.title)}</span>
              </li>
              <li className="menu-item-element divider-top"></li>
              {item.subMenu.map((itemli, index_2) => itemli.title === 'divider-top'
                ? <li key={`submenu__item__${index_2}`} className="menu-item-element divider-top"></li>
                : (itemli.title !== 'tunning_font_side'
                  ? (itemli.title === 'check_box_act' ? <li key={`check_box_stk`}>{this.check_box_stk()}</li> : (itemli.title === 'check_box_stk' ? <li key={`check_box_act`}>{this.check_box_act()}</li> : <li key={`submenu__item__${index_2}`} onClick={this.handler_menu_button.bind(this, itemli, index_1, index_2)} className="menu-item-element" >
                    <span id={itemli.routerLink + '-menu'}>
                      {(itemli.routerLink === 'dark-theme' && this.state.themePage === 'dark-theme') ? <i className="fa fa-check color-active"></i> : ''}
                      {(itemli.routerLink === 'light-theme' && this.state.themePage === 'light-theme') ? <i className="fa fa-check color-active"></i> : ''}
                      {(itemli.routerLink === 'dark-theme-china' && this.state.themePage === 'dark-theme-china') ? <i className="fa fa-check color-active"></i> : ''}
                      {(itemli.routerLink === 'light-theme-china' && this.state.themePage === 'light-theme-china') ? <i className="fa fa-check color-active"></i> : ''}
                      {' '}
                      <span className={(itemli.routerLink === this.state.themePage) ? 'color-active' : ''}>{this.props.t(itemli.title)}</span>
                    </span>
                  </li>))
                  : <li key="font-size__change"><ChangeFontSizeSlider /></li>)
              )}
            </menu-tree>
          </ul>}
        </li >)
    )
  }
}
export default translate('translations')(Menubar);