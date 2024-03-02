const db = mongoose.connection;

const generatorValues = new Collection();

const typesAndValues = [
    'bananatree', '5.00',
    'bellaitalia', '3.00',
    'burgerking', '5.00',
    'Cafe Nero', '4.00',
    'Chiquito', '3.00',
    'Chopstix Box', '5.00',
    'chopstix', '4.00',
    'cineworld', '5.00',
    'costa', '3.00',
    'Deliveroo Account', '10.00',
    'deliveroo-plus', '3.00',
    'deliveroo', '10.00',
    'dominos', '10.00',
    'Ed\'s Diner', '3.00',
    'frankieandbenny', '5.00',
    'Gails Bakery', '5.00',
    'Greggs', '5.00',
    'HelloFresh', '10.00',
    'Hobbycraft', '5.00',
    'hotelchocolat', '5.00',
    'john lewis', '7.00',
    'KFC', '5.00',
    'Krispy Kreme', '4.00',
    'LEON', '4.00',
    'Lidl', '0.50',
    'lindt', '4.00',
    'lindtsurvey', '5.00',
    'maru', '7.00',
    'Muffin Break', '6.00',
    'Ole & Steen', '5.00',
    'Papa Johns', '8.00',
    'Percy Pigs', '3.00',
    'Pizza Express', '5.00',
    'Pizza Hut', '7.00',
    'Patisserie Valerie', '5.00',
    'Slim Chicken', '3.00',
    'Subway', '4.00',
    'Subway Cookie', '4.00',
    'Tacobell', '3.00',
    'TGI Fridays', '4.00',
    'tobycarvery', '7.00',
    'Uber Eats', '10.00',
    'Yo! Sushi', '5.00'
];

db.once('open', async () => {

    await processExistingDocuments();

    Code.watch().on('change', data => {
        if (data.operationType === 'insert') {
            const generator = data.fullDocument.generator;
            console.log(generator);
            updateGeneratorValues(generator);
        }
    });

    setInterval(findAndUpdateChannel, 300 * 1000 + 1000);
});

async function processExistingDocuments() {
    try {
        const existingDocuments = await Code.find({}, { generator: 1 });
        existingDocuments.forEach(doc => {
            const generator = doc.generator;
            updateGeneratorValues(generator);
        });
    } catch (error) {
        console.error('Error processing existing documents:', error);
    }
}

function updateGeneratorValues(generator) {
    const valueIndex = typesAndValues.indexOf(generator);
    if (valueIndex !== -1 && valueIndex % 2 === 0) {
        const value = parseFloat(typesAndValues[valueIndex + 1]);
        if (generatorValues.has(generator)) {
            const currentValue = generatorValues.get(generator);
            generatorValues.set(generator, currentValue + value);
        } else {
            generatorValues.set(generator, value);
        }
    }
}


async function findAndUpdateChannel() {
    const channel = client.channels.cache.get('1213527306098966548');
    const channelName = channel.name;
    const priceIndex = channelName.indexOf('£');
    let priceAfterPound = channelName.substring(priceIndex + 1);

    priceAfterPound = priceAfterPound.replace(/,/g, '');

    const channelPrice = parseFloat(priceAfterPound);

    let totalValue = 0;
    generatorValues.forEach(value => {
        totalValue += value;
    });

    const newTotal = channelPrice + totalValue;

    const formattedTotal = newTotal.toLocaleString('en-US', { maximumFractionDigits: 2 });

    const newChannelName = `Total Saved: £${formattedTotal}`;

    await channel.setName(newChannelName);

    generatorValues.clear();
}
