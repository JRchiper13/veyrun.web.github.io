/* =========================================
   VEYRUN - JAVASCRIPT
========================================= */


/* ================= HEADER ================= */

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


/* ================= MENU MOBILE ================= */

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

menuBtn.addEventListener("click", () => {

    navbar.classList.toggle("active");

});


/* Cerrar menú al seleccionar una sección */

document.querySelectorAll(".navbar a").forEach(link => {

    link.addEventListener("click", () => {

        navbar.classList.remove("active");

    });

});


/* ================= BUSCADOR ================= */

const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const closeSearch = document.getElementById("closeSearch");

searchBtn.addEventListener("click", () => {

    searchBox.classList.add("active");

    document.getElementById("searchInput").focus();

});

closeSearch.addEventListener("click", () => {

    searchBox.classList.remove("active");

});


/* ================= FILTROS ================= */

const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");

filters.forEach(filter => {

    filter.addEventListener("click", () => {

        filters.forEach(btn => {
            btn.classList.remove("active");
        });

        filter.classList.add("active");

        const category = filter.dataset.filter;

        products.forEach(product => {

            if (
                category === "all" ||
                product.dataset.category === category
            ) {

                product.style.display = "block";

            } else {

                product.style.display = "none";

            }

        });

    });

});


/* ================= BUSCAR PRODUCTOS ================= */

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {

    const search = searchInput.value.toLowerCase();

    products.forEach(product => {

        const name =
            product.querySelector("h3").textContent.toLowerCase();

        if (name.includes(search)) {

            product.style.display = "block";

        } else {

            product.style.display = "none";

        }

    });

});


/* ================= CARRITO ================= */

let cart = JSON.parse(
    localStorage.getItem("veyrunCart")
) || [];

const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");


/* Abrir carrito */

cartBtn.addEventListener("click", () => {

    cartPanel.classList.add("active");

});


/* Cerrar carrito */

closeCart.addEventListener("click", () => {

    cartPanel.classList.remove("active");

});


/* Añadir productos */

document.querySelectorAll(".add-cart").forEach(button => {

    button.addEventListener("click", () => {

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        const existing = cart.find(
            item => item.name === name
        );

        if (existing) {

            existing.quantity++;

        } else {

            cart.push({
                name: name,
                price: price,
                quantity: 1
            });

        }

        saveCart();
        renderCart();

        cartPanel.classList.add("active");

    });

});


/* Guardar */

function saveCart() {

    localStorage.setItem(
        "veyrunCart",
        JSON.stringify(cart)
    );

}


/* Mostrar carrito */

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Tu carrito está vacío.</p>';

    }


    let total = 0;
    let quantity = 0;


    cart.forEach((item, index) => {

        total += item.price * item.quantity;

        quantity += item.quantity;


        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `

            <div>

                <strong>${item.name}</strong>

                <p>
                    Bs ${item.price}
                    × ${item.quantity}
                </p>

            </div>

            <button onclick="removeItem(${index})">
                Eliminar
            </button>

        `;

        cartItems.appendChild(div);

    });


    cartTotal.textContent = total;

    cartCount.textContent = quantity;

}


/* Eliminar producto */

function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

    renderCart();

}


/* Inicializar */

renderCart();


/* ================= WHATSAPP ================= */

const checkout = document.getElementById("checkout");

checkout.addEventListener("click", () => {

    if (cart.length === 0) {

        alert("Tu carrito está vacío.");

        return;

    }


    let message =
        "Hola Veyrun 👋%0A%0A" +
        "Quiero realizar este pedido:%0A%0A";


    let total = 0;


    cart.forEach(item => {

        const subtotal =
            item.price * item.quantity;

        total += subtotal;


        message +=
            `• ${item.name} x${item.quantity} - Bs ${subtotal}%0A`;

    });


    message +=
        `%0A💰 Total: Bs ${total}`;


    const phone =
        "591XXXXXXXX";


    window.open(
        `https://wa.me/${phone}?text=${message}`,
        "_blank"
    );

});


/* ================= FAQ ================= */

document.querySelectorAll(".faq-question").forEach(question => {

    question.addEventListener("click", () => {

        const item =
            question.parentElement;

        item.classList.toggle("active");

        const symbol =
            question.querySelector("span");

        symbol.textContent =
            item.classList.contains("active")
                ? "−"
                : "+";

    });

});


/* ================= FORMULARIO ================= */

const contactForm =
    document.getElementById("contactForm");

contactForm.addEventListener("submit", event => {

    event.preventDefault();

    alert(
        "¡Gracias! Tu mensaje fue preparado correctamente."
    );

    contactForm.reset();

});