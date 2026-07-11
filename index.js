import { Client } from "https://unpkg.com/archipelago.js/dist/archipelago.min.js";

var ITEM_COLOR = { progression: "300deg", useful: "150deg", trap: 0, filler: "200deg"}
var ITEM_TEXT_COLOR = { progression: "#d269ec", useful: "#68e78e", trap: "#ee6969", filler: "#4cd3f5"}
var AVATAR_IMG = [
    {name: "Outer Wilds", img: "./character/outer_wilds.png"},
    {name: "Celeste (Open World)", img: "./character/celeste.png"},
    {name: "Hollow Knight", img: "./character/hollow_knight.png"},
    {name: "Dark Souls III", img: "./character/dark_souls_3.png"},
    {name: "Pokemon Emerald", img: "./character/pokemon.png"},
]
var AVATAR_IMG_DEFAULT = "./character/unknown.png";

$(document).ready(function(){

    var client = new Client();
    var transactionTemplate = $("#transactionTemplate").detach();

    let params = new URLSearchParams(document.location.search);
    let port = params.get("port");
    let player = params.get("player");

    var count = 0;

    function log(message) {
        console.log("AP message: "+message);
    }

    function getTransactionElement(location, player1, game1, item, itemColor, player2, game2) {

        let avatar1 = AVATAR_IMG.filter((avatar) => avatar.name == game1);
        let img1 = avatar1.length > 0 ? avatar1[0].img : AVATAR_IMG_DEFAULT;
        
        let avatar2 = AVATAR_IMG.filter((avatar) => avatar.name == game2);
        let img2 = avatar2.length > 0  ? avatar2[0].img : AVATAR_IMG_DEFAULT;

        let element = transactionTemplate.clone();
        $(element).attr("id","message"+count);
        count++;
        $(element).find("#location").text(location);
        $(element).find("#player1 #name").text(player1);
        $(element).find("#player1 #game").text(game1);
        $(element).find("#player1 img").attr("src",img1);
        $(element).find("#item div").text(item);
        $(element).find("#item div").css("--shadow-color", ITEM_TEXT_COLOR[itemColor]);
        $(element).find(".recolor").css("--recolor", ITEM_COLOR[itemColor]);
        $(element).find("#player2 #name").text(player2);
        $(element).find("#player2 #game").text(game2);
        $(element).find("#player2 img").attr("src",img2);
        $(element).addClass("enter");
        return element;
    }


    function processMessage(item) {
        let player1 = item.sender;
        let player2 = item.receiver;
        let itemName = item.name;
        let location = item.locationName;
        let game1 = item.locationGame;
        let game2 = item.game;
        let useful = item.useful ? "useful" : item.trap ? "trap" : item.progression ? "progression" : "filler";
        let element = getTransactionElement(location, player1, game1, itemName, useful, player2, game2);
        let elementId = $(element).attr("id");
        $("#transactionList").append(element);
        setTimeout(() => wipeTopMessage(elementId), 10000);
    }

    function wipeTopMessage(elementId) {
        $("#"+elementId).removeClass("enter");
        $("#"+elementId).addClass("exit");
        setTimeout(() => {$("#"+elementId).remove()}, 500);
    }

    if(port && player) {
        login();
    }

	$('#connect').on('click', () => {
		let port = $('#port').val();
        let player = $('#player').val();
        params.set("port",port);
        params.set("player",player);
        window.location.search = params;
		// Login to the server. Replace `archipelago.gg:XXXXX` and `Phar` with the address/url and slot name for your room.
		// If no game is provided, client will connect in "TextOnly" mode, which is fine for this example.
        login();
	});

    function login() {
        $("#login").hide();
        client.login("archipelago.gg:"+port, player, "Outer Wilds", {items: 7 /*all*/})
    		.then(() => {
                log("Connected to the Archipelago server!")
                client.updateItemsHandling(7); //all
            })
    		.catch(console.error);
    }

    let hasRunOnce = false;
    client.items.on("itemsReceived", (items) => {
        if(!hasRunOnce) {
            hasRunOnce = true;
            for(let item of items) {
                log(item);
                processMessage(item);
            }
        }
        
    });
	
    client.messages.on("itemSent", (text, item, nodes) => {
        log(text);
        processMessage(item);
    });
});
