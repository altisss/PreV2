import React from 'react';

class OptionControl extends React.Component {
  constructor(props) {
    super(props);
    this.handleCheckChange = this.handleCheckChange.bind(this);

  }

  handleCheckChange(name, key, event) {
    // this.props.onColumnChange(name, key, event.target.checked); //-- gọi lại function ẩn hiện cột của component cha
  }

  componentDidMount() {
    // this.rootElm = ReactDOM.findDOMNode(this);
      if (this.props.disable === true) {
        document.getElementById(this.props.columnkey+'_ckbox').disabled = true;

      }
      // document.getElementById(this.props.columnkey+'_ckbox').checked = this.props.isShow;
    // this.setState({isShow: this.props.isShow });
  }

  handleShow = (e) => {
    // this.props.handleShow();
    // e.target.blur;
    // console.log(e);
    // const elm = document.getElementById(this.props.columnkey+'_ckbox');
    // if (elm && elm.disabled) return;
    this.props.onColumnChange(this.props.name,this.props.columnkey, !this.props.isShow);
  }
  
  render() {
    const { t } = this.props;
    return (
      <>
        <input 
          className="styled-checkbox" 
          id={this.props.columnkey+'_ckbox'} 
          type="checkbox" 
          // value="value2"
          checked={this.props.isShow}
          onChange={this.handleShow}
        />
        <label htmlFor={this.props.columnkey+'_ckbox'}>{t(this.props.name)}</label>
      </>
    )
  }
}

export default OptionControl;