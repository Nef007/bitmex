
const request =  async (url, method = 'GET', body = null, headers = {}) => {

    if (body) {
        body = JSON.stringify(body)
        headers['Content-Type'] = 'application/json'
    }


    const response = await fetch(url, {method, body, headers})
    const data = await response.json()

    if (!response.ok) {

        throw new Error(data.message || 'Что то пошло не так')
    }

    return data

}




export const authAPI = {

    login(form) {
        return  request('/auth/login', 'POST', {...form})

    },

    auth(token) {

        return  request('/auth/me', 'GET', null, {
            Authorization: `Bearer ${token}`
        })

    },

    register(form){
        return   request('/auth/register', 'POST', {...form})
    },
    reset(form, token){
        return   request('/auth/reset', 'POST', {...form}, {
            Authorization: `Bearer ${token}`
        } )
    },
    isAdmin(){

        return   request('/auth/isadmin', 'GET' )
    }


}


export const bitAPI = {


    create(form) {
        return  request('/api/user/create', 'POST', {...form})

    },
    createTur(form, token) {
        return  request('/api/toor/create', 'POST', {...form}, {
            Authorization: `Bearer ${token}`
        })

    },
    getToor() {
        return  request('/api/toor', 'GET', null)

    },
    deleteToor(id, token) {
        return  request(`/api/toor/${id}`, 'DELETE', null, {
            Authorization: `Bearer ${token}`
        })

    },
    deleteUser(id, token) {
        return  request(`/api/user/${id}`, 'DELETE', null, {
            Authorization: `Bearer ${token}`
        })

    },
    disqvalUser(id, text, token) {
        return  request(`/api/user/${id}`, 'PUT', {text}, {
            Authorization: `Bearer ${token}`
        } )

    },
    activeUser(id, text, token) {
        return  request(`/api/user/active/${id}`, 'PUT', {text}, {
            Authorization: `Bearer ${token}`
        } )

    },
    get() {
        return  request('/api/user', 'GET', null)

    },
    getAdmin(token) {
        return  request('/api/user/admin', 'GET', null, {
            Authorization: `Bearer ${token}`
        } )

    },
}


