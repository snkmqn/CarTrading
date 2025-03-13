document.addEventListener("DOMContentLoaded", async function () {
    const getUserUsername = async () => {
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
            return (await response.json()).username;
        } catch (error) {
            console.error("Error retrieving user username:", error);
            return null;
        }
    };

    const getAds = () => JSON.parse(localStorage.getItem("my_ads")) || {};
    const saveAds = ads => localStorage.setItem("my_ads", JSON.stringify(ads));

    let editingAdId = null;

    async function saveAd() {
        const title = document.getElementById("title")?.value.trim();
        const year = document.getElementById("year")?.value.trim();
        const color = document.getElementById("color")?.value.trim();
        const description = document.getElementById("description")?.value.trim();
        const imageFile = document.getElementById("image")?.files[0];

        if (!title || !year || !color || !description || !imageFile) {
            alert("Please fill in all fields and upload an image.");
            return;
        }

        const username = await getUserUsername();
        if (!username) alert("Error retrieving user information.");

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
                Object.assign(ad, {name: title, year, color, description, image: imageData});
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

            document.getElementById("title").value = "";
            document.getElementById("year").value = "";
            document.getElementById("color").value = "";
            document.getElementById("description").value = "";
            document.getElementById("image").value = "";

            saveAds(ads);
            displayAds();
            togglePopup(false);
        };
        reader.readAsDataURL(imageFile);
    }

    async function displayAds() {
        const adsList = document.getElementById("ads-list");
        adsList.innerHTML = "";

        const username = await getUserUsername();
        const ads = getAds();
        const userAds = ads[username] || [];

        if (!userAds.length) {
            adsList.innerHTML = '<p class="no-results">You have no ads yet.</p>';
            return;
        }

        adsList.innerHTML = userAds.length
            ? userAds.map(car => `
                <div class="car-item" data-id="${car.id}">
                    <img src="${car.image}" alt="${car.name}">
                    <h3>${car.name}</h3>
                    <p><strong>Year:</strong> ${car.year}</p>
                    <p><strong>Color:</strong> ${car.color}</p>
                    <p><strong>Seller:</strong> <a href="/profile">${car.seller || "Unknown"}</a></p>
                    <p><strong>Rating:</strong> ⭐ ${car.rating}</p>
                    <p>${car.description}</p>
                    <button class="edit-button" onclick="editAd(${car.id})">Edit</button>
                    <button class="delete-button" onclick="deleteAd(${car.id})">Delete</button>
                </div>
            `).join("")
            : '<p class="no-results">You have no ads yet.</p>';
    }

    async function editAd(id) {
        const username = await getUserUsername();
        const ads = getAds();
        const ad = (ads[username] || []).find(car => car.id === id);

        if (!ad) {
            alert("Ad not found!");
            return;
        }

        document.getElementById("title").value = ad.name;
        document.getElementById("year").value = ad.year;
        document.getElementById("color").value = ad.color;
        document.getElementById("description").value = ad.description;
        editingAdId = id;
        togglePopup(true)
    }

    async function deleteAd(id) {
        const username = await getUserUsername();
        const ads = getAds();
        if (!ads[username]) return;

        if (confirm("Are you sure you want to delete this ad?")) {
            ads[username] = ads[username].filter(car => car.id !== id);
            saveAds(ads);
            await displayAds();
        }
    }

    function togglePopup(show) {
        const popup = document.getElementById("popup");
        if (popup) popup.style.display = show ? "block" : "none";
    }

    window.saveAd = saveAd;
    window.displayAds = displayAds;
    window.editAd = editAd;
    window.deleteAd = deleteAd;
    window.togglePopup = togglePopup;

    await displayAds();
});