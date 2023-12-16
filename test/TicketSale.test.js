const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const TicketSale = require('../contracts/TicketSale.sol');
const { TicketStatus } = TicketSale;
const web3 = new Web3(ganache.provider());

const { abi, bytecode } = require('../compile');

let accounts;
let ticketSale;

beforeEach(async () => {
 
    accounts = await web3.eth.getAccounts();


    ticketSale = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode, arguments: [100000, 10000] })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('TicketSale', () => {
    it('deploys a contract', () => {
        assert.ok(ticketSale.options.address);
    });

    it('allows one account to buy a ticket', async () => {
        await ticketSale.methods.buyTicket(1).send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const ticket = await ticketSale.methods.tickets(accounts[0]).call();

        assert.equal(ticket.ticketID, 1);
    });

    it('does not allow to buy a ticket that does not exist', async () => {
        try {
            await ticketSale.methods.buyTicket(1000000).send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a ticket owner to return a ticket', async () => {
        // Buy a ticket first
        await ticketSale.methods.buyTicket(1).send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        // Return the ticket
        await ticketSale.methods.returnTicket(accounts[0]).send({
            from: accounts[0]
        });

        // Check if the ticket was returned
        const ticket = await ticketSale.methods.tickets(accounts[0]).call();
        assert.equal(ticket.ticketID, 0);
    });

    it('does not allow to return a ticket if the owner does not have one', async () => {
        try {
            await ticketSale.methods.returnTicket(accounts[0]).send({
                from: accounts[0]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a ticket owner to offer a swap', async () => {
        // Two accounts buy tickets
        await ticketSale.methods.buyTicket(1).send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await ticketSale.methods.buyTicket(2).send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        // Account 0 offers a swap to account 1
        await ticketSale.methods.offerSwap(accounts[1]).send({
            from: accounts[0]
        });

        // Check if the swap offer was made
        const swapOffer = await ticketSale.methods.swap(accounts[1]).call();
        assert.equal(swapOffer, accounts[0]);
    });

    it('does not allow to offer a swap if the owner does not have a ticket', async () => {
        try {
            await ticketSale.methods.offerSwap(accounts[1]).send({
                from: accounts[0]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });
    it('does not allow to offer a swap if the target does not have a ticket', async () => {
        // Account 0 buys a ticket
        await ticketSale.methods.buyTicket(1).send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        try {
            // Account 0 tries to offer a swap to account 1, which does not have a ticket
            await ticketSale.methods.offerSwap(accounts[1]).send({
                from: accounts[0]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a ticket owner to accept a swap', async () => {
        // Two accounts buy tickets
        await ticketSale.methods.buyTicket(1).send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await ticketSale.methods.buyTicket(2).send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        // Account 0 offers a swap to account 1
        await ticketSale.methods.offerSwap(accounts[1]).send({
            from: accounts[0]
        });

        // Account 1 accepts the swap
        await ticketSale.methods.acceptSwap(accounts[0]).send({
            from: accounts[1]
        });

        // Check if the swap was successful
        const ticket = await ticketSale.methods.tickets(accounts[0]).call();
        assert.equal(ticket.ticketID, 2);
    });

    it('does not allow to accept a swap if the owner does not have a ticket', async () => {
        try {
            // Account 0 tries to accept a swap without owning a ticket
            await ticketSale.methods.acceptSwap(accounts[1]).send({
                from: accounts[0]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('does not allow to accept a swap if the target does not have a ticket', async () => {
        // Account 0 buys a ticket
        await ticketSale.methods.buyTicket(1).send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        try {
            // Account 0 tries to accept a swap from account 1, which does not have a ticket
            await ticketSale.methods.acceptSwap(accounts[1]).send({
                from: accounts[0]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

});