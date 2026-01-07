export async function devDelay(ms = 1000) {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    await new Promise(resolve => {
        setTimeout(resolve, Math.min(ms, 1500));
    });
}
