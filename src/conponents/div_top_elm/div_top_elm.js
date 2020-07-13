import React from "react";

class Div extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {
                className: this.props.className,
                padding: this.props.padding,
                border: this.props.border,
                display: this.props.display,
                marginLeft: this.props.marginLeft,
                marginRight: this.props.marginRight,
                marginTop: this.props.marginTop,
                marginBottom: this.props.marginBottom,
                width: this.props.width,
                color: this.props.color,
                textAlign: this.props.textAlign,
                fontFamily: this.props.fontFamily,
                height: this.props.height,
                minwidth: this.props.minwidth,
                position: this.props.position,
                clear: this.props.clear
                
            }
        }

    }
    static defaultProps = {
        id: null,
        className: null,
        padding: '0',
        border: '1px solid red',
        display: 'block',
        marginLeft: '0px',
        marginRight: '0px',
        marginTop: '0px',
        marginBottom: '10px',
        width: '100%',
        color: '#4db1e8',
        textAlign: 'left',
        fontFamily: 'sans-serif',
        height: "82px",
        clear: "both",
        position: "null",
        minwidth: "1140px",
    }
    render(){
        return (
            <div style={this.state.style}>
                {this.props.children}
            </div>
        );
    }
}
export default Div;