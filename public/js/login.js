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
    console.log(await res.json())
})