import SimplePeerWrapper from './SimplePeerWrapper.js';

var socket;
var mystream;
var teams = [];
var players = [];
var me;
var board = [];
let peers = [];

const teamInTurn = new Binder();
const winnerTeam = new Binder();
const showSwapModal = new Binder();

const COLOR = {
  neutral: 'tan',
  bomb: 'black',
  shade: 'lightslategray'
}

const modalStyle = {
  position: 'absolute',
  zIndex: 5,
  width: '60%',
  margin: '20%',
  padding: '4em',
  boxShadow: '1px 1px 3px black',
  border: 'solid 2em white',
  textAlign: 'center',
  top: 0,
  left: 0,
  backgroundColor: COLOR.shade,
  color: 'white',
};

const modalButtonStyle = {
  color: 'black',
  border: 'none',
  padding: '1em 2em',
  margin: '1em',
  backgroundColor: 'white'
};

const swapModal = {
  style: modalStyle,
  display: showSwapModal.bind(value => value ? 'block' : 'none'),
  h3: 'Are you sure you want to swap roles?',
  p: 'This will restart the game.',
  button: [{
    style: modalButtonStyle,
    text: 'Swap',
    click: evt => socket.emit('swap', [me.id, showSwapModal.value])
  }, {
    style: modalButtonStyle,
    text: 'Cancel',
    click: evt => showSwapModal.value = false
  }]
};

const winnerModal = {
  style: modalStyle,
  backgroundColor: winnerTeam,
  display: winnerTeam.bind(value => value ? 'block' : 'none'),
  h1: {
    text: winnerTeam.bind(value => value === COLOR.bomb ? `The ${teamInTurn.value} team lost!!` : `The ${value} team wins!!`),
  },
  button: {
    style: modalButtonStyle,
    text: 'New Game',
    click: evt => socket.emit('new_game')
  }
};

DOM.style();

DOM.create({
  title: 'Field Agents',
  charset: 'UTF-8',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
  },
  icon: 'icon.png',
  fontFamily: 'IBM Plex Mono',
  backgroundColor: COLOR.shade,
  div: {
    id: 'container',
    transition: 'ease 0.5s',
    backgroundColor: teamInTurn,
    width: '56em',
    position: 'relative',
    header: {
      color: teamInTurn,
      textAlign: 'center',
      height: '7.25em',
      padding: '1em',
      backgroundColor: 'rgba(255,255,255,0.68)',
      h1: {
        fontSize: '2.5em',
        fontFamily: "'Titillium Web', sans-serif",
        textShadow: '0 0 2px white',
        text: 'Field Agents'
      },
      h6: {
        textTransform: 'capitalize',
        text: teamInTurn.bind(value => value ? `${value}\'s turn` : '')
      }
    },
    main: {
      padding: '1em',
      backgroundColor: 'rgba(255,255,255,0.34)',
      border: 'solid 0.34em',
      borderColor: teamInTurn,
      div: {
        id: 'boardElement',
        display: 'flex',
        placeContent: 'center',
        flexWrap: 'wrap'
      }
    },
    footer: {
      backgroundColor: 'rgba(255,255,255,0.68)',
      padding: '1em',
      height: '5.5em',
      button: {
        float: 'right',
        color: 'white',
        border: 'none',
        padding: '1em 2em',
        boxShadow: '1px 1px 3px black',
        backgroundColor: teamInTurn,
        text: 'Next Team',
        click: nextTurn
      },
      p: 'Created by: Lenin Compres and Mai Claro.',
    },
    aside: [winnerModal, swapModal]
  },
  mousemove: mouseMoved
});


// ------------------   GAME LOGIC ------------- //

// GENERAL

function setStream(stream, id) {
  getPlayer(id).video.srcObject = stream;
}

function getPlayer(id) {
  return players.find(p => p.id === id);
}

// GAME SETUP

function newPlayer(player) {
  if (getPlayer(player.id)) return;
  player.video = container.create({
    width: 100,
    height: 75,
    backgroundColor: 'rgba(0,0,0,0.68)',
    onloadedmetadata: evt => evt.target.play()
  }, 'video');
  if (player.id === socket.id) {
    me = player;
    me.video.srcObject = mystream;
    me.video.muted = true;
  }
  if (!me) {
    let peer = new SimplePeerWrapper(true, player.id, socket, mystream, setStream);
    peers.push(peer);
  }
  players.push(player);
  placePlayer(player);
};

function placePlayer(player) {
  let firstTeam = !teams.indexOf(player.team);
  if (player.element) player.element.remove();
  player.isMaster = player.role === 'master';
  container.create({
    div: {
      minWidth: '2em',
      minHeight: '2em',
      pointerEvents: !player.isMaster ? 'none' : undefined,
      position: 'absolute',
      zIndex: teamInTurn.bind(value => player.isMaster ? 0 : value === player.team ? 10 : 9),
      borderRadius: player.isMaster ? 0 : '50%',
      borderTopLeftRadius: 0,
      top: player.isMaster ? 0 : '50vh',
      left: firstTeam ? 0 : 'unset',
      right: !firstTeam ? 0 : 'unset',
      overflow: 'hidden',
      border: 'solid 0.34em transparent',
      backgroundColor: player.team,
      opacity: teamInTurn.bind(value => value === player.team ? '1' : '0.68'),
      boxShadow: player.isMaster ? 'none' : `0.25em 0.25em 3px black`,
      video: player.video,
      p: player.isMaster ? {
        textAlign: 'center',
        color: 'white',
        text: 'Base Agent'
      } : undefined,
      click: player.isMaster ? evt => showSwapModal.value = player.id : undefined,
      onready: elt => player.element = elt
    }
  });
}

function movePlayer(id, x, y){
  let player = getPlayer(id);
  if (player.role != 'agent') return;
  player.element.create({
    bottom: 'auto',
    right: 'auto',
    left: x,
    top: y,
  });
}

function removePlayer(id) {
  let player = getPlayer(id);
  if (player) player.element.remove();
  players = players.filter(p => p.id != id);
  peers = peers.filter(p => p.id != id);
}

function swapPlayers(ids) {
  let player1 = getPlayer(ids[0]);
  let player2 = getPlayer(ids[1]);
  let shelf = player1.team;
  player1.team = player2.team;
  player2.team = shelf;
  shelf = player1.role;
  player1.role = player2.role;
  player2.role = shelf;
  placePlayer(player1);
  placePlayer(player2);
}

function setBoard(data) {
  winnerTeam.value = false;
  showSwapModal.value = false;
  board = data;
  boardElement.create({
    div: board.map((tile, index) => {
      let color = tile.bomb ? COLOR.bomb : tile.team ? tile.team : COLOR.neutral;
      return {
        text: tile.word,
        transition: 'ease 0.5s',
        color: tile.revealed ? 'white' : me.isMaster ? color : 'black',
        backgroundColor: tile.revealed ? color : 'white',
        backgroundImage: tile.bomb && me.isMaster ? 'url(icon.png)' : 'none',
        backgroundSize: '1.5em',
        backgroundPosition: 'center 0.5em',
        backgroundRepeat: 'no-repeat',
        cursor: 'pointer',
        width: '10em',
        padding: '2em 1em',
        margin: '0.25em',
        textAlign: 'center',
        textTransform: 'uppercase',
        borderRadius: '0.5em',
        boxShadow: me.isMaster ? `0 0 1em ${color} inset, 1px 1px 3px black` : '1px 1px 3px black',
        onready: elt => board[index].element = elt,
        click: evt => tileClicked(index),
      }
    })
  }, true);
}

//ACTIONS

function mouseMoved(evt) {
  if (!me) return;
  if (me.role != 'agent') return;
  socket.emit('move', {
    id: me.id,
    x: evt.pageX,
    y: evt.pageY
  });
}

function nextTurn() {
  if (winnerTeam.value) return;
  if (!me) return;
  if (me.role != 'agent') return;
  if (me.team != teamInTurn.value) return;
  socket.emit('end_turn');
}

function tileClicked(index) {
  if (winnerTeam.value) return;
  if (!me) return;
  if (me.role != 'agent') return;
  if (me.team != teamInTurn.value) return;
  socket.emit('reveal', index);
}

function revealTile(index) {
  let tile = board[index];
  let color = tile.team ? tile.team : tile.bomb ? COLOR.bomb : COLOR.neutral;
  tile.element.create({
    color: 'white',
    backgroundColor: color,
  });
}


// ---------- SOCKETS ---------- //

// Prompt the user for permission, get the stream, passing Constraints
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
}).then(stream => {
  mystream = stream;
  setupSocket();
}).catch(err => console.log(err));

function setupSocket() {
  socket = io.connect();
  socket.on('connect', data => console.log("Socket Connected: ", socket.id));
  socket.on('disconnect', data => console.log("Socket disconnected"));
  socket.on('teams', data => teams = data);
  socket.on('board', setBoard);
  socket.on('turn', data => teamInTurn.value = data);
  socket.on('players', arr => arr.forEach(newPlayer));
  socket.on('remove_player', removePlayer);
  socket.on('move', data => movePlayer(data.id, data.x, data.y));
  socket.on('reveal', revealTile);
  socket.on('swap', swapPlayers);
  socket.on('winner', winner => winnerTeam.value = winner ? winner : COLOR.bomb);
  socket.on('signal', function (to, from, data) {
    let peer = peers.find(p => p.id == from);
    if (!peer) {
      peer = new SimplePeerWrapper(false, from, socket, mystream, setStream);
      peers.push(peer);
    }
    peer.signal(data);
  });
}