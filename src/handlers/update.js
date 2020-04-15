const dynamodb = require('aws-sdk/clients/dynamodb');
const fetch = require('node-fetch');
const zlib = require('zlib');
const nbt = require('nbt');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.NEU_TABLE;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

exports.updateHandler = async (event) => {
    const { body, httpMethod, path } = event;

    console.log('received:', JSON.stringify(event));

    var start = Date.now()
	var url = 'https://api.hypixel.net/skyblock/auctions?key=4f6867b2-b8af-437e-86b3-71a8259db905&page=';

	let settings = { method: "Get" };

	let totalPages = 1;
	let currentPages = 0;

	await fetch(url+'0', settings)
		.then(res => res.json())
		.then(async (json) => {
			totalPages = json.totalPages;
			currentPages++;
			await processAuctions(json.auctions)
		});


	for(var i=1; i<totalPages; i++) {
		fetch(url+i, settings)
		.then(res => res.json())
		.then(async (json) => {
			await processAuctions(json.auctions)
			currentPages++;
		});
	}

	//Max 40s (800 sleeps)
	let sleeps = 0;
	while(currentPages < totalPages && sleeps < 800) {
		sleeps++;
		await sleep(50);
	}

    const response = {
        statusCode: 200,
        body: "{\"message\": \"Updated.\"}",
    };

	console.log("Took: " + (Date.now() - start)/1000 + "s");
    return response;
}

async function processAuctions(auctions) {
	var processed = {}
	for(var i=0; i<auctions.length; i++) {
		let auction = auctions[i]
		if(auction != undefined && auction.highest_bid_amount > 0 && (auction.end-Date.now())/1000/60 < 2) {
			await nbt.parse(Buffer.from(auction.item_bytes, 'base64'), async function(error, data) {
				if (error) { throw error; }

				try {
					let enchantments = {}
					let hot_potato_count = 0
					let modifier = "none"
					let item_count = data.value.i.value.value[0].Count.value;

					let tag = data.value.i.value.value[0].tag.value;
					let ExtraAttributes = tag.ExtraAttributes.value;
					try { enchantments = ExtraAttributes.enchantments.value; } catch(err) { }
					try { hot_potato_count = ExtraAttributes.hot_potato_count.value; } catch(err) { }
					try { modifier = ExtraAttributes.modifier.value; } catch(err) { }
					try {
						//console.log(auction.uuid + "-" + auction.auctioneer)
						//console.log(ExtraAttributes.id.value)
						/*console.log(auction.highest_bid_amount);
						console.log(count)
						console.log(enchantments)
						console.log(hot_potato_count)
						console.log(modifier)*/
						const params = {
                            TableName: tableName,
                            Key: {"id": ExtraAttributes.id.value},
                            UpdateExpression: "set #i.bid=:b, #i.item_count=:c, #i.enchantments=:e, #i.hot_potato_count=:h, #i.modifier=:m",
                            ExpressionAttributeNames:{
                                "#i":auction.uuid + "-" + auction.auctioneer
                            },
                            ExpressionAttributeValues:{
                                ":b":auction.highest_bid_amount,
                                ":c":item_count,
                                ":e":enchantments,
                                ":h":hot_potato_count,
                                ":m":modifier,
                            }
                        };

                        await docClient.update(params).promise();
					} catch(err) { console.log(err)}
				} catch(err) {}
			});
		}
	}
}