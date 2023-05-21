let log_btn = document.querySelector("#denglu"),
    acc_input= document.querySelector("#usernameoremail"),
    pwd_input= document.querySelector("#password"),
    RM_CkBox= document.querySelector("#rememberMe")

//Automatic login
//with the token in local storage(if there is one)
let token =localStorage.getItem("token")
if(token){
    $.ajax({
        url: "/autoLogin",
        data: {
            "token":token
        },
        type: "Post",
        success: function (res) {
            if (res.status==200) {
                let data=JSON.parse(res.data)
                sessionStorage.setItem('token', token)
                sessionStorage.setItem('user_id',data.user.id)
                sessionStorage.setItem('user_name',data.user.name)
                window.location.href=data.url
                alert("Automatic login successful")
            }else if(res.status==404)
            {
                localStorage.removeItem("token")
                alert("token expired, please log in again")
            }

        },
    })
}

log_btn.addEventListener('click',e=>{
    let account=acc_input.value,
        password=pwd_input.value,
        RM=RM_CkBox.checked
    $.ajax({
        url: "/login",
        data: {
            "account": account,
            "password": password
        },
        type: "Post",
        success: function (res) {
            if (res.status==200) {
                let data=JSON.parse(res.data)
                //take token into session storage, if "remember me", store in cookie or local storage
                sessionStorage.setItem('token',data.token)
                sessionStorage.setItem('user_id',data.user.id)
                sessionStorage.setItem('user_name',data.user.name)
                if(RM) {
                    localStorage.setItem('token',data.token)
                }
                window.location.href=data.url
            }else if(res.status==404)
                alert("The username or password is incorrect")

        },
    })
})

