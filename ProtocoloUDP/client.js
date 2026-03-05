const dgram = require('dgram');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();

const socket = dgram.createSocket('udp4');
const PORT = 41234;
// Use server IP when running from another machine: node simpleclient.js 192.168.1.100
const HOST = process.argv[2] || 'localhost';
const CHUNK_SIZE = 1024; // bytes per packet
console.log(`Sending to ${HOST}:${PORT}`);

// Obtener datos desde consola antes de enviar
const textoAEnviar = prompt('Texto a enviar: ');
const filePath = prompt('Direccion del Archivo a enviar: ');
const asuntoEmail = prompt('Asunto del Email: ');
const correoReceptor = prompt('Correo del Receptor: ');
const fileExtension = path.extname(filePath);


// Read file
const fileData = fs.readFileSync(filePath);
const totalChunks = Math.ceil(fileData.length / CHUNK_SIZE);

console.log(`Sending ${fileData.length} bytes in ${totalChunks} chunks...`);


// Send each chunk sequentially
let chunkIndex = 0;  // keeps track of the current chunk index

function sendChunk() { 
  
  // verify if all chunks have been sent
  if (chunkIndex >= totalChunks) {
    console.log('All chunks sent!');
    socket.close();
    return;
  }

  // if not all sent, send first/next chunk:
  const start = chunkIndex * CHUNK_SIZE; // update the start of the chunk
  const chunk = fileData.slice(start, start + CHUNK_SIZE); // extract the chunk from the image data


  // 1 byte can represent 256 different values., 0-255. 2 bytes can represent 65536 different values, 0-65535.
  // Header: 1 byte for packet type (1 = file chunk, 2 = metadata), 2 bytes for index, 2 bytes for total
  const header = Buffer.allocUnsafe(5);  // creates a buffer of 5 bytes
  header.writeUInt8(1, 0);              // message type = 1 (file chunk)
  header.writeUInt16BE(chunkIndex, 1);  // writing the chunk index in the first 2 bytes
  header.writeUInt16BE(totalChunks, 3); // writing the total number of chunks in the last 2 bytes

  // Combine header + data, creates a unique packet for each chunk with its own type, 
  // packet type flag, its own index and total number of chunks (header) and the chunk data (chunk)
  const packet = Buffer.concat([header, chunk]);

  socket.send(packet, PORT, HOST, (err) => {
    if (err) {
      console.error('Send error:', err);
      socket.close();
      return;
    }
    chunkIndex++;
    console.log(`Sent chunk ${chunkIndex}/${totalChunks}`);
    // Small delay to avoid overwhelming UDP
    setTimeout(sendChunk, 5);
  });
}

// Send metadata first (packet type 2), then start sending file chunks
function sendMetadataAndFile() {
  const metadata = {
    textoAEnviar: textoAEnviar,
    asuntoEmail: asuntoEmail,
    correoReceptor: correoReceptor,
    fileExtension: fileExtension
  };

  // Converts the json into a string and then into a buffer or array of bytes (main part of the packet)
  const metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf8');
  // Creates header of information for the first packet
  const header = Buffer.allocUnsafe(1);
  header.writeUInt8(2, 0); // message type = 2 (metadata)

  // assembles the packet
  const packet = Buffer.concat([header, metadataBuffer]);

  // sends the first packet ( email metadata)
  socket.send(packet, PORT, HOST, (err) => {
    if (err) {
      console.error('Send metadata error:', err);
      socket.close();
      return;
    }
    console.log('Metadata sent');
    // send the rest of packets of file set
    sendChunk();
  });
}

// call function to send what the client prompted
sendMetadataAndFile();
