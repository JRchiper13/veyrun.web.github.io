/* =========================================
   VEYRUN - JAVASCRIPT
========================================= */

const VEYRUN_WHATSAPP = "59176608557";


/* ================= HEADER ================= */

const header = document.getElementById("header");

if (header) {
    window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 50);
    }, { passive: true });
}


/* ================= MENU MOBILE ================= */

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

if (menuBtn && navbar) {
    menuBtn.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("active");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
        menuBtn.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });
}


/* Cerrar menú al seleccionar una sección */

document.querySelectorAll(".navbar a").forEach(link => {
    link.addEventListener("click", () => {
        navbar?.classList.remove("active");
        menuBtn?.setAttribute("aria-expanded", "false");
        menuBtn?.setAttribute("aria-label", "Abrir menú");
    });
});


/* ================= BUSCADOR ================= */

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");
const products = [...document.querySelectorAll(".product-card")];
let activeCategory = "all";

function filterProducts(search = "") {
    const normalizedSearch = search.trim().toLowerCase();

    products.forEach(product => {
        const name = product.querySelector("h3")?.textContent.toLowerCase() ?? "";
        const matchesCategory = activeCategory === "all" || product.dataset.category === activeCategory;
        const matchesSearch = name.includes(normalizedSearch);
        product.hidden = !matchesCategory || !matchesSearch;
    });
}

if (searchBtn && searchBox && searchInput) {
    searchBtn.addEventListener("click", () => {
        searchBox.classList.add("active");
        searchBtn.setAttribute("aria-expanded", "true");
        searchInput.focus();
    });
}

if (closeSearch && searchBox && searchBtn && searchInput) {
    closeSearch.addEventListener("click", () => {
        searchBox.classList.remove("active");
        searchBtn.setAttribute("aria-expanded", "false");
        searchInput.value = "";
        products.forEach(product => {
            product.hidden = false;
        });
    });
}


/* ================= FILTROS ================= */

const filters = document.querySelectorAll(".filter");

filters.forEach(filter => {
    filter.addEventListener("click", () => {
        filters.forEach(btn => {
            btn.classList.remove("active");
        });
        filter.classList.add("active");
        activeCategory = filter.dataset.filter;
        filterProducts(searchInput?.value ?? "");
    });
});


/* ================= BUSCAR PRODUCTOS ================= */

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const search = searchInput.value.trim().toLowerCase();
        if (search) {
            activeCategory = "all";
            filters.forEach(button => {
                button.classList.toggle("active", button.dataset.filter === "all");
            });
        }
        filterProducts(search);

        if (search) {
            document.getElementById("productos")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && searchBox?.classList.contains("active")) {
            closeSearch?.click();
        }
    });
}


/* ================= CARRITO ================= */

const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkout = document.getElementById("checkout");

function normalizeProductId(value, fallbackName = "") {
    if (typeof value === "string") {
        try {
            const normalizedUrl = new URL(value, location.href);
            const productMatch = normalizedUrl.pathname.match(/producto\/[^/]+$/);
            if (productMatch) return productMatch[0];
        } catch {
            const productMatch = value.match(/producto\/[^/]+$/);
            if (productMatch) return productMatch[0];
        }
    }

    return fallbackName
        ? fallbackName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
        : "";
}

        let cart = [];

        try {
            const savedCart = JSON.parse(localStorage.getItem("veyrunCart"));
            if (Array.isArray(savedCart)) {
                cart = savedCart.filter(item =>
                    item && typeof item.id === "string" &&
                    typeof item.name === "string" &&
                    Number.isFinite(Number(item.price)) &&
                    Number.isInteger(item.quantity) &&
                    item.quantity > 0
                ).map(item => ({
                    ...item,
                    price: Number(item.price),
                    id: normalizeProductId(item.id, item.name)
                }));
            }
        } catch {
            cart = [];
        }

        function saveCart() {
            localStorage.setItem("veyrunCart", JSON.stringify(cart));
        }

        function getCardData(card) {
            const name = card.querySelector("h3")?.textContent.trim() ?? "Producto Veyrun";
            const priceText = card.querySelector(".price")?.textContent ?? "0";
                    const price = Number(priceText.replace(/[^\d,.-]/g, "").replace(",", "."));
            const link = card.querySelector(".product-link")?.getAttribute("href") ?? "";
            const imageSource = card.querySelector("img")?.getAttribute("src") ?? "";

            return {
                id: normalizeProductId(link, name),
                name,
                price,
                image: imageSource ? new URL(imageSource, location.href).href : "",
                link
            };
        }

        function syncCartPrices() {
            const cardDataById = new Map(products.map(card => [getCardData(card).id, getCardData(card)]));

            cart.forEach(item => {
                const currentProduct = cardDataById.get(normalizeProductId(item.id, item.name));
                if (currentProduct && (!Number.isFinite(item.price) || item.price <= 0)) {
                    item.price = currentProduct.price;
                }
            });
        }

        syncCartPrices();

        products.forEach(card => {
            const productActions = card.querySelector(".product-info");
            const addButton = document.createElement("button");
            addButton.className = "add-cart";
            addButton.type = "button";
            addButton.textContent = "Agregar al pedido";
            addButton.setAttribute("aria-label", `Agregar ${getCardData(card).name} al pedido`);

            addButton.addEventListener("click", () => {
                const product = getCardData(card);
                const existing = cart.find(item => item.id === product.id);

                if (existing) {
                    existing.quantity++;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }

                saveCart();
                renderCart();
            
                if (sessionStorage.getItem("veyrunOpenCart") === "true") {
                    sessionStorage.removeItem("veyrunOpenCart");
                    requestAnimationFrame(openCart);
                }
                openCart();
            });

            productActions?.append(addButton);
        });

        function openCart() {
            if (!cartPanel || !cartOverlay || !cartBtn) return;
            cartPanel.classList.add("active");
            cartOverlay.classList.add("active");
            cartPanel.setAttribute("aria-hidden", "false");
            cartBtn.setAttribute("aria-expanded", "true");
        }

        function closeCartPanel() {
            cartPanel.classList.remove("active");
            cartOverlay.classList.remove("active");
            cartPanel.setAttribute("aria-hidden", "true");
            cartBtn.setAttribute("aria-expanded", "false");
        }

        function changeQuantity(id, change) {
            const item = cart.find(product => product.id === id);
            if (!item) return;

            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(product => product.id !== id);
            }

            saveCart();
            renderCart();

            if (sessionStorage.getItem("veyrunOpenCart") === "true") {
                sessionStorage.removeItem("veyrunOpenCart");
                requestAnimationFrame(openCart);
            }
        }

        function removeItem(id) {
            cart = cart.filter(item => item.id !== id);
            saveCart();
            renderCart();
        }

        function renderCart() {
            cartItems.innerHTML = "";
            let total = 0;
            let quantity = 0;

            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío.</p>';
            }

            cart.forEach(item => {
                total += item.price * item.quantity;
                quantity += item.quantity;

                const row = document.createElement("article");
                row.className = "cart-item";

                const image = document.createElement("img");
                image.src = item.image;
                image.alt = "";

                const details = document.createElement("div");
                details.className = "cart-item-details";

                const name = document.createElement("strong");
                name.textContent = item.name;

                const price = document.createElement("span");
                price.textContent = `Bs ${item.price} cada uno`;
                const size = document.createElement("span");
                size.textContent = `Talla: ${item.size || "Sin talla"}`;

                const controls = document.createElement("div");
                controls.className = "quantity-controls";

                const minus = document.createElement("button");
                minus.type = "button";
                minus.textContent = "−";
                minus.setAttribute("aria-label", `Reducir cantidad de ${item.name}`);
                minus.addEventListener("click", () => changeQuantity(item.id, -1));

                const count = document.createElement("span");
                count.textContent = item.quantity;

                const plus = document.createElement("button");
                plus.type = "button";
                plus.textContent = "+";
                plus.setAttribute("aria-label", `Aumentar cantidad de ${item.name}`);
                plus.addEventListener("click", () => changeQuantity(item.id, 1));

                const remove = document.createElement("button");
                remove.className = "remove-cart-item";
                remove.type = "button";
                remove.textContent = "🗑 Eliminar producto";
                remove.setAttribute("aria-label", `Eliminar ${item.name} del carrito`);
                remove.title = `Eliminar ${item.name}`;
                remove.addEventListener("click", () => removeItem(item.id));

                controls.append(minus, count, plus);
                details.append(name);
                details.append(price, size, controls, remove);
                row.append(image, details);
                cartItems.append(row);
            });

            cartTotal.textContent = total.toLocaleString("es-BO", { maximumFractionDigits: 2 });
            cartCount.textContent = quantity;
            cartCount.hidden = quantity === 0;
            checkout.disabled = cart.length === 0;
        }

        cartBtn?.addEventListener("click", openCart);
        closeCart?.addEventListener("click", closeCartPanel);
        cartOverlay?.addEventListener("click", closeCartPanel);

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && cartPanel?.classList.contains("active")) {
                closeCartPanel();
            }
        });

        checkout?.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }

            const checkoutForm = document.getElementById("checkoutForm");
            if (!checkoutForm.reportValidity()) return;

            const name = document.getElementById("customerName").value.trim();
            const phone = document.getElementById("customerPhone").value.trim();
            const city = document.getElementById("customerCity").value.trim();
            const address = document.getElementById("customerAddress").value.trim();
            const note = document.getElementById("customerNote").value.trim();
            const delivery = checkoutForm.querySelector('input[name="delivery"]:checked')?.value ?? "Recojo en tienda";

            let message = "Hola Veyrun 👋\n\nQuiero realizar este pedido:\n";
            let total = 0;

            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                message += `\n• ${item.name} x${item.quantity} - Bs ${subtotal}`;
            });

            message += `\n\n💰 Total: Bs ${total}\n\n¿Está disponible?`;
            message += `\n\nDatos del cliente:\n• Nombre: ${name}\n• Teléfono: ${phone}\n• Ciudad: ${city}\n• Entrega: ${delivery}\n• Dirección: ${address}`;
            if (note) message += `\n• Nota: ${note}`;
            window.open(`https://wa.me/${VEYRUN_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
        });

        renderCart();

        if (sessionStorage.getItem("veyrunOpenCart") === "true") {
            sessionStorage.removeItem("veyrunOpenCart");
            requestAnimationFrame(openCart);
        }

const productSort = document.getElementById("productSort");
productSort?.addEventListener("change", () => {
    const grid = document.getElementById("productsGrid");
    const cards = [...products];
    cards.sort((first, second) => {
        if (productSort.value === "price-low" || productSort.value === "price-high") {
            const firstPrice = Number(first.querySelector(".price")?.textContent.replace(/[^\d]/g, "") || 0);
            const secondPrice = Number(second.querySelector(".price")?.textContent.replace(/[^\d]/g, "") || 0);
            return productSort.value === "price-low" ? firstPrice - secondPrice : secondPrice - firstPrice;
        }
        if (productSort.value === "name") {
            return (first.querySelector("h3")?.textContent || "").localeCompare(second.querySelector("h3")?.textContent || "");
        }
        return 0;
    });
    cards.forEach(card => grid?.append(card));
});

const adminPanel = document.getElementById("adminPanel");
document.getElementById("adminOpenButton")?.addEventListener("click", () => adminPanel?.showModal());

function getAdminCatalog() {
    try {
        return JSON.parse(localStorage.getItem("veyrunAdminCatalog")) || {};
    } catch {
        return {};
    }
}

function saveAdminCatalog(catalog) {
    localStorage.setItem("veyrunAdminCatalog", JSON.stringify(catalog));
}

function applyLocalProductSettings() {
    const catalog = getAdminCatalog();
    products.forEach(card => {
        const name = card.querySelector("h3")?.textContent.trim() || "";
        const settings = catalog[name.toLowerCase()];
        if (!settings) return;
        if (settings.hidden) card.hidden = true;
        if (Number.isFinite(settings.price)) {
            const price = card.querySelector(".price");
            if (price) price.textContent = `Bs ${settings.price}`;
        }
    });
}

document.getElementById("adminApply")?.addEventListener("click", () => {
    const nameInput = document.getElementById("adminName");
    const priceInput = document.getElementById("adminPrice");
    const action = document.getElementById("adminAction");
    const status = document.getElementById("adminStatus");
    const name = nameInput.value.trim().toLowerCase();
    if (!name) {
        status.textContent = "Ingresa el nombre exacto de un producto.";
        return;
    }
    const catalog = getAdminCatalog();
    catalog[name] ??= {};
    if (action.value === "price") {
        const price = Number(priceInput.value);
        if (!Number.isFinite(price) || price < 0) {
            status.textContent = "Ingresa un precio válido.";
            return;
        }
        catalog[name].price = price;
    } else {
        catalog[name].hidden = action.value === "hide";
    }
    saveAdminCatalog(catalog);
    applyLocalProductSettings();
    status.textContent = "Cambios guardados en este navegador.";
});

document.getElementById("adminExport")?.addEventListener("click", () => {
    const status = document.getElementById("adminStatus");
    const catalog = JSON.stringify(getAdminCatalog(), null, 2);
    const blob = new Blob([catalog], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "veyrun-catalogo.json";
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = "Catálogo exportado.";
});

document.getElementById("adminReset")?.addEventListener("click", () => {
    localStorage.removeItem("veyrunAdminCatalog");
    products.forEach(card => card.hidden = false);
    document.getElementById("adminStatus").textContent = "Catálogo restaurado.";
    location.reload();
});

applyLocalProductSettings();


/* ================= FAQ ================= */

document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
        const item = question.parentElement;
        item.classList.toggle("active");
        const symbol = question.querySelector("span");
        symbol.textContent =
            item.classList.contains("active")
                ? "−"
                : "+";
    });
});