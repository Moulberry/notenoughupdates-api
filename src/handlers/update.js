const dynamodb = require('aws-sdk/clients/dynamodb');
const fetch = require('node-fetch');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

exports.updateHandler = async (event) => {
    const { body, httpMethod, path } = event;

    console.log('received:', JSON.stringify(event));

    // Get id and name from the body of the request
    const { id, name } = JSON.parse("{\"id\": \""+Date.now()+"\", \"name\": \"Test\"}");

    var url = 'https://api.hypixel.net/skyblock/auctions?key=4f6867b2-b8af-437e-86b3-71a8259db905&page=1';

    let settings = { method: "Get" };

    fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            console.log("json: ", json)
            // do something with JSON
        });

    const params = {
        TableName: tableName,
        Item: { id, name },
    };
    await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: "{\"message\": \"Updated.\"}",
    };

    return response;
};