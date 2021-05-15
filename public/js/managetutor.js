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
    user = await res.json();
    if(user){
        document.querySelector("#roles-editor").style.display = "block";
        document.querySelector("#tutor-header").innerText = `Roles for: ${user.name.first.split(" ").map(x=>x[0].toUpperCase() + x.slice(1)).join(" ")} ${user.name.last.split(" ").map(x=>x[0].toUpperCase() + x.slice(1)).join(" ")}`;
        document.querySelector("#is-tutor").checked = user.roles.includes("tutor");
        document.querySelector("#is-board").checked = user.roles.includes("board");
    }
    /*
    hideAlerts()
    if (await res.json()) {
        document.querySelector("#successBox").innerHTML = "Profile information updated!";
        document.querySelector("#successBox").style.display = "block"
    } else {
        document.querySelector("#errorBox").innerHTML = "Error updating profile information (this may be because there is no information to update).";
        document.querySelector("#errorBox").style.display = "block"
    }
    */
})

document.querySelector("#submit-roles").addEventListener("click", async () => {
    var roles = user.roles;
    if(document.querySelector("#is-tutor").checked){
        if(!roles.includes("tutor")){
            roles.push("tutor");
        }
    } else {
        if(!roles.includes("tutor")){
            roles = roles.filter(x=> x != "tutor");
        }
    }
    if(document.querySelector("#is-board").checked){
        if(!roles.includes("board")){
            roles.push("board");
        }
    } else {
        if(!roles.includes("board")){
            roles = roles.filter(x=> x != "board");
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
})