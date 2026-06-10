import axios from 'axios'

const token ='eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOWU4NDlhYWYzMDNkNzlmNDk5MjMwMTc3NjQ3NjFmN2Q0YWE1NDUyNzlkOTQ0ODk1ZjlmZGI4NWJjOWUzNWYyMTM3ZWQ2OTg3Nzc5YjViYjAiLCJpYXQiOjE3ODA2NzAwMjIuNzM0MjQxLCJuYmYiOjE3ODA2NzAwMjIuNzM0MjQ4LCJleHAiOjIyNTQwNTU2MjIuNzA1ODI5LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.KzJlP78gltzFTJdeUK85U_c_EuiYui45M-ONH-zhibbGBeeo3nOWSO6bugXMXsj6J8X2Hem0t9QoR9-rSUhpQMJZ1Q_7eNbf6B0WUB7hALnYXU9FCWwUGHJQ9xcy4APWvg56TH5-M-95eOOHjQ23N8t8LibHXa6b_OoBJVV-HPV6Ss60e745xkMGQ4jXUvtDwWer76vtsrOyDPR2G9OZTem0PQlfbwG8ONTiMheI8KahCymoOCQHjicL9rDZMmB1LL464Sa-RGmdKkAuH_UIshO8FSbYPB8fQz7SwfPrLHkj6L-NtrGAbAELK8wAWc7wWRXl62olozIsl0v_3OEmczetqRD8BeWZS6UKcyZ6B7rXH2YReiVGgSmSSuno2Z0hkKb78W9mepLydzJlH0svTWb_ES3Py0pLO2OdDk0SRbg1IO9F6wPxC1SU7I0YXhf_DksLFLkSnfmWIG3kD6cbVRswMLWijKxphzjMra2FW_ra-H-aOAyADcuEbLKfr4WCKm_tC4kHPpHSncxUUYaL0jzpM3ZNMVf7owugz0jQnTwwjeYYVyCPe_5M49mONFJuID4wbyHlka8khGakceQyCwvwp-hMAJOKfiPf4rxz2nN11WZj40zvk8P3nHOP4VRd3ItGB8S5sfRGwtHSxbk5EojfqLiFGjcgpMLyOB3Kvmo'
// appelle server_ticket.js
const api_ticket = axios.create({
    baseURL: 'http://localhost:4000',        
    headers: {
        'Accept': 'application/json',      
        'Content-Type': 'application/json' 
    }
})

api_ticket.interceptors.request.use(config => {
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api_ticket