import path from 'path';

export const recursiveTestTitle = (ctx, tail = '') => {
    if (ctx) {
        return recursiveTestTitle(ctx.parent, ctx.title + ' ' + tail);
    }
    return tail;
};

export const outputFilePath = (ctx) => {

    if (ctx.test) {
        return path.join(__dirname, `${recursiveTestTitle(ctx.test).replace(/[^a-z]+/ig, '_')}.pdf`);
    }

    return path.join(__dirname, `${recursiveTestTitle(ctx).replace(/[^a-z]+/ig, '_')}.pdf`);

};
