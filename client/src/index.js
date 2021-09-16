import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
//import 'normalize.css';
import 'antd/dist/antd.css'
import "./App.css"
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import store from "./redux/redux-store";
import { LoopCircleLoading } from 'react-loadingg';


ReactDOM.render(
    <Provider store={store}>
        <Suspense fallback={ <LoopCircleLoading color="#960000" />}>
        <App/>
        </Suspense>
    </Provider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
