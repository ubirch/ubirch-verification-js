import { UbirchBlockchainSettings, UbirchIcons, UbirchSettings } from "./settings";
import * as DefaultBlockchainSettings from '../blockchain-assets/blockchain-settings.json';

global.fetch = jest.fn();

const mockSettings: UbirchBlockchainSettings = {
    assetPath: 'testPath',
    blockchainSettings: {},
    ubirchIcons: {} as UbirchIcons
}

describe('UbirchSettings', () => {

    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear().mockReset();
    });

    test('should create', () => {
        const us = new UbirchSettings();
        expect(us).toBeTruthy();
    });

    describe('loadSettings()', () => {

        test('should use local file by default', (done) => {
            const us = new UbirchSettings();
            us.settings.subscribe(s => {
                expect(s).toMatchObject({});
                done();
            })
        });

        test('should use remote file with url provided', (done) => {
            (global.fetch as jest.Mock)
                .mockResolvedValue({
                    status: 200,
                    json: () => mockSettings,
                });

            const us = new UbirchSettings('https://customUrl.com');
            us.settings.subscribe(s => {
                expect(s).toMatchObject(mockSettings);
                done();
            })
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        test('should return default config when failed to fetch', (done) => {
            (global.fetch as jest.Mock)
                .mockResolvedValue({
                    status: 500,
                    json: () => mockSettings,
                });

            const us = new UbirchSettings('https://customUrl.com');
            us.settings.subscribe(s => {
                expect(s).toMatchObject(DefaultBlockchainSettings);
                done();
            })
            expect(fetch).toHaveBeenCalledTimes(1);
        });

    });

});