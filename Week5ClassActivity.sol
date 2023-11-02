// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Ecommerce {
    struct Product {
        uint id;
        uint price;
        uint stock;
    }

    mapping(uint => Product) public products;
    uint public revenue;

    constructor(uint laptopPrice, uint laptopStock, uint watchPrice, uint watchStock, uint tvPrice, uint tvStock) {
        products[1] = Product(1, laptopPrice, laptopStock);
        products[2] = Product(2, watchPrice, watchStock);
        products[3] = Product(3, tvPrice, tvStock);
        revenue = 0;
    }

    function purchase(uint productID) public {
        require(products[productID].stock > 0, "Out of stock!");
        
        products[productID].stock -= 1;
        revenue += products[productID].price;
    }

    function addItem(uint productID, uint quantity) public {
        products[productID].stock += quantity;
    }

    function increasePrice(uint productID, uint amount) public {
        products[productID].price += amount;
    }
}
