# Projeto de Consumo de Dados em Streaming

Este projeto é uma aplicação que consome dados de uma API em tempo real e os apresenta em um formato HTML. Tanto o frontend (JavaScript) quanto o backend (Node.js) fazem uso intensivo de Streams para manipular dados de maneira eficiente.

# Backend

O backend é o componente principal responsável por processar e enviar os dados para o frontend em tempo real. A sua eficiência é potencializada pelo uso de Streams. Vamos explorar as principais funcionalidades:

## Streams no Backend

### Leitura de Arquivo como Stream

O backend utiliza createReadStream para ler o arquivo CSV como um stream. Essa abordagem permite o processamento eficiente de arquivos grandes, já que os dados são lidos em pedaços, evitando a sobrecarga de memória.
Transformação em Tempo Real:

Assim que os dados são lidos, são transformados em formato JSON em tempo real usando a biblioteca csvtojson. Dessa forma, os dados são disponibilizados para o próximo estágio do pipeline conforme são processados.
Formato NDJSON (Newline Delimited JSON):

Os dados são então transformados em formato NDJSON, onde cada objeto JSON é seguido por uma quebra de linha. Isso facilita a leitura e processamento dos dados no frontend, já que chegam incrementalmente.
Envio em Tempo Real:

O stream de dados transformados é enviado como resposta em tempo real. Isso é especialmente útil quando se lida com grandes conjuntos de dados, pois não é necessário esperar até que todos os dados sejam processados antes de enviá-los.

## Vantagens das Streams no Backend

### Eficiência de Memória

A leitura e processamento por meio de Streams evita a necessidade de carregar todo o conteúdo do arquivo na memória de uma vez, o que é essencial para lidar com arquivos grandes.

### Processamento Assíncrono

O backend pode começar a enviar dados para o frontend enquanto ainda está lendo e processando o restante do arquivo. Isso resulta em uma resposta mais rápida.

### Resposta em Tempo Real

O frontend recebe os dados à medida que são processados, proporcionando uma experiência de usuário mais dinâmica e responsiva.
Escalabilidade:

Com a abordagem de streaming, o backend pode lidar com arquivos de qualquer tamanho, desde que haja recursos suficientes disponíveis.
Baixa Latência:

A resposta em tempo real significa que o frontend não precisa esperar até que todo o arquivo seja processado antes de começar a exibir os dados.

# Frontend

O frontend é a interface da aplicação, onde os dados são consumidos e apresentados ao usuário. Ele também utiliza Streams para tornar a operação de consumo da API eficiente.

## Streams no Frontend

### Consumo Eficiente da API

A função consumeAPI(signal) faz a requisição à API e retorna um leitor de dados. Este leitor é uma parte essencial da manipulação eficiente de dados em tempo real no frontend.

### Processamento de Dados com Streams

A função parseNDJSON() trabalha com streams para processar os dados da API no formato NDJSON (Newline Delimited JSON). Isso significa que os dados são processados à medida que chegam, evitando a necessidade de carregar todos os dados de uma vez.

### Renderização de HTML com Streams

A função appendToHTML(element) cria um fluxo de saída que permite a renderização eficiente de elementos HTML na página. Isso é feito usando um WritableStream, que escreve os dados no DOM à medida que são processados.
Controle de Abortamento:

A aplicação possui uma funcionalidade de abortamento que pode ser acionada a qualquer momento pelo usuário. Ao clicar no botão "Stop", o controlador de aborto é ativado, interrompendo a operação de consumo de dados.
Funcionalidades Adicionais no Frontend
A cada novo item processado, um contador é incrementado e o conteúdo é exibido em um formato de card HTML com título, descrição e um link. Isso proporciona uma experiência interativa para o usuário.

A operação pode ser abortada a qualquer momento clicando no botão "Stop". Isso utiliza o controlador de aborto para interromper a operação atual, o que pode ser útil em situações em que o usuário deseja interromper o processo de consumo de dados.

O frontend não só consome dados da API, mas também os processa e os apresenta de forma eficiente e interativa usando Streams. Essa abordagem permite que a aplicação funcione de maneira responsiva, mesmo quando lidando com grandes volumes de dados em tempo real.
