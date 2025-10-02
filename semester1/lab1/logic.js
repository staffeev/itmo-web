let showcaseHTML = document.querySelector('.showcase');
let cartDiv = document.querySelector('.cart');
let cartHTML = document.querySelector('.cart-products');
let totalCartSum = document.querySelector('#total-cart-sum');
let totalSumSpan = document.getElementById('total-sum-span');
let checkOutBtn = document.querySelector('.check-out');
let containerHTML = document.querySelector('.container');

let cartIcon = document.querySelector('.icon-cart');
let closeCartBtn = document.querySelector(".close-cart-btn");


let modal = document.querySelector('.order-modal');
let openFormBtn = document.querySelector('.open-form');
let closeModalBtn = document.querySelector('.close-modal');
let orderForm = document.querySelector('.order-form');
let formSubmitBtn = document.querySelector('.submit-btn');
let phoneError = document.querySelector('.phone-error');

let products = [];
let cart_products = [];


function updateProductListHTML() {
    showcaseHTML.innerHTML = ''; 
    if (!products.length) return;

    products.forEach(product => {
        // контейнер для товара
        let newProductHTML = document.createElement('div');
        newProductHTML.classList.add('shop-product');
        newProductHTML.dataset.id = product.id;
        // картинка
        let img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
        // название
        let title = document.createElement('h3');
        title.textContent = product.name;
        // цена
        let price = document.createElement('div');
        price.classList.add('product-price');
        price.textContent = `${product.price} р`;
        // кнопка
        const button = document.createElement('button');
        button.classList.add('add-to-cart');
        button.textContent = '+';

        newProductHTML.appendChild(img);
        newProductHTML.appendChild(title);
        newProductHTML.appendChild(price);
        newProductHTML.appendChild(button);
        showcaseHTML.appendChild(newProductHTML);
    });
}

function formatPrice(num) {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}


function updateCartHTML() {
    cartHTML.innerHTML = '';
    let totalSum = 0.0;

    cart_products.forEach(product => {
        let infoProduct = products.find(value => value.id == product.product_id);

        let cartProductHTML = document.createElement('div');
        cartProductHTML.classList.add('cart-product');
        cartProductHTML.dataset.id = product.product_id;
        // картинка
        let img = document.createElement('img');
        img.src = infoProduct.image;
        img.alt = infoProduct.name;
        // название
        let nameDiv = document.createElement('div');
        nameDiv.classList.add('cart-product-name');
        nameDiv.textContent = infoProduct.name;
        // цена
        let priceDiv = document.createElement('div');
        priceDiv.classList.add('cart-product-total-price');
        priceDiv.textContent = `${infoProduct.price * product.quantity} р`;
        // количество
        let quantityDiv = document.createElement('div');
        quantityDiv.classList.add('cart-product-quantity');
        // изменение количества
        let lessBtn = document.createElement('span');
        lessBtn.classList.add('less');
        lessBtn.textContent = '<';
        let quantitySpan = document.createElement('span');
        quantitySpan.textContent = product.quantity;
        let moreBtn = document.createElement('span');
        moreBtn.classList.add('more');
        moreBtn.textContent = '>';

        quantityDiv.appendChild(lessBtn);
        quantityDiv.appendChild(quantitySpan);
        quantityDiv.appendChild(moreBtn);

        // кнопка удаления
        let deleteDiv = document.createElement('div');
        deleteDiv.classList.add('delete-from-cart');
        let deleteBtn = document.createElement('span');
        deleteBtn.classList.add('delete-from-cart-btn');
        deleteBtn.textContent = '×';

        deleteDiv.appendChild(deleteBtn);

        cartProductHTML.appendChild(img);
        cartProductHTML.appendChild(nameDiv);
        cartProductHTML.appendChild(priceDiv);
        cartProductHTML.appendChild(quantityDiv);
        cartProductHTML.appendChild(deleteDiv);
        cartHTML.appendChild(cartProductHTML);

        totalSum += infoProduct.price * product.quantity;
    });
    // апдейт инфы о количестве и сумме
    totalCartSum.innerText = formatPrice(totalSum) + ' р';
    totalSumSpan.innerText = `${totalSum} р`;
    // сохранить в localStorage корзину
    localStorage.setItem('cart', JSON.stringify(cart_products));
    // активность кнопки оформления заказа
    checkOutBtn.disabled = cart_products.length === 0;
}


function addToCart(product_id){
    let index_in_cart = cart_products.findIndex((value) => value.product_id == product_id);

    if(!cart_products.length){ // корзина пуста
        cart_products = [
            {
                product_id: product_id,
                quantity: 1
            }
        ]
    }else if(index_in_cart == -1){ // в корзине нет этого товара
        cart_products.push({
                product_id: product_id,
                quantity: 1
            });
    }else{ // продукт уже есть в корзине
        cart_products[index_in_cart].quantity++;
    }   
    updateCartHTML();
    
}


function changeQuantity(product_id, operation){
    indexProduct = cart_products.findIndex(value => value.product_id == product_id);
    if(indexProduct == -1){
        return;
    }
    if(cart_products[indexProduct].quantity + operation == 0){
        cart_products.splice(indexProduct, 1);
    }else{
        cart_products[indexProduct].quantity += operation;
    }
    updateCartHTML();
}


function deleteFromCart(product_id){
    indexProduct = cart_products.findIndex(value => value.product_id == product_id);
    cart_products.splice(indexProduct, 1);
    updateCartHTML(); 
}


showcaseHTML.addEventListener('click', event => {
    let element = event.target;
    if(element.classList.contains('add-to-cart')){
        let product_id = element.parentElement.dataset.id;
        addToCart(product_id);
    }
})

// изменение количества товаров
cartHTML.addEventListener('click', event => {
    let element = event.target;
    if(element.classList.contains('less') || element.classList.contains('more')){
        let product_id = element.parentElement.parentElement.dataset.id;
        let operation = (element.classList.contains('less')) ? -1 : 1;
        changeQuantity(product_id, operation);
    }else if(element.classList.contains('delete-from-cart-btn')){
        let product_id = element.parentElement.parentElement.dataset.id;
        deleteFromCart(product_id);
    }
})


// открытие и закрытие формы оформления заказа
checkOutBtn.addEventListener('click', () => {
    modal.classList.add('active');
})

// сигналы от элементов форма оформления заказа
closeModalBtn.addEventListener('click', event => {
    event.preventDefault();
    modal.classList.remove('active');
});
modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.remove('active');
  }
});

// оформление заказа
orderForm.addEventListener('submit', event => {
    event.preventDefault();

    const phoneRegex = /^\+?\d{10,}$/;
    let phone = orderForm.phone.value.trim();
    if (!phoneRegex.test(phone)) {
        phoneError.style.display = 'block';
        return;
    } else {
        phoneError.style.display = 'none';
    }

    alert("заказ успешно оформлен")
    modal.style.display = 'none';
    orderForm.reset();
    cart_products.splice(0);
    updateCartHTML();

})

// // открытие корзины
// document.addEventListener("click", (event) => {
//   let path = event.composedPath();
//   if (!path.includes(cartDiv) && !path.includes(cartIcon)) {
//     cartDiv.classList.remove("open");
//     containerHTML.classList.remove('shifted');
//   }
// });

cartIcon.addEventListener('click', () => {
    cartDiv.classList.toggle('open');
    containerHTML.classList.toggle('shifted');
});
// закрытие корзины
closeCartBtn.addEventListener("click", () => {
    cartDiv.classList.toggle("open");
    containerHTML.classList.toggle('shifted');
});


// загрузка товаров из json
function fetchProducts() {
    fetch("./products.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        updateProductListHTML();
        // обновить корзину при повторном заходе на сайт
        if(localStorage.getItem('cart')){
            cart_products = JSON.parse(localStorage.getItem('cart'))
            updateCartHTML();
        }
    })
}

fetchProducts();