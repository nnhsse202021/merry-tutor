var user;
document.querySelector("#submit-email").addEventListener("click", async () => {
    let res = await fetch(window.location.pathname + "/findtutor", { //send data to server
        method: "POST",
        body: JSON.stringify({
            email: document.querySelector("#email").value
        }),
        headers: {
            "Content-Type": "application/json"
        }

    })
    let emailRes = await res.json();
    user = emailRes.user;
    if(emailRes.querySuccess){
        document.querySelector("#roles-editor").style.display = "block";
        if(user.name.first || user.name.last){
            document.querySelector("#tutor-header").innerText = `Roles for: ${user.name.first.split(" ").map(x=>x[0].toUpperCase() + x.slice(1)).join(" ")} ${user.name.last.split(" ").map(x=>x[0].toUpperCase() + x.slice(1)).join(" ")}`;
        } else {
            document.querySelector("#tutor-header").innerText = `Roles for user with email: ${user.email}`
        }
        document.querySelector("#is-tutor").checked = user.roles.includes("tutor");
        document.querySelector("#is-board").checked = user.roles.includes("board");
        document.querySelector("#manage-error-box").style.display = "none"
    } else {
        switch (emailRes.errorType){
            case 1:
                document.querySelector("#manage-error-box").innerHTML = "Oops! Cannot change roles for yourself.";
                break;
            case 2:
                document.querySelector("#manage-error-box").innerHTML = "Could not find user with submitted email.";
                break;
        }
        document.querySelector("#manage-success-box").style.display = "none";
        document.querySelector("#manage-error-box").style.display = "block";
    }
})

document.querySelector("#submit-roles").addEventListener("click", async () => {
    var roles = user.roles; 
    if(document.querySelector("#is-tutor").checked){
        if(!roles.includes("tutor")){
            roles.push("tutor"); //add tutor role if button is checked and tutor doesn't have role yet.
        }
    } else {
        if(roles.includes("tutor")){
            roles = roles.filter(x=> x != "tutor"); //remove tutor role if button is not checked and tutor has role.
        }
    }
    if(document.querySelector("#is-board").checked){
        if(!roles.includes("board")){
            roles.push("board"); //add board role if button is checked and tutor doesn't have role yet.
        }
    } else {
        if(roles.includes("board")){
            roles = roles.filter(x=> x != "board"); //remove board role if button is not checked and tutor has role.
        }
    }
    let res = await fetch(window.location.pathname + "/edittutor", { //send data to server
        method: "POST",
        body: JSON.stringify({
            _id: user._id,
            roles,
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (await res.json()) {
        document.querySelector("#manage-success-box").innerHTML = "Tutor information updated.";
        document.querySelector("#manage-error-box").style.display = "none";
        document.querySelector("#manage-success-box").style.display = "block";
    } else {
        document.querySelector("#manage-error-box").innerHTML = "Error updating tutor information (this may be because there is no information to update).";
        document.querySelector("#manage-success-box").style.display = "none";
        document.querySelector("#manage-error-box").style.display = "block";
    }
    
})