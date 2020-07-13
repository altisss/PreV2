import React from "react";

export default class AHrefBlank extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                style: this.props.style,
                className: this.props.className,
                href: this.props.href,
                target: this.props.target
            }
            
        }
        static defaultProps = {
            href: "http://altisss.vn",
            target: "_blank",
            className: "",
            style: {},
        }
        render() {
            return (
                <a className={this.state.className} style={this.state.style} href={this.state.href} target={this.state.target}>
                    {this.props.children}
                </a>
            );
        }
    }