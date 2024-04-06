import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LANGUAGES, TEXT_MAP } from './settings.constant';
import { TranslationService } from '../../services/translation.service';

@Component({
	standalone: true,
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.scss',
	imports: [ReactiveFormsModule],
	providers: [TranslationService]
})

export class SettingsComponent implements OnInit {
	@Output() aboutEmit = new EventEmitter<string>();
	public languageCode: string = 'en';
	public textUsed: any;
	public languages: Array<any> = [];
	public noStorage: boolean = false;
	public isStorageEvent: boolean = false;
	public storageEventText: string = '-';
	public storageEventClass: string = 'invalid';
	public settingsFormGroup: FormGroup;
	public formInitiated: boolean = false;

	constructor(private fb: FormBuilder, private translationService: TranslationService) {
		this.languageCode = window.localStorage.getItem("languageCode") || 'en';
		this.settingsFormGroup = new FormGroup({
			username: new FormControl(window.localStorage?.getItem("username") || null),
			publicKey: new FormControl(window.localStorage?.getItem("publicKey") || null),
			languageCode: new FormControl(this.languageCode || null),
			searchLimit: new FormControl(window.localStorage?.getItem("searchLimit") || null, [Validators.min(Number.MIN_VALUE)]),
			download: new FormControl(window.localStorage?.getItem("download") || null)
		});
		this.formInitiated = true;
    }

    ngOnInit(): void {
        this.noStorage = !this.detectLocalStorage();
		this.textUsed = TEXT_MAP[this.languageCode];
		this.languages = LANGUAGES[this.languageCode];
    }

    private detectLocalStorage(): boolean {
        if ('hasStorageAccess' in document) {
            return true;
        } else {
            return this.detectLocalStorageLegacy();
        }
    }

    private detectLocalStorageLegacy(): boolean {
        try {
            let value = '1',
                testkey = 'aaa',
                storage = window.localStorage;
            storage.setItem(testkey, value);
            storage.removeItem(testkey);
            return true;
        } catch (e) {
            return false;
        }
    }

	public submit(e: Event): void {
		if (this.settingsFormGroup.valid) {
			this.updateLocalStorage(this.settingsFormGroup.value);
		}
	}

    private updateLocalStorage(elements: any): void {
        const storage = window.localStorage;
        const storageJSONInitial = JSON.stringify(storage);
        let i, val, storageJSONFinal;
        for(i in elements) {
            if (!!elements[i]) {
                val = elements[i];
                if (typeof val === 'boolean') {
                	val = !!val ? 1 : 0;
               	}
                storage.setItem(i, val);
                if (i === 'languageCode') {
                    this.languageCode = val;
					this.languages = LANGUAGES[this.languageCode];
                    this.translationService.setAbout(TEXT_MAP[this.languageCode].about.dvp);
                }
            }
        }
        storageJSONFinal = JSON.stringify(localStorage);
		this.isStorageEvent = true;
		this.textUsed = TEXT_MAP[this.languageCode];
		if (storageJSONInitial !== storageJSONFinal) {
			this.storageEventText = this.textUsed.storageEvent.success;
			this.storageEventClass = 'valid';
		} else {
			this.storageEventText = this.textUsed.storageEvent.fail;
			this.storageEventClass = 'invalid';
		}
        setTimeout(() => {
			this.isStorageEvent = false;
			this.storageEventText = '-';
        }, 5000);
    }

    public handleNumberChange(e: KeyboardEvent): void {
        if (!e.key.match(/^\d$/)) {
            e.preventDefault();
        }
    }
}
