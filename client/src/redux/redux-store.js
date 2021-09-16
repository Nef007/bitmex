import {applyMiddleware, combineReducers, createStore, compose} from "redux";
import thunkMiddleware from "redux-thunk";
import {authReducer} from "./auth-reducer";
import {userReducer} from "./user-reducer";
import {toorReducer} from "./toor-reducer";




let reducers = combineReducers({
    authState:authReducer,
    userState:userReducer,
    toorState:toorReducer,

});

let store = createStore(reducers, compose((applyMiddleware(thunkMiddleware)),
     // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
))



export default store;
