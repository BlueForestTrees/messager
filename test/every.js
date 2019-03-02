export default async (delay, work) => {
    let stop = false
    const call = async () => {
        await work()
        if (!stop) {
            setTimeout(call, delay)
        } else {
            console.log("stop every.")
        }
    }
    await call()
    return () => stop = false
}