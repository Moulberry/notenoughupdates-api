// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get all items
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.NEU_TABLE;

exports.getPricesHandler = async (event) => {
    const { httpMethod, path } = event;
    if (httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${httpMethod}`);
    }

    console.log('received: ', JSON.stringify(event));

    const auctionPricesParams = {
        TableName: tableName,
        Key: { "id": "AUCTION_PRICE_IQM" },
    };
    console.log(await docClient.get(auctionPricesParams).promise());

    //console.log(Item)

    const bazaarPricesParams = {
        TableName: tableName,
        Key: { "id": "BAZAAR_PRICES" },
    };
    const { BazaarPricesItem } = await docClient.get(bazaarPricesParams).promise();

    console.log(BazaarPricesItem)

    const response = {
        statusCode: 200,
        body: JSON.stringify({AuctionPricesItem, BazaarPricesItem}),
    };

    return response;
};
