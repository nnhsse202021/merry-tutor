document.querySelector("#submitProfile").addEventListener("click", async () => {
    let res = await fetch(window.location.href + "/update", { //send data to server
        method: "POST",
        body: new URLSearchParams(new FormData(document.querySelector("#profile")))
    })
    hideAlerts()
    if (await res.json()) {
        document.querySelector("#successBox").innerHTML = "Profile information updated!";
        document.querySelector("#successBox").style.display = "block"
    } else {
        document.querySelector("#errorBox").innerHTML = "Error updating profile information (this may be because there is no information to update).";
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
    hideAlerts()
    if (await res.json()) {
        window.location.reload();
    } else {
        document.querySelector("#errorBox").innerHTML = "Error removing parent.";
        document.querySelector("#errorBox").style.display = "block"
    }
})

document.querySelector("#addParentBtn").addEventListener("click", async () => {
    let res = await fetch(window.location.href + "/addParent", { //send data to server
        method: "POST",
        body: new URLSearchParams(new FormData(document.querySelector("#addParent")))
    })
    hideAlerts()
    if (await res.json()) {
        window.location.reload();
    } else {
        document.querySelector("#errorBox").innerHTML = "Error adding parent.";
        document.querySelector("#errorBox").style.display = "block"
    }
})

function hideAlerts() {
    for (let alert of document.querySelector("#profileAlerts").children) {
        alert.style.display = "none";
    }
}