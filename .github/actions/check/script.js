module.exports = async ({github, context, core, exec}) => {
    try {
        const isBug = false;
        if (isBug) {
            throw new Error("Bug")
        }
    }
    catch(e) {
        core.setFailed(e);
    }
}