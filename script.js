function toggleMenu() {
    var menu = document.getElementById("navbar-menu");
    menu.classList.toggle("active");
}

function toggleProfile() {
    var profile = document.getElementById("profile-menu");
    profile.classList.toggle("active");
}

function toggleCart() {
    var cartSidebar = document.querySelector(".cart-sidebar");
    var currentRight = window.getComputedStyle(cartSidebar).right; // Get computed style

    if (window.innerWidth <= 900) {
        //for 900px or smaller
        if (currentRight === "0px") {
            cartSidebar.style.right = "-85%";
        } else {
            cartSidebar.style.right = "0px";
        }
    } else {
        //for screens larger than 900px
        if (currentRight === "0px") {
            cartSidebar.style.right = "-30%";
        } else {
            cartSidebar.style.right = "0px";
        }
    }
}

function login() {
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;

    const storedUsername = localStorage.getItem("signUpUsername");
    const storedPassword = localStorage.getItem("signUpPassword");

    if (username === storedUsername && password === storedPassword) {
        localStorage.setItem("loggedInUser", username);
        alert(`Hi there, ${username}! You are now logged in.`);
        window.location.href = "index.html";
    } else {
        alert("Invalid username or password. Please try again.");
    }
}

function signUp() {
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const retypePassword = document.getElementById('reg-retype-password').value;

    if (password !== retypePassword) {
        alert("Uh oh! Passwords do not match!");
        return;
    }

    localStorage.setItem("signUpEmail", email);
    localStorage.setItem("signUpUsername", username);
    localStorage.setItem("signUpPassword", password);

    alert("Registration successful! You can now log in.");
    window.location.href = `login.html?username=${encodeURIComponent(username)}`;
}

function logout() {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        alert("No user is currently logged in.");
        return;
    }

    alert(`${loggedInUser}, you have been logged out.`);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("cartData");
    window.location.href = "login.html";
}

function redirectToCart() {
    window.location.href = "cart.html";
}


document.addEventListener("DOMContentLoaded", function () {
    var cartItems = document.getElementById("cartItems");
    var itemCount = document.getElementById("itemCount");
    var addCartButtons = document.querySelectorAll(".addCart");
    var productItems = document.querySelectorAll(".product-item");
    var cartDropArea = document.getElementById("cartDropArea");

    loadCartFromLocalStorage();

    addCartButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var productName = button.getAttribute("product-name");
            var productPrice = button.getAttribute("product-price");
            addToCart(productName, productPrice);
        });
    });

    productItems.forEach(function (item) {
        item.setAttribute("draggable", true);

        item.addEventListener("dragstart", function (event) {
            var productName = item.querySelector("h4").innerText;
            var productPrice = item.querySelector("p").innerText.replace("₱", "");
            event.dataTransfer.setData("text", JSON.stringify({
                name: productName,
                price: productPrice
            }));
        });
    });

    cartDropArea.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    cartDropArea.addEventListener("drop", function (event) {
        event.preventDefault();
        var data = JSON.parse(event.dataTransfer.getData("text"));
        addToCart(data.name, data.price);
    });

    function addToCart(name, price) {
        var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
        for (var i = 0; i < cartItemNames.length; i++) {
            if (cartItemNames[i].innerText === name) {
                var quantityInput = cartItemNames[i].parentElement.querySelector(".cart-quantity-input");
                quantityInput.value = parseInt(quantityInput.value) + 1;
                updateItemCount();
                updateTotalAmount();
                saveCartToLocalStorage();
                return;
            }
        }

        var cartItem = document.createElement("li");
        cartItem.className = "cart-row";
        cartItem.innerHTML = `
            <span class="cart-item-title">${name}</span>
            <span class="cart-price">₱${price}</span>
            <div class="cart-quantity">
                <input class="cart-quantity-input" type="number" value="1" min="1">
                <button class="btn-remove">X</button>
            </div>
        `;
        cartItems.appendChild(cartItem);

        //event listener for new cart item
        cartItem.querySelector(".cart-quantity-input").addEventListener("change", function () {
            if (isNaN(this.value) || this.value <= 0) {
                this.value = 1;
            }
            updateItemCount();
            updateTotalAmount();
            saveCartToLocalStorage();
        });

        cartItem.querySelector(".btn-remove").addEventListener("click", function () {
            cartItem.remove();
            updateItemCount();
            updateTotalAmount();
            saveCartToLocalStorage();
        });

        updateItemCount();
        updateTotalAmount();
        saveCartToLocalStorage();
    }

    function updateItemCount() {
        var cartRows = cartItems.getElementsByClassName("cart-row");
        var totalItems = 0;

        for (var i = 0; i < cartRows.length; i++) {
            var quantityInput = cartRows[i].querySelector(".cart-quantity-input");
            totalItems += parseInt(quantityInput.value);
        }

        itemCount.textContent = totalItems + " items";
    }

    function updateTotalAmount() {
        var cartRows = cartItems.getElementsByClassName("cart-row");
        var totalAmount = 0;

        for (var i = 0; i < cartRows.length; i++) {
            var priceElement = cartRows[i].querySelector(".cart-price");
            var quantityInput = cartRows[i].querySelector(".cart-quantity-input");

            var price = parseFloat(priceElement.innerText.replace("₱", ""));
            var quantity = parseInt(quantityInput.value);

            totalAmount += price * quantity;
        }

        var totalAmountElement = document.getElementById("totalAmount");
        totalAmountElement.textContent = "TOTAL: ₱" + totalAmount.toFixed(2);
    }

    function saveCartToLocalStorage() {
        var cartRows = cartItems.getElementsByClassName("cart-row");
        var cartData = [];

        for (var i = 0; i < cartRows.length; i++) {
            var title = cartRows[i].querySelector(".cart-item-title").innerText;
            var price = cartRows[i].querySelector(".cart-price").innerText.replace("₱", "");
            var quantity = cartRows[i].querySelector(".cart-quantity-input").value;

            cartData.push({ title, price, quantity });
        }

        localStorage.setItem("cartData", JSON.stringify(cartData));
    }

    function loadCartFromLocalStorage() {
        var cartData = JSON.parse(localStorage.getItem("cartData")) || [];

        cartData.forEach(function (item) {
            var cartItem = document.createElement("li");
            cartItem.className = "cart-row";
            cartItem.innerHTML = `
                <span class="cart-item-title">${item.title}</span>
                <span class="cart-price">₱${item.price}</span>
                <div class="cart-quantity">
                    <input class="cart-quantity-input" type="number" value="${item.quantity}" min="1">
                    <button class="btn-remove">X</button>
                </div>
            `;
            cartItems.appendChild(cartItem);

            cartItem.querySelector(".cart-quantity-input").addEventListener("change", function () {
                if (isNaN(this.value) || this.value <= 0) {
                    this.value = 1;
                }
                updateItemCount();
                updateTotalAmount();
                saveCartToLocalStorage();
            });

            cartItem.querySelector(".btn-remove").addEventListener("click", function () {
                cartItem.remove();
                updateItemCount();
                updateTotalAmount();
                saveCartToLocalStorage();
            });
        });

        updateItemCount();
        updateTotalAmount();
    }
});

document.addEventListener('click', function (event) {
    const navbarMenu = document.getElementById('navbar-menu');
    const profileMenu = document.getElementById('profile-menu');
    const hamburger = document.querySelector('.hamburger');
    const profileButton = document.querySelector('.navbar-right .btn');
    const profileIcon = document.querySelector('.profile-icon');

    if (!navbarMenu.contains(event.target) && !hamburger.contains(event.target)) {
        navbarMenu.classList.remove("active");
    }

    if (
        !profileMenu.contains(event.target) &&
        !profileButton.contains(event.target) &&
        !profileIcon.contains(event.target)
    ) {
        profileMenu.classList.remove("active");
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const greetingElement = document.getElementById("greeting");
    if (greetingElement) {
        const params = new URLSearchParams(window.location.search);
        const name = params.get("username");

        if (name) {
            localStorage.setItem("loggedInUser", name);
            greetingElement.textContent = `Hi there, ${name}!`;
        } else {
            const username = localStorage.getItem("loggedInUser");
            if (username) {
                greetingElement.textContent = `Hi there, ${username}!`;
            } else {
                greetingElement.textContent = "No user logged in.";
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const requestQuoteButton = document.querySelector(".btn[href='requestQuote.html']");
    const quoteOverlay = document.getElementById("quoteOverlay");
    const closeQuoteButton = document.getElementById("closeQuote");

    requestQuoteButton.addEventListener("click", function (event) {
        event.preventDefault(); //prevent navigation
        quoteOverlay.classList.add("active");
    });

    closeQuoteButton.addEventListener("click", function () {
        quoteOverlay.classList.remove("active");
    });

    quoteOverlay.addEventListener("click", function (event) {
        if (event.target === quoteOverlay) {
            quoteOverlay.classList.remove("active");
        }
    });
});


let timer;

function submitPayment() {
    const name = document.getElementById('name').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const cvv = document.getElementById('cvv').value.trim();

    if (!name || !cardNumber || !month || !year || !cvv) {
        alert("Please fill in all required fields.");
        return;
    }

    const paymentSuccess = true; //change to false to simulate failure

    if (paymentSuccess) {
        document.getElementById('paymethod').style.display = 'none';
        document.querySelector('.card-details').style.display = 'none';
        document.getElementById('success').style.display = 'flex';
    } else {
        document.getElementById('paymethod').style.display = 'none';
        document.querySelector('.card-details').style.display = 'none';
        document.getElementById('failed').style.display = 'flex';
    }

    let countdown = 10;
    timer = setInterval(() => {
        countdown--;
        const visibleCountdown = document.querySelector('.confirmation[style*="flex"] #countdown');
        if (visibleCountdown) {
            visibleCountdown.innerText = countdown;
        }
        if (countdown === 0) {
            clearInterval(timer);
            window.location.href = 'index.html';
        }
    }, 1000);
}

function cancelRedirect() {
    clearInterval(timer);
}


const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");

for (let m = 1; m <= 12; m++) {
    const monthValue = m.toString().padStart(2, '0');
    const option = document.createElement("option");
    option.value = monthValue;
    option.textContent = monthValue;
    monthSelect.appendChild(option);
}

const currentYear = new Date().getFullYear();
for (let y = currentYear; y <= currentYear + 10; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
}