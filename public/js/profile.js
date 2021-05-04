document.querySelector("#submitProfile").addEventListener("click", async () => {
    let res = await fetch(window.location.href + "/update", { //send data to server
        method: "POST",
        body: new URLSearchParams(new FormData(document.querySelector("#profile")))
    })
    if (await res.json()) {
        document.querySelector("#successBox").innerHTML = "Profile information updated!";
        document.querySelector("#successBox").style.display = "block"
    } else {
        document.querySelector("#errorBox").innerHTML = "Error updating profile information.";
        document.querySelector("#errorBox").style.display = "block"
    }
})

for (let parentRemoveButton of document.querySelectorAll(".remove-parent")) {
    parentRemoveButton.addEventListener("click", () => {
        document.querySelector("#removeParentConfirm").removeId = parentRemoveButton.getAttribute("parentId");
        document.querySelector("#removeParentConfirmText").innerHTML = `Are you sure you want to remove ${parentRemoveButton.getAttribute("parentName")} as a parent?`
    })
}

document.querySelector("#removeParent").addEventListener("click", async () => {
    console.log(document.querySelector("#removeParentConfirm").removeId)
    let res = await fetch(window.location.href + "/removeParent", {
        method: "POST",
        body: JSON.stringify({
            _id: document.querySelector("#removeParentConfirm").removeId
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
})