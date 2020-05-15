export const config = {
    colorize: (process.env.NO_CONSOLE_COLORS || '0') == '0',
    httpPort: (process.env.CODENAMES_HTTP_PORT || 8095)
};
