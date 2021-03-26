//translate subject property into an array
for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
    card.subjectsArr = card.getAttribute("subjects").split(",");
}
document.querySelector("#filterSubject").addEventListener("input", () => {
    let value = document.querySelector("#filterSubject").value.toLowerCase();
    for (let card of document.querySelectorAll("#sessionSummaryCards .card")) {
        if (card.subjectsArr.some((x) => x.startsWith(value))) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    }
})