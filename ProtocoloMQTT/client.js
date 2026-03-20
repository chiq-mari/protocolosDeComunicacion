/* jshint esversion : 6 */
"use strict";
//.\mosquitto_pub -t "home/kitchen/light" -m "Encendida"
var mqtt = require('mqtt');

//ip remoto
const brokerUrl = 'mqtt://localhost';
var client = mqtt.connect(brokerUrl, {
    clientId: "mariangeles",
    connectTimeout: 4000
});

// 1. EL DIRECTORIO (Handlers)
// Aquí guardamos qué función ejecutar según el tópico que llegue
const handlers = {
    "home/kitchen/table": (msg) => console.log("🛋️  Mesa dice:", msg),
    "home/kitchen/light": (msg) => console.log("💡 Luz dice:", msg),
    "home/bedroom/tv":    (msg) => console.log("📺 TV dice:", msg),
    ///////////////
    /*
    "home/bedroom/air conditioning":    (msg) => console.log(" air conditioning dice:", msg),
    "home/bedroom/closet":    (msg) => console.log("closet dice:", msg),
    */
   ///////////////
   /*
   "home/bedroom/chair":    (msg) => console.log("chair dice:", msg)
   */
};

client.on('connect', function () {
    console.log("Conectado exitosamente!");
    
    // 2. SUSCRIPCIÓN DINÁMICA
    // En lugar de una sola variable, nos suscribimos a todos los canales del directorio
    const canales = Object.keys(handlers); 
    client.subscribe(canales, {qos: 1});
    
    console.log("Suscrito a:", canales.join(", "));
});

// 3. EL RECEPCIONISTA INTELIGENTE
client.on('message', function (topic, message) {
    const contenido = message.toString();

    // Verificamos si el tópico existe en nuestro "directorio"
    if (handlers[topic]) {
        // Ejecutamos la función asociada a ese tópico
        handlers[topic](contenido);
    } else {
        console.log(" Mensaje desconocido en:", topic);
    }
});

client.on('error', (error) => console.log("Error:", error));