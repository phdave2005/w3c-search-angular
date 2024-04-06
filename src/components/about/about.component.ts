import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TRANSLATION_MAP } from './about.constant';

@Component({
	selector: 'about',
	templateUrl: './about.component.html',
	styleUrl: './about.component.scss'
})
export class AboutComponent {
	public heading: string = 'About';
	public content: string = '';
	public imageUrl: string = '';
	private languageCode: string;
	private sanitizer: any;

	constructor(sanitizer: DomSanitizer) {
		this.languageCode = window?.localStorage?.getItem("languageCode") || 'en';
		this.sanitizer = sanitizer;
	}

	ngOnInit(): void {
		const textUsed = TRANSLATION_MAP[this.languageCode];
		this.heading = textUsed.heading;
		this.content = textUsed.content;
		const imgUrl = '/assets/images/dvp_photo.jpg';
		this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(imgUrl);
	}
}
