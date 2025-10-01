let showcase = document.querySelector('.showcase');
let products = [];

const addProductsToHTML = () => {
    showcase.innerHTML = '';
    if(products.length > 0){
        products.forEach(product => {
            let newProductHTML = document.createElement('div.shop-product');
            newProductHTML.innerHTML = `
            <img src="${product.image}" alt="loading...">
            <h3>${product.name}</h3>
            <div class="product-price">${product.price}</div>
            <button class="add-to-cart">+</button>`;
            showcase.appendChild(newProductHTML);
        })
    } 
}

const fetchProducts = () => {
    fetch("./products.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        addProductsToHTML();
    })
}

fetchProducts();