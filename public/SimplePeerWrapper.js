// A wrapper for simplepeer as we need a bit more than it provides
export class SimplePeerWrapper {

  constructor(initiator, id, socket, stream, onstream = () => null) {
    this.simplepeer = new SimplePeer({
      initiator: initiator,
      trickle: false
    });

    this.id = id;
    this.socket = socket;
    this.stream = stream;

    this.signal = (signal) => this.simplepeer.signal(signal);

    // simplepeer generates signals which need to be sent across socket
    this.simplepeer.on('signal', data => {
      this.socket.emit('signal', this.id, this.socket.id, data);
    });

    // When we have a connection, send our stream
    this.simplepeer.on('connect', () => {
      this.simplepeer.addStream(stream);
    });

    // Stream coming in to us
    this.simplepeer.on('stream', stream => {
      onstream(stream, id);
    });

    this.simplepeer.on('close', () => {
      // Should probably remove from the array of simplepeers
    });

    this.simplepeer.on('error', (err) => {
      console.log(err);
    });
  }

}

export default SimplePeerWrapper;