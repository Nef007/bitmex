import {bitAPI} from "../api/api";
import {deleteMessage, noAutorization, setLoading, setMessage} from "./auth-reducer";

const SET_TOOR= 'SET_TOOR'
const SET_USERS= 'SET_USERS'
const SET_USERS_ADMIN= 'SET_USERS_ADMIN'
const SET_INTERVAL= 'SET_INTERVAL'



const storageName = 'userData'

function findActive(arr) {
    let arrId= [];
    for(let i=0; i<=arr.length-1 ; i++){
        if(arr[i].status==="Активный"){
            arrId.push(i)
        }

    }
    return arrId

}


let initialState = {
    toors: [],
    arr:[],
    intervalUser: null,




};


export const toorReducer = (state = initialState, action) => {
    switch (action.type) {

        case SET_USERS:
            return {
                ...state, toors: state.toors.map((toor)=> {
                    return {...toor, users:  action.users.filter(user=>user.toorId===toor.id).sort((a, b) => b.balance - a.balance) }

                })
            }
        case SET_TOOR:
            return {
                ...state, toors: action.toors.sort((a, b) => new Date(b.start) - new Date(a.start)).map((toor, index)=> {
            return {...toor, key: index }
            }) , arr: findActive(action.toors.sort((a, b) => new Date(b.start) - new Date(a.start)))
            }


        case SET_USERS_ADMIN:
            return {
                ...state, toors: state.toors.map((toor)=> {
                    return {...toor, users:  action.users.filter(user=>user.toorId===toor.id).sort((a, b) => b.balance - a.balance) }

                })
            }

            case SET_INTERVAL:
            return {
                ...state, intervalUser: action.intervalUser,


            }

        default:
            return state;
    }
}


export const setToorActions = (toors) => ({type: SET_TOOR, toors})
export const setUsersActions = (users) => ({type: SET_USERS, users})
export const setUsersAdminActions = (users) => ({type: SET_USERS_ADMIN, users})
export const setIntervalState = (intervalUser) => ({type: SET_INTERVAL, intervalUser})



export const getUserAdmin = () => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.getAdmin(localStorage.getItem(storageName))
        dispatch(setUsersAdminActions(data))
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}


export const getUser = () => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.get()
        dispatch(setUsersActions(data))
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}


export const registerTurnament = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {

        const data = await bitAPI.createTur(form, localStorage.getItem(storageName) )
        dispatch(setMessage(data.message, 'success'));
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const getToors = () => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.getToor()
        dispatch(setToorActions(data))
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const deleteToor = (id) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.deleteToor(id, localStorage.getItem(storageName))
        dispatch(setMessage(data.message, 'success'));
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const deleteUser = (id) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.deleteUser(id, localStorage.getItem(storageName))
        dispatch(setMessage(data.message, 'success'));
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const disqvalUser  = (id, text) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.disqvalUser(id, text, localStorage.getItem(storageName))
        dispatch(setMessage(data.message, 'success'));
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}

export const setActiveUser  = (id, text) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.activeUser(id, text, localStorage.getItem(storageName))
        dispatch(setMessage(data.message, 'success'));
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}




