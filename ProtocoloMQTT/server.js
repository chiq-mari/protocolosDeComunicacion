import { createServer } from 'node:net'
import { Aedes } from 'aedes'

const port = 1883

const aedes = await Aedes.createBroker()
const server = createServer(aedes.handle)

/*const aedes = new Aedes() // Instancia directa
const server = createServer(aedes.handle)*/

server.listen(port, function () {
  console.log('Server MQTT has started and is listening on port: ', port)
})

aedes.on('client', (client)=>{
  console.log(`Cliente conectado: ${client.id}`);
})


 /*
 Primero instálala con npm install mqtt.

 Nota rápida: Asegúrate de tener "type": "module" en tu package.json para que los import funcionen sin problemas.


 */