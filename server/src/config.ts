export const config = {
    nodeEnv: (process.env.NODE_ENV || 'development') as NodeEnv,
    colorize: (process.env.NO_CONSOLE_COLORS || '0') == '0',
    httpPort: (process.env.CODENAMES_HTTP_PORT || '8095')
};


export type NodeEnv = 'production' | 'development'
