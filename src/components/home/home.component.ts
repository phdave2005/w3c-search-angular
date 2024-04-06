import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import axios from 'axios';
import { TRANSLATION_MAP } from './home.constant';

@Component({
    standalone: true,
	selector: 'home',
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
    imports: [
        ReactiveFormsModule
    ]
})
export class HomeComponent implements OnInit {
	public heading: string = '';
	public buttonText: string = '';
	public processingText: string = '';
	public results: string = '';
	public processing: boolean = false;
	public validationError: boolean = false;
	public validationErrorText: string = ' ';
	public recentResponse: any;
    public formInitiated: boolean = false;
	public homeFormGroup: FormGroup;
	private languageCode: string = 'en';
	public textUsed: any;
    public substringViolation: boolean = false;
	private apiPath: string = 'https://cssburner.com/requests/ajax/ajax.php';
	private corsDomain: string = 'https://corsproxy.io';

	constructor(private fb: FormBuilder) {
		this.homeFormGroup = new FormGroup({
			searchcontains: new FormControl(null, [Validators.required]),
			searchlacks: new FormControl(null)
		});
        this.formInitiated = true;
        this.languageCode = localStorage?.getItem("languageCode") || 'en';
        this.textUsed = TRANSLATION_MAP[this.languageCode];
        const textUsed = this.textUsed;
        this.heading = textUsed.heading.searchResults;
        this.buttonText = textUsed.button.text;
        this.processingText = '';
	}

	ngOnInit(): void {
        // 
	}

	public search(e: Event): void {
        e.preventDefault();
        if (!this.processing) {
            if (this.homeFormGroup.valid) {
                this.substringViolation = this.homeFormGroup.value.searchcontains.indexOf(this.homeFormGroup.value.searchlacks) !== -1;
                if (!this.substringViolation) {
                    this.processFormSubmission(this.homeFormGroup.value);
                }
            }
        }
    }

    public isSubstring() {console.log(this.homeFormGroup);
        return true;
    }

	public processFormSubmission(elements: any): void {
        let i,
            val,
            el,
            ID,
            type,
            category,
            filterData,
            searchData: any = {
                payload: {},
                filters: {}
            };
        for(i in elements) {
            if (!!elements[i]) {
                val = elements[i]?.trim();
                if (val) {
                    el = document.getElementById(i) as HTMLInputElement;
                    if (!!el?.type) {
                        ID = el.id;
                        category = el.getAttribute("data-search-category");
                        if (!!category) {
                            filterData = el.getAttribute("data-filter") || null;
                            type = el.type;
                            if (type === 'checkbox') {
                                if (el.checked) {
                                    val = 1;
                                } else {
                                    continue;
                                }
                            }
                            searchData[category][ID] = {
                                filter: filterData,
                                nodeName: el.nodeName,
                                type: type,
                                value: val
                            };
                        }
                    }
                }
            }
        }
        if (Object.keys(searchData.payload).length) {
			this.validationError = false;
			this.processing = true;
            this.fetchData(searchData);
        } else {
			this.validationError = true;
			this.validationErrorText = this.textUsed.validation.error.oneParameter;
			this.processing = false;
        }
    }

	private constructQueryString(data: any): string {
        let i, field, value, parameter, queryStringArray = [];
        const paramMap: any = {
            searchcontains: 'value',
            searchlacks: 'notvalue'
        };
        for(i in data) {
            if (!!data[i]?.value) {
                value = data[i].value;
                field = document.getElementById(i);
                if (!!field && !!value) {
                    parameter = paramMap[i] + '=' + data[i].value;
                    queryStringArray.push(parameter);
                }
            }
        }
        queryStringArray.push('username=' + window.localStorage?.getItem("username"));
        queryStringArray.push('publickey=' + window.localStorage?.getItem("publicKey"));
        return queryStringArray.join('&');
    }

    private isLocalhost(): boolean {
        return document.URL.indexOf("localhost") !== -1;
    }

    private getQueryLimitParameter(): string {
        const searchLimit = window?.localStorage?.getItem("searchLimit") || 0;
        return (!!searchLimit && Number(searchLimit) > 0) ? '&limit=' + searchLimit : '';
    }

	private fetchData(searchData: any): void {
        const payload = searchData.payload;
        const filters = searchData.filters;
        if (!window.navigator.onLine && this.isLocalhost()) {
            setTimeout(() => {
                import(`../../constants/mock-response.constant`)
                .then((response) => {
                    const mockResponseData = response.MOCK_RESPONSE;
                    this.processResponse(mockResponseData, filters);
                });
            }, 5000);
        } else {
            if (!window.localStorage?.getItem("username")?.length || !window.localStorage?.getItem("publicKey")?.length) {
				this.validationError = true;
				this.validationErrorText = this.textUsed.validation.error.missingAuth;
				this.processing = false;
            } else {
                const searchUrl = this.apiPath + '?type=getGlossaryTerms&scope=api&searchType=topic&' + this.constructQueryString(payload) + this.getQueryLimitParameter();
                axios.get(
                    this.corsDomain + '/?' + encodeURIComponent(searchUrl)
                )
                .then((response: any) => {
                    if (response?.data?.terms?.length) {
                        this.processResponse(response.data, filters);
                    } else {
						this.validationError = true;
						this.validationErrorText = this.textUsed.validation.error.noData;
						this.processing = false;
                    }
                })
                .catch((error: Error) => {
					this.validationError = true;
					this.validationErrorText = this.textUsed.validation.error.api;
					this.processing = false;
                });
            }
        }
    }

	private processResponse(data: any, filters?: any): void {
		this.recentResponse = data;
        if (window.localStorage?.getItem("download") === '1') {
            this.downloadData(data);
        } else {
            this.renderWithTimeout(data);
        }
    }

	public reset(): void {
		this.completeProcessing();
		this.results = '';
	}

	private downloadData(data: any): void {
        const date = new Date();
        const str = JSON.stringify(data, undefined, 2);
        const blob = new Blob([str], {
            type: "application/json"
        });
        const downloadLink = document.getElementById("download") as any;
        downloadLink.setAttribute("href", URL.createObjectURL(blob));
        downloadLink.setAttribute("download", "data_" + date.toISOString().split("T")[0] + "-" + date.getTime() + ".json");
        downloadLink.click();
        this.renderWithTimeout(data);
    }

    public downloadResponse(): void {
        this.downloadData(this.recentResponse);
    }

    private renderWithTimeout(data: any): void {
        setTimeout(() => {
			this.processing = false;
            this.results = JSON.stringify(data, null, 4);
            setTimeout(() => {
                this.completeProcessing();
            }, 6000);
        }, 250);
    }

	public copyResponse(): void {
        const el = document.querySelectorAll(".results-container")[0] as HTMLElement;
        if (!!el && 'clipboard' in navigator && document.createRange) {
            const textToCopy = el.innerText;
            navigator.clipboard.writeText(textToCopy)
            .then(function() {
                let range = document.createRange(),
					selection: any;
                range.selectNodeContents(el);
                selection = 'getSelection' in window ? window.getSelection() : textToCopy.substring(0, textToCopy.length);
                selection.removeAllRanges();
                selection.addRange(range);
                return range;
            })
            .catch(function(error) {});
        } else {
			const body = document.body as any;
            if (body?.createControlRange) {
                let content = el.innerText,
                    controlRange,
                    range = body?.createTextRange();
                range.moveToElementText(content);
                range.select();

                controlRange = body?.createControlRange();
                controlRange.addElement(content);
                controlRange.execCommand('Copy');
            }
        }
    }

	private completeProcessing(): void {
		this.validationError = false;
		this.validationErrorText = '';
		this.processing = false;
    }
}
