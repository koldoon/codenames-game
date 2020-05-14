export enum ErrorCode {
    GameIsFinished,
    UncoverNotAllowed,
    WrongSpymasterHint,
    GameNotFound,
    AgentNotFound,
    DictionaryNotFound
}

/**
 * Human readable errors for ErrorCode-s. If message is not defined,
 * enum-s property name will be used.
 *
 * @see createGameError 'createGameError' function for details
 */
export const ErrorMessage = {
    [ErrorCode.UncoverNotAllowed]: 'Agent is already uncovered or game or move is finished or not yet inited',
    [ErrorCode.GameIsFinished]: 'Game is finished',
    [ErrorCode.GameNotFound]: 'Game not found',
    [ErrorCode.AgentNotFound]: 'Agent not found',
    [ErrorCode.DictionaryNotFound]: 'Dictionary not found'
};
