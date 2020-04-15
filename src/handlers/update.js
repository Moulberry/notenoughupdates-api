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

	let auctions = []
	let totalPages = 1;
	let currentPages = 0;

	await fetch(url+'0', settings)
		.then(res => res.json())
		.then((json) => {
			totalPages = json.totalPages;
			currentPages++;
			auctions = auctions.concat(json.auctions);
		});


	/*for(var i=1; i<totalPages; i++) {
		fetch(url+i, settings)
		.then(res => res.json())
		.then((json) => {
			auctions = auctions.concat(json.auctions);
			currentPages++;
		});
	}

	//Max 20s (400 sleeps)
	let sleeps = 0;
	while(currentPages < totalPages && sleeps < 400) {
		sleeps++;
		await sleep(50);
	}*/
	console.log("GET Took: " + (Date.now() - start)/1000 + "s");

	if(auctions[0] == undefined) console.log("Throtted.")

	var processed = {}

	var toParse = 0;
	var parsed = 0;
	for(var i=0; i<auctions.length; i++) {
		let auction = auctions[i]
		if(auction != undefined && auction.highest_bid_amount > 0) {
			toParse++;
			nbt.parse(Buffer.from(auction.item_bytes, 'base64'), async function(error, data) {
				parsed++;
				if (error) { throw error; }

				try {
					let enchantments = {}
					let hot_potato_count = 0
					let modifier = ""
					let count = data.value.i.value.value[0].Count.value;

					let tag = data.value.i.value.value[0].tag.value;
					let ExtraAttributes = tag.ExtraAttributes.value;
					try { enchantments = ExtraAttributes.enchantments.value; } catch(err) { }
					try { hot_potato_count = ExtraAttributes.hot_potato_count.value; } catch(err) { }
					try { modifier = ExtraAttributes.modifier.value; } catch(err) { }
					try {
						/*console.log(auction.uuid + "-" + auction.auctioneer)
						//console.log(ExtraAttributes.id.value);
						console.log(count)
						console.log(enchantments)
						console.log(hot_potato_count)
						console.log(modifier)*/
						if(processed[ExtraAttributes.id.value] == undefined) {
                            const params = {
                                TableName: tableName,
                                Key: { "id": ExtraAttributes.id.value },
                            };
                            const { Item } = await docClient.get(params).promise();
                            processed[ExtraAttributes.id.value] = Item.value
						}
						processed[ExtraAttributes.id.value][auction.uuid + "-" + auction.auctioneer] =
								{"bid": auction.highest_bid_amount, count, enchantments, hot_potato_count, modifier}
					} catch(err) { }
				} catch(err) {}
			});
		}
	}
	//Max 20s (400 sleeps)
	sleeps = 0;
	while(parsed < toParse && sleeps < 400) {
		sleeps++;
		await sleep(50);
	}

	console.log("PROCESS Took: " + (Date.now() - start)/1000 + "s");

	for(id in processed) {
	    const params = {
            TableName: tableName,
            Item: { id, "value": processed[id] },
        };
        await docClient.put(params).promise();
	}

    const response = {
        statusCode: 200,
        body: "{\"message\": \"Updated.\"}",
    };

	console.log("ALL Took: " + (Date.now() - start)/1000 + "s");
    return response;
};