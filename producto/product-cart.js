const productTitle = document.querySelector(".info h1");
const productPrice = document.querySelector(".precio");
const productImage = document.getElementById("principal");
const card = document.querySelector(".card");
const whatsappLink = card?.querySelector("a");

const title = productTitle?.textContent.trim() || document.title;
const priceMatch = productPrice?.textContent.match(/\d+(?:[.,]\d{1,2})?/);
const price = priceMatch ? Number(priceMatch[0].replace(",", ".")) : 0;
const imageSource = productImage?.getAttribute("src") || "";
const image = imageSource ? new URL(imageSource, location.href).href : "";
const productFile = location.pathname.replace(/.*\//, "");
const id = `producto/${productFile}`;
const sizes = [...document.querySelectorAll(".talla")];
let selectedSize = sizes.find(size => size.classList.contains("active"))?.textContent.trim() || sizes[0]?.textContent.trim() || "Sin talla";

sizes.forEach(size => {
    size.tabIndex = 0;
    size.setAttribute("role", "button");
    size.addEventListener("click", () => {
        sizes.forEach(option => option.classList.remove("active"));
        size.classList.add("active");
        selectedSize = size.textContent.trim();
    });
    size.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            size.click();
        }
    });
});

const addButton = document.createElement("button");
addButton.type = "button";
addButton.className = "add-cart-button";
addButton.textContent = "Agregar al carrito";

function readCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("veyrunCart"));
        if (!Array.isArray(saved)) return [];

        return saved.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            Number.isFinite(item.price) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        ).map(item => ({
            ...item,
            id: item.id.includes("/productos") || item.id.includes("/producto")
                ? `producto/${item.id.match(/[^/]+$/)?.[0] || item.id}`
                : item.id
        }));
    } catch {
        return [];
    }
}

addButton.addEventListener("click", () => {
    const cart = readCart();
    const existing = cart.find(item => item.id === id && (item.size || "Sin talla") === selectedSize);

    if (existing) {
        existing.quantity++;
        existing.price = price;
    } else {
        cart.push({ id, name: title, price, image, size: selectedSize, quantity: 1 });
    }

    localStorage.setItem("veyrunCart", JSON.stringify(cart));
    addButton.textContent = "Agregado al carrito ✓";
    setTimeout(() => {
        addButton.textContent = "Agregar al carrito";
    }, 1800);
});

if (card) {
    card.append(addButton);
}

const cartStatus = document.createElement("a");
cartStatus.className = "detail-cart-status";
cartStatus.href = "../index.html#productos";

function updateCartStatus() {
    const cart = readCart();
    const quantity = cart.reduce((total, item) => total + item.quantity, 0);
    cartStatus.innerHTML = `🛒 <span>Ver carrito</span> <strong>${quantity}</strong>`;
}

cartStatus.addEventListener("click", event => {
    event.preventDefault();
    sessionStorage.setItem("veyrunOpenCart", "true");
    location.href = "../index.html#productos";
});

document.body.append(cartStatus);
updateCartStatus();

addButton.addEventListener("click", updateCartStatus);

if (whatsappLink) {
    const message = encodeURIComponent(`Hola Veyrun, quiero comprar: ${title} - Bs ${price}`);
    whatsappLink.href = `https://wa.me/59176608557?text=${message}`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
}
