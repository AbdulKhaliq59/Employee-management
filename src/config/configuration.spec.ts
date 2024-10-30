import config from './configuration';

describe('Configuration Module', () => {
    beforeAll(() => {
        process.env.APP_PORT = '4000';
        process.env.DB_HOST = 'test_host';
        process.env.DB_PORT = '5433';
        process.env.DB_USERNAME = 'test_user';
        process.env.DB_PASSWORD = 'test_password';
        process.env.DB_DATABASE = 'test_database';
        process.env.JWT_SECRET = 'test_jwt_secret';
        process.env.EMAIL_HOST = 'test_email_host';
        process.env.EMAIL_PORT = '2526';
        process.env.EMAIL_USER = 'test_email_user';
        process.env.EMAIL_PASSWORD = 'test_email_password';
        process.env.OPENAI_API_KEY = 'test_openai_key';
    });

    it('should load the correct configuration from environment variables', () => {
        const configValues = config();

        expect(configValues.port).toBe(4000);
        expect(configValues.database.host).toBe('test_host');
        expect(configValues.database.port).toBe(5433);
        expect(configValues.database.username).toBe('test_user');
        expect(configValues.database.password).toBe('test_password');
        expect(configValues.database.database).toBe('test_database');
        expect(configValues.jwt.secret).toBe('test_jwt_secret');
        expect(configValues.email.host).toBe('test_email_host');
        expect(configValues.email.port).toBe(2526);
        expect(configValues.email.user).toBe('test_email_user');
        expect(configValues.email.password).toBe('test_email_password');
        expect(configValues.openai.apiKey).toBe('test_openai_key');
    });
});
