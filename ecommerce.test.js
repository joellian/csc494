const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

class Mytest{
    constructor(){
        this.prodNames = ["tv", "laptop", "notebook", "phone"];
        this.prices = [400, 500, 200, 700];
        this.quantities = [5, 10, 15, 20];
    }
    changeProductName(id, newstring){
        this.prodNames[id] = newstring;
    }
    changePrice(id, newPrice){
        this.prices[id] = newPrice;
    }
}
describe('Ecommerce', () => {
    let myTest;

    beforeEach(() => {
        myTest = new Mytest();
    });

    it('changes product name', () => {
        const id = 0;
        const newName = 'smartTV';
        myTest.changeProductName(id, newName);
        assert.strictEqual(myTest.prodNames[id], newName);
    });

    it('changes product price', () => {
        const id = 1;
        const newPrice = 600;
        myTest.changePrice(id, newPrice);
        assert.strictEqual(myTest.prices[id], newPrice);
    });
});