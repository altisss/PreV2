import React from 'react';
import PropTypes from 'prop-types';
import OptionControl from './optionControl';

class OptionTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: this.props.columnInfo
    }
    this.handleCheckChange = this.handleCheckChange.bind(this);
    // this.changeDivBottom = this.changeDivBottom.bind(this);
    // console.log(this.props);
  }

  // componentDidMount() {

  // }

  componentWillReceiveProps(props) {
    if (props.columnInfo) {
      this.setState({ options: props.columnInfo });
    }
  }

  handleCheckChange(name, key, value) {
    const newOptions = this.state.options.map(item => {
      if (item.key === key) {
        item.value = value;
      }
      return item;
    })
    this.setState({
      options: newOptions,
    })
    this.props.onColumnChange(name, key, value); //-- gọi lại function ẩn hiện cột của component cha
    // const elm = document.getElementById(this.props.columnInfo[0].key);
    // if (!elm.classList.contains('show')) {
    //   elm.classList.add('show');
    // };
  }
  handleClose = () => {
    // const elm = document.getElementById(this.props.columnInfo[0].key);
    // if (elm.classList.contains('show')) {
    //   elm.classList.remove('show');
    // };
  }

  render() {
    return (

      <div className='option-class'>
        {/* <table>
          <tbody>
            {this.state.options.map(option =>
              <tr>
                <td>
                  <OptionControl t={this.props.t} columnkey={option.key} disable={option.disable} isShow={option.value} name={option.name} onColumnChange={this.handleCheckChange} />
                </td>
              </tr>
            )}
          </tbody>
        </table> */}
        {this.state.options.map(option =>
          <span key={option.key}>
              <OptionControl t={this.props.t} columnkey={option.key} disable={option.disable} isShow={option.value} name={option.name} onColumnChange={this.handleCheckChange} />
          </span>
        )}
      </div>
    )
  }
}
OptionTable.propTypes = {
  typecommonEvent: PropTypes.string
};

export default OptionTable;