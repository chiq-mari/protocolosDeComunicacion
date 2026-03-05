const net = require('net');
const prompt = require('prompt-sync')();
const { appendFile} = require('fs/promises'); 
const { readFile } = require('fs/promises'); 
const { unlink } = require('fs/promises'); 
const { writeFile } = require('fs/promises');

//crear
async function createFile(fileName) {
  try {
    await writeFile(fileName, "", { flag: "wx" });
    return {
      success: true,
      message: `Archivo ${fileName} creado`
    };

  } catch (error) {

    if (error.code === "EEXIST") {
      return {
        success: false,
        message: "El archivo ya existe"
      };
    }

    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

//write
async function writeToFile(fileName, text) { 

  try { 
    await appendFile(fileName, text, { flag: 'w' });                   
    console.log(`Escribi contenido a ${fileName}`); 
  } catch (error) { 
    console.error(`Error escribiendo en archivo: ${error.message}`); 
  } 
 }
 //append
async function appendToFile(fileName, text) { 

  try { 
    await appendFile(fileName, text, { flag: 'a' });                   
    console.log(`Añadi contenido a ${fileName}`); 
  } catch (error) { 
    console.error(`Error añadiendo contenido en archivo: ${error.message}`); 
  } 
 }
//del
async function deleteThisFile(fileName) {

  try {

    await unlink(fileName);

    return {
      success: true,
      message: "Archivo eliminado correctamente"
    };

  } catch (error) {

    if (error.code === "ENOENT") {
      return {
        success: false,
        message: "El archivo no existe"
      };
    }

    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}


//read
async function readThisFile(fileName) { 
  try {  
    const data = await readFile(fileName);
    const content = (data.toString()); 
    console.log(`Leyo archivo ${fileName}`);
    return content
  } catch (error) { 
    console.error(`Error leyendo archivo: ${error.message}`); 
  } 
}
//cerrar

let servidor = net.createServer(function(socket){
    socket.write(options); //envia un msj al cliente
    console.log('Cliente conectado.');
    //socket.pipe(socket) //hace al server echo server --> todo lo que llega → se envía de vuelta.

    socket.on(`data`,async function(data){
        data = data.toString()
        let command= data.split("(")[0].trim().toLocaleLowerCase();

        switch(command){
            case "create":
                console.log('Creando el archivo ...')
                let args1= smartSplit(searchArgs(data))
                let resultado= await createFile(args1[0])
                socket.write(resultado.message + "\n");
                socket.write(options)
                break
            case "write":
                console.log('Escribiendo en el archivo....')
                let args2= smartSplit(searchArgs(data))
                writeToFile(args2[0], args2[1])
                socket.write('Operacion exitosa')
                socket.write(options)
                break
            case "append":
                console.log('Añadiendo al archivo....')
                let args3= smartSplit(searchArgs(data))
                appendToFile(args3[0], args3[1])
                socket.write('Operacion exitosa')
                socket.write(options)
                break

            case "delete":
                console.log('Eliminando el archivo ...')
                let args6= smartSplit(searchArgs(data))
                let result= await deleteThisFile(args6[0])
                socket.write(result.message + "\n");
                socket.write(options)
                break
            case "read":
                console.log('leyendo el archivo ...')
                let args5= smartSplit(searchArgs(data))
                let content= await readThisFile(args5[0])
                socket.write(`${args5[0]} : ${content}\n`)
                socket.write(options)
                break
            case "close program":
              console.log("Cerrando...")
              socket.write("Servidor cerrando...\n")
              socket.end()
                
              servidor.close(() => {  //cierra el servidor
                console.log('Servidor cerrado');
                process.exit()
              });

            default:
              socket.end()
                
              servidor.close(() => {  //cierra el servidor
                console.log('Servidor cerrado');
                socket.write("Conexion cerrada")
                process.exit()
              });  
        }

    });

    //Handling errors
    socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`);
  })
  socket.on('end', () => {
    socket.destroy();
  });

  socket.on('close', () => {
    console.log("La conexion con el cliente se ha terminado");
  });

});


/*servidor.on('connection', function(socket) {
    socket.on('end', function() {   //se dispara cuando el cliente llama: client.end()
        console.log('Conexión cerrada por el cliente');
        servidor.close(() => {  //cierra el servidor
            console.log('Servidor cerrado');
        });
    });

});
*/

servidor.listen(1337, `0.0.0.0`);

const options=
`----------------------------------------------
    Opciones para manipular archivos
 ----------------------------------------------
    1.Crear ->           create(filename)
    2.Escribir texto ->  write(filename, texto)
    3.Adicionar texto -> append(filename, texto)
    4.Eliminar ->        delete (filename)
    5.Leer ->            read(filename)
    6.Cerrar programa-> close program
-----------------------------------------------`
const panelInput= ()=>{
    console.log(options)
    const ans = prompt('');
    return ans
}

const searchArgs= (command)=>{
    command = String(command)
    //console.log(command)
    let first = command.indexOf('(')
    let last = command.lastIndexOf(')')

    return command.slice(first+1, last)
}
function smartSplit(str) {

    function cleanParam(param) {
        
        param = param.trim();
        
        const first = param[0];
        const last = param[param.length - 1];
        
        // verificar si es string con quotes
        if (
        (first === "'" && last === "'") ||
        (first === '"' && last === '"') ||
        (first === "`" && last === "`")
        ) {
        return param.slice(1, -1);
    }

    // no tocar si no es string
    return param;
}

  const result = [];
  let current = "";

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let parenLevel = 0;

  for (let i = 0; i < str.length; i++) {

    const char = str[i];

    // manejar comillas
    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
    }
    else if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
    }
    else if (char === "`" && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
    }

    // manejar paréntesis (solo fuera de strings)
    else if (char === "(" && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      parenLevel++;
    }
    else if (char === ")" && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      parenLevel--;
    }

    // dividir solo si es coma válida
    if (
      char === "," &&
      !inSingleQuote &&
      !inDoubleQuote &&
      !inBacktick &&
      parenLevel === 0
    ) {
      result.push(cleanParam(current));
      current = "";
      continue;
    }

    current += char;
  }

  if (current) {
    result.push(cleanParam(current));
  }

  return result;
}



/*Prueba a funciones
let a= "create(gt.txt, 'holaque, mas')"
console.log(searchArgs(a))
let b = smartSplit(searchArgs(a))
console.log(b)*/

///////////////////////////////////////////////////

//append to file
