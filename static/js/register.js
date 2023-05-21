let reg_btn = document.querySelector("#zhuce"),
    acc_input= document.querySelector("#usernameoremail"),
    pwd_input= document.querySelector("#password"),
    pwd_v_input= document.querySelector("#pwd_verify")
reg_btn.addEventListener('click',e=>{
    let account=acc_input.value,
        password=pwd_input.value,
        pwd_verify=pwd_v_input.value
    if(password!=pwd_verify){
        alert("Password incoherent")
        return
    }
    $.ajax({
        url: "/register",
        data: {
            "account": account,
            "password": password
        },
        type: "Post",
        success: function (url) {
            alert("Registered Successfully!")
            window.location.href=url
        },
    })
})