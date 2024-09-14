const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

function getCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes =   String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function Log(...args) {
  const data = getCurrentTime() + " "  + args.join(' ');
  fs.appendFile("logs", data + '\n', (err) => {
    if(err) console.log(err);
  });
  console.log(data);
}

app.get('/best_move', async (req, res) => {
  const fen = req.query.fen;
  const depth = parseInt(req.query.depth) || 12;
  if (!fen) {
    Log("Request: No fen parameter");
    return res.status(400).json({ error: 'FEN parameter is required' });
  }
  const fenRegex = /^([rnbqkpRNBQKP1-8]{1,8}\/){7}[rnbqkpRNBQKP1-8]{1,8} [wb] (K?Q?k?q?|-) (?:[a-h][36]|-) \d+ \d+$/;
  if(!fenRegex.test(fen)) {
    Log("Request: Invalid fen");
    return res.status(400).json({ error: 'Invalid FEN parameter' });
  }

  try {
    // Start Stockfish engine
    const stockfish = spawn('stockfish');

    // Set the position
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write(`go depth ${depth}\n`);
    Log(`Request: fen: ${fen}, depth: ${depth}`);
    const { bestMove, ponderMove } = await new Promise((resolve) => {
      let bestMove = '';
      let ponderMove = '';
      let isSearchComplete = false;

      stockfish.stdout.on('data', (data) => {
	const outputs = data.toString().trim().split('\n');
	outputs.forEach((output) => {
	  if (output.startsWith('bestmove')) {
            const parts = output.split(' ');
            bestMove = parts[1];
            ponderMove = parts[3] || '';
            isSearchComplete = true;
	    Log(`Response: bestmove - ${bestMove}$, pondermove - ${ponderMove}`);
            resolve({ bestMove, ponderMove });
          }
	});
      });
      stockfish.on('close', (code) => {
        if (code !== 0) {
          resolve({ bestMove: '', ponderMove: '' });
        }
      });
    });

    res.json({ best_move: bestMove, ponder_move: ponderMove });
  } catch (err) {
    Log("500 Error");
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  Log(`Server is running on port ${port}`);
});

