import {bitAPI} from "../api/api";
import {deleteMessage, noAutorization, setLoading, setMessage} from "./auth-reducer";

const SET_TOOR = 'SET_TOOR'
const SET_USERS = 'SET_USERS'
const SET_USERS_ADMIN = 'SET_USERS_ADMIN'
const SET_INTERVAL = 'SET_INTERVAL'
const SET_TOOR_STATUS = 'SET_TOOR_STATUS'
const SET_LOADING_USER_ADMIN = 'SET_LOADING_USER_ADMIN'
const SET_LOADING_TOORS = 'SET_LOADING_TOORS'
const SET_TOOR_REVERS = 'SET_TOOR_REVERS'


const storageName = 'userData'

function findActive(arr) {
    let arrId = [];
    for (let i = 0; i <= arr.length - 1; i++) {
        if (arr[i].status === "Активный") {
            arrId.push(i)
        }

    }
    return arrId

}


let initialState = {
    toors: [],
    toorsRevers: [],
    arr: [],
    intervalUser: null,
    loadingIndexUser: {
        load: false,
        idUser: ''
    },
    loadingToors: false,

};

export const toorReducer = (state = initialState, action) => {
    switch (action.type) {

        case SET_LOADING_USER_ADMIN:
            return {
                ...state, loadingIndexUser: {load: action.isLoading, idUser: action.id},
            }
        case SET_LOADING_TOORS:
            return {
                ...state, loadingToors: action.isLoading
            }

        case SET_USERS:
            return {
                ...state, toors: state.toors.map((toor) => {
                    return {
                        ...toor,
                        users: action.users.filter(user => user.toorId === toor.id).sort((a, b) => b.balance - a.balance)
                    }

                })
            }

        case SET_TOOR_STATUS:
            return {
                ...state, toors: state.toors.map((toor) => {
                    if (toor.id === action.id) {
                        toor.status = action.status
                    }
                    return toor
                })
            }
        case SET_TOOR_REVERS:
            return {
                ...state, toors: state.toors.map((toor) => {
                    if (toor.id === action.id) {
                        toor.isRevers = !toor.isRevers
                    }
                    return toor
                })
            }

        case SET_TOOR:
            return {
                ...state,
                toors: action.toors.sort((a, b) => new Date(b.start) - new Date(a.start)).map((toor, index) => {
                    return {...toor, key: index, isRevers: false}
                }),
                arr: findActive(action.toors.sort((a, b) => new Date(b.start) - new Date(a.start)))
                //  toorsRevers:
            }


        case SET_USERS_ADMIN:
            return {
                ...state, toors: state.toors.map((toor) => {
                    return {
                        ...toor,
                        users: toor.users.map(user => {
                            if (user.id === action.user.id) {
                                user = action.user
                            }
                            return user
                        })
                    }
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

export const setLoadingUserIndex = (isLoading, id) => ({type: SET_LOADING_USER_ADMIN, isLoading, id})
export const setLoadingToors = (isLoading) => ({type: SET_LOADING_TOORS, isLoading})
export const setToorActions = (toors) => ({type: SET_TOOR, toors})
const setStatusToorActions = (id, status) => ({type: SET_TOOR_STATUS, id, status})
export const setReversToorActions = (id) => ({type: SET_TOOR_REVERS, id})
export const setUsersActions = (users) => ({type: SET_USERS, users})
export const setUsersAdminActions = (user) => ({type: SET_USERS_ADMIN, user})
export const setIntervalState = (intervalUser) => ({type: SET_INTERVAL, intervalUser})


export const getUserAdmin = (id) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoadingUserIndex(true, id))
        const data = await bitAPI.getAdmin(id, localStorage.getItem(storageName))
        dispatch(setUsersAdminActions(data))
        dispatch(setLoadingUserIndex(false, id))
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoadingUserIndex(false, id))
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

        const data = await bitAPI.createTur(form, localStorage.getItem(storageName))
        dispatch(setMessage(data.message, 'success'));
    } catch (e) {
        dispatch(noAutorization(e.message))
        dispatch(setLoading(false))
        dispatch(setMessage(e.message, 'error'));
    }

}
export const updateTurnament = (form) => async (dispatch) => {
    dispatch(deleteMessage());
    try {

        const data = await bitAPI.update(form, localStorage.getItem(storageName))
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
        dispatch(setLoadingToors(true))
        const data = await bitAPI.getToor()
        dispatch(setToorActions(data))
        dispatch(setLoadingToors(false))
    } catch (e) {
        dispatch(setLoadingToors(false))
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
export const changeStatusToor = (id, status) => async (dispatch) => {
    dispatch(deleteMessage());
    try {
        dispatch(setLoading(true))
        const data = await bitAPI.changeStatusToor(id, status, localStorage.getItem(storageName))
        dispatch(setStatusToorActions(id, status))
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
export const disqvalUser = (id, text) => async (dispatch) => {
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

export const setActiveUser = (id, text) => async (dispatch) => {
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




