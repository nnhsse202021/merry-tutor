//translate subject property into an array
for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
    card.subjectsArr = card.getAttribute("subjects").split(",");
    card.tutee = card.getAttribute("tutee");
    card.tutor = card.getAttribute("tutor");
}
document.querySelector("#filterSubject").addEventListener("input", () => {
    let value = document.querySelector("#filterSubject").value.toLowerCase();
    for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
        if (card.subjectsArr.some((x) => x.startsWith(value))) {
            card.hiddenSubjectFilter = false;
        } else {
            card.hiddenSubjectFilter = true;
        }
    }
    updateCardDisplay();
})

if (document.querySelector("#filterTutee")) document.querySelector("#filterTutee").addEventListener("input", () => {
    let value = document.querySelector("#filterTutee").value.toLowerCase();
    for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
        if (card.tutee.startsWith(value)) {
            card.hiddenTuteeFilter = false;
        } else {
            card.hiddenTuteeFilter = true;
        }
    }
    updateCardDisplay();
})

if (document.querySelector("#filterTutor")) document.querySelector("#filterTutor").addEventListener("input", () => {
    let value = document.querySelector("#filterTutor").value.toLowerCase();
    for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
        if (card.tutor.startsWith(value)) {
            card.hiddenTutorFilter = false;
        } else {
            card.hiddenTutorFilter = true;
        }
    }
    updateCardDisplay();
})

function updateCardDisplay() {
    for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
        card.style.display = card.hiddenTuteeFilter || card.hiddenSubjectFilter || card.hiddenTutorFilter ? "none" : "block";
    }
}