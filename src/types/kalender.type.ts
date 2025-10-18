import { SvelteDate } from "svelte/reactivity";
import { PflegegeldAnspruchart } from "./pflege.enums";
import type { Zeitraum } from "./zeitraum.type";

export type Kalender = {
    kalenderEintraege: Kalendereintrag[];
}

export type Kalendereintrag = {
    datum: SvelteDate;
    anspruch: PflegegeldAnspruchart;
}

export function fuelleKalender(
		zeitraum: Zeitraum,
		erstattungszeitraum: number
	) {
        console.log('Zeitraum: ', zeitraum)

		let kalender: Kalender = {
			kalenderEintraege: []
		};

        kalender.kalenderEintraege.push({
            datum: zeitraum.beginn,
            anspruch: PflegegeldAnspruchart.VOLL_AUFNAHMETAG
        })

        kalender.kalenderEintraege.push({
            datum: addDays(zeitraum.beginn, erstattungszeitraum -1),
            anspruch: PflegegeldAnspruchart.VOLL_ENTLASSTAG
        })

		for (let i = 1; i <= erstattungszeitraum - 2; i++) {
            kalender.kalenderEintraege.push({
                datum: addDays(zeitraum.beginn, i),
                anspruch: PflegegeldAnspruchart.HALBER_ANSPRUCH_WEGEN_KZP_VHP
            })
		}

        for (let i = erstattungszeitraum; i <= zeitraum.tage; i++) {
            kalender.kalenderEintraege.push({
                datum: addDays(zeitraum.beginn, i),
                anspruch: PflegegeldAnspruchart.VOLLER_ANSPRUCH
            })
        }

		return kalender;
		}

export function getMonatAusKalender (monat: number, kalender: Kalender): Kalender {
    let filteredKalender: Kalender = {
        kalenderEintraege: []
    };

    kalender.kalenderEintraege.forEach(eintrag => {
        if (eintrag.datum.getMonth() === monat) {
            filteredKalender.kalenderEintraege.push(eintrag);
        }
    });

    return filteredKalender;

}


export function addDays(date: SvelteDate, days: number): SvelteDate {
		const newDate = new Date(date.getTime());
		newDate.setDate(newDate.getDate() + days);
		return new SvelteDate(newDate);
	}