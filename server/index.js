// Importando os módulos necessários
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import { WritableStream, TransformStream } from 'node:stream/web';
import csvtojson from 'csvtojson';
import { setTimeout } from 'node:timers/promises'

// Definindo a porta do servidor
const PORT = 3000;

// Criando um servidor HTTP
createServer(async (request, response) => {
  // Configurando os cabeçalhos de resposta
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  };

  // Verificando se o método da requisição é OPTIONS
  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers);
    response.end();
    return;
  }

  let items = 0; // Inicializando uma variável para contar os itens processados

  // Adicionando um evento para quando a conexão for fechada
  request.once('close', _ => console.log('Connection was closed', items))

  // Lendo o arquivo CSV e transformando em um stream
  Readable.toWeb(createReadStream('./animeflv.csv'))
  
  // Aplicando transformações no stream de dados
  .pipeThrough(Transform.toWeb(csvtojson())) // Transformando CSV em JSON
  .pipeThrough(new TransformStream({
    // Função de transformação para o stream
    transform(chunk, controller) {
      // Convertendo o chunk de binário (Uint8Array) para objeto JSON
      const data = JSON.parse(Buffer.from(chunk));
      const mappedData = {
        title: data.title,
        description: data.description,
        url_anime: data.url_anime
      }

      // Adicionando uma quebra de linha para formatar como NDJSON
      controller.enqueue(JSON.stringify(mappedData).concat('\n'))
    }
  }))
  // Enviando o stream transformado para o próximo estágio
  .pipeTo(
    new WritableStream({
      async write(chunk) {
        await setTimeout(1000) // Aguardando 1 segundo (simulando algum tipo de processamento)
        items++; // Incrementando o contador de itens processados
        response.write(chunk); // Escrevendo no response
      },
      close() {
        response.end() // Finalizando a resposta
      }
    })
  );

  // Configurando os cabeçalhos da resposta
  response.writeHead(200, headers);
})
  .listen(PORT) // Iniciando o servidor na porta especificada
  .on('listening', (_) => console.log(`Server is running at ${PORT}`)); // Quando o servidor estiver ouvindo, imprime no console
