import React from 'react'

export default class SelectBox extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
          value: '',
          groupBadgeStyles: {
            backgroundColor: '#EBECF0',
            borderRadius: '2em',
            color: '#172B4D',
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 'normal',
            lineHeight: '1',
            minWidth: 1,
            padding: '0.16666666666667em 0.5em',
            textAlign: 'center',
          }
      }
  
      this.handleChange = this.handleChange.bind(this);
    }
    static defaultProps = {
        values: ["VietNamese", "China"],
        ipc_flag: false
    }

  
    handleChange(event) {
      this.setState({value: event.target.value});
      if (this.props.ipc_flag === true) {
        window.ipcRenderer.send('change-flag', event.target.value)
      }
      
    }
  
    render() {
      return (
            <select  value={this.state.value} onChange={this.handleChange}>
              {this.props.values.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
      );
    }
  }