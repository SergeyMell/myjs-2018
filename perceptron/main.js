function loadImage(src) {
    const img = new Image();
    img.src = src;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return new Promise(function (resolve, reject) {
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, 28, 28)
                .data
                .filter((el, index) => (index - 3) % 4 === 0)
                .map(el => el > 0 ? 1 : 0);
            resolve(Array.from(imageData));
        }
    });
}

function makeNoize(array) {
    const copy = array.slice();
    for (let i = 0; i < 500; i++) {
        const rnd = Math.floor(Math.random() * array.length);
        copy[rnd] = copy[rnd] === 1 ? 0 : 1;
    }
    return copy;
}

const model = tf.sequential();

const loader = [];
for (let i = 0; i < 10; i++) {
    loader.push(loadImage(`numbers/${i}.png`));
}
Promise.all(loader)
    .then(res => {
        model.add(tf.layers.dense({units: 10, inputShape: [784]}));
        model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

        const xsData = [];
        const ysData = [];
        for (let index = 0; index < 10; index++) {
            for (var i = 0; i < 6000; i++) {
                xsData.push(makeNoize(res[index]));
                const arr = Array(10).fill(0);
                arr[index] = 1;
                ysData.push(arr);
            }
        }

        const xs = tf.tensor(xsData, [60000, 784]);
        const ys = tf.tensor(ysData, [60000, 10]);

        model.fit(xs, ys).then((_res) => {
            model.predict(tf.tensor2d(res[0], [1, 784])).print();
            model.predict(tf.tensor2d(res[1], [1, 784])).print();
            model.predict(tf.tensor2d(res[2], [1, 784])).print();
            model.predict(tf.tensor2d(res[3], [1, 784])).print();
        });

    });