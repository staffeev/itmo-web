let showcase = document.querySelector('.showcase');
let products = [];

const addProductsToHTML = () => {
    showcase.innerHTML = '';
    if(products.length > 0){
        products.forEach(product => {
            let newProductHTML = document.createElement('div');
            newProductHTML.classList.add('shop-product');
            newProductHTML.dataset.id = product.id;
            newProductHTML.innerHTML = `
            <img src="${product.image}" alt="loading...">
            <h3>${product.name}</h3>
            <div class="product-price">${product.price}</div>
            <button class="add-to-cart">+</button>`;
            showcase.appendChild(newProductHTML);
        })
    } 
}

showcase.addEventListener('click', (event) => {
    let element = event.target;
    if(element.classList.contains('add-to-cart')){
        let product_id = element.parentElement.dataset.id;
        alert(product_id);
    }
})


const fetchProducts = () => {
    fetch("./products.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        addProductsToHTML();
    })
}

fetchProducts();