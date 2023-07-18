const lastIndex = (array = []) => {
    const last = array.length - 1;
    return array[last]
}
const token = localStorage.getItem('accessToken')
const authorization = `bearer ${token}`
const headers = {
    headers: {
        authorization
    }
}
export {
    lastIndex,
    headers
}