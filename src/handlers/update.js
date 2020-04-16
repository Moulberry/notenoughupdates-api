const dynamodb = require('aws-sdk/clients/dynamodb');
const fetch = require('node-fetch');
const zlib = require('zlib');
const nbt = require('nbt');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.NEU_TABLE;
const apiKey = process.env.HYPIXEL_API_KEY;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

var products = [
    "ENCHANTED_RAW_CHICKEN",
    "INK_SACK:3",
    "BROWN_MUSHROOM",
    "ENCHANTED_WATER_LILY",
    "INK_SACK:4",
    "TARANTULA_WEB",
    "CARROT_ITEM",
    "ENCHANTED_POTATO",
    "LOG:1",
    "ENCHANTED_SLIME_BALL",
    "ENCHANTED_GOLDEN_CARROT",
    "LOG:3",
    "LOG:2",
    "ENCHANTED_RABBIT_HIDE",
    "ENCHANTED_GLOWSTONE_DUST",
    "ENCHANTED_INK_SACK",
    "ENCHANTED_CACTUS",
    "ENCHANTED_SUGAR_CANE",
    "ENCHANTED_BIRCH_LOG",
    "ENCHANTED_GUNPOWDER",
    "ENCHANTED_MELON",
    "ENCHANTED_COOKED_SALMON",
    "ENCHANTED_SUGAR",
    "LOG",
    "CACTUS",
    "ENCHANTED_BLAZE_ROD",
    "GHAST_TEAR",
    "ENCHANTED_CAKE",
    "PUMPKIN",
    "ENCHANTED_ENDER_PEARL",
    "PURPLE_CANDY",
    "WHEAT",
    "ENCHANTED_FERMENTED_SPIDER_EYE",
    "ENCHANTED_GOLD_BLOCK",
    "ENCHANTED_RAW_SALMON",
    "ENCHANTED_JUNGLE_LOG",
    "ENCHANTED_FLINT",
    "ENCHANTED_GLISTERING_MELON",
    "IRON_INGOT",
    "PRISMARINE_SHARD",
    "ENCHANTED_EMERALD",
    "ENCHANTED_SPIDER_EYE",
    "ENCHANTED_EMERALD_BLOCK",
    "RED_MUSHROOM",
    "MUTTON",
    "ENCHANTED_MELON_BLOCK",
    "ENCHANTED_CLAY_BALL",
    "DIAMOND",
    "COBBLESTONE",
    "SPIDER_EYE",
    "RAW_FISH",
    "ENCHANTED_PUFFERFISH",
    "GLOWSTONE_DUST",
    "GOLD_INGOT",
    "REVENANT_VISCERA",
    "TARANTULA_SILK",
    "POTATO_ITEM",
    "ENCHANTED_MUTTON",
    "ENCHANTED_HUGE_MUSHROOM_1",
    "SUPER_COMPACTOR_3000",
    "ENCHANTED_IRON",
    "STOCK_OF_STONKS",
    "ENCHANTED_COBBLESTONE",
    "ENCHANTED_BONE",
    "ENCHANTED_PAPER",
    "ENCHANTED_HUGE_MUSHROOM_2",
    "PORK",
    "ENCHANTED_DIAMOND_BLOCK",
    "EMERALD",
    "ENCHANTED_RABBIT_FOOT",
    "PRISMARINE_CRYSTALS",
    "HOT_POTATO_BOOK",
    "ENCHANTED_ICE",
    "ICE",
    "CLAY_BALL",
    "HUGE_MUSHROOM_1",
    "HUGE_MUSHROOM_2",
    "LOG_2:1",
    "GREEN_GIFT",
    "GOLDEN_TOOTH",
    "STRING",
    "PACKED_ICE",
    "WATER_LILY",
    "RABBIT_FOOT",
    "LOG_2",
    "REDSTONE",
    "ENCHANTED_OBSIDIAN",
    "ENCHANTED_COAL",
    "COAL",
    "ENCHANTED_QUARTZ",
    "ENDER_PEARL",
    "ENCHANTED_COAL_BLOCK",
    "ENCHANTED_CACTUS_GREEN",
    "ENCHANTED_PRISMARINE_CRYSTALS",
    "ENCHANTED_CARROT_ON_A_STICK",
    "ENCHANTED_ENDSTONE",
    "ENCHANTED_LAPIS_LAZULI_BLOCK",
    "ENCHANTED_COOKIE",
    "ENCHANTED_STRING",
    "SLIME_BALL",
    "ENDER_STONE",
    "ENCHANTED_RAW_FISH",
    "ENCHANTED_ACACIA_LOG",
    "ENCHANTED_EGG",
    "QUARTZ",
    "ENCHANTED_EYE_OF_ENDER",
    "SAND",
    "RAW_CHICKEN",
    "MAGMA_CREAM",
    "SUGAR_CANE",
    "ENCHANTED_LAPIS_LAZULI",
    "ENCHANTED_GHAST_TEAR",
    "ENCHANTED_COCOA",
    "RED_GIFT",
    "ENCHANTED_RAW_BEEF",
    "SEEDS",
    "ENCHANTED_LEATHER",
    "ENCHANTED_SPONGE",
    "ENCHANTED_FEATHER",
    "ENCHANTED_SLIME_BLOCK",
    "ENCHANTED_OAK_LOG",
    "RABBIT_HIDE",
    "WHITE_GIFT",
    "INK_SACK",
    "FLINT",
    "ENCHANTED_SPRUCE_LOG",
    "WOLF_TOOTH",
    "ENCHANTED_ROTTEN_FLESH",
    "ENCHANTED_GRILLED_PORK",
    "SULPHUR",
    "NETHER_STALK",
    "RABBIT",
    "ENCHANTED_NETHER_STALK",
    "ENCHANTED_REDSTONE_BLOCK",
    "ENCHANTED_QUARTZ_BLOCK",
    "ENCHANTED_CARROT",
    "ENCHANTED_PUMPKIN",
    "GREEN_CANDY",
    "ENCHANTED_REDSTONE",
    "ROTTEN_FLESH",
    "ENCHANTED_COOKED_FISH",
    "OBSIDIAN",
    "ENCHANTED_MAGMA_CREAM",
    "GRAVEL",
    "MELON",
    "RAW_FISH:3",
    "ENCHANTED_PRISMARINE_SHARD",
    "ENCHANTED_IRON_BLOCK",
    "LEATHER",
    "ENCHANTED_COOKED_MUTTON",
    "BONE",
    "RAW_FISH:1",
    "REVENANT_FLESH",
    "ENCHANTED_PORK",
    "ENCHANTED_GLOWSTONE",
    "ENCHANTED_BREAD",
    "FEATHER",
    "ENCHANTED_CHARCOAL",
    "ENCHANTED_BLAZE_POWDER",
    "NETHERRACK",
    "SUMMONING_EYE",
    "SPONGE",
    "BLAZE_ROD",
    "ENCHANTED_DARK_OAK_LOG",
    "ENCHANTED_BAKED_POTATO",
    "COMPACTOR",
    "ENCHANTED_DIAMOND",
    "ENCHANTED_GOLD"]

exports.updateHandler = async (event) => {
    const { body, httpMethod, path } = event;

    console.log('received:', JSON.stringify(event));

    var start = Date.now()
	var auctionsUrl = 'https://api.hypixel.net/skyblock/auctions?key='+apiKey+'&page=';
	var bazaarUrl = 'https://api.hypixel.net/skyblock/bazaar/product?key='+apiKey+'&productId=';

	let settings = { method: "Get" };
	let toProcess = 0;
	let processed = 0;

	const getBazaarProcessIndexParams = {
        TableName: tableName,
        Key: { "id": "BAZAAR_PROCESS_INDEX" },
    };
    const { IndexItem } = await docClient.get(getBazaarProcessIndexParams).promise();
    var startindex = 0;
    if(IndexItem != undefined) {
        startindex = IndexItem.value;
    }

    for(var i=startindex; i<startindex+20; i++) {
        toProcess++;
		var product_name = products[i%products.length];
		fetch(bazaarUrl+product_name, settings)
			.then(res => res.json())
			.then(async (json) => {
				try {
					var productId = json.product_info.quick_status.productId;
					var buyPrice = son.product_info.quick_status.buyPrice;
					var sellPrice = json.product_info.quick_status.sellPrice;
					const params = {
                        TableName: tableName,
                        Key: {"id": "BAZAAR_PRICES"},
                        UpdateExpression: "SET #i=:data",
                        ExpressionAttributeNames:{
                            "#i":ExtraAttributes.id.value
                        },
                        ExpressionAttributeValues:{
                            ":data":{ productId, buyPrice, sellPrice }
                        }
                    };
                    await docClient.update(params).promise();
				} catch(err) {}
				processed++;
			});
    }

    const setBazaarProcessIndexParams = {
        TableName: tableName,
        IndexItem: { "id": "BAZAAR_PROCESS_INDEX", "value":  (index+20)%products.length},
    };
    await docClient.put(setBazaarProcessIndexParams).promise();

	await fetch(auctionsUrl+'0', settings)
		.then(res => res.json())
		.then(async (json) => {
			totalPages = json.totalPages;
			await processAuctions(json.auctions)
		});


	for(var i=1; i<totalPages; i++) {
	    toProcess++;
		fetch(auctionsUrl+i, settings)
            .then(res => res.json())
            .then(async (json) => {
                try {
                    await processAuctions(json.auctions)
                } catch(err) {console.log(err)}
                processed++;
            });
	}

	while(processed < toProcess) {
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
						const params = {
                            TableName: tableName,
                            Key: {"id": ExtraAttributes.id.value},
                            UpdateExpression: "SET #i=:data",
                            ExpressionAttributeNames:{
                                "#i":auction.uuid + "-" + auction.auctioneer
                            },
                            ExpressionAttributeValues:{
                                ":data":{ "bid": auction.highest_bid_amount, item_count, enchantments, hot_potato_count, modifier}
                            },
                            ReturnValues: "ALL_NEW"
                        };
                        const Item = await docClient.update(params).promise();
                        var attr = Item.Attributes;

                        var bids = [];
                        for(id in attr) {
                            var data = attr[id];
                            bids.push(data.bid/data.item_count);
                        }
                        var observations = bids.length/4;
                        var sorted = bids.sort(function(a, b){return a-b})
                        var total = 0;
                        for(var i = Math.ceil(bids.length/4); i<=Math.floor(bids.length*3/4-1); i++) {
                            total += sorted[i];
                        }
                        var mod = observations % 1;
                        if(mod != 0) {
                            total += sorted[Math.floor(bids.length/4)] * mod;
                            total += sorted[Math.ceil(bids.length*3/4-1)] * mod;
                        }
                        var iqm = total/observations/2;
                        if(Number.isNaN(iqm)) {
                            iqm = -1;
                        }

                        const params2 = {
                            TableName: tableName,
                            Key: {"id": "AUCTION_PRICE_IQM"},
                            UpdateExpression: "SET #i=:data",
                            ExpressionAttributeNames:{
                                "#i":ExtraAttributes.id.value
                            },
                            ExpressionAttributeValues:{
                                ":data":iqm
                            }
                        };
                        await docClient.update(params2).promise();
					} catch(err) { console.log(err)}
				} catch(err) {}
			});
		}
	}
}