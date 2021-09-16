import {bitAPI, linkAPI} from "../api/api";
import {deleteMessage, setLoading, setMessage} from "./auth-reducer";



const SET_LOADING_USER = 'SET_LOADING_USER';


const storageName = 'userData'

let initialState = {

    loadingUser: false

};


export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING_USER:
            return {
                ...state, loadingUser: action.isLoading
            }

        default:
            return state;
    }
}




export const setLoadingUser = (isLoading) => ({type: SET_LOADING_USER, isLoading})

export const registerUser = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoadingUser(true))
        const data = await bitAPI.create(form)
        dispatch(setLoadingUser(false))
        dispatch(setMessage(data.message, 'success'));
    } catch (e) {
        dispatch(setLoadingUser(false))
        dispatch(setMessage(e.message, 'error'));
    }

}




