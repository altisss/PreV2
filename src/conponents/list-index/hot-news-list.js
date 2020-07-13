import React from './node_modules/react';
import { translate } from './node_modules/react-i18next';
import glb_sv from '../../../services/global_service';
import uniqueId from './node_modules/lodash/uniqueId';
import { Modal, ModalHeader, ModalBody } from './node_modules/reactstrap';
import { ReactComponent as Reload } from '../../translate/icon/reload-glyph-24.svg';
import { ReactComponent as IconExchange } from '../../translate/icon/conversion-glyph-24.svg';

class HotNewsList extends React.Component {

  state = {
    isShowNews: true,
    newsList: this.props.newsList,
    deepNewsList: this.props.deepNewsList,
    isLoading: 'hidden',
    src_link: 'http://115.165.166.55:5566/news?id=test',
    refreshFlag: this.props.refreshFlag,
    titleNews: '',
    isMinimize: true,
    isOpen: false,
    isHotNews: glb_sv.localData.sidebar.isHotNews
  }

  componentDidMount() {
    this.subcr_commonEvent = glb_sv.commonEvent.subscribe(msg => {
      if (msg.type === glb_sv.OPEN_MODAL_NEWS) {
        if (msg.title) this.setState({ titleNews: msg.title });
        else this.setState({ titleNews: '' });
        if (this.state.src_link === msg.link && this.state.isOpen) return;
        this.setState({ src_link: msg.link, isOpen: true, isLoading: 'loading' }, () => {
          let elm = document.querySelector('.modal-backdrop');
          if (elm) elm.remove();
          const modal = document.getElementById('id-modal-news').parentElement.parentElement.parentElement;
          modal.style.zIndex = 800;
        });
      }
    });

    this.myListener = function (event) {

      if (this.timeoutResizeNews) clearTimeout(this.timeoutResizeNews);
      this.timeoutResizeNews = setTimeout(() => this.resizeHeightNews(),100);
      
    };
    this.myListenerWithContext = this.myListener.bind(this);
    window.addEventListener('resize', this.myListenerWithContext);

    if (!glb_sv.localData.sidebar.isShowNews) {
      this.handleMiniNews();
    }
  }

  componentWillReceiveProps(props) {
    // if (props.newsList.length !== this.state.newsList.length) {
      this.setState({ newsList: props.newsList })
    // }
    // if (props.deepNewsList.length !== this.state.deepNewsList.length) {
      this.setState({ deepNewsList: props.deepNewsList })
    // }
    if (props.refreshFlag !== this.state.refreshFlag) {
      this.setState({ refreshFlag: props.refreshFlag })
    }
  }

  componentWillUnmount() {
    if (this.subcr_commonEvent) this.subcr_commonEvent.unsubscribe();
    window.removeEventListener('resize', this.myListenerWithContext);
  }

  resizeHeightNews() {
    const indexList = document.getElementById('id-index-list');

    const elmHotNews = document.getElementsByClassName('height-list');
    const heightWeb = window.innerHeight;

    for (let i = 0; i < elmHotNews.length; i++) {
      if (!glb_sv.maxNewsSidebar) {
        elmHotNews[i].style.height = 0;
        elmHotNews[i].style.minHeight = 0;
        indexList.style.maxHeight = 'calc(100vh - 185px)';
        indexList.style.height = 'calc(100vh - 185px)';
      } else {
        indexList.style.maxHeight = 'calc(100vh - 364px)';
        indexList.style.height = '';
        const heightIndexList = document.querySelector('.indexClass').offsetHeight;
        elmHotNews[i].style.height = ((heightWeb - (179 + heightIndexList)) < 150 ? 150 : (heightWeb - (134 + heightIndexList))) + 'px';
        elmHotNews[i].style.minHeight = 150;

      }
    }
  }

  transTimeNews(time) {
    if (time === undefined) return '';
    if (time && time.length < 14) return time;
    else {
      const day = time.substr(6, 2);
      const month = time.substr(4, 2);
      const year = time.substr(0, 4);
      const hh = time.substr(8, 2);
      const mm = time.substr(10, 2);
      const ss = time.substr(12, 2);
      return (day + '/' + month + '/' + year + ' ' + hh + ':' + mm + ':' + ss);
    }
  }

  handleChangeShowNews = () => {
    this.setState({ isShowNews: !this.state.isShowNews });
  }

  toggle = () => {
    this.setState({ isOpen: false, titleNews: '' });
    // elm = document.getElementById('id-modal-news');
    // if (elm) this.hideOnClickOutside(elm);
  }

  onMyFrameLoad = () => {
    this.setState({ isLoading: 'hidden' });
  }

  openModal = (e, item) => {
    e.preventDefault();
    if (this.state.src_link === item.c3 && this.state.isOpen) return;
    this.setState({ src_link: item.c3, isOpen: true, isLoading: 'loading', titleNews: '' }, () => {
      let elm = document.querySelector('.modal-backdrop');
      if (elm) elm.remove();
      const modal = document.getElementById('id-modal-news').parentElement.parentElement.parentElement;
      modal.style.zIndex = 800;
    });
  }
  onOpenModal = () => {
    let elm = document.querySelector('.modal-backdrop');
    if (elm) elm.remove();
    elm = document.getElementById('id-modal-news');
    if (elm) {
      elm.parentElement.style.width = '0px';
      elm.parentElement.style.height = '0px';
    }
  }

  hideOnClickOutside(element) {
    const outsideClickListener = event => {
      if (!element.contains(event.target) && isVisible(element)) { // or use: event.target.closest(selector) === null
        this.setState({ isOpen: false });
        removeClickListener()
      }
    }

    const removeClickListener = () => {
      document.removeEventListener('click', outsideClickListener);
    }

    const isVisible = elem => !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);

    if (element) document.addEventListener('click', outsideClickListener);
  }

  handleMiniNews = () => {

    const indexList = document.getElementById('id-index-list');
    const elmHotNews = document.getElementsByClassName('height-list');
    const heightWeb = window.innerHeight;

    for (let i = 0; i < elmHotNews.length; i++) {
      if (glb_sv.maxNewsSidebar) {
        elmHotNews[i].style.height = 0;
        elmHotNews[i].style.minHeight = 0;
        indexList.style.maxHeight = 'calc(100vh - 185px)';
        indexList.style.height = 'calc(100vh - 185px)';
      } else {
        indexList.style.maxHeight = 'calc(100vh - 364px)';
        indexList.style.height = '';
        const heightIndexList = document.querySelector('.indexClass').offsetHeight;
        elmHotNews[i].style.height = ((heightWeb - (179 + heightIndexList)) < 150 ? 150 : (heightWeb - (134 + heightIndexList))) + 'px';
        elmHotNews[i].style.minHeight = 150;
      }
    }
    glb_sv.maxNewsSidebar = !glb_sv.maxNewsSidebar;
    glb_sv.localData.sidebar.isShowNews = glb_sv.maxNewsSidebar;
    localStorage.setItem('stateMainPage', JSON.stringify(glb_sv.localData));
    this.setState({ isMinimize: !this.state.isMinimize });
  }

  changeNews = () => {
    glb_sv.localData.sidebar.isHotNews = !glb_sv.localData.sidebar.isHotNews;
    if (this.state.isHotNews) this.props.getLastetNews(2);
    else this.props.getLastetNews(1);
    this.setState({ isHotNews: !this.state.isHotNews })
  }
  getLastetNews = () => {
    if (this.state.isHotNews) this.props.getLastetNews(1);
    else this.props.getLastetNews(2);
  }

  render() {
    const { t } = this.props;
    return (
      <>
        <div className="widgetbar-widget widgetbar-widget-news">
          <div className="widgetbar-widgetheader">
            <div className="widgetbar-headerspace" data-tut='reactour__sidebar_news' >
              <button title={!this.state.isHotNews ? t('change_hot_news') : t('change_deep_news')} id='id-refresh-list' onClick={this.changeNews} className={'button-custom'}><IconExchange /></button>{' '}
              <button disabled={!this.state.isMinimize} title={t('Refresh')} id='id-refresh-list' onClick={this.getLastetNews} className={'button-custom ' + this.state.refreshFlag}><Reload /></button>{' '}
              {this.state.isMinimize && <span title={t('zoom_out')} className='cursor_ponter icon' onClick={this.handleMiniNews}><i className="fa fa-minus"></i></span>}
              {!this.state.isMinimize && <span title={t('zoom_in')} className='cursor_ponter  icon' onClick={this.handleMiniNews}><i className="fa fa-window-maximize"></i></span>}


              {/* <UncontrolledTooltip placement="bottom" target="id-refresh-list">
                {t('Refresh')}
              </UncontrolledTooltip> */}
            </div>
            <div className="widgetbar-widgettitle">{this.state.isHotNews ? t('notify_news') : t('deep_news')}</div>
          </div>
          <div className="widgetbar-widgetbody height-list" style={{ height: '150px', minHeight: 150, display: this.state.isShowNews ? '' : 'none' }}>
            <div className="tv-news wrapper-2KWBfDVB- sb-scroll-active" style={{ overflow: 'hidden' }}>
              <div className="ns-data height-list" style={{ bottom: 'auto', height: '150px', minHeight: 150, overflow: 'auto' }}>
                {this.state.isHotNews && this.state.newsList.map((item, index) =>
                  <div key={uniqueId('news')} className="ns-item cursor_ponter" onClick={(e) => this.openModal(e, item)}>
                    <div className="ns-item-title">
                      <a href={item.c3} target="_blank" rel="noopener noreferrer" className="js-ga-track-news-escape">{index + 1} {' - '}{item.c4}</a>
                    </div>
                    <div className="ns-item-content">
                      <img alt='' className="img_news" src={item.c7}></img>
                      <div className='content-news' style={{ WebkitBoxOrient: 'vertical' }}>{item.c8}</div>
                    </div>
                    <div className="ns-item-desc">
                      <span className="source">{item.c9}</span>
                    </div>
                    <div className="ns-item-date">
                      <span>{this.transTimeNews(item.c6)}</span>
                    </div>
                  </div>
                )}
                {!this.state.isHotNews && this.state.deepNewsList.map((item, index) =>
                  <div key={uniqueId('news')} className="ns-item cursor_ponter" onClick={(e) => this.openModal(e, item)}>
                    <div className="ns-item-title">
                      <a href={item.c3} target="_blank" rel="noopener noreferrer" className="js-ga-track-news-escape">{index + 1} {' - '}{item.c4}</a>
                    </div>
                    <div className="ns-item-content">
                      <img alt='' className="img_news" src={item.c7}></img>
                      <div className='content-news' style={{ WebkitBoxOrient: 'vertical' }}>{item.c8}</div>
                    </div>
                    <div className="ns-item-desc">
                      <span className="source">{item.c9}</span>
                    </div>
                    <div className="ns-item-date">
                      <span>{this.transTimeNews(item.c6)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="sb-inner-shadow top" />
            <div className="sb-inner-shadow" />
          </div>
        </div>
        <div className="widgetbar-widgethandle">
        </div>
        {/* modal xác thực khi lệnh có các thông tin trùng lặp */}
        <Modal
          isOpen={this.state.isOpen}
          onOpened={this.onOpenModal}
          id='id-modal-news'
          size={"md modal-notify"}
          toggle={this.toggle}
          className='right'
        >
          <ModalHeader toggle={this.toggle} style={{ padding: '10px 15px' }}>
            {this.state.titleNews === '' ? t('notify_news') : (this.state.titleNews + t('info_invest_recommendation'))}
          </ModalHeader>
          <ModalBody>
            <div style={{ height: '100%' }}>
              <iframe title="News title" className={this.state.isLoading === 'loading' ? 'hidden' : ''} width="100%" height="100%" src={this.state.src_link} onLoad={this.onMyFrameLoad} />
              <div className={this.state.isLoading} style={{ color: 'white' }}>
                <i className="fa fa-spinner fa-spin" style={{ fontSize: '20px' }}></i>&nbsp;&nbsp;Loading .....
              </div>
            </div>

          </ModalBody>
        </Modal>
      </>
      // </PerfectScrollbar>

    )
  }
}

export default translate('translations')(HotNewsList);