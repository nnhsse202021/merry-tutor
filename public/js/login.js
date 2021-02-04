gapi.load("auth2", () => { //load the google auth2 api (loaded previous in html, see login.ejs)
    gapi.auth2.init();
})

document.querySelector("#google-login").addEventListener("click", async () => { //add click listener to #google-login button
    try {
        var googleUser = await gapi.auth2.getAuthInstance().signIn(); //prompt the user to sign in
    } catch (e) {
        console.log("error with login prompt:", e);
        return;
    }
    let res = await fetch("/auth/v1/google", { //send the id_token to the server with a POST request
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