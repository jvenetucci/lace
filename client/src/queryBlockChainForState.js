//This just returns sample data for now. 
//In the future it should actually query the block chain, 
//but we don't have one to work with really as of now.


function queryBlockChainForState() {
    return [{
        ProductType: "Cool Shoe",
        Size: "12",
        SKU: "SKU123",
        RFID: "12345",
        Date: "5769849300"
    } , {
        ProductType: "Ankle socks",
        Size: "M",
        SKU: "SKU332",
        RFID: "12346",
        Date: "5769843333"
    } , {
        ProductType: "Lame Shoe",
        Size: "17",
        SKU: "SKU321",
        RFID: "12347",
        Date: "5769567890"
    }];
}

module.exports = {
    queryBlockChainForState
}