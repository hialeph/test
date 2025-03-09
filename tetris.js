const canvas = document.getElementById('tetris'); // 메인 게임 캔버스
const ctx = canvas.getContext('2d'); // 2D 컨텍스트
const nextCanvas = document.getElementById('next-piece'); // 다음 블록 미리보기 캔버스
const nextCtx = nextCanvas.getContext('2d'); // 2D 컨텍스트
const BLOCK_SIZE = 20; // 블록 크기
const COLS = 12; // 열 수
const ROWS = 20; // 행 수

// 테트로미노 색상 배열
const COLORS = [
    '#000000', // 0: 빈 공간
    '#FF0000', // 1: 빨간색
    '#00FF00', // 2: 초록색
    '#0000FF', // 3: 파란색
    '#FFFF00', // 4: 노란색
    '#00FFFF', // 5: 청록색
    '#FF00FF', // 6: 자홍색
    '#FFA500'  // 7: 주황색
];

// 테트로미노 모양 배열
const SHAPES = [
    [],
    [[1, 1, 1, 1]], // I 모양
    [[1, 1], [1, 1]], // O 모양
    [[1, 1, 1], [0, 1, 0]], // T 모양
    [[1, 1, 1], [1, 0, 0]], // L 모양
    [[1, 1, 1], [0, 0, 1]], // J 모양
    [[1, 1, 0], [0, 1, 1]], // S 모양
    [[0, 1, 1], [1, 1, 0]]  // Z 모양
];

let score = 0; // 현재 점수
let level = 1; // 현재 레벨
let lines = 0; // 지운 줄 수
let gameOver = false; // 게임 오버 상태
let paused = false; // 일시 정지 상태
let dropInterval = 1000; // 블록이 내려오는 간격 (밀리초)
let lastTime = 0; // 마지막 업데이트 시간
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0)); // 게임 보드 초기화
let piece = null; // 현재 조각
let nextPiece = null; // 다음 조각
let animationId = null; // 애니메이션 ID

// 효과음 생성
const lineClearSound = new Audio();
lineClearSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM+N2TQwUHHFvI/PL5jFEPBxRNwfr9GqBZFwgMQbz7CSWqYiQNBzW4+xMwsWYuDwYsvPsdObRpMxEHKbz8Ijy0azcUBya7/SU+tGo8FwcjuP4oQLNpQBkHILb+KkCzaEIcCB21/yxBs2dEHggbs/8sQrNmRiEJGbH/LUKzZUkkCRiv/y1CsmNLJgoXrP8uQrJiTSkLFKr/LkKxYU8rDBKo/y9CsGBRLg0Qpv8vQa9fUjAOD6X/MEGvXlQyDw2j/zBBrl1WNA8Mo/8wQK1cWDYQCqP/MD+sW1o4EQij/zA+q1lbOhIHo/8wPapYXT0SBaP/MDypV19AEwSj/zE8qFZhQhQCo/8xO6dUY0UVAaP/MTmmU2VHFgCj/zI4pVJnSRb/ov8yN6RRaEsX/qL/MjajUGpOGP2i/zM1olBsUBn8of8zNKFOblIa+6H/MzOgTXBVG/qh/zMyn01yVxz5of8zMZ5Lc1ke+KH/NC+dSnVbH/eh/zQunEl3XiH2of80LZtIeGAi9aH/NCubR3piJPSh/zUqmkZ8ZCXzof81KZlFfWYn8qH/NiiYRH5oKPGh/zYnl0OAayrwof82JpZCgm0r76H/NiWWQYNvLe6h/zYklECFcS7tof82I5M/hnIw7KH/NyKTPod0Meyh/zchkj2JdjProf83IJE8i3g07KH/Nx+QPY17Nuyh/zceiz2OfTfuof83HYo8kH857qH/OByJO5GBOu2h/zgah0OXhkDzn/83FnxLpZNM+Zj/MgV0Ub2rYv6P/ycEZEzR0Hf7gf8aBVFJ4euL+G7/EQZPRe31mPVa/wgHSUPx/qf0Rf8CCEQ/9Qe38zD+/Qk8PPgVw/Ic/vcKNzr7JM3yDP75CzI3/jXX8/v9+wwuM/9E4fPq/PsNKS8BSN/z2fv7Dx8rA1jn9Mf7+xEUJgVn8PWw+/oTCiEGePL2mvv6FQEcB4jz94v7+RfxFwiX9Phz+/kZ4BQJp/X5Zvv4G88RCrf3+Vj79x3ADgvH+PpL+/cgsgwM1/r7P/v2I50JDeD7/DP79iWOBw7q/P0o+/YnewUP9P3+Hvv2KWgDEP3+/xX79itKABH9AAcM+/YtMf0S/QIOA/v2Lxj7E/0DDvv69jAD+hT9BA/x+vYx8PgV/QUQ6Pr1Mtv2Fv0GEdn69TS+9Bf9BxLK+vU2p/QY/QgTvPr1OI/zGf0JFKf69Tp48xr9ChWS+vU8bvMb/QsWfvr1PVfzHP0MF2v69T8/8x39DRhZ+vVBKfMe/Q4ZSfr1RAXzH/0PGkL69UXh8iD9EBw0+vVHwfIh/REeKfr1SabyIv0SHx/69UqH8iP9Ex8V+vVMdvMk/RQgC/r1TWDzJf0VIfb59U5L8yb9FiLs+fVPOPMn/Rci5Pn1UB/zKP0YI9r59VEL8yn9GSOr+fVS9fMq/RokgPn1U+bzK/0bJVf59VXa8yz9HCVN+fVWxvMt/R0mSfn1V7XzLv0eJkH59Vi08y/9HyY4+fVZnvMw/SAoMPn1WojzMf0hKCj59Vuh8zL9Iigj+fVckvMz/SMpHvn1XYPzNP0kKRv59V5z8zX9JSkY+fVfZvM2/SYqE/n1YFbzN/0nKw/59WE/8zj9KCsM+fViMfM5/SksCvn1YxzzOv0qLAj59WQP8zv9KywG+fVk9fM8/SwsBPn1Zebz';

// 테트로미노 클래스 정의
class Piece {
    constructor(shape = Math.floor(Math.random() * 7) + 1) {
        this.shape = shape; // 테트로미노 모양
        this.matrix = SHAPES[shape]; // 모양에 따른 매트릭스
        this.color = COLORS[shape]; // 모양에 따른 색상
        this.x = Math.floor(COLS / 2) - Math.floor(this.matrix[0].length / 2); // 초기 x 위치
        this.y = 0; // 초기 y 위치
    }

    // 조각 회전 함수
    rotate() {
        const newMatrix = this.matrix[0].map((_, i) =>
            this.matrix.map(row => row[i]).reverse() // 매트릭스 회전
        );
        if (!this.collision(0, 0, newMatrix)) { // 충돌 검사 후 회전
            this.matrix = newMatrix;
        }
    }

    // 충돌 검사 함수
    collision(offsetX, offsetY, matrix = this.matrix) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] && (
                    board[y + this.y + offsetY] === undefined || // 보드 범위 초과
                    board[y + this.y + offsetY][x + this.x + offsetX] === undefined || // 보드 범위 초과
                    board[y + this.y + offsetY][x + this.x + offsetX] // 이미 존재하는 블록과 충돌
                )) {
                    return true; // 충돌 발생
                }
            }
        }
        return false; // 충돌 없음
    }
}

// 새로운 조각 생성 함수
function createPiece() {
    if (nextPiece === null) { // 다음 조각이 없으면 생성
        nextPiece = new Piece();
    }
    piece = nextPiece; // 현재 조각을 다음 조각으로 설정
    nextPiece = new Piece(); // 새로운 다음 조각 생성
}

// 게임 보드 그리기 함수
function draw() {
    // 메인 게임 보드 그리기
    ctx.fillStyle = '#000000'; // 배경색
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화

    // 보드 그리기
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = COLORS[value]; // 블록 색상
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1); // 블록 그리기
            }
        });
    });

    // 현재 조각 그리기
    if (piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillStyle = piece.color; // 현재 조각 색상
                    ctx.fillRect(
                        (piece.x + x) * BLOCK_SIZE,
                        (piece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    ); // 현재 조각 그리기
                }
            });
        });
    }

    // 다음 블록 미리보기 그리기
    drawNextPiece();
}

// 다음 블록 미리보기 그리기 함수
function drawNextPiece() {
    // 다음 블록 캔버스 초기화
    nextCtx.fillStyle = '#222222'; // 배경색
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height); // 캔버스 초기화
    
    // 다음 블록 그리기
    if (nextPiece) {
        // 블록을 캔버스 중앙에 배치하기 위한 계산
        const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.matrix[0].length) / 2; // x축 중앙 정렬
        const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.matrix.length) / 2; // y축 중앙 정렬
        
        nextPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillStyle = nextPiece.color; // 다음 조각 색상
                    nextCtx.fillRect(
                        (offsetX + x) * BLOCK_SIZE,
                        (offsetY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    ); // 다음 조각 그리기
                }
            });
        });
    }
    
    // "다음 블록" 텍스트는 HTML에서 처리
}

// 현재 조각을 보드에 병합하는 함수
function merge() {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + piece.y][x + piece.x] = piece.shape; // 보드에 조각 병합
            }
        });
    });
}

// 줄 삭제 애니메이션 함수
function animateLineRemoval(lineIndices) {
    // 애니메이션 프레임 수
    const totalFrames = 15;
    let currentFrame = 0;
    
    // 애니메이션 중 게임 일시 정지
    const originalPausedState = paused;
    paused = true;
    
    // 효과음 재생
    lineClearSound.currentTime = 0; // 효과음 재생 위치 초기화
    lineClearSound.play();
    
    // 애니메이션 함수
    function animate() {
        if (currentFrame >= totalFrames) {
            // 애니메이션 완료 후 줄 삭제 및 게임 재개
            lineIndices.forEach(lineIndex => {
                board.splice(lineIndex, 1); // 완전한 줄 삭제
                board.unshift(Array(COLS).fill(0)); // 새로운 빈 줄 추가
            });
            
            // 게임 상태 복원
            paused = originalPausedState;
            if (!paused) {
                lastTime = 0;
                animationId = requestAnimationFrame(update);
            }
            return;
        }
        
        // 캔버스 지우기
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 보드 그리기 (애니메이션 효과 적용)
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    // 삭제할 줄은 애니메이션 효과 적용
                    if (lineIndices.includes(y)) {
                        // 플래시 효과 (깜빡임)
                        if (currentFrame < totalFrames / 3) {
                            // 첫 1/3: 흰색으로 점점 밝아짐
                            const brightness = currentFrame / (totalFrames / 3);
                            ctx.fillStyle = `rgb(${Math.floor(255 * brightness)}, ${Math.floor(255 * brightness)}, ${Math.floor(255 * brightness)})`;
                        } else if (currentFrame < totalFrames * 2/3) {
                            // 중간 1/3: 흰색으로 유지
                            ctx.fillStyle = '#FFFFFF';
                        } else {
                            // 마지막 1/3: 점점 사라짐
                            const alpha = 1 - ((currentFrame - totalFrames * 2/3) / (totalFrames / 3));
                            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                        }
                        
                        // 블록 크기 애니메이션 (약간 커졌다가 작아지는 효과)
                        const sizeOffset = currentFrame < totalFrames / 2 ? 
                            (currentFrame / (totalFrames / 2)) * 2 : 
                            2 - ((currentFrame - totalFrames / 2) / (totalFrames / 2)) * 2;
                        
                        ctx.fillRect(
                            x * BLOCK_SIZE - sizeOffset/2, 
                            y * BLOCK_SIZE - sizeOffset/2, 
                            BLOCK_SIZE - 1 + sizeOffset, 
                            BLOCK_SIZE - 1 + sizeOffset
                        );
                    } else {
                        // 일반 블록
                        ctx.fillStyle = COLORS[value];
                        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                    }
                }
            });
        });
        
        // 현재 조각 그리기
        if (piece) {
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillStyle = piece.color;
                        ctx.fillRect(
                            (piece.x + x) * BLOCK_SIZE,
                            (piece.y + y) * BLOCK_SIZE,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }
        
        // 다음 블록 미리보기 업데이트
        drawNextPiece();
        
        // 다음 프레임
        currentFrame++;
        setTimeout(animate, 30); // 각 프레임 간 지연 시간 (더 빠르게 설정)
    }
    
    // 애니메이션 시작
    animate();
}

// 점수, 레벨, 줄 수 업데이트 함수
function updateScore() {
    document.getElementById('score').textContent = score; // 점수 표시
    document.getElementById('level').textContent = level; // 레벨 표시
    document.getElementById('lines').textContent = lines; // 지운 줄 수 표시
}

// 완전한 줄을 지우는 함수
function clearLines() {
    let linesToClear = []; // 지울 줄의 인덱스 배열
    
    // 지울 줄 찾기
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (!board[y][x]) continue outer; // 빈 줄이면 다음 줄로
        }
        linesToClear.push(y); // 지울 줄 인덱스 저장
    }
    
    if (linesToClear.length > 0) {
        // 애니메이션 효과와 함께 줄 삭제
        animateLineRemoval(linesToClear);
        
        // 점수 업데이트
        lines += linesToClear.length; // 총 지운 줄 수 업데이트
        score += linesToClear.length * 100 * level; // 점수 업데이트
        level = Math.floor(lines / 10) + 1; // 레벨 업데이트
        dropInterval = Math.max(100, 1000 - (level - 1) * 100); // 블록 떨어지는 간격 조정
        updateScore(); // 점수 업데이트 함수 호출
    }
}

// 블록을 아래로 떨어뜨리는 함수
function drop() {
    piece.y++; // 조각을 아래로 이동
    if (piece.collision(0, 0)) { // 충돌 검사
        piece.y--; // 충돌 시 원래 위치로 되돌림
        merge(); // 보드에 조각 병합
        clearLines(); // 완전한 줄 지우기
        createPiece(); // 새로운 조각 생성
        if (piece.collision(0, 0)) { // 새로운 조각이 보드에 충돌하면 게임 오버
            gameOver = true;
            cancelAnimationFrame(animationId); // 애니메이션 중지
            showGameOverPopup(); // 게임 오버 팝업 표시
        }
    }
}

// 게임 오버 팝업 표시 함수
function showGameOverPopup() {
    setTimeout(() => {
        alert(`게임 오버!\n최종 점수: ${score}\n레벨: ${level}\n지운 줄 수: ${lines}`); // 게임 오버 메시지
        reset(); // 게임 초기화
    }, 100);
}

// 조각을 좌우로 이동하는 함수
function move(dir) {
    piece.x += dir; // x 좌표 이동
    if (piece.collision(0, 0)) { // 충돌 검사
        piece.x -= dir; // 충돌 시 원래 위치로 되돌림
    }
}

// 게임 초기화 함수
function reset() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0)); // 보드 초기화
    score = 0; // 점수 초기화
    lines = 0; // 지운 줄 수 초기화
    level = 1; // 레벨 초기화
    gameOver = false; // 게임 오버 상태 초기화
    paused = false; // 일시 정지 상태 초기화
    dropInterval = 1000; // 블록 떨어지는 간격 초기화
    updateScore(); // 점수 업데이트
    createPiece(); // 새로운 조각 생성
    
    // 게임 재시작
    if (animationId) {
        cancelAnimationFrame(animationId); // 이전 애니메이션 중지
    }
    lastTime = 0; // 마지막 시간 초기화
    animationId = requestAnimationFrame(update); // 애니메이션 시작
}

// 블록을 강제로 떨어뜨리는 함수
function hardDrop() {
    while (!piece.collision(0, 1)) { // 아래로 이동할 수 있는 동안
        piece.y++; // 조각을 아래로 이동
    }
    drop(); // 블록 떨어뜨리기
}

// 키보드 입력 이벤트 리스너
document.addEventListener('keydown', event => {
    if (gameOver || paused) return; // 게임 오버 또는 일시 정지 상태일 경우 무시

    switch (event.keyCode) {
        case 37: // 왼쪽 화살표
            move(-1); // 왼쪽으로 이동
            break;
        case 39: // 오른쪽 화살표
            move(1); // 오른쪽으로 이동
            break;
        case 40: // 아래 화살표
            drop(); // 블록 떨어뜨리기
            break;
        case 38: // 위 화살표
            piece.rotate(); // 조각 회전
            break;
        case 32: // 스페이스바
            hardDrop(); // 강제로 블록 떨어뜨리기
            break;
    }
    draw(); // 화면 그리기
});

// 시작 버튼 클릭 이벤트 리스너
document.getElementById('start-btn').addEventListener('click', () => {
    if (gameOver) {
        reset(); // 게임 오버 상태에서 재시작
    } else if (paused) {
        paused = false; // 일시 정지 해제
        animationId = requestAnimationFrame(update); // 애니메이션 시작
    } else {
        // 이미 실행 중인 경우 재시작
        reset(); // 게임 초기화
    }
    
    // 버튼 클릭 후 포커스 해제
    document.activeElement.blur(); // 현재 포커스 해제
});

// 일시 정지 버튼 클릭 이벤트 리스너
document.getElementById('pause-btn').addEventListener('click', () => {
    paused = !paused; // 일시 정지 상태 토글
    if (!paused) {
        lastTime = 0; // 마지막 시간 초기화
        animationId = requestAnimationFrame(update); // 애니메이션 시작
    } else {
        cancelAnimationFrame(animationId); // 애니메이션 중지
    }
    // 버튼 클릭 후 포커스 해제
    document.activeElement.blur(); // 현재 포커스 해제
});

// 애니메이션 업데이트 함수
function update(time = 0) {
    if (gameOver || paused) return; // 게임 오버 또는 일시 정지 상태일 경우 무시

    const deltaTime = time - lastTime; // 시간 차이 계산

    if (deltaTime > dropInterval) { // 블록 떨어지는 간격이 지나면
        drop(); // 블록 떨어뜨리기
        lastTime = time; // 마지막 시간 업데이트
    }

    draw(); // 화면 그리기
    animationId = requestAnimationFrame(update); // 다음 애니메이션 프레임 요청
}

// 게임 초기화 및 자동 시작
// reset(); // 게임 초기화
// 게임이 자동으로 시작되도록 함
// animationId = requestAnimationFrame(update); // 애니메이션 시작