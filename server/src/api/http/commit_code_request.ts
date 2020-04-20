export interface CommitCodeRequest {
    // must contain word and a number separated with space or comma:
    // "spaceship 3"
    message: string;
}
