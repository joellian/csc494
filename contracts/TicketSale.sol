// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

contract TicketSale {
    address public manager;
    string public managerName;
    uint256 public numTickets;
    uint256 public price;

    struct Ticket {
        uint256 id;
        address owner;
    }

    struct Swap {
        address to;
        address from;
    }

    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256) public getIDFromAddress;
    Swap[] public activeSwaps;

    constructor(uint256 _numTickets, uint256 _price) public {
        numTickets = _numTickets;
        price = _price;
        manager = msg.sender;
        managerName = "Randy";
    }

    function buyTicket(uint256 ticketId) public payable {
        require((ticketId <= numTickets) && (ticketId > 0), "No ticket ID with that value!");
        require(getIDFromAddress[msg.sender] == 0, "Only one ticket may be held at a time!");
        require(tickets[ticketId].owner == address(0), "Someone else already owns that ticket!");
        require(msg.sender.balance >= price, "Insufficient balance!");
        manager.call{value: price}("");
        tickets[ticketId].owner = msg.sender;
        getIDFromAddress[msg.sender] = ticketId;
    }

    function getTicketOf(address person) public view returns (uint256) {
        return getIDFromAddress[person];
    }

    function getAddressOf(uint256 id) public view returns (address) {
        return tickets[id].owner;
    }

    function getSwapTo(uint256 index) public view returns (address){
        return activeSwaps[index].to;
    }

    function getSwapFrom(uint256 index) public view returns (address){
        return activeSwaps[index].from;
    }

    function offerSwap(address goingToPartner) public {
        require(getIDFromAddress[msg.sender] != 0, "You don't have a ticket!");
        require(getIDFromAddress[goingToPartner] != 0, "The given address does not own a ticket!");
        Swap memory newSwap;
        newSwap.to = goingToPartner;
        newSwap.from = msg.sender;
        activeSwaps.push(newSwap);
    }

    function acceptSwap(address gettingFromPartner) public{
        require(getIDFromAddress[msg.sender] != 0, "You don't have a ticket!");
        require(getIDFromAddress[gettingFromPartner] != 0, "The given address does not own a ticket!");
        uint index = 0;
        for (uint i = 0; i < activeSwaps.length; i++){
            if ((activeSwaps[i].to == msg.sender) && (activeSwaps[i].from == gettingFromPartner)) {
                index = i;
                uint256 goToId = getIDFromAddress[msg.sender];
                uint256 getFromId = getIDFromAddress[gettingFromPartner];

                tickets[getFromId].owner = msg.sender;
                tickets[goToId].owner = gettingFromPartner;
                getIDFromAddress[msg.sender] = getFromId;
                getIDFromAddress[gettingFromPartner] = goToId;
            }
        }
    }

    function returnTicket() public {
        require(getIDFromAddress[msg.sender] != 0, "You don't have a ticket to return!");
        msg.sender.call{value: uint256((price * 9) / 100)}("");
        delete tickets[getIDFromAddress[msg.sender]];
        delete getIDFromAddress[msg.sender];
    }
}
