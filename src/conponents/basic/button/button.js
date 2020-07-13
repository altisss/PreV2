import React from "react";
import PropTypes from 'prop-types';

class Button extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            style: this.props.style,
            className: this.props.className,
            name: this.props.name,
        }

    }
    
    static defaultProps = {
        style: {},
        className: "",
        name: "name",
    }

    render() {
        return (
            <button className={this.state.className} style={this.state.style}>
                {this.state.name}
                {this.props.children}
            </button>
        );
    }
}

// Button.prototype = {
//     onClick: PropTypes.func
// }

export default Button