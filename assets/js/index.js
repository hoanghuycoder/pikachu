// Trần Võ Hoàng Huy
// Mssv : 21130386
document.addEventListener('DOMContentLoaded', async function () {
    window.addEventListener('load', checkWindowSize);
    window.addEventListener('resize', checkWindowSize);
    function checkWindowSize() {
        if (window.innerWidth < 768) {
            alert(
                'Vui lòng xoay màn hình để có trải nghiệm tốt nhất!'
            );
        }
    }
    // Định nghĩa số lượt reset, hint, thời gian mỗi level
    const gameParameters = [
        // level1
        {
            hintAmount: 7,
            resetAmount: 7,
            timeAmount: 600,
            shiftBoard: (board) => {
                return board;
            },
        },
        // level2
        {
            hintAmount: 6,
            resetAmount: 6,
            timeAmount: 580,
            shiftBoard: (board) => {
                return shiftUp(board);
            },
        },
        // level3
        {
            hintAmount: 5,
            resetAmount: 5,
            timeAmount: 560,
            shiftBoard: (board) => {
                return shiftDown(board);
            },
        },
        // level4
        {
            hintAmount: 4,
            resetAmount: 4,
            timeAmount: 540,
            shiftBoard: (board) => {
                return shiftLeft(board);
            },
        },
        // level5
        {
            hintAmount: 3,
            resetAmount: 3,
            timeAmount: 520,
            shiftBoard: (board) => {
                return shiftRight(board);
            },
        },
        // level6
        {
            hintAmount: 2,
            resetAmount: 2,
            timeAmount: 500,
            shiftBoard: (board) => {
                return shiftHalfLeftRight(board);
            },
        },
        // Level 7
        {
            hintAmount: 1,
            resetAmount: 1,
            timeAmount: 480,
            shiftBoard: (board) => {
                return shiftHalfUpDown(board);
            },
        },
        // Level 8
        {
            hintAmount: 0,
            resetAmount: 0,
            timeAmount: 460,
            shiftBoard: (board) => {
                return shiftHalfLeftRightToCenter(board);
            },
        },
        // Level 9
        {
            hintAmount: 0,
            resetAmount: 0,
            timeAmount: 440,
            shiftBoard: (board) => {
                return shiftHalfUpDownToCenter(board);
            },
        },
    ];
    let timeCount = null;
    let startGameTimeDelay = null;
    let levelConfig = {};
    startGame(1);
    $('#restart-button').click(function () {
        startGame(1);
        playSound('startGameSound');
    });
    $('.info-button').off('click');
    $('.info-button').click(async function () {
        $('.modal-back-drop').css({
            display: 'grid',
        });
        playSound('clickSound');
    });
    $('.close-modal').off('click');
    $('.close-modal').click(async function () {
        $('.modal-back-drop').css({
            display: 'none',
        });
        playSound('clickSound');
    });
    $('.button').click(function () {
        const btn = $(this);
        btn.css({
            opacity: 0.7,
            transform: 'scale(0.8)',
        });
        setTimeout(function () {
            btn.css({
                opacity: 1,
                transform: 'scale(1)',
            });
        }, 150);
    });
    async function startGame(level) {
        function handleChangeLevelDOM() {
            $('.level-action').css({ opacity: 1 });
            if (level - 1 == 0) {
                $('.minus-level').css({ opacity: 0.5 });
            }
            if (level - 1 == gameParameters.length - 1) {
                $('.plus-level').css({ opacity: 0.5 });
            }
        }
        // Tránh bị spam nút chuyển level
        clearTimeout(timeCount);
        clearTimeout(startGameTimeDelay);
        handleChangeLevelDOM();
        startGameTimeDelay = setTimeout(async function () {
            $('.level-action').click(function () {
                handleChangeLevelDOM();
            });
            $('.minus-level').click(function () {
                if (level - 1 > 0) {
                    startGame(level - 1);
                    playSound('startGameSound');
                }
            });
            $('.plus-level').click(function () {
                if (level < gameParameters.length) {
                    startGame(level + 1);
                    playSound('startGameSound');
                }
            });
            let paths = [];

            countTime();
            //  Copy ra object với vùng nhớ mới
            levelConfig = { ...gameParameters[level - 1] };
            if (levelConfig == null) {
                startGame(1);
                return;
            }
            const pointWin = 72;
            let currentPoint = 0;
            $('#score')[0].innerText = currentPoint;
            $('#time')[0].innerText = levelConfig.timeAmount;
            $('#level')[0].innerText = level;
            $('#resetAmount')[0].innerText =
                levelConfig.resetAmount;
            $('#hintAmount')[0].innerText = levelConfig.hintAmount;
            let firstSelection = null; // Lưu { row: x, col: y } của lần chọn đầu tiên
            let secondSelection = null;
            let images1 = [];
            let images2 = [];
            let images3 = [];

            const numOfImages = 36;
            for (let i = 1; i <= numOfImages / 3; i++) {
                images1.push(`./assets/images/pieces${i}.png`);
            }
            for (
                let i = numOfImages / 3 + 1;
                i <= (numOfImages / 3) * 2;
                i++
            ) {
                images2.push(`./assets/images/pieces${i}.png`);
            }
            for (
                let i = (numOfImages / 3) * 2 + 1;
                i <= numOfImages;
                i++
            ) {
                images3.push(`./assets/images/pieces${i}.png`);
            }
            // x4 và xáo mảng
            let images = [
                ...shuffle(shuffle(images1)),
                ...shuffle(images2),
                ...shuffle(shuffle(images3)),
                ...shuffle(images3),
                ...shuffle(shuffle(images1)),
                ...shuffle(images2),
                ...shuffle(images1),
                ...shuffle(shuffle(images2)),
                ...shuffle(images3),
                ...shuffle(images3),
                ...shuffle(shuffle(images1)),
                ...shuffle(images2),
            ];
            // Xáo mảng
            for (let index = 0; index < 20; index++) {
                images = shuffle(images);
            }
            const boardSizeCol = 18;
            const boardSizeRow = 11;
            let board = Array.from({ length: boardSizeRow }, () =>
                Array.from({ length: boardSizeCol }, () => null)
            );
            const totalElements = images.length;
            // Bọc mảng bằng các giá trị null và điền dữ liệu từ images vào board
            let index = 0;
            for (let i = 1; i < boardSizeRow - 1; i++) {
                for (let j = 1; j < boardSizeCol - 1; j++) {
                    if (index < totalElements) {
                        board[i][j] = images[index];
                        index++;
                    } else {
                        break;
                    }
                }
            }
            // Xáo mảng 2 chiều thêm lần nữa
            board = await shuffleBoard(
                board,
                boardSizeRow,
                boardSizeCol
            );
            renderBoard();
            $('.reset-button').off('click');
            $('.reset-button').click(async function () {
                if (levelConfig.resetAmount > 0) {
                    board = await shuffleBoard(
                        board,
                        boardSizeRow,
                        boardSizeCol
                    );
                    levelConfig.resetAmount--;
                    $('#resetAmount')[0].innerText =
                        levelConfig.resetAmount;
                    playSound('startGameSound');
                    reRenderBoard();
                } else {
                    alert('Bạn đã hết lượt xếp lại bảng');
                }
            });
            $('.hint-button').off('click');
            $('.hint-button').click(async function () {
                playSound('clickSound');
                if (levelConfig.hintAmount > 0) {
                    levelConfig.hintAmount--;
                    $('#hintAmount')[0].innerText =
                        levelConfig.hintAmount;
                    const way = checkForPaths();
                    hintPiece(way.first.row, way.first.col);
                    hintPiece(way.second.row, way.second.col);
                } else {
                    alert('Bạn đã hết lượt gợi ý');
                }
            });

            async function renderBoard() {
                // Vẽ đường sau đó xóa sau 150ms
                drawPath(paths);
                setTimeout(function () {
                    removePathLines();
                    paths = null;
                }, 150);
                const gameBoard = $('#gameBoard');
                board = levelConfig.shiftBoard(board);
                $('.pieces').remove(); // Xóa bảng cũ
                $('.pieces').css({ opacity: 1 });
                for (let i = 0; i < board.length; i++) {
                    for (let j = 0; j < board[i].length; j++) {
                        // Xử lý DOM mới
                        const image = board[i][j];
                        let imgDOM = `
                    <div id="pieces-${i}-${j}-parent" class="pieces" data-i="${i}" data-j="${j}">
                        <img id="pieces-${i}-${j}"  class="pieces-img" width="100%" src="${image}">

                    </div>`;
                        let imgElement = $(imgDOM);
                        if (image !== null) {
                            imgElement.click(() =>
                                handleClick(i, j)
                            );
                        } else {
                            imgDOM = `
                        <div id="pieces-${i}-${j}-parent" class="pieces" data-i="${i}" data-j="${j}">
                            <img id="pieces-${i}-${j}"  class="pieces-img" width="100%" src="/assets/images/pieces36.png">
                        </div>`;
                            imgElement = $(imgDOM);
                            imgElement.css('visibility', 'hidden');
                        }

                        gameBoard.append(imgElement);
                    }
                }

                // Render lại board nếu hết đường đi
                if (!checkForPaths()) {
                    alert('Đã hết đường, xếp lại bảng ngẫu nhiên');
                    board = await shuffleBoard(
                        board,
                        boardSizeRow,
                        boardSizeCol
                    );
                    reRenderBoard();
                }
            }
            async function reRenderBoard() {
                drawPath(paths);
                setTimeout(function () {
                    removePathLines();
                    paths = null;
                }, 150);
                const gameBoard = $('#gameBoard');
                board = levelConfig.shiftBoard(board);
                $('.pieces').css({ opacity: 1 });
                for (let i = 0; i < board.length; i++) {
                    for (let j = 0; j < board[i].length; j++) {
                        // Xử lý DOM mới
                        const parentImgElement = $(
                            `#pieces-${i}-${j}-parent`
                        );
                        const imgElement = $(`#pieces-${i}-${j}`);
                        const imageUrl = board[i][j];
                        if (imageUrl !== null) {
                            imgElement.attr('src', imageUrl);
                            parentImgElement.off('click');
                            parentImgElement.click(() =>
                                handleClick(i, j)
                            );
                        } else {
                            parentImgElement.off('click');
                            imgElement.attr(
                                'src',
                                '/assets/images/pieces36.png'
                            );
                            parentImgElement.css(
                                'visibility',
                                'hidden'
                            );
                        }
                    }
                }

                // Render lại board nếu hết đường đi
                if (!checkForPaths()) {
                    alert('Đã hết đường, xếp lại bảng ngẫu nhiên');
                    board = await shuffleBoard(
                        board,
                        boardSizeRow,
                        boardSizeCol
                    );
                    reRenderBoard();
                }
            }

            // Các hàm xử lý logic khi khởi tạo game
            function countTime() {
                timeCount = setInterval(function () {
                    levelConfig.timeAmount -= 1;
                    $('#time')[0].innerText =
                        levelConfig.timeAmount;
                    const widthProcess =
                        (levelConfig.timeAmount /
                            gameParameters[level - 1].timeAmount) *
                            100 +
                        '%';
                    $('.progress-bar').css({ width: widthProcess });
                    if (
                        levelConfig.timeAmount == 0 &&
                        currentPoint < pointWin
                    ) {
                        alert('You lose');
                        startGame(1);
                    }
                }, 1000);
            }
            // Tìm đường đi giữa 2 node
            function bfs(
                board,
                startRow,
                startCol,
                endRow,
                endCol
            ) {
                if (startCol == endCol && startRow == endRow)
                    return false;
                let rows = board.length;
                let cols = board[0].length;
                let visited = Array.from(Array(rows), () =>
                    Array(cols).fill(false)
                );
                let queue = [];
                // Khởi tạo
                queue.push(
                    new Node(startRow, startCol, 0, 'start', [])
                );
                let path = []; // Lưu đường
                // Duyệt BFS
                while (queue.length > 0) {
                    let currentNode = queue.shift();
                    let r = currentNode.row;
                    let c = currentNode.col;
                    // Đã đến đích
                    if (
                        r === endRow &&
                        c === endCol &&
                        board[startRow][startCol] != null &&
                        board[endRow][endCol] != null
                    ) {
                        currentNode.path.push({ row: r, col: c });
                        return currentNode.path; // trả về đường dẫn đến đích để vẽ đường
                    }
                    // Duyệt 4 hướng
                    const directions = [
                        ['up', -1, 0],
                        ['down', 1, 0],
                        ['left', 0, -1],
                        ['right', 0, 1],
                    ];
                    for (let [dir, dr, dc] of directions) {
                        let newRow = r + dr;
                        let newCol = c + dc;
                        let newTurns = currentNode.turns;
                        let newDirection = dir;

                        // Kiểm tra hợp lệ của ô mới
                        if (
                            newRow >= 0 &&
                            newRow < rows &&
                            newCol >= 0 &&
                            newCol < cols
                        ) {
                            // Kiểm tra quẹo
                            if (currentNode.prevDirection !== dir) {
                                newTurns++;
                                // Lưu lại path
                                newPath = [
                                    ...currentNode.path,
                                    { row: r, col: c },
                                ];
                            } else {
                                newPath = currentNode.path;
                            }
                            // Kiểm tra số lần quẹo và ô trống hoặc đích
                            if (
                                newTurns <= 3 &&
                                (board[newRow][newCol] === null ||
                                    (newRow === endRow &&
                                        newCol === endCol)) &&
                                board[startRow][startCol] ==
                                    board[endRow][endCol]
                            ) {
                                queue.push(
                                    new Node(
                                        newRow,
                                        newCol,
                                        newTurns,
                                        newDirection,
                                        newPath
                                    )
                                );
                            }
                            console.log;
                        }
                    }
                }

                return null; // Không thể đến được đích
            }
            function checkConnection(first, second) {
                // Sử dụng BFS đã được định nghĩa trước đó để kiểm tra kết nối
                return bfs(
                    board,
                    first.row,
                    first.col,
                    second.row,
                    second.col
                );
            }
            function handleClick(row, col) {
                // Nếu click vào ô trống, bỏ qua
                if (board[row][col] === null) return;
                // Nếu đây là lần chọn đầu tiên
                if (firstSelection === null) {
                    playSound('clickSound');
                    firstSelection = { row, col };
                    selectPiece(row, col);
                } else if (secondSelection === null) {
                    // Kiểm tra xem có chọn lại ô đầu tiên không
                    if (
                        firstSelection.row === row &&
                        firstSelection.col === col
                    ) {
                        unselectPiece(row, col);
                        firstSelection = null;
                        return;
                    }
                    playSound('clickSound');
                    secondSelection = { row, col };
                    selectPiece(row, col);
                    // Kiểm tra kết nối giữa hai lựa chọn
                    paths = checkConnection(
                        firstSelection,
                        secondSelection
                    );
                    // Xử lý nếu có đường đi
                    if (paths) {
                        board[firstSelection.row][
                            firstSelection.col
                        ] = null;
                        board[secondSelection.row][
                            secondSelection.col
                        ] = null;
                        playSound('connectSound');
                        console.log('Match found!');
                        currentPoint++;
                        $('#score')[0].innerText = currentPoint;
                        if (currentPoint == pointWin) {
                            alert('Bạn đã thắng');
                            startGame(level + 1);
                        } else {
                            reRenderBoard();
                        }
                    } else {
                        playSound('failSound');
                    }
                    // Xử lý DOM css và reset lựa chọn
                    unselectPiece(
                        firstSelection.row,
                        firstSelection.col
                    );
                    unselectPiece(
                        secondSelection.row,
                        secondSelection.col
                    );
                    firstSelection = null;
                    secondSelection = null;
                }
            }
            // Kiểm tra xem board còn piece nào có thể kết nối không
            function checkForPaths() {
                for (let i = 0; i < boardSizeRow; i++) {
                    for (let j = 0; j < boardSizeCol; j++) {
                        if (board[i][j] === null) continue;
                        for (let k = 0; k < boardSizeRow; k++) {
                            for (let l = 0; l < boardSizeCol; l++) {
                                if (
                                    board[k][l] === null ||
                                    (i === k && j === l)
                                )
                                    continue;
                                if (
                                    checkConnection(
                                        { row: i, col: j },
                                        { row: k, col: l }
                                    )
                                ) {
                                    return {
                                        first: { row: i, col: j },
                                        second: { row: k, col: l },
                                    };
                                }
                            }
                        }
                    }
                }
                return null;
            }
            // Các node của board
            function Node(row, col, turns, prevDirection, path) {
                this.row = row;
                this.col = col;
                this.turns = turns;
                this.prevDirection = prevDirection; // 'up', 'down', 'left', 'right', or 'start'
                this.path = path; //Lưu đường đi
            }
        }, 400);
    }
    // Các hàm dùng lại nhiều lần
    function selectPiece(i, j) {
        const e = $(`#pieces-${i}-${j}-parent`);
        e.css({
            opacity: '0.5',
            border: '1px solid red',
        });
    }
    function hintPiece(i, j) {
        const e = $(`#pieces-${i}-${j}-parent`);
        e.css({
            opacity: '0.6',
            border: '1px solid orange',
        });
    }
    function unselectPiece(i, j) {
        const e = $(`#pieces-${i}-${j}-parent`);
        e.css({
            opacity: '1',
            border: '1px solid rgb(0, 153, 51)',
        });
    }
    function playSound(idAudio) {
        const sound = $('#' + idAudio);
        sound[0].play();
    }
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    // Vẽ line
    function drawPathLine(startRow, startCol, endRow, endCol) {
        const gameBoard = $('#gameBoard');
        const canvas = $('<canvas>').addClass('path-line');
        const paddingGameboard = gameBoard.css('padding');
        // Vẽ canvas trừ đi các padding hoặc có thể + padding vào trong lúc tính center
        const paddingY = paddingGameboard.split(' ')[0];
        const paddingX = paddingGameboard.split(' ')[1];
        canvas.css({
            position: 'absolute',
            top: paddingY,
            left: paddingX,
            right: paddingX,
            bottom: paddingY,
        });
        // Tính chiều cao và chiều rộng của pieces
        const cellWidth = gameBoard.find('div.pieces').outerWidth();
        const cellHeight = gameBoard
            .find('div.pieces')
            .outerHeight();
        const offsetWidth = cellWidth / 2;
        const offsetHeight = cellHeight / 2;
        canvas.attr('width', gameBoard.width());
        canvas.attr('height', gameBoard.height());
        const ctx = canvas[0].getContext('2d');
        ctx.beginPath();
        // Tính điểm center của pieces
        const startX = startCol * cellWidth + offsetWidth;
        const startY = startRow * cellHeight + offsetHeight;
        const endX = endCol * cellWidth + offsetWidth;
        const endY = endRow * cellHeight + offsetHeight;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();
        gameBoard.append(canvas);
    }
    function drawPath(paths) {
        if (paths) {
            for (let i = 0; i < paths.length - 1; i++) {
                const startPoint = paths[i];
                const endPoint = paths[i + 1];
                drawPathLine(
                    startPoint.row,
                    startPoint.col,
                    endPoint.row,
                    endPoint.col
                );
            }
        }
    }
    function removePathLines() {
        $('.path-line').remove();
    }
    // Xáo mảng 2 chiều
    function shuffleBoard(board, boardSizeRow, boardSizeCol) {
        const shuffledBoard = board
            .flatMap((row) => row)
            .filter((item) => item !== null);
        shuffle(shuffledBoard);
        let index = 0;
        for (let i = 1; i < boardSizeRow - 1; i++) {
            for (let j = 1; j < boardSizeCol - 1; j++) {
                if (board[i][j] !== null) {
                    board[i][j] = shuffledBoard[index];
                    index++;
                }
            }
        }
        return board;
    }
    // LƯU Ý : Board được bọc bởi 2 hàng và 2 cột giá trị null ở đầu và cuối nên giá trị ở đó luôn null
    // Chỉ xử lý giá trị từ hàng 1-9 và cột 1-16
    function shiftLeft(board) {
        for (let i = 0; i < board.length; i++) {
            let newRow = [];
            newRow.push(null);
            for (let j = 1; j < board[i].length - 1; j++) {
                if (board[i][j] !== null) {
                    newRow.push(board[i][j]);
                }
            }
            console.log('debug');
            newRow.push(null);
            board[i] = newRow.concat(
                Array(board[i].length - newRow.length).fill(null)
            );
        }
        return board;
    }
    function shiftRight(board) {
        for (let i = 0; i < board.length; i++) {
            let newRow = [];
            for (let j = board[i].length - 2; j >= 1; j--) {
                if (board[i][j] !== null) {
                    newRow.unshift(board[i][j]);
                }
            }
            // Vì cột đầu tiên và cột cuối luôn là null
            newRow.unshift(null);
            newRow.push(null);
            board[i] = Array(board[i].length - newRow.length)
                .fill(null)
                .concat(newRow);
        }
        return board;
    }
    function shiftUp(board) {
        for (let j = 0; j < board[0].length; j++) {
            let newColumn = [];
            newColumn.push(null);
            for (let i = 1; i < board.length - 1; i++) {
                if (board[i][j] !== null) {
                    newColumn.push(board[i][j]);
                }
            }
            for (let i = 0; i < board.length; i++) {
                if (i < newColumn.length) {
                    board[i][j] = newColumn[i];
                } else {
                    board[i][j] = null;
                }
            }
        }
        return board;
    }
    function shiftDown(board) {
        for (let j = 0; j < board[0].length; j++) {
            let newColumn = [];
            let countNull = 0;
            for (let i = board.length - 2; i >= 1; i--) {
                if (board[i][j] !== null) {
                    newColumn.unshift(board[i][j]);
                } else {
                    countNull++;
                }
            }
            for (let i = 0; i < countNull; i++) {
                newColumn.unshift(null);
            }
            newColumn.unshift(null);
            newColumn.push(null);
            for (let i = 0; i < board.length; i++) {
                board[i][j] = newColumn[i];
            }
        }
        return board;
    }
    function shiftHalfLeftRight(board) {
        const halfCols = board[0].length / 2;
        for (let i = 1; i < board.length - 1; i++) {
            let leftHalf = [];
            let rightHalf = [];
            for (let j = 1; j < board[i].length - 1; j++) {
                if (j < halfCols) {
                    if (board[i][j] !== null) {
                        leftHalf.push(board[i][j]);
                    }
                } else {
                    if (board[i][j] !== null) {
                        rightHalf.push(board[i][j]);
                    }
                }
            }
            leftHalf.unshift(null);
            leftHalf = leftHalf.concat(
                Array(halfCols - leftHalf.length).fill(null)
            );
            rightHalf.push(null);
            rightHalf = Array(halfCols - rightHalf.length)
                .fill(null)
                .concat(rightHalf);
            board[i] = [...leftHalf, ...rightHalf];
        }
        return board;
    }
    function shiftHalfUpDown(board) {
        const halfRow = Math.floor(board.length / 2);
        for (let j = 1; j < board[0].length - 1; j++) {
            let halfUp = [];
            let halfDown = [];
            for (let i = 1; i < board.length - 1; i++) {
                if (i < halfRow) {
                    if (board[i][j] != null) {
                        halfUp.push(board[i][j]);
                    }
                } else {
                    if (board[i][j] != null) {
                        halfDown.push(board[i][j]);
                    }
                }
            }
            halfUp.unshift(null);
            halfUp = halfUp.concat(
                Array(halfRow - halfUp.length).fill(null)
            );
            halfDown.push(null);
            halfDown = Array(halfRow + 1 - halfDown.length)
                .fill(null)
                .concat(halfDown);
            const colShifted = [...halfUp, ...halfDown];
            for (let i = 0; i < board.length; i++) {
                board[i][j] = colShifted[i];
            }
        }
        return board;
    }
    function shiftHalfLeftRightToCenter(board) {
        const halfCols = board[0].length / 2;
        for (let i = 1; i < board.length - 1; i++) {
            let leftHalf = [];
            let rightHalf = [];
            for (let j = 1; j < board[i].length - 1; j++) {
                if (j < halfCols) {
                    if (board[i][j] !== null) {
                        leftHalf.push(board[i][j]);
                        console.log('push');
                    }
                } else {
                    if (board[i][j] !== null) {
                        rightHalf.push(board[i][j]);
                    }
                }
            }
            leftHalf.unshift(null);
            leftHalf = Array(halfCols - leftHalf.length)
                .fill(null)
                .concat(leftHalf);
            rightHalf.push(null);
            rightHalf = rightHalf.concat(
                Array(halfCols - rightHalf.length).fill(null)
            );
            board[i] = [...leftHalf, ...rightHalf];
        }
        return board;
    }
    function shiftHalfUpDownToCenter(board) {
        const halfRow = Math.floor(board.length / 2);
        for (let j = 1; j < board[0].length - 1; j++) {
            let halfUp = [];
            let halfDown = [];
            for (let i = 1; i < board.length - 1; i++) {
                if (i < halfRow) {
                    if (board[i][j] != null) {
                        halfUp.push(board[i][j]);
                    }
                } else {
                    if (board[i][j] != null) {
                        halfDown.push(board[i][j]);
                    }
                }
            }
            halfUp.unshift(null);
            halfUp = Array(halfRow - halfUp.length)
                .fill(null)
                .concat(halfUp);
            halfDown.push(null);
            halfDown = halfDown.concat(
                Array(halfRow + 1 - halfDown.length).fill(null)
            );
            const colShifted = [...halfUp, ...halfDown];
            for (let i = 0; i < board.length; i++) {
                board[i][j] = colShifted[i];
            }
        }
        return board;
    }
    // Kết thúc các hàm dùng lại nhiều lần
});