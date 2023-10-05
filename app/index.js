let counter = 0;  // Inicializa um contador para rastrear o número de elementos processados
const API_URL = 'http://localhost:3000';  // Define a URL da API

async function consumeAPI(signal) {
  const response = await fetch(API_URL, { signal });  // Faz uma requisição à API usando a URL e o sinal de abortamento
  const reader = response.body
    .pipeThrough(new TextDecoderStream())  // Cria um fluxo para decodificar o corpo da resposta em texto
    .pipeThrough(parseNDJSON()) // será utilizado para processar o JSON.
  return reader;  // Retorna o leitor para processamento posterior
}

// Função para analisar dados no formato NDJSON (Newline Delimited JSON)
function parseNDJSON() {
  let ndJsonBuffer = '';  // Inicializa um buffer para armazenar dados incompletos

  return new TransformStream({
    transform(chunk, controller) {
      ndJsonBuffer += chunk;  // Concatena o novo pedaço com o buffer existente
      const items = ndJsonBuffer.split('\n');  // Divide os itens em linhas
      items.slice(0, -1).forEach(item => controller.enqueue(JSON.parse(item)));  // Processa os itens completos
      ndJsonBuffer = items[items.length - 1];  // Atualiza o buffer com o último item incompleto
    },
    flush(controller) {
      if (!ndJsonBuffer) return;  // Se ainda houver dados no buffer, processa-os
      controller.enqueue(JSON.parse(ndJsonBuffer));
    }
  });
}

// Função para adicionar um elemento HTML ao DOM
function appendToHTML(element) {
  return new WritableStream({
    write({ title, description, url_anime }) {
      const descriptionText = description ? description.slice(0, 100) : '';
      console.log({ title, description, url_anime });
      const card = `
        <article>
          <div class='text'>
            <h3>[${++counter}]${title}</h3>
            <p>${descriptionText}</p>
            <a href="${url_anime}">Here's why</a>
          </div>
        </article>`;  // Cria um novo cartão HTML com os dados fornecidos

      element.innerHTML += card;  // Adiciona o cartão ao elemento HTML especificado
    },
    abort(reason) {
      console.log(reason);  // Manipula uma operação de abortamento, se ocorrer
    }
  });
}

let abortController = new AbortController();  // Cria um controlador de aborto

const [start, stop, cards] = ['start', 'stop', 'cards'].map(item => document.getElementById(item));  // Obtém os elementos HTML

start.addEventListener('click', async () => {
  const readable = await consumeAPI(abortController.signal);  // Consome a API e obtém um leitor de dados
  readable.pipeTo(appendToHTML(cards));  // Encadeia o leitor com a função de adição de HTML
});

stop.addEventListener('click', () => {
  abortController.abort();  // Aborta a operação atual
  abortController = new AbortController();  // Cria um novo controlador de aborto para futuras operações
  console.log('aborting...');  // Exibe uma mensagem de que o aborto foi iniciado
});
