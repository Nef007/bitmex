import {bitAPI} from "../api/api";
import {deleteMessage, noAutorization, setLoading, setMessage} from "./auth-reducer";




const SET_LOADING_USER = 'SET_LOADING_USER';
const SET_LOG = 'SET_LOG';


const storageName = 'userData'

let initialState = {
    loadingUser: false,
    log:[]

};


export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING_USER:
            return {
                ...state, loadingUser: action.isLoading
            }
            case SET_LOG:
            return {
                ...state, log: action.log
            }

        default:
            return state;
    }
}




export const setLoadingUser = (isLoading) => ({type: SET_LOADING_USER, isLoading})
export const setLog= (log) => ({type: SET_LOG, log})

export const registerUser = (form, isAdmin ) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoadingUser(true))
        const data = await bitAPI.create(form, isAdmin)
        dispatch(setLoadingUser(false))
        dispatch(setMessage(data.message, 'success'));
    } catch (e) {
        dispatch(setLoadingUser(false))
        dispatch(setMessage(e.message, 'error'));
    }

}

export const getLog= () => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.getLog(localStorage.getItem(storageName))
        dispatch(setLog(data))
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const deleteLog= () => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.delLog(localStorage.getItem(storageName))
        dispatch(setMessage(data.message, 'success'));
        dispatch(setLoading(false))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}





