document.addEventListener("DOMContentLoaded", async function () {
    const filterButton = document.getElementById("filterButton");
    const yearInput = document.getElementById("yearInput");
    const colorInput = document.getElementById("colorInput");
    const carList = document.querySelector(".car-list");

    let allCars = [];

    async function fetchCars() {
        try {
            const response = await fetch("/api/cars/all");
            if (!response.ok) throw new Error(`Error fetching: ${response.status}`);

            allCars = await response.json();
            displayCars(allCars);
        } catch (error) {
            console.error("Cars fetching error:", error);
            displayCars([]);
        }
    }

    function applyFilters() {
        const yearFilter = yearInput.value.trim();
        const colorFilter = colorInput.value.trim().toLowerCase();

        if (!yearFilter && !colorFilter) {
            return alert("Please enter at least one parameter before applying filters!")
        }

        const filteredCars = allCars.filter(car =>
            (!yearFilter || String(car.year) === yearFilter) &&
            (!colorFilter || car.color?.toLowerCase() === colorFilter)
        );

        displayCars(filteredCars);

        if (filteredCars.length > 0) {
            carList.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }

    function displayCars(cars) {

        if (!cars || cars.length === 0) {
            carList.innerHTML = '<p class="no-results"> No cars found </p>'
            carList.scrollIntoView({behavior: "smooth", block: "start"});
            return;
        }

        carList.innerHTML = cars.length
            ? cars.map(car => {
                const sellerLink = car.name === "BMW M3" ? "/reviewExample" : "#";
                return `
                    <div class="car-item">
                        <img src="${car.image ? `/images/${car.image}` : '/images/default_car.jpg'}" alt="${car.name}">
                        <h3>${car.name}</h3>
                        <p><strong>Year:</strong> ${car.year || "N/A"}</p>
                        <p><strong>Color:</strong> ${car.color || "N/A"}</p>
                        <p><strong>Seller:</strong> <a href="${sellerLink}">${car.seller || "Unknown"}</a></p>
                        <p><strong>Rating:</strong> ⭐ ${car.rating || "N/A"}</p>
                        <p>${car.description || "No description available"}</p>
                        <button class="contact-button">Contact the seller</button>
                    </div>`;
            }).join("")
            : '<p class="no-results">No cars found</p>';
    }

    await fetchCars();

    filterButton.addEventListener("click", function (event) {
        event.preventDefault();
        applyFilters();
    });

    window.displayCars = displayCars;
});
