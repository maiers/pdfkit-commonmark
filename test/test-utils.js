import path from 'path';

export const recursiveTestTitle = (ctx, tail = '') => {
    if (ctx) {
        return recursiveTestTitle(ctx.parent, ctx.title + ' ' + tail);
    }
    return tail;
};

export const outputFilePath =
    (ctx) => path.join(__dirname, `${recursiveTestTitle(ctx.test || ctx.suite).replace(/[^a-z]+/ig, '_')}.pdf`);
