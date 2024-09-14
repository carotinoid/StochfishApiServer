# StockfishApiServer

This repository is a small experiment for another project.

It can be used to find the best move on the current chessboard via an HTTP GET request.

## Requirements
`nodejs`, `express`, `cors`, `stockfish`

You can download requirements with:
```bash
apt install nodejs npm stockfish
git clone https://github.com/carotinoid/StochfishApiServer.git
cd StockfishApiServer
npm install express cors
```

You can execute this program with:
```bash
node app.js
```
## Request
You have to visit this URL to get response of stockfish.
```
http://(your ip or localhost):(port, defaultly 3000)/best_move?fen=(fen)&depth=(depth)
```
A default depth is 12 if you don't write, and you can change the port and default on app.js.

## Response
A response is in JSON, and looks like:
```json
{
  "best_move": "c6a5",
  "ponder_move": "c4b5"
}
```
The best_move is the best move at the current given FEN position, and the ponder_move is the best prediction of the opponent's move after best_move.

## ToDo
- I will change the structure of response json: adding FEN position after best_move.
