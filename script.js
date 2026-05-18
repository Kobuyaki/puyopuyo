const panel = document.querySelectorAll('.box');
const nextData = document.querySelectorAll('.nextBox');
let Kieta = 0; // 書き換え可能にするためlet
let putPlace = 3;
let randomPuyo = 1;
let random2 = 2;
let Dir2 = -6;
let putFinal = 0;
let putF2 = 0;
const RorateList = [1, 6, -1, -6];
let nextPuyo = [1, 2, 3, 1]
let canCtr = 1;
const rightButton = document.getElementById('right');
const leftButton = document.getElementById('left');
const dropButton = document.getElementById('drop');
const scoreBord = document.getElementById('score');
// 盤面データ（0: 空, 1~3: 色）
let color = Array.from({ length: 72 }, () => 0);

let rensa = 0;

let touchPlace = 0;

panel.forEach((p, index) => {
    p.addEventListener('pointerdown', () => {
        if (index % 6 != putPlace - 1) {
            touchPlace = Math.abs(index % 6 - (putPlace - 1));
            if (index % 6 > putPlace - 1) {

                for (let o = 0; o < touchPlace; o++) {
                    slide(1);
                }
            } else {
                for (let o = 0; o < touchPlace; o++) {
                    slide(-1);
                }
            }
        }

    });
});

async function processGame() {
    // 1. まず落とす
    fall();
    paintColor();
    // 2. 消えるものがある限り繰り返す（連鎖）
    Kieta = 1;
    rensa = 0;
    while (Kieta === 1) {
        Kieta = 0; // 一旦リセット
        getConnectedBoxes(); // 4つ以上繋がっていたら Kieta = 1 になる

        if (Kieta === 1) {
            rensa++;
            await new Promise(resolve => setTimeout(resolve, 300)); // 消える瞬間のウェイト
            fall();
            paintColor();

        } else {
            canCtr = 1;
            paintColor();
        }
    }
}

function paintColor() {
    putFinal = 0;
    putF2 = 0;

    if (Dir2 === 6) {
        for (let q = putPlace - 1; q < 12; q++) {
            if (color[q * 6 + (putPlace - 1) % 6] === 0) {
                putF2 = q * 6 + (putPlace - 1) % 6;
            } else {

            }
        }
        putFinal = putF2 - 6;


    } else {


        for (let q = putPlace - 1; q < 12; q++) {
            if (color[q * 6 + (putPlace - 1) % 6] === 0) {
                putFinal = q * 6 + (putPlace - 1) % 6;
            } else {

            }
        }

        if (Dir2 === -6) {
            putF2 = putFinal - 6;
        } else {
            for (let q = (putFinal + Dir2) % 6; q < 12; q++) {
                if (color[q * 6 + (putFinal + Dir2) % 6] === 0) {
                    putF2 = q * 6 + (putFinal + Dir2) % 6;
                } else {

                }
            }

        }
    }




    color.forEach((num, i) => {
        const rect = panel[i]; // 全ての.boxを順番に処理
        rect.className = 'box rect'; // クラスをリセット
        if (canCtr === 1) {
            if (i === putFinal) {
                rect.classList.add(`color-${randomPuyo}`);
                rect.classList.add('toumei')
                rect.classList.add('MoreBorder')
            }
            else if (i === putF2) {
                rect.classList.add(`color-${random2}`);
                rect.classList.add('toumei')
            }
            else if (i - 6 === putFinal % 6) {
                rect.classList.add(`color-${randomPuyo}`);
            }
            else if (i - 6 === putF2 % 6 || Dir2 === -6 && i === putF2 % 6 || Dir2 === 6 && i === putFinal % 6 + 12) {
                rect.classList.add(`color-${random2}`);
            }
            else if (num > 0) {
                rect.classList.add(`color-${num}`);
            }
        } else {
            if (num > 0) {
                rect.classList.add(`color-${num}`);
            }
        }
    });
    nextData.forEach((el, i) => {
        // el は nextData[i] と同じなので直接操作してOK
        el.className = 'nextBox rect2';

        // nextPuyo[i] が存在する場合のみ色を付ける
        if (nextPuyo[i] && i === 1 || i === 2) {
            el.classList.add(`color-${nextPuyo[3 - i]}`);
        }
        else if (nextPuyo[i]) {
            el.classList.add(`color-${nextPuyo[i]}`);
        }
    });


}

function getConnectedBoxes() {
    const checked = new Set();
    for (let i = 0; i < 72; i++) {
        if (color[i] !== 0 && !checked.has(i)) {
            KesuPuyo(i, checked);
        }
    }
}

function KesuPuyo(index, globalChecked) {
    const targetColor = color[index];
    const connected = new Set();

    function check(i) {
        if (i < 0 || i >= 72 || connected.has(i) || color[i] !== targetColor) return;

        const x = i % 6;
        connected.add(i);
        globalChecked.add(i); // チェック済みリストに入れる

        if (x !== 5) check(i + 1);
        if (x !== 0) check(i - 1);
        check(i + 6);
        check(i - 6);
    }

    check(index);

    if (connected.size >= 4) {
        connected.forEach(idx => {
            color[idx] = 0;
        });
        Kieta = 1; // 消えたフラグを立てる
    }
}

function fall() {
    // 何回か繰り返して一番下まで落とす
    for (let loop = 0; loop < 12; loop++) {
        for (let i = 72 - 7; i >= 0; i--) {
            if (color[i] !== 0 && color[i + 6] === 0) {
                color[i + 6] = color[i];
                color[i] = 0;
            }
        }
    }
}

// 最初の描画
paintColor();

function slide(direction) {
    putPlace = putPlace + direction;
    if (putPlace === 0) {
        putPlace = 1;
    }
    if (putPlace === 7) {
        putPlace = 6;
    }
    if (Dir2 == 1 && putPlace === 6) {
        putPlace = 5;
    }
    if (Dir2 == -1 && putPlace === 1) {
        putPlace = 2;
    }
    paintColor();
}

function Rorate(LR) {
    Dir2 = RorateList[(RorateList.indexOf(Dir2) + LR + 4) % 4];


    if (Dir2 == -1 && putPlace == 1) {
        putPlace++;
    }
    if (Dir2 == 1 && putPlace == 6) {
        putPlace--;
    }
    paintColor();
}


function drop(place, place2) {
    canCtr = 0;

    color[place] = randomPuyo;
    color[place2] = random2;
    randomPuyo = nextPuyo[1];
    random2 = nextPuyo[0];
    nextPuyo[1] = nextPuyo[3];
    nextPuyo[0] = nextPuyo[2];
    nextPuyo[2] = Math.floor(Math.random() * 4) + 1;
    nextPuyo[3] = Math.floor(Math.random() * 4) + 1;

    Dir2 = -6;
    processGame(); // 落下と連鎖の処理を開始
}


document.addEventListener('keydown', event => {
    if (canCtr === 1) {
        if (event.code === 'ArrowRight') {
            slide(1);
        }
        if (event.code === 'ArrowLeft') {
            slide(-1);
        }
        if (event.code === 'ArrowDown') {
            paintColor();
            drop(putFinal, putF2);
        }
        if (event.code === 'KeyZ') {
            Rorate(-1)
        }
        if (event.code === 'KeyX') {
            Rorate(1)
        }
    }
});

if (canCtr === 1) {
    leftButton.addEventListener('click', () => {
        Rorate(-1);
    });
    rightButton.addEventListener('click', () => {
        Rorate(1);
    });
    dropButton.addEventListener('click', () => {
        paintColor();
        drop(putFinal, putF2);
    });
}


setInterval(() => {
    scoreBord.textContent = `${rensa}れんさ！`;
}, 20);

