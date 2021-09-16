
import React from "react";
import {connect} from "react-redux";
import {registerUser, setActions} from "./redux/user-reducer";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import Admin from "./Admin";
import {Table, TableTur} from "./TableTur";
import {AuthClient} from "./AuthClient";
import {useHistory, withRouter} from "react-router-dom";
import {getToors, getUser, setIntervalState} from "./redux/toor-reducer";







function Main(props) {

    const {

    } = props

   const onQwery = () => {

       console.log(11)
   }
    const history = useHistory();



    return (
        <div className="wrapper">
        <header>
            <div className="container">
                <div className="head">
                    <div onClick={event => { history.push('/tournament')}} className='btn'>
                        Турнир
                    </div>

                    <div onClick={event => { history.push('/auth')}} className="btn">
                        Регистрация
                    </div>

                </div>


            </div>
        </header>
        <section>

            <div className='container'>
                <div className='content'>
                    <Switch>
                        <Route path="/tournament" exact>
                            <TableTur {...props}/>
                        </Route>
                        <Route path="/auth" >
                            <AuthClient {...props}/>
                        </Route>

                        <Redirect to="/tournament"/>

                    </Switch>
                </div>
            </div>

        </section>
            <footer>
                <div>
                    2021
                </div>

            </footer>

</div>
    );
}

let mapStateToProps = (state) => {

    return {

        loadingUser: state.userState.loadingUser,
        loading: state.authState.loading,
        toors: state.toorState.toors,
        arr: state.toorState.arr,
        intervalToor: state.toorState.intervalToor,
        intervalUser: state.toorState.intervalUser,
        intervalUserAdmin: state.toorState.intervalUserAdmin,

    }

}


export default connect(mapStateToProps, {  registerUser, getUser, getToors, setIntervalState })(Main)