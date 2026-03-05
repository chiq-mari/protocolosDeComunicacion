const dgram = require('dgram');
const fs = require('fs');
const nodemailer = require("nodemailer");
const path = require("path");

const PORT = 41234; // UDP port the server listens on.
const chunks = []; // array for storing received chunks of a file by index
let totalChunks = 0; // Total number of chunks expected for the file
let emailInfo = null; // Stores received metadata (texto, asunto, correo) it'll be an object.
let fileSaved = false; // true once we have received all chunks and written the file
let fileReceivedName; 
let fileReceivedPath; 
const userGmail = ""; // poner aqui el correo de quien envia 
const passAppGmail = ""; //aqui su contraseña

const transporter = nodemailer.createTransport({
  service: "gmail", // tipo de servicio
  auth: {
      user: userGmail,
      pass: passAppGmail,
  },
});

function tryCloseSocket() {
  if (emailInfo && fileSaved) {
    console.log('Metadata and file received. Sending the email...');
    sendEmail(() => {
      console.log('Closing the server.');
      socket.close();
    });
  }
}

function sendEmail(done) {

  const mailOptions = {
    from : userGmail,  // de donde
    to: emailInfo.correoReceptor, // a quien
    subject: emailInfo.asuntoEmail, // asunto
    text: emailInfo.textoAEnviar, //contenido
    attachments:  [{ filename: fileReceivedName, path: fileReceivedPath,}
        // path to the file, name shown in email
    ],
}

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
    if (typeof done === 'function') done();
  });
}


const socket = dgram.createSocket('udp4'); // Create a UDP socket.

socket.on('message', (msg, rinfo) => {  // every time a new packet is received:
  // reads first byte in message (message type)
  const msgType = msg.readUInt8(0);
  
  // Type 1: file chunk
  if (msgType === 1) {
    // Extract header: next 4 bytes
    const index = msg.readUInt16BE(1); // sequence number of this chunk
    const total = msg.readUInt16BE(3); // total number of chunks in the file
    const data = msg.slice(5); // Rest is the chunk data

    // Set total on first packet
    if (totalChunks === 0) {
      totalChunks = total;
      console.log(`Receiving ${total} chunks...`);
    }

    // Store chunk at its index
    chunks[index] = data;
    const received = chunks.filter(Boolean).length; // Counts the number of chunks that have been received (i.e., are not null).

    console.log(`Received chunk ${index + 1}/${totalChunks} (${received}/${totalChunks} total)`);

    // If we have all chunks, reconstruct and save
    if (received === totalChunks) {
      const file = Buffer.concat(chunks);
      fileReceivedName = 'fileReceived'+emailInfo.fileExtension;
      fileReceivedPath = "./"+fileReceivedName;
      fs.writeFileSync(`${fileReceivedName}`, file);  ////////
      console.log(`file saved as ${fileReceivedName}`); ////////
      // Reset for next image
      chunks.length = 0;
      totalChunks = 0;
      fileSaved = true;
      tryCloseSocket();
    }
  }
  // Type 2: metadata (texto, asunto, correo)
  else if (msgType === 2) {
    const jsonStr = msg.slice(1).toString('utf8');
    try {
      emailInfo = JSON.parse(jsonStr);
      console.log(`Received metadata:, ${emailInfo}`);
      tryCloseSocket();
    } catch (err) {
      console.error('Error parsing metadata JSON:', err);
    }
  } else {
    console.warn('Unknown message type:', msgType);
  }
});

socket.on('listening', () => {
  const addr = socket.address();
  console.log(`UDP server listening on ${addr.address}:${addr.port}`);
});

socket.bind(PORT);
