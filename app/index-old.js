let counter = 0;
const API_URL = 'http://localhost:3000'


async function consumeAPI(signal) {
  const response = await fetch(API_URL, {
    signal
  });
  const reader = response.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(parseNDJSON())
  // .pipeTo(new WritableStream({
  //   write(chunk) {
  //     console.log(counter++, 'chunk', chunk);
  //   }
  // }));
  return reader;
}

// essa função vai se certificar  que caso dois chunk cheguem em um unica transmissão converta corretamente para json
//dado: {}\n{}
//deve
// {}
//{}
function parseNDJSON() {
  let ndJsonBuffer = '';
  return new TransformStream({
    transform(chunk, controller){
      // Agrupando o dado que é od mesmo chunk que é correspondente do mesmo item
      ndJsonBuffer += chunk;
      const items = ndJsonBuffer.split('\n');
      items.slice(0, -1).forEach(item => controller.enqueue(JSON.parse(item)));
      ndJsonBuffer = items[items.length - 1];
    },
    flush(controller) {
      if(!ndJsonBuffer) return;
      controller.enqueue(JSON.parse(ndJsonBuffer))
    }
  });
}

function appendToHTML(element) {
  return new WritableStream({
    write({title, description, url_anime}) {
      const card = `
      <article>
        <div class='text'>
          <h3>[${++counter}]${title}</h3>
          <p>${description.slice(0, 100)}</p>
          <a href="${url_anime}">Here's why</a>
        </div>
      </article>`;
      element.innerHTML += card;
    },
    abort(reason) {
      console.log(reason);
    }
  })
}

let abortController = new AbortController();

const [start, stop, cards] = ['start', 'stop', 'cards'].map(item => document.getElementById(item));
start.addEventListener('click', async () => {
  const readable = await consumeAPI(abortController.signal);
  console.log("readable*****", readable, "********readable");
  readable.pipeTo(appendToHTML(cards));
})

stop.addEventListener('click', () => {
  abortController.abort();
  console.log('aborting...');
  abortController = new AbortController();
});
