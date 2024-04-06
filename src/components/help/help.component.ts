import { Component, OnInit } from '@angular/core';
import { TRANSLATION_MAP } from './help.constant';

@Component({
	selector: 'help',
	templateUrl: './help.component.html',
	styleUrl: './help.component.scss'
})
export class HelpComponent implements OnInit {
	public heading: string = 'Help Topics';
	public subheading: string = 'Usage Tips';
	public content: Array<any> = [];
	private languageCode: string = 'en';

	constructor() {
		this.languageCode = window?.localStorage?.getItem("languageCode") || 'en';
	}

	ngOnInit(): void {
		const textUsed = TRANSLATION_MAP[this.languageCode];
		this.heading = textUsed.heading;
		this.subheading = textUsed.subheading;
		this.content = textUsed.content;
	}
}
