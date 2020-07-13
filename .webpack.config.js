// // define child rescript
// const path = require("path");
module.exports = config => {
    config.target = 'electron-renderer';
  //   config.output= {
  //     path: path.resolve(__dirname, "./build"),
  //     publicPath: "",
  //     filename: "[name].bundle.js"
  // };
    
    return config;

  }
  