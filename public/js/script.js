(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

// User-dashboard

const POSITIONSTACK_KEY = "YOUR_POSITIONSTACK_API_KEY";
const vehiclePrices = { 2: 60, 3: 80, 4: 100 };
const maxVehicles = 5;

function updateTotal() {
    let total = 0;
    document.querySelectorAll(".vehicle-type").forEach(select => {
        total += vehiclePrices[select.value] || 0;
    });
    document.getElementById("totalPrice").innerText = total;
    document.getElementById("total_price").value = total;
}

function reindexVehicles() {
    document.querySelectorAll(".vehicle-row").forEach((row, index) => {
        row.dataset.index = index;
        row.querySelector('[name*="[number]"]').name = `vehicles[${index}][number]`;
        row.querySelector('[name*="[type]"]').name = `vehicles[${index}][type]`;
        row.querySelector('[name*="[fuel]"]').name = `vehicles[${index}][fuel]`;
        row.querySelector(".remove-vehicle")
            .classList.toggle("d-none", index === 0);
    });
}

document.getElementById("addVehicleBtn").addEventListener("click", () => {
    const container = document.getElementById("vehicles-container");
    if (container.children.length >= maxVehicles) {
        alert("Maximum 5 vehicles allowed");
        return;
    }

    const clone = container.children[0].cloneNode(true);
    clone.querySelectorAll("input").forEach(i => i.value = "");
    container.appendChild(clone);

    reindexVehicles();
    updateTotal();
});

document.addEventListener("click", e => {
    if (e.target.closest(".remove-vehicle")) {
        e.target.closest(".vehicle-row").remove();
        reindexVehicles();
        updateTotal();
    }
});

document.addEventListener("change", e => {
    if (e.target.classList.contains("vehicle-type")) {
        updateTotal();
    }
});

/* Positionstack Reverse Geocoding */
document.getElementById("useLocationBtn").addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(async position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lon;

        try {
            const res = await fetch(
                `https://api.positionstack.com/v1/reverse?access_key=${"32f5b4088982ff659b071120505473ba"}&query=${lat},${lon}`
            );
            const data = await res.json();

            if (data.data && data.data.length > 0) {
                const p = data.data[0];
                const address = [
                    p.name,
                    p.street,
                    p.locality,
                    p.region,
                    p.postal_code
                ].filter(Boolean).join(", ");
                document.getElementById("address").value = address;
            } else {
                document.getElementById("address").value = "Current location selected";
            }
        } catch {
            alert("Failed to fetch address");
        }
    }, () => {
        alert("Unable to get your location");
    });
});

updateTotal();
