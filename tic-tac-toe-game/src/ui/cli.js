function displayBoard(board) {
    console.clear();
    console.log('Current Board:');
    board.forEach(row => {
        console.log(row.join(' | '));
        console.log('---------');
    });
}

function getUserInput() {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.once('data', (data) => {
            const input = parseInt(data.toString().trim());
            process.stdin.pause();
            resolve(input);
        });
    });
}

module.exports = { displayBoard, getUserInput };
