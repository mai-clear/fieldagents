// We need the file system here
var fs = require('fs');

// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
	res.send('Hello World!')
});

// Here is the actual HTTP server 
// In this case, HTTPS (secure) server
var https = require('https');

// Security options - key and certificate
var options = {
	key: fs.readFileSync('star_itp_io.key'),
	cert: fs.readFileSync('star_itp_io.pem')
};

// We pass in the Express object and the options object
var httpServer = https.createServer(options, app);

// Default HTTPS port
httpServer.listen(443);


// ------------  GAME LOGIC ----------- //
var teams = ['teal', 'brown'];
var players = [];
var playerCodes = [];
teams.forEach(team => {
	playerCodes.push(team + '_master', team + '_agent');
});
var turn = 0;
let board = [];

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(httpServer);

let allWords = [];
if (true) {
	allWords = ['AFRICA', 'AGENT', 'AIR', 'ALIEN', 'ALPS', 'AMAZON', 'AMBULANCE', 'AMERICA', 'ANGEL', 'ANTARCTICA', 'APPLE', 'ARM', 'ATLANTIS', 'AUSTRALIA', 'AZTEC', 'BACK', 'BALL', 'BAND', 'BANK', 'BAR', 'BARK', 'BAT', 'BATTERY', 'BEACH', 'BEAR', 'BEAT', 'BED', 'BEIJING', 'BELL', 'BELT', 'BERLIN', 'BERMUDA', 'BERRY', 'BILL', 'BLOCK', 'BOARD', 'BOLT', 'BOMB', 'BOND', 'BOOM', 'BOOT', 'BOTTLE', 'BOW', 'BOX', 'BRIDGE', 'BRUSH', 'BUCK', 'BUFFALO', 'BUG', 'BUGLE', 'BUTTON', 'CALF', 'CANADA', 'CAP', 'CAPITAL', 'CAR', 'CARD', 'CARROT', 'CASINO', 'CAST', 'CAT', 'CELL', 'CENTAUR', 'CENTER', 'CHAIR', 'CHANGE', 'CHARGE', 'CHECK', 'CHEST', 'CHICK', 'CHINA', 'CHOCOLATE', 'CHURCH', 'CIRCLE', 'CLIFF', 'CLOAK', 'CLUB', 'CODE', 'COLD', 'COMIC', 'COMPOUND', 'CONCERT', 'CONDUCTOR', 'CONTRACT', 'COOK', 'COPPER', 'COTTON', 'COURT', 'COVER', 'CRANE', 'CRASH', 'CRICKET', 'CROSS', 'CROWN', 'CYCLE', 'CZECH', 'DANCE', 'DATE', 'DAY', 'DEATH', 'DECK', 'DEGREE', 'DIAMOND', 'DICE', 'DINOSAUR', 'DISEASE', 'DOCTOR', 'DOG', 'DRAFT', 'DRAGON', 'DRESS', 'DRILL', 'DROP', 'DUCK', 'DWARF', 'EAGLE', 'EGYPT', 'EMBASSY', 'ENGINE', 'ENGLAND', 'EUROPE', 'EYE', 'FACE', 'FAIR', 'FALL', 'FAN', 'FENCE', 'FIELD', 'FIGHTER', 'FIGURE', 'FILE', 'FILM', 'FIRE', 'FISH', 'FLUTE', 'FLY', 'FOOT', 'FORCE', 'FOREST', 'FORK', 'FRANCE', 'GAME', 'GAS', 'GENIUS', 'GERMANY', 'GHOST', 'GIANT', 'GLASS', 'GLOVE', 'GOLD', 'GRACE', 'GRASS', 'GREECE', 'GREEN', 'GROUND', 'HAM', 'HAND', 'HAWK', 'HEAD', 'HEART', 'HELICOPTER', 'HIMALAYAS', 'HOLE', 'HOLLYWOOD', 'HONEY', 'HOOD', 'HOOK', 'HORN', 'HORSE', 'HORSESHOE', 'HOSPITAL', 'HOTEL', 'ICE', 'ICE CREAM', 'INDIA', 'IRON', 'IVORY', 'JACK', 'JAM', 'JET', 'JUPITER', 'KANGAROO', 'KETCHUP', 'KEY', 'KID', 'KING', 'KIWI', 'KNIFE', 'KNIGHT', 'LAB', 'LAP', 'LASER', 'LAWYER', 'LEAD', 'LEMON', 'LEPRECHAUN', 'LIFE', 'LIGHT', 'LIMOUSINE', 'LINE', 'LINK', 'LION', 'LITTER', 'LOCH NESS', 'LOCK', 'LOG', 'LONDON', 'LUCK', 'MAIL', 'MAMMOTH', 'MAPLE', 'MARBLE', 'MARCH', 'MASS', 'MATCH', 'MERCURY', 'MEXICO', 'MICROSCOPE', 'MILLIONAIRE', 'MINE', 'MINT', 'MISSILE', 'MODEL', 'MOLE', 'MOON', 'MOSCOW', 'MOUNT', 'MOUSE', 'MOUTH', 'MUG', 'NAIL', 'NEEDLE', 'NET', 'NEW YORK', 'NIGHT', 'NINJA', 'NOTE', 'NOVEL', 'NURSE', 'NUT', 'OCTOPUS', 'OIL', 'OLIVE', 'OLYMPUS', 'OPERA', 'ORANGE', 'ORGAN', 'PALM', 'PAN', 'PANTS', 'PAPER', 'PARACHUTE', 'PARK', 'PART', 'PASS', 'PASTE', 'PENGUIN', 'PHOENIX', 'PIANO', 'PIE', 'PILOT', 'PIN', 'PIPE', 'PIRATE', 'PISTOL', 'PIT', 'PITCH', 'PLANE', 'PLASTIC', 'PLATE', 'PLATYPUS', 'PLAY', 'PLOT', 'POINT', 'POISON', 'POLE', 'POLICE', 'POOL', 'PORT', 'POST', 'POUND', 'PRESS', 'PRINCESS', 'PUMPKIN', 'PUPIL', 'PYRAMID', 'QUEEN', 'RABBIT', 'RACKET', 'RAY', 'REVOLUTION', 'RING', 'ROBIN', 'ROBOT', 'ROCK', 'ROME', 'ROOT', 'ROSE', 'ROULETTE', 'ROUND', 'ROW', 'RULER', 'SATELLITE', 'SATURN', 'SCALE', 'SCHOOL', 'SCIENTIST', 'SCORPION', 'SCREEN', 'SCUBA DIVER', 'SEAL', 'SERVER', 'SHADOW', 'SHAKESPEARE', 'SHARK', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SINK', 'SKYSCRAPER', 'SLIP', 'SLUG', 'SMUGGLER', 'SNOW', 'SNOWMAN', 'SOCK', 'SOLDIER', 'SOUL', 'SOUND', 'SPACE', 'SPELL', 'SPIDER', 'SPIKE', 'SPINE', 'SPOT', 'SPRING', 'SPY', 'SQUARE', 'STADIUM', 'STAFF', 'STAR', 'STATE', 'STICK', 'STOCK', 'STRAW', 'STREAM', 'STRIKE', 'STRING', 'SUB', 'SUIT', 'SUPERHERO', 'SWING', 'SWITCH', 'TABLE', 'TABLET', 'TAG', 'TAIL', 'TAP', 'TEACHER', 'TELESCOPE', 'TEMPLE', 'THEATER', 'THIEF', 'THUMB', 'TICK', 'TIE', 'TIME', 'TOKYO', 'TOOTH', 'TORCH', 'TOWER', 'TRACK', 'TRAIN', 'TRIANGLE', 'TRIP', 'TRUNK', 'TUBE', 'TURKEY', 'UNDERTAKER', 'UNICORN', 'VACUUM', 'VAN', 'VET', 'WAKE', 'WALL', 'WAR', 'WASHER', 'WASHINGTON', 'WATCH', 'WATER', 'WAVE', 'WEB', 'WELL', 'WHALE', 'WHIP', 'WIND', 'WITCH', 'WORM', 'YARD', 'DRUM', 'BRIDE', 'WAGON', 'UNIVERSITY', 'HIT', 'ASH', 'BASS', 'ASTRONAUT', 'DOLL', 'NERVE', 'COACH', 'BEAM', 'SPOON', 'COUNTRY', 'NOSE', 'KING ARTHUR', 'STAMP', 'CAMP', 'BRAIN', 'LEAF', 'TUTU', 'COAST', 'LUNCH', 'THUNDER', 'POTATO', 'DESK', 'ONION', 'ELEPHANT', 'ANCHOR', 'COWBOY', 'FLOOD', 'MOHAWK', 'SANTA', 'PITCHER', 'BARBECUE', 'LEATHER', 'SKATES', 'MUSKETEER', 'SNAP', 'SADDLE', 'GENIE', 'MARK', 'SHOULDER', 'GOVERNOR', 'MANICURE', 'ANTHEM', 'HALLOWEEN', 'NEWTON', 'BALLOON', 'FIDDLE', 'CRAFT', 'GLACIER', 'CAKE', 'RAT', 'TANK', 'BLIND', 'SPIRIT', 'CABLE', 'SWAMP', 'EINSTEIN', 'HIDE', 'CRYSTAL', 'GEAR', 'KISS', 'PEW', 'POWDER', 'TURTLE', 'BACON', 'SHERLOCK', 'SQUASH', 'BOOK', 'RAZOR', 'DRESSING', 'BRICK', 'BRAZIL', 'TEAR', 'STABLE', 'BIKINI', 'PEN', 'ROLL', 'CHRISTMAS', 'RUBBER', 'BAY', 'MOTHER', 'KICK', 'FOG', 'RADIO', 'CRAB', 'CONE', 'SKULL', 'WHEELCHAIR', 'EGG', 'BUTTER', 'WEREWOLF', 'CHERRY', 'PATIENT', 'DRYER', 'DRAWING', 'BOSS', 'FEVER', 'BANANA', 'POLISH', 'KNOT', 'PAINT', 'STORM', 'GOLDILOCKS', 'PILLOW', 'CHAIN', 'MOSES', 'SAW', 'BROTHER', 'RAIL', 'ROPE', 'STREET', 'PAD', 'CAPTAIN', 'WISH', 'AXE', 'SHORTS', 'POPCORN', 'CASTLE', 'SECOND', 'TEAM', 'OASIS', 'MESS', 'MISS', 'AVALANCHE', 'TEXAS', 'SUN', 'LETTER', 'RUST', 'WING', 'STEEL', 'EAR', 'SCROLL', 'BUNK', 'CANE', 'VENUS', 'LADDER', 'PURSE', 'SHEET', 'NAPOLEON', 'SUGAR', 'DIRECTOR', 'ACE', 'SCRATCH', 'BUCKET', 'CAESAR', 'DISK', 'BEARD', 'BULB', 'BENCH', 'SCARECROW', 'IGLOO', 'TUXEDO', 'EARTH', 'RAM', 'SISTER', 'BREAD', 'RECORD', 'DASH', 'GREENHOUSE', 'DRONE', 'STEAM', 'BISCUIT', 'RIP', 'NOTRE DAME', 'LIP', 'SHAMPOO', 'CHEESE', 'SACK', 'MOUNTIE', 'SUMO', 'SAHARA', 'WALRUS', 'DUST', 'HAMMER', 'CLOUD', 'SPRAY', 'ST.PATRICK', 'KILT', 'MONKEY', 'FROG', 'DENTIST', 'RAINBOW', 'WHISTLE', 'REINDEER', 'KITCHEN', 'LEMONADE', 'SLIPPER', 'FLOOR', 'VALENTINE', 'PEPPER', 'ROAD', 'SHED', 'BOWLER', 'MILK', 'WHEEL', 'MAGAZINE', 'BRASS', 'TEA', 'HELMET', 'FLAG', 'TROLL', 'JAIL', 'STICKER', 'PUPPET', 'CHALK', 'BONSAI', 'SWEAT', 'GANGSTER', 'BUTTERFLY', 'STORY', 'SALAD', 'ARMOR', 'SMOKE', 'CAVE', 'QUACK', 'BREAK', 'SNAKE', 'MILL', 'GYMNAST', 'WONDERLAND', 'DRIVER', 'SPURS', 'ZOMBIE', 'PIG', 'CLEOPATRA', 'TOAST', 'PENNY', 'ANT', 'VOLUME', 'LACE', 'BATTLESHIP', 'MARACAS', 'METER', 'SLING', 'DELTA', 'STEP', 'JOAN OF ARC', 'COMET', 'BATH', 'POLO', 'GUM', 'VAMPIRE', 'SKI', 'POCKET', 'BATTLE', 'FOAM', 'RODEO', 'SQUIRREL', 'SALT', 'MUMMY', 'BLACKSMITH', 'CHIP', 'GOAT', 'LAUNDRY', 'BEE', 'TATTOO', 'RUSSIA', 'TIN', 'MAP', 'YELLOWSTONE', 'SILK', 'HOSE', 'SLOTH', 'KUNG FU', 'CLOCK', 'BEAN', 'LIGHTNING', 'BOWL', 'GUITAR', 'RANCH', 'PEARL', 'FLAT', 'VIRUS', 'ICE AGE', 'COFFEE', 'MARATHON', 'ATTIC', 'WEDDING', 'COLUMBUS', 'POP', 'SHERWOOD', 'TRICK', 'NYLON', 'LOCUST', 'PACIFIC', 'CUCKOO', 'TORNADO', 'MEMORY', 'JOCKEY', 'MINOTAUR', 'BIG BANG', 'PAGE', 'SPHINX', 'CRUSADER', 'VOLCANO', 'RIFLE', 'BOIL', 'HAIR', 'BICYCLE', 'JUMPER', 'SMOOTHIE', 'SLEEP', 'PENTAGON', 'GROOM', 'RIVER', 'FARM', 'JUDGE', 'VIKING', 'EASTER', 'MUD', 'PARROT', 'COMB', 'SALSA', 'EDEN', 'ARMY', 'PADDLE', 'SALOON', 'MONA LISA', 'MILE', 'BLIZZARD', 'QUARTER', 'JEWELER', 'HAMBURGER', 'GLASSES', 'SAIL', 'BOXER', 'RICE', 'MIRROR', 'INK', 'BEER', 'TIPI', 'MAKEUP', 'MICROWAVE', 'HERCULES', 'SIGN', 'PIZZA', 'WOOL', 'HOMER', 'MINUTE', 'SWORD', 'SOUP', 'ALASKA', 'BABY', 'POTTER', 'SHOWER', 'BLADE', 'NOAH', 'SOAP', 'TUNNEL', 'PEACH', 'DOLLAR', 'TIP', 'LOVE', 'JELLYFISH', 'STETHOSCOPE', 'TASTE', 'FUEL', 'MOSQUITO', 'WIZARD', 'BIG BEN', 'GARDEN', 'WAITRESS', 'SHOOT', 'SHELL', 'LUMBERJACK', 'MEDIC', 'DREAM', 'BLUES', 'EARTHQUAKE', 'PEA', 'PARADE', 'SLED', 'SMELL', 'COMPUTER', 'COW', 'PEANUT', 'WINDOW', 'MUSTARD', 'SAND', 'GOLF', 'CROW', 'ICELAND', 'APRON', 'VIOLET', 'DOOR', 'TIGER', 'JOKER', 'HOUSE', 'COLLAR', 'HAWAII', 'DWARF', 'PINE', 'MAGICIAN', 'FROST', 'CURRY', 'BUBBLE', 'WOOD'];
}

function newBoard() {
	let words = allWords.sort(_ => 0.5 - Math.random()).filter((word, i) => i < 25);
	board = words.map((word, i) => new Object({
		word: word,
		bomb: false,
		revealed: false,
		team: teams[i % (teams.length + 1)] // asigns a word to each team, plus a non-team 
	}));
	board[teams.length].bomb = true;
	board = board.sort(_ => 0.5 - Math.random());

	turn = 0;
	teams = teams.sort(_ => 0.5 - Math.random());
	io.emit('turn', teams[turn % teams.length]);
	io.emit('board', board);
};
newBoard();

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', function (socket) {

	let currentCodes = players.map(player => player.code);
	let availableCode = playerCodes.find(code => !currentCodes.includes(code));

	if (!availableCode) {
		return console.log('no more players allowed.');
	}

	let [team, role] = availableCode.split('_');
	players.push({
		code: availableCode,
		team: team,
		role: role,
		id: socket.id,
		socket: socket
	});
	console.log('New player:', availableCode, socket.id);

	io.to(socket.id).emit('teams', teams);

	io.emit('players', players.map(player => {
		return {
			team: player.team,
			role: player.role,
			id: player.id
		}
	}));

	io.to(socket.id).emit('board', board);
	io.to(socket.id).emit('turn', teams[turn % teams.length]);

	checkWinner();

	socket.on('end_turn', data => {
		turn += 1;
		io.emit('turn', teams[turn % teams.length]);
	});

	socket.on('reveal', index => {
		io.emit('reveal', index);
		let tile = board[index];
		tile.revealed = true;
		let turnTeam = teams[turn % teams.length];
		if(tile.team != turnTeam && !tile.bomb) {
			turn += 1;
			io.emit('turn', teams[turn % teams.length]);
		}
		checkWinner();
	});

	socket.on('new_game', data => {
		newBoard();
	});

	socket.on('swap', ids => {
		console.log('Swap:', ids);
		let player1 = players.find(p => p.id == ids[0]);
		let player2 = players.find(p => p.id == ids[1]);
		let shelf = player1.team;
		player1.team = player2.team;
		player2.team = shelf;
		shelf = player1.role;
		player1.role = player2.role;
		player2.role = shelf;
		io.emit('swap', ids);
		newBoard();
	});

	//agent moves
	socket.on('move', data => {
		io.emit('move', data);
	});

	// Relay signals back and forth
	socket.on('signal', (to, from, data) => {
		console.log("SIGNAL", to, from);
		let player = players.find(p => p.id == to);
		if (player) {
			console.log("Found Peer, sending signal");
			player.socket.emit('signal', to, from, data);
		} else {
			console.log("Peer not found", to);
		}
	});

	socket.on('disconnect', function () {
		console.log("Client has disconnected " + socket.id);
		players = players.filter(p => p.id != socket.id);
		io.emit('remove_player', socket.id);
	});
});


function checkWinner() {
	//check bomd
	if (board.some(t => t.bomb && t.revealed)) return io.emit('winner', false); // lost

	// gets remaining tiles
	let remainingTiles = board.filter(t => !t.revealed);

	//checks if a team is cleared
	let winningTeams = teams.filter(team => !remainingTiles.some(t => t.team === team));
	if (winningTeams.length) io.emit('winner', winningTeams[0]);
}