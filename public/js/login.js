const emailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
var shownSlideId = "base-login";
/* Google Login Bits */
gapi.load("auth2", () => { //load the google auth2 api and start it (loaded previous in html, see login.ejs)
    gapi.auth2.init();
})

document.querySelector("#google-login").addEventListener("click",doLogin); 

if (new URL(window.location.href).searchParams.get("firstTimeFlow") != null) doLogin();

async function doLogin() { //add click listener to #google-login button which will do the login
    let newUserData = {};
    if (new URL(window.location.href).searchParams.get("firstTimeFlow") === null) {
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
        //check if user has roles, if they do, assume they don't need more data. If they don't, send them through the first time login flow
        if (user.roles.length != 0) {
            if(user.roles.includes("tutor")){
                window.location = "/summary/new";
            } else if(user.roles.includes("parent")){
                window.location = "/parent/mytuteesummaries";
            } else if(user.roles.includes("tutee")){
                window.location = "/tutee/" + user._id;
            } else{
                window.location = window.location.origin;
            }
            return;
        }
    }
    //role select screen
    showSlide("role-select");
    for (let button of document.querySelectorAll("#role-select .signin-opts button")) {
        button.addEventListener("click", () => {
            newUserData.isParent = button.id == "role-parent"; //if they are a parent, set isParent to true, else, set it to false
                if (newUserData.isParent) { //if they selected parent, do this
                showSlide("parent-tutee-dialog");
                for (let button of document.querySelectorAll("#parent-tutee-dialog .signin-opts button")) {
                    button.addEventListener("click", () => {
                        if (button.id == "child-acc-yes") { //the parent's child has an account
                            showSlide("parent-child-link");
                            document.querySelector("#child-link-next").addEventListener("click", async () => {
                                let email = document.querySelector("#parent-child-link input[name=tutee-email]").value;
                                if (emailRegExp.test(email)) {
                                    newUserData.existingChildEmail = email;
                                    await submitNewUserData(newUserData);
                                    window.location = "/parent/mytuteesummaries";
                                }
                            })
                        } else { //the parent's child doesn't have an account
                            for (let element of document.querySelectorAll(".parent-hide")) { //hide all the info that we already have about the tutee
                                element.style.display = "none";
                            }
                            document.querySelector("#tutee-info .login-text h2").innerHTML = "Your Tutee's Information";
                            showSlide("tutee-info");
                            document.querySelector("#tutee-info-next").addEventListener("click", async () => {
                                let email = document.querySelector("#tutee-info input[name=tutee-email]").value;
                                let name = {};
                                [name.last, name.first] = document.querySelector("#tutee-info input[name=tutee-name]").value.replace(", ",",").split(",");
                                if ( name.last && name.first && (!email || emailRegExp.test(email)) ) {
                                    newUserData.newChildData = {
                                        name,
                                        email
                                    };
                                    await submitNewUserData(newUserData);
                                    window.location = "/parent/mytuteesummaries";
                                }
                            })
                        }
                    })
                }
            } else { //if they selected tutee, do this
                for (let element of document.querySelectorAll(".tutee-hide")) { //hide all the info that we already have about the tutee
                    element.style.display = "none";
                }
                showSlide("tutee-info");
                document.querySelector("#tutee-info-next").addEventListener("click", async () => { //on clicking the "next button"
                    let emails = document.querySelector("input[name='parent-email']").value.replace(", ",",").split(",");
                    if (emails.length == 1 && emails[0] == "") emails = [];
                    if (emails.length == 0 || emails.every((email) => emailRegExp.test(email))) { // if no email or all emails are valid, submit it
                        newUserData.parentEmails = emails;
                        await submitNewUserData(newUserData);
                        window.location = "/tutee/" + user._id;
                    }
                })
            }
        })
    }
}

/* First Time Login Flow */
function showSlide(id) {
    console.log(shownSlideId)
    for (let slide of document.querySelector("#slider-box").children) {
        if (slide.id == id) {
            slide.style.transform = "translateX(0)";
        } else if (slide.id == shownSlideId) {
            slide.style.transform = "translateX(-100%)";
        }
    }
    shownSlideId = id;
}

async function submitNewUserData(newUserData) {
    let res = await fetch("/auth/v1/newUser", {
        method: "POST",
        body: JSON.stringify(newUserData),
        headers: {
            "Content-Type": "application/json"
        }
    })
    await res.json();
}