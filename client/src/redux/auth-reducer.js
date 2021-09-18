import {authAPI} from "../api/api";

const SET_AUTH_DATA = 'SET_AUTH_DATA'
const SET_LOADING = 'SET_LOADING'
const DELETE_MESSAGE = 'DELETE_MESSAGE'
const LOGOUT = 'LOGOUT'
const INITIALIZED_SUCCESS = 'INITIALIZED_SUCCESS'
const SET_ADMIN = 'SET_ADMIN'
const SET_MESSAGE = 'SET_MESSAGE';


const storageName = 'userData'

let initialState = {
    currentUser: {},
    isAuth: false,
    isAdmin: false,
    loading: false,
    initialized: false,
    message: [],


};

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_AUTH_DATA:
            return {

                ...state,
                currentUser: action.user,
                isAuth: true,
            }
        case LOGOUT:
            localStorage.removeItem(storageName)
            return {
                ...state,
                currentUser: {},
                isAuth: false
            }


        case SET_LOADING:
            return {
                ...state, loading: action.isLoading
            }

        case SET_MESSAGE:
            return {
                ...state,
                message: { message: action.message, status: action.status },
            };
        case DELETE_MESSAGE:
            return {
                ...state, message: {message: null, status: null}
            }

        case INITIALIZED_SUCCESS:
            return {
                ...state, initialized: true
            }
        case SET_ADMIN:
            return {
                ...state, isAdmin: action.bool
            }



        default:
            return state;
    }
}


const setUserData = (user) => ({type: SET_AUTH_DATA, user})
export const logout = () => ({type: LOGOUT})
export const setIsAdmin = (bool) => ({type: SET_ADMIN, bool})
export const setLoading = (isLoading) => ({type: SET_LOADING, isLoading})
export const setMessage = (message, status) => ({type: SET_MESSAGE, message, status})
 export const deleteMessage = () => ({type: DELETE_MESSAGE})
const initializedSuccess = () => ({type: INITIALIZED_SUCCESS})


export const login = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {

        dispatch(setLoading(true))
        const data = await authAPI.login(form)
        localStorage.setItem(storageName, data.token)
        dispatch(setUserData(data))


        dispatch(setLoading(false))

    } catch (e) {

        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));


    }
}

export const auth = () => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        const data = await authAPI.auth(localStorage.getItem(storageName))
        dispatch(setUserData(data))
        localStorage.setItem(storageName, data.token)
       // return data
    } catch (e) {

        localStorage.removeItem(storageName)
        dispatch(setLoading(false))

    }


}


export const register = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))

        await authAPI.register(form)
        dispatch(setLoading(false))
        dispatch(setIsAdmin(true))

    } catch (e) {
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const reset = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))

       const data = await authAPI.reset(form, localStorage.getItem(storageName))
        dispatch(setLoading(false))
        dispatch(setMessage(data.message, 'success'));

    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}

export const setTimeUpdate = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))

       const data = await authAPI.timeSet(form, localStorage.getItem(storageName))
        dispatch(setLoading(false))
        dispatch(setMessage(data.message, 'success'));

    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const isEmptyAdmin = () => async (dispatch) => {

    try {
        dispatch(setLoading(true))
        const data = await authAPI.isAdmin()
        dispatch(setLoading(false))
        dispatch(setIsAdmin(data.isAdmin))

    } catch (e) {
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}


export const initializedApp = () => async (dispatch) => {

    let promise = dispatch(auth())

    promise.then(() => {
        dispatch(initializedSuccess());
    });


}


export const noAutorization = (message) => (dispatch) => {

    if (message === "Нет авторизации") {
        dispatch(logout())
    }


}









