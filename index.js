const Telegraf = require('telegraf');
const Geolib = require('geolib');
const GetJSON = require('get-json');
const Emoji = require('node-emoji');

const Token = '';
const app = new Telegraf(Token);

app.command('start', (ctx) => {
    ctx.replyWithChatAction('typing');
    let nombre = ctx.from.first_name;
    let usuario = ctx.from.username;
    let reply = Emoji.emojify(':wave: ' + nombre + '\nSi quieres conocer el desfibrilador más cercano, envíame tu localización.\nNOTA: Actualmente (y por ahora) sólo puedo mostrarte los desfibriladores en Euskadi.');
    ctx.reply(reply);
    console.log("[INFO] - /start command - " + usuario)
});
app.command('acerca_de', (ctx) => {
    ctx.replyWithChatAction('typing');
    ctx.reply(
        'Bot localizador de desfibriladores.\n' +
        'Creado por @algope\n' +
        'http://alejandrogonzalez.me'
    )
});

app.on('location', (ctx) => {
    ctx.replyWithChatAction('typing');
    let location = ctx.message.location;
    console.log("[INFO] - location received - " + JSON.stringify(location));
    let aed = 'http://opendata.euskadi.eus/contenidos/ds_localizaciones/desfibriladores/opendata/desfibriladores.geojson';
    GetJSON(aed, function(error, response) {
        response = response.replace('jsonCallback(', '');
        response = response.replace(');', '');
        aedList = JSON.parse(response);
        aeds = aedList.features;
        arrayCoords = [];

        for(let i=0; i<aeds.length; i++){
            let elem = aeds[i];
            let latlon = elem.geometry.coordinates;
            arrayCoords.push({'latitude': latlon[1], 'longitude': latlon[0]})
        }
        
        let geolibresp = Geolib.findNearest(location, arrayCoords, 0);
        let key = geolibresp.key;
        let aed = aeds[key];
        let latitude = aed.geometry.coordinates[1];
        let longitude = aed.geometry.coordinates[0];
        let organismo = aed.properties.organismo;
        let direccion = aed.properties.dirección;
        let municipio = aed.properties.municipio;
        let provincia = aed.properties.provincia;
        let ubicacion = aed.properties.ubicación;
        
        ctx.reply(Emoji.emojify("El desfibrilador más cercano :information_source: \n" +
            " :arrow_forward:Dirección: " + direccion + "\n" +
            " :arrow_forward:Organismo: " + organismo + "\n" +
            " :arrow_forward:Municipio: " + municipio + "\n" +
            " :arrow_forward:Provincia: " + provincia + "\n" +
            " :arrow_forward:Ubicación: " + ubicacion + "\n")).then(function() {
            ctx.replyWithChatAction('find_location');
            ctx.replyWithLocation(latitude, longitude).then(function() {
                
            })
        })
    })
});

app.on('message', (ctx) => {
    ctx.replyWithChatAction('typing');
    let nombre = ctx.from.first_name;
    let usuario = ctx.from.username;
    ctx.reply(Emoji.emojify(':wave: ' + nombre + '\nSi quieres conocer el desfibrilador más cercano, envíame tu localización.'));
    console.log("[INFO] - rendom text - " + usuario)
});

app.hears('hola', (ctx) => ctx.reply('¡Hola!'));
app.hears('Hola', (ctx) => ctx.reply('¡Hola!'));



app.catch((err) => {
    console.log('[ERROR] - ', err)
});

app.startPolling();
