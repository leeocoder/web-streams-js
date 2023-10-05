import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import { WritableStream, TransformStream } from 'node:stream/web';
import csvtojson from 'csvtojson';
import { setTimeout } from 'node:timers/promises'

// curl -i -N localhost:3000
const PORT = 3000;
// Request and response are nodejs streams. They work with socket protocol
createServer(async (request, response) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  };
  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers);
    response.end();
    return;
  }
  let items = 0;
  // Readable é a font de dados e o Writable é a saída de dados
  request.once('close', _ => console.log('Connection was closed', items))
  Readable.toWeb(createReadStream('./animeflv.csv'))
  // passo a passo que ca item individual vai trafegar
  // pode ser usado várias vezes
  .pipeThrough(Transform.toWeb(csvtojson()))
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      // Chunk vem como binário, Uint8Array
      // console.log('*****chunk: ', Buffer.from(chunk).toString());
      const data = JSON.parse(Buffer.from(chunk));
      const mappedData = {
        title: data.title,
        description: data.description,
        url_anime: data.url_anime
      }
      //Quebra de linha pois é um NDJSON
      controller.enqueue(JSON.stringify(mappedData).concat('\n'))
    }
  }))
  //PipeTo é ultima etapa
  .pipeTo(
    new WritableStream({
      async write(chunk) {
        await setTimeout(1000)
        items++;
        response.write(chunk);
      },
      close() {
        response.end()
      }
    })
  );

  response.writeHead(200, headers);
})
  .listen(PORT)
  .on('listening', (_) => console.log(`Server is running at ${PORT}`));
