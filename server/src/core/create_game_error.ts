import { ErrorCode, ErrorMessage } from '../api/api_error';

/**
 * Helper function to prevent messages and errors codes mismatching mistakes
 * when copy/paste like this:
 * <pre>
 *   assert.value(move, ErrorCode.GameIsFinished, ErrorMessage[ErrorCode.UncoverNotAllowed]);
 * </pre>
 *
 * @param {ErrorCode} code
 * @returns {[number, string]}
 */
export function createGameError(code: ErrorCode): [number, string] {
    return [code, ErrorMessage[code] || ErrorCode[code]]
}
