export default () => ({
    port: parseInt(process.env.APP_PORT, 10) || 3000,
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
});
