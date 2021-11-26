import { ReplaySubject } from 'rxjs';
import * as DefaultBlockchainSettings from '../blockchain-assets/blockchain-settings.json';

export interface UbirchBlockchainSettings {
    ubirchIcons: UbirchIcons;
    assetPath: string;
    blockchainSettings: BlockchainSettings;
}

export interface UbirchIcons {
    seal: string;
    no_seal: string;
    seal_error: string;
}

export interface BlockchainSettings {
    [key: string]: BlockchainSetting;
}

export interface BlockchainSetting {
    nodeIcon: string;
    explorerUrl: ExplorerUrl;
}

export interface ExplorerUrl {
    mainnet?: Net;
    testnet?: Net;
    bdr?: Net;
}

export interface Net {
    url: string;
}

export class UbirchSettings {
    private _settings = new ReplaySubject<UbirchBlockchainSettings>(1);
    settings = this._settings.asObservable();

    constructor(externalSettingsUrl?: string) {
        this.loadSettings(externalSettingsUrl);
    }

    async loadSettings(url?: string) {
        try {
            if (!url) { throw new Error('Settings url missing'); }
            const resp = await fetch(url);

            if (resp.status !== 200) { throw new Error('Config file failed to load'); }
            const settings = await resp.json();
            this._settings.next(settings);
        } catch (err) {
            this._settings.next(DefaultBlockchainSettings);
        }
    }
}
