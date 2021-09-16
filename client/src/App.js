
import React, {useEffect} from "react";
import {connect} from "react-redux";
import {} from "./redux/user-reducer";
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom'
import { Button, Dropdown, Layout, Menu, message } from "antd";
import { LoopCircleLoading } from 'react-loadingg';

import Admin from "./Admin";
import Main from "./Main";
import Auth from "./Auth";
import {initializedApp} from "./redux/auth-reducer";





function App({info, isAuth, initializedApp, initialized}) {

    useEffect(() => {
        if (info) {
            if (info.status === "success") message.success(info.message);
            if (info.status === "error") message.error(info.message);
            if (info.status === "info") message.info(info.message);
        }
    }, [info]);

    useEffect(() => {
        initializedApp()

    }, [])

    if (!initialized) {

        return  <LoopCircleLoading color="#960000" />

    }


    return (


        <Router>
            <Switch>
                <Route path="/admin" exact>
                    {isAuth ?  <Admin/> : <Auth/> }
                </Route>
                <Route path="/" >
                    <Main/>
                </Route>

                <Redirect to="/"/>

            </Switch>
        </Router>




    );
}

let mapStateToProps = (state) => {

    return {

        info: state.authState.message,
        isAuth: state.authState.isAuth,
        initialized: state.authState.initialized,


    }

}


export default connect(mapStateToProps, {initializedApp })(App)