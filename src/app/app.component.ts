import { Component } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import TRANSLATION_MAP from './app.constant';
import { TranslationService } from '../services/translation.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	providers: [TranslationService],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent {
	private destroy$ = new Subject<void>();
	public title = 'w3c-search-angular';
	public currentYear = new Date().getFullYear();
	public toggleHomeSettingsClass: string = 'fa-gear';
	public toggleHomeSettingsHref: string = '/w3c-search-angular/settings';
	public about: string = '';

	constructor(private router: Router, private translationService: TranslationService)  {
		this.router.events
		.pipe(takeUntil(this.destroy$))
		.subscribe((e) => {
			if (e instanceof NavigationStart) {
				if (e.url.match(/(about|help|settings)(\/?)$/i)) {
					this.toggleHomeSettingsClass = 'action fa-solid fa-house';
					this.toggleHomeSettingsHref = '/w3c-search-angular';
				} else {
					this.toggleHomeSettingsClass = 'action fas fa-gear';
					this.toggleHomeSettingsHref = '/w3c-search-angular/settings';
				}
			}
		});
		//const languageCode = window.localStorage.getItem("languageCode") || 'en';
		//this.about = TRANSLATION_MAP[languageCode].about;
		translationService.getAbout().subscribe((str: string) => {
			if (!!str) {
				this.about = str;
			}
		});
	}

	/*ngOnInit(): void {
		this.translationService.getAbout().subscribe((str: string) => {debugger;
			this.about = str;debugger;
		});
	}*/

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
