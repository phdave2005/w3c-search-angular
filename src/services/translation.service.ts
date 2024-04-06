import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TEXT_MAP } from '../components/settings/settings.constant';

@Injectable({providedIn: 'root'})

export class TranslationService {

    public translatedAbout = new BehaviorSubject<any>(TEXT_MAP[window.localStorage.getItem("languageCode") || 'en'].about.dvp);
    //public currentAbout: Observable<string>;
    constructor() {
        //this.translatedAbout = this.translatedAbout.asObservable();
    }

    public setAbout(str: string): void {
        this.translatedAbout.next(str);
        this.translatedAbout.next(str);
        debugger;
    }

    public getAbout(): Observable<any> {
        return this.translatedAbout.asObservable();
    }
}
