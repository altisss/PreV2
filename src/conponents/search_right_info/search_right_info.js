import React, { PureComponent } from 'react'
import { translate } from 'react-i18next';
import glb_sv from '../../utils/globalSv/service/global_service';
import Select, { components } from 'react-select';
import commuChanel from '../../constants/commChanel'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { inform_broadcast } from '../../utils/broadcast_service';

const customStyles = {
  option: base => ({
    ...base,
    height: 26,
    padding: '5px 12px'
  }),
  control: base => ({
    ...base,
    height: 25,
    minHeight: 25,
    border: '0px solid',
    backgroundColor: 'var(--altisss_button)',
  }),
  menuList: base => ({
    ...base,
    maxHeight: 300,
    width: 500,
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    zIndex: 3,
    backgroundColor: 'var(--altisss_button)',
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    fontFamily: 'monospace'
  }),
  menu: base => ({
    ...base,
    width: 500
  }),
  indicatorSeparator: base => ({
    ...base,
    height: 15,
    marginTop: 6,
    display: 'none'
  }),
  dropdownIndicator: base => ({
    ...base,
    padding: 4,
    marginTop: -3,
    display: 'none'
  }),
  container: base => ({
    ...base,
    zIndex: 99
  }),
  placeholder: base => ({
    ...base,
    whiteSpace: 'nowrap',
    top: '56%',
    color: glb_sv.style[glb_sv.themePage].sideBar.color_placehoder_search
  }),
  singleValue: base => ({
    ...base,
    marginLeft: -5,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    top: '56%'
  }),
  valueContainer: base => ({
    ...base,
    marginTop: -5,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch
  }),
  input: base => ({
    ...base,
    color: glb_sv.style[glb_sv.themePage].sideBar.colorSearch,
    paddingTop: 4
  })
};
function customFilter(option, searchText) {
  if (
    option.data.value.toLowerCase().includes(searchText.toLowerCase())
  ) {
    return true;
  } else {
    return false;
  }
};
const MenuList = props => {
  if (!Array.isArray(props.children)) {
    return (
      <components.MenuList {...props}>
        {props.children}
      </components.MenuList>
    );
  }
  const recentList = [], restList = [];
  props.children.forEach(item => {
    if (item.props.value === glb_sv.recentStkList[0] ||
      item.props.value === glb_sv.recentStkList[1] ||
      item.props.value === glb_sv.recentStkList[2] ||
      item.props.value === glb_sv.recentStkList[3] ||
      item.props.value === glb_sv.recentStkList[4] ||
      item.props.value === glb_sv.recentStkList[5] ||
      item.props.value === glb_sv.recentStkList[6] ||
      item.props.value === glb_sv.recentStkList[7] ||
      item.props.value === glb_sv.recentStkList[8] ||
      item.props.value === glb_sv.recentStkList[9]
    ) {
      recentList.push(item)
    } else restList.push(item);
  });
  return (
    <components.MenuList {...props}>
      {recentList}
      {restList}
    </components.MenuList>
  );
};

class SearchRightInfo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.component = this.props.component;
    this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq;
    this.state = {
      name: this.props.name ? this.props.nname : '',
      className: this.props.className ? this.props.className : '',
      isSynceStk: true
    }
  }

  componentDidMount() {
    // if (!this.props.isSynce) return;
    if (!this.props.isSynce && !(this.component.includes('sb_priceboard'))) return;
    const sq = this.get_value_from_glb_sv_seq()
    window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, args) => {
      this.isSynceStk = args.get('isSynceStk');
      this.setState({ isSynceStk: this.isSynceStk });
    });
    window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['isSynceStk'], sq: sq });

    window.ipcRenderer.on(`${commuChanel.REFOCUS_SELECT_STK}_${this.component}`, (event, msg) => {
      console.log('selectMenu',this.selectMenu)
      if (this.selectMenu) this.selectMenu.focus()
      this.selectMenu.onMenuOpen()
    });
    window.ipcRenderer.on(`${commuChanel.FLAG_SYNCE_STK}_${this.component}`, (event, args) => {
      this.isSynceStk = args.isSynceStk;
      const activeStk = args.activeStk;
      this.setState({ isSynceStk: this.isSynceStk })
      if (this.isSynceStk && this.activeStk !== activeStk) {
        this.activeStk = activeStk;
        this.props.selectedStk(activeStk);
      }
    });
    window.ipcRenderer.on(`${commuChanel.CHANGE_STK}_${this.component}`, (event, msg) => {
      const _sq = this.get_value_from_glb_sv_seq()
      window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'activeStk', sq: _sq })
      window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${_sq}`, (event, activeStk) => {
        if (this.isSynceStk && this.activeStk !== activeStk) {
          this.activeStk = activeStk;
          this.props.selectedStk(activeStk);
        }
      })
    });
  }

  componentWillUnmount() {
    window.ipcRenderer.removeAllListeners(`${commuChanel.REFOCUS_SELECT_STK}_${this.component}`)
    window.ipcRenderer.removeAllListeners(`${commuChanel.FLAG_SYNCE_STK}_${this.component}`)
    window.ipcRenderer.removeAllListeners(`${commuChanel.CHANGE_STK}_${this.component}`)
  }

  handleSyncStk = () => {
    if (this.isSynceStk) {
      this.isSynceStk = false;
      // this.setState({ isSynceStk: false });
    } else {
      this.isSynceStk = true;
      // this.setState({ isSynceStk: true });
    }
    update_value_for_glb_sv({ component: this.component, key: 'isSynceStk', value: this.isSynceStk });
    inform_broadcast(commuChanel.FLAG_SYNCE_STK, {isSynceStk: this.isSynceStk, activeStk: this.activeStk});
  }

  selectedStk = activeStk => {
    this.activeStk = activeStk;
    if (!this.props.isSynce) {
      this.props.selectedStk(activeStk);
      return;
    };

    update_value_for_glb_sv({ component: this.component, key: 'activeStk', value: this.activeStk });
    inform_broadcast(commuChanel.CHANGE_STK, this.activeStk);
    this.props.selectedStk(activeStk);
  }

  render() {
    const { t } = this.props;
    return (<>
      <Select ref={refC => this.selectMenu = refC} name={this.state.name} className='col no-padding'
        value={this.props.selectedStkName} placeholder={'-- ' + t('choose_symbol_trading')}
        options={this.props.stkList} onChange={this.selectedStk} styles={customStyles} filterOption={customFilter}
        components={{ MenuList }}
        theme={(theme) => ({
          ...theme,
          color: '',
          colors: {
            ...theme.colors,
            text: '',
            primary25: glb_sv.style[this.props.themePage].sideBar.background_hover_search,
            neutral0: 'var(--component__main_dark)',
          },

        })}
      />
      {/* {this.props.isSynce && <div title="Đồng bộ tài khoản tất cả màn hình" className="no-padding cursor_ponter" style={{ marginLeft: 10, marginTop: 3 }} onClick={this.handleSyncStk}>
        <i className={!this.state.isSynceStk ? "fa fa-unlink" : "fa fa-link"} aria-hidden="true" style={{ color: this.state.isSynceStk ? '#17a290' : '#ff9800', fontSize: '1.5rem' }}></i>
      </div>} */}
    </>)
  }
}

export default translate('translations')(SearchRightInfo);