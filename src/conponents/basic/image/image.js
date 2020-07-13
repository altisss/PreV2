import React from "react";
import alt_login_logo from '../../../assets/iamges/alt_login_logo.png'

    class Image extends React.Component {
        // constructor(props) {
        //     super(props);

        // }
        static defaultProps = {
            className: '',
            logo_url: alt_login_logo,
            heightImage: "35px",
            idImage: "id_image",
            altImage: ''
        }
     render(){
         return (
               <img className={this.props.className} alt={this.props.altImage} id={this.props.idImage} src={this.props.logo_url} height={this.props.heightImage}/>
         );
     }
    }
export default Image;