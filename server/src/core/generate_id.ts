export module generate_id {
    const ALPHABET = '023456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ';

    /**
     * Simple short Id generator (not crypto safe) enough to
     * be an Id got the game in the url string.
     */
    export function generateId(idLength = 8) {
        const chars = [];
        for (let i = 0; i < idLength; i++) {
            chars.push(ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)));
        }
        return chars.join('');
    }
}
