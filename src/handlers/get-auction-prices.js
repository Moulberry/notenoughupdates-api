// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get all items
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.NEU_TABLE;

exports.getAuctionPricesHandler = async (event) => {
    const { httpMethod, path } = event;
    if (httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${httpMethod}`);
    }

    console.log('received:', JSON.stringify(event));

    const params = {
        TableName: tableName,
        Key: { "id": "AUCTION_PRICE_IQM" },
    };
    const { Item } = await docClient.get(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify(Item),
    };

    return response;
};
