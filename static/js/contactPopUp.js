document.addEventListener("DOMContentLoaded", function () {
    const popup = document.createElement("div");

    popup.id = "contact-popup";
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Contact the seller</h2>
            <textarea id="message" placeholder="Write your message..."></textarea>
            <button id="sendMessage">Send</button>
            <button id="closePopup">Close</button>
        </div>
    `;
    document.body.appendChild(popup);

    function isUserLoggedIn() {
        return localStorage.getItem("token") !== null || sessionStorage.getItem("token") !== null;
    }

    const notification = document.createElement("div");
    notification.id = "notification";
    document.body.appendChild(notification);

    document.getElementById("closePopup").addEventListener("click", function () {
        popup.style.display = "none"
    })

    function showNotification(text, type) {
        notification.innerHTML = text;
        notification.className = type;
        notification.style.display = "block";
        notification.style.opacity = "1";

        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                notification.style.display = "none";
            }, 500);
        }, 2000);
    }

    document.body.addEventListener("click", function (event) {
        const target = event.target
        if (target.classList.contains("contact-button")) {
            if (!isUserLoggedIn()) {
                alert("You need to log in first!");
                return;
            }
            popup.style.display = "flex";
        }
        if (target.id === "closePopup") {
            popup.style.display = "none";
        }
        if (target.id === "sendMessage") {
            const message = document.getElementById("message").value.trim();
            if (!message) {
                showNotification("Please enter a message", "error")
                return;
            }
            showNotification("Message sent successfully!", "success");
            document.getElementById("message").value = "";
            popup.style.display = "none";
        }
        if (target.id === "logoutButton") {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
        }
    })
})