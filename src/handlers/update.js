const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

exports.updateHandler = async (event) => {
    const { body, httpMethod, path } = event;

    // Get id and name from the body of the request
    const { id, name } = JSON.parse("{\"id\": \"100\", \"name\": \"Test\"}");

    const params = {
        TableName: tableName,
        Item: { id, name },
    };
    await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        "{\"message\": \"Updated.\"}",
    };

    return response;
};