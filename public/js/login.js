/* Google Login Bits */
gapi.load("auth2", () => { //load the google auth2 api and start it (loaded previous in html, see login.ejs)
    gapi.auth2.init();
})

document.querySelector("#google-login").addEventListener("click", async () => { //add click listener to #google-login button which will do the login
    try {
        var googleUser = await gapi.auth2.getAuthInstance().signIn(); //prompt the user to sign in with google and get a GoogleUser corresponding to them
    } catch (e) {
        console.log("error with login prompt:", e); //if there is an error (eg. closed the prompt, something else went wrong) log it and don't continue
        return;
    }
    let res = await fetch("/auth/v1/google", { //send the googleUser's id_token which has all the data we want to the server with a POST request
        method: "POST",
        body: JSON.stringify({
            token: googleUser.getAuthResponse().id_token
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    let user = await res.json();
    let newUserData = {};
    //check if user has roles, if they do, assume they don't need more data. If they don't, send them through the first time login flow
    if (user.roles.length != 0) {
        window.location = window.location.origin;
    } else {
        //role select screen
        showSlide("role-select");
        for (let button of document.querySelectorAll("#role-select .signin-opts button")) {
            button.addEventListener("click", () => {
                newUserData.isParent = button.id == "role-parent"; //if they are a parent, set isParent to true, else, set it to false
                if (newUserData.isParent) { //if they selected parent, do this
                    document.querySelector("")
                    showSlide("tutee-info");
                } else { //if they selected tutee, do this
                    for (let element of document.querySelectorAll(".tutee-hide")) {
                        element.style.display = "none";
                    }
                    showSlide("tutee-info");
                    document.querySelector("#tutee-info-next").addEventListener("click", () => {
                        let emails = document.querySelector("input[name='parent-email']").value.replace(", ",",").split(",");
                        console.log(emails)
                        let emailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
                        if (emails.length == 1 && emails[0] == "" || emails.every((email) => emailRegExp.test(email))) {
                            console.log("submitting...")
                            newUserData.parentEmails = emails;
                            let res = fetch("/auth/v1/newUser", {
                                method: "POST",
                                body: newUserData
                            })
                        }
                    })
                }
            })
        }
    }
    console.log(user)
})

/* First Time Login Flow */
function showSlide(id) {
    for (let slide of document.querySelector("#slider-box").children) {
        if (slide.id == id) {
            slide.style.display = "block";
        } else {
            slide.style.display = "none";
        }
    }
}
