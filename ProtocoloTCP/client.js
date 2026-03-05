let net=require(`net`);
const prompt = require('prompt-sync')();

let client = new net.Socket();

client.connect(1337, `localhost`, function(){
    console.log(`Connected`);
});


client.on(`data`, function(data){
    if(data.toString().includes("Opciones para manipular archivos"))
        {
            console.log(data.toString());
            let ans = prompt('Escribe el comando que desee ejecutar: ')
            client.write(ans)
        }
    else{
        console.log(`Received: `+data);
    }
});

/*
client.on(`close`, function(){
    console.log(`Fin del programa`);
})
    */
const options=
`----------------------------------------------
    Opciones para manipular archivos
 ----------------------------------------------
    1.Crear ->           create(filename)
    2.Escribir texto ->  write(filename, texto)
    3.Adicionar texto -> append(filename, texto)
    4.Eliminar ->        delete (filename)
    5.Leer ->            read(filename)
    6. Cerrar programa-> close program
    ----------------------------------------------`
