document.addEventListener("DOMContentLoaded", async function () {
    async function getUserUsername() {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User is not authenticated");
            const response = await fetch("http://localhost:3000/api/user", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error("Error fetching user data");
            const data = await response.json();
            return data.username;
        } catch (error) {
            console.error("Error retrieving user username:", error);
            return null;
        }
    }

    function getAds() {
        return JSON.parse(localStorage.getItem("my_ads")) || {};
    }

    function saveAds(ads) {
        localStorage.setItem("my_ads", JSON.stringify(ads));
    }

    let editingAdId = null;

    async function saveAd() {
        let title = document.getElementById("title")?.value.trim();
        let year = document.getElementById("year")?.value.trim();
        let color = document.getElementById("color")?.value.trim();
        let description = document.getElementById("description")?.value.trim();
        let imageFile = document.getElementById("image")?.files[0];

        if (!title || !year || !color || !description || !imageFile) {
            alert("Please fill in all fields and upload an image.");
            return;
        }

        let username = await getUserUsername();
        if (!username) {
            alert("Error retrieving user information.");
            return;
        }

        let ads = getAds();
        if (!ads[username]) ads[username] = [];

        let reader = new FileReader();
        reader.onload = function (e) {
            let imageData = e.target.result;

            if (editingAdId) {
                let ad = ads[username].find(car => car.id === editingAdId);
                if (!ad) {
                    alert("Error: Ad not found.");
                    return;
                }
                Object.assign(ad, { name: title, year, color, description, image: imageData });
                editingAdId = null;
            } else {
                ads[username].push({
                    id: Date.now(),
                    name: title,
                    year,
                    color,
                    description,
                    image: imageData,
                    seller: username,
                    rating: 5
                });
            }

            saveAds(ads);
            displayAds();
            closePopup();
        };
        reader.readAsDataURL(imageFile);
    }

    async function displayAds() {
        let adsList = document.getElementById("ads-list");
        adsList.innerHTML = "";

        let username = await getUserUsername();
        let ads = getAds();
        let userAds = ads[username] || [];

        if (!userAds.length) {
            adsList.innerHTML = '<p class="no-results">You have no ads yet.</p>';
            return;
        }

        adsList.innerHTML = userAds.map(car => `
            <div class="car-item" data-id="${car.id}">
                <img src="${car.image || '/images/default_car.jpg'}" alt="${car.name}">
                <h3>${car.name}</h3>
                <p><strong>Year:</strong> ${car.year}</p>
                <p><strong>Color:</strong> ${car.color}</p>
                <p><strong>Seller:</strong> <a href="#">${car.seller || "Unknown"}</a></p>
                <p><strong>Rating:</strong> ⭐ ${car.rating}</p>
                <p>${car.description}</p>
                <button class="edit-button" onclick="editAd(${car.id})">Edit</button>
                <button class="delete-button" onclick="deleteAd(${car.id})">Delete</button>
            </div>
        `).join('');
    }

    async function editAd(id) {
        let username = await getUserUsername();
        let ads = getAds();
        let ad = (ads[username] || []).find(car => car.id === id);

        if (!ad) {
            alert("Ad not found!");
            return;
        }

        document.getElementById("title").value = ad.name;
        document.getElementById("year").value = ad.year;
        document.getElementById("color").value = ad.color;
        document.getElementById("description").value = ad.description;
        editingAdId = id;
        openPopup();
    }

    async function deleteAd(id) {
        let username = await getUserUsername();
        let ads = getAds();
        if (!ads[username]) return;

        if (confirm("Are you sure you want to delete this ad?")) {
            ads[username] = ads[username].filter(car => car.id !== id);
            saveAds(ads);
            displayAds();
        }
    }

    function togglePopup(show) {
        let popup = document.getElementById("popup");
        if (popup) popup.style.display = show ? "block" : "none";
    }

    function openPopup() { togglePopup(true); }
    function closePopup() { togglePopup(false); }

    function ensureCreateAdButton() {
        let buttonContainer = document.getElementById("create-ad-container");
        if (!buttonContainer || document.getElementById("create-ad-button")) return;

        let createButton = document.createElement("button");
        createButton.textContent = "Create Ad";
        createButton.classList.add("btn-create-primary");
        createButton.id = "create-ad-button";
        createButton.onclick = openPopup;
        buttonContainer.appendChild(createButton);
    }

    window.saveAd = saveAd;
    window.displayAds = displayAds;
    window.editAd = editAd;
    window.deleteAd = deleteAd;
    window.openPopup = openPopup;
    window.closePopup = closePopup;

    await displayAds();
    ensureCreateAdButton();
});