import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactProvider } from '@web3-react/core'
import "./index.css";

function getLibrary(provider, connector) {
  return new Web3Provider(provider)
}
  
var destination = document.querySelector("#container");

ReactDOM.render(
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>,
    destination
);